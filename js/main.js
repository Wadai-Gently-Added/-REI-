// 全体の流れ: 現在地 → Overpass → 表示
const RADIUS = 800;
const $status = document.getElementById("status");

function locate() {
  return new Promise((ok, ng) =>
    navigator.geolocation.getCurrentPosition(
      p => ok({ lat: p.coords.latitude, lon: p.coords.longitude }), ng,
      { enableHighAccuracy: true, timeout: 15000 }));
}

async function run() {
  try {
    $status.textContent = t("statusLocating");
    const { lat, lon } = await locate();
    $status.textContent = t("statusSearching");
    const items = await fetchNearby(lat, lon, RADIUS);
    $status.textContent = items.length ? "" : t("statusNone", RADIUS);
    render(lat, lon, items);
  } catch (e) {
    const msg = e.code === 1 ? t("errorGpsDenied") : (e.message || t("errorGpsDenied"));
    $status.textContent = t("errorPrefix", msg);
  }
}

function onLangChange() { initSelectors(); rerender(); }

initLang(document.getElementById("sel-lang"), onLangChange);
initSelectors();
document.getElementById("btn-locate").onclick = run;
