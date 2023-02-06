import { Field } from "decky-frontend-lib";
import { humanReadablePlayTime } from "../app/formatters";
import { PlayTimeForDay } from "../app/model";
import { HorizontalContainer } from "../components/HorizontalContainer";
import { Timebar } from "../components/Timebar";

interface DayTime {
    dayOfWeek: string;
    time: number;
    date: Date
}

export const WeeklyPlayTime: React.FC<{ data: PlayTimeForDay[] }> = (data) => {
    let dayTimes = data.data.map(it => {
        let date = new Date()
        date.setTime(Date.parse(it.date))
        return {
            dayOfWeek: date.toLocaleString('en-us', { weekday: 'long' }),
            time: it.totalTime,
            date: date
        } as DayTime
    })
    const overall = dayTimes.map(it => it.time).reduce((a, c) => a + c, 0)
    const average = overall / dayTimes.length
    const maxTime = Math.max(...dayTimes.map((dayTime) => dayTime.time));
    return (
        <div className="playtime-chart">
            <Field label="Daily average" bottomSeparator="none">{humanReadablePlayTime(average, true)}</Field>
            <Field label="Weekly overall" bottomSeparator="none">{humanReadablePlayTime(overall, true)}</Field>
            {dayTimes.map((dayTime) => (
                <HorizontalContainer>
                    <div style={{ width: "10%" }}>
                        {dayTime.dayOfWeek.charAt(0)}
                    </div>
                    <div style={{ width: "85%" }}>
                        <Timebar time={dayTime.time} maxTime={maxTime} />
                    </div>
                </HorizontalContainer>
            ))}
        </div >
    );
};