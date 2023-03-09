import {afterPatch, RoutePatch, ServerAPI, wrapReactType} from "decky-frontend-lib";
import {ReactElement} from "react";
import {AppOverview} from "./app/model";
import {Mountable} from "./app/system";
import {Storage} from "./app/Storage";

export function updatePlaytimes(storage: Storage)
{
	console.log("updatePlaytimes");
	storage.getOverallTimes().then(response =>
	{
		if (response.success)
		{
			Object.entries(response.result).forEach(([gameId, time]) =>
			{
				let overview = appStore.GetAppOverviewByAppID(+gameId)
				if (overview)
				{
					overview.minutes_playtime_forever = (time / 60.0).toFixed(1);
					console.log(gameId, overview.minutes_playtime_forever)
				}
			})
		}
	})
}

export function updatePlaytime(storage: Storage, appId: number)
{
	console.log(`updatePlaytime: ${appId}`);
	storage.getOverallTimes().then(response =>
	{
		if (response.success)
        {

	        let overview = appStore.GetAppOverviewByAppID(appId)
	        if (overview)
	        {
		        overview.minutes_playtime_forever = (response.result[`${appId}`] / 60.0).toFixed(1);
		        console.log(appId, overview.minutes_playtime_forever)
	        }
        }
	})
}

function routePatch(serverAPI: ServerAPI, path: string, patch: RoutePatch): Mountable
{
	return {
		mount()
		{
			serverAPI.routerHook.addPatch(path, patch)
		},
		unMount()
		{
			serverAPI.routerHook.removePatch(path, patch)
		}
	}
}

export function patchAppPage(serverAPI: ServerAPI, storage: Storage): Mountable
{
	return routePatch(serverAPI, "/library/app/:appid", (props: { path: string, children: ReactElement}) =>
	{
		afterPatch(
				props.children.props,
				"renderFunc",
				(_, ret1) =>
				{
					const overview: AppOverview = ret1.props.children.props.overview;
					const app_id: number = overview.appid;
					console.log("ret1", ret1)
					if (overview.app_type==1073741824)
					{
						updatePlaytime(storage, app_id)
					}
					return ret1;
				}
		)
		return props;
	});
}

export function patchHomePage(serverAPI: ServerAPI, storage: Storage): Mountable
{
	return routePatch(serverAPI, "/library/home", (props: { path: string, children: ReactElement}) =>
	{
		wrapReactType(props.children.type);
		afterPatch(
				props.children,
				"type",
				(_, ret1) =>
				{
					updatePlaytimes(storage)
					return ret1;
				}
		)
		return props;
	});
}

export function patchLibraryPage(serverAPI: ServerAPI, storage: Storage): Mountable
{
	return routePatch(serverAPI, "/library", (props: { path: string, children: ReactElement }) =>
	{

		wrapReactType(props.children.type);
		afterPatch(
				props.children,
				"type",
				(_, ret1) =>
				{
					updatePlaytimes(storage)
					return ret1;
				}
		)
		return props;
	});
}