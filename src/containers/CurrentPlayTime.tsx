import { Field, PanelSection, PanelSectionRow } from 'decky-frontend-lib'
import { humanReadableTime } from '../app/formatters'
import { useLocator } from '../locator'
import { VFC } from 'react'

export const CurrentPlayTime: VFC<{}> = () => {
    const { sessionPlayTime } = useLocator()

    const currentPlayTime = sessionPlayTime.getPlayTime(Date.now())
    let currentSessionTimeAsText = humanReadableTime(currentPlayTime)
    return (
        <div>
            {currentPlayTime != 0 && (
                <PanelSection>
                    <PanelSectionRow>
                        <Field label="Current play session">
                            {currentSessionTimeAsText}
                        </Field>
                    </PanelSectionRow>
                </PanelSection>
            )}
        </div>
    )
}
