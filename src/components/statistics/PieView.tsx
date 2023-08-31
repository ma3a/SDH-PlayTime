import { FC } from 'react'
import { DailyStatistics } from '../../app/model'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { FocusableExt } from '../FocusableExt'

interface TimeByGame {
    gameId: string
    gameName: String
    time: number
}

const colors = [
    '#0b84a5',
    '#f6c85f',
    '#6f4e7c',
    '#9dd866',
    '#ca472f', // Color for "Other"
]

export const PieView: FC<{ statistics: DailyStatistics[] }> = (props) => {
    const raw_data = sumTimeAndGroupByGame(props.statistics)
        .map((value) => {
            return {
                name: value.gameName,
                value: value.time / 60.0,
            }
        })
        .sort((a, b) => b.value - a.value)

    const MAX_ELEMENTS = colors.length - 1

    const top_elements = raw_data.slice(0, MAX_ELEMENTS)
    const other_elements = raw_data.slice(MAX_ELEMENTS)
    const other = {
        name: 'Other',
        value: other_elements.reduce((acc, curr) => acc + curr.value, 0),
    }

    let data = []
    if (other.value > 0) {
        data = [...top_elements, other]
    } else {
        data = top_elements
    }

    const RADIAN = Math.PI / 180

    // @ts-ignore
    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
    }: {
        cx: number
        cy: number
        midAngle: number
        innerRadius: number
        outerRadius: number
        percent: number
    }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        )
    }

    return (
        <FocusableExt>
            <div className="pie-by-week" style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            dataKey="value"
                            isAnimationActive={false}
                            data={data}
                            fill="#0088FE"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            legendType="circle"
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index]} />
                            ))}
                        </Pie>
                        <Legend cx="30%" verticalAlign="bottom" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </FocusableExt>
    )
}

function sumTimeAndGroupByGame(statistics: DailyStatistics[]): TimeByGame[] {
    const timeByGameId = new Map<string, number>()
    const titleByGameId = new Map<string, string>()

    statistics
        .flatMap((it) => it.games)
        .forEach((el) => {
            timeByGameId.set(el.game.id, (timeByGameId.get(el.game.id) || 0) + el.time)
            titleByGameId.set(el.game.id, el.game.name)
        })

    const timeByGames: TimeByGame[] = []
    timeByGameId.forEach((v, k) => {
        timeByGames.push({
            gameId: k,
            gameName: titleByGameId.get(k) || 'Unknown',
            time: v,
        } as TimeByGame)
    })
    timeByGames.sort((a, b) => b.time - a.time)
    return timeByGames
}
