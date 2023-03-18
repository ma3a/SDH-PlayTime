import { ButtonItem, PanelSection, PanelSectionRow } from 'decky-frontend-lib'
import { DETAILED_REPORT_ROUTE, SETTINGS_ROUTE, navigateToPage } from './navigation'
import { VFC } from 'react'
import { ReportWeekly } from '../containers/ReportWeekly'
import { CurrentPlayTime } from '../containers/CurrentPlayTime'

export const DeckyPanelPage: VFC<{}> = () => {
    return (
        <div>
            <CurrentPlayTime />
            <ReportWeekly />
            <PanelSection title="Misc">
                <PanelSectionRow>
                    <ButtonItem
                        layout="below"
                        onClick={() => navigateToPage(DETAILED_REPORT_ROUTE)}
                    >
                        Detailed report
                    </ButtonItem>
                </PanelSectionRow>
                <PanelSectionRow>
                    <ButtonItem
                        layout="below"
                        onClick={() => navigateToPage(SETTINGS_ROUTE)}
                    >
                        Open settings
                    </ButtonItem>
                </PanelSectionRow>
            </PanelSection>
        </div>
    )
}
