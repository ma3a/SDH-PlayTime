export {
    Game as Game,
    GameWithTime,
    DailyStatistics,
    AppOverview,
    AppDetails,
    AppAchievements,
    AppAchievement,
    AppLanguages,
    AppStore,
    convertDailyStatisticsToGameWithTime,
    AppInfoStore,
}

interface Game {
    id: string
    name: string
}

interface GameWithTime {
    game: Game
    time: number
}

interface DailyStatistics {
    date: string
    games: GameWithTime[]
    total: number
}

function convertDailyStatisticsToGameWithTime(data: DailyStatistics[]): GameWithTime[] {
    let result: GameWithTime[] = []
    data.forEach((day) => {
        day.games.forEach((game) => {
            let found = result.find((g) => g.game.id === game.game.id)
            if (found) {
                found.time += game.time
            } else {
                result.push(game)
            }
        })
    })
    return result
}

interface AppOverview {
    __proto__: any
    appid: number
    InitFromProto: any
    OriginalInitFromProto: any
    display_name: string
    app_type: number
    mru_index: number
    rt_recent_activity_time: number
    minutes_playtime_forever: string
    minutes_playtime_last_two_weeks: number
    rt_last_time_played_or_installed: number
    rt_last_time_played: number
    rt_last_time_locally_played: number
    rt_original_release_date: number
    rt_steam_release_date: number
    size_on_disk: string
    m_gameid: string
    visible_in_game_list: boolean
    m_ulGameId: {
        low: number
        high: number
        unsigned: boolean
    }
    library_capsule_filename: string
    most_available_clientid: string
    selected_clientid: string
    rt_custom_image_mtime: number
    sort_as: string
    association: {
        name: string
        type: number
    }[]
    m_setStoreCategories: Set<number>
    m_setStoreTags: Set<number>
    per_client_data: [
        {
            clientid: string
            client_name: string
            display_status: number
            status_percentage: number
            installed: boolean
            bytes_downloaded: string
            bytes_total: string
            is_available_on_current_platform: boolean
            cloud_status: number
        }
    ]
    canonicalAppType: number
    local_per_client_data: {
        clientid: string
        client_name: string
        display_status: number
        status_percentage: number
        installed: boolean
        bytes_downloaded: string
        bytes_total: string
        is_available_on_current_platform: boolean
        cloud_status: number
    }
    most_available_per_client_data: {
        clientid: string
        client_name: string
        display_status: number
        status_percentage: number
        installed: boolean
        bytes_downloaded: string
        bytes_total: string
        is_available_on_current_platform: boolean
        cloud_status: number
    }
    selected_per_client_data: {
        clientid: string
        client_name: string
        display_status: number
        status_percentage: number
        installed: boolean
        bytes_downloaded: string
        bytes_total: string
        is_available_on_current_platform: boolean
        cloud_status: number
    }
    review_score_with_bombs: number
    review_percentage_with_bombs: number
    review_score_without_bombs: number
    review_percentage_without_bombs: number
    steam_deck_compat_category: number
}

interface AppAchievement {
    strID: string
    strName: string
    strDescription: string
    bAchieved: boolean
    rtUnlocked: number
    strImage: string
    bHidden: boolean
    flMinProgress: number
    flCurrentProgress: number
    flMaxProgress: number
    flAchieved: number
}

interface AppAchievements {
    nAchieved: number
    nTotal: number
    vecAchievedHidden: AppAchievement[]
    vecHighlight: AppAchievement[]
    vecUnachieved: AppAchievement[]
}

interface AppLanguages {
    strDisplayName: string
    strShortName: string
}

interface AppDetails {
    achievements: AppAchievements
    bCanMoveInstallFolder: boolean
    bCloudAvailable: boolean
    bCloudEnabledForAccount: boolean
    bCloudEnabledForApp: boolean
    bCloudSyncOnSuspendAvailable: boolean
    bCloudSyncOnSuspendEnabled: boolean
    bCommunityMarketPresence: boolean
    bEnableAllowDesktopConfiguration: boolean
    bFreeRemovableLicense: boolean
    bHasAllLegacyCDKeys: boolean
    bHasAnyLocalContent: boolean
    bHasLockedPrivateBetas: boolean
    bIsExcludedFromSharing: boolean
    bIsSubscribedTo: boolean
    bOverlayEnabled: boolean
    bOverrideInternalResolution: boolean
    bRequiresLegacyCDKey: boolean
    bShortcutIsVR: boolean
    bShowCDKeyInMenus: boolean
    bShowControllerConfig: boolean
    bSupportsCDKeyCopyToClipboard: boolean
    bVRGameTheatreEnabled: boolean
    bWorkshopVisible: boolean
    eAppOwnershipFlags: number
    eAutoUpdateValue: number
    eBackgroundDownloads: number
    eCloudSync: number
    eControllerRumblePreference: number
    eDisplayStatus: number
    eEnableThirdPartyControllerConfiguration: number
    eSteamInputControllerMask: number
    iInstallFolder: number
    lDiskUsageBytes: number
    lDlcUsageBytes: number
    nBuildID: number
    nCompatToolPriority: number
    nPlaytimeForever: number
    nScreenshots: number
    rtLastTimePlayed: number
    rtLastUpdated: number
    rtPurchased: number
    selectedLanguage: {
        strDisplayName: string
        strShortName: string
    }
    strCloudBytesAvailable: string
    strCloudBytesUsed: string
    strCompatToolDisplayName: string
    strCompatToolName: string
    strDeveloperName: string
    strDeveloperURL: string
    strDisplayName: string
    strExternalSubscriptionURL: string
    strFlatpakAppID: string
    strHomepageURL: string
    strLaunchOptions: string
    strManualURL: string
    strOwnerSteamID: string
    strResolutionOverride: string
    strSelectedBeta: string
    strShortcutExe: string
    strShortcutLaunchOptions: string
    strShortcutStartDir: string
    strSteamDeckBlogURL: string
    unAppID: number
    vecBetas: any[]
    vecDLC: any[]
    vecDeckCompatTestResults: any[]
    vecLanguages: AppLanguages[]
    vecLegacyCDKeys: any[]
    vecMusicAlbums: any[]
    vecPlatforms: string[]
    vecScreenShots: any[]
}

interface AppStore {
    UpdateAppOverview: any
    GetAppOverviewByAppID: (id: number) => AppOverview
    GetAppOverviewByGameID: (id: string) => AppOverview
    CompareSortAs: any
    allApps: AppOverview[]
    storeTagCounts: any
    GetTopStoreTags: any
    OnLocalizationChanged: any
    GetStoreTagLocalization: any
    GetLocalizationForStoreTag: any
    AsyncGetLocalizationForStoreTag: any
    sharedLibraryAccountIds: any
    siteLicenseApps: any
    GetIconURLForApp: any
    GetLandscapeImageURLForApp: any
    GetCachedLandscapeImageURLForApp: any
    GetVerticalCapsuleURLForApp: any
    GetPregeneratedVerticalCapsuleForApp: any
    GetCachedVerticalCapsuleURL: any
    GetCustomImageURLs: any
    GetCustomVerticalCapsuleURLs: any
    GetCustomLandcapeImageURLs: any
    GetCustomHeroImageURLs: any
    GetCustomLogoImageURLs: any
    GetStorePageURLForApp: any
    m_mapApps: any
}

interface AppInfoStore {
    OnAppOverviewChange: any
    OriginalOnAppOverviewChange: any
}
