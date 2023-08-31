import { FC } from 'react'
import { DailyStatistics } from '../../app/model'
import { humanReadableTime } from '../../app/formatters'
import { Field, PanelSection, PanelSectionRow } from 'decky-frontend-lib'
import { FocusableExt } from '../FocusableExt'
import moment from 'moment'

export const AverageAndOverall: FC<{ statistics: DailyStatistics[] }> = (props) => {
    const overall = props.statistics.map((it) => it.total).reduce((a, c) => a + c, 0)
    let today = moment(new Date()).startOf('day')
    const daysPassed = props.statistics.filter((it) =>
        moment(it.date).startOf('day').isSameOrBefore(today)
    ).length
    const average = overall / daysPassed
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
