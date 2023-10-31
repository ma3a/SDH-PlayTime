from dataclasses import dataclass
from enum import Enum
from typing import List, Optional


class FeedDirection(str, Enum):
    DOWN = "DOWN"
    UP = "UP"

    @classmethod
    def from_str(cls, value: str) -> Optional["FeedDirection"]:
        if value == "DOWN":
            return FeedDirection.DOWN
        if value == "UP":
            return FeedDirection.UP
        raise ValueError(f"Unknown value: {value}")

    def to_str(self) -> str:
        return self.value


@dataclass
class FeedRequest:
    token_str: Optional[str] = None
    limit: int = 100
    direction: FeedDirection = FeedDirection.UP


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


@dataclass
class Session:
    dateTime: str
    game: Game
    duration: int


@dataclass
class SessionsFeed:
    data: List[Session]
    earlierToken: Optional[str]
    laterToken: Optional[str]
