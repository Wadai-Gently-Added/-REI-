// OSMを「その場で取得して表示するだけ」。保存・蓄積はしない（ODbL対策）
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// タグは要確認（Overpass Turboで実際の駅を見て調整すること）
function buildQuery(lat, lon, r) {
  const a = `(around:${r},${lat},${lon})`;
  return `[out:json][timeout:25];(
    node${a}["railway"~"^(station|subway_entrance|train_station_entrance)$"];
    node${a}["public_transport"="station"];
    node${a}["railway"="ticket_barrier"];
    node${a}["barrier"="turnstile"];
  );out body;`;
}

function classify(tags) {
  if (tags.railway === "ticket_barrier" || tags.barrier === "turnstile") return "gate";
  if (tags.railway === "subway_entrance" || tags.railway === "train_station_entrance") return "exit";
  return "station";
}

function distanceM(lat1, lon1, lat2, lon2) { // ハバーサイン
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function fetchNearby(lat, lon, radius = 800) {
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: "data=" + encodeURIComponent(buildQuery(lat, lon, radius))
  });
  if (!res.ok) throw new Error("Overpass " + res.status);
  const json = await res.json();
  return json.elements
    .map(e => ({
      type: classify(e.tags || {}),
      name: e.tags["name:ja"] || e.tags.name || e.tags.ref || "（名前なし）",
      ref: e.tags.ref || "",
      lat: e.lat, lon: e.lon,
      dist: Math.round(distanceM(lat, lon, e.lat, e.lon))
    }))
    .sort((x, y) => x.dist - y.dist);
}
