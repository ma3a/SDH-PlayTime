import os
import unittest
from datetime import datetime, timedelta
from defaults.python.playtime import PlayTimeStatistics
from play_time_dao import PlayTimeDao
from playtime import PlayTimeTracking


class TestPlayTime(unittest.TestCase):
    database = "test_db.db"
    dao: PlayTimeDao
    playtime_tracking: PlayTimeTracking
    playtime_statistics: PlayTimeStatistics

    def setUp(self) -> None:
        if os.path.exists(self.database):
            os.remove(self.database)
        self.dao = PlayTimeDao(self.database)
        self.playtime_tracking = PlayTimeTracking(self.dao)
        self.playtime_statistics = PlayTimeStatistics(self.dao)
        return super().setUp()

    def tearDown(self) -> None:
        if os.path.exists(self.database):
            os.remove(self.database)
        return super().tearDown()

    def test_should_add_new_interval(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.playtime_tracking.add_time(
            now.timestamp(), (now + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW")

        result = self.playtime_statistics.daily_statistics_for_period(
            now.date(), now.date())
        self.assertEqual(result["data"], [
            {
                "date": "2022-01-01",
                "games": [
                    {
                        "game": {
                            "id": "100",
                            "name": "Zelda BOTW",
                        },
                        "time": 3600
                    }
                ],
                "total": 3600
            }
        ])

    def test_should_add_new_interval_to_existing_game(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.playtime_tracking.add_time(
            now.timestamp(),
            (now + timedelta(hours=1)).timestamp(), "3647351456", "Zelda BOTW")
        self.playtime_tracking.add_time(
            (now + timedelta(hours=1)).timestamp(),
            (now + timedelta(hours=2)).timestamp(), "3647351456", "Zelda BOTW")

        result = self.playtime_statistics.daily_statistics_for_period(
            now.date(), now.date())
        self.assertEqual(result["data"], [
            {
                "date": "2022-01-01",
                "games": [
                    {
                        "game": {
                            "id": "3647351456",
                            "name": "Zelda BOTW",
                        },
                        "time": 7200
                    }
                ],
                "total": 7200
            }
        ])

    def test_should_split_interval_in_two_day_in_case_night_session(self):
        now = datetime(2022, 1, 1, 23, 0)
        next_day = now + timedelta(hours=2)
        self.playtime_tracking.add_time(
            now.timestamp(), next_day.timestamp(), "100", "Zelda BOTW")

        result = self.playtime_statistics.daily_statistics_for_period(
            now.date(), next_day.date())
        self.assertEqual(result["data"], [
            {
                "date": "2022-01-01",
                "games": [
                    {
                        "game": {
                            "id": "100",
                            "name": "Zelda BOTW",
                        },
                        "time": 3600
                    }
                ],
                "total": 3600
            },
            {
                "date": "2022-01-02",
                "games": [
                    {
                        "game": {
                            "id": "100",
                            "name": "Zelda BOTW",
                        },
                        "time": 3600
                    }
                ],
                "total": 3600
            }
        ])

    def test_should_sum_totalTime_per_day(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.playtime_tracking.add_time(
            now.timestamp(), (now + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW")
        self.playtime_tracking.add_time(
            (now + timedelta(hours=1)).timestamp(),
            (now + timedelta(hours=1, minutes=30)).timestamp(),
            "101",
            "Doom"
        )

        result = self.playtime_statistics.daily_statistics_for_period(
            now.date(), now.date())
        self.assertEqual(result["data"], [
            {
                "date": "2022-01-01",
                "games": [
                    {
                        "game": {
                            "id": "100",
                            "name": "Zelda BOTW",
                        },
                        "time": 3600
                    },
                    {
                        "game": {
                            "id": "101",
                            "name": "Doom",
                        },
                        "time": 1800
                    }
                ],
                "total": 3600 + 1800
            }
        ])

    def test_return_only_data_in_requested_interval_without_gaps(self):
        date_01 = datetime(2022, 1, 1, 9, 0)
        self.playtime_tracking.add_time(date_01.timestamp(
        ), (date_01 + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW")

        date_02 = datetime(2022, 1, 2, 9, 0)
        self.playtime_tracking.add_time(
            date_02.timestamp(),
            (date_02 +
             timedelta(
                 hours=1)).timestamp(),
            "101",
            "Doom")

        date_03 = datetime(2022, 1, 3, 9, 0)
        self.playtime_tracking.add_time(date_03.timestamp(
        ), (date_03 + timedelta(minutes=30)).timestamp(), "102", "Zelda Minish Cap")

        date_04 = datetime(2022, 1, 4, 9, 0)
        self.playtime_tracking.add_time(date_04.timestamp(
        ), (date_04 + timedelta(minutes=30)).timestamp(), "100", "Zelda BOTW")

        date_08 = datetime(2022, 1, 8, 9, 0)

        result = self.playtime_statistics.daily_statistics_for_period(
            date_02.date(), date_08.date())
        self.maxDiff = None
        self.assertEqual(result["data"], [
            {
                "date": "2022-01-02",
                "games": [
                    {
                        "game": {
                            "id": "101",
                            "name": "Doom",
                        },
                        "time": 3600
                    }
                ],
                "total": 3600
            },
            {
                "date": "2022-01-03",
                "games": [
                    {
                        "game": {
                            "id": "102",
                            "name": "Zelda Minish Cap",
                        },
                        "time": 1800
                    }
                ],
                "total": 1800
            },
            {
                "date": "2022-01-04",
                "games": [
                    {
                        "game": {
                            "id": "100",
                            "name": "Zelda BOTW",
                        },
                        "time": 1800
                    }
                ],
                "total": 1800
            },
            {
                "date": "2022-01-05",
                "games": [],
                "total": 0
            },
            {
                "date": "2022-01-06",
                "games": [],
                "total": 0
            },
            {
                "date": "2022-01-07",
                "games": [],
                "total": 0
            },
            {
                "date": "2022-01-08",
                "games": [],
                "total": 0
            }
        ])

    def test_should_calculate_overall_time_for_game(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.playtime_tracking.add_time(
            now.timestamp(), (now + timedelta(hours=1)).timestamp(), "101", "Zelda BOTW")
        self.playtime_tracking.add_time((now + timedelta(hours=1)).timestamp(
        ), (now + timedelta(hours=1, minutes=30)).timestamp(), "101", "Zelda BOTW")

        result = self.playtime_statistics.per_game_overall_statistic()
        self.assertEqual(result[0]["time"], 3600 + 1800)


if __name__ == '__main__':
    unittest.main()
