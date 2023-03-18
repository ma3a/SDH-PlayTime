import { VFC, useEffect, useState } from 'react'
import { useLocator } from '../locator'
import { Paginated } from '../app/reports'
import { DailyStatistics, convertDailyStatisticsToGameWithTime } from '../app/model'
import { Pager } from '../components/Pager'
import { AverageAndOverall } from '../components/statistics/AverageAndOverall'
import { MonthView } from '../components/statistics/MonthView'
import { ChartStyle } from '../app/settings'
import { PieView } from '../components/statistics/PieView'
import { PanelSection, PanelSectionRow } from 'decky-frontend-lib'
import { formatMonthInterval } from '../app/formatters'
import { GamesTimeBarView } from '../components/statistics/GamesTimeBarView'

export const ReportMonthly: VFC = () => {
    const { reports, currentSettings: settings } = useLocator()
    const [isLoading, setLoading] = useState<Boolean>(false)
    const [currentPage, setCurrentPage] = useState<Paginated<DailyStatistics> | null>(
        null
    )

    useEffect(() => {
        setLoading(true)
        reports.monthlyStatistics().then((it) => {
            setCurrentPage(it)
            setLoading(false)
        })
    }, [])

    const onNextWeek = () => {
        setLoading(true)
        currentPage?.next().then((it) => {
            setCurrentPage(it)
            setLoading(false)
        })
    }
    const onPrevWeek = () => {
        setLoading(true)
        currentPage?.prev().then((it) => {
            setCurrentPage(it)
            setLoading(false)
        })
    }
    if (isLoading) {
        return <div>Loading...</div>
    }
    if (!currentPage) {
        return <div>Error while loading data</div>
    }
    return (
        <div>
            <PanelSection>
                <PanelSectionRow>
                    <Pager
                        onNext={onNextWeek}
                        onPrev={onPrevWeek}
                        currentText={formatMonthInterval(currentPage.current().interval)}
                        hasNext={currentPage.hasNext()}
                        hasPrev={currentPage.hasPrev()}
                    />
                </PanelSectionRow>
            </PanelSection>
            <AverageAndOverall statistics={currentPage.current().data} />
            <MonthView statistics={currentPage.current().data} />
            <GamesTimeBarView
                data={convertDailyStatisticsToGameWithTime(currentPage.current().data)}
            />
            {settings.gameChartStyle == ChartStyle.PIE_AND_BARS && (
                <PieView statistics={currentPage.current().data} />
            )}
        </div>
    )
}
