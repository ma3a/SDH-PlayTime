export { humanReadablePlayTime, toIsoDateOnly }

function humanReadablePlayTime(seconds: number, short: boolean = false): string {
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    let plurals = function (value: number, nonplural: string) {
        if (value == 1) {
            return nonplural
        }
        else return nonplural + "s"
    }

    let result = ""
    if (short) {
        if (hours > 0) {
            result += `${hours}h `
        }
        result += `${minutes % 60}m`
        return result
    } else {

        if (hours > 0) {
            result += `${hours} ${plurals(hours, "hour")} `
        }
        result += `${minutes % 60} ${plurals(minutes % 60, "minute")}`
    }
    return result
}

function toIsoDateOnly(date: Date) {
    return date.toISOString().substring(0, 10)
}