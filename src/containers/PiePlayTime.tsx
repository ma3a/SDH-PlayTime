import { PlayTimeForDay } from "../app/model";
import React from "react";
import {PieChart, Pie, Cell, Legend, ResponsiveContainer} from 'recharts';

interface TimeByGame {
    gameId: string,
    gameName: String,
    time: number
}

export const PiePlayTime: React.FC<{ data: PlayTimeForDay[] }> = (props) => {
    const data = sumTimeAndGroupByGame(props.data).map(value => {
		return {
            name: value.gameName,
			value: (value.time / 60.0)
        }
    })

	const RADIAN = Math.PI / 180;

	// @ts-ignore
	const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
		const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		return (
				<text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
					{`${(percent * 100).toFixed(0)}%`}
				</text>
		);
	};

	function seed(s: number) {
		return function() {
			s = Math.sin(s) * 10000; return s - Math.floor(s);
		};
	}

	const seededRandom = seed(42)

	function getRandomColor() {
		let letters = '0123456789ABCDEF';
		let color = '#';
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(seededRandom() * 16)];
		}
		return color;
	}

	return (
        <div className="pie-by-week" style={{ width: '100%', height: 300 }}>
	        <ResponsiveContainer>
		        <PieChart>
			        <Pie
					        dataKey="value"
					        isAnimationActive={true}
					        data={data}
					        fill="#0088FE"
					        labelLine={false}
					        label={renderCustomizedLabel}
					        legendType="circle"
			        >
				        {data.map((_, index) => (
						        <Cell key={`cell-${index}`} fill={getRandomColor()} />
				        ))}
			        </Pie>
			        <Legend cx="30%" verticalAlign="bottom"/>
		        </PieChart>
	        </ResponsiveContainer>
        </div >
    );
};

function sumTimeAndGroupByGame(data: PlayTimeForDay[]): TimeByGame[] {
    const timeByGameId = new Map<string, number>()
    const titleByGameId = new Map<string, string>()

    data.flatMap(it => it.games).forEach(el => {
        timeByGameId.set(el.gameId, (timeByGameId.get(el.gameId) || 0) + el.time)
        titleByGameId.set(el.gameId, el.gameName)
    })

    const timeByGames: TimeByGame[] = []
    timeByGameId.forEach((v, k) => {
        timeByGames.push({
            gameId: k,
            gameName: titleByGameId.get(k) || "Unknown",
            time: v
        } as TimeByGame)
    })
    timeByGames.sort((a, b) => b.time - a.time)
    return timeByGames;
}