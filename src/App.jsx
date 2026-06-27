import { useState, useEffect } from "react";

const SEGMENTS = [
  { min: 0,  max: 2,  color: "#22c55e", glow: "#22c55e80", label: "Low"      },
  { min: 2,  max: 5,  color: "#eab308", glow: "#eab30880", label: "Moderate" },
  { min: 5,  max: 7,  color: "#f97316", glow: "#f9731680", label: "High"      },
  { min: 7,  max: 10, color: "#ef4444", glow: "#ef444480", label: "Very High" },
  { min: 10, max: 11, color: "#a855f7", glow: "#a855f780", label: "Extreme"   },
];

const getCategory = (uvi) =>
  SEGMENTS.find((s, i) => uvi >= s.min && (uvi < s.max || i === SEGMENTS.length - 1)) ||
  SEGMENTS[SEGMENTS.length - 1];

const getAdvice = (uvi) => {
  if (uvi < 1) return { icon: "🌙", title: "The sun clocked out early", body: "UV is basically zero. You'd tan faster standing under a fluorescent light. Perfect timing to wander, explore, and not think about sunscreen at all.", action: "No protection needed · Roam free", tanStatus: "none" };
  if (uvi < 3) return { icon: "🌤️", title: "Sun's in shy mode", body: "A gentle, unthreatening sun — great for a long café breakfast or a morning stroll. Tanning ambitions will have to wait until the UV climbs.", action: "Optional SPF for very sensitive skin", tanStatus: "weak" };
  if (uvi < 5) return { icon: "✨", title: "Prime tanning window!", body: "This is the sweet spot. Your melanin is listening. SPF 30+, sessions of 30–45 min, flip regularly like a well-managed pancake. Pure vacation bliss.", action: "SPF 30+ · 30–45 min sessions · flip & reapply", tanStatus: "golden" };
  if (uvi < 6) return { icon: "☀️", title: "Strong tanning energy", body: "Still workable, but the sun is gaining confidence. Keep sessions to 30 min max, SPF 30–50, drink water, reapply religiously. You'll still get that glow.", action: "SPF 30–50 · max 30 min · reapply every 2h", tanStatus: "good" };
  if (uvi < 8) return { icon: "⚡", title: "Sun means business", body: "High UV territory. Not the hour for lounging — short sessions only (max 20 min), SPF 50+ everywhere, hat on. The tan can wait for a gentler hour.", action: "SPF 50+ · max 15–20 min · hat required", tanStatus: "caution" };
  if (uvi < 11) return { icon: "🔥", title: "Solar aggression detected", body: "The sun has no chill. Seek shade, order something cold, and keep SPF 50+ on any exposed skin before you step outside. You'll thank yourself tomorrow.", action: "Shade first · SPF 50+ always · cover up", tanStatus: "danger" };
  return { icon: "☢️", title: "Extreme UV — retreat inside", body: "Off the charts. This is not a drill. Stay indoors during peak hours. SPF 50+ if you absolutely must step outside for even a few minutes.", action: "Stay inside · SPF 50+ if you must go out", tanStatus: "extreme" };
};

