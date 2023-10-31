from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import List, Optional


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
    date_time: datetime
    game_id: str
    game_name: str
    duration: int


@dataclass
class PagedAggSessionsDto:
    data: List[DailyAggSessionDto]
    has_next: bool
    has_prev: bool


@dataclass
class SessionsFeedDto:
    data: List[SessionDto]
    earlier_token: Optional[str]
    later_token: Optional[str]
