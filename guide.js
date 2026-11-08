"use strict";
// 「出し方」タブ：判定チャート・種類別の図解・よくある物の手順

// ---- 迷ったらチャート ----
// 各ノード: { q: 質問, opts: [[ラベル, 次のノードID or {r: 結果キー, note}]] }
const TREE = {
  start: { q: "電池が入っている？充電して使う物？", opts: [
    ["はい", { r: "box", note: "モバイルバッテリー・充電式の家電などは発火の危険。ごみに出さず、端子にテープを貼って区の回収拠点へ。" }],
    ["いいえ", "size"],
  ] },
  size: { q: "いちばん長い辺は 30cm 以上？", opts: [
    ["30cm以上", { r: "sodai", note: "粗大ごみ（有料・申込制）。ただしテレビ・エアコン・冷蔵庫・洗濯機は家電リサイクルへ。" }],
    ["30cm未満", "mat"],
  ] },
  mat: { q: "主な素材は？", opts: [
    ["📄 紙", "paper"],
    ["🧴 プラスチック", "plastic"],
    ["🍾 びん・缶・ペットボトル", "bottle"],
    ["🔩 金属・ガラス・陶器", { r: "funen", note: "割れ物・刃物は厚紙で包んで「キケン」と書く。" }],
    ["🍌 生ごみ・布・革・ゴム", { r: "kanen", note: "生ごみは水を切って紙で包む。" }],
  ] },
  paper: { q: "汚れている？または防水加工・感熱紙・写真？", opts: [
    ["はい", { r: "kanen", note: "紙コップ・ピザの箱・レシート・写真・ティッシュなどは可燃ごみ。" }],
    ["いいえ（きれいな紙）", { r: "shigen", note: "新聞・雑誌・雑がみ・紙パック・段ボールに分けて、ひもで束ねる。" }],
  ] },
  plastic: { q: "水ですすいで汚れが落ちる？", opts: [
    ["落ちる", { r: "pla", note: "プラスチックだけでできた物ならプラの日。金属付きは不燃ごみ。" }],
    ["落ちない", { r: "kanen", note: "汚れが落ちないプラは可燃ごみへ。" }],
  ] },
  bottle: { q: "何の容器？", opts: [
    ["飲み物・食べ物の容器", { r: "shigen", note: "すすいで中身の見える袋に。ペットボトルはキャップとラベルを外す。" }],
    ["スプレー缶・カセットボンベ", { r: "spray", note: "使い切って、他とは別の袋に入れて資源の日に。" }],
    ["化粧品のびん・油で汚れた缶", { r: "funen", note: "中身を使い切って不燃ごみへ。" }],
  ] },
};

// ---- 種類別の図解 ----
const VISUAL = {
  pla: {
    ok: [["🍱", "弁当容器"], ["🥚", "卵パック"], ["🍬", "お菓子の袋"], ["🧴", "ボトル類"], ["🥡", "食品トレイ"], ["📦", "発泡スチロール"], ["🛍️", "レジ袋"], ["🧢", "PETキャップ"]],
    steps: [["🚰", "すすぐ"], ["✋", "汚れ確認"], ["🛍️", "見える袋に"], ["⏰", "朝8時まで"]],
    ng: [["🔋", "電池入り"], ["🎧", "イヤホン"], ["🧯", "スプレー缶"], ["🍛", "汚れたまま"]],
  },
  shigen: {
    ok: [["📰", "新聞"], ["📚", "雑誌・本"], ["🎁", "紙箱・紙袋"], ["🥛", "紙パック"], ["📦", "段ボール"], ["🍾", "びん"], ["🥫", "缶"], ["🧃", "ペットボトル"]],
    steps: [["📄", "紙はひもで束ねる"], ["🚰", "びん缶PETはすすぐ"], ["🛍️", "見える袋に"], ["⏰", "朝8時まで"]],
    ng: [["🥡", "食品トレイ→プラ"], ["✨", "銀色の紙パック"], ["📌", "金属・テープ付き"], ["🍕", "汚れた紙"]],
  },
  kanen: {
    ok: [["🍌", "生ごみ"], ["🧻", "ティッシュ"], ["👕", "衣類・布"], ["👟", "靴・かばん"], ["🧾", "レシート"], ["🍕", "汚れた紙"], ["👶", "紙おむつ"], ["🌿", "枝・葉"]],
    steps: [["💧", "水を切る"], ["📰", "紙で包む"], ["🗑️", "ふた付き容器か袋"], ["⏰", "朝8時まで"]],
    ng: [["🫗", "液体の油"], ["🔩", "金属"], ["🔋", "電池"], ["🌳", "大量の枝"]],
  },
  funen: {
    ok: [["🍳", "フライパン"], ["🥛", "ガラス"], ["🍽️", "陶器・食器"], ["☂️", "傘"], ["💡", "電球"], ["🔌", "コード"], ["🔪", "刃物"], ["📻", "小型家電"]],
    steps: [["📦", "割れ物は厚紙で包む"], ["✍️", "「キケン」と書く"], ["🛍️", "見える袋に"], ["📅", "月2回だけ"]],
    ng: [["🔋", "充電式電池"], ["🧯", "スプレー缶→資源"], ["📏", "30cm以上→粗大"], ["🔥", "使いかけライター"]],
  },
};

