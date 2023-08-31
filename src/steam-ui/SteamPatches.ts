import { Mountable } from '../app/system'
import logger from '../utils'
import { Cache } from '../app/cache'
import { AppOverview } from '../app/model'

export { SteamPatches }

class SteamPatches implements Mountable {
    private cachedOverallTime: Cache<Map<string, number>>
    private cachedLastTwoWeeksTimes: Cache<Map<string, number>>

    constructor(
        cachedOverallTime: Cache<Map<string, number>>,
        cachedLastTwoWeeksTimes: Cache<Map<string, number>>
    ) {
        this.cachedOverallTime = cachedOverallTime
        this.cachedLastTwoWeeksTimes = cachedLastTwoWeeksTimes
    }

    public mount() {
        this.ReplaceAppInfoStoreOnAppOverviewChange()
        this.ReplaceAppStoreMapAppsSet()
        let instance = this
        this.cachedOverallTime.subscribe((overallTimes) => {
            this.cachedLastTwoWeeksTimes.subscribe((lastTwoWeeksTimes) => {
                let changedApps = []
                for (let [appId, time] of overallTimes) {
                    let appOverview = appStore.GetAppOverviewByAppID(parseInt(appId))
                    if (appOverview?.app_type == 1073741824) {
                        instance.patchOverviewWithValues(
                            appOverview,
                            time,
                            lastTwoWeeksTimes.get(appId) || 0
                        )
                        changedApps.push(appOverview)
                    }
                }
                appInfoStore.OnAppOverviewChange(changedApps)
                appStore.m_mapApps.set(
                    changedApps.map((app) => app.appid),
                    changedApps
                )
            })
        })
    }

    public unMount() {
        this.RestoreOnAppOverviewChange()
        this.RestoreAppStoreMapAppsSet()
    }

    // here we patch AppInfoStore OnAppOverviewChange method so we can prepare changed app overviews for the next part of the patch (AppOverview.InitFromProto)
    private ReplaceAppInfoStoreOnAppOverviewChange() {
        this.RestoreOnAppOverviewChange()
        if (appInfoStore && !appInfoStore.OriginalOnAppOverviewChange) {
            logger.debug(`ReplaceAppInfoStoreOnAppOverviewChange`)
            appInfoStore.OriginalOnAppOverviewChange = appInfoStore.OnAppOverviewChange
            let instance = this
            appInfoStore.OnAppOverviewChange = function (apps: Array<any>) {
                let appIds = apps
                    .filter((_: any) => typeof _.appid() === 'number')
                    .map((_: any) => _.appid() as number)
                instance.appInfoStoreOnAppOverviewChange(appIds)
                logger.debug(`AppInfoStore.OnAppOverviewChange: calling original`)
                this.OriginalOnAppOverviewChange(apps)
            }
        }
    }

    private RestoreOnAppOverviewChange() {
        if (appInfoStore && appInfoStore.OriginalOnAppOverviewChange) {
            //logger.trace(`RestoreOnAppOverviewChange`);
            appInfoStore.OnAppOverviewChange = appInfoStore.OriginalOnAppOverviewChange
            appInfoStore.OriginalOnAppOverviewChange = null
        }
    }

    // here we patch AppStore m_mapApps Map set method so we can overwrite playtime before setting AppOverview
    private ReplaceAppStoreMapAppsSet() {
        this.RestoreAppStoreMapAppsSet()
        if (appStore.m_mapApps && !appStore.m_mapApps.originalSet) {
            //logger.trace(`ReplaceAppStoreMapAppsSet`);
            appStore.m_mapApps.originalSet = appStore.m_mapApps.set
            let instance = this
            let appStoreInstance = appStore
            appStore.m_mapApps.set = function (appId: number, appOverview: any): any {
                instance.appStoreMapAppsSet(appId, appOverview)
                appStoreInstance.m_mapApps.originalSet(appId, appOverview)
            }
        }
    }

    private RestoreAppStoreMapAppsSet() {
        if (appStore.m_mapApps && appStore.m_mapApps.originalSet) {
            //logger.trace(`RestoreAppStoreMapAppsSet`);
            appStore.m_mapApps.set = appStore.m_mapApps.originalSet
            appStore.m_mapApps.originalSet = null
        }
    }

    // here we patch AppOverview InitFromProto method so we can overwrite playtime after original method
    private appInfoStoreOnAppOverviewChange(appIds: Array<number> | null) {
        logger.debug(`AppInfoStore.OnAppOverviewChange (${appIds ? '[]' : 'null'})`)
        if (appIds) {
            appIds.forEach((appId) => {
                let appOverview = appStore.GetAppOverviewByAppID(appId)
                if (appOverview?.app_type == 1073741824) {
                    let instance = this
                    appOverview.OriginalInitFromProto = appOverview.InitFromProto
                    appOverview.InitFromProto = function (proto: any) {
                        appOverview.OriginalInitFromProto(proto)
                        instance.patchAppOverviewFromCache(appOverview)
                        appOverview.InitFromProto = appOverview.OriginalInitFromProto
                    }
                }
            })
        }
    }

    // here we set playtime to appOverview before the appOverview is added to AppStore_m_mapApps map
    private appStoreMapAppsSet(appId: number, appOverview: any) {
        //logger.trace(`AppStore.m_mapApps.set (${appId})`);
        if (appId && appOverview) {
            this.patchAppOverviewFromCache(appOverview)
        }
    }

    private patchAppOverviewFromCache(appOverview: AppOverview): AppOverview {
        if (
            appOverview?.app_type == 1073741824 &&
            this.cachedOverallTime.isReady() &&
            this.cachedLastTwoWeeksTimes.isReady()
        ) {
            const overallTime =
                this.cachedOverallTime.get()!.get(`${appOverview.appid}`) || 0
            const lastTwoWeeksTime =
                this.cachedLastTwoWeeksTimes.get()!.get(`${appOverview.appid}`) || 0
            this.patchOverviewWithValues(appOverview, overallTime, lastTwoWeeksTime)
        }
        return appOverview
    }

    private patchOverviewWithValues(
        appOverview: AppOverview,
        overallTime: number,
        lastTwoWeeksTime: number
    ): AppOverview {
        if (appOverview?.app_type == 1073741824) {
            appOverview.minutes_playtime_forever = (overallTime / 60.0).toFixed(1)
            appOverview.minutes_playtime_last_two_weeks = Number.parseFloat(
                (lastTwoWeeksTime / 60.0).toFixed(1)
            )
        }
        return appOverview
    }
}
