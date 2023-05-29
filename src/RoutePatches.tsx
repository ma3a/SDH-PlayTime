import { debounce } from "lodash-es";
import { afterPatch, RoutePatch, ServerAPI, wrapReactType } from "decky-frontend-lib";
import { ReactElement } from "react";
import { AppDetails, AppOverview, OverallPlayTimes } from "./app/model";
import { Mountable } from "./app/system";
import { Storage } from "./app/Storage";
import { runInAction } from "mobx";
import logger from './utils'

//export const updatePlaytimesDelayedDebounced = debounce((storage: Storage, cached: boolean = false) => delay(() => updatePlaytimes(storage, cached), 50, storage), 1000, { leading: true, trailing: false });
export const updatePlaytimesDebounced = debounce((storage: Storage, cached: boolean = false) => updatePlaytimes(storage, cached), 1000, { leading: true, trailing: false });

export function updatePlaytimes(storage: Storage, cached: boolean = false) {
	let doUpdatePlayTimes = (times: OverallPlayTimes) => {
		logger.info("Setting ALL playtimes to app store overviews...");
		Object.entries(times).forEach(([gameId, time]) => {
			let overview = appStore.GetAppOverviewByGameID(gameId);
			if (overview?.app_type == 1073741824) {
				//logger.trace(`Setting playtime for ${overview.display_name} (${gameId}) to ${time}`);
				overview.minutes_playtime_forever = (time / 60.0).toFixed(1);
			}
		});
	};
	if (cached && storage.getOverallTimesCache()) {
		Promise.resolve(storage.getOverallTimesCache()).then(times => {
			doUpdatePlayTimes(times);
		});
	}
	else {
		storage.getOverallTimes().then(times => {
			doUpdatePlayTimes(times);
		});
	}
}

export function updatePlaytimesForAppIds(storage: Storage, appIds: Array<number>, cached: boolean = false) {
	if (!appIds) return;
	let doUpdatePlaytimesForAppIds = (times: OverallPlayTimes, appIds: Array<number>) => {
		logger.info("Setting APPID[] playtimes to app store overviews...");
		appIds.forEach((appId) => {
			let overview = appStore.GetAppOverviewByAppID(appId)
			let time = times[`${appId}`];
			if (time && overview?.app_type == 1073741824) {
				//logger.trace(`Setting playtime for ${overview.display_name} (${appId}) to ${time}`);
				overview.minutes_playtime_forever = (time / 60.0).toFixed(1);
			}
		});
	}
	if (cached && storage.getOverallTimesCache()) {
		Promise.resolve(storage.getOverallTimesCache()).then(times => {
			doUpdatePlaytimesForAppIds(times, appIds);
		});
	}
	else {
		storage.getOverallTimes().then(times => {
			doUpdatePlaytimesForAppIds(times, appIds);
		});
	}
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

				// just getting value - it fixes blinking issue
				details.nPlaytimeForever
				if (overview.app_type == 1073741824) {
					const times = storage.getOverallTimesCache()
					if (details && times) {
						runInAction(() => {
							details.nPlaytimeForever = +(times[`${app_id}`] / 60.0).toFixed(1);
						});
					}
				}
				// just getting value - it fixes blinking issue
				details.nPlaytimeForever
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
			(_: Record<string, unknown>[], ret1?: any) => {
				//console.info('ret1', ret1);
				//updatePlaytimes(storage, true);
				//ret1.key = Math.random();
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
				//console.info('ret1', ret1);
				//updatePlaytimes(storage, true);
				//ret1.key = Math.random();
				return ret1;
			}
		)
		return props;
	});
}
