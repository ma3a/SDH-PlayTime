import {
	ButtonItem,
	definePlugin, PanelSection, PanelSectionRow,
	ServerAPI,
	staticClasses,
	SteamClient
} from "decky-frontend-lib";
import { FaClock } from "react-icons/fa";
import {EventBus, MountManager, systemClock} from "./app/system";
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
import { BreaksReminder } from "./app/notification";
import { humanReadableTime } from "./app/formatters";

declare global {
	// @ts-ignore
	let SteamClient: SteamClient;
	let appStore: AppStore;
}

export default definePlugin((serverApi: ServerAPI) => {
	let clock = systemClock
	let eventBus = new EventBus()

    let mountManager = new MountManager(eventBus, clock)

	let storage = new Storage(eventBus, serverApi)
	let sessionPlayTime = new SessionPlayTime(eventBus)
	let settings = new Settings()

	mountManager.addMount(new BreaksReminder(eventBus, settings, sessionPlayTime))
	eventBus.addSubscriber((event) => {
		switch (event.type) {
			case "NotifyToTakeBreak":
				serverApi.toaster.toast({
					body:
						<div>
							You already playing for {humanReadableTime(event.playTimeSeconds)},
						</div>,
					title: "PlayTime: remember to take a breaks",
					icon: <FaClock />,
					duration: 10 * 1000,
					critical: true
				})
				break;
		}
	})
	mountManager.addMount(new SteamEventMiddleware(eventBus, clock))
	mountManager.addMount({
		mount() {
			serverApi.routerHook.addRoute(DETAILED_REPORT_ROUTE, () =>
                <DetailedPage storage={storage} settings={settings} />
            )
		},
		unMount() {
			serverApi.routerHook.removeRoute(DETAILED_REPORT_ROUTE)
		}
	})
    mountManager.addMount({
		mount() {
			serverApi.routerHook.addRoute(SETTINGS_ROUTE, () =>
				<SettingsPage settings={settings} />
			)
		},
		unMount() {
			serverApi.routerHook.removeRoute(SETTINGS_ROUTE)
		}
	})
    mountManager.addMount(patchAppPage(serverApi, storage))
    mountManager.addMount(patchHomePage(serverApi, storage))
    mountManager.addMount(patchLibraryPage(serverApi, storage))
	mountManager.mount()

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
			// It is possible that user will update or reload plugin for some reason during playtime,
			// so we will try to commit the latest playtime interval
			mountManager.unMount()
		},
	};
});
