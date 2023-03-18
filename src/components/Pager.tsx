import { DialogButton, Focusable } from 'decky-frontend-lib'
import { focus_panel_no_padding, pager_container } from '../styles'

export const Pager: React.FC<{
    currentText: string
    onNext: () => void
    onPrev: () => void
    hasNext: boolean
    hasPrev: boolean
}> = (props) => {
    return (
        <Focusable
            style={{ ...pager_container, ...focus_panel_no_padding }}
            flow-children="horizontal"
        >
            <DialogButton
                style={{
                    minWidth: '0px',
                    padding: '10px 10px',
                    width: '35px',
                }}
                disabled={!props.hasPrev}
                onClick={props.onPrev}
            >
                &lt;
            </DialogButton>

            <div className="title">{props.currentText}</div>

            <DialogButton
                style={{
                    minWidth: '0px',
                    padding: '10px 10px',
                    width: '35px',
                }}
                disabled={!props.hasNext}
                onClick={props.onNext}
            >
                &gt;
            </DialogButton>
        </Focusable>
    )
}
