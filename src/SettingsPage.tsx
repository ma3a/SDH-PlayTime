import { Dropdown, Field, Focusable, PanelSectionRow, PanelSection, SidebarNavigation, ButtonItem, showModal, ConfirmModal } from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { MigrationResult, SteamLessTimeMigrator } from "./app/migrator";
import { ChartStyle, DEFAULTS, PlayTimeSettings, Settings } from "./app/settings";
import { focus_panel_no_padding } from "./styles";

export const GeneralSettings: VFC<{
    settings: Settings,
}> = ({ settings }) => {
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
        <Focusable style={{ minWidth: "100%", minHeight: "100%", ...focus_panel_no_padding }}>
            {loaded && <div style={{ marginTop: "40px", height: "calc(100% - 40px)" }}>
                <PanelSection title="Appearance">
                    <PanelSectionRow>
                        <Field label="Game charts type">
                            <Dropdown selectedOption={current?.gameChartStyle} rgOptions={[
                                { label: "Bar charts", data: ChartStyle.BAR },
                                { label: "Pie charts", data: ChartStyle.PIE }
                            ]} onChange={
                                (v) => { current.gameChartStyle = v.data; updateSettings() }}></Dropdown>
                        </Field>
                    </PanelSectionRow>
                </PanelSection>
                <PanelSection title="Notifications">
                    <PanelSectionRow>
                        <Field label="Remind me to take breaks">
                            <Dropdown selectedOption={current.reminderToTakeBreaksInterval} rgOptions={[
                                { label: "Never", data: -1 },
                                { label: "Every 15 min", data: 15 },
                                { label: "Every 30 min", data: 30 },
                                { label: "Every hour", data: 60 },
                                { label: "Every 2 hours", data: 120 }
                            ]} onChange={
                                (v) => { current.reminderToTakeBreaksInterval = v.data; updateSettings() }}></Dropdown>
                        </Field>
                    </PanelSectionRow>
                </PanelSection>
            </div>}
        </Focusable >
    );
};

export const MigrationSettings: VFC<{ steamLessTimeMigrator: SteamLessTimeMigrator }> = ({ steamLessTimeMigrator }) => {
    const migrate = () => {
        steamLessTimeMigrator.migrate().then(it => {
            if (it.success) {
                let result = it.result
                showModal(
                    <ConfirmModal bAlertDialog strTitle={
                        <div>
                            {result.status == "DONE" && "Migrated successfully"}
                            {result.status == "ERROR" && "Unable to migrate data"}
                            {result.status == "PARTIAL_DONE" &&
                                "We were able to migrate some of the data"
                            }
                        </div>
                    }>
                        {result.errors.length > 0 &&
                            <PanelSection title="Errors">
                                {result.errors.map((it) =>
                                    <div>{it}</div>
                                )}
                            </PanelSection>
                        }
                    </ConfirmModal>
                )
            }
        })
    }

    return (
        <Focusable style={{ minWidth: "100%", minHeight: "100%", ...focus_panel_no_padding }}>
            <PanelSection title="SteamLessTime migration">
                <PanelSectionRow>
                    <ButtonItem onClick={migrate}>Migrate</ButtonItem>
                </PanelSectionRow>
            </PanelSection>
        </Focusable>
    )
}

export const SettingsPage: VFC<{
    settings: Settings, steamLessTimeMigrator: SteamLessTimeMigrator
}> = ({ settings, steamLessTimeMigrator }) => {
    return <SidebarNavigation pages={[
        {
            title: "General",
            content: <GeneralSettings settings={settings} />
        },
        {
            title: "Migration",
            content: <MigrationSettings steamLessTimeMigrator={steamLessTimeMigrator} />
        }
    ]} />
};
