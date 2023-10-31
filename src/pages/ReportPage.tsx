import { useState, VFC } from 'react'
import { Tab } from '../components/Tab'
import { Tabs } from 'decky-frontend-lib'
import { PageWrapper } from '../components/PageWrapper'
import { ReportMonthly } from '../containers/ReportMonthly'
import { ReportWeekly } from '../containers/ReportWeekly'
import { ReportOverall } from '../containers/ReportOverall'
import { ReportActivity } from '../containers/ReportActivity'

export const DetailedPage: VFC = () => {
    const [currentTabRoute, setCurrentTabRoute] = useState<string>('all-time')
    return (
        <PageWrapper>
            <Tabs
                activeTab={currentTabRoute}
                onShowTab={(tabId: string) => {
                    setCurrentTabRoute(tabId)
                }}
                tabs={[
                    {
                        title: 'All Time',
                        content: (
                            <Tab>
                                <ReportOverall />
                            </Tab>
                        ),
                        id: 'all-time',
                    },
                    {
                        title: 'By Month',
                        content: (
                            <Tab>
                                <ReportMonthly />
                            </Tab>
                        ),
                        id: 'by-month',
                    },
                    {
                        title: 'By Week',
                        content: (
                            <Tab>
                                <ReportWeekly />
                            </Tab>
                        ),
                        id: 'by-week',
                    },
                    {
                        title: 'Activity Feed',
                        content: (
                            <Tab>
                                <ReportActivity />
                            </Tab>
                        ),
                        id: 'feed',
                    },
                ]}
            />
        </PageWrapper>
    )
}
