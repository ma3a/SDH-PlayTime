//import logger from '../utils';
import { EventBus, Mountable } from './system';
import { Storage } from "./Storage";
import { updatePlaytimes } from '../RoutePatches';

export { SteamLifecycle }

class SteamLifecycle implements Mountable {
    private eventBus: EventBus;
    private storage: Storage;

    constructor(eventBus: EventBus, storage: Storage) {
        this.eventBus = eventBus;
        this.storage = storage;
    }

    public mount() {
        if (this.eventBus && this.storage) {
            this.eventBus.addSubscriber((event) => {
                switch (event.type) {
                    case "Mount":
                        this.mounted();
                        break;

                    case "UserLoggedIn":
                        this.userLoggedIn(event.username);
                        break;

                    case "UserLoggedOut":
                        this.userLoggedOut();
                        break;
                }
            }
            );
        }
    }

    public unMount() {
    }

    private mounted() {
        //logger.trace(`SteamLifecycleMounted`);
        updatePlaytimes(this.storage);
    }

    private userLoggedIn(username: string) {
        //logger.trace(`UserLoggedIn (@${username})`);
    }

    private userLoggedOut() {
        //logger.trace(`UserLoggedOut`);
    }

}
