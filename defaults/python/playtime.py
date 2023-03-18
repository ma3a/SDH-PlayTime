from datetime import timedelta
from datetime import datetime, date, time, timedelta
import logging
from typing import Dict, List
from play_time_dao import DailyGameTimeDto, PlayTimeDao
import json


DATE_FORMAT = "%Y-%m-%d"
logger = logging.getLogger()


class PlayTime:
    dao: PlayTimeDao

    def __init__(self, dao: PlayTimeDao) -> None:
        self.dao = dao

    def get_overall_time_statistics_games(self) -> Dict[str, int]:
        data = self.dao.fetch_overall_playtime()
        result = {}
        for d in data:
            result[d.game_id] = d.time
        return result

    def get_play_time_statistics(self, start: date, end: date):
        start_time = datetime.combine(
            start, time(00, 00, 00))
        end_time = datetime.combine(
            end, time(23, 59, 59, 999999))
        data = self.dao.fetch_per_day_time_report(start_time, end_time)

        data_as_dict: Dict[str, List[DailyGameTimeDto]] = {}
        for d in data:
            if d.date in data_as_dict:
                data_as_dict[d.date].append(d)
            else:
                data_as_dict[d.date] = [d]

        result = []
        date_range = date_range_list(start, end)
        for day in date_range:
            date_str = day.strftime(DATE_FORMAT)
            if (date_str in data_as_dict):
                games = []
                total_time = 0
                for el in data_as_dict[date_str]:
                    games.append({
                        "gameId": el.game_id,
                        "gameName": el.game_name,
                        "time": el.time
                    })
                    total_time += el.time
                result.append({
                    "date": date_str,
                    "games": games,
                    "totalTime": total_time
                })
            else:
                result.append({
                    "date": date_str,
                    "games": [],
                    "totalTime": 0
                })

        return result

    def get_all_play_time_statistics(self):
        data = self.dao.fetch_overall_playtime()
        games = []
        total_time = 0
        for g in data:
            total_time += g.time
            games.append({
                "gameId": g.game_id,
                "gameName": g.game_name,
                "time": g.time
            })
        return [{
            "date": "2999-01-01",
            "games": games,
            "totalTime": total_time

        }]

    def add_new_time(self, started_at: int, ended_at: int, game_id: str, game_name: str):
        self.dao.save_game_dict(game_id, game_name)
        day_end_for_start_at = timestamp_of_end_of_day(
            datetime.fromtimestamp(started_at))
        intervals = []
        if (started_at < day_end_for_start_at and ended_at > day_end_for_start_at):
            intervals.append(
                (started_at, day_end_for_start_at + 1, game_id, game_name))
            intervals.append(
                (day_end_for_start_at + 1, ended_at, game_id, game_name))
        else:
            intervals.append(
                (started_at, ended_at, game_id, game_name))

        for interval in intervals:
            (i_started_at, i_ended_at, i_game_id, i_game_name) = interval
            length = i_ended_at - i_started_at
            self.dao.save_play_time(datetime.fromtimestamp(
                i_started_at), length, i_game_id)
            self.dao.append_overall_time(i_game_id, length)

    def add_migrated_time(self, date: datetime, length: int, game_id: str, game_name: str, migrated: str):
        self.dao.save_game_dict(game_id, game_name)
        self.dao.save_migrated_play_time(date, length, game_id, migrated)
        self.dao.append_overall_time(game_id, length)

    def is_already_migrated(self, game_id: str, migrated: str) -> bool:
        return self.dao.is_migrated_for_game(game_id=game_id, migrated=migrated)

    def migrate_from_old_storage(self, data: str):
        data_dict = json.loads(data)["data"]
        for date_str in data_dict:
            date_time = datetime.combine(
                datetime.strptime(date_str, DATE_FORMAT).date(), time(0, 0)
            )
            for game_id in data_dict[date_str]:
                played_time = int(data_dict[date_str][game_id]["time"])
                game_name = data_dict[date_str][game_id]["name"]
                self.add_new_time(
                    date_time.timestamp(),
                    date_time.timestamp() + played_time,
                    game_id,
                    game_name
                )


def timestamp_of_end_of_day(day_to_end):
    result = datetime.combine(
        day_to_end + timedelta(days=1), datetime.min.time()
    )
    return int(result.timestamp()) - 1


def date_range_list(start_date, end_date):
    # Return list of datetime.date objects (inclusive) between start_date and end_date (inclusive).
    date_list = []
    curr_date = start_date
    while curr_date <= end_date:
        date_list.append(curr_date)
        curr_date += timedelta(days=1)
    return date_list
