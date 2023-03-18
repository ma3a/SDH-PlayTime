import { FC } from 'react'
import { DailyStatistics } from '../../app/model'
import { humanReadableTime } from '../../app/formatters'
import { Field, PanelSection, PanelSectionRow } from 'decky-frontend-lib'
import { FocusableExt } from '../FocusableExt'

export const AverageAndOverall: FC<{ statistics: DailyStatistics[] }> = (props) => {
    const overall = props.statistics.map((it) => it.total).reduce((a, c) => a + c, 0)
    const average = overall / props.statistics.length
    return (
        <FocusableExt>
            <PanelSection title="Average and overall">
                <PanelSectionRow>
                    <Field label="Daily average" bottomSeparator="none">
                        {humanReadableTime(average)}
                    </Field>
                </PanelSectionRow>
                <PanelSectionRow>
                    <Field label="Overall" bottomSeparator="none">
                        {humanReadableTime(overall)}
                    </Field>
                </PanelSectionRow>
            </PanelSection>
        </FocusableExt>
    )
}
