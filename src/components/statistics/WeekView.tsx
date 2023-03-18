import { FC } from 'react'
import { DailyStatistics } from '../../app/model'
import { HorizontalContainer } from '../HorizontalContainer'
import { Timebar } from '../Timebar'
import { FocusableExt } from '../FocusableExt'

interface DayTime {
    dayOfWeek: string
    time: number
    date: Date
}

export const WeekView: FC<{ statistics: DailyStatistics[] }> = (props) => {
    let dayTimes = props.statistics.map((it) => {
        let date = new Date()
        date.setTime(Date.parse(it.date))
        return {
            dayOfWeek: date.toLocaleString('en-us', { weekday: 'long' }),
            time: it.total,
            date: date,
        } as DayTime
    })
    const overall = dayTimes.map((it) => it.time).reduce((a, c) => a + c, 0)
    return (
        <FocusableExt>
            <div className="playtime-chart">
                <div className="playtime-chart">
                    {dayTimes.map((dayTime) => (
                        <HorizontalContainer>
                            <div style={{ width: '10%' }}>
                                {dayTime.dayOfWeek.charAt(0)}
                            </div>
                            <div style={{ width: '90%' }}>
                                <Timebar time={dayTime.time} allTime={overall} />
                            </div>
                        </HorizontalContainer>
                    ))}
                </div>
            </div>
        </FocusableExt>
    )
}
