# Moodgallery

Local web app for building a visual gallery with automatic horizontal movement and continuous looping.

## Overview

Moodgallery lets you:

- import multiple images and videos through drag-and-drop or file selection;
- display media in a moodboard-style layout;
- automatically scroll the gallery with adjustable speed;
- pause and resume the animation;
- customize the background color with HSL sliders or HEX input;
- reset the gallery or the visual settings.

## Features

### Upload

- fullscreen drop zone at startup;
- support for `image/*` and `video/*` files (including GIFs and common video formats);
- multiple file uploads;
- automatic dominant color extraction from the first image.

### Gallery

- automatic horizontal scrolling;
- infinite looping through dynamic element recycling;
- support for mixed media cards (images, GIFs, and videos);
- muted looping autoplay for video cards.

### Controls

- `Pause` (also on the `Space` key);
- `Reset` (clears the gallery);
- `Reset Settings` (restores speed and color defaults);
- speed slider (`1x` to `4x`);
- color controls: Hue, Saturation, Lightness, HEX;
- control panel closes when clicking outside.

## Usage

1. Open `index.html` in a modern browser.
2. Drop images/videos or click the upload area.
3. Adjust speed and color using the control panel.
4. Use `Pause` to stop and resume the animation.

## Project Structure

```text
LCDR-Galery/
|-- index.html
|-- styles.css
|-- app.js
`-- README.md
```

## Technical Details

- 100% front-end app, no backend.
- Local media loading through `FileReader`.
- No server uploads.
- Animation driven by `requestAnimationFrame`.

## Compatibility

- Recent Chrome / Edge
- Recent Firefox
- Recent Safari

## Notes

- Uploaded media is kept in memory during the session.
- If the UI looks inconsistent after changes, do a hard refresh (`Ctrl+F5`).
