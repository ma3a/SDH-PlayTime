import { CSSProperties } from "react";

export const BLUE_COLOR = "#1A9FFF"
const DARK_GREY = "#4c4c4c"
const DEFAULT_BORDER_RADIUS = "2px"

export const pager_container: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
}

export const focus_panel_no_padding: CSSProperties = {
    padding: "0px 0px"
}

export const hide_text_on_overflow: CSSProperties = {
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "100%",
    whiteSpace: "nowrap"
}

export const TimeBarCSS = {
    time_bar__outline: {
        width: "100%",
        height: "10px",
        backgroundColor: DARK_GREY,
        borderRadius: DEFAULT_BORDER_RADIUS
    } as CSSProperties,

    time_bar__fill: {
        height: "10px",
        backgroundColor: BLUE_COLOR,
        borderRadius: DEFAULT_BORDER_RADIUS
    } as CSSProperties,

    time_bar__time_text: {
        fontSize: "10px"
    } as CSSProperties
}

export const HorizontalContainerCSS = {
    horizontal__container: {
        display: "flex",
        flexDirection: "row",
        alignContent: "space-between"
    } as CSSProperties
}

export const VerticalContainerCSS = {
    vertical__container: {
        display: "flex",
        flexDirection: "column",
        alignContent: "space-between"
    } as CSSProperties
}