import {
    Dropdown,
    Field,
    PanelSectionRow,
    PanelSection,
    SidebarNavigation,
    ButtonItem,
} from 'decky-frontend-lib'
import { useEffect, useState, VFC } from 'react'
import { ChartStyle, DEFAULTS, PlayTimeSettings } from '../app/settings'
import { MANUALLY_ADJUST_TIME, MIGRATION_PAGE, navigateToPage } from './navigation'
import { useLocator } from '../locator'
import { Tab } from '../components/Tab'

export const GeneralSettings: VFC<{}> = () => {
    const { settings } = useLocator()
    let [current, setCurrent] = useState<PlayTimeSettings>(DEFAULTS)
    let [loaded, setLoaded] = useState<boolean>(false)

    let loadSettings = () => {
        setLoaded(false)
        settings.get().then((r) => {
            setCurrent(r)
            setLoaded(true)
        })
    }

    useEffect(() => {
        loadSettings()
    }, [])

    let updateSettings = async () => {
        await settings.save(current)
        loadSettings()
    }

    return (
        <div>
            {loaded && (
                <div>
                    <PanelSection title="Appearance">
                        <PanelSectionRow>
                            <Field label="Game charts type">
                                <Dropdown
                                    selectedOption={current?.gameChartStyle}
                                    rgOptions={[
                                        {
                                            label: 'Bar charts',
                                            data: ChartStyle.BAR,
                                        },
                                        {
                                            label: 'Bar and Pie charts',
                                            data: ChartStyle.PIE_AND_BARS,
                                        },
                                    ]}
                                    onChange={(v) => {
                                        current.gameChartStyle = v.data
                                        updateSettings()
                                    }}
                                ></Dropdown>
                            </Field>
                        </PanelSectionRow>
                    </PanelSection>
                    <PanelSection title="Notifications">
                        <PanelSectionRow>
                            <Field label="Remind me to take breaks">
                                <Dropdown
                                    selectedOption={current.reminderToTakeBreaksInterval}
                                    rgOptions={[
                                        { label: 'Never', data: -1 },
                                        { label: 'Every 15 min', data: 15 },
                                        { label: 'Every 30 min', data: 30 },
                                        { label: 'Every hour', data: 60 },
                                        { label: 'Every 2 hours', data: 120 },
                                    ]}
                                    onChange={(v) => {
                                        current.reminderToTakeBreaksInterval = v.data
                                        updateSettings()
                                    }}
                                ></Dropdown>
                            </Field>
                        </PanelSectionRow>
                    </PanelSection>
                </div>
            )}
        </div>
    )
}

export const TimeMigration: VFC<{}> = () => {
    return (
        <div>
            <PanelSection title="SteamLessTime / Metadeck migration">
                <PanelSectionRow>
                    <ButtonItem onClick={() => navigateToPage(MIGRATION_PAGE)}>
                        Migrate
                    </ButtonItem>
                </PanelSectionRow>
            </PanelSection>
            <PanelSection title="Change overall play time">
                <PanelSectionRow>
                    <ButtonItem onClick={() => navigateToPage(MANUALLY_ADJUST_TIME)}>
                        Change
                    </ButtonItem>
                </PanelSectionRow>
            </PanelSection>
        </div>
    )
}

export const SettingsPage: VFC<{}> = () => {
    return (
        <SidebarNavigation
            pages={[
                {
                    title: 'General',
                    content: (
                        <Tab>
                            <GeneralSettings />
                        </Tab>
                    ),
                },
                {
                    title: 'Time migration',
                    content: (
                        <Tab>
                            <TimeMigration />
                        </Tab>
                    ),
                },
            ]}
        />
    )
}
