// 画面表示と地図タイル。タイル追加は TILES に1行（labelKey は language/*.js に追加）
const TILES = {
  osm:  { labelKey: "tileOsm",  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", attr: "© OpenStreetMap contributors" },
  std:  { labelKey: "tileStd",  url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", attr: "地理院タイル" },
  pale: { labelKey: "tilePale", url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", attr: "地理院タイル" }
};
const TYPE_KEY = { gate: "typeGate", exit: "typeExit", station: "typeStation" };

let map, tileLayer, markers = [], last = null;

function tileKey() { try { return localStorage.getItem("rei.tile") || "std"; } catch { return "std"; } }

function applyTile(k) {
  try { localStorage.setItem("rei.tile", k); } catch {}
  if (tileLayer) map.removeLayer(tileLayer);
  const tl = TILES[k];
  tileLayer = L.tileLayer(tl.url, { attribution: tl.attr, maxZoom: 18 }).addTo(map);
}

// 言語切替のたびに呼んで、選択肢の表示名を作り直す
function initSelectors() {
  const sa = document.getElementById("sel-app"), st = document.getElementById("sel-tile");
  sa.innerHTML = ""; st.innerHTML = "";
  Object.entries(MAP_APPS).forEach(([k, v]) => sa.add(new Option(v.label, k)));
  Object.entries(TILES).forEach(([k, v]) => st.add(new Option(t(v.labelKey), k)));
  sa.value = getApp(); st.value = tileKey();
  sa.onchange = () => setApp(sa.value);
  st.onchange = () => applyTile(st.value);
}

function initMap(lat, lon) {
  if (!map) { map = L.map("map"); applyTile(tileKey()); }
  map.setView([lat, lon], 17);
}

function render(lat, lon, items) {
  last = { lat, lon, items };
  initMap(lat, lon);
  markers.forEach(m => map.removeLayer(m)); markers = [];
  markers.push(L.circleMarker([lat, lon], { radius: 8 }).addTo(map).bindPopup(t("popupHere")));
  const ul = document.getElementById("list"); ul.innerHTML = "";
  items.forEach(p => {
    markers.push(L.marker([p.lat, p.lon]).addTo(map).bindPopup(p.name));
    const li = document.createElement("li");
    li.className = "item type-" + p.type;
    li.innerHTML = `<div class="type"></div><div><span class="name"></span><span class="dist"></span></div>`;
    li.querySelector(".type").textContent = t(TYPE_KEY[p.type]);
    li.querySelector(".name").textContent = p.name; // textContentでXSS回避
    li.querySelector(".dist").textContent = t("distance", p.dist);
    const b = document.createElement("button");
    b.textContent = t("btnGuide");
    b.onclick = () => window.open(navUrl(p), "_blank");
    li.appendChild(b); ul.appendChild(li);
  });
}

function rerender() { if (last) render(last.lat, last.lon, last.items); }
