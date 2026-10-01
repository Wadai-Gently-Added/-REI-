// 画面表示と地図タイル。タイル追加は TILES に1行（labelKey は language/*.js に追加）
const TILES = {
  osm:  { labelKey: "tileOsm",  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", attr: "© OpenStreetMap contributors" },
  std:  { labelKey: "tileStd",  url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", attr: "© 国土地理院" },
  pale: { labelKey: "tilePale", url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", attr: "© 国土地理院" }
};
const TYPE_KEY = { gate: "typeGate", exit: "typeExit", station: "typeStation" };
const WC_KEY = { yes: "wcYes", limited: "wcLimited", no: "wcNo", "": "wcUnknown" };

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

// 表示名: 今の言語の name:xx → name → 他言語 → 「名前なし」
function displayName(p) {
  return p.names[currentLang] || p.names.base || p.names.ja || p.names.en || t("unnamed");
}

function addNote(ul, key) {
  const li = document.createElement("li");
  li.className = "note"; li.textContent = t(key); ul.appendChild(li);
}

function render(lat, lon, items) {
  last = { lat, lon, items };
  initMap(lat, lon);
  markers.forEach(m => map.removeLayer(m)); markers = [];
  markers.push(L.circleMarker([lat, lon], { radius: 8 }).addTo(map).bindPopup(t("popupHere")));
  const ul = document.getElementById("list"); ul.innerHTML = "";
  if (items.length) addNote(ul, "noteStraight");
  items.forEach(p => {
    const name = displayName(p);
    markers.push(L.marker([p.lat, p.lon]).addTo(map).bindPopup((p.ref ? p.ref + " " : "") + name));
    const li = document.createElement("li");
    li.className = "item type-" + p.type;
    li.innerHTML = `<div class="type"></div>
      <div class="main"><span class="ref"></span><span class="name"></span><span class="dist"></span></div>
      <div class="wc"></div>`;
    li.querySelector(".type").textContent = t(TYPE_KEY[p.type]);
    const ref = li.querySelector(".ref"); // 出口番号は言語に依存せず迷いにくいので主役
    ref.textContent = p.ref; ref.hidden = !p.ref;
    li.querySelector(".name").textContent = name; // textContentでXSS回避
    li.querySelector(".dist").textContent = t("distance", p.dist);
    const wc = li.querySelector(".wc");
    wc.textContent = t(WC_KEY[p.wheelchair]); wc.className = "wc wc-" + (p.wheelchair || "unknown");
    const b = document.createElement("button");
    b.textContent = t("btnGuide");
    b.onclick = () => window.open(navUrl({ ...p, name }), "_blank");
    li.appendChild(b); ul.appendChild(li);
  });
  if (items.length) addNote(ul, "noteDisclaimer"); // 結果の直下に免責
}

function rerender() { if (last) render(last.lat, last.lon, last.items); }
