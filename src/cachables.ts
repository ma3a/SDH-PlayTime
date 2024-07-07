import { Backend } from './app/backend'
import { UpdatableCache, UpdateOnEventCache } from './app/cache'
import { EventBus } from './app/system'
import { endOfWeek, minusDays, startOfWeek } from './utils'

export let createCachedPlayTimes = (backend: Backend, eventBus: EventBus) =>
    new UpdateOnEventCache(
        new UpdatableCache(() =>
            backend.fetchPerGameOverallStatistics().then((r) => {
                let map = new Map<string, number>()
                r.forEach((time) => {
                    map.set(time.game.id, time.time)
                })
                return map
            })
        ),
        eventBus,
        ['CommitInterval', 'TimeManuallyAdjusted']
    )

export let createCachedLastTwoWeeksPlayTimes = (backend: Backend, eventBus: EventBus) =>
    new UpdateOnEventCache(
        new UpdatableCache(() => {
            let now = new Date()
            let twoWeeksAgoStart = minusDays(startOfWeek(now), 7)
            let twoWeeksAgoEnd = endOfWeek(now)
            return backend
                .fetchDailyStatisticForInterval(twoWeeksAgoStart, twoWeeksAgoEnd)
                .then((r) => {
                    let map = new Map<string, number>()
                    r.data.forEach((time) => {
                        time.games.forEach((game) => {
                            if (map.has(game.game.id)) {
                                map.set(game.game.id, map.get(game.game.id)! + game.time)
                            } else {
                                map.set(game.game.id, game.time)
                            }
                        })
                    })
                    return map
                })
        }),
        eventBus,
        ['CommitInterval', 'TimeManuallyAdjusted']
    )
