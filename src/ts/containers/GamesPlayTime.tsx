import { PlayTimeForDay } from "../app/model";
import { DataModule } from "./DataModule";
import { FC } from "react";
import { Timebar } from "../components/Timebar";
import { hide_text_on_overflow } from "../styles";
import { VerticalContainer } from "../components/VerticalContainer";

interface TimeByGame {
    gameId: string,
    gameName: String,
    time: number
}

export class GamesModule extends DataModule {
    protected component: FC<{ data: PlayTimeForDay[] }> = GamesPlayTime;
    protected name: string = "games";
}

const GamesPlayTime: React.FC<{ data: PlayTimeForDay[] }> = (props) => {
    const timeByGames = sumTimeAndGroupByGame(props.data)
    const allTime = timeByGames.map((game) => game.time).reduce((a, b) => a + b, 0);

    return (
        <div className="games-by-week">
            {timeByGames.map((game) => (
                <VerticalContainer>
                    <div style={hide_text_on_overflow}>{game.gameName}</div>
                    <Timebar time={game.time} allTime={allTime} />
                </VerticalContainer>
            ))}
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