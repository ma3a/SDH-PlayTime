import {
    Field,
    Focusable,
    PanelSection,
    PanelSectionRow
} from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { humanReadablePlayTime } from "./app/formatters";
import { PlayTimeForDay } from "./app/model";
import { SessionPlayTime } from "./app/SessionPlayTime";
import { Storage } from './app/Storage'
import { GamesPlayTime } from "./containers/GamesPlayTime";
import { Pager } from "./components/Pager";
import { WeeklyPlayTime } from "./containers/WeeklyPlayTime"

interface DateInterval {
    startDate: Date,
    endDate: Date,
}

export const Content: VFC<{
    storage: Storage,
    sessionPlayTime: SessionPlayTime
}> = (dep) => {
    const currentPlayTime = dep.sessionPlayTime.getPlayTime(Date.now())
    let currentSessionTimeAsText = humanReadablePlayTime(currentPlayTime, true);
    const [playTimeForWeek, setPlayTimeForWeek] = useState<PlayTimeForDay[]>([]);
    const [isLoading, setLoading] = useState<Boolean>(false);

    const now = new Date()

    const weeks: DateInterval[] = [2, 1, 0].map(wn => {
        const dayInWeek = new Date()
        dayInWeek.setDate(now.getDate() - wn * 7)
        const weekStart = startOfWeek(dayInWeek)
        return {
            startDate: startOfWeek(dayInWeek),
            endDate: endOfWeek(weekStart)
        } as DateInterval
    })

    const loadWeeklyReport = (interval: DateInterval) => {
        setLoading(true)
        dep.storage.getPlayTime(interval.startDate, interval.endDate).then((it) => {
            if (it.success) {
                setPlayTimeForWeek(it.result)
                setLoading(false)
            }
        })
    }
    const [currentWeekIdx, setCurrentWeeksIdx] = useState<number>(weeks.length - 1);
    useEffect(() => {
        loadWeeklyReport(weeks[currentWeekIdx])
    }, [])
    const onNextWeek = () => {
        loadWeeklyReport(weeks[currentWeekIdx + 1])
        setCurrentWeeksIdx(currentWeekIdx + 1)
    }
    const onPrevWeek = () => {
        loadWeeklyReport(weeks[currentWeekIdx - 1])
        setCurrentWeeksIdx(currentWeekIdx - 1)
    }
    const currentText = () => {
        if ((weeks.length - 1) - currentWeekIdx == 0) {
            return "This week"
        }
        if ((weeks.length - 1) - currentWeekIdx == 1) {
            return "Previous week"
        }
        const s = weeks[currentWeekIdx].startDate.toISOString().substring(5, 10)
        const e = weeks[currentWeekIdx].endDate.toISOString().substring(5, 10)
        return `${s} - ${e}`
    }
    return (
        <div>
            {currentPlayTime != 0 && <PanelSection>
                <PanelSectionRow >
                    <Field label="Current play session">{currentSessionTimeAsText}</Field>
                </PanelSectionRow>
            </PanelSection>}
            <PanelSection title="by week">
                <PanelSectionRow>
                    <Pager
                        pages={weeks}
                        currentIdx={currentWeekIdx}
                        onNext={onNextWeek}
                        onPrev={onPrevWeek}
                        currentText={currentText}
                    ></Pager>
                </PanelSectionRow>
                {!isLoading &&
                    <PanelSectionRow>
                        <Focusable onActivate={() => { }}>
                            <WeeklyPlayTime data={playTimeForWeek} />
                        </Focusable>
                    </PanelSectionRow>
                }
            </PanelSection>
            {!isLoading && <PanelSection title="games by week">
                <PanelSectionRow>
                    <Focusable onActivate={() => { }}>
                        <GamesPlayTime data={playTimeForWeek} />
                    </Focusable>
                </PanelSectionRow>
            </PanelSection>}
        </div >
    );
};

function startOfWeek(date: Date): Date {
    const dt = new Date(date);
    const day = dt.getDay()
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(dt.setDate(diff));
}
function endOfWeek(startOfWeek: Date): Date {
    const dt = new Date(startOfWeek);
    const diff = dt.getDate() + 6;
    return new Date(dt.setDate(diff));
}