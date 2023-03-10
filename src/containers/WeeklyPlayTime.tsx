import { Field } from "decky-frontend-lib";
import { humanReadablePlayTime } from "../app/formatters";
import { PlayTimeForDay } from "../app/model";
import { HorizontalContainer } from "../components/HorizontalContainer";
import { Timebar } from "../components/Timebar";
import {FC} from "react";
import {DataModule} from "./DataModule";

interface DayTime {
    dayOfWeek: string;
    time: number;
    date: Date
}

export class WeeklyModule extends DataModule
{
	protected component: FC<{ data: PlayTimeForDay[] }> = WeeklyPlayTime;
	protected name: string = "weekly";
}

const WeeklyPlayTime: FC<{ data: PlayTimeForDay[] }> = (data) => {
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
    const allTime = dayTimes.map((dayTime) => dayTime.time).reduce((a, b) => a + b, 0);
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
                        <Timebar time={dayTime.time} allTime={allTime} />
                    </div>
                </HorizontalContainer>
            ))}
        </div >
    );
};