// ---- よくある物の手順 ----
const HOWTO = [
  { title: "ペットボトル", cat: "shigen", steps: [["🧢", "キャップを外す", "→プラの日"], ["🏷️", "ラベルをはがす", "→プラの日"], ["🚰", "中をすすぐ", ""], ["👊", "つぶす", ""], ["🛍️", "見える袋で資源の日", ""]] },
  { title: "段ボール", cat: "shigen", steps: [["🏷️", "テープ・伝票をはがす", ""], ["📐", "たたむ", ""], ["🪢", "ひもで十字にしばる", "ガムテープはNG"], ["♻️", "資源の日", ""]] },
  { title: "牛乳パック", cat: "shigen", steps: [["🚰", "洗う", ""], ["✂️", "開く", ""], ["☀️", "乾かす", ""], ["🪢", "ひもで束ねる", "内側が銀色→可燃"]] },
  { title: "スプレー缶・カセットボンベ", cat: "shigen", steps: [["💨", "中身を使い切る", "屋外で"], ["🛍️", "他と別の袋に入れる", ""], ["♻️", "資源の日に出す", ""]] },
  { title: "割れたガラス・刃物", cat: "funen", steps: [["📦", "厚紙で包む", ""], ["✍️", "「キケン」と書く", ""], ["🛍️", "見える袋に", ""], ["🔩", "不燃ごみの日", ""]] },
  { title: "生ごみ（カラス対策）", cat: "kanen", steps: [["💧", "水をよく切る", ""], ["📰", "紙で包む", ""], ["🗑️", "袋の真ん中に入れる", ""], ["⏰", "当日の朝8時までに", "前の晩はNG"]] },
  { title: "モバイルバッテリー", cat: "box", steps: [["🔋", "使い切る", ""], ["🩹", "端子にテープ", ""], ["🏢", "区役所・図書館などの回収拠点へ", "ごみに混ぜると発火"]] },
];

// ---- 描画 ----
let treePath = ["start"];

function resultColor(r) {
  const c = ITEM_CATS[r].cls;
  return c === "sodai" ? "var(--sodai)" : c === "other" ? "var(--other)" : `var(--${c})`;
}

function renderTree() {
  const el = document.querySelector("#tree");
  const node = TREE[treePath[treePath.length - 1]];
  const crumbs = treePath.length > 1 ? `<button type="button" class="tree-back" data-back="1">‹ 戻る</button>` : "";
  el.innerHTML = `<div class="tree-q"><span class="tree-n">Q${treePath.length}</span>${node.q}</div>
    <div class="tree-opts">${node.opts.map((o, i) => `<button type="button" data-opt="${i}">${o[0]}</button>`).join("")}</div>${crumbs}`;
}

function showTreeResult(res) {
  const el = document.querySelector("#tree");
  const ic = ITEM_CATS[res.r];
  const key = res.r === "spray" ? "shigen" : res.r;
  const a = AREAS[areaId];
  const n = a && KEYS.includes(key) ? nextDate(a, key, today0()) : null;
  const icon = CATS[key] ? CATS[key].icon : res.r === "sodai" ? "🛋️" : "🏢";
  el.innerHTML = `<div class="tree-result" style="background:${resultColor(res.r)}">
      <div class="tr-ico">${icon}</div>
      <div class="tr-name">${ic.label}</div>
      ${n ? `<div class="tr-next">次は <b>${fmt(n.d)}</b>（${leftLabel(n.i)}）</div>` : ""}
    </div>
    <p class="tr-note">${res.note}</p>
    <button type="button" class="tree-back" data-reset="1">↺ もう一度</button>`;
}

document.querySelector("#tree").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.reset) { treePath = ["start"]; return renderTree(); }
  if (b.dataset.back) { treePath.pop(); return renderTree(); }
  const node = TREE[treePath[treePath.length - 1]];
  const next = node.opts[Number(b.dataset.opt)][1];
  if (typeof next === "string") { treePath.push(next); renderTree(); } else showTreeResult(next);
});

const tiles = (arr, cls) => arr.map(([e, t]) => `<div class="tile ${cls}"><span class="te">${e}</span><span class="tt">${t}</span></div>`).join("");
const stepStrip = (arr) => `<div class="steps">${arr.map(([e, t, sub], i) =>
  `<div class="step"><span class="sn">${i + 1}</span><span class="se">${e}</span><span class="st">${t}</span>${sub ? `<span class="ss">${sub}</span>` : ""}</div>`).join(`<span class="arrow">›</span>`)}</div>`;

function renderVisual() {
  const a = AREAS[areaId];
  const rule = (k) => !a ? "" : k === "funen" ? `第${a.funenWeeks.join("・")} ${WD[a.funenDay]}曜` :
    "毎週 " + a[k].map((w) => WD[w]).join("・") + "曜";
  document.querySelector("#visual").innerHTML = KEYS.map((k) => {
    const v = VISUAL[k], c = CATS[k];
    return `<div class="vcard" style="--c:${c.color}">
      <div class="vhead"><span class="vico">${c.icon}</span><span class="vname">${c.label}</span><span class="vrule">${rule(k)}</span></div>
      <div class="vlab">⭕ 出せるもの</div><div class="tiles">${tiles(v.ok, "ok")}</div>
      <div class="vlab">👣 出し方</div>${stepStrip(v.steps)}
      <div class="vlab">❌ 出せないもの</div><div class="tiles">${tiles(v.ng, "ng")}</div>
    </div>`;
  }).join("");
  document.querySelector("#howto").innerHTML = HOWTO.map((h) =>
    `<div class="hcard" style="--c:${resultColor(h.cat)}"><div class="htitle">${h.title}</div>${stepStrip(h.steps)}</div>`).join("");
}

renderTree();
renderVisual();
