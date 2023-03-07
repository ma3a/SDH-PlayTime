import os
import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
from python.playtime import DATE_FORMAT
from storage import Storage
from playtime import PlayTime
from storage_test import async_test


class FixedClock:
    def now(self):
        return datetime(2022, 1, 20, 9, 0)


class TestPlayTime(unittest.TestCase):
    file_path = "test_storage_playtime.json"
    storage: Storage
    playtime: PlayTime

    def setUp(self) -> None:
        self.storage = Storage(self.file_path)
        self.storage.clear_file()
        self.playtime = PlayTime(self.storage, FixedClock())
        return super().setUp()

    def tearDown(self) -> None:
        if os.path.exists(self.file_path):
            os.remove(self.file_path)
        return super().tearDown()

    @async_test
    async def test_should_add_new_interval(self):
        now = datetime(2022, 1, 1, 9, 0)
        await self.playtime.add_new_time(now.timestamp(), (now + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW")

        result = await self.playtime.get_play_time_statistics(now, now)
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

    @async_test
    async def test_should_add_new_interval_to_existing_game(self):
        now = datetime(2022, 1, 1, 9, 0)
        await self.playtime.add_new_time(now.timestamp(), (now + timedelta(hours=1)).timestamp(), "3647351456", "Zelda BOTW")
        await self.playtime.add_new_time((now + timedelta(hours=1)).timestamp(), (now + timedelta(hours=2)).timestamp(), "3647351456", "Zelda BOTW")

        result = await self.playtime.get_play_time_statistics(now.date(), now.date())
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

    @async_test
    async def test_should_split_interval_in_two_day_in_case_night_session(self):
        now = datetime(2022, 1, 1, 23, 0)
        next_day = now + timedelta(hours=2)
        await self.playtime.add_new_time(now.timestamp(), next_day.timestamp(), "100", "Zelda BOTW")

        result = await self.playtime.get_play_time_statistics(now.date(), next_day.date())
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

    @async_test
    async def test_should_sum_totalTime_per_day(self):
        now = datetime(2022, 1, 1, 9, 0)
        await self.playtime.add_new_time(now.timestamp(), (now + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW")
        await self.playtime.add_new_time((now + timedelta(hours=1)).timestamp(), (now + timedelta(hours=1, minutes=30)).timestamp(), "101", "Doom")

        result = await self.playtime.get_play_time_statistics(now.date(), now.date())
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

    @async_test
    async def test_return_only_data_in_requested_interval_without_gaps(self):
        date_01 = datetime(2022, 1, 1, 9, 0)
        await self.playtime.add_new_time(date_01.timestamp(), (date_01 + timedelta(hours=1)).timestamp(), "100", "Zelda BOTW")

        date_02 = datetime(2022, 1, 2, 9, 0)
        await self.playtime.add_new_time(date_02.timestamp(), (date_02 + timedelta(hours=1)).timestamp(), "101", "Doom")

        date_03 = datetime(2022, 1, 3, 9, 0)
        await self.playtime.add_new_time(date_03.timestamp(), (date_03 + timedelta(minutes=30)).timestamp(), "102", "Zelda Minish Cap")

        date_04 = datetime(2022, 1, 4, 9, 0)
        await self.playtime.add_new_time(date_04.timestamp(), (date_04 + timedelta(minutes=30)).timestamp(), "100", "Zelda BOTW")

        date_08 = datetime(2022, 1, 8, 9, 0)

        result = await self.playtime.get_play_time_statistics(date_02.date(), date_08.date())
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


if __name__ == '__main__':
    unittest.main()
