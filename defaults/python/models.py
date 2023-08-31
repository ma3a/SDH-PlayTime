from dataclasses import dataclass
from typing import List


@dataclass
class Game:
    id: str
    name: str


@dataclass
class GameWithTime:
    game: Game
    time: int


@dataclass
class DayStatistics:
    date: str
    games: List[GameWithTime]
    total: int


@dataclass
class PagedDayStatistics:
    data: List[DayStatistics]
    hasPrev: bool
    hasNext: bool
