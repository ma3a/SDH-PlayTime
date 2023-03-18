import { Field } from "decky-frontend-lib";
import { humanReadableTime } from "../app/formatters";
import { PlayTimeForDay } from "../app/model";
import { FC } from "react";
import { DataModule } from "./DataModule";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface DayTime {
	time: number;
	date: Date
}

export class MonthlyModule extends DataModule {
	protected component: FC<{ data: PlayTimeForDay[] }> = MonthlyPlayTime;
	protected name: string = "monthly";
}

const MonthlyPlayTime: FC<{ data: PlayTimeForDay[] }> = (data) => {
	let dayTimes = data.data.map(it => {
		let date = new Date()
		date.setTime(Date.parse(it.date))
		return {
			time: it.totalTime,
			date: date
		} as DayTime
	})
	const overall = dayTimes.map(it => it.time).reduce((a, c) => a + c, 0)
	const average = overall / dayTimes.length
	return (
		<div className="playtime-chart">
			<Field label="Daily average" bottomSeparator="none">{humanReadableTime(average, true)}</Field>
			<Field label="Monthly overall" bottomSeparator="none">{humanReadableTime(overall, true)}</Field>

			<div className="bar-by-month" style={{ width: '100%', height: 300 }}>
				<ResponsiveContainer>
					<BarChart
						data={dayTimes.map(value => {
							return {
								day: value.date.getDate(),
								time: value.time
							}
						})}
						margin={{
							top: 5,
							right: 30,
							left: 20,
							bottom: 5,
						}}
					>
						<CartesianGrid strokeDasharray="1 2" strokeWidth={0.5} />
						<XAxis dataKey="day" interval={0} scale="time" angle={-90} textAnchor="end" />
						<YAxis tickFormatter={(e: number) => humanReadableTime(e, true)} axisLine={false} />
						<Bar dataKey="time" fill="#008ADA" />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div >
	);
};
