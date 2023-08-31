from datetime import date, datetime, timedelta


DATE_FORMAT = "%Y-%m-%d"


def parse_date(date_str: str) -> date:
    return datetime.strptime(date_str, DATE_FORMAT).date()


def format_date(dt: datetime) -> str:
    return dt.strftime(DATE_FORMAT)


def end_of_day(day_to_end: datetime) -> datetime:
    return datetime.fromtimestamp(
        datetime.combine(
            day_to_end + timedelta(days=1), datetime.min.time()
        ).timestamp() - 1
    )
