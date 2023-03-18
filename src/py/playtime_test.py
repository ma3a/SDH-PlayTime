import os
import unittest
from datetime import datetime, timedelta
from play_time_dao import PlayTimeDao
from playtime import DATE_FORMAT
from playtime import PlayTime


class TestPlayTime(unittest.TestCase):
    database = "test_db.db"
    dao: PlayTimeDao
    playtime: PlayTime

    def setUp(self) -> None:
        if os.path.exists(self.database):
            os.remove(self.database)
        self.dao = PlayTimeDao(self.database)
        self.playtime = PlayTime(self.dao)
        return super().setUp()

    def tearDown(self) -> None:
        if os.path.exists(self.database):
            os.remove(self.database)
        return super().tearDown()

    def test_should_add_new_interval(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.playtime.add_new_time(
            now.timestamp(), (now + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW")

        result = self.playtime.get_play_time_statistics(now.date(), now.date())
        self.assertEquals(result, [
            {
                "date": "2022-01-01",
                "games": [
                    {
                        "gameId": "100",
                        "gameName": "Zelda BOTW",
                        "time": 3600
                    }
                ],
                "totalTime": 3600
            }
        ])

    def test_should_add_new_interval_to_existing_game(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.playtime.add_new_time(
            now.timestamp(),
            (now + timedelta(hours=1)).timestamp(), "3647351456", "Zelda BOTW")
        self.playtime.add_new_time(
            (now + timedelta(hours=1)).timestamp(),
            (now + timedelta(hours=2)).timestamp(), "3647351456", "Zelda BOTW")

        result = self.playtime.get_play_time_statistics(now.date(), now.date())
        self.assertEquals(result, [
            {
                "date": "2022-01-01",
                "games": [
                    {
                        "gameId": "3647351456",
                        "gameName": "Zelda BOTW",
                        "time": 7200
                    }
                ],
                "totalTime": 7200
            }
        ])

    def test_should_split_interval_in_two_day_in_case_night_session(self):
        now = datetime(2022, 1, 1, 23, 0)
        next_day = now + timedelta(hours=2)
        self.playtime.add_new_time(
            now.timestamp(), next_day.timestamp(), "100", "Zelda BOTW")

        result = self.playtime.get_play_time_statistics(
            now.date(), next_day.date())
        self.assertEquals(result, [
            {
                "date": "2022-01-01",
                "games": [
                    {
                        "gameId": "100",
                        "gameName": "Zelda BOTW",
                        "time": 3600
                    }
                ],
                "totalTime": 3600
            },
            {
                "date": "2022-01-02",
                "games": [
                    {
                        "gameId": "100",
                        "gameName": "Zelda BOTW",
                        "time": 3600
                    }
                ],
                "totalTime": 3600
            }
        ])

    def test_should_sum_totalTime_per_day(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.playtime.add_new_time(
            now.timestamp(), (now + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW")
        self.playtime.add_new_time((now + timedelta(hours=1)).timestamp(),
                                   (now + timedelta(hours=1, minutes=30)).timestamp(), "101", "Doom")

        result = self.playtime.get_play_time_statistics(now.date(), now.date())
        self.assertEquals(result, [
            {
                "date": "2022-01-01",
                "games": [
                    {
                        "gameId": "100",
                        "gameName": "Zelda BOTW",
                        "time": 3600
                    },
                    {
                        "gameId": "101",
                        "gameName": "Doom",
                        "time": 1800
                    }
                ],
                "totalTime": 3600 + 1800
            }
        ])

    def test_return_only_data_in_requested_interval_without_gaps(self):
        date_01 = datetime(2022, 1, 1, 9, 0)
        self.playtime.add_new_time(date_01.timestamp(
        ), (date_01 + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW")

        date_02 = datetime(2022, 1, 2, 9, 0)
        self.playtime.add_new_time(
            date_02.timestamp(), (date_02 + timedelta(hours=1)).timestamp(), "101", "Doom")

        date_03 = datetime(2022, 1, 3, 9, 0)
        self.playtime.add_new_time(date_03.timestamp(
        ), (date_03 + timedelta(minutes=30)).timestamp(), "102", "Zelda Minish Cap")

        date_04 = datetime(2022, 1, 4, 9, 0)
        self.playtime.add_new_time(date_04.timestamp(
        ), (date_04 + timedelta(minutes=30)).timestamp(), "100", "Zelda BOTW")

        date_08 = datetime(2022, 1, 8, 9, 0)

        result = self.playtime.get_play_time_statistics(
            date_02.date(), date_08.date())
        self.maxDiff = None
        self.assertEquals(result, [
            {
                "date": "2022-01-02",
                "games": [
                    {
                        "gameId": "101",
                        "gameName": "Doom",
                        "time": 3600
                    }
                ],
                "totalTime": 3600
            },
            {
                "date": "2022-01-03",
                "games": [
                    {
                        "gameId": "102",
                        "gameName": "Zelda Minish Cap",
                        "time": 1800
                    }
                ],
                "totalTime": 1800
            },
            {
                "date": "2022-01-04",
                "games": [
                    {
                        "gameId": "100",
                        "gameName": "Zelda BOTW",
                        "time": 1800
                    }
                ],
                "totalTime": 1800
            },
            {
                "date": "2022-01-05",
                "games": [],
                "totalTime": 0
            },
            {
                "date": "2022-01-06",
                "games": [],
                "totalTime": 0
            },
            {
                "date": "2022-01-07",
                "games": [],
                "totalTime": 0
            },
            {
                "date": "2022-01-08",
                "games": [],
                "totalTime": 0
            }
        ])

    def test_should_calculate_overall_time_for_game(self):
        now = datetime(2022, 1, 1, 9, 0)
        self.playtime.add_new_time(
            now.timestamp(), (now + timedelta(hours=1)).timestamp(), "101", "Zelda BOTW")
        self.playtime.add_new_time((now + timedelta(hours=1)).timestamp(
        ), (now + timedelta(hours=1, minutes=30)).timestamp(), "101", "Zelda BOTW")

        result = self.playtime.get_overall_time_statistics_games()
        self.assertEquals(result["101"], 3600 + 1800)

    OLD_FORMAT = """
    {
        "version": 2312312,
        "data" :{
            "2022-01-01": {
                "1001" : {
                    "time": 3600,
                    "name": "Zelda BOTW"
                },
                "1002" : {
                    "time": 1800,
                    "name": "Zelda Minish Cap"
                }
            },
            "2022-01-02": {
                "1003" : {
                    "time": 7200,
                    "name": "DOOM"
                },
                "1004" : {
                    "time": 600,
                    "name": "DOOM 2"
                }
            }
        }
    }
    """

    def test_migarion_from_old_format(self):
        self.playtime.migrate_from_old_storage(self.OLD_FORMAT)

        result_day_01 = self.playtime.get_play_time_statistics(
            datetime(2022, 1, 1), datetime(2022, 1, 1))
        self.assertEquals(result_day_01, [
            {
                "date": "2022-01-01",
                "games": [
                    {
                        "gameId": "1001",
                        "gameName": "Zelda BOTW",
                        "time": 3600
                    },
                    {
                        "gameId": "1002",
                        "gameName": "Zelda Minish Cap",
                        "time": 1800
                    }
                ],
                "totalTime": 5400
            },
        ])

        result_day_02 = self.playtime.get_play_time_statistics(
            datetime(2022, 1, 2), datetime(2022, 1, 2))
        self.assertEquals(result_day_02, [{
            "date": "2022-01-02",
            "games": [
                {
                    "gameId": "1003",
                    "gameName": "DOOM",
                    "time": 7200
                },
                {
                    "gameId": "1004",
                    "gameName": "DOOM 2",
                    "time": 600
                }
            ],
            "totalTime": 7800
        }])
        result_stat = self.playtime.get_overall_time_statistics_games()
        self.assertEquals(result_stat, {
            "1001": 3600,
            "1002": 1800,
            "1003": 7200,
            "1004": 600
        })


if __name__ == '__main__':
    unittest.main()
