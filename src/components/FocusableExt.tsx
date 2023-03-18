import { Focusable } from 'decky-frontend-lib'
import { focus_panel_no_padding } from '../styles'

export const FocusableExt: React.FC<{}> = (props) => {
    return (
        <Focusable style={focus_panel_no_padding} onActivate={() => {}}>
            {props.children}
        </Focusable>
    )
}
