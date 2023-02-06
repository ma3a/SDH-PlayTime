import { humanReadablePlayTime } from "../app/formatters";
import { TimeBarCSS } from "../styles";
import { VerticalContainer } from "./VerticalContainer";

export const Timebar: React.FC<{ time: number, maxTime: number }> = (props) => {
    const barWidth = (props.maxTime != 0) ? `${(props.time / props.maxTime) * 100}%` : '0%';
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