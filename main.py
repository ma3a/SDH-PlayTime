# autopep8: off
import dataclasses
from datetime import datetime
import logging
import os
import sys
from pathlib import Path
from typing import Any, List


decky_home = os.environ["DECKY_HOME"]
log_dir = os.environ["DECKY_PLUGIN_LOG_DIR"]
data_dir = os.environ["DECKY_PLUGIN_RUNTIME_DIR"]
plugin_dir = Path(os.environ["DECKY_PLUGIN_DIR"])

logging.basicConfig(
    filename=f"{log_dir}/decky-playtime.log",
    format='[Playtime] %(asctime)s %(levelname)s %(message)s',
    filemode='w+',
    force=True
)
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def add_plugin_to_path():
    directories = [["./"], ["python"]]
    for import_dir in directories:
        sys.path.append(str(plugin_dir.joinpath(*import_dir)))


add_plugin_to_path()
# pylint: disable=wrong-import-position
from python.db.sqlite_db import SqlLiteDb
from python.db.dao import Dao
from python.db.migration import DbMigration
from python.statistics import Statistics
from python.time_tracking import TimeTracking
from python.helpers import parse_date
# pylint: enable=wrong-import-position

# autopep8: on


class Plugin:
    time_tracking = None
    statistics = None

    async def _main(self):
        try:
            db = SqlLiteDb(f"{data_dir}/storage.db")
            migration = DbMigration(db)
            migration.migrate()

            dao = Dao(db)
            self.time_tracking = TimeTracking(dao)
            self.statistics = Statistics(dao)
        except Exception:
            logger.exception("Unhandled exception")

    async def add_time(self,
                       started_at: int,
                       ended_at: int,
                       game_id: str,
                       game_name: str):
        try:
            self.time_tracking.add_time(
                started=datetime.fromtimestamp(started_at),
                ended=datetime.fromtimestamp(ended_at),
                game_id=game_id,
                game_name=game_name
            )
        except Exception:
            logger.exception("Unhandled exception")

    async def daily_statistics_for_period(self, start_date: str, end_date: str):
        try:
            return dataclasses.asdict(
                self.statistics.daily_statistics_for_period(
                    parse_date(start_date),
                    parse_date(end_date))
            )
        except Exception:
            logger.exception("Unhandled exception")

    async def per_game_overall_statistics(self):
        try:
            return self.statistics.per_game_overall_statistic()
        except Exception:
            logger.exception("Unhandled exception")

    async def apply_manual_time_correction(
            self, list_of_game_stats: List[dict[str, Any]]):
        try:
            return self.time_tracking.apply_manual_time_for_games(
                list_of_game_stats=list_of_game_stats,
                source="manually-changed")
        except Exception:
            logger.exception("Unhandled exception")
