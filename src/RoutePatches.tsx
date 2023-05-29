import { debounce } from "lodash-es";
import { afterPatch, RoutePatch, ServerAPI } from "decky-frontend-lib";
import { ReactElement } from "react";
import { AppDetails, AppOverview, OverallPlayTimes } from "./app/model";
import { Mountable } from "./app/system";
import { Storage } from "./app/Storage";
import { runInAction } from "mobx";
import logger from './utils'

//export const updatePlaytimesDebounced = debounce((storage: Storage, cached: boolean = false) => updatePlaytimes(storage, cached), 1000, { leading: true, trailing: false });

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

// not used, delete?
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
				const appId: number = overview.appid;

				if (overview.app_type == 1073741824) {
					const times = storage.getOverallTimesCache()
					let time = times ? times[`${appId}`] : null
					if (details && time) {
						//logger.info(`Setting playtime for ${details.strDisplayName} (${appId}) to ${time}`);
						debounce((details: AppDetails, time: number) => {
							details?.nPlaytimeForever; // just getting value - it fixes blinking issue ???
							runInAction(() => {
								details && (details.nPlaytimeForever = +(time / 60.0).toFixed(1));
							});
							details?.nPlaytimeForever; // just getting value - it fixes blinking issue ???
						}, 75, { leading: false, trailing: true })
							(details, time);
					};
				}
				return ret1;
			}
		)
		return props;
	});
}

