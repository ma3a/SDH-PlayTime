import { EventBus } from './system'
import { Events } from './events'

export interface Cache<T> {
    isReady(): boolean
    get(): T | null
    subscribe(callback: (data: T) => void): void
}

export class UpdatableCache<T> implements Cache<T> {
    private provider: () => Promise<T>
    private data: T | null = null
    private subscribers: ((data: T) => void)[] = []

    constructor(provider: () => Promise<T>) {
        this.provider = provider
        this.update()
    }

    public subscribe(callback: (data: T) => void): void {
        this.subscribers.push(callback)
        if (this.data !== null) {
            callback(this.data)
        }
    }

    public clearSubscribers(): void {
        this.subscribers = []
    }

    public get(): T | null {
        return this.data
    }

    public isReady(): boolean {
        return this.data !== null
    }

    public update(): void {
        let instance = this
        this.provider().then((data) => {
            instance.data = data
            for (let subscriber of instance.subscribers) {
                subscriber(data)
            }
        })
    }
}

export class UpdateOnEventCache<T> implements Cache<T> {
    private cache: UpdatableCache<T>

    constructor(cache: UpdatableCache<T>, eventBus: EventBus, types: Events['type'][]) {
        this.cache = cache
        eventBus.addSubscriber((event) => {
            if (types.includes(event.type)) {
                cache.update()
            }
            if (event.type === 'Unmount') {
                cache.clearSubscribers()
            }
        })
    }

    public subscribe(callback: (data: T) => void): void {
        this.cache.subscribe(callback)
    }

    public get(): T | null {
        return this.cache.get()
    }

    public isReady(): boolean {
        return this.cache.isReady()
    }
}
