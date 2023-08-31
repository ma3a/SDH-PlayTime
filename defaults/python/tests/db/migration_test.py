import sqlite3
from python.db.migration import DbMigration
from python.tests.helpers import AbstractDatabaseTest


class TestDbMigration(AbstractDatabaseTest):

    def get_migration(self):
        return DbMigration(self.database)

    def test_database_schema(self):
        self.get_migration().migrate()
        self.assertEqual(
            self._get_table_meta('play_time'),
            [
                (0, 'date_time', 'TEXT', 0, None, 0, 0),
                (1, 'duration', 'INT', 0, None, 0, 0),
                (2, 'game_id', 'TEXT', 0, None, 0, 0),
                (3, 'migrated', 'TEXT', 0, None, 0, 0)
            ]
        )
        self.assertEqual(
            self._get_table_meta('game_dict'),
            [
                (0, 'game_id', 'TEXT', 0, None, 1, 0),
                (1, 'name', 'TEXT', 0, None, 0, 0)
            ]
        )
        self.assertEqual(
            self._get_table_meta('overall_time'),
            [
                (0, 'game_id', 'TEXT', 0, None, 1, 0),
                (1, 'duration', 'INT', 0, None, 0, 0)
            ]
        )
        # TODO Check indexes as well

    def _get_table_meta(self, table: str):
        with sqlite3.connect(self.database_file) as connection:
            return connection.execute(
                f"PRAGMA table_xinfo({table})"
            ).fetchall()

    def test_should_fail_migration_if_application_older_then_database(self):
        with sqlite3.connect(self.database_file) as connection:
            connection.execute(
                "CREATE TABLE IF NOT EXISTS migration (id INT PRIMARY KEY)"
            )
            connection.execute(
                "INSERT INTO MIGRATION (id) VALUES (999999)"
            )
        try:
            self.get_migration().migrate()
        except Exception as e:
            self.assertEqual(
                str(e),
                "Database have been updated with latest version. Please update plugin"
            )
