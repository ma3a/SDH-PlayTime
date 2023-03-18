import { GameWithTime } from '../../app/model'
import { Timebar } from '../Timebar'
import { VerticalContainer } from '../VerticalContainer'
import { FocusableExt } from '../FocusableExt'
import { hide_text_on_overflow } from '../../styles'

export const GamesTimeBarView: React.FC<{ data: GameWithTime[] }> = (props) => {
    const allTime = props.data.reduce((acc, it) => acc + it.time, 0)
    const sortedByTime = props.data.sort((a, b) => b.time - a.time)

    return (
        <div className="games-by-week">
            {sortedByTime.map((it) => (
                <FocusableExt>
                    <VerticalContainer>
                        <div style={hide_text_on_overflow}>{it.game.name}</div>
                        <Timebar time={it.time} allTime={allTime} />
                    </VerticalContainer>
                </FocusableExt>
            ))}
        </div>
    )
}
