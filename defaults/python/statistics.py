from collections import defaultdict
from datetime import date, timedelta
from typing import Dict, List
from python.db.models import DailyAggSessionDto
from python.db.service import StorageService
from python.helpers import end_of_day, start_of_day
from python.models import DayStatistics, Game, GameWithTime, PagedDayStatistics


class Statistics:
    service: StorageService

    def __init__(self, service: StorageService) -> None:
        self.service = service

    def daily_statistics_for_period(self,
                                    start: date,
                                    end: date) -> PagedDayStatistics:
        start_dt = start_of_day(start)
        end_dt = end_of_day(end)
        paged = self.service.fetch_agg_per_day_report(start_dt, end_dt)

        date_range = self._generate_date_range(start, end)
        sessions_by_date: Dict[str, List[DailyAggSessionDto]] = defaultdict(list)
        for agg_session in paged.data:
            sessions_by_date[agg_session.date].append(agg_session)

        return PagedDayStatistics(
            data=[self._map_to_daily_stat(date, sessions_by_date[date])
                  for (date) in date_range],
            hasNext=paged.has_next,
            hasPrev=paged.has_prev
        )

    def _map_to_daily_stat(
            self, date_str: str, agg_sessions: List[DailyAggSessionDto]) -> DayStatistics:
        games: List[GameWithTime] = [
            GameWithTime(
                game=Game(session.game_id, session.game_name),
                time=session.duration
            ) for session in agg_sessions]
        return DayStatistics(
            date=date_str,
            games=games,
            total=sum([session.duration for session in agg_sessions])
        )

    def per_game_overall_statistic(self) -> List[GameWithTime]:
        data = self.service.fetch_overall_playtime()
        return [
            GameWithTime(
                game=Game(id=game.game_id, name=game.game_name),
                time=game.duration
            ) for game in data
        ]

    def _generate_date_range(self, start_date: date, end_date: date) -> List[str]:
        date_list = []
        curr_date = start_date
        while curr_date <= end_date:
            date_list.append(curr_date.isoformat())
            curr_date += timedelta(days=1)
        return date_list
