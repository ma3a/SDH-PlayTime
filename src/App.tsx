import {
    ButtonItem,
    Field, Navigation, PanelSection,
    PanelSectionRow
} from "decky-frontend-lib";
import { VFC } from "react";
import { humanReadablePlayTime } from "./app/formatters";
import { SessionPlayTime } from "./app/SessionPlayTime";
import { Storage } from './app/Storage'
import { ByWeekTab } from "./DetailedPage";
import { navigateToPage, DETAILED_REPORT_ROUTE } from "./navigation";

export const Content: VFC<{
    storage: Storage,
    sessionPlayTime: SessionPlayTime
}> = ({ storage, sessionPlayTime }) => {
    const currentPlayTime = sessionPlayTime.getPlayTime(Date.now())
    let currentSessionTimeAsText = humanReadablePlayTime(currentPlayTime, true);

    return (
        <div>
            {currentPlayTime != 0 && <PanelSection>
                <PanelSectionRow >
                    <Field label="Current play session">{currentSessionTimeAsText}</Field>
                </PanelSectionRow>
            </PanelSection>}
            <ByWeekTab storage={storage} />
        </div >
    );
};