/* Patel Home Cloud: a calm, cartoon nature scene behind the dashboard.
   - Season: colors blend day by day through spring, summer, autumn and winter.
   - Time: sun and moon follow the real sunrise and sunset, with golden hour and stars.
   - Weather: live from Open-Meteo (free, no key) every 15 minutes: clear, clouds,
     fog, drizzle, rain, thunder or snow, with wind moving clouds, rain and trees.
   - Also adds a small weather chip to the top bar.
   Only the browser talks to Open-Meteo; no key or account is involved. */
(function () {
  if (document.getElementById("phc-scene")) return;

  /* Weather location (rounded to the town). */
  var LAT = 0.00, LON = 0.00; /* set to your own town, two decimals is enough */

  var NS = "http://www.w3.org/2000/svg";
  var W = 1600, H = 900;

  var P = {
    spring: { skyTop: "#9fd2f0", skyMid: "#cfe8f6", skyBot: "#fdeef2", sun: "#fff1b8", cloud: "#ffffff", cloudShade: "#d9e4f2", far: "#c4c6ea", farShade: "#a9acd8", mid: "#9db5d9", midShade: "#8199c4", cap: "#ffffff", mesa: "#efc3a1", mesaShade: "#d6a07f", hill1: "#c9eab8", hill1b: "#a9d99c", hill2: "#a6dc98", hill2b: "#86c682", hill3: "#8fd08c", hill3b: "#6cb977", treeD: "#ef9fb8", treeL: "#ffd3e0", pineD: "#4f9a6c", pineL: "#7fc493", trunk: "#9b7a5f", accent: "#ffffff", water: "#a9daf0", particle: "#ffc4d6" },
    summer: { skyTop: "#7cc4ef", skyMid: "#bfe3f7", skyBot: "#fff4d8", sun: "#ffe08a", cloud: "#ffffff", cloudShade: "#d3e2f1", far: "#b2c0e6", farShade: "#95a6d6", mid: "#86a7d3", midShade: "#6c8dc0", cap: "#f4f7fb", mesa: "#f0b484", mesaShade: "#d49466", hill1: "#bfe49c", hill1b: "#9cd283", hill2: "#97d184", hill2b: "#76bd6d", hill3: "#7cc375", hill3b: "#5aa85f", treeD: "#5fae6c", treeL: "#9ad696", pineD: "#3f8d58", pineL: "#6cb87a", trunk: "#8f6d52", accent: "#fff1a8", water: "#93d1ee", particle: "#fff3a0" },
    autumn: { skyTop: "#94c2e6", skyMid: "#d3e1ee", skyBot: "#fbe2c8", sun: "#ffc98f", cloud: "#fff8f0", cloudShade: "#ead6cc", far: "#d3c1dc", farShade: "#b9a5c8", mid: "#b6a2c8", midShade: "#9a86b1", cap: "#fbf7f2", mesa: "#e8a77d", mesaShade: "#c9875e", hill1: "#f4d49a", hill1b: "#eabc7f", hill2: "#ecbb80", hill2b: "#dc9e66", hill3: "#e0a374", hill3b: "#c9865b", treeD: "#e5864f", treeL: "#f8c06a", pineD: "#4f8f70", pineL: "#79b394", trunk: "#8a6650", accent: "#f7c56b", water: "#c2d7e6", particle: "#e98a4a" },
    winter: { skyTop: "#bcd3f0", skyMid: "#dbe6f6", skyBot: "#f6eef8", sun: "#fff2d6", cloud: "#ffffff", cloudShade: "#dbe2ee", far: "#c6d0e6", farShade: "#a9b6d4", mid: "#a9bcda", midShade: "#8ea3c6", cap: "#ffffff", mesa: "#e8dfdb", mesaShade: "#cbbfba", hill1: "#f1f4fb", hill1b: "#dfe6f4", hill2: "#e6ebf6", hill2b: "#d0daee", hill3: "#d9e1f1", hill3b: "#c0cde6", treeD: "#aebbd0", treeL: "#eef2f8", pineD: "#4f8780", pineL: "#86b8b0", trunk: "#8d7a6c", accent: "#ffffff", water: "#cfe0ee", particle: "#ffffff" }
  };
  var NIGHT = { skyTop: "#1f2547", skyMid: "#3a3a68", skyBot: "#6b5c8c" };
  var STORM = { skyTop: "#8e9bb0", skyMid: "#aab4c4", skyBot: "#c7ccd6" };
  var GOLD = { skyMid: "#ffcfa8", skyBot: "#ffb98c" };

  /* ---------- color helpers ---------- */
  function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
  function toHsl(c) {
    var r = hex(c), R = r[0] / 255, G = r[1] / 255, B = r[2] / 255;
    var mx = Math.max(R, G, B), mn = Math.min(R, G, B), l = (mx + mn) / 2, h = 0, sat = 0, d = mx - mn;
    if (d) {
      sat = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === R ? (G - B) / d + (G < B ? 6 : 0) : mx === G ? (B - R) / d + 2 : (R - G) / d + 4;
      h *= 60;
    }
    return [h, sat, l];
  }
  function fromHsl(h, sat, l) {
    function f(n) { var k = (n + h / 30) % 12, a = sat * Math.min(l, 1 - l); return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }
    var o = "#";
    [f(0), f(8), f(4)].forEach(function (v) { var x = Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16); o += x.length < 2 ? "0" + x : x; });
    return o;
  }
  function mixRgb(a, b, t) {
    var x = hex(a), y = hex(b), o = "#";
    for (var i = 0; i < 3; i++) { var v = Math.round(x[i] + (y[i] - x[i]) * t).toString(16); o += v.length < 2 ? "0" + v : v; }
    return o;
  }
  /* RGB hue, but keep the pastel saturation so in-between seasons don't go grey. */
  function mix(a, b, t, keep) {
    var o = mixRgb(a, b, t), hx = toHsl(a), hy = toHsl(b), hm = toHsl(o);
    var sat = hx[1] + (hy[1] - hx[1]) * t;
    if (keep !== undefined) sat = hm[1] + (sat - hm[1]) * keep;
    return fromHsl(hm[0], sat, hx[2] + (hy[2] - hx[2]) * t);
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }

  /* ---------- time and season ---------- */
  function dayOfYear(d) { return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000); }
  function seasonBlend(d) {
    var n = dayOfYear(d);
    /* Peaks (tune to your climate): spring mid-April, summer mid-July, fall color early November, winter mid-January. */
    var A = [["autumn", -59], ["winter", 15], ["spring", 105], ["summer", 196], ["autumn", 305], ["winter", 380], ["spring", 470]];
    for (var i = 0; i < A.length - 1; i++) {
      if (n >= A[i][1] && n < A[i + 1][1]) return { a: A[i][0], b: A[i + 1][0], t: smooth((n - A[i][1]) / (A[i + 1][1] - A[i][1])) };
    }
    return { a: "winter", b: "spring", t: 0 };
  }
  function hoursOf(d) { return d.getHours() + d.getMinutes() / 60; }
  function fallbackSun(d) {
    var c = Math.cos(2 * Math.PI * (dayOfYear(d) - 172) / 365);
    return { rise: 7.1 - 0.75 * c, set: 18.6 + 1.9 * c };
  }

  /* ---------- weather ---------- */
  var weather = null;
  function describe(code) {
    if (code === 0) return ["clear", "Clear"];
    if (code === 1) return ["clear", "Mostly clear"];
    if (code === 2) return ["partly", "Partly cloudy"];
    if (code === 3) return ["cloudy", "Cloudy"];
    if (code === 45 || code === 48) return ["fog", "Foggy"];
    if (code >= 51 && code <= 57) return ["drizzle", "Drizzle"];
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return ["rain", code >= 65 || code === 82 ? "Heavy rain" : "Rain"];
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ["snow", "Snow"];
    if (code >= 95) return ["thunder", "Thunderstorm"];
    return ["partly", "Partly cloudy"];
  }
  function parseHour(s) { var m = /T(\d\d):(\d\d)/.exec(s || ""); return m ? (+m[1]) + (+m[2]) / 60 : null; }
  function loadWeather() {
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + LAT + "&longitude=" + LON +
      "&current=temperature_2m,weather_code,cloud_cover,precipitation,wind_speed_10m,is_day" +
      "&daily=sunrise,sunset&timezone=auto&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=1";
    fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      var c = j.current || {}, d = j.daily || {};
      var ds = describe(c.weather_code);
      weather = { kind: ds[0], label: ds[1], temp: c.temperature_2m, cloud: (c.cloud_cover || 0) / 100, precip: c.precipitation || 0, wind: c.wind_speed_10m || 0,
        rise: parseHour(d.sunrise && d.sunrise[0]), set: parseHour(d.sunset && d.sunset[0]) };
      apply();
    }).catch(function () { /* keep the last known weather, or the gentle default */ });
  }

  /* ---------- SVG building ---------- */
  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function v(name) { return "var(--" + name + ")"; }
  function grad(defs, id, x1, y1, x2, y2, stops, user) {
    var g = el("linearGradient", { id: id, x1: x1, y1: y1, x2: x2, y2: y2 }, defs);
    if (user) g.setAttribute("gradientUnits", "userSpaceOnUse");
    stops.forEach(function (s) { el("stop", { offset: s[0], style: "stop-color:" + s[1] + ";stop-opacity:" + (s[2] === undefined ? 1 : s[2]) }, g); });
    return g;
  }
  var seed = 11;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

  var host = document.createElement("div");
  host.id = "phc-scene";
  host.setAttribute("aria-hidden", "true");
  var svg = el("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "xMidYMax slice", width: "100%", height: "100%" });
  host.appendChild(svg);
  var defs = el("defs", {}, svg);

  grad(defs, "phc-sky", "0", "0", "0", "1", [["0", v("skyTop")], ["0.55", v("skyMid")], ["1", v("skyBot")]]);
  var glow = el("radialGradient", { id: "phc-glow" }, defs);
  el("stop", { offset: "0", style: "stop-color:var(--sun);stop-opacity:.95" }, glow);
  el("stop", { offset: "0.35", style: "stop-color:var(--sun);stop-opacity:.35" }, glow);
  el("stop", { offset: "1", style: "stop-color:var(--sun);stop-opacity:0" }, glow);
  grad(defs, "phc-ray", "0", "0", "1", "0", [["0", v("sun"), 0.28], ["0.6", v("sun"), 0.06], ["1", v("sun"), 0]]);
  grad(defs, "phc-cloud", "0", "-64", "0", "28", [["0", "#ffffff"], ["0.45", v("cloud")], ["1", v("cloudShade")]], true);
  grad(defs, "phc-far", "0", "340", "0", "640", [["0", v("far")], ["1", v("skyBot")]], true);
  grad(defs, "phc-farS", "0", "340", "0", "640", [["0", v("farShade")], ["1", v("skyBot")]], true);
  grad(defs, "phc-mid", "0", "460", "0", "700", [["0", v("mid")], ["1", v("far")]], true);
  grad(defs, "phc-midS", "0", "460", "0", "700", [["0", v("midShade")], ["1", v("far")]], true);
  grad(defs, "phc-mesa", "0", "530", "0", "650", [["0", v("mesa")], ["1", v("mesaShade")]], true);
  grad(defs, "phc-h1", "0", "610", "0", "760", [["0", v("hill1")], ["1", v("hill1b")]], true);
  grad(defs, "phc-h2", "0", "700", "0", "860", [["0", v("hill2")], ["1", v("hill2b")]], true);
  grad(defs, "phc-h3", "0", "790", "0", "900", [["0", v("hill3")], ["1", v("hill3b")]], true);
  grad(defs, "phc-water", "0", "713", "0", "757", [["0", v("skyMid")], ["0.5", v("water")], ["1", v("hill1b")]], true);
  grad(defs, "phc-haze", "0", "0", "0", "1", [["0", v("skyBot"), 0], ["1", v("skyBot"), 0.85]]);
  grad(defs, "phc-fog", "0", "0", "0", "1", [["0", "#ffffff", 0], ["0.5", "#f4f6fa", 0.75], ["1", "#ffffff", 0.9]]);
  var rg = el("radialGradient", { id: "phc-leaf", cx: "-8", cy: "-70", r: "46", gradientUnits: "userSpaceOnUse" }, defs);
  el("stop", { offset: "0", style: "stop-color:var(--treeL)" }, rg);
  el("stop", { offset: "1", style: "stop-color:var(--treeD)" }, rg);
  grad(defs, "phc-pine", "-34", "0", "34", "0", [["0", v("pineL")], ["0.5", v("pineL")], ["0.5", v("pineD")], ["1", v("pineD")]], true);
  var soft = el("filter", { id: "phc-soft", x: "-10%", y: "-10%", width: "120%", height: "120%" }, defs);
  el("feGaussianBlur", { stdDeviation: "1.4" }, soft);
  var blur = el("filter", { id: "phc-blur", x: "-20%", y: "-200%", width: "140%", height: "500%" }, defs);
  el("feGaussianBlur", { stdDeviation: "14" }, blur);
  var warm = el("radialGradient", { id: "phc-warm", cx: "0.5", cy: "0.5", r: "0.5" }, defs);
  el("stop", { offset: "0", style: "stop-color:#ffb27a;stop-opacity:.55" }, warm);
  el("stop", { offset: "1", style: "stop-color:#ffb27a;stop-opacity:0" }, warm);

  function layer(depth) { var g = el("g", { "class": "phc-layer" }, svg); g.dataset.depth = depth; return g; }

  /* Sky */
  el("rect", { width: W, height: H, fill: "url(#phc-sky)" }, svg);
  var stars = el("g", { "class": "phc-stars" }, svg);
  for (var s = 0; s < 90; s++) {
    el("circle", { cx: (rnd() * W).toFixed(0), cy: (rnd() * 420).toFixed(0), r: (0.7 + rnd() * 1.7).toFixed(1), fill: "#fff8e7", style: "animation-delay:-" + (rnd() * 6).toFixed(1) + "s" }, stars);
  }
  var sunG = el("g", { "class": "phc-sun" }, svg);
  var rays = el("g", { "class": "phc-rays" }, sunG);
  for (var ri = 0; ri < 12; ri++) {
    el("path", { d: "M0 -10 L900 -46 L900 46 L0 10 Z", fill: "url(#phc-ray)", transform: "rotate(" + (ri * 30 + rnd() * 10) + ")" }, rays);
  }
  el("circle", { r: "190", fill: "url(#phc-glow)", "class": "phc-halo" }, sunG);
  el("circle", { r: "50", style: "fill:var(--sun)" }, sunG);
  el("circle", { cx: "-14", cy: "-14", r: "30", fill: "#ffffff", opacity: ".35" }, sunG);
  var moonG = el("g", { "class": "phc-moon" }, svg);
  el("circle", { r: "120", fill: "#fff6dc", opacity: ".10" }, moonG);
  el("circle", { r: "42", fill: "#fff6dc" }, moonG);
  el("circle", { cx: "-12", cy: "-8", r: "7", fill: "#e9dfc4", opacity: ".8" }, moonG);
  el("circle", { cx: "14", cy: "10", r: "5", fill: "#e9dfc4", opacity: ".8" }, moonG);
  el("circle", { cx: "6", cy: "-18", r: "4", fill: "#e9dfc4", opacity: ".7" }, moonG);

  /* Clouds: puffy, lit from above, shaded underneath */
  var cloudList = [];
  function cloud(y, sc, dur, delay, parent) {
    var wrap = el("g", { "class": "phc-cloud" }, parent);
    wrap.dataset.dur = dur;
    wrap.style.animationDuration = dur + "s";
    wrap.style.animationDelay = "-" + delay + "s";
    var c = el("g", { transform: "translate(0," + y + ") scale(" + sc + ")" }, wrap);
    el("ellipse", { cx: "4", cy: "24", rx: "84", ry: "10", fill: "#5a6a8a", opacity: ".08" }, c);
    [["ellipse", { cx: "0", cy: "6", rx: "86", ry: "24" }], ["circle", { cx: "-40", cy: "-8", r: "30" }], ["circle", { cx: "0", cy: "-26", r: "40" }],
     ["circle", { cx: "40", cy: "-12", r: "30" }], ["circle", { cx: "66", cy: "4", r: "20" }], ["circle", { cx: "-66", cy: "6", r: "18" }]].forEach(function (p) {
      p[1].fill = "url(#phc-cloud)"; el(p[0], p[1], c);
    });
    cloudList.push(wrap);
  }
  var cloudsFar = el("g", { "class": "phc-clouds" }, layer(0.15));
  var cloudsNear = el("g", { "class": "phc-clouds" }, layer(0.3));
  var cdefs = [[150, 1.1, 240, 30], [250, 0.75, 300, 160], [110, 0.6, 210, 90], [310, 1.3, 340, 250], [190, 0.9, 270, 200], [80, 0.8, 230, 10], [270, 1.0, 320, 120], [140, 1.4, 360, 300], [220, 0.7, 260, 60], [60, 1.2, 300, 220]];
  cdefs.forEach(function (c, i) { cloud(c[0], c[1], c[2], c[3], i % 2 ? cloudsFar : cloudsNear); });
  var deck = el("g", { "class": "phc-deck" }, layer(0.2));
  for (var di = 0; di < 9; di++) {
    var dx = di * 200 - 60;
    el("ellipse", { cx: dx, cy: (190 + (di % 3) * 24).toFixed(0), rx: "190", ry: "64", fill: "url(#phc-cloud)" }, deck);
  }
  el("rect", { x: "-100", y: "-40", width: "1800", height: "230", style: "fill:var(--cloudShade)" }, deck);

  /* Far mountains: lit faces, shadow faces, snow caps, soft focus */
  var farL = layer(0.35);
  var farPts = [[0, 560], [120, 430], [210, 500], [330, 360], [450, 480], [560, 400], [690, 520], [820, 380], [940, 470], [1060, 350], [1190, 470], [1300, 400], [1420, 500], [1520, 420], [1600, 470]];
  function range(pts, base) { return "M" + pts.map(function (p) { return p[0] + " " + p[1]; }).join(" L") + " L1600 " + base + " L0 " + base + " Z"; }
  var farG = el("g", { filter: "url(#phc-soft)" }, farL);
  el("path", { d: range(farPts, 900), fill: "url(#phc-far)" }, farG);
  for (var fi = 1; fi < farPts.length - 1; fi++) {
    var pk = farPts[fi], nx = farPts[fi + 1], pv = farPts[fi - 1];
    if (pk[1] < pv[1] && pk[1] < nx[1]) {
      el("path", { d: "M" + pk[0] + " " + pk[1] + " L" + nx[0] + " " + nx[1] + " L" + (pk[0] + (nx[0] - pk[0]) * 0.35) + " 640 L" + pk[0] + " 640 Z", fill: "url(#phc-farS)" }, farG);
      var w2 = 34;
      el("path", { d: "M" + (pk[0] - w2) + " " + (pk[1] + 40) + " L" + pk[0] + " " + pk[1] + " L" + (pk[0] + w2) + " " + (pk[1] + 40) + " L" + (pk[0] + 14) + " " + (pk[1] + 32) + " L" + (pk[0] - 2) + " " + (pk[1] + 46) + " L" + (pk[0] - 16) + " " + (pk[1] + 32) + " Z", style: "fill:var(--cap)", "class": "phc-cap" }, farG);
    }
  }
  el("rect", { x: "0", y: "470", width: W, height: "190", fill: "url(#phc-haze)" }, farL);

  /* Mid mountains and the plateau */
  var midL = layer(0.5);
  var midPts = [[0, 600], [160, 500], [280, 570], [400, 470], [540, 580], [700, 480], [860, 590], [1000, 500], [1150, 590], [1600, 560]];
  el("path", { d: range(midPts, 900), fill: "url(#phc-mid)" }, midL);
  for (var mi = 1; mi < midPts.length - 1; mi++) {
    var a1 = midPts[mi], b1 = midPts[mi + 1], c1 = midPts[mi - 1];
    if (a1[1] < c1[1] && a1[1] < b1[1]) el("path", { d: "M" + a1[0] + " " + a1[1] + " L" + b1[0] + " " + b1[1] + " L" + (a1[0] + 30) + " 700 Z", fill: "url(#phc-midS)" }, midL);
  }
  el("path", { d: "M960 640 L1010 548 Q1020 538 1036 537 L1268 532 Q1286 532 1294 546 L1360 640 Z", fill: "url(#phc-mesa)" }, midL);
  el("path", { d: "M1294 546 L1360 640 L1300 640 L1262 560 Z", style: "fill:var(--mesaShade)" }, midL);
  el("path", { d: "M1036 537 L1268 532 Q1286 532 1294 546", fill: "none", stroke: "#ffffff", "stroke-width": "3", opacity: ".45", "stroke-linecap": "round" }, midL);
  el("path", { d: "M1000 572 L1300 566 M990 598 L1318 592", style: "stroke:var(--mesaShade)", "stroke-width": "4", "stroke-linecap": "round", opacity: ".55", fill: "none" }, midL);
  el("path", { d: "M1036 537 L1268 532 L1270 540 Q1150 548 1034 545 Z", style: "fill:var(--cap)", "class": "phc-snowcover" }, midL);

  var mist = el("g", { "class": "phc-mist", filter: "url(#phc-blur)" }, layer(0.55));
  el("ellipse", { cx: "500", cy: "640", rx: "540", ry: "26", fill: "#ffffff", opacity: ".38" }, mist);
  el("ellipse", { cx: "1250", cy: "665", rx: "480", ry: "22", fill: "#ffffff", opacity: ".32" }, mist);

  /* Hills with a soft rim light along the crest */
  function hill(L, d, crest, fill, snowD) {
    el("path", { d: d, fill: fill }, L);
    el("path", { d: crest, fill: "none", stroke: "#ffffff", "stroke-width": "4", opacity: ".35", "stroke-linecap": "round" }, L);
    if (snowD) el("path", { d: snowD, style: "fill:var(--cap)", "class": "phc-snowcover" }, L);
  }
  function shadow(L, x, y, rx) { el("ellipse", { cx: x, cy: y + 2, rx: rx, ry: rx * 0.22, fill: "#2d3a4a", opacity: ".12" }, L); }
  function pine(x, y, sc, L) {
    shadow(L, x + 6 * sc, y, 30 * sc);
    var g = el("g", { transform: "translate(" + x + "," + y + ") scale(" + sc + ")" }, L);
    var sway = el("g", { "class": "phc-tree", style: "animation-delay:-" + (rnd() * 8).toFixed(1) + "s" }, g);
    el("rect", { x: "-4", y: "-16", width: "8", height: "18", rx: "3", style: "fill:var(--trunk)" }, sway);
    el("path", { d: "M0 -100 L22 -66 L-22 -66 Z M0 -82 L28 -42 L-28 -42 Z M0 -60 L34 -14 L-34 -14 Z", fill: "url(#phc-pine)" }, sway);
    el("path", { d: "M-22 -66 L22 -66 M-28 -42 L28 -42", stroke: "#1f3b33", "stroke-width": "2", opacity: ".12" }, sway);
    el("path", { d: "M0 -100 L10 -85 L-6 -84 Z M-6 -76 L8 -62 L-14 -60 Z", style: "fill:var(--cap)", "class": "phc-snowcover" }, sway);
    el("circle", { cx: "-10", cy: "-30", r: "3.5", style: "fill:var(--accent)", "class": "phc-dot" }, sway);
    el("circle", { cx: "9", cy: "-58", r: "3", style: "fill:var(--accent)", "class": "phc-dot" }, sway);
  }
  function roundTree(x, y, sc, L) {
    shadow(L, x + 8 * sc, y, 34 * sc);
    var g = el("g", { transform: "translate(" + x + "," + y + ") scale(" + sc + ")" }, L);
    var sway = el("g", { "class": "phc-tree", style: "animation-delay:-" + (rnd() * 8).toFixed(1) + "s" }, g);
    el("path", { d: "M-5 2 L-4 -34 Q0 -40 4 -34 L5 2 Z M-2 -30 L-14 -44 M2 -32 L12 -48", style: "fill:var(--trunk);stroke:var(--trunk)", "stroke-width": "4", "stroke-linecap": "round" }, sway);
    var crown = el("g", { "class": "phc-crown" }, sway);
    [[0, -60, 32], [-22, -44, 21], [22, -46, 23], [-6, -78, 20], [14, -70, 18]].forEach(function (p) { el("circle", { cx: p[0], cy: p[1], r: p[2], fill: "url(#phc-leaf)" }, crown); });
    el("ellipse", { cx: "-10", cy: "-80", rx: "10", ry: "6", fill: "#ffffff", opacity: ".35" }, crown);
    el("path", { d: "M-30 -72 Q-14 -96 8 -94 Q24 -92 30 -74 Q10 -84 -30 -72 Z", style: "fill:var(--cap)", "class": "phc-snowcover" }, sway);
    el("circle", { cx: "-12", cy: "-58", r: "4", style: "fill:var(--accent)", "class": "phc-dot" }, sway);
    el("circle", { cx: "16", cy: "-42", r: "4", style: "fill:var(--accent)", "class": "phc-dot" }, sway);
    el("circle", { cx: "4", cy: "-80", r: "3.5", style: "fill:var(--accent)", "class": "phc-dot" }, sway);
  }

  var h1 = layer(0.62);
  hill(h1, "M0 690 C 220 610, 420 640, 620 670 S 1000 620, 1220 660 S 1500 640, 1600 650 L1600 900 L0 900 Z",
    "M0 690 C 220 610, 420 640, 620 670 S 1000 620, 1220 660 S 1500 640, 1600 650", "url(#phc-h1)",
    "M0 690 C 220 610, 420 640, 620 670 S 1000 620, 1220 660 S 1500 640, 1600 650 L1600 662 C 1500 652, 1300 668, 1220 672 S 1000 634, 620 682 S 220 624, 0 702 Z");
  el("ellipse", { cx: "760", cy: "735", rx: "196", ry: "23", fill: "url(#phc-water)" }, h1);
  el("ellipse", { cx: "760", cy: "735", rx: "196", ry: "23", fill: "none", stroke: "#ffffff", "stroke-width": "2", opacity: ".5" }, h1);
  el("path", { d: "M640 735 h60 M760 742 h80 M690 728 h40 M820 731 h30", stroke: "#ffffff", "stroke-width": "3", "stroke-linecap": "round", opacity: ".6", "class": "phc-ripple" }, h1);
  [[60, 700, .7], [120, 712, .55], [300, 676, .6], [1180, 668, .6], [1240, 676, .5], [1460, 664, .7], [1530, 672, .55]].forEach(function (t) { pine(t[0], t[1], t[2], h1); });

  var h2 = layer(0.75);
  hill(h2, "M0 760 C 260 700, 520 730, 760 770 S 1220 720, 1600 750 L1600 900 L0 900 Z",
    "M0 760 C 260 700, 520 730, 760 770 S 1220 720, 1600 750", "url(#phc-h2)",
    "M0 760 C 260 700, 520 730, 760 770 S 1220 720, 1600 750 L1600 764 C 1220 734, 1100 790, 760 782 S 260 714, 0 772 Z");
  [[200, 752, .8, 0], [420, 760, .9, 1], [560, 775, .7, 0], [990, 770, .85, 1], [1110, 762, .7, 0], [1380, 752, .9, 1], [1560, 760, .75, 0]].forEach(function (t) { (t[3] ? roundTree : pine)(t[0], t[1], t[2], h2); });

  var h3 = layer(0.95);
  hill(h3, "M0 830 C 300 790, 600 810, 900 840 S 1400 800, 1600 820 L1600 900 L0 900 Z",
    "M0 830 C 300 790, 600 810, 900 840 S 1400 800, 1600 820", "url(#phc-h3)",
    "M0 830 C 300 790, 600 810, 900 840 S 1400 800, 1600 820 L1600 834 C 1400 814, 1200 860, 900 852 S 300 804, 0 842 Z");
  var tufts = el("g", { "class": "phc-tufts" }, h3);
  for (var ti = 0; ti < 26; ti++) {
    var tx = (rnd() * W).toFixed(0), ty = (848 + rnd() * 40).toFixed(0);
    el("path", { d: "M" + tx + " " + ty + " q-3 -12 -8 -16 M" + tx + " " + ty + " q0 -14 2 -20 M" + tx + " " + ty + " q4 -10 9 -14", style: "stroke:var(--hill3b)", "stroke-width": "2.5", "stroke-linecap": "round", fill: "none" }, tufts);
    if (ti % 3 === 0) el("circle", { cx: +tx + 2, cy: +ty - 20, r: "3", style: "fill:var(--particle)", "class": "phc-dot" }, tufts);
  }
  [[80, 850, 1.1, 1], [330, 862, 1.2, 0], [1250, 858, 1.15, 1], [1500, 850, 1.25, 0]].forEach(function (t) { (t[3] ? roundTree : pine)(t[0], t[1], t[2], h3); });

  /* Golden-hour warmth, birds */
  var warmth = el("ellipse", { cx: "800", cy: "620", rx: "1100", ry: "520", fill: "url(#phc-warm)", "class": "phc-warmth" }, svg);
  var birds = el("g", { "class": "phc-birds" }, svg);
  [[0, 0], [26, 10], [50, -4]].forEach(function (b) {
    el("path", { d: "M" + b[0] + " " + b[1] + " q7 -7 14 0 q7 -7 14 0", fill: "none", stroke: "#5b4d63", "stroke-width": "2.5", "stroke-linecap": "round", opacity: ".5" }, birds);
  });

  /* Weather particles */
  var rain = el("g", { "class": "phc-rain" }, svg);
  var drops = [];
  for (var r = 0; r < 140; r++) {
    var rx = rnd() * (W + 300) - 150;
    drops.push(el("line", { x1: rx.toFixed(0), y1: "0", x2: rx.toFixed(0), y2: (18 + rnd() * 12).toFixed(0), stroke: "#7f97bf", "stroke-width": (1.3 + rnd()).toFixed(1), "stroke-linecap": "round", opacity: (0.3 + rnd() * 0.3).toFixed(2), style: "animation-duration:" + (0.9 + rnd() * 0.7).toFixed(2) + "s;animation-delay:-" + (rnd() * 3).toFixed(2) + "s" }, rain));
  }
  var flakes = el("g", { "class": "phc-flakes" }, svg);
  for (var f = 0; f < 90; f++) {
    var fg = el("g", { transform: "translate(" + (rnd() * W).toFixed(0) + ",0)" }, flakes);
    el("ellipse", { rx: (1.6 + rnd() * 3).toFixed(1), ry: (1.6 + rnd() * 2.4).toFixed(1), style: "fill:var(--particle);animation-duration:" + (8 + rnd() * 9).toFixed(1) + "s;animation-delay:-" + (rnd() * 16).toFixed(1) + "s" }, fg);
  }
  var flies = el("g", { "class": "phc-flies" }, svg);
  for (var fl = 0; fl < 26; fl++) {
    el("circle", { cx: (rnd() * W).toFixed(0), cy: (620 + rnd() * 240).toFixed(0), r: "2.6", fill: "#fff3a0", style: "animation-delay:-" + (rnd() * 9).toFixed(1) + "s;animation-duration:" + (6 + rnd() * 6).toFixed(1) + "s" }, flies);
  }
  var fog = el("rect", { x: "0", y: "380", width: W, height: "520", fill: "url(#phc-fog)", "class": "phc-fog" }, svg);
  var flash = el("rect", { width: W, height: H, fill: "#ffffff", "class": "phc-flash" }, svg);

  document.body.insertBefore(host, document.body.firstChild);

  /* Gentle parallax on desktop */
  var layers = [].slice.call(svg.querySelectorAll(".phc-layer"));
  var tx0 = 0, ty0 = 0, cx = 0, cy = 0;
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!still) {
    window.addEventListener("mousemove", function (e) { tx0 = e.clientX / window.innerWidth - 0.5; ty0 = e.clientY / window.innerHeight - 0.5; }, { passive: true });
    (function tick() {
      cx += (tx0 - cx) * 0.04; cy += (ty0 - cy) * 0.04;
      if (Math.abs(tx0 - cx) > 0.0005 || Math.abs(ty0 - cy) > 0.0005) {
        layers.forEach(function (g) { var d = +g.dataset.depth; g.setAttribute("transform", "translate(" + (-cx * 26 * d).toFixed(1) + "," + (-cy * 10 * d).toFixed(1) + ")"); });
      }
      requestAnimationFrame(tick);
    })();
  }

  /* Weather chip in the top bar */
  var chip = null;
  function updateChip(wx, night) {
    var wrap = document.getElementById("widgets-wrap");
    if (!wrap) return;
    if (!chip || !chip.isConnected) {
      chip = document.createElement("div");
      chip.className = "widget-container phc-weather";
      chip.setAttribute("title", "Local weather");
      wrap.appendChild(chip);
    }
    if (!wx) { chip.style.display = "none"; return; }
    chip.style.display = "";
    var k = wx.kind, icon;
    var sunIcon = '<circle cx="12" cy="12" r="5" fill="#f6b73c"/><g stroke="#f6b73c" stroke-width="2" stroke-linecap="round"><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></g>';
    var moonIcon = '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="#c9c3ef"/>';
    var cloudIcon = '<path d="M7 18h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.5A3.3 3.3 0 0 0 7 18z" fill="#c4cfdf"/>';
    if (k === "clear") icon = night ? moonIcon : sunIcon;
    else if (k === "partly") icon = (night ? '<g transform="translate(-3 -3) scale(.75)">' + moonIcon + "</g>" : '<g transform="translate(-3 -3) scale(.75)">' + sunIcon + "</g>") + cloudIcon;
    else if (k === "snow") icon = cloudIcon + '<g fill="#9fb3d4"><circle cx="8" cy="21" r="1.3"/><circle cx="12" cy="22" r="1.3"/><circle cx="16" cy="21" r="1.3"/></g>';
    else if (k === "rain" || k === "drizzle") icon = cloudIcon + '<g stroke="#6f9bd8" stroke-width="2" stroke-linecap="round"><path d="M8 20l-1 2.5M12 20l-1 2.5M16 20l-1 2.5"/></g>';
    else if (k === "thunder") icon = cloudIcon + '<path d="M12 17l-2 4h3l-1.5 3.5" stroke="#f6b73c" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    else icon = cloudIcon;
    chip.innerHTML = '<svg viewBox="0 0 24 25" width="26" height="26" aria-hidden="true">' + icon + "</svg>" +
      '<div class="phc-weather-text"><span class="phc-weather-temp">' + Math.round(wx.temp) + "°F</span>" +
      '<span class="phc-weather-label">' + wx.label + "</span></div>";
  }

  /* ---------- apply state ---------- */
  function apply() {
    var now = window.PHC_NOW || new Date();
    var wx = window.PHC_TEST_WEATHER || weather;
    var kind = wx ? wx.kind : "partly";
    var sb = seasonBlend(now), A = P[sb.a], B = P[sb.b];
    var sun = wx && wx.rise !== null && wx.rise !== undefined && !window.PHC_NOW ? { rise: wx.rise, set: wx.set } : fallbackSun(now);
    var h = hoursOf(now);
    var nf = h < sun.rise - 0.6 || h > sun.set + 0.8 ? 1 : h < sun.rise + 0.4 ? 1 - smooth((h - sun.rise + 0.6) / 1) : h > sun.set - 0.2 ? smooth((h - sun.set + 0.2) / 1) : 0;
    var gold = Math.max(0, 1 - Math.abs(h - sun.rise - 0.3) / 1.1, 1 - Math.abs(h - sun.set + 0.3) / 1.2) * (1 - nf * 0.7);
    var cloudy = { clear: 0.1, partly: 0.45, cloudy: 0.85, fog: 0.7, drizzle: 0.8, rain: 0.9, snow: 0.85, thunder: 1 }[kind];
    if (wx && wx.cloud !== undefined) cloudy = Math.max(cloudy * 0.6, Math.min(1, wx.cloud));
    var gloom = { clear: 0, partly: 0, cloudy: 0.25, fog: 0.2, drizzle: 0.35, rain: 0.5, snow: 0.2, thunder: 0.75 }[kind];
    gold *= 1 - cloudy * 0.8;
    var winter = (sb.a === "winter" ? 1 - sb.t : 0) + (sb.b === "winter" ? sb.t : 0);
    var spring = (sb.a === "spring" ? 1 - sb.t : 0) + (sb.b === "spring" ? sb.t : 0);
    var summer = (sb.a === "summer" ? 1 - sb.t : 0) + (sb.b === "summer" ? sb.t : 0);
    var autumn = (sb.a === "autumn" ? 1 - sb.t : 0) + (sb.b === "autumn" ? sb.t : 0);

    var st = host.style;
    for (var k in A) {
      var isSky = k.indexOf("sky") === 0;
      var c = mix(A[k], B[k], sb.t, isSky ? 0.35 : 1);
      if (isSky) {
        if (GOLD[k]) c = mixRgb(c, GOLD[k], gold * 0.75);
        c = mixRgb(c, STORM[k], gloom * 0.8);
        c = mixRgb(c, NIGHT[k], nf);
      } else if (k === "cloud" || k === "cloudShade") {
        c = mixRgb(c, k === "cloud" ? "#c9cfd9" : "#8f99aa", gloom);
        c = mixRgb(c, k === "cloud" ? "#8b8fb5" : "#4b4f78", nf * 0.75);
      } else if (k !== "sun" && k !== "accent" && k !== "particle") {
        c = mixRgb(c, "#6f7890", gloom * 0.5);
        c = mixRgb(c, "#3a3a5e", nf * 0.5);
      }
      st.setProperty("--" + k, c);
    }

    var snowing = kind === "snow", raining = kind === "rain" || kind === "drizzle" || kind === "thunder";
    var cover = Math.max(snowing ? 0.9 : 0, winter > 0.7 ? (winter - 0.7) * 2 : 0);
    st.setProperty("--snowcover", cover.toFixed(2));
    st.setProperty("--capop", Math.max(0.55, 1 - summer * 0.45).toFixed(2));
    var wind = wx ? wx.wind : 6;
    st.setProperty("--drift", (-Math.min(260, wind * 9)).toFixed(0) + "px");
    st.setProperty("--sway", (1 + Math.min(3, wind / 8)).toFixed(2) + "deg");

    host.classList.toggle("phc-raining", raining);
    host.classList.toggle("phc-heavy", kind === "rain" && wx && wx.precip > 2.5 || kind === "thunder");
    host.classList.toggle("phc-drizzle", kind === "drizzle");
    host.classList.toggle("phc-thunder", kind === "thunder");
    host.classList.toggle("phc-snowing", snowing);
    host.classList.toggle("phc-petals", !raining && !snowing && spring > 0.55);
    host.classList.toggle("phc-leaves", !raining && !snowing && autumn > 0.55);
    host.classList.toggle("phc-blossom", spring > 0.4 || autumn > 0.4 || (winter > 0.5 && !raining));
    host.classList.toggle("phc-fireflies", !raining && !snowing && summer > 0.45 && nf > 0.6);
    host.classList.toggle("phc-foggy", kind === "fog");
    document.documentElement.classList.toggle("phc-night", nf > 0.5);

    cloudList.forEach(function (cl, i) {
      var need = Math.round(2 + cloudy * 8);
      cl.style.opacity = i < need ? "1" : "0";
      var dur = +cl.dataset.dur / (0.6 + Math.min(2.5, wind / 7));
      cl.style.animationDuration = dur.toFixed(0) + "s";
    });
    deck.style.opacity = clamp((cloudy - 0.55) * 2.2, 0, 1).toFixed(2);
    stars.style.opacity = (nf * (1 - cloudy * 0.9)).toFixed(2);
    warmth.style.opacity = gold.toFixed(2);

    var dayT = clamp((h - sun.rise) / (sun.set - sun.rise), 0, 1);
    sunG.setAttribute("transform", "translate(" + (160 + dayT * 1280).toFixed(0) + "," + (380 - Math.sin(dayT * Math.PI) * 270).toFixed(0) + ")");
    sunG.style.opacity = ((1 - nf) * Math.max(0, 1 - cloudy * 0.95)).toFixed(2);
    rays.style.opacity = ((1 - nf) * Math.max(0, 1 - cloudy * 1.6)).toFixed(2);
    var nightLen = 24 - (sun.set - sun.rise);
    var nt = clamp(((h - sun.set + 24) % 24) / nightLen, 0, 1);
    moonG.setAttribute("transform", "translate(" + (1420 - nt * 1240).toFixed(0) + "," + (340 - Math.sin(nt * Math.PI) * 230).toFixed(0) + ")");
    moonG.style.opacity = (nf * Math.max(0, 1 - cloudy * 0.9)).toFixed(2);

    updateChip(wx, nf > 0.5);
  }

  window.PHC_APPLY = apply;
  apply();
  loadWeather();
  setInterval(loadWeather, 15 * 60 * 1000);
  setInterval(apply, 5 * 60 * 1000);
  /* Homepage can re-render the top bar; put the chip back if it disappears. */
  setInterval(function () { if (chip && !chip.isConnected) updateChip(window.PHC_TEST_WEATHER || weather, document.documentElement.classList.contains("phc-night")); }, 3000);
})();
