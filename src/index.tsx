import {
	definePlugin, Router,
	ServerAPI,
	staticClasses,
	SteamClient,
} from "decky-frontend-lib";
import {Content} from './App'
import {FaClock} from "react-icons/fa";
import {EventBus, Mountable, systemClock} from "./app/system";
import {Storage} from "./app/Storage"
import {SteamEventMiddleware} from "./app/middleware";
import {SessionPlayTime} from "./app/SessionPlayTime";
import {patchAppPage, patchHomePage, patchLibraryPage} from "./RoutePatches";
import {AppStore} from "./app/model";

declare global
{
	// @ts-ignore
	let SteamClient: SteamClient;
	let appStore: AppStore;
}

// const AppDetailsSections = findModuleChild((m) =>
// {
// 	if (typeof m!=='object') return;
// 	for (const prop in m)
// 	{
// 		if (
// 				m[prop]?.toString &&
// 				m[prop].toString().includes("bShowGameInfo")
// 		) return m[prop];
// 	}
// 	return;
// });


export default definePlugin((serverApi: ServerAPI) =>
{
	let clock = systemClock
	let eventBus = new EventBus()

	let mounts: Array<Mountable> = []

	let storage = new Storage(eventBus, serverApi)
	let sessionPlayTime = new SessionPlayTime(eventBus)

	mounts.push(new SteamEventMiddleware(eventBus, clock, Router))
	mounts.push(patchAppPage(serverApi, storage))
	mounts.push(patchHomePage(serverApi, storage))
	mounts.push(patchLibraryPage(serverApi, storage))
	// let tabHook: Patch;
	// mounts.push({
	// 	mount()
	// 	{
	// 		tabHook = afterPatch(AppDetailsSections.prototype, 'render', (_: Record<string, unknown>[], ret1: any) =>
	// 		{
	// 			const element1 = findInReactTree(ret1.props.children, (x) => x?.props?.onTheaterMode);
	// 			wrapReactType(element1.type);
	// 			afterPatch(element1, "type", (_, ret2: any) =>
	// 			{
	// 				wrapReactType(ret2.type);
	// 				afterPatch(ret2, "type", (_, ret3: any) =>
	// 				{
	// 					const element2 = findInReactTree(ret3.props.children, (x) => x?.props?.fnOnCancelFromTabHeader);
	// 					wrapReactType(element2.type);
	// 					afterPatch(element2, "type", (_, ret4: any) =>
	// 					{
	// 						ret4.props.tabs.push({
	// 							id: "PlayTime",
	// 							title: "Play Time",
	// 							content: <Content storage={storage} sessionPlayTime={sessionPlayTime} />
	// 						})
	// 						return ret4;
	// 					});
	// 					return ret3;
	// 				})
	// 				return ret2;
	// 			})
	// 			return ret1;
	// 		});
	// 	},
	// 	unMount()
	// 	{
	// 		tabHook.unpatch()
	// 	}
	// })

	mounts.forEach((it) => { it.mount() })


	return {
        title: <div className={staticClasses.Title}>PlayTime</div>,
        content: <Content storage={storage} sessionPlayTime={sessionPlayTime} />,
        icon: <FaClock />,
        onDismount() {
            mounts.forEach((it) => { it.unMount() })
	        // sectionHook.unpatch()
        },
    };
});