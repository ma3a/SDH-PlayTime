import logger from '../utils'
import { Events } from './events'

export { Clock, EventBus, systemClock, Mountable }

let systemClock = {
    getTimeMs() {
        return Date.now()
    }
} as Clock

interface Clock {
    getTimeMs: () => number
}

interface Mountable {
    mount: () => void,
    unMount: () => void
}

class EventBus {

    private subscribers: ((event: Events) => void)[] = []

    public emit(event: Events) {
        logger.info("New event", event)
        this.subscribers.forEach((it) => { it(event) })
    }

    public addSubscriber(subscriber: (event: Events) => void) {
        this.subscribers.push(subscriber)
    }
}