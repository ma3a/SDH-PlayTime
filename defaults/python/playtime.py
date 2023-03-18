from datetime import datetime, date, time, timedelta
import logging
from typing import Dict, List
from play_time_dao import DailyGameTimeDto, PlayTimeDao


DATE_FORMAT = "%Y-%m-%d"
logger = logging.getLogger()


class PlayTimeStatistics:
    dao: PlayTimeDao

    def __init__(self, dao: PlayTimeDao) -> None:
        self.dao = dao

    def daily_statistics_for_period(self, start: date, end: date):
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
        date_range = self._date_range_list(start, end)
        for day in date_range:
            date_str = day.strftime(DATE_FORMAT)
            if (date_str in data_as_dict):
                games = []
                total_time = 0
                for el in data_as_dict[date_str]:
                    games.append({
                        "game": {
                            "id": el.game_id,
                            "name": el.game_name
                        },
                        "time": el.time
                    })
                    total_time += el.time
                result.append({
                    "date": date_str,
                    "games": games,
                    "total": total_time
                })
            else:
                result.append({
                    "date": date_str,
                    "games": [],
                    "total": 0
                })
        return {
            "data": result,
            "hasPrev": self.dao.is_there_is_data_before(start_time),
            "hasNext": self.dao.is_there_is_data_after(end_time)
        }

    def per_game_overall_statistic(self):
        data = self.dao.fetch_overall_playtime()
        games = []
        for g in data:
            games.append({
                "game": {
                    "id": g.game_id,
                    "name": g.game_name
                },
                "time": g.time
            })
        return games

    def _date_range_list(self, start_date, end_date):
        date_list = []
        curr_date = start_date
        while curr_date <= end_date:
            date_list.append(curr_date)
            curr_date += timedelta(days=1)
        return date_list


class PlayTimeTracking:
    dao: PlayTimeDao

    def __init__(self, dao: PlayTimeDao) -> None:
        self.dao = dao

    def add_time(
            self, started_at: int, ended_at: int, game_id: str, game_name: str):
        self.dao.save_game_dict(game_id, game_name)
        day_end_for_start_at = self._timestamp_of_end_of_day(
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
            (i_started_at, i_ended_at, i_game_id, _) = interval
            length = i_ended_at - i_started_at
            self.dao.save_play_time(datetime.fromtimestamp(
                i_started_at), length, i_game_id)

    def apply_manual_time_for_games(
            self, list_of_game_stats: List[Dict], source: str):
        now = datetime.now()
        for stat in list_of_game_stats:
            self.dao.apply_manual_time_for_game(
                now,
                stat["game"]["id"],
                stat["game"]["name"],
                stat["time"],
                source
            )

    def _timestamp_of_end_of_day(self, day_to_end):
        result = datetime.combine(
            day_to_end + timedelta(days=1), datetime.min.time()
        )
        return int(result.timestamp()) - 1
