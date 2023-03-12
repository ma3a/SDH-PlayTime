import { Dropdown, Field, Focusable, PanelSection } from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { ChartStyle, DEFAULTS, PlayTimeSettings, Settings } from "./app/settings";
import { focus_panel_no_padding } from "./styles";

export const SettingsPage: VFC<{
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
                    <Field label="Game charts type">
                        <Dropdown selectedOption={current.gameChartStyle} rgOptions={[
                            { label: "Bar charts", data: ChartStyle.BAR },
                            { label: "Pie charts", data: ChartStyle.PIE }
                        ]} onChange={(v) => { current.gameChartStyle = v.data; updateSettings() }}></Dropdown>
                    </Field>
                </PanelSection>
            </div>}
        </Focusable >
    );
};