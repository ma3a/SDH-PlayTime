import { Field } from "decky-frontend-lib";
import { humanReadableTime } from "../app/formatters";
import { PlayTimeForDay } from "../app/model";
import { FC } from "react";
import { DataModule } from "./DataModule";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface DayTime {
    dayOfWeek: string;
    time: number;
    date: Date
}

export class DailyModule extends DataModule
{
	protected component: FC<{ data: PlayTimeForDay[] }> = DailyPlayTime;
	protected name: string = "weekly";
}

const DailyPlayTime: FC<{ data: PlayTimeForDay[] }> = ({data}) => {
    let dayTimes = data.map(day => {
        let date = new Date()
        date.setTime(Date.parse(day.date))
        return {
            dayOfWeek: date.toLocaleString('en-us', { weekday: 'long' }),
            time: day.totalTime,
	        games: day.games,
            date: date
        } as DayTime
    })
    const overall = dayTimes.map(it => it.time).reduce((a, c) => a + c, 0)
    const average = overall / dayTimes.length
    return (
        <div className="playtime-chart">
            <Field label="Hourly average" bottomSeparator="none">{humanReadableTime(average, true)}</Field>
            <Field label="Daily overall" bottomSeparator="none">{humanReadableTime(overall, true)}</Field>
	        <div className="bar-by-day" style={{ width: '100%', height: 300 }}>
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
				        <XAxis dataKey="day" interval={0} scale="time" angle={-90} textAnchor="end" />
				        <YAxis tickFormatter={(e: number) => humanReadableTime(e, true)} axisLine={false} />
                        <Bar dataKey="time" fill="#008ADA" >

                        </Bar>
			        </BarChart>
		        </ResponsiveContainer>
	        </div>
        </div>
    );
};
