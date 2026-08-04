# TakeABreak

AI Assistance Note: Portions of this extension were generated with AI and then reviewed and edited.

TakeABreak is a Manifest V3 Chrome extension for sustainable screen-time breaks.
It is intentionally local-only, dependency-free, and designed with a minimal product-style UI.

## Warning And Disclaimer

The reminder text in this extension is general wellness guidance only. It is not medical advice, diagnosis, or treatment. Use your own judgment, stop if any exercise causes discomfort, and follow professional advice for any health concerns.

## Features

- Preset-based break modes inspired by deep-work and wellness reminder tools
- Eye strain relief prompts built around the 20-20-20 rule
- Optional reminders to drink water, stretch, and stand up
- Snooze actions from notifications
- Full-screen break overlay for quick resets on the active tab
- Lightweight stats for reminders shown and breaks completed

## Structure

- `manifest.json` is the extension entry point
- `src/icons/` contains the standard Chrome icon sizes
- `src/background.js` schedules reminders and handles notifications
- `src/content.js` renders the break overlay in the current tab
- `src/popup.html` and `src/popup.js` provide quick status and actions
- `src/options.html` and `src/options.js` expose reminder settings
- `src/shared.js` holds preset definitions and shared defaults

## Load Unpacked

1. Open `chrome://extensions`
2. Enable Developer mode
3. Choose Load unpacked and select this folder
