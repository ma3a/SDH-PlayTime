//import logger from '../utils';
import { EventBus, Mountable } from '../app/system'
import { Backend } from '../app/backend'

export { SteamLifecycle }

class SteamLifecycle implements Mountable {
    private eventBus: EventBus
    private storage: Backend

    constructor(eventBus: EventBus, storage: Backend) {
        this.eventBus = eventBus
        this.storage = storage
    }

    public mount() {
        if (this.eventBus && this.storage) {
            this.eventBus.addSubscriber((event) => {
                switch (event.type) {
                    case 'Mount':
                        this.mounted()
                        break
                }
            })
        }
    }

    public unMount() {}

    private mounted() {}
}
