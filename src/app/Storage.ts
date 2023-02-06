import { ServerAPI, ServerResponse } from "decky-frontend-lib";
import logger from "../utils";
import { toIsoDateOnly } from "./formatters";
import { GameCompactInfo, PlayTimeForDay } from "./model";
import { EventBus } from "./system";

export class Storage {
    private serverApi: ServerAPI

    constructor(eventBus: EventBus, serverApi: ServerAPI) {
        this.serverApi = serverApi
        let instance = this
        eventBus.addSubscriber(async (event) => {
            switch (event.type) {
                case "CommitInterval":
                    await instance.saveInterval(event.startedAt, event.endedAt, event.game)
                    break
            }
        })
    }

    private async saveInterval(startedAt: number, endedAt: number, game: GameCompactInfo) {
        await this.serverApi.callPluginMethod<{ started_at: number, ended_at: number, game_id: string, game_name: string }, void>(
            "on_save_interval",
            { started_at: startedAt / 1000, ended_at: endedAt / 1000, game_id: game.appId, game_name: game.name }
        ).catch((e => logger.error("Unable to save interval", e)))
            .finally(() => logger.info("Saved interval successfully"))
    }

    async getPlayTime(startDate: Date, endDate: Date): Promise<ServerResponse<PlayTimeForDay[]>> {
        return await this.serverApi.callPluginMethod<{ start_date: string, end_date: string }, PlayTimeForDay[]>(
            "get_play_time",
            { start_date: toIsoDateOnly(startDate), end_date: toIsoDateOnly(endDate) }
        )
    }
}