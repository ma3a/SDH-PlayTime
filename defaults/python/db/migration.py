from dataclasses import dataclass
from typing import List
from python.db.sqlite_db import SqlLiteDb


@dataclass
class Migration:
    version: int
    statements: List[str]


_migrations = [
    Migration(1, [
        """
        CREATE TABLE play_time(
            date_time TEXT,
            duration INT,
            game_id TEXT
        )
        """,
        """
        CREATE TABLE overall_time(
            game_id TEXT PRIMARY KEY,
            duration INT
        )
        """,
        """
        CREATE TABLE game_dict(
            game_id TEXT PRIMARY KEY,
            name TEXT
        )
        """
    ]),
    Migration(2, [
        """
        CREATE INDEX play_time_date_time_epoch_idx
            ON play_time(STRFTIME('%s', date_time))
        """,
        """
        CREATE INDEX play_time_game_id_idx
            ON play_time(game_id)
        """,
        """
        CREATE INDEX overall_time_game_id_idx
            ON overall_time(game_id)
        """
    ]),
    Migration(3, [
        "ALTER TABLE play_time ADD COLUMN migrated TEXT"
    ]),
    Migration(4, [
        """
        DROP INDEX play_time_date_time_epoch_idx
        """,
        """
        CREATE INDEX play_time_date_time_epoch_idx
            ON play_time(STRFTIME('%s', date_time))
        """
    ]),
]


class DbMigration:
    def __init__(self, db: SqlLiteDb):
        self.db = db

    def _current_migration_version(self):
        with self.db.transactional() as con:
            con.execute(
                "CREATE TABLE IF NOT EXISTS migration (id INT PRIMARY KEY);"
            )
            return con.execute(
                "SELECT coalesce(max(id), 0) as max_id FROM migration"
            ).fetchone()[0]

    def _migration(self, migration: Migration):
        version = self._current_migration_version()
        latest_version_in_migration = max(_migrations, key=lambda m: m.version).version

        if (latest_version_in_migration < version):
            raise Exception(
                "Database have been updated with latest version. Please update plugin")

        if migration.version > version:
            with self.db.transactional() as con:
                for stm in migration.statements:
                    con.execute(stm)
                con.execute(
                    "INSERT INTO migration (id) VALUES (?)",
                    [migration.version]
                )

    def migrate(self):
        for migration in _migrations:
            self._migration(migration)
