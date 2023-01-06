import { moment, requestUrl, RequestUrlParam, RequestUrlResponse } from "obsidian";
import { traceDeprecation } from "process";
import { stringify } from "querystring";
import { json } from "stream/consumers";
import ClockifyPlugin from "./main";
import { ClockifySettings } from "./settings";
import { Tracker } from "./tracker";

export interface TimerEntry {
    id: string;
    description: string;
    startTime: number;
    endTime: number;
}

export interface Project {
    id: string;
    name: string;
}

export class ClockifyService {
    app: ClockifyPlugin;
    settings: ClockifySettings;

    timestampFormat: string = "YYYY-MM-DDTHH:mm:ss[Z]";

    constructor(app: ClockifyPlugin, settings: ClockifySettings) {
        this.app = app;
        this.settings = settings;
    }


    async saveTimer(tracker: Tracker): Promise<string> {


        if(tracker.workspaceId == "" || tracker.projectId == "")
        {
            let  workspaceId = await this.getObjectId(`${this.settings.baseEndpoint}workspaces`, this.settings.workspace);
            let  projectId = await this.getObjectId(`${this.settings.baseEndpoint}workspaces/${workspaceId}/projects`, this.settings.project);

            tracker.workspaceId = workspaceId;
            tracker.projectId = projectId;
        }

        var url = `${this.settings.baseEndpoint}workspaces/${tracker.workspaceId}/time-entries`;

        if(tracker.id != '') {
            url = url + "/" + tracker.id;
        }

        console.log("CLOCKIFY: " + url);

        var startTime = moment.unix(tracker.start).format(this.timestampFormat); 

        let json: string;

        if(tracker.end == 0) {

            json = JSON.stringify({
                start: startTime,
                description: tracker.description,
                projectId: tracker.projectId
            })
        }
        else {
            var endTime = moment.unix(tracker.end).format(this.timestampFormat);
            json = JSON.stringify({
                start: startTime,
                end: endTime,
                description: tracker.description,
                projectId: tracker.projectId
            })
        }

        console.log("CLOCKIFY: Body - " + json);

        let method: string = tracker.id == "" ? "POST" : "PUT";

        const options: RequestUrlParam = { url: url, method: method, headers: { 'X-Api-Key': this.settings.apiToken, 'Content-Type': 'application/json' }, body: json }

        console.log("CLOCKIFY: Options - " + JSON.stringify(options));

        var response: RequestUrlResponse;

        try
        {
            response = await requestUrl(options);

            return response.json.id;
        }
        catch(e) {
            console.log("CLOCKIFY: + " + JSON.stringify(e));
        }

        return "";
    }

    async getObjectId(url: string, objectName: string) : Promise<string> {

        const options: RequestUrlParam = { url: url, method: "GET", headers: {'X-Api-Key': this.settings.apiToken}}

        //console.log("CLOCKIFY: GetObjectId - " + url);

        try
        {
            const response = await requestUrl(options);

            for(var i = 0; i < response.json.length; i++) {
                
                console.log("CLOCKIFY: Name - " + response.json[i].name);
                
                if(response.json[i].name == objectName)
                {
                    return response.json[i].id;
                }
            }
        }
        catch(e) {
            console.log("CLOCKIFY: + " + JSON.stringify(e));
        }

        return "";
    }

    /*
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
*/

}