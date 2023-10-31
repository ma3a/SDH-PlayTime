from datetime import timedelta
from python.db.dao import Dao
from python.db.migration import DbMigration
from python.db.models import SessionDto
from python.models import FeedDirection
from python.tests.helpers import AbstractDatabaseTest, clock


class TestDao(AbstractDatabaseTest):
    dao: Dao = None

    def setUp(self) -> None:
        super().setUp()
        DbMigration(db=self.database).migrate()
        self.dao = Dao()

    def test_save_game_info(self):
        game_id = "game_id"
        game_name = "game_name"
        with self.database.transactional() as connection:
            self.dao.save_game_info(connection, game_id, game_name)

        with self.database.transactional() as connection:
            res = connection.execute(
                "SELECT game_id, name FROM game_dict WHERE game_id = ?", (game_id,)).fetchall()
            self.assertEqual(len(res), 1)
            self.assertEqual(res[0][0], game_id)
            self.assertEqual(res[0][1], game_name)

    def test_save_game_info_deduplicates(self):
        game_id = "game_id"
        game_name = "game_name"
        game_name_changed = "game_name_changed"
        with self.database.transactional() as connection:
            self.dao.save_game_info(connection, game_id, game_name)
            self.dao.save_game_info(connection, game_id, game_name_changed)

        with self.database.transactional() as connection:
            res = connection.execute(
                "SELECT game_id, name FROM game_dict WHERE game_id = ?", (game_id,)).fetchall()
            self.assertEqual(len(res), 1)
            self.assertEqual(res[0][0], game_id)
            self.assertEqual(res[0][1], game_name_changed)

    def test_save_play_time(self):
        start = clock.now()
        duration = 60
        game_id = "game_id"
        with self.database.transactional() as connection:
            self.dao.save_play_time(connection, start, duration, game_id)

        with self.database.transactional() as connection:
            res = connection.execute(
                "SELECT date_time, duration, game_id, migrated FROM play_time WHERE game_id = ?",
                (game_id,)
            ).fetchall()
            self.assertEqual(len(res), 1)
            self.assertEqual(res[0][0], start.isoformat())
            self.assertEqual(res[0][1], duration)
            self.assertEqual(res[0][2], game_id)
            self.assertEqual(res[0][3], None)

    def test_add_overall_time(self):
        with self.database.transactional() as connection:
            self.dao.add_overall_time(connection, "game_id", 60)

        with self.database.transactional() as connection:
            res = connection.execute(
                "SELECT game_id, duration FROM overall_time WHERE game_id = ?",
                ("game_id",)
            ).fetchall()
            self.assertEqual(len(res), 1)
            self.assertEqual(res[0][0], "game_id")
            self.assertEqual(res[0][1], 60)

    def test_add_overall_sequentially(self):
        with self.database.transactional() as connection:
            self.dao.add_overall_time(connection, "game_id", 60)
            self.dao.add_overall_time(connection, "game_id", 60)

        with self.database.transactional() as connection:
            res = connection.execute(
                "SELECT game_id, duration FROM overall_time WHERE game_id = ?",
                ("game_id",)
            ).fetchall()
            self.assertEqual(len(res), 1)
            self.assertEqual(res[0][0], "game_id")
            self.assertEqual(res[0][1], 120)

    def test_fetch_games_overall(self):
        with self.database.transactional() as connection:
            self.dao.save_game_info(connection, "game_id_1", "game_name_1")
            self.dao.save_game_info(connection, "game_id_2", "game_name_2")
            self.dao.add_overall_time(connection, "game_id_1", 60)
            self.dao.add_overall_time(connection, "game_id_2", 60)

        with self.database.transactional() as connection:
            res = self.dao.fetch_all_games_overall(connection)
            self.assertEqual(len(res), 2)
            self.assertEqual(res[0].game_id, "game_id_1")
            self.assertEqual(res[0].duration, 60)
            self.assertEqual(res[1].game_id, "game_id_2")
            self.assertEqual(res[1].duration, 60)

    def test_calc_playtime_for_game(self):
        with self.database.transactional() as connection:
            self.dao.save_play_time(connection, clock.now(), 60, "game_id")
            self.dao.save_play_time(
                connection,
                clock.now_with_delta(
                    timedelta(
                        minutes=1)),
                60,
                "game_id")

        with self.database.transactional() as connection:
            res = self.dao.calc_playtime_for_game(connection, "game_id")
            self.assertEqual(res, 120)

    def test_has_sessions_before_should_be_true(self):
        with self.database.transactional() as connection:
            self.dao.save_play_time(connection, clock.now(), 60, "game_id")

        with self.database.transactional() as connection:
            res = self.dao.has_sessions_before(
                connection, clock.now_with_delta(timedelta(minutes=10)))
            self.assertEqual(res, True)

    def test_has_sessions_before_should_be_false(self):
        with self.database.transactional() as connection:
            self.dao.save_play_time(
                connection,
                clock.now_with_delta(timedelta(minutes=10)),
                60,
                "game_id")

        with self.database.transactional() as connection:
            res = self.dao.has_sessions_before(
                connection, clock.now())
            self.assertEqual(res, False)

    def test_has_sessions_after_should_be_true(self):
        with self.database.transactional() as connection:
            self.dao.save_play_time(
                connection,
                clock.now_with_delta(timedelta(minutes=10)),
                60,
                "game_id")

        with self.database.transactional() as connection:
            res = self.dao.has_sessions_after(
                connection, clock.now())
            self.assertEqual(res, True)

    def test_has_sessions_after_should_be_false(self):
        with self.database.transactional() as connection:
            self.dao.save_play_time(connection, clock.now(), 60, "game_id")

        with self.database.transactional() as connection:
            res = self.dao.has_sessions_after(
                connection, clock.now_with_delta(timedelta(minutes=10)))
            self.assertEqual(res, False)

    def test_fetch_play_times_in_interval_has_results(self):
        with self.database.transactional() as connection:
            self.dao.save_play_time(
                connection,
                clock.now_with_delta(timedelta(minutes=10)),
                60,
                "game_id")

        with self.database.transactional() as connection:
            res = self.dao.fetch_play_times_in_interval(
                connection,
                clock.now_with_delta(timedelta(minutes=5)),
                clock.now_with_delta(timedelta(minutes=15)))
            self.assertEqual(len(res), 1)
            self.assertEqual(res[0].game_id, "game_id")
            self.assertEqual(res[0].duration, 60)

    def test_fetch_play_times_in_interval_has_no_results(self):
        with self.database.transactional() as connection:
            self.dao.save_play_time(
                connection,
                clock.now_with_delta(timedelta(minutes=5)),
                60,
                "game_id")

        with self.database.transactional() as connection:
            res = self.dao.fetch_play_times_in_interval(
                connection,
                clock.now_with_delta(timedelta(minutes=10)),
                clock.now_with_delta(timedelta(minutes=15)))
            self.assertEqual(len(res), 0)

    def test_fetch_sessions(self):
        time_00 = clock.now_with_delta(timedelta(hours=-1))
        time_01 = clock.now()
        time_02 = clock.now_with_delta(timedelta(hours=1))
        time_03 = clock.now_with_delta(timedelta(hours=2))
        time_04 = clock.now_with_delta(timedelta(hours=3))
        with self.database.transactional() as connection:
            self.dao.save_game_info(connection, "game_id_1", "game_name_1")
            self.dao.save_play_time(connection, time_00, 1, "game_id_1")  # not in range
            self.dao.save_play_time(connection, time_01, 5, "game_id_1")
            self.dao.save_play_time(connection, time_02, 10, "game_id_1")
            self.dao.save_play_time(connection, time_03, 15, "game_id_1")
            self.dao.save_play_time(connection, time_04, 20, "game_id_1")  # not in range

        with self.database.transactional() as connection:
            res = self.dao.fetch_sessions(connection, time_00, 3, FeedDirection.UP)
            self.assertEqual(len(res), 3)
            self.assertEqual(res, [
                SessionDto(date_time=time_01.isoformat(),
                           duration=5,
                           game_id="game_id_1",
                           game_name="game_name_1"
                           ),
                SessionDto(date_time=time_02.isoformat(),
                           duration=10,
                           game_id="game_id_1",
                           game_name="game_name_1"
                           ),
                SessionDto(date_time=time_03.isoformat(),
                           duration=15,
                           game_id="game_id_1",
                           game_name="game_name_1"
                           ),
            ])
