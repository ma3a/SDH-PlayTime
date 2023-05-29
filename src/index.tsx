import { definePlugin, ServerAPI, staticClasses, SteamClient } from 'decky-frontend-lib'
import { FaClock } from 'react-icons/fa'
import { Clock, EventBus, Mountable, MountManager, systemClock } from './app/system'
import { Backend } from './app/backend'
import { SteamEventMiddleware } from './app/middleware'
import { SessionPlayTime } from './app/SessionPlayTime'
import { patchAppPage, patchHomePage, patchLibraryPage } from './steam-ui/patches'
import { AppStore } from './app/model'
import { DetailedPage } from './pages/ReportPage'
import { Settings } from './app/settings'
import { SettingsPage } from './pages/SettingsPage'
import {
    DETAILED_REPORT_ROUTE,
    MANUALLY_ADJUST_TIME,
    MIGRATION_PAGE,
    SETTINGS_ROUTE,
} from './pages/navigation'
import { BreaksReminder } from './app/notification'
import { humanReadableTime } from './app/formatters'
import { DeckyPanelPage } from './pages/DeckyPanelPage'
import { LocatorProvider } from './locator'
import { Reports } from './app/reports'
import { TimeManipulation } from './app/time-manipulation'
import { SteamlessTimeMigrationPage } from './pages/SteamlessTimeMigrationPage'
import { ManuallyAdjustTimePage } from './pages/ManuallyAdjustTimePage'

declare global {
    // @ts-ignore
    let SteamClient: SteamClient
    let appStore: AppStore
    let appInfoStore: AppInfoStore
}

export default definePlugin((serverApi: ServerAPI) => {
    console.log('PlayTime plugin loading...')
    let clock = systemClock
    let eventBus = new EventBus()
    let backend = new Backend(eventBus, serverApi)
    let sessionPlayTime = new SessionPlayTime(eventBus)
    let settings = new Settings()
    let reports = new Reports(backend)
    let timeMigration = new TimeManipulation(backend)

    let mountManager = new MountManager(eventBus, clock)
    let mounts = createMountables(
        eventBus,
        backend,
        clock,
        settings,
        serverApi,
        reports,
        sessionPlayTime,
        timeMigration
    )
    mounts.forEach((m) => mountManager.addMount(m))

    mountManager.mount()
    return {
        title: <div className={staticClasses.Title}>PlayTime</div>,
        content: (
            <LocatorProvider
                sessionPlayTime={sessionPlayTime}
                settings={settings}
                reports={reports}
                timeManipulation={timeMigration}
            >
                <DeckyPanelPage />
            </LocatorProvider>
        ),
        icon: <FaClock />,
        onDismount() {
            mountManager.unMount()
        },
    }
})

function createMountables(
    eventBus: EventBus,
    backend: Backend,
    clock: Clock,
    settings: Settings,
    serverApi: ServerAPI,
    reports: Reports,
    sessionPlayTime: SessionPlayTime,
    timeMigration: TimeManipulation
): Mountable[] {
    eventBus.addSubscriber((event) => {
        switch (event.type) {
            case 'NotifyToTakeBreak':
                serverApi.toaster.toast({
                    body: (
                        <div>
                            You already playing for{' '}
                            {humanReadableTime(event.playTimeSeconds)},
                        </div>
                    ),
                    title: 'PlayTime: remember to take a breaks',
                    icon: <FaClock />,
                    duration: 10 * 1000,
                    critical: true,
                })
                break
            case 'NotifyAboutError':
                serverApi.toaster.toast({
                    body: <div>{event.message}</div>,
                    title: 'PlayTime: error',
                    icon: <FaClock />,
                    duration: 2 * 1000,
                    critical: true,
                })
                break
        }
    })
    let mounts: Mountable[] = []
    mounts.push(new BreaksReminder(eventBus, settings))
    mounts.push(new SteamEventMiddleware(eventBus, clock))
    mounts.push({
        mount() {
            serverApi.routerHook.addRoute(DETAILED_REPORT_ROUTE, () => (
                <LocatorProvider
                    reports={reports}
                    sessionPlayTime={sessionPlayTime}
                    settings={settings}
                    timeManipulation={timeMigration}
                >
                    <DetailedPage />
                </LocatorProvider>
            ))
        },
        unMount() {
            serverApi.routerHook.removeRoute(DETAILED_REPORT_ROUTE)
        },
    })
    mounts.push({
        mount() {
            serverApi.routerHook.addRoute(SETTINGS_ROUTE, () => (
                <LocatorProvider
                    reports={reports}
                    sessionPlayTime={sessionPlayTime}
                    settings={settings}
                    timeManipulation={timeMigration}
                >
                    <SettingsPage />
                </LocatorProvider>
            ))
        },
        unMount() {
            serverApi.routerHook.removeRoute(SETTINGS_ROUTE)
        },
    })
    mounts.push({
        mount() {
            serverApi.routerHook.addRoute(MIGRATION_PAGE, () => (
                <LocatorProvider
                    reports={reports}
                    sessionPlayTime={sessionPlayTime}
                    settings={settings}
                    timeManipulation={timeMigration}
                >
                    <SteamlessTimeMigrationPage />
                </LocatorProvider>
            ))
        },
        unMount() {
            serverApi.routerHook.removeRoute(MIGRATION_PAGE)
        },
    })
    mounts.push({
        mount() {
            serverApi.routerHook.addRoute(MANUALLY_ADJUST_TIME, () => (
                <LocatorProvider
                    reports={reports}
                    sessionPlayTime={sessionPlayTime}
                    settings={settings}
                    timeManipulation={timeMigration}
                >
                    <ManuallyAdjustTimePage />
                </LocatorProvider>
            ))
        },
        unMount() {
            serverApi.routerHook.removeRoute(MANUALLY_ADJUST_TIME)
        },
    })
    mounts.push(patchAppPage(serverApi, backend))
    mounts.push(patchHomePage(serverApi, backend))
    mounts.push(patchLibraryPage(serverApi, backend))
    mounts.push(new SteamPatches(storage))
    mounts.push(new SteamLifecycle(eventBus, storage))
    return mounts
}
