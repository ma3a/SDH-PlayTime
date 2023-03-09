export { GameCompactInfo, PlayTimeForDay, GameWithPlayTime, OverallPlayTimes, AppOverview, AppStore }

interface GameCompactInfo {
    appId: string,
    name: string
}

interface PlayTimeForDay {
    date: string,
    games: GameWithPlayTime[]
    totalTime: number
}

interface GameWithPlayTime {
    gameId: string,
    gameName: string,
    time: number
}

interface OverallPlayTimes
{
	[gameId: string]: number
}

interface AppOverview
{
	__proto__: any;
	"appid": number,
	"display_name": string,
	"app_type": number,
	"mru_index": number,
	"rt_recent_activity_time": number,
	"minutes_playtime_forever": string,
	"minutes_playtime_last_two_weeks": number,
	"rt_last_time_played_or_installed": number,
	"rt_last_time_played": number,
	"rt_last_time_locally_played": number,
	"rt_original_release_date": number,
	"rt_steam_release_date": number,
	"size_on_disk": string,
	"m_gameid": string,
	"visible_in_game_list": boolean,
	"m_ulGameId": {
		"low": number,
		"high": number,
		"unsigned": boolean
	},
	"library_capsule_filename": string,
	"most_available_clientid": string,
	"selected_clientid": string,
	"rt_custom_image_mtime": number,
	"sort_as": string,
	"association": {
		name: string,
		type: number
	}[],
	"m_setStoreCategories": Set<number>,
	"m_setStoreTags": Set<number>,
	"per_client_data": [
		{
			"clientid": string,
			"client_name": string,
			"display_status": number,
			"status_percentage": number,
			"installed": boolean,
			"bytes_downloaded": string,
			"bytes_total": string,
			"is_available_on_current_platform": boolean,
			"cloud_status": number
		}
	],
	"canonicalAppType": number,
	"local_per_client_data": {
		"clientid": string,
		"client_name": string,
		"display_status": number,
		"status_percentage": number,
		"installed": boolean,
		"bytes_downloaded": string,
		"bytes_total": string,
		"is_available_on_current_platform": boolean,
		"cloud_status": number
	},
	"most_available_per_client_data": {
		"clientid": string,
		"client_name": string,
		"display_status": number,
		"status_percentage": number,
		"installed": boolean,
		"bytes_downloaded": string,
		"bytes_total": string,
		"is_available_on_current_platform": boolean,
		"cloud_status": number
	},
	"selected_per_client_data": {
		"clientid": string,
		"client_name": string,
		"display_status": number,
		"status_percentage": number,
		"installed": boolean,
		"bytes_downloaded": string,
		"bytes_total": string,
		"is_available_on_current_platform": boolean,
		"cloud_status": number
	},
	"review_score_with_bombs": number,
	"review_percentage_with_bombs": number,
	"review_score_without_bombs": number,
	"review_percentage_without_bombs": number,
	"steam_deck_compat_category": number
}

interface AppStore
{
	UpdateAppOverview: any,
	GetAppOverviewByAppID: (id: number) => AppOverview,
	GetAppOverviewByGameID: (id: string) => AppOverview,
	CompareSortAs: any,
	allApps: any,
	storeTagCounts: any,
	GetTopStoreTags: any,
	OnLocalizationChanged: any,
	GetStoreTagLocalization: any,
	GetLocalizationForStoreTag: any,
	AsyncGetLocalizationForStoreTag: any,
	sharedLibraryAccountIds: any,
	siteLicenseApps: any,
	GetIconURLForApp: any,
	GetLandscapeImageURLForApp: any,
	GetCachedLandscapeImageURLForApp: any,
	GetVerticalCapsuleURLForApp: any,
	GetPregeneratedVerticalCapsuleForApp: any
	GetCachedVerticalCapsuleURL: any,
	GetCustomImageURLs: any,
	GetCustomVerticalCapsuleURLs: any,
	GetCustomLandcapeImageURLs: any,
	GetCustomHeroImageURLs: any,
	GetCustomLogoImageURLs: any,
	GetStorePageURLForApp: any
}
