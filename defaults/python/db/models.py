from dataclasses import dataclass
from typing import List


@dataclass
class GameAggSessionsDto:
    game_id: str
    game_name: str
    duration: int


@dataclass
class DailyAggSessionDto:
    date: str
    game_id: str
    game_name: str
    duration: int


@dataclass
class SessionDto:
    start_date_time: str
    game_id: str
    game_name: str
    duration: int


@dataclass
class PagedAggSessionsDto:
    data: List[DailyAggSessionDto]
    has_next: bool
    has_prev: bool
