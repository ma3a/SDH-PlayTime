from datetime import datetime, time, timedelta
from unittest.mock import Mock, call

from python.db.service import StorageService
from python.tests.helpers import AbstractTest, clock
from python.time_tracking import TimeTracking


class TestTimeTracking(AbstractTest):

    def setUp(self) -> None:
        self.service_mock = Mock(spec=StorageService)
        self.time_tracking = TimeTracking(self.service_mock)

    def test_should_add_new_interval(self):
        start = clock.now_at_time(9, 0)
        end = (clock.now_at_time(9, 0) + timedelta(hours=1))
        # when
        self.time_tracking.add_time(
            start,
            end,
            "game_id",
            "game_name")
        # then
        self.service_mock.save_play_time.assert_called_once_with(
            start, 3600.0, "game_id", "game_name")

    def test_should_split_interval_at_midnight(self):
        start = clock.now_at_time(23, 0)
        end = clock.now_at_time(23, 0) + timedelta(hours=2)
        end_start_of_day = datetime.combine(end, time(0, 0))
        # when
        self.time_tracking.add_time(
            start,
            end,
            "game_id",
            "game_name")
        # then
        self.service_mock.save_play_time.assert_has_calls(
            [
                call(start, 3600.0, "game_id", "game_name"),
                call(end_start_of_day, 3600.0, "game_id", "game_name")
            ]
        )
