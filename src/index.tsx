import {
	afterPatch,
	definePlugin, findInReactTree, findModuleChild, Patch, Router,
	ServerAPI,
	staticClasses,
	SteamClient, wrapReactType,
} from "decky-frontend-lib";
import {Content} from './App'
import {FaClock} from "react-icons/fa";
import {EventBus, Mountable, systemClock} from "./app/system";
import {Storage} from "./app/Storage"
import {SteamEventMiddleware} from "./app/middleware";
import {SessionPlayTime} from "./app/SessionPlayTime";
import {patchAppPage, patchHomePage, patchLibraryPage, updatePlaytimes} from "./RoutePatches";
import {AppStore} from "./app/model";
import logger from "./utils";

declare global
{
	// @ts-ignore
	let SteamClient: SteamClient;
	let appStore: AppStore;
}

const AppDetailsSections = findModuleChild((m) =>
{
	if (typeof m!=='object') return;
	for (const prop in m)
	{
		if (
				m[prop]?.toString &&
				m[prop].toString().includes("bShowGameInfo")
		) return m[prop];
	}
	return;
});

function registerForLoginStateChange(onLogin: (username: string) => void, onLogout: () => void): () => void
{
	try
	{
		let isLoggedIn: boolean | null = null;
		return (SteamClient as SteamClient).User.RegisterForLoginStateChange((username: string) =>
		{
			if (username==="")
			{
				if (isLoggedIn!==false)
				{
					onLogout();
				}
				isLoggedIn = false;
			} else
			{
				if (isLoggedIn!==true)
				{
					onLogin(username);
				}
				isLoggedIn = true;
			}
		}).unregister;
	} catch (error)
	{
		console.error(error);
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		return () =>
		{
		};
	}
}


export default definePlugin((serverApi: ServerAPI) =>
{
	let clock = systemClock
	let eventBus = new EventBus()

	let mounts: Array<Mountable> = []

	let storage = new Storage(eventBus, serverApi)
	let sessionPlayTime = new SessionPlayTime(eventBus)
	let overviewHook: { unregister: () => void; } | undefined

	mounts.push(new SteamEventMiddleware(eventBus, clock, Router))
	mounts.push(patchAppPage(serverApi, storage))
	mounts.push(patchHomePage(serverApi, storage))
	mounts.push(patchLibraryPage(serverApi, storage))
	let loginHook: () => void;
	mounts.push({
		mount()
		{
			loginHook = registerForLoginStateChange(() =>
			{
				if (overviewHook==undefined)
				{
					overviewHook = SteamClient.Apps.RegisterForAppOverviewChanges(() =>
					{
						logger.info("App overview changed");
						updatePlaytimes(storage);
					});
					updatePlaytimes(storage);
				}
			}, () =>
			{
				if (overviewHook!=undefined)
				{
					overviewHook.unregister();
					overviewHook = undefined;
				}
			});
		},
		unMount()
		{
			loginHook();
		}
	})
	let tabHook: Patch;
	mounts.push({
		mount()
		{
			tabHook = afterPatch(AppDetailsSections.prototype, 'render', (_: Record<string, unknown>[], ret1: any) =>
			{
				logger.info("ret1", ret1);
				const element1 = findInReactTree(ret1.props.children, (x) => x?.props?.onTheaterMode);
				logger.info("element1", element1);
				wrapReactType(element1.type);
				afterPatch(element1, "type", (_, ret2: any) =>
				{
					logger.info("ret2", ret2);
					wrapReactType(ret2.type);
					afterPatch(ret2, "type", (_, ret3: any) =>
					{
						logger.info("ret3", ret3);
						const element2 = findInReactTree(ret3.props.children, (x) => x?.props?.fnOnCancelFromTabHeader);
						logger.info("element2", element2);
						wrapReactType(element2.type);
						afterPatch(element2, "type", (_, ret4: any) =>
						{
							logger.info("ret4", ret4);
							ret4.props.tabs.push({
								id: "PlayTime",
								title: "Play Time",
								content: <Content storage={storage} sessionPlayTime={sessionPlayTime} />
							})
							return ret4;
						});
						return ret3;
					})
					return ret2;
				})
				return ret1;
			});
		},
		unMount()
		{
			tabHook.unpatch()
		}
	})

	mounts.forEach((it) => { it.mount() })


	return {
        title: <div className={staticClasses.Title}>PlayTime</div>,
        content: <Content storage={storage} sessionPlayTime={sessionPlayTime} />,
        icon: <FaClock />,
        onDismount() {
            mounts.forEach((it) => { it.unMount() })
	        // sectionHook.unpatch()
        },
    };
});