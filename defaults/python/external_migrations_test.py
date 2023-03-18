import os
import unittest
from play_time_dao import PlayTimeDao
from playtime import PlayTime
from external_migrations import ExternalMigrations


class ExternalMigrationsSteamLessTime(unittest.TestCase):
    database = "test_db.db"
    dao: PlayTimeDao
    play_time: PlayTime
    migrator: ExternalMigrations

    def setUp(self) -> None:
        if os.path.exists(self.database):
            os.remove(self.database)
        self.dao = PlayTimeDao(self.database)
        self.play_time = PlayTime(self.dao)
        self.migrator = ExternalMigrations(self.play_time)
        return super().setUp()

    def tearDown(self) -> None:
        if os.path.exists(self.database):
            os.remove(self.database)
        return super().tearDown()

    def test_should_return_error_on_non_json_format(self):
        content = """
            { "playtimes" = []}
        """
        result = self.migrator.migrate_from_steamless_time(
            {}, content, "test-migrated.json"
        )
        self.assertEqual(result["status"], "ERROR")
        self.assertEqual(result["errors"][0],
                         "Unable to load SteamLess time storage format")

    def test_should_return_error_on_non_json_format(self):
        content = """
            { "playtimes": null}
        """
        result = self.migrator.migrate_from_steamless_time(
            {}, content, "test-migrated.json"
        )
        self.assertEqual(result["status"], "ERROR")
        self.assertEqual(result["errors"][0],
                         "Unable to load SteamLess time storage format")

    def test_should_return_success_on_empty(self):
        content = """
            { "playtimes": {}}
        """
        result = self.migrator.migrate_from_steamless_time(
            {}, content, "test-migrated.json"
        )
        self.assertEqual(result["status"], "DONE")

    def test_should_return_partial_done_if_missing_in_association_map(self):
        content = """
            {
                "playtimes": {
                    "old-game-id-01": 3600
                }
            }
        """
        result = self.migrator.migrate_from_steamless_time(
            {}, content, "test-migrated.json"
        )
        self.assertEqual(result["status"], "PARTIAL_DONE")
        self.assertEqual(result["errors"][0],
                         "Skipping game_id: old-game-id-01. Probably game have been removed from the library")

    def test_should_add_play_times_if_everything_ok(self):
        content = """
            {
                "playtimes": {
                    "old-game-id-01": 3600
                }
            }
        """
        associations = {
            "old-game-id-01": {
                "gameId": "new-game-id-01",
                "name": "game-name"
            }
        }
        result = self.migrator.migrate_from_steamless_time(
            associations, content, "test-migrated.json"
        )
        self.assertEqual(result["status"], "DONE")
        self.assertEqual(len(result["errors"]), 0)
        self.assertEqual(
            self.play_time.get_overall_time_statistics_games()["new-game-id-01"], 3600)

    def test_should_not_duplicate_play_times_for_already_migrated_games(self):
        content = """
            {
                "playtimes": {
                    "old-game-id-01": 3600
                }
            }
        """
        associations = {
            "old-game-id-01": {
                "gameId": "new-game-id-01",
                "name": "game-name"
            }
        }
        self.migrator.migrate_from_steamless_time(
            associations, content, "test-migrated.json")
        self.migrator.migrate_from_steamless_time(
            associations, content, "test-migrated.json")
        self.assertEqual(
            self.play_time.get_overall_time_statistics_games()["new-game-id-01"], 3600)

    def test_should_save_one_game_and_skip_game_with_missing_association(self):
        content = """
            {
                "playtimes": {
                    "old-game-id-01": 3600,
                    "old-game-id-02": 3600
                }
            }
        """
        associations = {
            "old-game-id-01": {
                "gameId": "new-game-id-01",
                "name": "game-name"
            }
        }
        result = self.migrator.migrate_from_steamless_time(
            associations, content, "test-migrated.json")
        self.assertEqual(
            self.play_time.get_overall_time_statistics_games()["new-game-id-01"], 3600)
        self.assertEqual(result["status"], "PARTIAL_DONE")
        self.assertEqual(result["errors"][0],
                         "Skipping game_id: old-game-id-02. Probably game have been removed from the library")


if __name__ == '__main__':
    unittest.main()
