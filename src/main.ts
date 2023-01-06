import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import Clockify, { WorkspaceType } from "clockify-ts";
import { defaultSettings, ClockifySettings } from "./settings";
import { ClockifySettingsTab } from './settings-tab';
import { arrayBuffer } from 'stream/consumers';
import { ClockifyService } from './service';
import { displayTracker, loadTracker } from "./tracker";

// Remember to rename these classes and interfaces!

/*
interface ClockifySettings {
	APIToken: string;
	Workspace: string;
}

const DEFAULT_SETTINGS: ClockifySettings = {
	APIToken: '',
	Workspace : ''
}
*/


export default class ClockifyPlugin extends Plugin {
	settings: ClockifySettings;
	clockify: Clockify;
	service: ClockifyService;

	async onload() {
		await this.loadSettings();

		this.clockify = new Clockify(this.settings.apiToken);
		this.service = new ClockifyService(this, this.settings);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ClockifySettingsTab(this.app, this));


		this.registerMarkdownCodeBlockProcessor("clockify-timer", (s, e, i) => {
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


		//const projects = await this.clockify.workspace.withId(this.settings.Workspace).projects.get();

		//const workspace = await this.clockify.workspace.withId(this.settings.workspace);
		//const project = await this.clockify.workspace.withId(this.settings.workspace).projects.withId("63b4705f4ea5ce158d389d8c");
		//const projects = await this.clockify.workspace.withId(this.settings.workspace).projects.get();

		

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Clockify', (evt: MouseEvent) => {
			// Called when the user clicks the icon.

			
			
			//const result = this.service.startTimer("", "Some description");


			//new Notice(project.projectId);

//			new Notice(workspace.workspaceId);


//			projects.forEach(function (item) {
//				new Notice(item.name)
//
//			});
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');
	
		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});



		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}