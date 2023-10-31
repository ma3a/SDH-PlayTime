export {
    Game,
    GameWithTime,
    DailyStatistics,
    convertDailyStatisticsToGameWithTime,
    Session,
    OverallPlayTimes,
    StatisticForIntervalResponse,
    SessionsInIntervalResponse,
}

interface Game {
    id: string
    name: string
}

interface GameWithTime {
    game: Game
    time: number
}

interface DailyStatistics {
    date: string
    games: GameWithTime[]
    total: number
}

interface Session {
    dateTime: string
    game: Game
    duration: number
}

interface OverallPlayTimes {
    [gameId: string]: number
}

interface StatisticForIntervalResponse {
    data: DailyStatistics[]
    hasPrev: boolean
    hasNext: boolean
}

interface SessionsInIntervalResponse {
    data: Session[]
    earlierToken: string | null
    laterToken: string | null
}

function convertDailyStatisticsToGameWithTime(data: DailyStatistics[]): GameWithTime[] {
    let result: GameWithTime[] = []
    data.forEach((day) => {
        day.games.forEach((game) => {
            let found = result.find((g) => g.game.id === game.game.id)
            if (found) {
                found.time += game.time
            } else {
                result.push(game)
            }
        })
    })
    return result
}
