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

## 第3弾で入れたもの（Base44さんの回答より）
- 改札は barrier=turnstile / barrier=gate+indoor=yes、出口は railway=subway_entrance / train_station_entrance（ticket_barrier は廃止）
- Overpassのミラー自動切替 / wheelchairの3値表示（利用可・不可・未確認）
- 現在地の誤差が50m超なら警告 / 出口・改札0件なら「未収録」表示 / 直線距離の注意を常時表示
- 駅・出口の名前は name:言語 を優先（無ければ name）

## 第4弾で入れたもの
- 出口番号(ref)を黄色いバッジで大きく表示（言語に依存せず迷いにくい）
- ?mock=緯度,経度 でテスト用の位置（例: ?mock=35.698,139.414）
- 失敗時の再試行ボタン / サーバー失敗・位置取得失敗・許可なしを別文言に
- 結果の直下に免責文 / 現在地の送信先を正直に書いた説明文
- Overpass結果の一時キャッシュ（10分・メモリのみ）/ 送信座標を約100m単位に丸める

## 未対応 / 要確認
- 立川など小駅で出口が出るか（Overpass Turboで {{bbox}} を使い手作業で確認。新宿と比べる）
- 「駅を手動で選ぶ」導線（Overpassの駅名検索で。Nominatimの日本の駅名は未検証）
- PWA化（manifest + Service Worker。OSMデータは永続キャッシュしない）
- 残り9言語（es fr ko zh(簡体/繁体) de it pt ru el）
- バリアフリー絞り込み（エレベーター近接など）/ 路線・ホーム近接表示
- 競合（乗換案内アプリの出口案内）の確認 / 商用時のOverpass・タイルの本番構成
- 特商法表記・プライバシーポリシーの公式資料での確認
