# Clockify Timer

Simple timer integrated with the Clockify service (https://clockify.me).

![A screenshot of the plugin in action, where you can see an active time tracker for a project](https://raw.githubusercontent.com/davojc/obsidian-clockify/master/screenshot-usage.png)

## Configuration

There is some configuration that is required for the Clockify Timer to work.

### Base Endpoint

![A screenshot of the configuration page.](https://raw.githubusercontent.com/davojc/obsidian-clockify/master/screenshot-config.png)

The first setting is the base endpoint for Clockify's API service. The default setting is usually fine (https://api.clockify.me/api/v1/). More information can be found at the Clockify API documentation site: https://clockify.me/developers-api

### API Token

You need to provide the API Token from your Clockify user account. This can be generated on the settings page found here: https://app.clockify.me/user/settings.

### Workspace Name

Enter the workspace name that you are wanting to use to add timers to.

### Project Name (optional)

Enter the project that you would like to add the timer to. If you leave this blank, it will be uploaded without a project.

## Usage

Now you have configured the plugin, it is time to get started tracking a task with Clockify from within an Obsidian note, open up the note that you want to track your time in and then use the code block:

````
```clockify-timer
```
````

You will now see the timer tracker inserted. Simply add a description (it can be added/updated after the timer has stopped) and press the **Start** button. Once you are done with your task, simple press the **End** button. You can update the description before or after the time runs.

You can also insert a Clockify Timer wherever the cursor resides in a note by opening your command palette and execute the `Insert Clockify Timer` command. 

## What it does

The time tracker is a code block that stores information about when the timer was started and when it was stopped as well as information returned from Clockify when the timer is registered. As this information is stored within the code block you can switch notes, close Obsidian etc without worrying about the timer being lost. 

The codeblock reveals this JSON data. Be careful changing this JSON as you may lose connection with the corresponding timer in Clockify.

## Roadmap

There aren't that many further plans for this plugin, it really has a single intended purpose.

It might be nice to make some more dynamic options retrieved from Clockify such as Project list and Task list.

## Acknowledgements

Shout out to the Super Simple Time Tracker (https://github.com/Ellpeck/ObsidianSimpleTimeTracker) for inspiration on the approach.