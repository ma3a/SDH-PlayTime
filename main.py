# autopep8: off
import logging
import os
import sys
from pathlib import Path

decky_home = os.environ["DECKY_HOME"]
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
from python.play_time_dao import PlayTimeDao
from python.playtime import PlayTime, DATE_FORMAT
from python.external_migrations import ExternalMigrations


class Plugin:
    playTime = None
    external_migrations = None

    async def on_save_interval(self, started_at, ended_at, game_id, game_name):
        try:
            self.playTime.add_new_time(
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
            return self.playTime.get_play_time_statistics(
                    datetime.strptime(start_date, DATE_FORMAT).date(),
                    datetime.strptime(end_date, DATE_FORMAT).date(),
            )
        except Exception:
            logger.exception("Unhandled exception")

    async def get_all_play_time(self):
        logger.info(f"get_all_play_time")
        try:
            return self.playTime.get_all_play_time_statistics()
        except Exception:
            logger.exception("Unhandled exception")

    async def get_overall_times(self):
        logger.info(f"get_overall_time")
        try:
            return self.playTime.get_overall_time_statistics_games()
        except Exception:
            logger.exception("Unhandled exception")

    async def migrate_data_from_steamless_time(self, association):
        logger.info(f"Migration started")
        try:
            files = [
                f"{decky_home}/settings/steamlesstimes.json",
                f"{decky_home}/settings/metadeck.json"
            ]

            available_files = list(filter(lambda it: os.path.exists(it), files))
            if len(available_files) == 0:
                file_list_str = ", ".join(files)
                return self.external_migrations.critical_error(
                    f"Unable to find SteamlessTimes or Metadeck data in '{file_list_str}'. Please check that any of the file exists"
                )

            latest_file = sorted(available_files, key =lambda it: -os.stat(it).st_mtime)[0]
            logger.info(f"Reading {latest_file} as latest modified file")
            steamless_time_data = open(latest_file, "r").read()
            result = self.external_migrations.migrate_from_steamless_time(
                associations=association,
                file_content=steamless_time_data,
                migrated_from=latest_file
            )
            errors_new_line = "\n".join(result["errors"])
            logger.info(f"Migration finished with {result} \n {errors_new_line}")
            return result

        except Exception:
            logging.exception("Unhandled exception")
            return self.external_migrations.critical_error(
                f"Unexpected error: {Exception}, please check logs, and let developers know about it"
            )

    async def _main(self):
        try:
            dao = PlayTimeDao(f"{data_dir}/storage.db")
            self.playTime = PlayTime(dao)
            self.external_migrations = ExternalMigrations(self.playTime)

            prev_storage_path = f"{data_dir}/detailed_storage.json"
            if os.path.exists(prev_storage_path):
                old_data = open(prev_storage_path, "r").read()
                self.playTime.migrate_from_old_storage(old_data)
                os.rename(prev_storage_path, f"{prev_storage_path}.migrated")

        except Exception:
            logger.exception("Unhandled exception")

    async def _unload(self):
        logger.info("Unloading play time plugin")
        pass
