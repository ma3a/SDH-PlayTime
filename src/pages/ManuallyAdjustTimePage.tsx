import { VFC, useEffect, useState } from 'react'
import { PageWrapper } from '../components/PageWrapper'
import { useLocator } from '../locator'
import { GameWithTime } from '../app/model'
import {
    ButtonItem,
    Dropdown,
    DropdownOption,
    Focusable,
    PanelSection,
    TextField,
} from 'decky-frontend-lib'
import { humanReadableTime } from '../app/formatters'
import { TableCSS } from '../styles'
import { navigateBack } from './navigation'
import { excludeApps } from '../app/time-manipulation'
import { ifNull, map } from '../utils'

interface TableRowsProps {
    appId: string | undefined
    playTimeTrackedSec: number | undefined
    desiredHours: number | undefined
}

export const ManuallyAdjustTimePage: VFC = () => {
    const { timeManipulation: timeMigration } = useLocator()
    const [isLoading, setLoading] = useState<Boolean>(true)
    const [gameWithTimeByAppId, setGameWithTimeByAppId] = useState<
        Map<string, GameWithTime>
    >(new Map())
    const [tableRows, setTableRows] = useState<TableRowsProps[]>([])

    useEffect(() => {
        setLoading(true)
        timeMigration.fetchPlayTimeForAllGames([excludeApps]).then((playTime) => {
            setGameWithTimeByAppId(playTime)
            setTableRows([
                {
                    appId: undefined,
                    desiredHours: undefined,
                    playTimeTrackedSec: undefined,
                },
            ])
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
        newRows[index].desiredHours = ifNull(newRows[index].playTimeTrackedSec, 0) / 3600
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
        await timeMigration.applyManualOverallTimeCorrection(gamesToMigrate[0])
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
                                gridTemplateColumns: '50% 25% 25%',
                                ...TableCSS.header__row,
                            }}
                        >
                            <div style={TableCSS.header__col}>Game</div>
                            <div style={TableCSS.header__col}>Tracked Time</div>
                            <div style={TableCSS.header__col}>Should be Hours</div>
                        </div>

                        {tableRows.map((row, idx) => (
                            <Focusable
                                flow-children="horizontal"
                                style={{
                                    gridTemplateColumns: '50% 25% 25%',
                                    ...TableCSS.table__row,
                                    ...rowCorrectnessClass(row),
                                }}
                            >
                                <Dropdown
                                    rgOptions={gameOptions}
                                    selectedOption={row.appId}
                                    onChange={(e) => onGameChange(idx, e.data)}
                                />
                                <div>
                                    {map(row.playTimeTrackedSec, (it) =>
                                        humanReadableTime(it)
                                    )}
                                </div>
                                <TextField
                                    mustBeNumeric
                                    onChange={(e) =>
                                        onDesiredHoursChange(idx, e.target.value)
                                    }
                                />
                            </Focusable>
                        ))}
                    </div>
                </PanelSection>
            </Focusable>
        </PageWrapper>
    )
}
