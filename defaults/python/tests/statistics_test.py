from datetime import datetime, timedelta
from unittest.mock import Mock
from python.db.models import DailyAggSessionDto, PagedAggSessionsDto
from python.db.service import StorageService
from python.models import DayStatistics, Game, GameWithTime, PagedDayStatistics
from python.statistics import Statistics
from python.tests.helpers import AbstractTest, clock


class TestStatistics(AbstractTest):
    def setUp(self) -> None:
        self.service_mock = Mock(spec=StorageService)
        self.statistics = Statistics(self.service_mock)

    def test_daily_statistics_for_period(self):
        # given
        today = clock.now().date()
        next_day = clock.now_with_delta(timedelta(days=1)).date()
        self.service_mock.fetch_agg_per_day_report.return_value = PagedAggSessionsDto(
            data=[
                DailyAggSessionDto(today.isoformat(), "game_id_1", "game_name_1", 60),
                DailyAggSessionDto(today.isoformat(), "game_id_2", "game_name_2", 60),
                DailyAggSessionDto(next_day.isoformat(), "game_id_2", "game_name_2", 60),
            ],
            has_next=False,
            has_prev=True
        )

        # when
        result = self.statistics.daily_statistics_for_period(today, next_day)

        # expect
        self.service_mock.fetch_agg_per_day_report.assert_called_once_with(
            datetime.combine(today, datetime.min.time()),
            datetime.combine(next_day, datetime.max.time())
        )
        self.assertEqual(result, PagedDayStatistics(
            data=[
                DayStatistics(
                    date=today.isoformat(),
                    games=[
                        GameWithTime(game=Game(id="game_id_1", name="game_name_1"), time=60),
                        GameWithTime(game=Game(id="game_id_2", name="game_name_2"), time=60)
                    ],
                    total=120
                ),
                DayStatistics(
                    date=next_day.isoformat(),
                    games=[
                        GameWithTime(game=Game(id="game_id_2", name="game_name_2"), time=60)
                    ],
                    total=60
                )
            ],
            hasNext=False,
            hasPrev=True
        ))

    def test_there_is_an_empty_entries_if_no_data_for_day_in_daily_statistics(self):
        # given
        day_01 = clock.now().date()
        day_02 = clock.now_with_delta(timedelta(days=1)).date()
        day_03 = clock.now_with_delta(timedelta(days=2)).date()
        day_04 = clock.now_with_delta(timedelta(days=3)).date()
        self.service_mock.fetch_agg_per_day_report.return_value = PagedAggSessionsDto(
            data=[
                DailyAggSessionDto(day_02.isoformat(), "game_id_1", "game_name_1", 60),
            ],
            has_next=False,
            has_prev=True
        )

        # when
        result = self.statistics.daily_statistics_for_period(day_01, day_04)

        # expect
        self.service_mock.fetch_agg_per_day_report.assert_called_once_with(
            datetime.combine(day_01, datetime.min.time()),
            datetime.combine(day_04, datetime.max.time())
        )
        self.assertEqual(result, PagedDayStatistics(
            data=[
                DayStatistics(date=day_01.isoformat(), games=[], total=0),
                DayStatistics(
                    date=day_02.isoformat(),
                    games=[
                        GameWithTime(game=Game(id="game_id_1", name="game_name_1"), time=60),
                    ],
                    total=60
                ),
                DayStatistics(date=day_03.isoformat(), games=[], total=0),
                DayStatistics(date=day_04.isoformat(), games=[], total=0),
            ],
            hasNext=False,
            hasPrev=True
        ))
