from datetime import datetime
import logging
from typing import Dict, List
from python.db.service import StorageService
from python.helpers import next_day_at_midnight


DATE_FORMAT = "%Y-%m-%d"
logger = logging.getLogger()


class TimeTracking:
    service: StorageService

    def __init__(self, service: StorageService) -> None:
        self.service = service

    def add_time(self,
                 started: datetime,
                 ended: datetime,
                 game_id: str,
                 game_name: str):
        next_day_midnight = next_day_at_midnight(started)
        if (started < next_day_midnight
                and ended > next_day_midnight):
            self.service.save_play_time(
                started,
                next_day_midnight.timestamp() - started.timestamp(),
                game_id,
                game_name
            )
            self.service.save_play_time(
                next_day_midnight,
                ended.timestamp() - next_day_midnight.timestamp(),
                game_id,
                game_name
            )
        else:
            self.service.save_play_time(
                started,
                ended.timestamp() - started.timestamp(),
                game_id,
                game_name
            )

    def apply_manual_time_for_games(self,
                                    list_of_game_stats: List[Dict],
                                    source: str):
        now = datetime.now()
        for stat in list_of_game_stats:
            self.service.apply_manual_time_for_game(
                now,
                stat["game"]["id"],
                stat["game"]["name"],
                stat["time"],
                source
            )
