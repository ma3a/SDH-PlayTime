import { Backend } from './backend'
import { AppOverview, GameWithTime } from './model'

export const nonSteamGamesPredicate = (app: AppOverview) => app.app_type === 1073741824
export const excludeApps = (app: AppOverview) => app.app_type != 4

export class TimeManipulation {
    private backend: Backend

    constructor(backend: Backend) {
        this.backend = backend
    }

    async applyManualOverallTimeCorrection(game: GameWithTime) {
        await this.backend.applyManualOverallTimeCorrection([game])
    }

    /**
     * @returns Map of all tracked games with their playtime (AppOverview.appid, GameWithTime)
     */
    async fetchPlayTimeForAllGames(
        predicates: Array<(app: AppOverview) => boolean> = [excludeApps]
    ): Promise<Map<string, GameWithTime>> {
        const gameOverallStatistics = await this.backend.fetchPerGameOverallStatistics()
        const trackedGamesByAppId = new Map<string, GameWithTime>()
        gameOverallStatistics.forEach((game: GameWithTime) => {
            trackedGamesByAppId.set(game.game.id, game)
        })

        const allSteamAppsAsGameWithTime = appStore.allApps
            .filter((it) => predicates.every((predicate) => predicate(it)))
            .map((app) => {
                return {
                    game: {
                        id: `${app.appid}`,
                        name: app.display_name,
                    },
                    time: 0,
                } as GameWithTime
            })
        const result = new Map<string, GameWithTime>()
        allSteamAppsAsGameWithTime.forEach((game) => {
            const trackedGame = trackedGamesByAppId.get(game.game.id)
            if (trackedGame != null) {
                result.set(game.game.id, trackedGame)
            } else {
                result.set(game.game.id, game)
            }
        })

        return result
    }
}
