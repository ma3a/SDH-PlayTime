import { DialogButton, Focusable } from "decky-frontend-lib";
import { focus_panel_no_padding, pager_container } from "../styles";

interface Props<T> {
    pages: T[],
    currentIdx: number,
    currentText: () => string,
    onNext: () => void,
    onPrev: () => void,
}

export const Pager: React.FC<Props<any>> = (props) => {
    const enableNextButton = props.currentIdx < (props.pages.length - 1)
    const enablePrevButton = props.currentIdx > 0

    const onNext = (_: MouseEvent) => {
        props.onNext()
    }
    const onPrev = (_: MouseEvent) => {
        props.onPrev()
    }
    return (
        <Focusable style={{ ...pager_container, ...focus_panel_no_padding }} flow-children="horizontal">
            <DialogButton style={{
                minWidth: "0px", padding: "10px 10px", width: "35px"
            }} disabled={!enablePrevButton} onClick={onPrev}>&lt;</DialogButton>

            <div className="title">{props.currentText()}</div>

            <DialogButton style={{
                minWidth: "0px", padding: "10px 10px", width: "35px"
            }} disabled={!enableNextButton} onClick={onNext}>&gt;</DialogButton>
        </Focusable >
    )
};