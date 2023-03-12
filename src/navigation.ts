import { Router } from "decky-frontend-lib";

export let SETTINGS_ROUTE = "/playtime-settings"
export let DETAILED_REPORT_ROUTE = "/playtime-detailed-report"

export function navigateToPage(url: string) {
    Router.CloseSideMenus();
    Router.Navigate(url);
}