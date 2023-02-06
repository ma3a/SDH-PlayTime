import { PlayTimeForDay } from "../app/model";
import { Timebar } from "../components/Timebar";
import { VerticalContainer } from "../components/VerticalContainer";
import { hide_text_on_overflow } from "../styles";

interface TimeByGame {
    gameId: string,
    gameName: String,
    time: number
}

export const GamesPlayTime: React.FC<{ data: PlayTimeForDay[] }> = (props) => {
    const timeByGames = sumTimeAndGroupByGame(props.data)
    const maxTime = Math.max(...timeByGames.map((game) => game.time));

    return (
        <div className="games-by-week">
            {timeByGames.map((game) => (
                <VerticalContainer>
                    <div style={hide_text_on_overflow}>{game.gameName}</div>
                    <Timebar time={game.time} maxTime={maxTime} />
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