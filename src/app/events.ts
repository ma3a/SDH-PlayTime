import { Game } from './model'
import { Mountable } from './system'

export type Events =
    | { type: 'GameWasRunningBefore'; createdAt: number; game: Game }
    | { type: 'GameStarted'; createdAt: number; game: Game }
    | { type: 'GameStopped'; createdAt: number; game: Game }
    | { type: 'Suspended'; createdAt: number; game: Game | null }
    | { type: 'ResumeFromSuspend'; createdAt: number; game: Game | null }
    | { type: 'Unmount'; createdAt: number; mounts: Mountable[] }
    | { type: 'Mount'; createdAt: number; mounts: Mountable[] }
    | { type: 'CommitInterval'; startedAt: number; endedAt: number; game: Game }
    | { type: 'NotifyToTakeBreak'; playTimeSeconds: number }
    | { type: 'NotifyAboutError'; message: string }
    | { type: "UserLoggedIn", createdAt: number, username: string }
    | { type: "UserLoggedOut", createdAt: number }
    | { type: 'TimeManuallyAdjusted' }
