import { SessionPlayTime } from '../src/app/SessionPlayTime'
import { EventBus } from '../src/app/system'
import { Game } from '../src/app/model'

const gameInfo_01 = {
    id: '001',
    name: 'Game name 001',
} as Game

const gameInfo_02 = {
    id: '002',
    name: 'Game name 002',
} as Game

describe('SessionPlayTime should calculate time', () => {
    test('Should calculate ', () => {
        const eventBus = new EventBus()
        const sessionPlayTime = new SessionPlayTime(eventBus)
        eventBus.emit({
            type: 'GameStarted',
            createdAt: 0,
            game: gameInfo_01,
        })
        expect(sessionPlayTime.getPlayTime(1000 * 60 * 5)).toBe(300)
    })

    test('should ignore interval of game_01, when we received game start event game_02 without ending game_01 event ', () => {
        const eventBus = new EventBus()
        const sessionPlayTime = new SessionPlayTime(eventBus)
        eventBus.emit({
            type: 'GameStarted',
            createdAt: 0,
            game: gameInfo_01,
        })
        eventBus.emit({
            type: 'GameStarted',
            createdAt: 1000 * 60 * 2,
            game: gameInfo_02,
        })

        expect(sessionPlayTime.getPlayTime(1000 * 60 * 5)).toBe(180)
    })
})

describe('SessionPlayTime should send commit interval', () => {
    test('when we received games start and game end events sequentially', () => {
        const eventBus = new EventBus()
        // @ts-ignore
        const sessionPlayTime = new SessionPlayTime(eventBus)

        var committedInterval
        eventBus.addSubscriber((event) => {
            switch (event.type) {
                case 'CommitInterval':
                    committedInterval = {
                        type: event.type,
                        startedAt: event.startedAt,
                        endedAt: event.endedAt,
                        game: event.game,
                    }
                    break
            }
        })
        eventBus.emit({
            type: 'GameStarted',
            createdAt: 0,
            game: gameInfo_01,
        })
        eventBus.emit({
            type: 'GameStopped',
            createdAt: 50,
            game: gameInfo_01,
        })

        expect(committedInterval).toStrictEqual({
            type: 'CommitInterval',
            startedAt: 0,
            endedAt: 50,
            game: gameInfo_01,
        })
    })
})
