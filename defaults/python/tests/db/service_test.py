from datetime import timedelta
from unittest.mock import Mock
from python.db.dao import Dao
from python.db.models import DailyAggSessionDto, GameAggSessionsDto, PagedAggSessionsDto
from python.db.service import StorageService
from python.tests.helpers import AbstractTest, MockSqliteDb, clock, mock_connection


class StorageServiceTest(AbstractTest):

    def setUp(self):
        self.dao_mock = Mock(spec=Dao)
        self.service = StorageService(self.dao_mock, MockSqliteDb())

    def test_save_play_time(self):
        # when
        self.service.save_play_time(clock.now(), 60, "game_id", "game_name")

        # expect
        self.dao_mock.save_game_info.assert_called_once_with(
            mock_connection, "game_id", "game_name"
        )
        self.dao_mock.save_play_time.assert_called_once_with(
            mock_connection, clock.now(), 60, "game_id", None
        )
        self.dao_mock.add_overall_time.assert_called_once_with(
            mock_connection, "game_id", 60
        )

    def test_apply_manual_time_for_game_with_same_desired_time(self):
        # given
        self.dao_mock.calc_playtime_for_game.return_value = 60

        # when
        self.service.apply_manual_time_for_game(clock.now(), "game_id", 60, "migration_source")

        # expect
        self.dao_mock.calc_playtime_for_game.assert_called_once_with(
            mock_connection, "game_id"
        )
        self.assertFalse(self.dao_mock.save_play_time.called)
        self.assertFalse(self.dao_mock.add_overall_time.called)

    def test_apply_manual_time_for_game_with_desired_time(self):
        # given
        self.dao_mock.calc_playtime_for_game.return_value = 60

        # when
        self.service.apply_manual_time_for_game(clock.now(), "game_id", 100, "migration_source")

        # expect
        self.dao_mock.calc_playtime_for_game.assert_called_once_with(
            mock_connection, "game_id"
        )
        self.dao_mock.save_play_time.assert_called_once_with(
            mock_connection, clock.now(), 40, "game_id", "migration_source"
        )
        self.dao_mock.add_overall_time.assert_called_once_with(
            mock_connection, "game_id", 40
        )

    def test_fetch_overall_playtime(self):
        # given
        result = [
            GameAggSessionsDto("game_id", "game_name", 60)
        ]
        self.dao_mock.fetch_all_games_overall.return_value = result

        # when
        service_res = self.service.fetch_overall_playtime()

        # expect
        self.assertEqual(service_res, result)
        self.dao_mock.fetch_all_games_overall.assert_called_once_with(
            mock_connection
        )

    def test_fetch_agg_per_day_report(self):
        # given
        sessions = [
            DailyAggSessionDto(
                date=clock.now().date().isoformat(),
                game_id="game_id",
                game_name="game_name",
                duration=60),
        ]
        self.dao_mock.fetch_play_times_in_interval.return_value = sessions
        self.dao_mock.has_sessions_before.return_value = True
        self.dao_mock.has_sessions_after.return_value = False

        # when
        service_res = self.service.fetch_agg_per_day_report(
            clock.now(), clock.now_with_delta(timedelta(days=1)))

        # expect
        self.assertEqual(service_res, PagedAggSessionsDto(sessions, has_next=False, has_prev=True))
        self.dao_mock.fetch_play_times_in_interval.assert_called_once_with(
            mock_connection, clock.now(), clock.now_with_delta(timedelta(days=1))
        )
        self.dao_mock.has_sessions_before.assert_called_once_with(
            mock_connection, clock.now()
        )
        self.dao_mock.has_sessions_after.assert_called_once_with(
            mock_connection, clock.now_with_delta(timedelta(days=1))
        )
