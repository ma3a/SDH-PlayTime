import logger from '../utils'

import { EventBus } from './system'
import { GameCompactInfo } from './model'

export { SessionPlayTime }

interface ActiveInterval {
    startedAt: number,
    game: GameCompactInfo
}

class SessionPlayTime {

    private activeInterval: ActiveInterval | null = null
    private eventBus: EventBus

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus
        let instance = this
        eventBus.addSubscriber((event) => {
            switch (event.type) {
                case "GameWasRunningBefore":
                    instance.startInterval(event.createdAt, event.game)
                    break;

                case "GameStarted":
                    instance.startInterval(event.createdAt, event.game!)
                    break

                case "GameStopped":
                    instance.commitInterval(event.createdAt, event.game!)
                    break

                case "Suspended":
                    if (instance.activeInterval != null) {
                        instance.commitInterval(event.createdAt, instance.activeInterval.game)
                    }
                    break;

                case "ResumeFromSuspend":
                    if (event.game != null) {
                        instance.startInterval(event.createdAt, event.game)
                    }
                    break;

                case "Unmount":
                    if (instance.activeInterval != null)
                        instance.commitInterval(event.createdAt, instance.activeInterval.game)
                    break;
            }

        })
    }

    public getPlayTime(requestedAt: number): number {
        if (this.activeInterval != null) {
            return (requestedAt - this.activeInterval.startedAt) / 1000
        }
        return 0
    }

    public isActiveInterval() {
        return this.activeInterval != null
    }

    private startInterval(startedAt: number, game: GameCompactInfo) {
        if (this.activeInterval != null && this.activeInterval.game.appId == game.appId) {
            logger.error(`Getting same game start interval, ignoring it`)
            return
        }
        if (this.activeInterval != null && this.activeInterval.game.appId != game.appId) {
            logger.error(`Interval already started but for the different game ` +
                `['${this.activeInterval.game.appId}', '${this.activeInterval.game.name}'] -> [['${game.appId}', '${game.name}']];`)
            this.activeInterval = null
        }

        this.activeInterval = {
            startedAt: startedAt,
            game: game
        } as ActiveInterval
    }

    private commitInterval(endedAt: number, game: GameCompactInfo) {
        if (this.activeInterval == null) {
            logger.error("There is no active interval, ignoring commit")
            return
        }
        if (this.activeInterval.game.appId != game.appId) {
            logger.error(`Could not commit interval with different games:`
                + ` ['${this.activeInterval.game.appId}', '${this.activeInterval.game.name}'] -> [['${game.appId}', '${game.name}']] `)
            return
        }

        this.eventBus.emit({ type: "CommitInterval", startedAt: this.activeInterval.startedAt, endedAt: endedAt, game: this.activeInterval.game })
        this.activeInterval = null
    }
}
