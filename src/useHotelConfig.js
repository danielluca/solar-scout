export function useHotelConfig() {
  const p = new URLSearchParams(window.location.search);
  const hotel = p.get("hotel") || "";
  const logo  = p.get("logo")  || "";
  const raw   = p.get("color") || "";
  const color = raw ? (raw.startsWith("#") ? raw : `#${raw}`) : "";
  const slug  = hotel ? hotel.toLowerCase().replace(/\s+/g, "-") : "demo";
  return { hotel, logo, color, slug, hasHotel: !!hotel };
}
