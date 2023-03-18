import json
import logging
import os
from typing import List

logger = logging.getLogger()


class ExternalTimeTracker:

    def _get_latest_steamless_or_metadeck_file(self, files: List[str]) -> str:
        available_files = list(
            filter(lambda it: os.path.exists(it), files))

        latest_file = sorted(
            available_files, key=lambda it: -os.stat(it).st_mtime)[0]
        logger.info(f"Reading {latest_file} as latest modified file")
        return latest_file

    def get_games_in_steamless_time(self, decky_home) -> dict[str, int]:
        files = [
            f"{decky_home}/settings/steamlesstimes.json",
            f"{decky_home}/settings/metadeck.json"
        ]

        playtimes_by_file_dict = {}
        for file in files:
            if os.path.exists(file):
                try:
                    with (open(file, "r")) as f:
                        json_data = json.load(f)
                        playtimes_by_file_dict[file] = json_data["playtimes"]
                except Exception:
                    pass

        if len(playtimes_by_file_dict.keys()) == 0:
            raise Exception(
                "Unable to find SteamlessTimes or Metadeck data. Missing file, or format is invalid")

        if len(playtimes_by_file_dict.keys()) == 1:
            return playtimes_by_file_dict[list(playtimes_by_file_dict.keys())[0]]

        if (len(playtimes_by_file_dict.keys()) == 2):
            steamless_file = self._get_latest_steamless_or_metadeck_file(files)
            return playtimes_by_file_dict[steamless_file]
