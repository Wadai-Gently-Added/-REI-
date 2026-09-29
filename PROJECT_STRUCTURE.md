# 戻 -REI- PROJECT_STRUCTURE

現在地 → 近くの駅・出口・改札を表示 → 好きな地図アプリで案内。

## 方針
- OSMは「取得して表示するだけ」。DB蓄積・配布はしない（ODbL）
- 出典表示 © OpenStreetMap contributors は index.html のフッターに常時表示
- 見た目は css/style.css のみ（別AIで着せ替え）
- 文言は language/xx.js（ZOUと同じ LANG_XX 形式）。画面の文字は t("key") か data-i18n
- ナビアプリ追加: js/mapapps.js の MAP_APPS に1行 / 地図タイル追加: js/render.js の TILES に1行

## ツリー
modoru-rei/
├─ index.html
├─ PROJECT_STRUCTURE.md
├─ css/style.css
├─ language/
│   ├─ ja.js  en.js        ← 済（第2弾）
│   └─ es fr ko zh de it pt ru el .js  ← 未（第3弾以降）
└─ js/
   ├─ strings.js   文言の引き当て・言語切替（LANGUAGES に登録）
   ├─ overpass.js  取得・分類・距離
   ├─ mapapps.js   ナビアプリ分岐
   ├─ render.js    一覧・地図・タイル
   └─ main.js      全体の流れ

## 未対応 / 要確認
- 改札のOSMタグ（overpass.js の buildQuery）を数駅で確認
- overpass.js の「（名前なし）」は日本語固定 → 次の束で言語対応
- OSMの name:en 等を優先表示（次の束）
- バリアフリー絞り込み（wheelchair / エレベーター、不明は「情報なし」表示）
- 観測データ（自分で貯める改札位置・端末内）
