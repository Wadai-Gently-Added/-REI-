// OSMを「その場で取得して表示するだけ」。永続保存・配布はしない（ODbL対策）
// 公開サーバーは負荷制限あり。落ちたら次のミラーへ。本格商用は自前Overpassを検討
const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter"
];
const CACHE_TTL_MS = 10 * 60 * 1000; // 一時キャッシュ（メモリのみ・ページを閉じれば消える）
const cache = new Map();

function buildQuery(lat, lon, r) {
  const a = `(around:${r},${lat},${lon})`;
  return `[out:json][timeout:25];(
    node${a}["railway"~"^(station|subway_entrance|train_station_entrance)$"];
    node${a}["public_transport"="station"];
    node${a}["barrier"="turnstile"];
    node${a}["barrier"="gate"]["indoor"="yes"];
  );out body;`;
}

function classify(tags) {
  if (tags.barrier === "turnstile" || tags.barrier === "gate") return "gate";
  if (tags.railway === "subway_entrance" || tags.railway === "train_station_entrance") return "exit";
  return "station";
}

// wheelchair: yes / limited / no / ""(未記録)。未記録を「不可」と混同しない
function wheelchairOf(tags) {
  const w = tags.wheelchair === "designated" ? "yes" : tags.wheelchair;
  return ["yes", "limited", "no"].includes(w) ? w : "";
}

function distanceM(lat1, lon1, lat2, lon2) { // ハバーサイン（直線距離）
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function queryOverpass(q) {
  let lastErr;
  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetch(url, { method: "POST", body: "data=" + encodeURIComponent(q) });
      if (res.ok) return await res.json();
      lastErr = new Error("Overpass " + res.status);
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

// 送る座標は約100m単位に丸める。距離は端末内で正確な現在地から計算する
const roundCoord = x => Math.round(x * 1000) / 1000;

async function fetchNearby(lat, lon, radius = 800) {
  const qLat = roundCoord(lat), qLon = roundCoord(lon), key = `${qLat},${qLon},${radius}`;
  const hit = cache.get(key);
  let elements;
  if (hit && Date.now() - hit.t < CACHE_TTL_MS) elements = hit.elements;
  else {
    elements = (await queryOverpass(buildQuery(qLat, qLon, radius))).elements;
    cache.set(key, { t: Date.now(), elements });
  }
  return elements
    .map(e => {
      const tags = e.tags || {};
      const names = { base: tags.name || "" };
      Object.entries(tags).forEach(([k, v]) => { if (k.startsWith("name:")) names[k.slice(5)] = v; });
      return {
        type: classify(tags), names, ref: tags.ref || tags.local_ref || "",
        wheelchair: wheelchairOf(tags), lat: e.lat, lon: e.lon,
        dist: Math.round(distanceM(lat, lon, e.lat, e.lon))
      };
    })
    .sort((x, y) => x.dist - y.dist);
}
