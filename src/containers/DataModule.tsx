import { FC } from "react";
import { PlayTimeForDay } from "../app/model";
import { Focusable, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { focus_panel_no_padding } from "../styles";

export abstract class DataModule {
	protected abstract component: FC<{ data: PlayTimeForDay[] }>
	protected abstract name: string;

	render(data: PlayTimeForDay[]) {
		return <PanelSection title={this.name}>
			<PanelSectionRow>
				<Focusable style={focus_panel_no_padding} onActivate={() => { }}>
					<this.component data={data} />
				</Focusable>
			</PanelSectionRow>
		</PanelSection>
	}
}