import datetime
import logging
from typing import List
from python.db.dao import Dao
from python.db.sqlite_db import SqlLiteDb
from python.db.models import GameAggSessionsDto, PagedAggSessionsDto

logger = logging.getLogger()


class StorageService:
    def __init__(self, dao: Dao, db: SqlLiteDb):
        self._dao = dao
        self._db = db

    def save_play_time(
            self,
            start: datetime.datetime,
            duration: int,
            game_id: str,
            game_name: str) -> None:
        with self._db.transactional() as connection:
            self._dao.save_game_info(connection, game_id, game_name)
            self._dao.save_play_time(connection,
                                     start,
                                     duration,
                                     game_id,
                                     None)
            self._dao.add_overall_time(connection, game_id, duration)

    def apply_manual_time_for_game(
        self,
        create_at: datetime.datetime,
        game_id: str,
        desired_overall_time: int,
        migration_source: str
    ) -> None:
        with self._db.transactional() as connection:
            current_time = self._dao.calc_playtime_for_game(
                connection, game_id)
            # Could be negative as well
            delta_duration = desired_overall_time - \
                (current_time if current_time is not None else 0)
            if delta_duration != 0:
                self._dao.save_play_time(
                    connection, create_at, delta_duration, game_id, migration_source)
                self._dao.add_overall_time(
                    connection, game_id, delta_duration)

    def fetch_agg_per_day_report(
        self,
        begin: type[datetime.datetime],
        end: type[datetime.datetime]
    ) -> PagedAggSessionsDto:
        with self._db.transactional() as connection:
            data = self._dao.fetch_play_times_in_interval(
                connection, begin, end)
            has_before = self._dao.has_sessions_before(connection, begin)
            has_after = self._dao.has_sessions_after(connection, end)
            return PagedAggSessionsDto(
                data=data, has_next=has_after, has_prev=has_before
            )

    def fetch_overall_playtime(self) -> List[GameAggSessionsDto]:
        with self._db.transactional() as connection:
            return self._dao.fetch_all_games_overall(connection)
