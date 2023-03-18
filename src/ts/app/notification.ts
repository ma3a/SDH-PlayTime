import { SessionPlayTime } from "./SessionPlayTime"
import { Settings } from "./settings"
import { EventBus, Mountable } from "./system"

export class BreaksReminder implements Mountable {

    eventBus: EventBus
    settings: Settings
    sessionPlayTime: SessionPlayTime
    timeoutId: NodeJS.Timeout | null = null

    constructor(eventBus: EventBus, settings: Settings, sessionPlayTime: SessionPlayTime) {
        this.eventBus = eventBus
        this.settings = settings
        this.sessionPlayTime = sessionPlayTime

        let instance = this
        eventBus.addSubscriber(async (event) => {
            switch (event.type) {
                case "GameWasRunningBefore":
                case "GameStarted":
                    instance.stopTimer()
                    if (await instance.notificationsAllowed()) {
                        instance.setTimer()
                    }
                    break
            }
        })
    }

    private async notificationsAllowed(): Promise<boolean> {
        return (await this.settings.get()).reminderToTakeBreaksInterval > 0
    }

    private async setTimer() {
        let timeoutMs = await (await this.settings.get()).reminderToTakeBreaksInterval * 60 * 1000
        let instance = this
        this.timeoutId = setTimeout(() => { instance.onTime() }, timeoutMs)
    }

    private async onTime() {
        this.stopTimer();
        if (await this.notificationsAllowed() || this.sessionPlayTime.isActiveInterval()) {
            this.eventBus.emit({ type: "NotifyToTakeBreak", playTimeSeconds: this.sessionPlayTime.getPlayTime(Date.now()) })
            this.setTimer()
        }
    }

    private async stopTimer() {
        if (this.timeoutId != null) {
            clearTimeout(this.timeoutId)
        }
    }

    public mount() { }
    public unMount() {
        this.stopTimer()
    }
}