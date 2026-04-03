// Prevent multiple registrations on card refresh
if (window._ankiZoomLoaded) {
    window._ankiZoomReset();
} else {
    window._ankiZoomLoaded = true;

let img = null;
let zoomed = false;
let scale = 1;
const minScale = 1;
const maxScale = 6;
let x = 0, y = 0;
let originalRect = null;
let dragging = false;
let startX = 0, startY = 0;
let movedDuringDrag = false;

let measuring = false;
let measureStart = null;
let overlay = null;
let measureLine = null;
let pixelsPerSecond = 0;

const TIME_PER_STRIP = 13.3; // seconds (adjust if needed)

// Reset function called on card refresh
window._ankiZoomReset = function() {
    if (overlay) { try { overlay.remove(); } catch(e){} overlay = null; }
    if (measureLine) { try { measureLine.remove(); } catch(e){} measureLine = null; }
    img = null; zoomed = false; measuring = false; dragging = false;
    scale = 1; x = 0; y = 0; movedDuringDrag = false;
    measureStart = null; pixelsPerSecond = 0;
};

// Periodic state cleanup (every 2 seconds) - fixes corrupted state
setInterval(() => {
    if (zoomed && !img) { zoomed = false; scale = 1; x = 0; y = 0; }
    if (measuring && !overlay) { measuring = false; }
    if (dragging && !zoomed) { dragging = false; }
}, 2000);

/* ===================== HELPERS ===================== */

function clampPan() {
    if (!img || !img.width || !img.height || !originalRect) return;
    const iw = img.width * scale;
    const ih = img.height * scale;
    const maxPanX = Math.max(0, (iw - originalRect.width) / 2);
    const maxPanY = Math.max(0, (ih - originalRect.height) / 2);
    x = Math.max(-maxPanX, Math.min(maxPanX, x));
    y = Math.max(-maxPanY, Math.min(maxPanY, y));
}

function applyTransform() {
    if (!img) return;
    img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    img.style.transformOrigin = "center center";
    img.style.cursor = dragging ? "grabbing" : "grab";
}

/* ===================== ZOOM ===================== */

function enterZoom(el) {
    img = el;
    zoomed = true;
    originalRect = img.getBoundingClientRect();
    scale = 2; x = 0; y = 0;
    applyTransform();
}

function exitZoom() {
    if (!img) return;
    img.style.transform = "";
    img.style.cursor = "zoom-in";
    img = null; zoomed = false; originalRect = null;
    scale = 1; x = 0; y = 0;
}

/* ===================== MEASURING ===================== */

function enterMeasure() {
    if (overlay) return; // already open
    measuring = true;
    pixelsPerSecond = img ? (img.width * scale) / TIME_PER_STRIP : 0;

    overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:10000;cursor:crosshair;background:rgba(0,0,0,0.05);";

    // Instruction + close button in one bar
    const bar = document.createElement("div");
    bar.style.cssText = "position:fixed;top:16px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:10px;z-index:10001;pointer-events:auto;";

    const label = document.createElement("span");
    label.textContent = "Drag to measure";
    label.style.cssText = "background:rgba(0,200,0,0.9);color:black;padding:8px 16px;border-radius:5px;font-size:15px;font-weight:bold;";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕ Close";
    closeBtn.style.cssText = "background:rgba(220,0,0,0.9);color:white;border:none;padding:8px 14px;border-radius:5px;font-size:15px;font-weight:bold;cursor:pointer;";
    closeBtn.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        exitMeasure();
    });

    bar.appendChild(label);
    bar.appendChild(closeBtn);
    overlay.appendChild(bar);
    document.body.appendChild(overlay);
}

function exitMeasure() {
    measuring = false;
    measureStart = null;
    pixelsPerSecond = 0;
    if (measureLine) { try { measureLine.remove(); } catch(e){} measureLine = null; }
    if (overlay) { try { overlay.remove(); } catch(e){} overlay = null; }
}

/* ===================== EVENT HANDLERS ===================== */

