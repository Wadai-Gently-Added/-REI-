// 文言の引き当て。language/*.js より後に読み込むこと
// 言語を増やす: language/xx.js を作り、index.html に script を足し、ここに1行追加
const LANGUAGES = { ja: LANG_JA, en: LANG_EN };
let currentLang = "ja";

function detectLang() {
  try { const s = localStorage.getItem("rei.lang"); if (s && LANGUAGES[s]) return s; } catch {}
  const n = (navigator.language || "en").slice(0, 2);
  return LANGUAGES[n] ? n : "en";
}

// t("key") か t("key", 引数...) 。無い言語は日本語、それも無ければキー名を返す
function t(key, ...args) {
  const v = LANGUAGES[currentLang].common[key] ?? LANGUAGES.ja.common[key];
  return typeof v === "function" ? v(...args) : (v ?? key);
}

function applyStrings() {
  document.documentElement.lang = currentLang;
  document.title = t("appTitle");
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
}

function initLang(sel, onChange) {
  currentLang = detectLang();
  Object.entries(LANGUAGES).forEach(([k, v]) => sel.add(new Option(v.meta.name, k)));
  sel.value = currentLang;
  sel.onchange = () => {
    currentLang = sel.value;
    try { localStorage.setItem("rei.lang", currentLang); } catch {}
    applyStrings(); onChange();
  };
  applyStrings();
}
