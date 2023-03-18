import { Settings } from './settings'
import { EventBus, Mountable } from './system'

export class BreaksReminder implements Mountable {
    eventBus: EventBus
    settings: Settings
    timeoutId: NodeJS.Timeout | null = null
    sessionStaredAt: number | null = null

    constructor(eventBus: EventBus, settings: Settings) {
        this.eventBus = eventBus
        this.settings = settings

        let instance = this
        eventBus.addSubscriber(async (event) => {
            switch (event.type) {
                case 'GameWasRunningBefore':
                case 'GameStarted':
                    if (instance.timeoutId == null && (await instance.notificationsAllowed())) {
                        instance.setTimer()
                    }
                    break
                case 'GameStopped':
                case 'Suspended':
                    instance.stopTimer()
                    break
            }
        })
    }

    private async notificationsAllowed(): Promise<boolean> {
        return (await this.settings.get()).reminderToTakeBreaksInterval > 0
    }

    private async setTimer() {
        let timeoutMs = (await (await this.settings.get()).reminderToTakeBreaksInterval) * 60 * 1000
        let instance = this
        this.sessionStaredAt = Date.now()
        this.timeoutId = setTimeout(() => {
            instance.onTime()
        }, timeoutMs)
    }

    private async onTime() {
        this.stopTimer()
        if (await this.notificationsAllowed()) {
            let playedMs = Date.now() - this.sessionStaredAt!
            this.eventBus.emit({
                type: 'NotifyToTakeBreak',
                playTimeSeconds: playedMs / 1000,
            })
            this.setTimer()
        }
    }

    private async stopTimer() {
        if (this.timeoutId != null) {
            clearTimeout(this.timeoutId)
        }
    }

    public mount() {}
    public unMount() {
        this.stopTimer()
    }
}
