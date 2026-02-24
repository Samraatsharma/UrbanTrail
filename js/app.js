/* ================================================================
   UrbanTrail Smart Navigator — app.js
   Full Feature Implementation:
   Map · Routing · Autocomplete · Navigation · GPS · Voice · i18n
   ================================================================ */

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjE4NWY2YTVkMWZlYzQxOTk4Mjk0ZTcwOThiYjdiMjgwIiwiaCI6Im11cm11cjY0In0=";

/* ═══════════════════════════════════════════════════════════════
   TRANSLATIONS (English / Hindi)
═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   TRANSLATIONS (English / Hindi)
═══════════════════════════════════════════════════════════════ */
const T = {
    en: {
        panel_title: "Plan Your Route",
        label_from: "FROM",
        label_to: "TO",
        btn_gps: "My Location",
        btn_find: "Find Routes",
        btn_clear: "Clear",
        btn_start_nav: "Start Navigation",
        btn_stop_nav: "Stop",
        btn_voice_on: "Voice: ON",
        btn_voice_off: "Voice: OFF",
        routes_title: "Routes",
        empty_panel: "Enter locations above to discover routes",
        hud_eta: "ETA",
        hud_dist: "Distance Left",
        route_shortest: "Shortest",
        route_fastest: "Fastest",
        route_cheapest: "Cheapest",
        stat_distance: "Distance",
        stat_duration: "Duration",
        stat_fuel: "Fuel Cost",
        stat_total: "Total Cost",
        select_route: "Select Route",
        selected: "Selected ✓",
        toast_gps_ok: "📍 Location acquired!",
        toast_gps_err: "GPS error. Please allow location access.",
        toast_no_key: "⚠️ Add your ORS API Key in app.js to get routes.",
        toast_no_route: "No routes found. Try different locations.",
        toast_api_err: "API Error. Check your API key and try again.",
        toast_nav_start: "🚗 Navigation Started!",
        toast_nav_stop: "Navigation stopped.",
        toast_arrived: "🎉 You have arrived at your destination!",
        status_loading: "Finding best routes…",
        status_found: "routes found",
        recalculating: "Recalculating route…",
        turn_straight: "Continue straight ahead",
        turn_arrive: "You have arrived",
        source_placeholder: "Search source location…",
        dest_placeholder: "Search destination…",
        mode_car: "Car",
        mode_bike: "Bike",
    },
    hi: {
        panel_title: "अपना रास्ता खोजें",
        label_from: "शुरुआत",
        label_to: "मंजिल",
        btn_gps: "मेरी लोकेशन",
        btn_find: "रास्ते खोजें",
        btn_clear: "साफ़ करें",
        btn_start_nav: "नेवीगेशन शुरू करें",
        btn_stop_nav: "रोकें",
        btn_voice_on: "आवाज़: चालू",
        btn_voice_off: "आवाज़: बंद",
        routes_title: "रास्ते",
        empty_panel: "रास्ते खोजने के लिए ऊपर जगह भरें",
        hud_eta: "पहुंचने का समय",
        hud_dist: "बाकी दूरी",
        route_shortest: "सबसे छोटा",
        route_fastest: "सबसे तेज़",
        route_cheapest: "सबसे सस्ता",
        stat_distance: "दूरी",
        stat_duration: "समय",
        stat_fuel: "ईंधन लागत",
        stat_total: "कुल लागत",
        select_route: "चुनें",
        selected: "चुना गया ✓",
        toast_gps_ok: "📍 लोकेशन मिल गई!",
        toast_gps_err: "GPS त्रुटि। कृपया लोकेशन अनुमति दें।",
        toast_no_key: "⚠️ app.js में API Key डालें।",
        toast_no_route: "कोई रास्ता नहीं मिला। अलग जगहें आज़माएं।",
        toast_api_err: "API त्रुटि। API Key जांचें।",
        toast_nav_start: "🚗 नेवीगेशन शुरू!",
        toast_nav_stop: "नेवीगेशन बंद।",
        toast_arrived: "🎉 आप अपनी मंजिल पर पहुंच गए!",
        status_loading: "सबसे अच्छे रास्ते खोज रहे हैं…",
        status_found: "रास्ते मिले",
        recalculating: "रास्ता दोबारा निकाल रहे हैं…",
        turn_straight: "सीधे जाएं",
        turn_arrive: "आप पहुंच गए",
        source_placeholder: "शुरुआती जगह खोजें…",
        dest_placeholder: "मंजिल खोजें…",
        mode_car: "कार",
        mode_bike: "बाइक",
    }
};

/* ═══════════════════════════════════════════════════════════════
   APP STATE
═══════════════════════════════════════════════════════════════ */
const state = {
    lang: "en",
    theme: "dark",
    map: null,
    sourceCoords: null,
    destCoords: null,
    routesData: [],
    selectedRouteIdx: null,
    routeLayers: [],
    sourceMarker: null,
    destMarker: null,
    carMarker: null,
    watchId: null,
    navWatchId: null,
    isGpsActive: false,
    isNavigating: false,
    navAnimFrame: null,
    navRouteCoords: [],
    navStepIdx: 0,
    navTotalDist: 0,
    navStartTime: null,
    voiceEnabled: true,
    panelOpen: true,
    userCity: null,
    userViewbox: null,
    lastCarBearing: 0,
    lastCarPos: null,
    isRealGpsNav: false,
    vehicleType: "driving-car", // "driving-car" or "cycling-regular" (used for profile and calculations)
    // GPS: only update when moved >= this many metres (prevents jitter)
    GPS_MOVE_THRESHOLD: 8,
    // Zoom: fired only ONCE when navigation starts — never again
    navZoomDone: false,
};