const Gauge = ({ value }) => {
  const cx = 150, cy = 148, r = 112, sw = 16, MAX = 11;
  const clamped = Math.min(Math.max(value, 0), MAX);
  const toAngle = (uv) => 180 - (uv / MAX) * 180;
  const pol = (deg) => { const rad = (deg * Math.PI) / 180; return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }; };
  const arc = (a1, a2) => { const s = pol(a1), e = pol(a2); const large = a1 - a2 > 180 ? 1 : 0; return `M${s.x.toFixed(2)},${s.y.toFixed(2)} A${r},${r} 0 ${large},0 ${e.x.toFixed(2)},${e.y.toFixed(2)}`; };
  const needleRot = -(180 - (clamped / MAX) * 180);
  const cat = getCategory(value);
  return (
    <svg viewBox="0 0 300 186" style={{ width: "100%", maxWidth: 280, display: "block", margin: "0 auto" }}>
      {SEGMENTS.map((seg, i) => (
        <path key={`bg${i}`} d={arc(toAngle(seg.min), toAngle(Math.min(seg.max, MAX)))} stroke={seg.color} strokeWidth={sw} strokeLinecap={i === 0 || i === SEGMENTS.length - 1 ? "round" : "butt"} fill="none" opacity="0.2" />
      ))}
      {SEGMENTS.map((seg, i) => {
        if (clamped <= seg.min) return null;
        const activeMax = Math.min(clamped, seg.max);
        return <path key={`act${i}`} d={arc(toAngle(seg.min), toAngle(activeMax))} stroke={seg.color} strokeWidth={sw} strokeLinecap={i === 0 || activeMax < seg.max ? "round" : "butt"} fill="none" style={{ filter: `drop-shadow(0 0 6px ${seg.glow})` }} />;
      })}
      <g style={{ transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${needleRot}deg)`, transition: "transform 1.4s cubic-bezier(0.22, 1.3, 0.45, 1)" }}>
        <line x1={cx - 10} y1={cy} x2={cx + r - sw - 3} y2={cy} stroke="rgba(255,255,255,0.95)" strokeWidth={2.5} strokeLinecap="round" style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))" }} />
      </g>
      <circle cx={cx} cy={cy} r={10} fill="rgba(255,255,255,0.95)" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))" }} />
      <text x={cx} y={cy + 34} textAnchor="middle" fontSize="40" fontWeight="800" fill={cat.color} fontFamily="'Space Grotesk', sans-serif" style={{ filter: `drop-shadow(0 0 16px ${cat.glow})` }}>{value.toFixed(1)}</text>
      <text x={cx} y={cy + 52} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.5)" fontFamily="Inter, sans-serif" letterSpacing="3">UV INDEX</text>
    </svg>
  );
};

const HourlyChart = ({ data, currentHour }) => (
  <div style={{ overflowX: "auto", paddingBottom: 4 }}>
    <div style={{ display: "flex", gap: 4, minWidth: "max-content", alignItems: "flex-end" }}>
      {data.map((d, i) => {
        const cat = getCategory(d.uv);
        const isCurrent = d.hour === currentHour;
        const isPast = d.hour < currentHour;
        const barH = Math.max(3, (d.uv / 11) * 54);
        const label = d.hour === 0 ? "12a" : d.hour < 12 ? `${d.hour}a` : d.hour === 12 ? "12p" : `${d.hour - 12}p`;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 8.5, fontFamily: "'Space Grotesk', sans-serif", color: d.uv > 0.3 ? "rgba(255,255,255,0.75)" : "transparent" }}>{d.uv.toFixed(0)}</span>
            <div style={{ width: 24, height: barH, background: cat.color, borderRadius: "3px 3px 2px 2px", opacity: isPast ? 0.3 : 1, outline: isCurrent ? "2px solid white" : "none", outlineOffset: "2px", boxShadow: isCurrent ? `0 0 12px ${cat.color}` : "none", transition: "all 0.3s" }} />
            <span style={{ fontSize: 8, fontFamily: "'Space Grotesk', sans-serif", color: isCurrent ? "white" : "rgba(255,255,255,0.45)", fontWeight: isCurrent ? 700 : 400 }}>{label}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const EduCard = ({ id, icon, title, content, isOpen, onToggle }) => (
  <div onClick={() => onToggle(id)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "background 0.2s" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px" }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>{title}</span>
      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.25s", display: "inline-block" }}>▼</span>
    </div>
    {isOpen && <div style={{ padding: "0 18px 16px", fontSize: 13.5, lineHeight: 1.7, color: "rgba(255,255,255,0.82)" }}>{content}</div>}
  </div>
);

const EDU = [
  { id: "uvi", icon: "☀️", title: "What is the UV Index?", content: "The UV Index (UVI) is an international standard measurement of ultraviolet radiation intensity at the Earth's surface, developed by WHO and WMO. It runs from 0 (no radiation) to 11+ (extreme). Each step represents roughly 25 mW/m² more UV hitting your skin — meaning UV 10 delivers five times the radiation of UV 2." },
  { id: "spf", icon: "🧴", title: "SPF — what it actually means", content: "SPF (Sun Protection Factor) measures how much longer you can stay in the sun before burning compared to unprotected skin. SPF 30 blocks ~97% of UVB rays; SPF 50 blocks ~98%. No sunscreen reaches 100%. The critical catch: most people apply only 25–50% of the recommended 2 mg/cm², slashing real-world effectiveness. Always reapply every 2 hours and after swimming." },
  { id: "tan", icon: "🌟", title: "Tanning — the honest truth", content: "A tan is your skin's emergency damage response. Melanocytes produce melanin to shield your DNA from further UV harm. There is no such thing as a \"safe\" tan — every tan indicates DNA stress occurred. That said, brief protected exposure (UV 3–5, SPF 30+, short sessions with rest periods) minimises cumulative risk while allowing gradual adaptation. Slow and steady wins this race." },
  { id: "timing", icon: "⏰", title: "Why timing matters so much", content: "UV intensity follows a bell curve centred around solar noon — often 12:30–2:00 PM local time depending on your timezone and longitude. The 10 AM–4 PM window typically delivers 80% of your total daily UV dose. Early morning and late afternoon are dramatically gentler — ideal for a long, unhurried session with minimal risk. In Crete in summer, the mornings (7–10 AM) and evenings (5–7 PM) are the golden windows." },
  { id: "risk", icon: "🏥", title: "The numbers you should know", content: "Skin cancer is the world's most common cancer, with UV radiation as the leading cause. Melanoma — the most dangerous form — has a 99% five-year survival rate when caught early, dropping below 30% when caught late. Cumulative lifetime UV exposure directly increases risk. Clinical studies show that daily SPF use reduces melanoma risk by approximately 50%. Your future self will thank your sunscreen-wearing present self." },
];

const TAN_STYLES = {
  none:    { bg: "rgba(148,163,184,0.15)", border: "rgba(148,163,184,0.25)", text: "#cbd5e1" },
  weak:    { bg: "rgba(148,163,184,0.15)", border: "rgba(148,163,184,0.25)", text: "#e2e8f0" },
  golden:  { bg: "rgba(251,191,36,0.18)",  border: "rgba(251,191,36,0.4)",   text: "#fbbf24" },
  good:    { bg: "rgba(234,179,8,0.18)",   border: "rgba(234,179,8,0.4)",    text: "#facc15" },
  caution: { bg: "rgba(249,115,22,0.18)",  border: "rgba(249,115,22,0.4)",   text: "#f97316" },
  danger:  { bg: "rgba(239,68,68,0.14)",   border: "rgba(239,68,68,0.35)",   text: "#f87171" },
  extreme: { bg: "rgba(168,85,247,0.14)",  border: "rgba(168,85,247,0.35)",  text: "#c084fc" },
};

const getBg = (uv) => {
  if (uv === null) return "linear-gradient(160deg, #0c4a6e 0%, #0369a1 50%, #38bdf8 100%)";
  if (uv < 3)  return "linear-gradient(160deg, #0c4a6e 0%, #0369a1 40%, #7dd3fc 100%)";
  if (uv < 5)  return "linear-gradient(160deg, #164e63 0%, #0284c7 30%, #fbbf24 90%)";
  if (uv < 7)  return "linear-gradient(160deg, #7c2d12 0%, #ea580c 40%, #fed7aa 100%)";
  if (uv < 10) return "linear-gradient(160deg, #7f1d1d 0%, #dc2626 50%, #fca5a5 100%)";
  return "linear-gradient(160deg, #4c1d95 0%, #7c3aed 50%, #c4b5fd 100%)";
};

export default function SolarScout() {
  const [loc, setLoc]             = useState(null);
  const [locName, setLocName]     = useState("");
  const [uvData, setUVData]       = useState(null);
  const [currentUV, setCurrentUV] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [time, setTime]           = useState(new Date());
  const [openCard, setOpenCard]   = useState(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const fetchAll = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const [uvRes, geoRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&hourly=uv_index&timezone=auto&forecast_days=1`),
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, { headers: { "User-Agent": "SolarScout/1.0 (educational)" } }),
      ]);
      const uvJson  = await uvRes.json();
      const geoJson = await geoRes.json();
      const addr = geoJson.address || {};
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || "Your location";
      setLocName(`${city}${addr.country ? `, ${addr.country}` : ""}`);
      const processed = uvJson.hourly.time.map((t, i) => ({
        hour: parseInt(t.split("T")[1]),
        uv:   Math.max(0, uvJson.hourly.uv_index[i] ?? 0),
      }));
      const curHour = new Date().getHours();
      const curEntry = [...processed].reverse().find((d) => d.hour <= curHour) || processed[0];
      setCurrentUV(curEntry?.uv ?? 0);
      setUVData(processed);
    } catch {
      setError("Couldn't load UV data. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const geolocate = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported in this browser."); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => { setLoc({ lat: latitude, lon: longitude }); fetchAll(latitude, longitude); },
      () => { setError("Location access denied. Please enable it to use Solar Scout."); setLoading(false); }
    );
  };

  const advice   = currentUV !== null ? getAdvice(currentUV) : null;
  const tanStyle = advice ? TAN_STYLES[advice.tanStatus] || TAN_STYLES.none : TAN_STYLES.none;
  const curHour  = time.getHours();
  const safeHours    = uvData?.filter((d) => d.uv >= 3 && d.uv <= 5) || [];
  const cautionHours = uvData?.filter((d) => d.uv >  5 && d.uv <= 7) || [];

  const panel = {
    background: "rgba(255,255,255,0.11)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 20,
    padding: 20,
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        ::-webkit-scrollbar { height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.22); border-radius: 2px; }
        ::-webkit-scrollbar-track { background: transparent; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease both; }
      `}</style>

      <div style={{ minHeight: "100vh", background: getBg(currentUV), fontFamily: "'Inter', sans-serif", color: "white", transition: "background 1.8s ease" }}>
        <div style={{ maxWidth: 460, margin: "0 auto", padding: "24px 16px 64px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 23, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.5px" }}>Solar Scout 🌞</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>{locName ? `📍 ${locName}` : "Know before you glow"}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{time.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}</div>
            </div>
          </div>

          {!loc && !loading && (
            <div className="fade-in" style={{ ...panel, textAlign: "center", padding: "40px 24px", marginBottom: 20 }}>
              <div style={{ fontSize: 72, marginBottom: 16, lineHeight: 1 }}>🏖️</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 10, lineHeight: 1.2 }}>Where are you soaking up the sun?</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", marginBottom: 28, lineHeight: 1.65 }}>Share your location for real-time UV data and personalised sun safety advice — wherever your vacation takes you.</div>
              <button onClick={geolocate} style={{ width: "100%", padding: "16px 24px", background: "white", color: "#0c4a6e", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.22)", transition: "transform 0.15s, box-shadow 0.15s" }} onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }} onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}>
                📍 Use my current location
              </button>
            </div>
          )}

          {loading && (
            <div style={{ ...panel, textAlign: "center", padding: "40px 24px", marginBottom: 20 }}>
              <div style={{ fontSize: 52, marginBottom: 16, display: "inline-block", animation: "spin 2.5s linear infinite" }}>🌍</div>
              <div style={{ fontSize: 17, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 6 }}>Scanning the skies…</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Fetching UV data from Open-Meteo</div>
            </div>
          )}

          {error && !loading && (
            <div className="fade-in" style={{ ...panel, textAlign: "center", padding: "28px 20px", marginBottom: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.88)", marginBottom: 20, lineHeight: 1.55 }}>{error}</div>
              <button onClick={geolocate} style={{ padding: "12px 28px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.28)", color: "white", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>Try again</button>
            </div>
          )}

          {currentUV !== null && !loading && (
            <div className="fade-in">
              <div style={{ ...panel, textAlign: "center", marginBottom: 14 }}>
                <Gauge value={currentUV} />
                <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                  {SEGMENTS.map((s) => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color }} />{s.label}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...panel, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 10, lineHeight: 1.2 }}>{advice.title}</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.83)", lineHeight: 1.65, marginBottom: 14 }}>{advice.body}</div>
                    <div style={{ padding: "10px 14px", background: tanStyle.bg, border: `1px solid ${tanStyle.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: tanStyle.text, fontFamily: "'Space Grotesk', sans-serif" }}>👉 {advice.action}</div>
                  </div>
                  <div style={{ fontSize: 48, lineHeight: 1, flexShrink: 0 }}>{advice.icon}</div>
                </div>
              </div>

              {uvData && (
                <div style={{ ...panel, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Today's UV Forecast</div>
                  <HourlyChart data={uvData} currentHour={curHour} />
                  {safeHours.length > 0 && (
                    <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(251,191,36,0.14)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", marginBottom: 3, fontFamily: "'Space Grotesk', sans-serif" }}>✨ Prime tanning window (UV 3–5 · SPF 30+)</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)" }}>{safeHours[0].hour}:00 – {safeHours[safeHours.length - 1].hour + 1}:00 local time</div>
                    </div>
                  )}
                  {cautionHours.length > 0 && (
                    <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.28)", borderRadius: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#f97316", marginBottom: 3, fontFamily: "'Space Grotesk', sans-serif" }}>⚡ High UV zone (SPF 50+ · max 15–20 min sessions)</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)" }}>{cautionHours[0].hour}:00 – {cautionHours[cautionHours.length - 1].hour + 1}:00 local time</div>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => loc && fetchAll(loc.lat, loc.lon)} style={{ width: "100%", padding: "13px", marginBottom: 20, background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.75)", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", transition: "background 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}>
                🔄 Refresh UV data
              </button>
            </div>
          )}

          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12, paddingLeft: 4 }}>Know your UV</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EDU.map((card) => (
                <EduCard key={card.id} {...card} isOpen={openCard === card.id} onToggle={(id) => setOpenCard((prev) => (prev === id ? null : id))} />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 28, padding: "14px 16px", background: "rgba(0,0,0,0.18)", borderRadius: 12, fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.65 }}>
            <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.48)", marginBottom: 4 }}>Data Sources</div>
            UV forecast: <span style={{ color: "rgba(255,255,255,0.5)" }}>Open-Meteo.com</span> (free, open data, no API key) ·
            Reverse geocoding: <span style={{ color: "rgba(255,255,255,0.5)" }}>Nominatim / OpenStreetMap</span> (free, open data) ·
            Location: Browser Geolocation API · UV scale: WHO International Standard · Health facts: WHO/IARC published research
          </div>
        </div>
      </div>
    </>
  );
}
