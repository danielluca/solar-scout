# Solar Scout 🌞

Real-time UV index tracker with personalised sun safety advice. Enter your location and get instant UV data, an hourly forecast chart, and clear guidance on when (and whether) to sunbathe.

## Features

- Animated semicircle UV gauge with colour-coded risk segments
- Hourly bar chart highlighting the current hour and past/future windows
- Advice copy and recommended SPF that updates with the UV level
- Dynamic background gradient that shifts from cool blue → orange → red → purple as UV climbs
- Expandable education cards covering UV science, SPF, tanning biology, and skin cancer stats
- Zero API keys required — all data sources are free and open

## Data Sources

| Source | What it provides |
|--------|-----------------|
| [Open-Meteo](https://open-meteo.com/) | Hourly UV index forecast (`uv_index`), timezone-aware |
| [Nominatim / OpenStreetMap](https://nominatim.org/) | Reverse geocoding (lat/lon → city name) |
| Browser Geolocation API | User coordinates |
| WHO / IARC | UV Index standard and health risk guidelines |

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` and allow location access when prompted.

## Build for production

```bash
npm run build   # output in dist/
npm run preview # preview the built app locally
```

## Tech

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) — no other dependencies
- All styling via inline styles (no CSS framework)
- Fonts loaded via `<link>` in `index.html` for optimal performance (avoids render-blocking `@import`)
