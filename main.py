# autopep8: off
import logging
import os
import sys
from pathlib import Path

log_dir = os.environ["DECKY_PLUGIN_LOG_DIR"]
data_dir = os.environ["DECKY_PLUGIN_RUNTIME_DIR"]
plugin_dir = Path(os.environ["DECKY_PLUGIN_DIR"])

logging.basicConfig(filename=f"{log_dir}/decky-playtime.log",
                    format='[Playtime] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def add_plugin_to_path():
    directories = [["./"], ["python"]]
    for dir in directories:
        sys.path.append(str(plugin_dir.joinpath(*dir)))

add_plugin_to_path()

from datetime import datetime
from python.storage import Storage
from python.playtime import PlayTime, DATE_FORMAT

class Plugin:

    playTime = None

    async def on_save_interval(self, started_at, ended_at, game_id, game_name):
        try:
            await self.playTime.add_new_time(
                started_at=started_at,
                ended_at=ended_at,
                game_id=game_id,
                game_name=game_name
            )
        except Exception:
            logger.exception("Unhandled exception")

    async def get_play_time(self, start_date: str, end_date: str):
        logger.info(f"get_play_time start_date = '{start_date}' end_date = '{end_date}'")
        try:
            return await self.playTime.get_play_time_statistics(
                datetime.strptime(start_date, DATE_FORMAT).date(),
                datetime.strptime(end_date, DATE_FORMAT).date(),
            )
        except Exception:
            logger.exception("Unhandled exception")

    async def _main(self):
        try:
            storage = Storage(f"{data_dir}/play_time.json")
            self.playTime = PlayTime(storage)
        except Exception:
            logger.exception("Unhandled exception")

    async def _unload(self):
        logger.info("Unloading play time plugin")
        pass
