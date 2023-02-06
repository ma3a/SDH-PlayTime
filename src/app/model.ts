export { GameCompactInfo, PlayTimeForDay, GameWithPlayTime }

interface GameCompactInfo {
    appId: string,
    name: string
}

interface PlayTimeForDay {
    date: string,
    games: GameWithPlayTime[]
    totalTime: number
}

interface GameWithPlayTime {
    gameId: string,
    gameName: string,
    time: number
}