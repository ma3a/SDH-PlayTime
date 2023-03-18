import { Backend } from './backend'
import { DailyStatistics, GameWithTime } from './model'

export interface Interval {
    start: Date
    end: Date
}

interface IntervalPager {
    next(): IntervalPager
    prev(): IntervalPager
    current(): Interval
}

interface Page<T> {
    data: T[]
    interval: Interval
}

export interface Paginated<T> {
    next(): Promise<Paginated<T>>
    hasNext(): boolean

    prev(): Promise<Paginated<T>>
    hasPrev(): boolean

    current(): Page<T>
}

export enum IntervalType {
    Weekly,
    Monthly,
}

export class Reports {
    private backend: Backend

    constructor(backend: Backend) {
        this.backend = backend
    }

    public async weeklyStatistics(): Promise<Paginated<DailyStatistics>> {
        return PerDayPaginatedImpl.create(
            this.backend,
            IntervalPagerImpl.create(IntervalType.Weekly, new Date())
        )
    }

    public async monthlyStatistics(): Promise<Paginated<DailyStatistics>> {
        return PerDayPaginatedImpl.create(
            this.backend,
            IntervalPagerImpl.create(IntervalType.Monthly, new Date())
        )
    }

    public async overallStatistics(): Promise<GameWithTime[]> {
        return await this.backend.fetchPerGameOverallStatistics()
    }
}

class PerDayPaginatedImpl implements Paginated<DailyStatistics> {
    private backend: Backend
    private intervalPager: IntervalPager
    private data: DailyStatistics[]
    private hasPrevPage: boolean
    private hasNextPage: boolean

    private constructor(
        backend: Backend,
        intervalPager: IntervalPager,
        data: DailyStatistics[],
        hasPrevPage: boolean,
        hasNextPage: boolean
    ) {
        this.backend = backend
        this.intervalPager = intervalPager
        this.data = data
        this.hasNextPage = hasNextPage
        this.hasPrevPage = hasPrevPage
    }

    hasNext(): boolean {
        return this.hasNextPage
    }
    hasPrev(): boolean {
        return this.hasPrevPage
    }

    static async create(
        backend: Backend,
        intervalPager: IntervalPager
    ): Promise<Paginated<DailyStatistics>> {
        const data = await backend.fetchDailyStatisticForInterval(
            intervalPager.current().start,
            intervalPager.current().end
        )
        return new PerDayPaginatedImpl(
            backend,
            intervalPager,
            data.data,
            data.hasPrev,
            data.hasNext
        )
    }

    next(): Promise<Paginated<DailyStatistics>> {
        const nextIntervalPager = this.intervalPager.next()
        return PerDayPaginatedImpl.create(this.backend, nextIntervalPager)
    }
    prev(): Promise<Paginated<DailyStatistics>> {
        const prevIntervalPager = this.intervalPager.prev()
        return PerDayPaginatedImpl.create(this.backend, prevIntervalPager)
    }

    current(): Page<DailyStatistics> {
        return {
            data: this.data,
            interval: this.intervalPager.current(),
        }
    }
}

export class IntervalPagerImpl {
    private type: IntervalType
    private interval: Interval

    constructor(type: IntervalType, interval: Interval) {
        this.type = type
        this.interval = interval
    }

    static create(type: IntervalType, date: Date): IntervalPager {
        if (type === IntervalType.Weekly) {
            const start = startOfWeek(date)
            const end = endOfWeek(start)
            return new IntervalPagerImpl(type, { start, end })
        } else {
            const start = startOfMonth(date)
            const end = endOfMonth(start)
            return new IntervalPagerImpl(type, { start, end })
        }
    }

    public next(): IntervalPager {
        let nextDate = new Date(this.interval.end)
        nextDate.setDate(this.interval.end.getDate() + 1)
        if (this.type === IntervalType.Weekly) {
            const start = startOfWeek(nextDate)
            const end = endOfWeek(start)
            return new IntervalPagerImpl(this.type, { start, end })
        } else {
            const start = startOfMonth(nextDate)
            const end = endOfMonth(start)
            return new IntervalPagerImpl(this.type, { start, end })
        }
    }

    public prev(): IntervalPager {
        let prevDate = new Date(this.interval.start)
        prevDate.setDate(this.interval.start.getDate() - 1)
        if (this.type === IntervalType.Weekly) {
            const start = startOfWeek(prevDate)
            const end = endOfWeek(start)
            return new IntervalPagerImpl(this.type, { start, end })
        } else {
            const start = startOfMonth(prevDate)
            const end = endOfMonth(start)
            return new IntervalPagerImpl(this.type, { start, end })
        }
    }

    public current(): Interval {
        return this.interval
    }
}

function startOfDay(date: Date): Date {
    const dt = new Date(date)
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
}

function endOfDay(date: Date): Date {
    const dt = new Date(date)
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 23, 59, 59)
}

function startOfWeek(date: Date): Date {
    const dt = new Date(date)
    const day = dt.getDay()
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1)
    return startOfDay(new Date(dt.setDate(diff)))
}

function endOfWeek(startOfWeek: Date): Date {
    const dt = new Date(startOfWeek)
    const diff = dt.getDate() + 6
    return endOfDay(new Date(dt.setDate(diff)))
}

function startOfMonth(date: Date): Date {
    const dt = new Date(date)
    return startOfDay(new Date(dt.getFullYear(), dt.getMonth(), 1))
}

function endOfMonth(date: Date): Date {
    const dt = new Date(date)
    return endOfDay(new Date(dt.getFullYear(), dt.getMonth() + 1, 0))
}
