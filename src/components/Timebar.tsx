import { humanReadablePlayTime } from "../app/formatters";
import { TimeBarCSS } from "../styles";
import { VerticalContainer } from "./VerticalContainer";

export const Timebar: React.FC<{ time: number, allTime: number }> = (props) => {
    const barWidth = (props.allTime != 0) ? `${(props.time / props.allTime) * 100}%` : '0%';
    return (
        <VerticalContainer>
            <div style={TimeBarCSS.time_bar__outline}>
                <div style={{ ...TimeBarCSS.time_bar__fill, ...{ width: barWidth } }} />
            </div>
            <div style={TimeBarCSS.time_bar__time_text}>
                {humanReadablePlayTime(props.time, true)}
            </div>
        </VerticalContainer>
    )
};