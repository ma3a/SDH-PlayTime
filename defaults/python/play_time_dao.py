import contextlib
import datetime
import sqlite3
from typing import List, Tuple


class GameTimeDto:
    def __init__(self, game_id: str, game_name: str, time: int):
        self.game_id = game_id
        self.game_name = game_name
        self.time = time


class DailyGameTimeDto:
    def __init__(self, date: str, game_id: str, game_name: str, time: int):
        self.date = date
        self.game_id = game_id
        self.game_name = game_name
        self.time = time


class PlayTimeDao:
    _database_path: str

    def __init__(self, database_path: str):
        self._database_path = database_path
        self._migrate()

    def save_game_dict(self, game_id: str, game_name: str):
        with self._in_transaction() as con:
            con.execute(
                """
                INSERT INTO game_dict (game_id, name)
                VALUES (:game_id, :game_name)
                ON CONFLICT (game_id) DO UPDATE SET name = :game_name
                WHERE name != :game_name
                """,
                {"game_id": game_id, "game_name": game_name}
            )

    def save_play_time(self, start: datetime.datetime, time_s: int, game_id: str):
        with self._in_transaction() as con:
            con.execute(
                "INSERT INTO play_time(date_time, duration, game_id) VALUES (?,?,?)",
                (start.isoformat(), time_s, game_id)
            )

    def append_overall_time(self, game_id: str, delta_time_s: int):
        with self._in_transaction() as con:
            con.execute(
                """
                INSERT INTO overall_time (game_id, duration)
                VALUES (:game_id, :delta_time_s)
                ON CONFLICT (game_id) DO UPDATE SET duration = duration + :delta_time_s
                """,
                {"game_id": game_id, "delta_time_s": delta_time_s}
            )

    def fetch_overall_playtime(self) -> List[GameTimeDto]:
        with self._connection() as con:
            con.row_factory = lambda c, row: GameTimeDto(
                game_id=row[0], game_name=row[1], time=row[2])
            return con.execute(
                """
                SELECT ot.game_id, gd.name AS game_name, ot.duration
                FROM overall_time ot
                        JOIN game_dict gd ON ot.game_id = gd.game_id
                """
            ).fetchall()

    def fetch_per_day_time_report(self, begin: type[datetime.datetime], end: type[datetime.datetime]) -> List[DailyGameTimeDto]:
        with self._connection() as con:
            con.row_factory = lambda c, row: DailyGameTimeDto(
                date=row[0], game_id=row[1], game_name=row[2], time=row[3])
            return con.execute(
                """
                SELECT STRFTIME('%Y-%m-%d', UNIXEPOCH(date_time), 'unixepoch') AS date,
                    pt.game_id                                                 AS game_id,
                    gd.name                                                    AS game_name,
                    SUM(duration)                                              AS time
                FROM play_time pt
                        LEFT JOIN game_dict gd ON pt.game_id = gd.game_id
                WHERE UNIXEPOCH(date_time) BETWEEN UNIXEPOCH(:begin) AND 
                                                   UNIXEPOCH(:end)

                GROUP BY STRFTIME('%Y-%m-%d', UNIXEPOCH(date), 'unixepoch'), pt.game_id, gd.name;
                """,
                {"begin": begin.isoformat(), "end": end.isoformat()}
            ).fetchall()

    def _current_migration_version(self):
        with self._connection() as con:
            con.execute(
                "CREATE TABLE IF NOT EXISTS migration (id INT PRIMARY KEY);"
            )
            return con.execute(
                "SELECT coalesce(max(id), 0) as max_id FROM migration"
            ).fetchone()[0]

    def _migrate(self):
        version = self._current_migration_version()
        self._migration(
            version,
            [
                (1, [
                    "CREATE TABLE play_time(date_time TEXT, duration INT, game_id TEXT)",
                    "CREATE TABLE overall_time(game_id TEXT PRIMARY KEY, duration INT)",
                    "CREATE TABLE game_dict(game_id TEXT PRIMARY KEY, name TEXT)",
                ]),
                (2, [
                    "CREATE INDEX play_time_date_time_epoch_idx ON play_time(UNIXEPOCH(date_time));",
                    "CREATE INDEX play_time_game_id_idx         ON play_time(game_id);",
                    "CREATE INDEX overall_time_game_id_idx      ON overall_time(game_id);"
                ])
            ]
        )

    def _migration(self, existing_migration_id: int, migrations: List[Tuple[int, List[str]]]):
        for migr in migrations:
            if (migr[0] > existing_migration_id):
                with self._in_transaction() as con:
                    for stm in migr[1]:
                        con.execute(stm)
                    con.execute(
                        "INSERT INTO migration (id) VALUES (?)", [migr[0]])

    @contextlib.contextmanager
    def _in_transaction(self):
        with self._connection() as con:
            yield con
            con.commit()

    def _connection(self):
        return sqlite3.connect(self._database_path)
