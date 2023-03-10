import {useEffect, useState, VFC} from "react";
import {Storage} from "./app/Storage";
import {SessionPlayTime} from "./app/SessionPlayTime";
import {Field, PanelSection, PanelSectionRow, Tabs} from "decky-frontend-lib";
import {humanReadablePlayTime} from "./app/formatters";
import {PlayTimeForDay} from "./app/model";
import {Pager} from "./components/Pager";
import {WeeklyModule} from "./containers/WeeklyPlayTime";
import {GamesModule} from "./containers/GamesPlayTime";
import {PieModule} from "./containers/PiePlayTime";
import logger from "./utils";

export const DetailedPage: VFC<{
	storage: Storage,
	sessionPlayTime: SessionPlayTime
}> = ({storage, sessionPlayTime}) => {
	const [currentTabRoute, setCurrentTabRoute] = useState<string>('all-time');
	const currentPlayTime = sessionPlayTime.getPlayTime(Date.now())
	let currentSessionTimeAsText = humanReadablePlayTime(currentPlayTime, true);


	return (
			<div
					style={{
						marginTop: '40px',
						height: 'calc( 100% - 40px )',
						background: '#0005',
					}}
			>
				{currentPlayTime != 0 && <PanelSection>
                    <PanelSectionRow >
                        <Field label="Current play session">{currentSessionTimeAsText}</Field>
                    </PanelSectionRow>
                </PanelSection>}
				<Tabs
						activeTab={currentTabRoute}
						onShowTab={(tabId: string) => {
							setCurrentTabRoute(tabId);
						}}
						tabs={[
							{
								title: 'All Time',
								content: <AllTimeTab storage={storage} />,
								id: 'all-time',
							},
							{
								title: 'By Month',
								content: <ByMonthTab storage={storage} />,
								id: 'by-month',
							},
							{
								title: 'By Week',
								content: <ByWeekTab storage={storage} />,
								id: 'by-week',
							},
						]}
				/>
			</div>
    );
}

const AllTimeTab: VFC<{
	storage: Storage,
}> = ({storage}) => {
	const [playTimeForAllTime, setPlayTimeForAllTime] = useState<PlayTimeForDay[]>([]);
	const [isLoading, setLoading] = useState<Boolean>(false);

	useEffect(() => {
		setLoading(true)
		storage.getAllPlayTime().then((it) => {
			logger.info(it)
			if (it.success) {
				setPlayTimeForAllTime(it.result)
				setLoading(false)
			}
		});
	}, [])

	const modules = [
		new GamesModule(),
		new PieModule()
	]
	return (
			<PanelSection title="all time">
				{
						!isLoading && modules.map(module => module.render(playTimeForAllTime))
				}
			</PanelSection>
	)
}

const ByMonthTab: VFC<{
	storage: Storage,
}> = ({}) => {
	return (<div/>)
}

export const ByWeekTab: VFC<{
	storage: Storage,
}> = ({storage}) => {
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
		storage.getPlayTime(interval.startDate, interval.endDate).then((it) => {
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
	const currentText = () =>
	{
		if ((weeks.length - 1) - currentWeekIdx==0)
		{
			return "This week"
		}
		if ((weeks.length - 1) - currentWeekIdx==1)
		{
			return "Previous week"
		}
		const s = weeks[currentWeekIdx].startDate.toISOString().substring(5, 10)
		const e = weeks[currentWeekIdx].endDate.toISOString().substring(5, 10)
		return `${s} - ${e}`
	}
	const modules = [
		new WeeklyModule(),
		new GamesModule(),
		new PieModule()
	]
	return (
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
				{
						!isLoading && modules.map(module => module.render(playTimeForWeek))
				}
			</PanelSection>
	)
}

export interface DateInterval {
	startDate: Date,
	endDate: Date,
}

export function startOfWeek(date: Date): Date {
	const dt = new Date(date);
	const day = dt.getDay()
	const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
	return new Date(dt.setDate(diff));
}
export function endOfWeek(startOfWeek: Date): Date {
	const dt = new Date(startOfWeek);
	const diff = dt.getDate() + 6;
	return new Date(dt.setDate(diff));
}
