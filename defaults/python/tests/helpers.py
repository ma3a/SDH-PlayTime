import contextlib
from datetime import datetime, timedelta
import os
import sqlite3
from typing import ContextManager
import unittest

from python.db.sqlite_db import SqlLiteDb
from python.helpers import Clock

NOW = datetime(2023, 1, 1, 0, 0)


class FixedClock(Clock):
    def now(self) -> datetime:
        return NOW

    def now_with_delta(self, delta: timedelta) -> datetime:
        return NOW + delta

    def now_at_time(self, hour: int, minute: int) -> datetime:
        return datetime(NOW.year, NOW.month, NOW.day, hour, minute, 0, 0)


clock = FixedClock()


class FakeConnection(sqlite3.Connection):
    def __init__(self):
        pass


mock_connection = FakeConnection


class MockSqliteDb(SqlLiteDb):
    def __init__(self):
        pass

    @contextlib.contextmanager
    def transactional(self) -> ContextManager[sqlite3.Connection]:
        connection = mock_connection
        yield connection


class AbstractTest(unittest.TestCase):
    def setUp(self) -> None:
        self.maxDiff = None
        return super().setUp()
    if __name__ == '__main__':
        unittest.main()


class AbstractDatabaseTest(AbstractTest):
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
