import { VFC, useEffect, useState } from 'react'
import { GameWithTime } from '../app/model'
import { useLocator } from '../locator'
import { GamesTimeBarView } from '../components/statistics/GamesTimeBarView'

export const ReportOverall: VFC = () => {
    const { reports } = useLocator()
    const [data, setData] = useState<GameWithTime[]>([])
    const [isLoading, setLoading] = useState<Boolean>(false)

    useEffect(() => {
        setLoading(true)
        reports.overallStatistics().then((it) => {
            setData(it)
            setLoading(false)
        })
    }, [])

    if (isLoading) {
        return <div>Loading...</div>
    }
    if (!data) {
        return <div>Error while loading data</div>
    }
    return (
        <div>
            <GamesTimeBarView data={data} />
        </div>
    )
}
