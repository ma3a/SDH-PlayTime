import { afterPatch, RoutePatch, ServerAPI } from 'decky-frontend-lib'
import { ReactElement } from 'react'
import { AppDetails, AppOverview } from '../app/model'
import { Mountable } from '../app/system'
import { Backend } from '../app/backend'
import { runInAction } from 'mobx'

export function updatePlaytimes(storage: Backend) {
    let cache = storage.getOverallTimesCache()
    Object.entries(cache).forEach(([gameId, time]) => {
        let overview = appStore.GetAppOverviewByAppID(+gameId)
        if (overview?.app_type == 1073741824) {
            overview.minutes_playtime_forever = (time / 60.0).toFixed(1)
        }
    })
}

export function updatePlaytime(storage: Backend, appId: number) {
    let cache = storage.getOverallTimesCache()
    let overview = appStore.GetAppOverviewByAppID(appId)
    if (overview?.app_type == 1073741824) {
        overview.minutes_playtime_forever = (cache[`${appId}`] / 60.0).toFixed(1)
    }
}

function routePatch(serverAPI: ServerAPI, path: string, patch: RoutePatch): Mountable {
    return {
        mount() {
            serverAPI.routerHook.addPatch(path, patch)
        },
        unMount() {
            serverAPI.routerHook.removePatch(path, patch)
        },
    }
}

export function patchAppPage(serverAPI: ServerAPI, storage: Backend): Mountable {
    return routePatch(
        serverAPI,
        '/library/app/:appid',
        (props: { path: string; children: ReactElement }) => {
            afterPatch(props.children.props, 'renderFunc', (_, ret1) => {
                const overview: AppOverview = ret1.props.children.props.overview
                const details: AppDetails = ret1.props.children.props.details
                const app_id: number = overview.appid

                // just getting value - it fixes blinking issue
                details.nPlaytimeForever
                if (overview.app_type == 1073741824) {
                    const times = storage.getOverallTimesCache()
                    if (details && times) {
                        runInAction(() => {
                            details.nPlaytimeForever = +(
                                times[`${app_id}`] / 60.0
                            ).toFixed(1)
                        })
                    }
                }
                // just getting value - it fixes blinking issue
                details.nPlaytimeForever
                return ret1
            })
            return props
        }
    )
}

export function patchHomePage(serverAPI: ServerAPI, backend: Backend): Mountable {
    return routePatch(
        serverAPI,
        '/library/home',
        (props: { path: string; children: ReactElement }) => {
            afterPatch(
                props.children,
                'type',
                (_: Record<string, unknown>[], ret1?: any) => {
                    updatePlaytimes(backend)
                    ret1.key = Math.random()
                    return ret1
                }
            )
            return props
        }
    )
}

export function patchLibraryPage(serverAPI: ServerAPI, storage: Backend): Mountable {
    return routePatch(
        serverAPI,
        '/library',
        (props: { path: string; children: ReactElement }) => {
            afterPatch(props.children, 'type', (_, ret1) => {
                updatePlaytimes(storage)
                return ret1
            })
            return props
        }
    )
}
