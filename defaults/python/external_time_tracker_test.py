import os
import shutil
import unittest
from external_time_tracker import ExternalTimeTracker


class ExternalMigrationsSteamLessTime(unittest.TestCase):
    decky_home = "test-data"
    ext_tracker: ExternalTimeTracker

    def _create_file_with_content(self, content: str, file_name: str):
        file_path = os.path.join(self.decky_home, file_name)
        with open(file_path, "w", encoding="UTF-8") as f:
            f.write(content)

    def setUp(self) -> None:
        if os.path.exists(self.decky_home):
            shutil.rmtree(self.decky_home)

        os.mkdir(self.decky_home)
        os.mkdir(self.decky_home + "/settings")

        self.ext_tracker = ExternalTimeTracker()
        return super().setUp()

    def tearDown(self) -> None:
        if os.path.exists(self.decky_home):
            shutil.rmtree(self.decky_home)
        return super().tearDown()

    def test_should_return_error_when_no_files(self):
        try:
            self.ext_tracker.get_games_in_steamless_time(self.decky_home)
        except Exception as exception:
            self.assertEqual(
                str(exception),
                "Unable to find SteamlessTimes or Metadeck data. Missing file, or format is invalid")

    def test_should_return_error_on_non_json_format(self):
        self._create_file_with_content(
            """
            { "playtimes" = []}
            """,
            "settings/steamlesstimes.json"
        )
        try:
            self.ext_tracker.get_games_in_steamless_time(self.decky_home)
        except Exception as exception:
            self.assertEqual(
                str(exception),
                "Unable to find SteamlessTimes or Metadeck data. Missing file, or format is invalid")

    def test_should_return_partial_done_if_missing_in_association_map(self):
        self._create_file_with_content(
            """
            {
                "playtimes": {
                    "old-game-id-01": 3600
                }
            }
            """,
            "settings/steamlesstimes.json"
        )
        self.assertEqual(
            self.ext_tracker.get_games_in_steamless_time(self.decky_home),
            {"old-game-id-01": 3600}
        )


if __name__ == '__main__':
    unittest.main()
