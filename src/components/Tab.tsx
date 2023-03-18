import { Focusable, PanelSection, PanelSectionRow } from 'decky-frontend-lib'
import { focus_panel_no_padding } from '../styles'

export const Tab: React.FC = ({ children }) => {
    return (
        <PanelSection>
            <PanelSectionRow>
                <Focusable style={{ minHeight: '100%', ...focus_panel_no_padding }}>
                    {children}
                </Focusable>
            </PanelSectionRow>
        </PanelSection>
    )
}
