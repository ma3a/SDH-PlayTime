import { humanReadablePlayTime } from "../src/app/formatters"

describe("Should present play time as correct human readable text", () => {
    test("when zero minutes with correct plural", () => {
        expect(humanReadablePlayTime(59)).toBe("0 minutes")
    })

    test("when minute without plural", () => {
        expect(humanReadablePlayTime(60 * 1)).toBe("1 minute")
    })

    test("when 5 minutes with plural", () => {
        expect(humanReadablePlayTime(60 * 5)).toBe("5 minutes")
    })

    test("when we have single hour and plural minutes", () => {
        expect(humanReadablePlayTime(60 * 90)).toBe("1 hour 30 minutes")
    })

    test("when requested short version for hour and minutes", () => {
        expect(humanReadablePlayTime(60 * 90, true)).toBe("1h 30m")
    })

    test("when requested short version for minutes", () => {
        expect(humanReadablePlayTime(60 * 5, true)).toBe("5m")
    })
})