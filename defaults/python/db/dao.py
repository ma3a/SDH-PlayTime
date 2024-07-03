from dataclasses import dataclass
import datetime
import logging
import sqlite3
from typing import List

from python.db.sqlite_db import SqlLiteDb

logger = logging.getLogger()


@dataclass
class GameTimeDto:
    game_id: str
    game_name: str
    time: int


@dataclass
class DailyGameTimeDto:
    date: str
    game_id: str
    game_name: str
    time: int


class Dao:
    def __init__(self, db: SqlLiteDb):
        self._db = db

    def save_game_dict(
            self,
            game_id: str,
            game_name: str) -> None:
        with self._db.transactional() as connection:
            self._save_game_dict(connection, game_id, game_name)

    def save_play_time(
            self,
            start: datetime.datetime,
            time_s: int,
            game_id: str,
            source: str = None) -> None:
        with self._db.transactional() as connection:
            self._save_play_time(connection, start, time_s, game_id, source)

    def apply_manual_time_for_game(
        self,
        create_at: datetime.datetime,
        game_id: str,
        game_name: str,
        new_overall_time: int,
        source: str
    ) -> None:
        with self._db.transactional() as connection:
            self._save_game_dict(connection, game_id, game_name)
            current_time = connection.execute(
                "SELECT sum(duration) FROM play_time WHERE game_id = ?",
                (game_id,)
            ).fetchone()[0]
            delta_time = new_overall_time - \
                (current_time if current_time is not None else 0)
            if delta_time != 0:
                self._save_play_time(
                    connection, create_at, delta_time, game_id, source
                )

    def fetch_per_day_time_report(
        self,
        begin: type[datetime.datetime],
        end: type[datetime.datetime]
    ) -> List[DailyGameTimeDto]:
        with self._db.transactional() as connection:
            return self._fetch_per_day_time_report(connection, begin, end)

    def is_there_is_data_before(
        self, date: type[datetime.datetime]
    ) -> bool:
        with self._db.transactional() as connection:
            return self._is_there_is_data_before(connection, date)

    def is_there_is_data_after(
        self, date: type[datetime.datetime]
    ) -> bool:
        with self._db.transactional() as connection:
            return self._is_there_is_data_after(connection, date)

    def _is_there_is_data_before(
        self,
        connection: sqlite3.Connection,
        date: type[datetime.datetime]
    ) -> bool:
        return connection.execute(
            """
                SELECT count(1) FROM play_time
                WHERE date_time < ?
            """,
            (date.isoformat(),)
        ).fetchone()[0] > 0

    def _is_there_is_data_after(
        self,
        connection: sqlite3.Connection,
        date: type[datetime.datetime]
    ) -> bool:
        return connection.execute(
            """
                SELECT count(1) FROM play_time
                WHERE date_time > ?
            """,
            (date.isoformat(),)
        ).fetchone()[0] > 0

    def _save_game_dict(
            self,
            connection: sqlite3.Connection,
            game_id: str,
            game_name: str):
        connection.execute(
            """
                INSERT INTO game_dict (game_id, name)
                VALUES (:game_id, :game_name)
                ON CONFLICT (game_id) DO UPDATE SET name = :game_name
                WHERE name != :game_name
                """,
            {"game_id": game_id, "game_name": game_name}
        )

    def fetch_overall_playtime(self) -> List[GameTimeDto]:
        with self._db.transactional() as connection:
            return self._fetch_overall_playtime(connection)

    def _save_play_time(
            self,
            connection: sqlite3.Connection,
            start: datetime.datetime,
            time_s: int,
            game_id: str,
            source: str = None):
        connection.execute(
            """
                INSERT INTO play_time(date_time, duration, game_id, migrated)
                VALUES (?,?,?,?)
                """,
            (start.isoformat(), time_s, game_id, source)
        )
        self._append_overall_time(connection, game_id, time_s)

    def _append_overall_time(
            self,
            connection: sqlite3.Connection,
            game_id: str,
            delta_time_s: int):
        connection.execute(
            """
                INSERT INTO overall_time (game_id, duration)
                VALUES (:game_id, :delta_time_s)
                ON CONFLICT (game_id)
                    DO UPDATE SET duration = duration + :delta_time_s
            """,
            {"game_id": game_id, "delta_time_s": delta_time_s}
        )

    def _fetch_overall_playtime(
        self,
        connection: sqlite3.Connection,
    ) -> List[GameTimeDto]:
        connection.row_factory = lambda c, row: GameTimeDto(
            game_id=row[0], game_name=row[1], time=row[2])
        return connection.execute(
            """
                SELECT ot.game_id, gd.name AS game_name, ot.duration
                FROM overall_time ot
                        JOIN game_dict gd ON ot.game_id = gd.game_id
            """
        ).fetchall()

    def _fetch_per_day_time_report(
        self,
        connection: sqlite3.Connection,
        begin: type[datetime.datetime],
        end: type[datetime.datetime]
    ) -> List[DailyGameTimeDto]:
        connection.row_factory = lambda c, row: DailyGameTimeDto(
            date=row[0], game_id=row[1], game_name=row[2], time=row[3])
        result = connection.execute(
            """
                SELECT STRFTIME('%Y-%m-%d', STRFTIME('%s', date_time), 'unixepoch') as date,
                    pt.game_id as game_id,
                    gd.name as game_name,
                    SUM(duration) as total_time,
                    duration as total_time
                FROM play_time pt
                        LEFT JOIN game_dict gd ON pt.game_id = gd.game_id
                WHERE STRFTIME('%s', date_time) BETWEEN STRFTIME('%s', :begin) AND
                    STRFTIME('%s', :end)
                AND migrated IS NULL

                GROUP BY STRFTIME('%Y-%m-%d', STRFTIME('%s', date_time), 'unixepoch'),
                         pt.game_id,
                         gd.name
            """,
            {"begin": begin.isoformat(), "end": end.isoformat()}
        ).fetchall()
        return result
