
import { moment, App, MarkdownSectionInformation, ButtonComponent, TextComponent } from "obsidian";
import { ClockifySettings } from "./settings";
import { ClockifyService } from "./service";

export enum State {
    Uninitialised,
    Running,
    Completed
}

export interface Tracker {
    state: State,
    workspaceId: string;
    projectId: string;
    id: string;
    description: string;
    start: number;
    end: number;
}

export async function saveTracker(service: ClockifyService, tracker: Tracker, app: App, section: MarkdownSectionInformation): Promise<void> {
    let file = app.workspace.getActiveFile();

    if(!file)
        return;

    let id = await service.saveTimer(tracker);

    if(tracker.id == "") {
        console.log("CLOCKIFY: Set Id " + id);
        tracker.id = id;
    }

    let content = await app.vault.read(file);

    // figure out what part of the content we have to edit
    let lines = content.split("\n");
    let prev = lines.filter((_, i) => i <= section.lineStart).join("\n");
    let next = lines.filter((_, i) => i >= section.lineEnd).join("\n");
    // edit only the code block content, leave the rest untouched
    content = `${prev}\n${JSON.stringify(tracker)}\n${next}`;

    await app.vault.modify(file, content);
}

export function loadTracker(json: string): Tracker {
    if (json) {     
        try {
            return JSON.parse(json);
        } catch (e) {
            console.log(`Failed to parse Tracker from ${json}`);
        }
    }
    return { state: State.Uninitialised, id: "", description: "", start: 0, end: 0, projectId: "", workspaceId: "" };
}

export function displayTracker(service: ClockifyService, tracker: Tracker, element: HTMLElement, getSectionInfo: () => MarkdownSectionInformation, settings: ClockifySettings): void {

    let uiDetails = getUiDetails(tracker);

    // Add in the workspace and project details. Useful hint in case it needs changing.
    let projectDetailsDiv = element.createDiv({cls: "clockify-tracker-heading"});
    projectDetailsDiv.createEl("span", { text: `${settings.workspace}/${settings.project}`});

    let table = element.createEl("table", {cls: "clockify-tracker-table"});
    let descriptionCell = table.createEl("td");
    descriptionCell.addClass("clockify-tracker-cell");
    let buttonCell = table.createEl("td");
    buttonCell.addClass("clockify-tracker-cell");
    let durationCell = table.createEl("td");
    setCoundown(tracker, durationCell);
   
    let descriptionNameBox = new TextComponent(descriptionCell)
    .setPlaceholder("Description")
    .setDisabled(tracker.state == State.Running)
    .onChange(s => {
        tracker.description = descriptionNameBox.getValue();
    });

    descriptionNameBox.inputEl.addClass("clockify-tracker-txt");
    descriptionNameBox.setValue(tracker.description);

    let btn = new ButtonComponent(buttonCell)
        .setClass("clickable-icon")
        .setIcon(`lucide-${uiDetails.icon}`)
        .setTooltip(uiDetails.toolTip)
        .onClick(async () => {
       

            switch(tracker.state)
            {
                case State.Running:
                    end(tracker);
                break;

                case State.Uninitialised:
                    start(tracker);
                    descriptionNameBox.setDisabled(true);
                break;
            }

            /*
        if(running) {
            end(tracker);
        } else if(!completed) {
            start(tracker);
            descriptionNameBox.setDisabled(true);
        }
       */
        await saveTracker(service, tracker, this.app, getSectionInfo());
    });

    btn.buttonEl.addClass("clockify-tracker-btn");
    table.createEl("tr").append(
        descriptionCell,
        createEl("td", { text: "Duration"}),
        durationCell,
        buttonCell
    )

    let intervalId = window.setInterval(() => {
        // Interval timer must be removed when window is closed.
        if (!element.isConnected) {
            window.clearInterval(intervalId);
            return;
        }
        setCoundown(tracker, durationCell);
    }, 1000);
}

function setCoundown(tracker: Tracker, current: HTMLElement) {
    let duration = getDuration(tracker);
    let durationText = formatDuration(duration);
    current.setText(durationText);
}

function getDuration(tracker: Tracker) {

    switch(tracker.state) {

        case State.Running:
            return moment().diff(moment.unix(tracker.start));

        case State.Completed:
            return moment.unix(tracker.end).diff(moment.unix(tracker.start));

        default:
            return 0;
    }
}    

function start(tracker: Tracker): void {
    
    if(tracker.state != State.Uninitialised) {
        return;
    }

    tracker.state = State.Running;
    tracker.start = moment().unix();
}

function end(tracker: Tracker): void {

    if(tracker.state != State.Running) {
        return;
    }
    
    tracker.state = State.Completed;
    tracker.end = moment().unix();
}

function getUiDetails(tracker: Tracker) {
    
    switch(tracker.state) {
        case State.Running: {
            return { icon: "stop-circle", toolTip: "End" };
        }

        case State.Completed: {
            return { icon: "edit", toolTip: "Update Description" };
        }

        case State.Uninitialised: {
            return { icon: "play-circle", toolTip: "Start" };
        }

        default: {
            return { icon: "x", toolTip: "Error" };
        }
    }
}

function formatDuration(totalTime: number): string {
    let duration = moment.duration(totalTime);

    let ret = "";
	if (duration.years() > 0)
		ret += duration.years() + "y ";
	if (duration.months() > 0)
		ret += duration.months() + "m ";
	if (duration.days() > 0)
		ret += duration.days() + "d ";
    if (duration.hours() > 0)
        ret += duration.hours() + "h ";
    if (duration.minutes() > 0)
        ret += duration.minutes() + "m ";
    ret += duration.seconds() + "s";
    return ret;
}