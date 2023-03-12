import {
    Field, PanelSection,
    PanelSectionRow
} from "decky-frontend-lib";
import { VFC } from "react";
import { humanReadableTime } from "./app/formatters";
import { SessionPlayTime } from "./app/SessionPlayTime";
import { Storage } from './app/Storage'
import { ByWeekTab } from "./DetailedPage";

export const Content: VFC<{
    storage: Storage,
    sessionPlayTime: SessionPlayTime
}> = ({ storage, sessionPlayTime }) => {
    const currentPlayTime = sessionPlayTime.getPlayTime(Date.now())
    let currentSessionTimeAsText = humanReadableTime(currentPlayTime, true);

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