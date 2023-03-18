import { VFC, useEffect, useState } from 'react'
import { PageWrapper } from '../components/PageWrapper'
import { useLocator } from '../locator'
import { GameWithTime, SteamLessStatistics } from '../app/model'
import {
    ButtonItem,
    Dropdown,
    DropdownOption,
    Focusable,
    PanelSection,
    TextField,
} from 'decky-frontend-lib'
import { humanReadableTime } from '../app/formatters'
import { TableCSS, hide_text_on_overflow } from '../styles'
import { navigateBack } from './navigation'
import { excludeApps, nonSteamGamesPredicate } from '../app/time-manipulation'
import { ifNull, map } from '../utils'

interface TableRowsProps {
    gameId: string
    steamlessTimeTrackedSec: number
    playTimeTrackedSec: number | undefined
    appId: string | undefined
    desiredHours: number | undefined
}

export const SteamlessTimeMigrationPage: VFC = () => {
    const { timeManipulation: timeMigration } = useLocator()
    const [isLoading, setLoading] = useState<Boolean>(true)
    const [gameWithTimeByAppId, setGameWithTimeByAppId] = useState<
        Map<string, GameWithTime>
    >(new Map())
    const [tableRows, setTableRows] = useState<TableRowsProps[]>([])

    useEffect(() => {
        setLoading(true)
        Promise.all([
            timeMigration.fetchPlayTimeForAllGames([nonSteamGamesPredicate, excludeApps]),
            timeMigration.fetchSteamLessStatistics(),
        ]).then(([playTime, steamLess]) => {
            setGameWithTimeByAppId(playTime)
            setTableRows(toTableRows(playTime, steamLess))
            setLoading(false)
        })
    }, [])

    if (isLoading) {
        return <PageWrapper>Loading...</PageWrapper>
    }
    const gameOptions = Array.from(gameWithTimeByAppId.values()).map((it) => {
        return {
            data: it.game.id,
            label: it.game.name,
        } as DropdownOption
    })
    const onGameChange = (index: number, appId: string) => {
        const newRows = [...tableRows]
        newRows[index].appId = appId
        newRows[index].playTimeTrackedSec = gameWithTimeByAppId.get(appId)?.time
        newRows[index].desiredHours =
            (ifNull(newRows[index].playTimeTrackedSec, 0) +
                newRows[index].steamlessTimeTrackedSec) /
            3600
        setTableRows(newRows)
    }

    const onDesiredHoursChange = (index: number, hours: string) => {
        const newRows = [...tableRows]
        newRows[index].desiredHours = Number.parseFloat(hours)
        setTableRows(newRows)
    }

    const isRowValid = (row: TableRowsProps) => {
        return (
            row.appId !== undefined &&
            row.desiredHours !== undefined &&
            row.desiredHours > 0 &&
            gameWithTimeByAppId.get(row.appId!) !== undefined
        )
    }

    const saveMigration = async () => {
        const gamesToMigrate = tableRows
            .filter((it) => isRowValid(it))
            .map((it) => {
                return {
                    game: gameWithTimeByAppId.get(it.appId!)?.game,
                    time: it.desiredHours! * 3600,
                } as GameWithTime
            })
        await timeMigration.migrateSteamLessTime(gamesToMigrate)
        navigateBack()
    }

    const rowCorrectnessClass = (row: TableRowsProps) => {
        return isRowValid(row)
            ? TableCSS.table__row_correct
            : TableCSS.table__row_not_correct
    }

    return (
        <PageWrapper>
            <Focusable style={{ height: '100%', overflow: 'scroll' }}>
                <PanelSection>
                    <ButtonItem layout="below" onClick={() => saveMigration()}>
                        Migrate
                    </ButtonItem>
                    <div style={TableCSS.table__container}>
                        <div
                            className="header-row"
                            style={{
                                gridTemplateColumns: '20% 15% 25% 15% 15%',
                                ...TableCSS.header__row,
                            }}
                        >
                            <div style={TableCSS.header__col}>Prev ID</div>
                            <div style={TableCSS.header__col}>Prev Hours</div>
                            <div style={TableCSS.header__col}>Game</div>
                            <div style={TableCSS.header__col}>Tracked Time</div>
                            <div style={TableCSS.header__col}>Should be Hours</div>
                        </div>

                        {tableRows.map((row, idx) => (
                            <div
                                style={{
                                    gridTemplateColumns: '20% 15% 25% 15% 15%',
                                    ...TableCSS.table__row,
                                    ...rowCorrectnessClass(row),
                                }}
                            >
                                <div style={hide_text_on_overflow}>{row.gameId}</div>
                                <div>
                                    {humanReadableTime(row.steamlessTimeTrackedSec)}
                                </div>
                                <div>
                                    <Dropdown
                                        rgOptions={gameOptions}
                                        selectedOption={row.appId}
                                        onChange={(e) => onGameChange(idx, e.data)}
                                    />
                                </div>
                                <div>
                                    {map(row.playTimeTrackedSec, (it) =>
                                        humanReadableTime(it)
                                    )}
                                </div>
                                <div>
                                    <TextField
                                        mustBeNumeric
                                        value={row.desiredHours?.toFixed(2)?.toString()}
                                        onChange={(e) =>
                                            onDesiredHoursChange(idx, e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </PanelSection>
            </Focusable>
        </PageWrapper>
    )
}

function toTableRows(
    gameWithTimeByAppId: Map<string, GameWithTime>,
    steamlessTimeStatistics: SteamLessStatistics
): TableRowsProps[] {
    const rows = [] as TableRowsProps[]
    for (const gameId in steamlessTimeStatistics) {
        const time = steamlessTimeStatistics[gameId]
        const appId = appStore.GetAppOverviewByGameID(gameId)?.appid?.toString()
        rows.push({
            gameId: gameId,
            steamlessTimeTrackedSec: time,
            playTimeTrackedSec: gameWithTimeByAppId.get(appId)?.time,
            appId: appId,
            desiredHours: map(time, (it) => it / 3600),
        })
    }
    return rows
}
