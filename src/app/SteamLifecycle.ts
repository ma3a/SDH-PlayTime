//import logger from '../utils';
import { EventBus, Mountable } from './system';
import { Storage } from "./Storage";
import { updatePlaytimesDebounced } from '../RoutePatches';

export { SteamLifecycle }

class SteamLifecycle implements Mountable {
    private eventBus: EventBus;
    private storage: Storage;

    constructor(eventBus: EventBus, storage: Storage) {
        this.eventBus = eventBus;
        this.storage = storage;
    }

    public mount() {
        if (this.eventBus && this.storage) {
            this.eventBus.addSubscriber((event) => {
                switch (event.type) {
                    case "Mount":
                        this.mounted(event.createdAt);
                        break;

                    case "UserLoggedIn":
                        this.userLoggedIn(event.createdAt);
                        break;

                    case "UserLoggedOut":
                        this.userLoggedOut(event.createdAt);
                        break;

                    case "AppOverviewChanged":
                        this.appOverviewChanged(event.createdAt);
                        break;

                    case "AppInfoStore.OnAppOverviewChange":
                        this.appInfoStoreOnAppOverviewChange(event.createdAt, event.appIds);
                        break;

                    case "AppStore.m_mapApps.set":
                        this.appStoreMapAppsSet(event.createdAt, event.appId, event.appOverview);
                        break;
                }
            }
            );
        }
    }

    public unMount() {
    }

    private mounted(createdAt: number) {
        //logger.trace(`SteamLifecycleMounted @${createdAt}`);
        updatePlaytimesDebounced(this.storage);
    }

    private userLoggedIn(createdAt: number) {
        //logger.trace(`UserLoggedIn @${createdAt}`);
        updatePlaytimesDebounced(this.storage);
    }

    private userLoggedOut(createdAt: number) {
        //logger.trace(`UserLoggedOut @${createdAt}`);
    }

    private appOverviewChanged(createdAt: number) {
        //logger.trace(`AppOverviewChanged @${createdAt}`);
        //updatePlaytimesDebounced(this.storage);
    }

    // here we patch AppOverview InitFromProto method so we can ovewrite playtime after original method
    private appInfoStoreOnAppOverviewChange(createdAt: number, appIds: Array<number> | null) {
        //logger.trace(`AppInfoStore.OnAppOverviewChange @${createdAt}, ${appIds ? "[]" : "null"}`);
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
                            //logger.trace(`AppOverview.InitFromProto: Setting playtime for ${appOverview.display_name} (${appId}) to ${playTime}`);
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
    private appStoreMapAppsSet(createdAt: number, appId: number, appOverview: any) {
        //logger.trace(`AppStore.m_mapApps.set @${createdAt}, ${appId}`);
        if (appId && appOverview) {
            let playtimeCache = this.storage.getOverallTimesCache();
            if (playtimeCache) {
                let playTime = playtimeCache[`${appId}`];
                if (playTime) {
                    //logger.trace(`AppStore.m_mapApps.set: Setting playtime for ${appOverview.display_name} (${appId}) to ${playTime}`);
                    appOverview.minutes_playtime_forever = (playTime / 60.0).toFixed(1);
                }
            }
        }
    }
}
