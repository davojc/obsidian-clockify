import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { defaultSettings, ClockifySettings } from "./settings";
import { ClockifySettingsTab } from './settings-tab';
import { ClockifyService } from './service';
import { displayTracker, loadTracker } from "./tracker";

export default class ClockifyPlugin extends Plugin {
	settings: ClockifySettings;
	service: ClockifyService;

	async onload() {
		await this.loadSettings();

		this.service = new ClockifyService(this, this.settings);

		this.addSettingTab(new ClockifySettingsTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor("clockify-timer", (s, e, i) => {

			console.log("CLOCKIFY: - " + s);

			let tracker = loadTracker(s);
			e.empty();
			displayTracker(this.service, tracker, e, () => i.getSectionInfo(e), this.settings);
		});

		this.addCommand({
			id: `insert`,
			name: `Insert Clockify Timer`,
			editorCallback: (e, _) => {
				e.replaceSelection("```clockify-timer\n```\n");
			}
		});
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, defaultSettings, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}