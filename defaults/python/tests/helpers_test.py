from datetime import datetime
import unittest

from python.helpers import end_of_day


class TestHelpers(unittest.TestCase):

    def test_should_return_end_of_day(self):
        self.assertEqual(
            end_of_day(datetime(2023, 1, 10, 12, 0, 0, 0)),
            datetime(2023, 1, 10, 23, 59, 59)
        )
