# Moodgallery

Local web app for building a visual gallery with automatic horizontal movement and continuous looping.

## Overview

Moodgallery lets you:

- import multiple images through drag-and-drop or file selection;
- display images in a moodboard-style layout;
- automatically scroll the gallery with adjustable speed;
- pause and resume the animation;
- customize the background color with HSL sliders or HEX input;
- reset the gallery or the visual settings.

## Features

### Upload

- fullscreen drop zone at startup;
- support for `image/*` files;
- multiple file uploads;
- automatic dominant color extraction from the first image.

### Gallery

- automatic horizontal scrolling;
- infinite looping through dynamic element recycling;
- placeholders and loading counters;
- visual hover effect on images.

### Controls

- `Pause` (also on the `Space` key);
- `Reset` (clears the gallery);
- `Reset Settings` (restores speed and color defaults);
- speed slider (`1x` to `4x`);
- color controls: Hue, Saturation, Lightness, HEX.

## Usage

1. Open `index.html` in a modern browser.
2. Drop images or click the upload area.
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
- Local image loading through `FileReader`.
- No server uploads.
- Animation driven by `requestAnimationFrame`.

## Compatibility

- Recent Chrome / Edge
- Recent Firefox
- Recent Safari

## Notes

- Images are kept in memory during the session.
- If the UI looks inconsistent after changes, do a hard refresh (`Ctrl+F5`).
