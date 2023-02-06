import {
    definePlugin,
    Router,
    ServerAPI,
    staticClasses,
    SteamClient,
} from "decky-frontend-lib";
import { Content } from './App'
import { FaClock, FaTimesCircle } from "react-icons/fa";
import { EventBus, Mountable, systemClock } from "./app/system";
import { Storage } from "./app/Storage"
import { SteamEventMiddleware } from "./app/middleware";
import { SessionPlayTime } from "./app/SessionPlayTime";

declare global {
    // @ts-ignore
    let SteamClient: SteamClient;
}

export default definePlugin((serverApi: ServerAPI) => {
    let clock = systemClock
    let eventBus = new EventBus()

    let mounts: Array<Mountable> = []

    let storage = new Storage(eventBus, serverApi)
    let sessionPlayTime = new SessionPlayTime(eventBus)

    mounts.push(new SteamEventMiddleware(eventBus, clock, Router))

    mounts.forEach((it) => { it.mount() })

    return {
        title: <div className={staticClasses.Title}>PlayTime</div>,
        content: <Content storage={storage} sessionPlayTime={sessionPlayTime} />,
        icon: <FaClock />,
        onDismount() {
            mounts.forEach((it) => { it.unMount() })
        },
    };
});