import { afterPatch, RoutePatch, ServerAPI } from 'decky-frontend-lib'
import { ReactElement } from 'react'
import { AppDetails, AppOverview } from '../app/model'
import { Mountable } from '../app/system'
import { Cache } from '../app/cache'
import { runInAction } from 'mobx'

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

export function patchAppPage(
    serverAPI: ServerAPI,
    timeCache: Cache<Map<string, number>>
): Mountable {
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
                    if (details && timeCache.isReady()) {
                        runInAction(() => {
                            let time = timeCache.get()!.get(app_id.toString()) || 0
                            details.nPlaytimeForever = +(time / 60.0).toFixed(1)
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
