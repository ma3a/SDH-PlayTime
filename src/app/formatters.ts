import { Interval } from './reports'

export { humanReadableTime, toIsoDateOnly, formatMonthInterval, formatWeekInterval }

function humanReadableTime(seconds: number, short: boolean = true): string {
    let minutes = Math.floor(seconds / 60)
    let hours = Math.floor(minutes / 60)

    let plurals = function (value: number, nonPlural: string) {
        if (value == 1) {
            return nonPlural
        } else return nonPlural + 's'
    }

    let result = ''
    if (short) {
        if (hours > 0) {
            result += `${hours}h `
        }
        result += `${minutes % 60}m`
        return result
    } else {
        if (hours > 0) {
            result += `${hours} ${plurals(hours, 'hour')} `
        }
        result += `${minutes % 60} ${plurals(minutes % 60, 'minute')}`
    }
    return result
}

function toIsoDateOnly(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function formatMonthInterval(interval: Interval) {
    return interval.start.toLocaleDateString('en-us', {
        month: 'long',
        year: 'numeric',
    })
}

function formatWeekInterval(interval: Interval) {
    return `${interval.start.toLocaleDateString('en-us', {
        day: '2-digit',
        month: 'long',
    })} - ${interval.end.toLocaleDateString('en-us', {
        day: '2-digit',
        month: 'long',
    })}`
}