/* ═══════════════════════════════════════════════════════════════
   CAR ICON (SVG embedded — no external image needed)
═══════════════════════════════════════════════════════════════ */
const CAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="40" height="40">
  <defs>
    <filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/>
    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <ellipse cx="24" cy="28" rx="14" ry="6" fill="rgba(59,130,246,0.25)" filter="url(#glow)"/>
  <rect x="10" y="16" width="28" height="18" rx="6" fill="#3B82F6"/>
  <rect x="14" y="11" width="20" height="12" rx="4" fill="#60A5FA"/>
  <rect x="15" y="12" width="8" height="8" rx="2" fill="rgba(186,230,253,0.6)"/>
  <rect x="25" y="12" width="8" height="8" rx="2" fill="rgba(186,230,253,0.6)"/>
  <circle cx="16" cy="34" r="4" fill="#1E3A5F"/><circle cx="16" cy="34" r="2" fill="#93C5FD"/>
  <circle cx="32" cy="34" r="4" fill="#1E3A5F"/><circle cx="32" cy="34" r="2" fill="#93C5FD"/>
  <rect x="8" y="22" width="4" height="6" rx="2" fill="#FCD34D"/>
  <rect x="36" y="22" width="4" height="6" rx="2" fill="#FCD34D"/>
  <rect x="10" y="28" width="6" height="4" rx="1" fill="#EF4444"/>
  <rect x="32" y="28" width="6" height="4" rx="1" fill="#EF4444"/>
</svg>`;

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════ */
function t(key) { return T[state.lang][key] || T.en[key] || key; }

function toast(msg, type = "info", duration = 3500) {
    const ct = document.getElementById("toast-container");
    const el = document.createElement("div");
    const icons = { info: "ℹ️", success: "✅", error: "❌" };
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${msg}</span>`;
    ct.appendChild(el);
    setTimeout(() => {
        el.classList.add("removing");
        el.addEventListener("animationend", () => el.remove());
    }, duration);
}

function setStatus(msg, type = "loading") {
    const bar = document.getElementById("status-bar");
    bar.style.display = "flex";
    bar.className = `status-bar ${type}`;
    bar.innerHTML = type === "loading"
        ? `<div class="spinner-sm"></div><span>${msg}</span>`
        : `<span>${msg}</span>`;
}

function hideStatus() {
    document.getElementById("status-bar").style.display = "none";
}

function formatDist(meters) {
    if (meters >= 1000) return (meters / 1000).toFixed(1) + " km";
    return Math.round(meters) + " m";
}

function formatDur(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
}

function calcFuel(distMeters) {
    const km = distMeters / 1000;
    // Average Indian efficiencies:
    // Car: 15 km/l, Bike: 50 km/l
    const isBike = state.vehicleType === "cycling-regular";
    const mileage = isBike ? 50 : 15;
    const used = km / mileage;
    const cost = used * 105;        // ₹105/litre
    return { used: used.toFixed(2), cost: Math.round(cost) };
}

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function lerp(a, b, t) { return a + (b - a) * t; }

/* ═══════════════════════════════════════════════════════════════
   MAP INITIALIZATION
═══════════════════════════════════════════════════════════════ */
function initMap() {
    state.map = L.map("map", {
        center: [20.5937, 78.9629], // India center
        zoom: 5,
        zoomControl: false,
        preferCanvas: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
    }).addTo(state.map);

    L.control.zoom({ position: "bottomright" }).addTo(state.map);

    // Fly animation on map click (for debugging)
    state.map.on("click", () => { /* no-op */ });
}

