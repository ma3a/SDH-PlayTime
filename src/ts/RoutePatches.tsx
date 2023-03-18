import { afterPatch, RoutePatch, ServerAPI, wrapReactType } from "decky-frontend-lib";
import { ReactElement } from "react";
import { AppDetails, AppOverview } from "./app/model";
import { Mountable } from "./app/system";
import { Storage } from "./app/Storage";
import { runInAction } from "mobx";

export function updatePlaytimes(storage: Storage) {
	storage.getOverallTimes().then(times => {
		Object.entries(times).forEach(([gameId, time]) => {
			let overview = appStore.GetAppOverviewByAppID(+gameId)
			if (overview) {
				overview.minutes_playtime_forever = (time / 60.0).toFixed(1);
			}
		});
	});
}

export function updatePlaytime(storage: Storage, appId: number) {
	storage.getOverallTimes().then(times => {
		let overview = appStore.GetAppOverviewByAppID(appId)
		if (overview) {
			overview.minutes_playtime_forever = (times[`${appId}`] / 60.0).toFixed(1);
		}
	});
}

function routePatch(serverAPI: ServerAPI, path: string, patch: RoutePatch): Mountable {
	return {
		mount() {
			serverAPI.routerHook.addPatch(path, patch)
		},
		unMount() {
			serverAPI.routerHook.removePatch(path, patch)
		}
	}
}

export function patchAppPage(serverAPI: ServerAPI, storage: Storage): Mountable {
	return routePatch(serverAPI, "/library/app/:appid", (props: { path: string, children: ReactElement }) => {
		afterPatch(
			props.children.props,
			"renderFunc",
			(_, ret1) => {
				const overview: AppOverview = ret1.props.children.props.overview;
				const details: AppDetails = ret1.props.children.props.details;
				const app_id: number = overview.appid;
				if (overview.app_type == 1073741824) {
					const times = storage.getOverallTimesCache()

					if (details && times) {
						runInAction(() => {
							details.nPlaytimeForever = +(times[`${app_id}`] / 60.0).toFixed(1);
						});
					}
				}
				return ret1;
			}
		)
		return props;
	});
}

export function patchHomePage(serverAPI: ServerAPI, storage: Storage): Mountable {
	return routePatch(serverAPI, "/library/home", (props: { path: string, children: ReactElement }) => {
		wrapReactType(props.children.type);
		afterPatch(
			props.children,
			"type",
			(_, ret1) => {
				updatePlaytimes(storage)
				return ret1;
			}
		)
		return props;
	});
}

export function patchLibraryPage(serverAPI: ServerAPI, storage: Storage): Mountable {
	return routePatch(serverAPI, "/library", (props: { path: string, children: ReactElement }) => {

		wrapReactType(props.children.type);
		afterPatch(
			props.children,
			"type",
			(_, ret1) => {
				updatePlaytimes(storage)
				return ret1;
			}
		)
		return props;
	});
}