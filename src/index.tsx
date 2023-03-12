import {
	ButtonItem,
	definePlugin, PanelSection, PanelSectionRow, Router,
	ServerAPI,
	staticClasses,
	SteamClient
} from "decky-frontend-lib";
import { FaClock } from "react-icons/fa";
import { EventBus, Mountable, systemClock } from "./app/system";
import { Storage } from "./app/Storage"
import { SteamEventMiddleware } from "./app/middleware";
import { SessionPlayTime } from "./app/SessionPlayTime";
import { patchAppPage, patchHomePage, patchLibraryPage } from "./RoutePatches";
import { AppStore } from "./app/model";
import { DetailedPage } from "./DetailedPage";
import { Settings } from "./app/settings";
import { Content } from "./App";
import { SettingsPage } from "./SettingsPage";
import { navigateToPage, DETAILED_REPORT_ROUTE, SETTINGS_ROUTE } from "./navigation";

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
	let settings = new Settings()

	mounts.push(new SteamEventMiddleware(eventBus, clock, Router))
	mounts.push({
		mount() {
			serverApi.routerHook.addRoute(DETAILED_REPORT_ROUTE, () => <DetailedPage storage={storage} settings={settings} />)
		},
		unMount() {
			serverApi.routerHook.removeRoute(DETAILED_REPORT_ROUTE)
		}
	})
	mounts.push({
		mount() {
			serverApi.routerHook.addRoute(SETTINGS_ROUTE, () =>
				<SettingsPage settings={settings} />
			)
		},
		unMount() {
			serverApi.routerHook.removeRoute(SETTINGS_ROUTE)
		}
	})
	mounts.push(patchAppPage(serverApi, storage))
	mounts.push(patchHomePage(serverApi, storage))
	mounts.push(patchLibraryPage(serverApi, storage))
	mounts.forEach((it) => { it.mount() })

	return {
		title: <div className={staticClasses.Title}>PlayTime</div>,
		content:
			<div>
				<Content storage={storage} sessionPlayTime={sessionPlayTime} settings={settings} />

				<PanelSection title="Misc">
					<PanelSectionRow>
						<ButtonItem layout="below" onClick={() => navigateToPage(DETAILED_REPORT_ROUTE)}>
							Detailed report
						</ButtonItem>
					</PanelSectionRow>
					<PanelSectionRow>
						<ButtonItem layout="below" onClick={() => navigateToPage(SETTINGS_ROUTE)}>
							Open settings
						</ButtonItem>
					</PanelSectionRow>
				</PanelSection>
			</div>,
		icon: <FaClock />,
		onDismount() {
			mounts.forEach((it) => { it.unMount() })
		},
	};
});