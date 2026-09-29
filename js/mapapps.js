// ナビアプリの分岐。追加はこの表に1行足すだけ
const MAP_APPS = {
  apple:  { label: "Appleマップ",  url: (la, lo, n) => `https://maps.apple.com/?daddr=${la},${lo}&dirflg=w&q=${encodeURIComponent(n)}` },
  google: { label: "Googleマップ", url: (la, lo) => `https://www.google.com/maps/dir/?api=1&destination=${la},${lo}&travelmode=walking` },
  osm:    { label: "OSM",          url: (la, lo) => `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=%3B${la}%2C${lo}` }
};

function getApp() {
  try { return localStorage.getItem("rei.app") || "apple"; } catch { return "apple"; }
}
function setApp(k) {
  try { localStorage.setItem("rei.app", k); } catch {}
}
function navUrl(p) { return MAP_APPS[getApp()].url(p.lat, p.lon, p.name); }
