import { FC } from 'react'
import { DailyStatistics } from '../../app/model'
import { humanReadableTime } from '../../app/formatters'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { FocusableExt } from '../FocusableExt'
import moment from 'moment'

interface DayTime {
    time: number
    date: Date
}

export const MonthView: FC<{ statistics: DailyStatistics[] }> = (props) => {
    let dayTimes = props.statistics.map((it) => {
        return {
            time: it.total,
            date: moment(it.date).toDate(),
        } as DayTime
    })
    return (
        <FocusableExt>
            <div className="playtime-chart">
                <div className="bar-by-month" style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={dayTimes.map((value) => {
                                return {
                                    day: value.date.getDate(),
                                    time: value.time,
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
                            <XAxis
                                dataKey="day"
                                interval={0}
                                scale="time"
                                angle={-90}
                                textAnchor="end"
                            />
                            <YAxis
                                tickFormatter={(e: number) => humanReadableTime(e, true)}
                                axisLine={false}
                            />
                            <Bar dataKey="time" fill="#008ADA" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </FocusableExt>
    )
}
