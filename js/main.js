// 全体の流れ: 現在地 → Overpass → 表示
const RADIUS = 800;
const ACC_WARN_M = 50; // 現在地の誤差がこれ超なら警告
const $status = document.getElementById("status");
const $locate = document.getElementById("btn-locate");

// 初回説明（現在地がどこへ送られるかを正直に書く）
const $privacy = document.createElement("p");
$privacy.className = "note"; $locate.after($privacy);
// 失敗時の再試行ボタン
const $retry = document.createElement("button");
$retry.hidden = true; $status.after($retry);

// テスト用: ?mock=35.698,139.414 で位置を偽装（駅に行かずに試せる）
function getMock() {
  const m = new URLSearchParams(location.search).get("mock");
  if (!m) return null;
  const [lat, lon] = m.split(",").map(Number);
  return isFinite(lat) && isFinite(lon) ? { lat, lon, acc: 0 } : null;
}

function locate() {
  const mock = getMock();
  if (mock) return Promise.resolve(mock);
  return new Promise((ok, ng) =>
    navigator.geolocation.getCurrentPosition(
      p => ok({ lat: p.coords.latitude, lon: p.coords.longitude, acc: Math.round(p.coords.accuracy) }), ng,
      { enableHighAccuracy: true, timeout: 15000 }));
}

async function run() {
  $retry.hidden = true;
  try {
    $status.textContent = t("statusLocating");
    const { lat, lon, acc } = await locate();
    $status.textContent = t("statusSearching");
    const items = await fetchNearby(lat, lon, RADIUS);
    const msgs = [];
    if (getMock()) msgs.push(t("mockActive"));
    if (acc > ACC_WARN_M) msgs.push(t("warnAccuracy", acc));
    if (!items.length) msgs.push(t("statusNone", RADIUS));
    else if (!items.some(p => p.type !== "station")) msgs.push(t("noExitData")); // 小駅の0件は普通に起きる
    $status.textContent = msgs.join(" ");
    $retry.hidden = items.length > 0;
    render(lat, lon, items);
  } catch (e) {
    // e.code: 1=許可なし 2/3=取得失敗（Geolocation）、無ければ通信/サーバー失敗
    $status.textContent = e.code === 1 ? t("errorGpsDenied") : e.code ? t("errorLocate") : t("errorServer");
    $retry.hidden = false;
  }
}

function onLangChange() {
  initSelectors(); rerender();
  $privacy.textContent = t("privacyNote"); $retry.textContent = t("btnRetry");
}

initLang(document.getElementById("sel-lang"), onLangChange);
initSelectors();
$privacy.textContent = t("privacyNote"); $retry.textContent = t("btnRetry");
$locate.onclick = run; $retry.onclick = run;
