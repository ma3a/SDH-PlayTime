import { VFC, useEffect, useState, useRef } from 'react'
import { Session } from '../app/model'
import { useLocator } from '../locator'
import { ActivityItem } from '../components/statistics/ActivityItem'
import { Focusable } from 'decky-frontend-lib'

export const ReportActivity: VFC = () => {
    const { reports } = useLocator()

    const [currentPage, setCurrentPage] = useState<any>()
    const [data, setData] = useState<Session[]>([])
    const [isLoading, setLoading] = useState<boolean>(false)
    const afterLastElementRef = useRef(null)

    useEffect(() => {
        setLoading(true)
        reports.sessionsFeed().then((it) => {
            setCurrentPage(it)
            setData((prev) => [...prev, ...it.current().data])
            setLoading(false)
        })
    }, [])

    const fetchMore = () => {
        setLoading(true)
        if (!currentPage.hasNext()) {
            setLoading(false)
            return
        }
        currentPage.next().then((it) => {
            setData([...data, ...it.current().data])
            setCurrentPage(it)
            setLoading(false)
        })
    }

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 1.0,
        }
        const callback = (entries) => {
            const [entry] = entries
            if (entry.isIntersecting) {
                fetchMore()
            }
        }
        const observer = new IntersectionObserver(callback, options)
        if (afterLastElementRef.current) {
            observer.observe(afterLastElementRef.current)
        }
    }, [afterLastElementRef.current])

    return (
        <div>
            {data.map((session) => (
                <Focusable>
                    <ActivityItem session={session} />
                </Focusable>
            ))}
            {data.length > 0 && <div ref={afterLastElementRef}></div>}
            {isLoading && <div>Loading...</div>}
        </div>
    )
}