/* ═══════════════════════════════════════════════════════════════
   MARKERS
═══════════════════════════════════════════════════════════════ */
function makeIcon(color, label) {
    return L.divIcon({
        className: "",
        html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      font-size:8px;font-weight:700;color:white;
    ">${label}</div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
}

function makeCarIcon(bearing) {
    const rot = bearing || 0;
    return L.divIcon({
        className: "",
        html: `<div class="car-marker-wrap" style="transform:rotate(${rot}deg);transform-origin:center;"><div class="car-marker-pulse"></div>${CAR_SVG}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
}

/** Calculate compass bearing from point A to point B (degrees) */
function calcBearing(lat1, lng1, lat2, lng2) {
    const toRad = d => d * Math.PI / 180;
    const dLng = toRad(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
}

/** Rotate existing car marker without recreating it */
function rotateCarMarker(bearing) {
    state.lastCarBearing = bearing;
    if (!state.carMarker) return;
    const el = state.carMarker.getElement();
    if (el) {
        const wrap = el.querySelector(".car-marker-wrap");
        if (wrap) wrap.style.transform = `rotate(${bearing}deg)`;
    }
}

function placeSourceMarker(latlng) {
    if (state.sourceMarker) state.map.removeLayer(state.sourceMarker);
    state.sourceMarker = L.marker(latlng, { icon: makeIcon("#3B82F6", "A") })
        .addTo(state.map)
        .bindPopup("Start");
}

function placeDestMarker(latlng) {
    if (state.destMarker) state.map.removeLayer(state.destMarker);
    state.destMarker = L.marker(latlng, { icon: makeIcon("#EF4444", "B") })
        .addTo(state.map)
        .bindPopup("Destination");
}

/* ═══════════════════════════════════════════════════════════════
   UPGRADE 1: SMART CITY-BIASED AUTOCOMPLETE
═══════════════════════════════════════════════════════════════ */
let acTimers = {};

/** Detect user's city on load via geolocation + Nominatim reverse geocode */
function detectUserCity() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            // Build a ~50 km viewbox around user for biasing
            const delta = 0.45; // ~50 km
            state.userViewbox = [lng - delta, lat - delta, lng + delta, lat + delta];
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
                const res = await fetch(url, { headers: { "Accept-Language": "en" } });
                const data = await res.json();
                const addr = data.address || {};
                state.userCity = addr.city || addr.town || addr.village || addr.county || null;
                if (state.userCity) {
                    const badge = document.getElementById("city-badge");
                    if (badge) { badge.textContent = `📍 ${state.userCity}`; badge.style.display = "flex"; }
                }
            } catch (_) { /* silent fail */ }
        },
        () => { /* permission denied — normal autocomplete */ },
        { enableHighAccuracy: false, timeout: 8000 }
    );
}

function setupAutocomplete(inputId, dropdownId, onSelect) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);

    input.addEventListener("input", () => {
        clearTimeout(acTimers[inputId]);
        const q = input.value.trim();
        if (q.length < 3) { dropdown.classList.remove("open"); return; }
        acTimers[inputId] = setTimeout(() => fetchSuggestions(q, dropdown, input, onSelect), 350);
    });

    input.addEventListener("blur", () => {
        setTimeout(() => dropdown.classList.remove("open"), 200);
    });

    input.addEventListener("keydown", (e) => {
        const items = dropdown.querySelectorAll(".ac-item");
        const cur = dropdown.querySelector(".ac-item.selected");
        if (e.key === "ArrowDown") {
            e.preventDefault();
            const next = cur ? cur.nextElementSibling : items[0];
            if (next) { cur?.classList.remove("selected"); next.classList.add("selected"); }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prev = cur ? cur.previousElementSibling : items[items.length - 1];
            if (prev) { cur?.classList.remove("selected"); prev.classList.add("selected"); }
        } else if (e.key === "Enter") {
            e.preventDefault();
            const sel = dropdown.querySelector(".ac-item.selected") || items[0];
            if (sel) sel.click();
        } else if (e.key === "Escape") {
            dropdown.classList.remove("open");
        }
    });
}

async function fetchSuggestions(query, dropdown, input, onSelect) {
    try {
        let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=7&addressdetails=1&countrycodes=in`;
        // UPGRADE 1: bias toward user's city viewbox if available
        if (state.userViewbox) {
            const vb = state.userViewbox.join(",");
            url += `&viewbox=${vb}&bounded=0`;
        }
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json();
        renderDropdown(data, dropdown, input, onSelect);
    } catch (err) {
        dropdown.classList.remove("open");
    }
}

function renderDropdown(results, dropdown, input, onSelect) {
    dropdown.innerHTML = "";
    if (!results.length) { dropdown.classList.remove("open"); return; }

    results.forEach((r) => {
        const item = document.createElement("div");
        item.className = "ac-item";
        const parts = r.display_name.split(",");
        const main = parts[0].trim();
        const sub = parts.slice(1, 4).join(",").trim();
        item.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
      <div><div class="ac-item-main">${main}</div><div class="ac-item-sub">${sub}</div></div>`;
        item.addEventListener("mousedown", (e) => {
            e.preventDefault();
            input.value = r.display_name;
            dropdown.classList.remove("open");
            onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), name: r.display_name });
        });
        dropdown.appendChild(item);
    });
    dropdown.classList.add("open");
}

/* ═══════════════════════════════════════════════════════════════
   ROUTE FETCHING — OpenRouteService
═══════════════════════════════════════════════════════════════ */
async function fetchRoutes() {
    if (!state.sourceCoords || !state.destCoords) {
        toast("Please select both source and destination.", "error");
        return;
    }
    if (ORS_API_KEY === "PASTE_YOUR_API_KEY_HERE") {
        toast(t("toast_no_key"), "error", 6000);
        return;
    }

    clearRoutes();
    setStatus(t("status_loading"), "loading");

    const body = {
        coordinates: [
            [state.sourceCoords.lng, state.sourceCoords.lat],
            [state.destCoords.lng, state.destCoords.lat],
        ],
        alternative_routes: { target_count: 3, weight_factor: 1.6, share_factor: 0.6 },
        instructions: true,
        units: "m",
        language: state.lang === "hi" ? "en" : "en",
    };

    try {
        const url = `https://api.openrouteservice.org/v2/directions/${state.vehicleType}/geojson`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": ORS_API_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json, application/geo+json",
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error("ORS Error:", err);
            setStatus(t("toast_api_err"), "error");
            toast(t("toast_api_err"), "error", 6000);
            return;
        }

        const geojson = await res.json();
        const features = geojson.features;
        if (!features || features.length === 0) {
            setStatus(t("toast_no_route"), "error");
            toast(t("toast_no_route"), "error");
            return;
        }

        processRoutes(features);
    } catch (err) {
        console.error(err);
        setStatus(t("toast_api_err"), "error");
        toast(t("toast_api_err"), "error", 5000);
    }
}

/* ═══════════════════════════════════════════════════════════════
   ROUTE PROCESSING & CLASSIFICATION
═══════════════════════════════════════════════════════════════ */
function processRoutes(features) {
    const routes = features.map((f, idx) => {
        const props = f.properties;
        const summary = props.summary;
        const dist = summary.distance;   // metres
        const dur = summary.duration;   // seconds
        const fuel = calcFuel(dist);
        const coords = f.geometry.coordinates; // [lng, lat]
        return { idx, dist, dur, fuelCost: fuel.cost, fuelUsed: fuel.used, coords, props };
    });

    // Sort copies for classification
    const byDist = [...routes].sort((a, b) => a.dist - b.dist);
    const byDur = [...routes].sort((a, b) => a.dur - b.dur);
    const byFuel = [...routes].sort((a, b) => a.fuelCost - b.fuelCost);

    // Assign types (ensure uniqueness: shortest first, then fastest, then cheapest)
    const usedIdx = new Set();
    const getFirst = (sorted) => sorted.find(r => !usedIdx.has(r.idx));

    const shortest = getFirst(byDist); usedIdx.add(shortest?.idx);
    const fastest = getFirst(byDur); usedIdx.add(fastest?.idx);
    const cheapest = getFirst(byFuel); usedIdx.add(cheapest?.idx);

    if (shortest) shortest.type = "shortest";
    if (fastest) fastest.type = "fastest";
    if (cheapest) cheapest.type = "cheapest";
    routes.forEach(r => { if (!r.type) r.type = "shortest"; });

    state.routesData = routes;

    // Draw all routes
    drawAllRoutes(routes, shortest, fastest, cheapest);

    // Build cards
    buildRouteCards(routes, shortest, fastest, cheapest);

    hideStatus();
    const count = routes.length;
    document.getElementById("route-count").textContent = `${count} ${t("status_found")}`;

    // Auto-select the fastest route
    const autoSelect = fastest || shortest || routes[0];
    if (autoSelect) selectRoute(autoSelect.idx);

    // Automatically open panel to show route options (especially important for mobile drawer)
    openPanel();
}

/* ═══════════════════════════════════════════════════════════════
   DRAW ROUTES
═══════════════════════════════════════════════════════════════ */
const ROUTE_COLORS = { shortest: "#3B82F6", fastest: "#10B981", cheapest: "#F59E0B" };
const ROUTE_WEIGHTS = { selected: 6, normal: 4 };

function drawAllRoutes(routes, shortest, fastest, cheapest) {
    routes.forEach(r => {
        const color = ROUTE_COLORS[r.type] || "#3B82F6";
        const latLngs = r.coords.map(c => [c[1], c[0]]);

        const polyline = L.polyline(latLngs, {
            color,
            weight: 4,
            opacity: 0.75,
            lineJoin: "round",
            lineCap: "round",
        }).addTo(state.map);

        // Subtle shadow effect
        const shadow = L.polyline(latLngs, {
            color: color,
            weight: 10,
            opacity: 0.1,
            lineJoin: "round",
        }).addTo(state.map);

        state.routeLayers.push({ polyline, shadow, routeIdx: r.idx, color });
    });

    // Fit map to bounds
    const allLatLngs = routes.flatMap(r => r.coords.map(c => [c[1], c[0]]));
    const bounds = L.latLngBounds(allLatLngs);
    state.map.flyToBounds(bounds, { padding: [60, 60], duration: 1.5 });

    // Place markers
    placeSourceMarker([state.sourceCoords.lat, state.sourceCoords.lng]);
    placeDestMarker([state.destCoords.lat, state.destCoords.lng]);
}

function selectRoute(idx) {
    state.selectedRouteIdx = idx;

    // Update polyline weights
    state.routeLayers.forEach(l => {
        const isSelected = l.routeIdx === idx;
        l.polyline.setStyle({
            weight: isSelected ? 7 : 3,
            opacity: isSelected ? 1 : 0.4,
        });
        l.shadow.setStyle({ opacity: isSelected ? 0.2 : 0.05 });
        if (isSelected) l.polyline.bringToFront();
    });

    // Update card highlights
    document.querySelectorAll(".route-card").forEach(card => {
        const isSelected = parseInt(card.dataset.idx) === idx;
        card.classList.toggle("selected", isSelected);
        const btn = card.querySelector(".select-route-btn");
        if (btn) btn.textContent = isSelected ? t("selected") : t("select_route");
    });

    // Show nav controls
    document.getElementById("nav-controls").style.display = "block";
}

function clearRoutes() {
    state.routeLayers.forEach(l => {
        if (l.polyline) state.map.removeLayer(l.polyline);
        if (l.shadow) state.map.removeLayer(l.shadow);
    });
    state.routeLayers = [];
    state.routesData = [];
    state.selectedRouteIdx = null;
    document.getElementById("route-count").textContent = "";
    document.getElementById("nav-controls").style.display = "none";
    renderEmptyPanel();
}

/* ═══════════════════════════════════════════════════════════════
   ROUTE CARDS UI
═══════════════════════════════════════════════════════════════ */
const TYPE_META = {
    shortest: { label: () => t("route_shortest"), cls: "shortest", icon: "📏" },
    fastest: { label: () => t("route_fastest"), cls: "fastest", icon: "⚡" },
    cheapest: { label: () => t("route_cheapest"), cls: "cheapest", icon: "💰" },
};

function buildRouteCards(routes, shortest, fastest, cheapest) {
    const wrap = document.getElementById("route-cards-wrap");
    wrap.innerHTML = "";

    // Order: fastest, shortest, cheapest
    const ordered = [];
    if (fastest) ordered.push(fastest);
    if (shortest && shortest !== fastest) ordered.push(shortest);
    if (cheapest && cheapest !== fastest && cheapest !== shortest) ordered.push(cheapest);
    routes.forEach(r => { if (!ordered.includes(r)) ordered.push(r); });

    ordered.forEach(r => {
        const meta = TYPE_META[r.type] || TYPE_META.shortest;
        const color = ROUTE_COLORS[r.type] || "#3B82F6";
        const card = document.createElement("div");
        card.className = "route-card";
        card.dataset.idx = r.idx;
        card.style.setProperty("--card-accent", color);

        card.innerHTML = `
      <div class="route-card-header">
        <span class="route-badge ${meta.cls}">${meta.icon} ${meta.label()}</span>
      </div>
      <div class="route-stats">
        <div class="route-stat">
          <span class="route-stat-label">${t("stat_distance")}</span>
          <span class="route-stat-value">${formatDist(r.dist)}</span>
        </div>
        <div class="route-stat">
          <span class="route-stat-label">${t("stat_duration")}</span>
          <span class="route-stat-value">${formatDur(r.dur)}</span>
        </div>
        <div class="route-stat">
          <span class="route-stat-label">${t("stat_fuel")}</span>
          <span class="route-stat-value">₹${r.fuelCost}</span>
        </div>
        <div class="route-stat">
          <span class="route-stat-label">${t("stat_total")}</span>
          <span class="route-stat-value">₹${r.fuelCost}</span>
        </div>
      </div>
      <div class="route-card-footer">
        <span class="fuel-cost">⛽ ${r.fuelUsed}L used</span>
        <button class="select-route-btn">${t("select_route")}</button>
      </div>`;

        card.addEventListener("click", () => selectRoute(r.idx));
        card.querySelector(".select-route-btn").addEventListener("click", (e) => {
            e.stopPropagation(); selectRoute(r.idx);
        });
        wrap.appendChild(card);
    });
}

function renderEmptyPanel() {
    const wrap = document.getElementById("route-cards-wrap");
    wrap.innerHTML = `
    <div class="panel-empty" id="panel-empty">
      <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
        <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2" stroke-dasharray="6 4" opacity=".3"/>
        <path d="M20 32h24M32 20l12 12-12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>
      </svg>
      <p>${t("empty_panel")}</p>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════
   GPS LIVE TRACKING
═══════════════════════════════════════════════════════════════ */
/* GPS_MOVE_THRESHOLD: only update if user moved more than N metres */
function startGPS() {
    if (!navigator.geolocation) { toast("Geolocation not supported.", "error"); return; }
    const btn = document.getElementById("gps-btn");
    if (state.isGpsActive) { stopGPS(); return; }

    btn.classList.add("active");
    state.isGpsActive = true;
    toast(t("toast_gps_ok"), "success");
    let lastGpsPos = null;

    state.watchId = navigator.geolocation.watchPosition(
        (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            // Only update if moved more than threshold (prevents GPS drift jitter)
            if (lastGpsPos) {
                const moved = haversine(lastGpsPos.lat, lastGpsPos.lng, lat, lng);
                if (moved < state.GPS_MOVE_THRESHOLD) return;
            }
            lastGpsPos = { lat, lng };
            state.sourceCoords = { lat, lng };
            document.getElementById("source-input").value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            placeSourceMarker([lat, lng]);
            // Only animate map if NOT navigating (navigation has its own follow mode)
            if (!state.isNavigating) {
                state.map.setView([lat, lng], Math.max(state.map.getZoom(), 14), { animate: true, duration: 0.8 });
            }
            if (state.isNavigating && state.selectedRouteIdx !== null) {
                checkDeviation(lat, lng);
            }
        },
        (err) => { toast(t("toast_gps_err"), "error"); stopGPS(); },
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
}

function stopGPS() {
    if (state.watchId !== null) navigator.geolocation.clearWatch(state.watchId);
    state.watchId = null;
    state.isGpsActive = false;
    document.getElementById("gps-btn").classList.remove("active");
}

function checkDeviation(lat, lng) {
    const route = state.routesData[state.selectedRouteIdx];
    if (!route) return;
    const nearestDist = route.coords.reduce((min, c) => Math.min(min, haversine(lat, lng, c[1], c[0])), Infinity);
    if (nearestDist > 150) { toast(t("recalculating"), "info"); fetchRoutes(); }
}

/* ═══════════════════════════════════════════════════════════════
   UPGRADE 3: GOOGLE-STYLE REAL NAVIGATION
═══════════════════════════════════════════════════════════════ */
function enterNavigationMode() {
    document.getElementById("search-panel").classList.add("nav-hidden");
    document.getElementById("right-panel").classList.add("nav-hidden");
    document.getElementById("topbar").classList.add("nav-topbar");
    document.getElementById("nav-hud").style.display = "block";
    // Update route name in HUD
    const routeData = state.routesData[state.selectedRouteIdx];
    const nameEl = document.getElementById("hud-route-name");
    if (nameEl && routeData) nameEl.textContent = routeData.type
        ? (routeData.type.charAt(0).toUpperCase() + routeData.type.slice(1)) + " Route"
        : "Navigating…";
}

function exitNavigationMode() {
    document.getElementById("search-panel").classList.remove("nav-hidden");
    document.getElementById("right-panel").classList.remove("nav-hidden");
    document.getElementById("topbar").classList.remove("nav-topbar");
    document.getElementById("nav-hud").style.display = "none";
    // Reset progress bar
    const pf = document.getElementById("hud-progress-fill");
    if (pf) pf.style.width = "0%";
    // Restore map view to full route (zoom out)
    if (state.routesData.length > 0) {
        const allLatLngs = state.routesData.flatMap(r => r.coords.map(c => [c[1], c[0]]));
        state.map.flyToBounds(L.latLngBounds(allLatLngs), { padding: [60, 60], duration: 1.5 });
    }
}

function startNavigation() {
    if (state.selectedRouteIdx === null) {
        toast("Please select a route first.", "error"); return;
    }
    const route = state.routesData[state.selectedRouteIdx];
    if (!route) return;

    state.navRouteCoords = route.coords.map(c => ({ lat: c[1], lng: c[0] }));
    state.navStepIdx = 0;
    state.navTotalDist = route.dist;
    state.navStartTime = Date.now();
    state.isNavigating = true;
    state.lastCarPos = null;
    state.lastCarBearing = 0;
    state.navZoomDone = false; // allow one zoom on nav start

    if (state.carMarker) state.map.removeLayer(state.carMarker);
    state.carMarker = L.marker(
        [state.navRouteCoords[0].lat, state.navRouteCoords[0].lng],
        { icon: makeCarIcon(0), zIndexOffset: 1000 }
    ).addTo(state.map);

    enterNavigationMode();

    // Zoom to navigation level ONCE — panTo follow mode used after this
    state.map.flyTo(
        [state.navRouteCoords[0].lat, state.navRouteCoords[0].lng],
        18, { duration: 1.5, animate: true }
    );
    state.navZoomDone = true;

    speak(t("toast_nav_start"));
    toast(t("toast_nav_start"), "success");

    if (navigator.geolocation) {
        state.isRealGpsNav = true;
        startRealGpsNavigation();
    } else {
        state.isRealGpsNav = false;
        animateCar();
    }
}

function startRealGpsNavigation() {
    if (state.navWatchId !== null) navigator.geolocation.clearWatch(state.navWatchId);
    let lastNavPos = null;

    state.navWatchId = navigator.geolocation.watchPosition(
        (pos) => {
            if (!state.isNavigating) return;
            const { latitude: lat, longitude: lng, speed } = pos.coords;

            // ── GPS MOVEMENT THRESHOLD ─────────────────────────────────
            // Only process if user has moved > threshold metres (kill drift/jitter)
            if (lastNavPos) {
                const moved = haversine(lastNavPos.lat, lastNavPos.lng, lat, lng);
                if (moved < state.GPS_MOVE_THRESHOLD) return;
            }
            lastNavPos = { lat, lng };

            const liveSpeed = (speed != null && speed > 0) ? speed * 3.6 : null;

            // Bearing rotation — only when we have a real movement vector
            if (state.lastCarPos) {
                const bearing = calcBearing(state.lastCarPos.lat, state.lastCarPos.lng, lat, lng);
                rotateCarMarker(bearing);
            }
            state.lastCarPos = { lat, lng };

            if (state.carMarker) state.carMarker.setLatLng([lat, lng]);

            // ── FOLLOW MODE (no zoom change — just pan smoothly) ───────
            // Use panTo, NOT flyTo/setView — prevents zoom jump
            state.map.panTo([lat, lng], { animate: true, duration: 0.6 });

            const distLeft = calcDistFromPoint(lat, lng);
            const effectiveSpeed = liveSpeed || 40;
            const etaSec = distLeft / (effectiveSpeed / 3.6);

            document.getElementById("hud-speed-val").textContent = Math.round(effectiveSpeed);
            document.getElementById("hud-dist-val").textContent = formatDist(distLeft);
            document.getElementById("hud-eta-val").textContent = formatDur(etaSec);

            // Update progress bar
            const progress = Math.max(0, Math.min(100, (1 - distLeft / state.navTotalDist) * 100));
            const pf = document.getElementById("hud-progress-fill");
            if (pf) pf.style.width = progress + "%";

            // Arrival
            const destCoord = state.navRouteCoords[state.navRouteCoords.length - 1];
            if (haversine(lat, lng, destCoord.lat, destCoord.lng) < 50) {
                toast(t("toast_arrived"), "success", 5000);
                speak(t("turn_arrive"));
                stopNavigation();
                return;
            }
            checkDeviationNav(lat, lng);
        },
        (err) => {
            console.warn("GPS nav error, falling back to simulation", err);
            state.isRealGpsNav = false;
            animateCar();
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );
}

function checkDeviationNav(lat, lng) {
    const route = state.routesData[state.selectedRouteIdx];
    if (!route) return;
    const nearestDist = route.coords.reduce((min, c) => {
        return Math.min(min, haversine(lat, lng, c[1], c[0]));
    }, Infinity);
    if (nearestDist > 150) {
        toast(t("recalculating"), "info");
        speak(t("recalculating"));
        // Update source to current position and re-fetch
        state.sourceCoords = { lat, lng };
        fetchRoutes();
    }
}

function calcDistFromPoint(lat, lng) {
    // Distance from nearest route point onwards
    const coords = state.navRouteCoords;
    let minIdx = 0, minDist = Infinity;
    for (let i = 0; i < coords.length; i++) {
        const d = haversine(lat, lng, coords[i].lat, coords[i].lng);
        if (d < minDist) { minDist = d; minIdx = i; }
    }
    let dist = 0;
    for (let i = minIdx; i < coords.length - 1; i++) {
        dist += haversine(coords[i].lat, coords[i].lng, coords[i + 1].lat, coords[i + 1].lng);
    }
    return dist;
}

function stopNavigation() {
    state.isNavigating = false;
    state.isRealGpsNav = false;
    if (state.navAnimFrame) cancelAnimationFrame(state.navAnimFrame);
    if (state.navWatchId !== null) {
        navigator.geolocation.clearWatch(state.navWatchId);
        state.navWatchId = null;
    }
    if (state.carMarker) { state.map.removeLayer(state.carMarker); state.carMarker = null; }
    exitNavigationMode();
    toast(t("toast_nav_stop"), "info");
}

/* Simulated animation (when no real GPS) */
const NAV_SPEED = 60;

function animateCar() {
    const coords = state.navRouteCoords;
    if (!state.isNavigating || state.isRealGpsNav || state.navStepIdx >= coords.length - 1) {
        if (!state.isRealGpsNav && state.navStepIdx >= coords.length - 1) {
            toast(t("toast_arrived"), "success", 5000);
            speak(t("turn_arrive"));
            stopNavigation();
        }
        return;
    }

    const startPt = coords[state.navStepIdx];
    const endPt = coords[state.navStepIdx + 1];
    const segDist = haversine(startPt.lat, startPt.lng, endPt.lat, endPt.lng);
    const simSpeed = NAV_SPEED / 3.6;
    const segTime = Math.max(segDist / simSpeed * 1000, 50); // min 50ms/segment
    const bearing = calcBearing(startPt.lat, startPt.lng, endPt.lat, endPt.lng);
    rotateCarMarker(bearing);

    const segStart = performance.now();

    function stepFrame(now) {
        if (!state.isNavigating || state.isRealGpsNav) return;
        const elapsed = now - segStart;
        const progress = Math.min(elapsed / segTime, 1);
        const eased = easeInOut(progress);

        const lat = lerp(startPt.lat, endPt.lat, eased);
        const lng = lerp(startPt.lng, endPt.lng, eased);

        state.carMarker.setLatLng([lat, lng]);
        // panTo only — no zoom — smooth follow
        state.map.panTo([lat, lng], { animate: true, duration: 0.25 });
        updateHUD(lat, lng, simSpeed);

        if (progress < 1) {
            state.navAnimFrame = requestAnimationFrame(stepFrame);
        } else {
            state.navStepIdx++;
            animateCar();
        }
    }
    state.navAnimFrame = requestAnimationFrame(stepFrame);
}

function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function updateHUD(lat, lng, speedMs) {
    const distLeft = remainingDist(lat, lng);
    const etaSec = distLeft / speedMs;

    document.getElementById("hud-speed-val").textContent = Math.round(speedMs * 3.6);
    document.getElementById("hud-dist-val").textContent = formatDist(distLeft);
    document.getElementById("hud-eta-val").textContent = formatDur(etaSec);

    const progressRatio = Math.max(0, Math.min(1, 1 - distLeft / state.navTotalDist));
    // Update progress fill bar
    const pf = document.getElementById("hud-progress-fill");
    if (pf) pf.style.width = (progressRatio * 100).toFixed(1) + "%";

    const instrIdx = Math.floor(progressRatio * 4);
    const instructions = [t("turn_straight"), t("turn_straight"), t("turn_straight"), t("turn_arrive")];
    document.getElementById("hud-instruction-text").textContent = instructions[Math.min(instrIdx, instructions.length - 1)];
}

function remainingDist(lat, lng) {
    let dist = 0;
    const coords = state.navRouteCoords;
    for (let i = state.navStepIdx; i < coords.length - 1; i++) {
        dist += haversine(coords[i].lat, coords[i].lng, coords[i + 1].lat, coords[i + 1].lng);
    }
    return dist;
}

/* ═══════════════════════════════════════════════════════════════
   WEB SPEECH API — Voice Navigation
═══════════════════════════════════════════════════════════════ */
function speak(text) {
    if (!state.voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = state.lang === "hi" ? "hi-IN" : "en-US";
    utt.rate = 1.05;
    utt.pitch = 1;
    window.speechSynthesis.speak(utt);
}

/* ═══════════════════════════════════════════════════════════════
   LANGUAGE TOGGLE
═══════════════════════════════════════════════════════════════ */
function applyLanguage(lang) {
    state.lang = lang;
    const toggle = document.getElementById("lang-toggle");
    toggle.classList.toggle("hi", lang === "hi");
    toggle.querySelectorAll(".lang-opt").forEach(o => {
        o.classList.toggle("active", o.dataset.lang === lang);
    });

    // Update all data-i18n elements
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        el.textContent = t(key);
    });

    // Update placeholders
    document.getElementById("source-input").placeholder = t("source_placeholder");
    document.getElementById("dest-input").placeholder = t("dest_placeholder");

    // Re-render route cards if present
    if (state.routesData.length > 0) {
        const byDist = [...state.routesData].sort((a, b) => a.dist - b.dist);
        const byDur = [...state.routesData].sort((a, b) => a.dur - b.dur);
        const byFuel = [...state.routesData].sort((a, b) => a.fuelCost - b.fuelCost);
        buildRouteCards(state.routesData, byDist[0], byDur[0], byFuel[0]);
        if (state.selectedRouteIdx !== null) selectRoute(state.selectedRouteIdx);
    }
}

/* ═══════════════════════════════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════════════════════════════ */
function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    document.getElementById("theme-icon-dark").style.display = theme === "dark" ? "block" : "none";
    document.getElementById("theme-icon-light").style.display = theme === "light" ? "block" : "none";
}

/* ═══════════════════════════════════════════════════════════════
   CLEAR ALL
═══════════════════════════════════════════════════════════════ */
function clearAll() {
    clearRoutes();
    stopNavigation();
    stopGPS();
    state.sourceCoords = null;
    state.destCoords = null;
    document.getElementById("source-input").value = "";
    document.getElementById("dest-input").value = "";
    if (state.sourceMarker) { state.map.removeLayer(state.sourceMarker); state.sourceMarker = null; }
    if (state.destMarker) { state.map.removeLayer(state.destMarker); state.destMarker = null; }
    hideStatus();
}

/* ═══════════════════════════════════════════════════════════════
   PANEL CONTROLS (Mobile Drawer / Desktop Hiding)
═══════════════════════════════════════════════════════════════ */
function togglePanel() {
    const panel = document.getElementById("right-panel");
    if (window.innerWidth <= 768) {
        panel.classList.toggle("mobile-open");
    } else {
        panel.classList.toggle("hidden");
    }
}

function openPanel() {
    const panel = document.getElementById("right-panel");
    if (window.innerWidth <= 768) {
        panel.classList.add("mobile-open");
    } else {
        panel.classList.remove("hidden");
    }
}

/* ═══════════════════════════════════════════════════════════════
   BOOT — DOM Ready
═══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
    // Init map
    initMap();

    // UPGRADE 1: detect city for autocomplete bias
    detectUserCity();

    // Autocomplete — source
    setupAutocomplete("source-input", "source-dropdown", (place) => {
        state.sourceCoords = { lat: place.lat, lng: place.lng };
        placeSourceMarker([place.lat, place.lng]);
        state.map.flyTo([place.lat, place.lng], 13, { duration: 1.2 });
    });

    // Autocomplete — destination
    setupAutocomplete("dest-input", "dest-dropdown", (place) => {
        state.destCoords = { lat: place.lat, lng: place.lng };
        placeDestMarker([place.lat, place.lng]);
        state.map.flyTo([place.lat, place.lng], 13, { duration: 1.2 });
    });

    // Transport Mode Selection
    document.querySelectorAll(".ts-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".ts-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.vehicleType = btn.dataset.mode;

            // If we already have routes, re-calculate or re-fetch
            if (state.sourceCoords && state.destCoords) {
                fetchRoutes();
            }
        });
    });

    // Find Routes
    document.getElementById("find-routes-btn").addEventListener("click", fetchRoutes);

    // Clear
    document.getElementById("clear-btn").addEventListener("click", clearAll);

    // GPS
    document.getElementById("gps-btn").addEventListener("click", startGPS);

    // Start Navigation
    document.getElementById("start-nav-btn").addEventListener("click", startNavigation);

    // Stop Navigation
    document.getElementById("stop-nav-btn").addEventListener("click", stopNavigation);

    // Voice Toggle
    document.getElementById("voice-toggle-btn").addEventListener("click", () => {
        state.voiceEnabled = !state.voiceEnabled;
        document.getElementById("voice-btn-text").textContent = state.voiceEnabled ? t("btn_voice_on") : t("btn_voice_off");
        toast(`Voice ${state.voiceEnabled ? "enabled" : "disabled"}`, "info", 2000);
    });

    // Theme Toggle
    document.getElementById("theme-toggle").addEventListener("click", () => {
        applyTheme(state.theme === "dark" ? "light" : "dark");
    });

    // Language Toggle
    document.getElementById("lang-toggle").addEventListener("click", (e) => {
        const opt = e.target.closest(".lang-opt");
        if (opt) applyLanguage(opt.dataset.lang);
        else applyLanguage(state.lang === "en" ? "hi" : "en");
    });

    // Panel Toggle
    document.getElementById("panel-toggle").addEventListener("click", togglePanel);

    // Keyboard shortcut: Enter on inputs → find routes
    ["source-input", "dest-input"].forEach(id => {
        document.getElementById(id).addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !document.getElementById(`${id.replace("input", "dropdown")}`).classList.contains("open")) {
                if (state.sourceCoords && state.destCoords) fetchRoutes();
            }
        });
    });

    // Apply initial language + theme
    applyLanguage("en");
    applyTheme("dark");

    // Remove loader
    setTimeout(() => {
        const loader = document.getElementById("app-loader");
        loader.classList.add("fade-out");
        setTimeout(() => loader.remove(), 700);
    }, 1200);

    // Responsive: watch resize
    window.addEventListener("resize", () => {
        const panel = document.getElementById("right-panel");
        if (window.innerWidth > 768) {
            panel.classList.remove("mobile-open");
            panel.classList.remove("hidden");
        }
    });
});
