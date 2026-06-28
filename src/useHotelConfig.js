export function useHotelConfig() {
  const p = new URLSearchParams(window.location.search);
  const hotel   = p.get("hotel")   || "";
  const logo    = p.get("logo")    || "";
  const favicon = p.get("favicon") || "";
  const slug    = hotel ? hotel.toLowerCase().replace(/\s+/g, "-") : "demo";
  // logo wins; favicon domain falls back to Google's favicon CDN
  const resolvedLogo = logo || (favicon ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(favicon)}&sz=128` : "");
  return { hotel, logo: resolvedLogo, slug, hasHotel: !!hotel };
}
