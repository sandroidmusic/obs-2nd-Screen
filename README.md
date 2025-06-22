# OBS ²nd Screen

A simple web-app that functions as a second-screen to control [OBS](https://obsproject.com/) via [Streamer.bot](https://streamer.bot/).
Optimized for Tablets / Mobile but can also be used on your computer of course.



## Feature Overview

* It's free and has no artificial limitations on how many actions/buttons you can create.
* Supports changing scenes, Mute- / Unmute-Control over your Audio Input Sources.
* Want to use two second-screens? No problem. Current state of OBS is synced across devices.
* See your Youtube Chat messages, on your second screen and write messages as well.
* Want to highlight a message and show it in your livestream? It offers a OBS Browser Overlay that you can add!



ℹ️ Twitch Chat and Youtube Superstickers/Superchats are currently not supported.



## Usage

* I will assume you are already familiar with [OBS](https://obsproject.com/) and [Streamer.bot](https://streamer.bot/). Hence i won't go into much detail on those applications.
* If you *just want to use* this web-app, it is already available from http://obs.sandroid.xyz.



> [!NOTE]
> Since your Streamer.bot instance is most likely running locally (no SSL available),
> the web-app **has to** run via `http` as well in order to communicate with it.
>
> * No data is transmitted or collected by this web-app 
> * All data is local and belongs to you ❤️

### Setting up OBS / Streamer.bot

1. Install [OBS](https://obsproject.com/), and make sure to [enable the WebSocket Server](https://obsproject.com/kb/remote-control-guide).
2. Install [Streamer.bot](https://streamer.bot/)
3. [Configure Streamer.bot](https://docs.streamer.bot/guide/broadcasters/obs-studio) to interact with your OBS Studio instance
4. In Streamer.bot go to Server/Clients → WebSocket Server
   1. If you want check the "Auto Start WebSocket Server" checkbox
   2. Take note of the `Address`and `Port` of this server. You will need it later.
   3. Press "Start Server"
5. In order for the web-app to work, you must import the predefined actions [found here](https://github.com/sandroidmusic/obs-2nd-Screen/blob/main/streamerbot-actions).
   1. Press "Import"
   2. Paste the [content of the file](https://github.com/sandroidmusic/obs-2nd-Screen/blob/main/streamerbot-actions) into "Import String"
   3. Press "Import"
6. Continue setting up your Platforms (like Youtube) if haven't done so yet



### Setting up OBS ²nd Screen

1. Open: http://obs.sandroid.xyz/control 
2. Open the settings by pressing the cogwheel on the top
3. Enter your `Address` and `Port` for your Streamer.bot WebSocket Server.
4. Configure your Actions



### Configuring Actions

Actions are defined as a Array of Objects [JSON structure](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON). Here's a basic example:

```json
[
  {
    "type": "Components.ToggleButton",
    "action": "Actions.SceneChange",
    "value": "{Name of Scene in OBS}"
    "radiogroup": "scenes",
    "image": "{A valid URL or Base64 String}",
    "color": "#0078ff",
    "label": "My Scene",
    
  },
  {
    "type": "Components.ToggleButton",
    "action": "Actions.AudioToggleMute",
    "value": "{Name of the Audio Input Source in OBS}"
    "image": "{A valid URL or Base64 String}",
    "color": "#0078ff",
    "label": "My Microphone",
    
  },
]
```

A single Action or Button includes the following properties:

| Property                       | Description                                                  |
| ------------------------------ | ------------------------------------------------------------ |
| `type`                         | A valid [UI component](https://github.com/sandroidmusic/obs-2nd-Screen/blob/main/src/objects/Constants.ts) reference. <br/>**Available values:** currently only `Components.ToggleButton` is available |
| `action`                       | A valid [action reference](https://github.com/sandroidmusic/obs-2nd-Screen/blob/main/src/objects/Constants.ts). <br/> **Available values:** <br/> - `Actions.SceneChange` - changes the active OBS scene <br/> - `Actions.AudioToggleMute` - Mutes/Unmutes an Audio Input Source |
| `value`                        | This is either the **exact** name of your OBS Scene or of your OBS Audio Input Source |
| `radiogroup` *(semi-optional)* | A string that defines which buttons are grouped together. <br/>Once buttons are grouped, only one button will be active within a radiogroup at a time. <br/> ⚠️ **Radiogroups are mandatory for Scenes.** |
| `image` *(optional)*           | Can be a URL or a Base64 String of an [Image](https://base64.guru/converter/encode/image) or a [SVG](https://base64.guru/converter/encode/image/svg). |
| `color` *(optional)*           | A HEX Color value to color the button. Here's [a random color](https://hue.tools/info?format=hex) for you. |
| `label` *(optional)*           | A string that will be used a label displayed on the button.  |



Once you are done setting up your actions, make sure to save them and you should be good to go.
Since all the data is stored in your browser, the app offers an Import/Export functionality that will download a JSON file that you can upload to other devices that you may want to use as a second screen.



## Project Notes / Setup

This project was built using [Vue.js](https://vuejs.org/) and uses the [Streamer.bot Websocket Client](https://streamerbot.github.io/client/) library.
If you'd like to make changes - download the code and run:

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
