import { Navigation } from 'decky-frontend-lib'

export let SETTINGS_ROUTE = '/playtime/settings'
export let DETAILED_REPORT_ROUTE = '/playtime/detailed-report'
export let MANUALLY_ADJUST_TIME = '/playtime/manually-adjust-time'

export function navigateToPage(url: string) {
    Navigation.CloseSideMenus()
    Navigation.Navigate(url)
}

export function navigateBack() {
    Navigation.CloseSideMenus()
    Navigation.NavigateBack()
}
