import { GameCompactInfo } from './model'
import {Mountable} from "./system";

export type Events =
    | { type: "GameWasRunningBefore", createdAt: number, game: GameCompactInfo }
    | { type: "GameStarted", createdAt: number, game: GameCompactInfo }
    | { type: "GameStopped", createdAt: number, game: GameCompactInfo }
    | { type: "Suspended", createdAt: number, game: GameCompactInfo | null }
    | { type: "ResumeFromSuspend", createdAt: number, game: GameCompactInfo | null }
    | { type: "Unmount", createdAt: number, mounts: Mountable[] }
    | { type: "Mount", createdAt: number, mounts: Mountable[] }
    | { type: "CommitInterval", startedAt: number, endedAt: number, game: GameCompactInfo }
    | { type: "NotifyToTakeBreak", playTimeSeconds: number }
