import { App, PluginSettingTab, Setting } from "obsidian";
import ClockifyPlugin from "./main";
import {  defaultSettings } from "./settings";


export class ClockifySettingsTab extends PluginSettingTab {

    plugin: ClockifyPlugin;

    constructor(app: App, plugin: ClockifyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() : void {
        
        const {containerEl} = this;

        containerEl.empty();
		containerEl.createEl('h2', {text: 'Settings for Clockify plugin.'});

        new Setting(containerEl)
        .setName('Base Endpoint')
        .setDesc('Base endpoint for Clockify - this may change based on the type of account you have with Clockify.')
        .addText(text => text
            .setPlaceholder('Enter the base endpoint.')
            .setValue(this.plugin.settings.baseEndpoint)
            .onChange(async (value) => {
                console.log('BaseEndpoint: ' + value);

                this.plugin.settings.baseEndpoint = value.length ? value : defaultSettings.baseEndpoint;

                if(!this.plugin.settings.baseEndpoint.endsWith("/"))
                {
                    this.plugin.settings.baseEndpoint = this.plugin.settings.baseEndpoint + "/";
                }

                await this.plugin.saveSettings();
            }));

		new Setting(containerEl)
			.setName('API Token')
			.setDesc('API Token from Clockify')
			.addText(text => text
				.setPlaceholder('Enter your API Token')
				.setValue(this.plugin.settings.apiToken)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.apiToken = value;
					await this.plugin.saveSettings();
				}));

        new Setting(containerEl)
			.setName("Workspace Name")
			.setDesc("Clockify workspace name")
			.addText(text => text
				.setPlaceholder('Enter the workspace name to use')
				.setValue(this.plugin.settings.workspace)
				.onChange(async (value) => {
					console.log('Workspace: ' + value);
					this.plugin.settings.workspace = value;
					await this.plugin.saveSettings();
				}));

        new Setting(containerEl)
                .setName("Project Name")
                .setDesc("Clockify project name")
                .addText(text => text
                    .setPlaceholder('Enter the project name to use')
                    .setValue(this.plugin.settings.project)
                    .onChange(async (value) => {
                        console.log('Project: ' + value);
                        this.plugin.settings.project = value;
                        await this.plugin.saveSettings();
                    }));
    }
}

