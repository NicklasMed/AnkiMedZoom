"""
AnkiZoom - Image Zoom & ECG Measurement for Anki
Adds click-to-zoom and ECG ruler functionality to all cards
"""

import os

# Get the addon directory
addon_dir = os.path.dirname(__file__)

# Read the zoom JS and CSS files
zoom_js_path = os.path.join(addon_dir, "_zoom.js")
zoom_css_path = os.path.join(addon_dir, "_zoom.css")

try:
    with open(zoom_js_path, "r", encoding="utf-8") as f:
        zoom_js = f.read()
except:
    zoom_js = ""

try:
    with open(zoom_css_path, "r", encoding="utf-8") as f:
        zoom_css = f.read()
except:
    zoom_css = ""


def inject_zoom(web_content, context):
    """Inject zoom CSS and JS into card content"""
    if zoom_css:
        web_content.head += f"<style>{zoom_css}</style>"
    if zoom_js:
        web_content.head += f"<script>{zoom_js}</script>"


from aqt.gui_hooks import webview_will_set_content
webview_will_set_content.append(inject_zoom)
