import { FC } from 'react'
import { Session } from '../../app/model'
import { PanelSection } from 'decky-frontend-lib'
import { HorizontalContainer } from '../HorizontalContainer'
import { VerticalContainer } from '../VerticalContainer'
import { GameImage } from '../GameImage'
import moment from 'moment'
import { humanReadableTime } from '../../app/formatters'

export const ActivityItem: FC<{
    session: Session
}> = (props) => {
    const session = props.session
    return (
        <HorizontalContainer>
            <div style={{ width: '10%' }}>
                <GameImage gameId={session.game.id} height={90} />
            </div>
            <div style={{ width: '90%' }}>
                <HorizontalContainer>
                    <div>
                        <VerticalContainer>
                            <PanelSection>{session.game.name}</PanelSection>
                            <PanelSection>
                                {moment(session.dateTime).toLocaleString()}
                            </PanelSection>
                        </VerticalContainer>
                    </div>
                    <div>
                        <PanelSection>{humanReadableTime(session.duration)}</PanelSection>
                    </div>
                </HorizontalContainer>
            </div>
        </HorizontalContainer>
    )
}
