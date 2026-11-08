"use strict";
const WD = "日月火水木金土";
const KEYS = ["pla", "shigen", "kanen", "funen"];
const $ = (s) => document.querySelector(s);

// データ整形
const AREAS = AREAS_RAW.map(([town, block, pla, shigen, kanen, funen, office], i) => ({
  id: i, town, block, office,
  pla: [WD.indexOf(pla)],
  shigen: [WD.indexOf(shigen)],
  kanen: [...kanen].map((c) => WD.indexOf(c)),
  funenWeeks: [...funen.slice(0, 2)].map(Number),
  funenDay: WD.indexOf(funen.slice(2)),
}));
const TOWNS = [...new Set(AREAS.map((a) => a.town))];

let areaId = localStorage.getItem("areaId");
areaId = areaId !== null && AREAS[areaId] ? Number(areaId) : null;
let calMonth = new Date(); calMonth.setDate(1);

// その日に収集される区分
function cats(area, date) {
  const w = date.getDay();
  const out = [];
  if (area.pla.includes(w)) out.push("pla");
  if (area.shigen.includes(w)) out.push("shigen");
  if (area.kanen.includes(w)) out.push("kanen");
  const nth = Math.ceil(date.getDate() / 7); // その月の何回目の曜日か
  if (w === area.funenDay && area.funenWeeks.includes(nth)) out.push("funen");
  return out;
}
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}（${WD[d.getDay()]}）`;
const isYearEnd = (d) => (d.getMonth() === 11 && d.getDate() >= 29) || (d.getMonth() === 0 && d.getDate() <= 3);
function nextDate(area, key, from) {
  for (let i = 0; i < 40; i++) { const d = addDays(from, i); if (cats(area, d).includes(key)) return { d, i }; }
  return null;
}
const leftLabel = (i) => (i === 0 ? "きょう" : i === 1 ? "あした" : `${i}日後`);
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

// ---- 描画 ----
function renderHeader() {
  const a = AREAS[areaId];
  $("#areaBtn").textContent = a ? `📍 ${a.town} ${shortBlock(a.block)}` : "📍 地域を設定";
}
const shortBlock = (b) => (b.length > 12 ? b.slice(0, 12) + "…" : b);

function dayCard(label, d, area, cls) {
  const cs = cats(area, d);
  let body = cs.length
    ? cs.map((k) => `<div class="big bg-${k}"><span class="ico">${CATS[k].icon}</span><div><div class="name">${CATS[k].label}</div>${cls ? "" : `<div class="how">${CATS[k].how}</div>`}</div></div>`).join("")
    : `<div class="none">収集はありません</div>`;
  return `<div class="day-card ${cls}"><div class="when"><b>${label}</b>${fmt(d)}</div>${body}</div>`;
}

function renderToday() {
  const a = AREAS[areaId];
  const t = today0();
  $("#yearEnd").hidden = !(isYearEnd(t) || isYearEnd(addDays(t, 1)));
  if (!a) {
    $("#todayCards").innerHTML = `<div class="day-card"><p>まずはお住まいの地域を設定してください。</p><button class="big bg-shigen" style="border:none;width:100%;font-size:18px" onclick="show('area')">📍 地域を設定する</button></div>`;
    $("#nextList").innerHTML = "";
    return;
  }
  $("#todayCards").innerHTML = dayCard("きょう", t, a, "") + dayCard("あした", addDays(t, 1), a, "tomorrow");
  $("#nextList").innerHTML = KEYS.map((k) => ({ k, n: nextDate(a, k, t) }))
    .sort((x, y) => x.n.i - y.n.i)
    .map(({ k, n }) => `<li><span class="dot" style="background:${CATS[k].color}"></span><span class="lab">${CATS[k].icon} ${CATS[k].label}</span><span class="d">${fmt(n.d)}<span class="left">${leftLabel(n.i)}</span></span></li>`)
    .join("");
}

function renderCal() {
  const a = AREAS[areaId];
  const y = calMonth.getFullYear(), m = calMonth.getMonth();
  $("#calTitle").textContent = `${y}年${m + 1}月`;
  $("#legend").innerHTML = KEYS.map((k) => `<span><i class="dot" style="background:${CATS[k].color}"></i>${CATS[k].label}</span>`).join("");
  let h = [...WD].map((c, i) => `<div class="wd ${i === 0 ? "sun" : i === 6 ? "sat" : ""}">${c}</div>`).join("");
  const first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
  for (let i = 0; i < first.getDay(); i++) h += `<div class="cell empty"></div>`;
  const t = today0();
  for (let d = 1; d <= days; d++) {
    const date = new Date(y, m, d);
    const cs = a ? cats(a, date) : [];
    const isT = date.getTime() === t.getTime();
    h += `<div class="cell ${isT ? "today" : ""}"><span class="n">${d}</span>${cs.map((k) => `<span class="t bg-${k}">${CATS[k].short}</span>`).join("")}${isYearEnd(date) ? `<span class="t" style="background:#999">要確認</span>` : ""}</div>`;
  }
  $("#calGrid").innerHTML = h;
  $("#weekRule").innerHTML = a ? [
    ["pla", "毎週" + a.pla.map((w) => WD[w]).join("・") + "曜"],
    ["shigen", "毎週" + a.shigen.map((w) => WD[w]).join("・") + "曜"],
    ["kanen", "毎週" + a.kanen.map((w) => WD[w]).join("・") + "曜"],
    ["funen", `第${a.funenWeeks.join("・第")}${WD[a.funenDay]}曜`],
  ].map(([k, s]) => `<li><span class="dot" style="background:${CATS[k].color}"></span><span class="lab">${CATS[k].label}</span><span>${s}</span></li>`).join("") : "";
}

function norm(s) {
  return s.toLowerCase()
    .replace(/[ァ-ン]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[\s・ー]/g, "");
}
const INDEX = ITEMS.map(([name, cat, memo, alias]) => ({ name, cat, memo, key: norm(name + alias + (YOMI[name] || "")) }));

function renderSearch() {
  const q = norm($("#q").value);
  const a = AREAS[areaId];
  const hits = q ? INDEX.filter((it) => it.key.includes(q))
    .sort((x, y) => (norm(y.name).startsWith(q) ? 1 : 0) - (norm(x.name).startsWith(q) ? 1 : 0) || x.name.length - y.name.length) : [];
  $("#results").innerHTML = q && !hits.length
    ? `<li>見つかりませんでした。迷ったら下の「分け方のきほん」を参考にするか、管轄の清掃事務所へ問い合わせてください。</li>`
    : hits.slice(0, 30).map((it) => {
      const ic = ITEM_CATS[it.cat];
      const key = it.cat === "spray" ? "shigen" : it.cat;
      const n = a && KEYS.includes(key) ? nextDate(a, key, today0()) : null;
      return `<li><div class="nm">${it.name}</div><span class="tag ${ic.cls}">${ic.label}</span>${n ? `<div class="nextd">次は <b>${fmt(n.d)}</b>（${leftLabel(n.i)}）</div>` : ""}${it.memo ? `<div class="memo">${it.memo}</div>` : ""}</li>`;
    }).join("");
  $("#catGuide").innerHTML = hits.length ? "" : `<h2 class="sec">分け方のきほん</h2>` + KEYS.map((k) =>
    `<div class="card" style="border-left-color:${CATS[k].color}"><h3>${CATS[k].icon} ${CATS[k].label}</h3><p>${CATS[k].how}</p><ul>${CATS[k].tips.map((t) => `<li>${t}</li>`).join("")}</ul></div>`).join("");
}

function renderArea() {
  const sel = $("#town");
  if (!sel.options.length) {
    sel.innerHTML = `<option value="">選んでください</option>` + TOWNS.map((t) => `<option>${t}</option>`).join("");
  }
  const cur = AREAS[areaId];
  if (cur && !sel.dataset.touched) sel.value = cur.town;
  const town = sel.value;
  const list = AREAS.filter((a) => a.town === town);
  $("#blocks").innerHTML = list.map((a) => `<button type="button" data-id="${a.id}" class="${a.id === areaId ? "on" : ""}">${a.block}</button>`).join("");
  $("#officeInfo").innerHTML = cur ? `管轄：${OFFICES[cur.office].name} <a href="tel:${OFFICES[cur.office].tel}">${OFFICES[cur.office].tel}</a>` : "";
  $("#src").textContent = SCHEDULE_SOURCE;
}

function renderAll() { renderHeader(); renderToday(); renderCal(); renderSearch(); renderArea(); }

// ---- 操作 ----
function show(v) {
  document.querySelectorAll(".view").forEach((el) => el.classList.toggle("active", el.id === "view-" + v));
  document.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("on", b.dataset.view === v));
  window.scrollTo(0, 0);
}
window.show = show;
document.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => show(b.dataset.view)));
$("#areaBtn").addEventListener("click", () => show("area"));
$("#town").addEventListener("change", (e) => {
  e.target.dataset.touched = "1";
  const list = AREAS.filter((a) => a.town === e.target.value);
  if (list.length === 1) setArea(list[0].id); else renderArea();
});
$("#blocks").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-id]");
  if (b) setArea(Number(b.dataset.id));
});
function setArea(id) {
  areaId = id; localStorage.setItem("areaId", id);
  renderAll();
  setTimeout(() => show("today"), 250);
}
$("#q").addEventListener("input", renderSearch);
$("#calPrev").addEventListener("click", () => { calMonth.setMonth(calMonth.getMonth() - 1); renderCal(); });
$("#calNext").addEventListener("click", () => { calMonth.setMonth(calMonth.getMonth() + 1); renderCal(); });

renderAll();
if (areaId === null) show("area");

// 日付が変わったら更新（アプリを開きっぱなしの場合）
document.addEventListener("visibilitychange", () => { if (!document.hidden) { renderToday(); } });

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
