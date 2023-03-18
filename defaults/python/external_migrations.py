import datetime
import logging
from typing import List
from playtime import PlayTime
import json

logger = logging.getLogger()


class ExternalMigrations:

    def __init__(self, playtime: PlayTime):
        self.playtime = playtime

    def migrate_from_steamless_time(self, associations: dict, file_content, migrated_from: str):
        try:
            data = json.loads(file_content)
            if (data["playtimes"] is None):
                raise Exception("playtimes not found")
            data = data["playtimes"]
        except Exception:
            logging.error("Unable to load SteamLess time storage format")
            return self.critical_error("Unable to load SteamLess time storage format")

        errors = []
        for migrate_from_game_id in data:
            migrate_to = associations.get(migrate_from_game_id)
            if (migrate_to is None):
                errors.append(
                    f"Skipping game_id: {migrate_from_game_id}. Probably game have been removed from the library")
                continue

            game_id = migrate_to["gameId"]
            game_name = migrate_to["name"]

            if (self.playtime.is_already_migrated(game_id, migrated_from)):
                logger.warn(
                    f"game_id = '{migrate_from_game_id}' is already migrated, skipping")
                continue

            self.playtime.add_migrated_time(
                date=datetime.datetime.now(),
                length=data[migrate_from_game_id],
                game_id=game_id,
                game_name=game_name,
                migrated=migrated_from
            )

        if len(errors) > 0:
            return self._partial_done(errors)
        else:
            return self._done()

    def critical_error(self, error):
        return {"status": "ERROR", "errors": [error]}

    def _partial_done(self, errors):
        return {"status": "PARTIAL_DONE", "errors": errors}

    def _done(self):
        return {"status": "DONE", "errors": []}
