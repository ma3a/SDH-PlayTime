import { ServerAPI, ServerResponse } from "decky-frontend-lib";
import { AppOverview } from "./model";

export interface MigrationResult {
    status: MigrationStatus
    errors: String[]
}

enum MigrationStatus {
    DONE = "DONE",
    ERROR = "ERROR",
    PARTIAL_DONE = "PARTIAL_DONE",
}

interface GameIdAssociation {
    [gameId: string]: MigrateTo
}

interface MigrateTo {
    gameId: string
    name: string
}

export class SteamLessTimeMigrator {
    serverApi: ServerAPI

    constructor(serverApi: ServerAPI) {
        this.serverApi = serverApi
    }

    private geAssociations(): GameIdAssociation {
        let apps: AppOverview[] = appStore.allApps
        let association: GameIdAssociation = {}
        apps.filter(it => it.m_gameid != undefined || it.m_gameid != null).forEach(it => {
            association[it.m_gameid] = { gameId: String(it.appid), name: it.display_name }
        })
        return association
    }

    async migrate(): Promise<ServerResponse<MigrationResult>> {
        return this.serverApi.callPluginMethod<{ association: GameIdAssociation }, MigrationResult>(
            "migrate_data_from_steamless_time",
            { association: this.geAssociations() }
        )
    }
}