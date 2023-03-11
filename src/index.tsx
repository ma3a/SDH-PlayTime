import {
	definePlugin, Router,
	ServerAPI,
	staticClasses,
	SteamClient,
} from "decky-frontend-lib";
import { Content } from './App'
import { FaClock } from "react-icons/fa";
import { EventBus, Mountable, systemClock } from "./app/system";
import { Storage } from "./app/Storage"
import { SteamEventMiddleware } from "./app/middleware";
import { SessionPlayTime } from "./app/SessionPlayTime";
import { patchAppPage, patchHomePage, patchLibraryPage } from "./RoutePatches";
import { AppStore } from "./app/model";
import { DetailedPage } from "./DetailedPage";

declare global {
	// @ts-ignore
	let SteamClient: SteamClient;
	let appStore: AppStore;
}

export default definePlugin((serverApi: ServerAPI) => {
	let clock = systemClock
	let eventBus = new EventBus()

	let mounts: Array<Mountable> = []

	let storage = new Storage(eventBus, serverApi)
	let sessionPlayTime = new SessionPlayTime(eventBus)

	mounts.push(new SteamEventMiddleware(eventBus, clock, Router))
	mounts.push({
		mount() {
			serverApi.routerHook.addRoute("/playtimes", () => <DetailedPage storage={storage} sessionPlayTime={sessionPlayTime} />)
		},
		unMount() {
			serverApi.routerHook.removeRoute("/playtimes")
		}
	})
	mounts.push(patchAppPage(serverApi, storage))
	mounts.push(patchHomePage(serverApi, storage))
	mounts.push(patchLibraryPage(serverApi, storage))
	mounts.forEach((it) => { it.mount() })


	return {
		title: <div className={staticClasses.Title}>PlayTime</div>,
		content: <Content storage={storage} sessionPlayTime={sessionPlayTime} />,
		icon: <FaClock />,
		onDismount() {
			mounts.forEach((it) => { it.unMount() })
		},
	};
});