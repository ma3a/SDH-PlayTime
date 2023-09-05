from datetime import datetime
import unittest

from python.helpers import next_day_at_midnight


class TestHelpers(unittest.TestCase):

    def test_calc_next_day_at_midnight(self):
        self.assertEqual(
            next_day_at_midnight(datetime(2023, 1, 10, 12, 0, 0, 0)),
            datetime(2023, 1, 11, 0, 0)
        )
