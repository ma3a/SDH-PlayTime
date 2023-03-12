import { useEffect, useState, VFC } from "react";
import { Storage } from "./app/Storage";
import { PanelSection, PanelSectionRow, Tabs } from "decky-frontend-lib";
import { PlayTimeForDay } from "./app/model";
import { Pager } from "./components/Pager";
import { WeeklyModule } from "./containers/WeeklyPlayTime";
import { GamesModule } from "./containers/GamesPlayTime";
import { PieModule } from "./containers/PiePlayTime";
import logger from "./utils";
import { MonthlyModule } from "./containers/MonthlyPlayTime";

export const DetailedPage: VFC<{
	storage: Storage
}> = ({ storage }) => {
	const [currentTabRoute, setCurrentTabRoute] = useState<string>('all-time');

	return (
		<div
			style={{
				marginTop: '40px',
				height: 'calc( 100% - 40px )',
				background: '#0005',
			}}
		>
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
}> = ({ storage }) => {
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
}> = ({ storage }) => {
	const [playTimeForMonth, setPlayTimeForMonth] = useState<PlayTimeForDay[]>([]);
	const [isLoading, setLoading] = useState<Boolean>(false);
	const now = new Date()

	const months: DateInterval[] = [...Array(12).keys()].reverse().map((wn) => {
		const dayInMonth = new Date()
		dayInMonth.setMonth(now.getMonth() - wn)
		const monthStart = startOfMonth(dayInMonth)
		return {
			startDate: startOfMonth(dayInMonth),
			endDate: endOfMonth(monthStart)
		} as DateInterval
	})

	const loadMonthlyReport = (interval: DateInterval) => {
		setLoading(true)
		storage.getPlayTime(interval.startDate, interval.endDate).then((it) => {
			if (it.success) {
				setPlayTimeForMonth(it.result)
				setLoading(false)
			}
		})
	}
	const [currentMonthIdx, setCurrentMonthIdx] = useState<number>(months.length - 1);
	useEffect(() => {
		loadMonthlyReport(months[currentMonthIdx])
	}, [])
	const onNextMonth = () => {
		loadMonthlyReport(months[currentMonthIdx + 1])
		setCurrentMonthIdx(currentMonthIdx + 1)
	}
	const onPrevMonth = () => {
		loadMonthlyReport(months[currentMonthIdx - 1])
		setCurrentMonthIdx(currentMonthIdx - 1)
	}
	const currentText = () => {
		if ((months.length - 1) - currentMonthIdx == 0) {
			return "This month"
		}
		if ((months.length - 1) - currentMonthIdx == 1) {
			return "Previous month"
		}
		const s = months[currentMonthIdx].startDate.toISOString().substring(5, 7)
		return `${s}`
	}
	const modules = [
		new MonthlyModule(),
		new GamesModule(),
		new PieModule()
	]
	return (
		<div>
			<PanelSection title="by week">
				<PanelSectionRow>
					<Pager
						pages={months}
						currentIdx={currentMonthIdx}
						onNext={onNextMonth}
						onPrev={onPrevMonth}
						currentText={currentText}
					></Pager>
				</PanelSectionRow>
			</PanelSection>
			{
				!isLoading && modules.map(module => module.render(playTimeForMonth))
			}
		</div>
	)
}

export const ByWeekTab: VFC<{
	storage: Storage,
}> = ({ storage }) => {
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
	const modules = [
		new WeeklyModule(),
		new GamesModule(),
		new PieModule()
	]
	return (
		<div>
			<PanelSection>
				<PanelSectionRow>
					<Pager
						pages={weeks}
						currentIdx={currentWeekIdx}
						onNext={onNextWeek}
						onPrev={onPrevWeek}
						currentText={currentText}
					></Pager>
				</PanelSectionRow>
			</PanelSection>
			{
				!isLoading && modules.map(module => module.render(playTimeForWeek))
			}
		</div>
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

export function startOfMonth(date: Date): Date {
	const dt = new Date(date);
	return new Date(dt.getFullYear(), dt.getMonth(), 2)
}

export function endOfMonth(date: Date): Date {
	const dt = new Date(date);
	return new Date(dt.getFullYear(), dt.getMonth() + 1, 1)
}

