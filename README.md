# SyncPlay

A lightweight Chrome extension (Manifest V3) that automatically coordinates playback between **YouTube** and **YouTube Music**.

Built for developers and learners who listen to background music while coding along with YouTube tutorials: pause your tutorial and your music resumes automatically; hit play on the tutorial and your music pauses instantly.

## Features

- **Automatic Audio Handoff**: Playing a YouTube video pauses YouTube Music; pausing or finishing the video resumes YouTube Music.
- **One-Click Toggle**: Quickly activate or deactivate SyncPlay from the popup whenever you want manual control.
- **Toolbar Status Badge**: Displays an `ON` indicator on the extension icon when automation is active.
- **Smart Playback Detection**:
  - Ignores YouTube homepage hover previews (only tracks `/watch` and `/shorts`).
  - Debounces brief pauses (`350ms`) so timeline scrubbing doesn't cause brief music blips.
  - Tracks multiple YouTube tabs cleanly and resumes music if a playing YouTube tab is closed.
- **Zero External Dependencies**: Pure HTML, CSS, and vanilla JavaScript with minimal permissions (`storage` and `tabs`).

## Installation (Load Unpacked)

1. Clone this repository:
   ```bash
   git clone https://github.com/masum-dev/syncplay.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked** and select the `syncplay` project folder.
5. Refresh any already-open **YouTube** and **YouTube Music** tabs so the content scripts attach.

## Usage

1. Open [YouTube Music](https://music.youtube.com) and start playing a track (this satisfies Chrome's media autoplay policy for that tab).
2. Open any tutorial or video on [YouTube](https://www.youtube.com).
3. Play your video — YouTube Music pauses automatically.
4. Pause your video to code or take notes — YouTube Music resumes automatically.
5. Click the **SyncPlay** toolbar icon anytime to view connected tab statuses or toggle automation on and off.

## Project Structure

```text
syncplay/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json        # Extension configuration (Manifest V3)
├── background.js        # Service worker managing state and tab messaging
├── content-youtube.js   # Monitors YouTube playback events
├── content-ytmusic.js   # Controls YouTube Music playback
├── popup.html           # Extension popup layout
├── popup.css            # Modern dark UI styling
├── popup.js             # Popup toggle and live tab status polling
├── README.md
└── LICENSE.md
```

## Author

**Mahbub Alam Masum** ([@masum-dev](https://github.com/masum-dev))

## License

This project is licensed under the [MIT License](LICENSE.md).