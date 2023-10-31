from datetime import date, datetime, timedelta


DATE_FORMAT = "%Y-%m-%d"


class Clock():
    def now(self) -> datetime:
        return datetime.now()


def parse_date(date_str: str) -> date:
    return datetime.strptime(date_str, DATE_FORMAT).date()


def format_date(date_time: datetime) -> str:
    return date_time.strftime(DATE_FORMAT)


def next_day_at_midnight(day: datetime) -> datetime:
    return datetime.fromtimestamp(
        datetime.combine(day + timedelta(days=1), datetime.min.time()).timestamp())


def start_of_day(day: date) -> datetime:
    return datetime.fromtimestamp(
        datetime.combine(day, datetime.min.time()).timestamp())


def end_of_day(day: date) -> datetime:
    return datetime.fromtimestamp(
        datetime.combine(day, datetime.max.time()).timestamp())
