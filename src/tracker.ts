
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

    let running = isRunning(tracker);
    let completed = isComplete(tracker);

    var icon: string;
    var toolTip: string;

    if(running) {
        icon = "stop-circle";
        toolTip = "End";
    } else if(completed) {
        icon = "edit";
        toolTip = "Update Description";
    }
    else {
        icon = "play-circle";
        toolTip = "Start";
    }

    let table = element.createEl("table", {cls: "clockify-tracker-table"});
    let descriptionCell = table.createEl("td");
    descriptionCell.addClass("clockify-tracker-timer");
    let buttonCell = table.createEl("td");
    buttonCell.addClass("clockify-tracker-timer");
    let durationCell = table.createEl("td");
    setCoundown(tracker, durationCell);
   
    let descriptionNameBox = new TextComponent(descriptionCell)
    .setPlaceholder("Description")
    .setDisabled(running)
    .onChange(s => {
        tracker.description = descriptionNameBox.getValue();
    });

    descriptionNameBox.inputEl.addClass("clockify-tracker-txt");
    descriptionNameBox.setValue(tracker.description);

    let btn = new ButtonComponent(buttonCell)
        .setClass("clickable-icon")
        .setIcon(`lucide-${icon}`)
        .setTooltip(toolTip)
        .onClick(async () => {
       
        if(running) {
            end(tracker);
        } else if(!completed) {
            start(tracker);
            descriptionNameBox.setDisabled(true);
        }
       
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
        // we delete the interval timer when the element is removed
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

    if(isRunning(tracker)) {
        return moment().diff(moment.unix(tracker.start));
    } else if (tracker.start == 0) {
        return 0;
    }

    let endTime = isComplete(tracker) ? moment.unix(tracker.end) : moment();
    return endTime.diff(moment.unix(tracker.start));
}

function isRunning(tracker: Tracker): boolean {
    
    if(tracker == null)
        return false;

    return tracker.start > 0 && tracker.end == 0;
}

function isComplete(tracker: Tracker): boolean {

    return tracker.end > 0;
}

function start(tracker: Tracker): void {
    
    if(!isRunning(tracker) && !isComplete(tracker)) {
        tracker.start = moment().unix();
    }
}

function end(tracker: Tracker): void {

    if(isRunning(tracker)) {
        tracker.end = moment().unix();
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