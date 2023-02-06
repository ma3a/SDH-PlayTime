import { Router, sleep } from "decky-frontend-lib"
import { GameCompactInfo } from "./model"
import { Clock, EventBus, Mountable } from "./system"

export { SteamEventMiddleware }

class SteamEventMiddleware implements Mountable {

    private clock: Clock
    private eventBus: EventBus
    private router: Router

    constructor(eventBus: EventBus, clock: Clock, router: Router) {
        this.eventBus = eventBus
        this.clock = clock
        this.router = router
    }

    private activeHooks: Array<SteamHook> = []

    public mount() {
        if (this.fetchGameInfo() != null) {
            this.eventBus.emit({
                type: "GameWasRunningBefore",
                createdAt: this.clock.getTimeMs(),
                game: this.fetchGameInfo()!
            })
        }

        this.activeHooks.push(SteamClient.GameSessions.RegisterForAppLifetimeNotifications((async (data: LifetimeNotification) => {
            if (data.bRunning) {
                this.eventBus.emit({
                    type: "GameStarted",
                    createdAt: this.clock.getTimeMs(),
                    game: await this.awaitGameInfo()
                })
            } else {
                this.eventBus.emit({
                    type: "GameStopped",
                    createdAt: this.clock.getTimeMs(),
                    game: await this.awaitGameInfo()
                })
            }
        })))

        this.activeHooks.push(SteamClient.System.RegisterForOnSuspendRequest(async () => {
            this.eventBus.emit({
                type: "Suspended",
                createdAt: this.clock.getTimeMs(),
                game: await this.fetchGameInfo()
            })
        }))

        this.activeHooks.push(SteamClient.System.RegisterForOnResumeFromSuspend(async () => {
            this.eventBus.emit({
                type: "ResumeFromSuspend",
                createdAt: this.clock.getTimeMs(),
                game: await this.fetchGameInfo()
            })
        }))
    }

    private async awaitGameInfo(): Promise<GameCompactInfo> {
        await waitForPredicate(4, 200, async () => { return this.fetchGameInfo() != null })
        return this.fetchGameInfo()!;
    }

    private fetchGameInfo(): GameCompactInfo | null {
        if (this.router.MainRunningApp != null) {
            return {
                appId: this.router.MainRunningApp.appid,
                name: this.router.MainRunningApp.display_name
            } as GameCompactInfo
        } else {
            return null
        }
    }

    public async unMount() {
        this.activeHooks.forEach((it) => it.unregister())
    }
}

async function waitForPredicate(retries: number, delay: number, predicate: () => (boolean | Promise<boolean>)): Promise<boolean> {
    const waitImpl = async (): Promise<boolean> => {
        try {
            let tries = retries + 1;
            while (tries-- !== 0) {
                if (await predicate()) {
                    return true;
                }
                if (tries > 0) {
                    await sleep(delay);
                }
            }
        } catch (error) {
            console.error(error);
        }

        return false;
    };

    return await waitImpl();
}


interface LifetimeNotification {
    unAppID: number;
    nInstanceID: string;
    bRunning: boolean;
}

interface SteamHook {
    unregister: () => void
}