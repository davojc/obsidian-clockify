export const defaultSettings: ClockifySettings = {
    apiToken: "",
    baseEndpoint: "https://api.clockify.me/api/v1/",
    workspace: "",
    project: "",
}

export interface ClockifySettings {
    apiToken: string;
    baseEndpoint: string;
	workspace: string;
    project: string;
}