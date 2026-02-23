# 🗺️ UrbanTrail Smart Navigator

> A premium, real-time smart navigation web app — works on **any device, any browser, no install required.**

![UrbanTrail](https://img.shields.io/badge/UrbanTrail-Smart%20Navigator-3B82F6?style=for-the-badge&logo=leaflet)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🌐 Live Demo (GitHub Pages)

> **Your friends can open this link on any device — no install needed:**
>
> ```
> https://<YOUR-GITHUB-USERNAME>.github.io/UrbanTrail/
> ```
> *(Replace `<YOUR-GITHUB-USERNAME>` after you deploy — see Deploy section below)*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Interactive Map** | Leaflet.js + OpenStreetMap — works offline for tiles |
| 🔀 **3 Route Options** | Shortest (Blue) · Fastest (Green) · Cheapest (Orange) |
| ⛽ **Fuel Cost Estimator** | Mileage: 15 km/L · Petrol: ₹105/L |
| 📍 **Smart Autocomplete** | Biased toward your current city using GPS |
| 🛰️ **Live GPS Navigation** | Real `watchPosition` — marker moves only when YOU move |
| 🧭 **Bearing Rotation** | Car icon rotates to face your direction of travel |
| 🔊 **Voice Guidance** | Web Speech API — English & Hindi |
| 🌙 **Dark / Light Mode** | Smooth theme toggle |
| 🌐 **EN / हि Language** | Full translation toggle |
| 📱 **Fully Responsive** | Phone · Tablet · Laptop · Desktop |
| 🎨 **Premium 3D UI** | Particle canvas, glassmorphism, animated HUD |

---

## 🔑 Step 1 — Get Your FREE API Key

The app uses [OpenRouteService](https://openrouteservice.org/) for routing.

1. Go to → **https://openrouteservice.org/dev/#/signup**
2. Sign up for free
3. Copy your API key

---

## ⚙️ Step 2 — Add API Key

Open `js/app.js` and paste your key on **line 12**:

```javascript
const ORS_API_KEY = "PASTE_YOUR_KEY_HERE";
```

> ⚠️ **IMPORTANT:** Never commit your real API key to GitHub.  
> The `.gitignore` already excludes `.env` but your key is inside `js/app.js` — keep that repo private OR use GitHub Secrets if you deploy a backend.

---

## 🚀 Deploy to GitHub Pages (So Friends Can Open It)

> Your friends can open the website on **any phone or laptop** — no server needed.

### Step-by-step:

1. **Create a GitHub account** → https://github.com/signup

2. **Create a new repository** named `UrbanTrail` (set as **Public**)

3. **Upload files** using GitHub Desktop or drag-and-drop on GitHub web:
   - Upload everything inside the `UrbanTrail/` folder
   - Make sure `index.html` is at the **root** of the repository

4. **Enable GitHub Pages:**
   - Go to your repository → **Settings** → **Pages**
   - Under "Source" → select **`main` branch** → **`/ (root)`** folder
   - Click **Save**

5. **Your website is live** at:
   ```
   https://<YOUR-GITHUB-USERNAME>.github.io/UrbanTrail/
   ```

6. **Share this link** with friends — they open it on any phone or laptop, no install!

---

## 💻 Run Locally (on your own laptop)

### Option A — Double-click `launch.bat` (Windows)
```
Double-click launch.bat
```
Opens automatically at `http://localhost:8765`

### Option B — Python (any OS)
```bash
cd UrbanTrail
python -m http.server 8765
# Open http://localhost:8765
```

### Option C — Node.js
```bash
cd UrbanTrail
npx serve .
```

> ⚠️ **Must use a local server** — do NOT open `index.html` directly as a file (`file://`).  
> GPS and API calls require either `localhost` or `https://`.

---

## 📁 Project Structure

```
UrbanTrail/
├── index.html          ← Main HTML (entry point)
├── css/
│   └── style.css       ← All styling (premium 3D design system)
├── js/
│   └── app.js          ← All JavaScript (routing, GPS, UI, voice)
├── assets/             ← Static assets (icons etc)
├── launch.bat          ← Windows one-click launcher
├── .gitignore          ← Excludes secrets from git
└── README.md           ← This file
```

---

## 📱 Device Compatibility

| Device | Status |
|---|---|
| 📱 Android Phone | ✅ Full support |
| 📱 iPhone (Safari) | ✅ Full support |
| 💻 Windows Laptop | ✅ Full support |
| 🖥️ Desktop | ✅ Full support |
| 📟 Tablet | ✅ Full support |

> GPS navigation requires browser permission and works best on mobile devices with hardware GPS.

---

## 🛠️ Tech Stack

- **Map:** Leaflet.js 1.9.4 + OpenStreetMap
- **Routing:** OpenRouteService API (free tier)
- **Geocoding:** Nominatim (OpenStreetMap)
- **Voice:** Web Speech API (browser built-in)
- **GPS:** `navigator.geolocation.watchPosition`
- **Fonts:** Google Fonts — Outfit + Inter
- **No framework, no build step, no npm** — pure HTML/CSS/JS

---

## 📄 License

MIT — free to use, modify, and share.

---

*Built with ❤️ — UrbanTrail Smart Navigator*
