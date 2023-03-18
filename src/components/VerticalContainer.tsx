import { VerticalContainerCSS } from '../styles'

export const VerticalContainer: React.FC<{}> = (props) => {
    return <div style={VerticalContainerCSS.vertical__container}>{props.children}</div>
}
