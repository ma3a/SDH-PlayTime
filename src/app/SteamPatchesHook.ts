//import logger from "../utils";
import { SteamHook } from "./middleware";
import { Clock, EventBus } from "./system";

export { SteamPatchesHook }

class SteamPatchesHook implements SteamHook {

    private clock: Clock;
    private eventBus: EventBus;

    constructor(eventBus: EventBus, clock: Clock) {
        this.eventBus = eventBus;
        this.clock = clock;
    }

    public init() {
        this.ReplaceAppInfoStoreOnAppOverviewChange();
        this.ReplaceAppStoreMapAppsSet();
    }

    public unregister() {
        this.RestoreOnAppOverviewChange();
        this.RestoreAppStoreMapAppsSet();
    }

    // here we patch AppInfoStore OnAppOverviewChange method so we can prepare changed app overviews for the next part of the patch (AppOverview.InitFromProto)
    private ReplaceAppInfoStoreOnAppOverviewChange() {
        this.RestoreOnAppOverviewChange();
        if (appInfoStore && !appInfoStore.OriginalOnAppOverviewChange) {
            appInfoStore.OriginalOnAppOverviewChange = appInfoStore.OnAppOverviewChange;
            let instance = this;
            appInfoStore.OnAppOverviewChange = function (apps: Array<any>) {
                //logger.trace(`AppInfoStore.OnAppOverviewChange (${apps ? "[]" : "null"})`);
                let appIds = apps.filter((_: any) => typeof _.appid() === "number").map((_: any) => _.appid() as number);
                instance.eventBus.emit({
                    type: "AppInfoStore.OnAppOverviewChange",
                    createdAt: instance.clock.getTimeMs(),
                    appIds: appIds,
                });
                //logger.trace(`AppInfoStore.OnAppOverviewChange: calling original`);
                this.OriginalOnAppOverviewChange(apps);
            };
        }
    }

    private RestoreOnAppOverviewChange() {
        if (appInfoStore && appInfoStore.OriginalOnAppOverviewChange) {
            appInfoStore.OnAppOverviewChange = appInfoStore.OriginalOnAppOverviewChange;
            appInfoStore.OriginalOnAppOverviewChange = null;
        }
    }

    // here we patch AppStore m_mapApps Map set method so we can ovewrite playtime before setting AppOverview
    private ReplaceAppStoreMapAppsSet() {
        this.RestoreAppStoreMapAppsSet();
        if (appStore.m_mapApps && !appStore.m_mapApps.originalSet) {
            appStore.m_mapApps.originalSet = appStore.m_mapApps.set;
            let instance = this;
            let appStoreInstance = appStore;
            appStore.m_mapApps.set = function (appId: number, appOverview: any) {
                //logger.trace(`AppStore.m_mapApps.set (${appId})`);
                instance.eventBus.emit({
                    type: "AppStore.m_mapApps.set",
                    createdAt: instance.clock.getTimeMs(),
                    appId: appId,
                    appOverview: appOverview,
                });
                //logger.trace(`AppStore.m_mapApps.set: calling original`);
                appStoreInstance.m_mapApps.originalSet(appId, appOverview);
            };
        }
    }

    private RestoreAppStoreMapAppsSet() {
        if (appStore.m_mapApps && appStore.m_mapApps.originalSet) {
            appStore.m_mapApps.set = appStore.m_mapApps.originalSet;
            appStore.m_mapApps.originalSet = null;
        }
    }

}
