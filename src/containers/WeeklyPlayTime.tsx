import { Field } from "decky-frontend-lib";
import { humanReadablePlayTime } from "../app/formatters";
import { PlayTimeForDay } from "../app/model";
import {FC} from "react";
import {DataModule} from "./DataModule";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis} from "recharts";

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
    return (
        <div className="playtime-chart">
            <Field label="Daily average" bottomSeparator="none">{humanReadablePlayTime(average, true)}</Field>
            <Field label="Weekly overall" bottomSeparator="none">{humanReadablePlayTime(overall, true)}</Field>
	        <div className="bar-by-month" style={{ width: '100%', height: 300 }}>
		        <ResponsiveContainer>
			        <BarChart
					        data={dayTimes.map(value => {
						        return {
							        day: value.dayOfWeek.substring(0,2),
							        time: value.time
						        }
					        })}
					        margin={{
						        top: 5,
						        right: 30,
						        left: 20,
						        bottom: 5,
					        }}
					        layout={"vertical"}
			        >
				        <CartesianGrid strokeDasharray="3 3" />
				        <YAxis type={"category"} dataKey="day"/>
				        <XAxis type={"number"}  />
				        <Legend />
				        <Bar dataKey="time" fill="#008ADA" />
			        </BarChart>
		        </ResponsiveContainer>
	        </div>
        </div>
    );
};