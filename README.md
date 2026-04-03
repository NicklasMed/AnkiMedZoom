# AnkiMedZoom - Image Zoom & ECG Measurement

An Anki add-on that adds zoom and ECG time measurement tools to all cards.

## Features

- **Click to Zoom**: Click any image on a card to zoom in/out
- **Pan While Zoomed**: Drag the zoomed image around to see different parts
- **Wheel Zoom**: Use mouse wheel to zoom in/out while zoomed
- **Arrow Keys**: Use arrow keys to pan the zoomed image
- **ECG Ruler Mode**: Right-click a zoomed image to activate time measurement (Beta)
- **Visual Measurement**: See a green line while dragging to measure 

## Installation

### Option 1: Manual
1. Copy the entire `AnkimMedZoom` folder to your Anki add-ons folder:
   - **Windows**: `C:\Users\<YourUsername>\AppData\Roaming\Anki2\addons21\`
   - **Mac**: `~/Library/Application Support/Anki2/addons21/`
   - **Linux**: `~/.local/share/Anki2/addons21/`

2. Restart Anki

### Option 2: Install via Anki Plugin (Recommended)
1. Go to Tools → Add-ons in Anki
2. Click "Get Add-ons..."
3. Insert "1162216171" 
4. Click Ok 

5. Restart Anki

## Usage

### Zoom
1. **Click an image** on a card to zoom in (2x zoom)
2. **Click again** to zoom out
3. **Scroll wheel** while zoomed to zoom in/out (1x to 6x)

### Pan (when zoomed)
- **Drag** the image around to see different parts
- **Arrow keys** to pan (← → ↑ ↓)

### ECG Measurement
1. Zoom in on an ECG image
2. **Right-click** to activate ruler mode
3. **Drag** horizontally to measure time
4. **Green line** shows your measurement
5. Release to see the result in seconds and milliseconds
6. **Click** anywhere to exit measurement mode

## Configuration

Edit `_zoom.js` and change `TIME_PER_STRIP` if your ECG images represent a different duration:

```javascript
const TIME_PER_STRIP = 2;  // Change this to your image duration in seconds
```

Standard settings:
- **2 seconds**: For typical Anki ECG strips (10 big boxes)
- **10 seconds**: For full ECG tracings
- **12 seconds**: For standard clinical printouts

## Compatibility

- Works with Anki 2.1.x
- All image formats supported
- All card types supported

## Troubleshooting

**Add-on doesn't appear**: Make sure the folder is named `AnkiMedZoom` (case-sensitive on some systems)

**Measurements are wrong**: Adjust `TIME_PER_STRIP` in `_zoom.js`

**Images not zooming**: Make sure your card contains `<img>` elements

## License

Free to use and modify for personal use.