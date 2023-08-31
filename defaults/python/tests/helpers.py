from datetime import datetime
import os
import unittest

from python.db.sqlite_db import SqlLiteDb


class FixedClock:
    def now(self):
        return datetime(2023, 1, 1, 9, 0)


class AbstractDatabaseTest(unittest.TestCase):
    database_file = f"test_db_{os.getpid()}.db"
    database: SqlLiteDb = None

    def setUp(self) -> None:
        if os.path.exists(self.database_file):
            os.remove(self.database_file)
        self.database = SqlLiteDb(self.database_file)
        super().setUp()

    def tearDown(self) -> None:
        if os.path.exists(self.database_file):
            os.remove(self.database_file)
        self.database = None
        super().tearDown()

    if __name__ == '__main__':
        unittest.main()
