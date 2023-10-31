import base64
import json
from dataclasses import dataclass
import datetime
import logging
from typing import List, Type
from python.db.dao import Dao
from python.db.sqlite_db import SqlLiteDb
from python.db.models import GameAggSessionsDto, PagedAggSessionsDto, SessionDto, SessionsFeedDto
from python.helpers import Clock
from python.models import FeedDirection, FeedRequest

logger = logging.getLogger()


@dataclass
class _Token:
    last_seen: datetime.datetime
    direction: FeedDirection

    def encode(self) -> str:
        return base64.b64encode(
            bytes(json.dumps(
                {
                    "last_seen": self.last_seen.isoformat(),
                    "direction": self.direction.to_str()
                }
            ), "ascii")
        ).decode('ascii')

    @classmethod
    def decode(cls, token_str: str) -> Type["_Token"]:
        decoded = base64.b64decode(token_str)
        data = json.loads(decoded)
        return _Token(
            last_seen=datetime.datetime.fromisoformat(data["last_seen"]),
            direction=FeedDirection.from_str(
                data["direction"])
        )


class StorageService:
    def __init__(self, dao: Dao, db: SqlLiteDb, clock: Clock):
        self._dao = dao
        self._db = db
        self._clock = clock

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
            data = self._dao.fetch_play_times_in_interval(connection, begin, end)
            has_before = self._dao.has_sessions_before(connection, begin)
            has_after = self._dao.has_sessions_after(connection, end)
            return PagedAggSessionsDto(
                data=data, has_next=has_after, has_prev=has_before
            )

    def fetch_overall_playtime(self) -> List[GameAggSessionsDto]:
        with self._db.transactional() as connection:
            return self._dao.fetch_all_games_overall(connection)

    def fetch_sessions_feed(self, request: FeedRequest) -> SessionsFeedDto:
        token = _Token.decode(request.token_str) if request.token_str else self._create_new_token()
        with self._db.transactional() as connection:
            data = self._dao.fetch_sessions(
                connection,
                date_time=token.last_seen,
                direction=token.direction,
                limit=request.limit
            )
            later_token = None
            earlier_token = None
            if len(data) > 0:
                first_record = data[0]
                last_record = data[-1]
                if (self._dao.has_sessions_after(connection, last_record.date_time)):
                    later_token = self._create_encoded_token(last_record, FeedDirection.UP)
                if (self._dao.has_sessions_before(connection, first_record.date_time)):
                    earlier_token = self._create_encoded_token(first_record, FeedDirection.DOWN)
            return SessionsFeedDto(
                data=data,
                earlier_token=earlier_token,
                later_token=later_token
            )

    def _create_new_token(self) -> _Token:
        return _Token(last_seen=self._clock.now(), direction=FeedDirection.UP)

    def _create_encoded_token(self, session: SessionDto, direction: FeedDirection) -> str:
        return _Token(last_seen=session.date_time, direction=direction).encode()