document.addEventListener("click", (e) => {
    if (measuring) return; // ignore clicks during measuring
    if (e.target.tagName !== "IMG") return;
    if (movedDuringDrag) { movedDuringDrag = false; return; }

    // Auto-reset state if switching to different image
    if (zoomed && img !== e.target) { exitZoom(); }

    if (!zoomed) { enterZoom(e.target); }
    else if (img === e.target) { exitZoom(); }
});

document.addEventListener("mousedown", (e) => {
    // Right-click: toggle ruler mode
    if (e.button === 2) {
        if (!img || !zoomed) return;
        e.preventDefault();
        e.stopPropagation();
        dragging = false;
        if (overlay) { exitMeasure(); }
        else { enterMeasure(); }
        return;
    }

    // Left-click drag
    if (e.button === 0 && zoomed && img && e.target === img && !measuring) {
        dragging = true;
        movedDuringDrag = false;
        startX = e.clientX - x;
        startY = e.clientY - y;
        e.preventDefault();
        return;
    }

    // Left-click to start measure
    if (e.button === 0 && measuring) {
        measureStart = { x: e.clientX, y: e.clientY };
    }
});

document.addEventListener("mousemove", (e) => {
    // Pan while dragging
    if (dragging && img && !measuring) {
        x = e.clientX - startX;
        y = e.clientY - startY;
        clampPan();
        movedDuringDrag = true;
        applyTransform();
    }

    // Draw measure line
    if (measuring && measureStart && overlay) {
        if (measureLine) measureLine.remove();
        const dx = e.clientX - measureStart.x;
        const dy = e.clientY - measureStart.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        measureLine = document.createElement("div");
        measureLine.style.cssText = `position:fixed;left:${measureStart.x}px;top:${measureStart.y}px;width:${dist}px;height:3px;background:#00FF00;transform-origin:left center;transform:rotate(${angle}deg);pointer-events:none;z-index:10001;`;
        overlay.appendChild(measureLine);
    }
});

document.addEventListener("mouseup", (e) => {
    // End drag
    if (e.button === 0 && dragging) {
        dragging = false;
    }

    // End measure
    if (e.button === 0 && measuring && measureStart) {
        const dx = e.clientX - measureStart.x;
        if (Math.abs(dx) < 5) {
            measureStart = null;
            if (measureLine) { measureLine.remove(); measureLine = null; }
            return;
        }
        const timeSeconds = Math.abs(dx) / pixelsPerSecond;
        showToast(`Δt: ${timeSeconds.toFixed(2)}s  (${(timeSeconds * 1000).toFixed(0)}ms)`);
        exitMeasure();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (measuring) { exitMeasure(); return; }
        if (dragging) { dragging = false; return; }
    }
    if (!zoomed || !img || measuring) return;
    const step = 40;
    if (e.key === "ArrowLeft") x += step;
    else if (e.key === "ArrowRight") x -= step;
    else if (e.key === "ArrowUp") y += step;
    else if (e.key === "ArrowDown") y -= step;
    else return;
    clampPan();
    applyTransform();
});

document.addEventListener("contextmenu", (e) => {
    if (img && zoomed) e.preventDefault();
});

document.addEventListener("wheel", (e) => {
    if (!zoomed || !img || measuring) return;
    e.preventDefault();
    const newScale = Math.min(maxScale, Math.max(minScale, scale + (-e.deltaY * 0.002)));
    const rect = img.getBoundingClientRect();
    x -= (e.clientX - rect.left - rect.width / 2) * (newScale - scale);
    y -= (e.clientY - rect.top - rect.height / 2) * (newScale - scale);
    scale = newScale;
    clampPan();
    applyTransform();
}, { passive: false });

/* ===================== TOAST ===================== */

function showToast(msg) {
    const t = document.createElement("div");
    t.style.cssText = "position:fixed;top:70px;left:50%;transform:translateX(-50%);background:rgba(0,150,0,0.9);color:white;padding:12px 24px;border-radius:6px;font-size:18px;font-weight:bold;z-index:10002;pointer-events:none;";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { try { t.remove(); } catch(e){} }, 4000);
}

} // end if _ankiZoomLoaded
