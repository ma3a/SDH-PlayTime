import { Mountable } from "./system";
import { Storage } from "./Storage";
import logger from "../utils";

export { SteamPatches }

class SteamPatches implements Mountable {

    private storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    public mount() {
        this.ReplaceAppInfoStoreOnAppOverviewChange();
        this.ReplaceAppStoreMapAppsSet();
    }

    public unMount() {
        this.RestoreOnAppOverviewChange();
        this.RestoreAppStoreMapAppsSet();
    }

    // here we patch AppInfoStore OnAppOverviewChange method so we can prepare changed app overviews for the next part of the patch (AppOverview.InitFromProto)
    private ReplaceAppInfoStoreOnAppOverviewChange() {
        this.RestoreOnAppOverviewChange();
        if (appInfoStore && !appInfoStore.OriginalOnAppOverviewChange) {
            //logger.trace(`ReplaceAppInfoStoreOnAppOverviewChange`);
            appInfoStore.OriginalOnAppOverviewChange = appInfoStore.OnAppOverviewChange;
            let instance = this;
            appInfoStore.OnAppOverviewChange = function (apps: Array<any>) {
                let appIds = apps.filter((_: any) => typeof _.appid() === "number").map((_: any) => _.appid() as number);
                instance.appInfoStoreOnAppOverviewChange(appIds);
                //logger.trace(`AppInfoStore.OnAppOverviewChange: calling original`);
                this.OriginalOnAppOverviewChange(apps);
            };
        }
    }

    private RestoreOnAppOverviewChange() {
        if (appInfoStore && appInfoStore.OriginalOnAppOverviewChange) {
            //logger.trace(`RestoreOnAppOverviewChange`);
            appInfoStore.OnAppOverviewChange = appInfoStore.OriginalOnAppOverviewChange;
            appInfoStore.OriginalOnAppOverviewChange = null;
        }
    }

    // here we patch AppStore m_mapApps Map set method so we can ovewrite playtime before setting AppOverview
    private ReplaceAppStoreMapAppsSet() {
        this.RestoreAppStoreMapAppsSet();
        if (appStore.m_mapApps && !appStore.m_mapApps.originalSet) {
            //logger.trace(`ReplaceAppStoreMapAppsSet`);
            appStore.m_mapApps.originalSet = appStore.m_mapApps.set;
            let instance = this;
            let appStoreInstance = appStore;
            appStore.m_mapApps.set = function (appId: number, appOverview: any): any {
                instance.appStoreMapAppsSet(appId, appOverview);
                //logger.trace(`AppStore.m_mapApps.set: calling original`);
                appStoreInstance.m_mapApps.originalSet(appId, appOverview);
            };
        }
    }

    private RestoreAppStoreMapAppsSet() {
        if (appStore.m_mapApps && appStore.m_mapApps.originalSet) {
            //logger.trace(`RestoreAppStoreMapAppsSet`);
            appStore.m_mapApps.set = appStore.m_mapApps.originalSet;
            appStore.m_mapApps.originalSet = null;
        }
    }

    // here we patch AppOverview InitFromProto method so we can ovewrite playtime after original method
    private appInfoStoreOnAppOverviewChange(appIds: Array<number> | null) {
        //logger.trace(`AppInfoStore.OnAppOverviewChange (${appIds ? "[]" : "null"})`);
        if (appIds) {
            let playtimeCache = this.storage.getOverallTimesCache();
            if (playtimeCache) {
                appIds.forEach((appId) => {
                    let appOverview = appStore.GetAppOverviewByAppID(appId);
                    let playTime = playtimeCache[`${appId}`];
                    if (playTime && appOverview?.app_type == 1073741824) {
                        appOverview.OriginalInitFromProto = appOverview.InitFromProto;
                        appOverview.InitFromProto = function (proto: any) {
                            appOverview.OriginalInitFromProto(proto);
                            logger.info(`AppOverview.InitFromProto: Setting playtime for ${appOverview.display_name} (${appId}) to ${playTime}`);
                            appOverview.minutes_playtime_forever = (playTime / 60.0).toFixed(1);
                            appOverview.InitFromProto = appOverview.OriginalInitFromProto;
                        };
                    }
                });
            }
            //updatePlaytimesForAppIds(this.storage, appIds, true);
        }
    }

    // here we set playtime to appOverview before the appOverview is added to AppStore_m_mapApps map
    private appStoreMapAppsSet(appId: number, appOverview: any) {
        //logger.trace(`AppStore.m_mapApps.set (${appId})`);
        if (appId && appOverview) {
            let playtimeCache = this.storage.getOverallTimesCache();
            if (playtimeCache) {
                let playTime = playtimeCache[`${appId}`];
                if (playTime && appOverview?.app_type == 1073741824) {
                    logger.info(`AppStore.m_mapApps.set: Setting playtime for ${appOverview.display_name} (${appId}) to ${playTime}`);
                    appOverview.minutes_playtime_forever = (playTime / 60.0).toFixed(1);
                }
            }
        }
    }

}
