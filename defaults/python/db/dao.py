import datetime
import logging
import sqlite3
from typing import List, Optional
from python.db.models import DailyAggSessionDto, GameAggSessionsDto

logger = logging.getLogger()


class Dao:

    def save_game_info(
            self,
            connection: sqlite3.Connection,
            game_id: str,
            game_name: str) -> None:
        connection.execute(
            """
                INSERT INTO game_dict (game_id, name)
                VALUES (:game_id, :game_name)
                ON CONFLICT (game_id) DO UPDATE SET name = :game_name
                WHERE name != :game_name
            """,
            {"game_id": game_id, "game_name": game_name}
        )

    def save_play_time(
            self,
            connection: sqlite3.Connection,
            start: datetime.datetime,
            duration: int,
            game_id: str,
            migration_source: Optional[str] = None) -> None:
        connection.execute(
            """
                INSERT INTO play_time(date_time, duration, game_id, migrated)
                VALUES (?,?,?,?)
            """,
            (start.isoformat(), duration, game_id, migration_source)
        )

    def calc_playtime_for_game(self, connection: sqlite3.Connection, game_id: str) -> int:
        return connection.execute(
            "SELECT sum(duration) FROM play_time WHERE game_id = ?",
            (game_id,)
        ).fetchone()[0]

    def add_overall_time(
            self,
            connection: sqlite3.Connection,
            game_id: str,
            delta_duration: int) -> None:
        connection.execute(
            """
                INSERT INTO overall_time (game_id, duration)
                VALUES (:game_id, :delta_duration)
                ON CONFLICT (game_id)
                    DO UPDATE SET duration = duration + :delta_duration
            """,
            {"game_id": game_id, "delta_duration": delta_duration}
        )

    def fetch_all_games_overall(
        self,
        connection: sqlite3.Connection,
    ) -> List[GameAggSessionsDto]:
        connection.row_factory = lambda c, row: GameAggSessionsDto(
            game_id=row[0], game_name=row[1], duration=row[2])
        return connection.execute(
            """
                SELECT ot.game_id, gd.name AS game_name, ot.duration
                FROM overall_time ot
                        JOIN game_dict gd ON ot.game_id = gd.game_id
                ORDER by ot.game_id
            """
        ).fetchall()

    def fetch_play_times_in_interval(
        self,
        connection: sqlite3.Connection,
        begin: type[datetime.datetime],
        end: type[datetime.datetime]
    ) -> List[DailyAggSessionDto]:
        connection.row_factory = lambda c, row: DailyAggSessionDto(
            date=row[0], game_id=row[1], game_name=row[2], duration=row[3])
        return connection.execute(
            """
                SELECT STRFTIME('%Y-%m-%d', UNIXEPOCH(date_time), 'unixepoch') as date,
                    pt.game_id as game_id,
                    gd.name as game_name,
                    SUM(duration) as total_time,
                    duration as total_time
                FROM play_time pt
                        LEFT JOIN game_dict gd ON pt.game_id = gd.game_id
                WHERE UNIXEPOCH(date_time) BETWEEN UNIXEPOCH(:begin) AND
                    UNIXEPOCH(:end)
                AND migrated IS NULL

                GROUP BY date,
                         pt.game_id,
                         gd.name
                ORDER by date
            """,
            {"begin": begin.isoformat(), "end": end.isoformat()}
        ).fetchall()

    def has_sessions_before(
        self,
        connection: sqlite3.Connection,
        date: type[datetime.datetime]
    ) -> bool:
        return connection.execute(
            """
                SELECT count(1) FROM play_time
                WHERE UNIXEPOCH(date_time) < UNIXEPOCH(?)
            """,
            (date.isoformat(),)
        ).fetchone()[0] > 0

    def has_sessions_after(
        self,
        connection: sqlite3.Connection,
        date: type[datetime.datetime]
    ) -> bool:
        return connection.execute(
            """
                SELECT count(1) FROM play_time
                WHERE UNIXEPOCH(date_time) > UNIXEPOCH(?)
            """,
            (date.isoformat(),)
        ).fetchone()[0] > 0
