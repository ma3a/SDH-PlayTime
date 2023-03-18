# autopep8: off
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
    for dir in directories:
        sys.path.append(str(plugin_dir.joinpath(*dir)))


add_plugin_to_path()

from datetime import datetime
from python.play_time_dao import PlayTimeDao
from python.playtime import PlayTimeStatistics, PlayTimeTracking, DATE_FORMAT
from python.external_time_tracker import ExternalTimeTracker

# autopep8: on


class Plugin:
    playtime_tracking = None
    playtime_statistics = None
    external_time_tracker = None

    async def _main(self):
        try:
            dao = PlayTimeDao(f"{data_dir}/storage.db")
            self.playtime_tracking = PlayTimeTracking(dao)
            self.playtime_statistics = PlayTimeStatistics(dao)
            self.external_time_tracker = ExternalTimeTracker()
        except Exception:
            logger.exception("Unhandled exception")

    async def add_time(self, started_at, ended_at, game_id, game_name):
        try:
            self.playtime_tracking.add_time(
                started_at=started_at,
                ended_at=ended_at,
                game_id=game_id,
                game_name=game_name
            )
        except Exception:
            logger.exception("Unhandled exception")

    async def daily_statistics_for_period(self, start_date: str, end_date: str):
        try:
            return self.playtime_statistics.daily_statistics_for_period(
                datetime.strptime(start_date, DATE_FORMAT).date(),
                datetime.strptime(end_date, DATE_FORMAT).date()
            )
        except Exception:
            logger.exception("Unhandled exception")

    async def per_game_overall_statistics(self):
        try:
            return self.playtime_statistics.per_game_overall_statistic()
        except Exception:
            logger.exception("Unhandled exception")

    async def steamless_statistics(self):
        try:
            return self.external_time_tracker.get_games_in_steamless_time(
                decky_home=decky_home)
        except Exception:
            logger.exception("Unhandled exception")

    async def apply_manual_time_correction(
            self, list_of_game_stats: List[dict[str, Any]]):
        try:
            return self.playtime_tracking.apply_manual_time_for_games(
                list_of_game_stats=list_of_game_stats,
                source="manually-changed")
        except Exception:
            logger.exception("Unhandled exception")

    async def migrate_from_steam_less_time(
            self, list_of_game_stats: List[dict[str, Any]]):
        try:
            return self.playtime_tracking.apply_manual_time_for_games(
                list_of_game_stats=list_of_game_stats,
                source="steam-less-time")
        except Exception:
            logger.exception("Unhandled exception")

    async def _unload(self):
        logger.info("Unloading play time plugin")
