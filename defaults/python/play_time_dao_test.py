import os
import unittest
import sqlite3
from datetime import datetime
from play_time_dao import PlayTimeDao


class FixedClock:
    def now(self):
        return datetime(2023, 1, 1, 9, 0)


class TestPlayTimeDao(unittest.TestCase):
    database = "test_db.db"
    dao: PlayTimeDao

    def setUp(self) -> None:
        if os.path.exists(self.database):
            os.remove(self.database)
        self.dao = PlayTimeDao(self.database)
        return super().setUp()

    def tearDown(self) -> None:
        if os.path.exists(self.database):
            os.remove(self.database)
        return super().tearDown()

    def test_should_save_game_dict_only_once(self):
        self.dao.save_game_dict("1001", "Zelda BOTW")
        self.dao.save_game_dict("1001", "Zelda BOTW - updated")

        result = sqlite3.connect(self.database).execute(
            "select game_id, name from game_dict").fetchone()
        self.assertEqual(result[0], "1001")
        self.assertEqual(result[1], "Zelda BOTW - updated")

    def test_should_add_time_to_existing_game_in_overall_time(self):
        self.dao.append_overall_time("1001", 3600)
        self.dao.append_overall_time("1001", 1800)

        result = sqlite3.connect(self.database).execute(
            "select game_id, duration from overall_time").fetchone()
        self.assertEqual(result[0], "1001")
        self.assertEqual(result[1], 5400)

    def test_should_add_new_interval(self):
        self.dao.save_game_dict("1001", "Zelda BOTW")
        self.dao.save_play_time(
            datetime(2023, 1, 1, 10, 0),
            3600,
            "1001"
        )
        result = sqlite3.connect(self.database).execute(
            "select date_time, game_id, duration from play_time").fetchone()
        self.assertEqual(result[0], "2023-01-01T10:00:00")
        self.assertEqual(result[1], "1001")
        self.assertEqual(result[2], 3600)

    def test_should_calculate_per_day_time_report(self):
        self.dao.save_game_dict("1001", "Zelda BOTW")
        self.dao.save_game_dict("1002", "DOOM")
        self.dao.save_play_time(
            datetime(2023, 1, 1, 9, 0),
            3600,
            "1001"
        )
        self.dao.save_play_time(
            datetime(2023, 1, 1, 11, 0),
            1800,
            "1001"
        )
        self.dao.save_play_time(
            datetime(2023, 1, 2, 10, 0),
            2000,
            "1002"
        )
        result = self.dao.fetch_per_day_time_report(
            datetime(2023, 1, 1, 0, 0),
            datetime(2023, 1, 2, 23, 59)
        )
        self.assertEqual(len(result), 2)

        self.assertEqual(result[0].date, "2023-01-01")
        self.assertEqual(result[0].game_id, "1001")
        self.assertEqual(result[0].game_name, "Zelda BOTW")
        self.assertEqual(result[0].time, 5400)

        self.assertEqual(result[1].date, "2023-01-02")
        self.assertEqual(result[1].game_id, "1002")
        self.assertEqual(result[1].game_name, "DOOM")
        self.assertEqual(result[1].time, 2000)


if __name__ == '__main__':
    unittest.main()
