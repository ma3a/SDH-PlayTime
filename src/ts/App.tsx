import {
    Field, PanelSection,
    PanelSectionRow
} from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { humanReadableTime } from "./app/formatters";
import { SessionPlayTime } from "./app/SessionPlayTime";
import { DEFAULTS, PlayTimeSettings, Settings } from "./app/settings";
import { Storage } from './app/Storage'
import { ByWeekTab } from "./DetailedPage";

export const Content: VFC<{
    storage: Storage,
    sessionPlayTime: SessionPlayTime,
    settings: Settings
}> = ({ storage, sessionPlayTime, settings }) => {
    const currentPlayTime = sessionPlayTime.getPlayTime(Date.now())
    let currentSessionTimeAsText = humanReadableTime(currentPlayTime, true);
    const [isLoading, setLoading] = useState<Boolean>(true)
    const [currentSettings, setCurrentSettings] = useState<PlayTimeSettings>(DEFAULTS)

    useEffect(() => {
        setLoading(true)
        settings.get().then((it) => {
            setCurrentSettings(it)
            setLoading(false)
        });
    }, [])

    return (
        <div>
            {currentPlayTime != 0 && <PanelSection>
                <PanelSectionRow >
                    <Field label="Current play session">{currentSessionTimeAsText}</Field>
                </PanelSectionRow>
            </PanelSection>}
            {!isLoading && <ByWeekTab storage={storage} settings={currentSettings} />}
        </div >
    );
};
