/* Patel Home Cloud: an animated storybook valley behind the dashboard.
   - Season: colors and props blend through spring, summer, autumn and winter.
   - Time: sun and moon follow the real sunrise and sunset; lamps glow at dusk.
   - Weather: live from Open-Meteo (free, no key) every 15 minutes.
   - Characters: a fox cub, a bunny, a duck family, an owl at night, birds and butterflies.
   - Also adds a weather chip to the top bar.
   Only the browser talks to Open-Meteo; no key or account is involved. */
(function () {
  /* Cloudflare and the browser cache this file for hours. The first copy that runs
     loads a fresh copy (and a fresh stylesheet) with a 5-minute cache-busting tag. */
  var cs = document.currentScript, busted = cs && cs.src && cs.src.indexOf("b=") > -1;
  if (!busted && !window.__phcBoot) {
    window.__phcBoot = 1;
    var tag = Math.floor(Date.now() / 300000);
    var fresh = document.createElement("script");
    fresh.src = "/api/config/custom.js?b=" + tag;
    fresh.onerror = function () { main(); };
    document.head.appendChild(fresh);
    var css = document.createElement("link");
    css.rel = "stylesheet"; css.href = "/api/config/custom.css?b=" + tag;
    document.head.appendChild(css);
    return;
  }
  main();

  function main() {
  if (document.getElementById("phc-scene")) return;

  /* Weather location (rounded to the town). */
  /* The home town comes from a one-line prelude the compose file writes ahead of this script. */
  var LAT = window.PHC_LAT || 0, LON = window.PHC_LON || 0;
  var W = 1600, H = 900;

  /* Base colors per season. Lit and shaded tones are derived from these. */
  var P = {
    spring: { skyTop: "#6fb8ee", skyMid: "#b5ddf7", skyBot: "#fde8ee", sun: "#fff1c4", cloud: "#ffffff", far: "#b3bfe9", mid: "#8fb6dd", mesa: "#f0b48e", hill1: "#a8de8c", hill2: "#86cf73", hill3: "#6cc063", canopy: "#f6a3c2", canopy2: "#86cf6c", pine: "#3a9563", trunk: "#8a5f45", water: "#7fcbef", path: "#f6deb0", flower1: "#ff8fb8", flower2: "#ffe070", particle: "#ffc3d8" },
    summer: { skyTop: "#4eaaf0", skyMid: "#9fd7f8", skyBot: "#fff0cc", sun: "#ffe59c", cloud: "#ffffff", far: "#a3b9e6", mid: "#76a6d6", mesa: "#f3a874", hill1: "#9dd874", hill2: "#7cc75b", hill3: "#5fb64d", canopy: "#4fae4f", canopy2: "#76c757", pine: "#2c8650", trunk: "#835b3c", water: "#5ebde9", path: "#f4d9a4", flower1: "#ffd23a", flower2: "#ff8aa0", particle: "#fff3a0" },
    autumn: { skyTop: "#7cb8ea", skyMid: "#c8ddf0", skyBot: "#fee0c0", sun: "#ffcf92", cloud: "#fff8f0", far: "#c6b7da", mid: "#a597c8", mesa: "#ea9a6c", hill1: "#e6cb86", hill2: "#dcaf66", hill3: "#cf9655", canopy: "#f07636", canopy2: "#f7b23f", pine: "#3a8063", trunk: "#7a563f", water: "#9fcae8", path: "#f1d39c", flower1: "#f39b3a", flower2: "#d9503a", particle: "#ee8740" },
    winter: { skyTop: "#9fc3ee", skyMid: "#d3e3f7", skyBot: "#f5eef9", sun: "#fff3dc", cloud: "#ffffff", far: "#c0cde9", mid: "#9fb6dc", mesa: "#e2d3cd", hill1: "#eef3fb", hill2: "#e2e9f6", hill3: "#d4dff1", canopy: "#c9b7ab", canopy2: "#a7bdb0", pine: "#2f7468", trunk: "#7a6658", water: "#cde1f2", path: "#e6e9f2", flower1: "#e0474f", flower2: "#ffffff", particle: "#ffffff" }
  };
  var NIGHT = { skyTop: "#141a3d", skyMid: "#283066", skyBot: "#5a4f8e" };
  var STORM = { skyTop: "#4f5a72", skyMid: "#6b7790", skyBot: "#8f99ab" };
  var GOLD = { skyTop: "#7aa6dc", skyMid: "#ffc9a0", skyBot: "#ffa47a" };

  /* ---------- color helpers ---------- */
  function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
  function mixRgb(a, b, t) {
    var x = hex(a), y = hex(b), o = "#";
    for (var i = 0; i < 3; i++) { var n = Math.round(x[i] + (y[i] - x[i]) * t).toString(16); o += n.length < 2 ? "0" + n : n; }
    return o;
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }

  /* ---------- time and season ---------- */
  function dayOfYear(d) { return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000); }
  function seasonBlend(d) {
    var n = dayOfYear(d);
    /* Peaks (tuned to the local climate): spring mid-April, summer mid-July, fall color early November, winter mid-January. */
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

  /* ---------- tiny SVG string helpers ---------- */
  var seed = 7;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  function f1(n) { return Math.round(n * 10) / 10; }
  function a(o) { var s = ""; for (var k in o) s += " " + k + '="' + o[k] + '"'; return s; }
  function tag(name, o, inner) { return "<" + name + a(o) + (inner === undefined ? "/>" : ">" + inner + "</" + name + ">"); }
  function V(k) { return "var(--" + k + ")"; }
  function stop(off, col, op) { return '<stop offset="' + off + '" style="stop-color:' + col + (op === undefined ? "" : ";stop-opacity:" + op) + '"/>'; }
  /* A lit-to-shaded sphere, the core of the soft 3D look */
  function sph(id, key, cx, cy) {
    return '<radialGradient id="' + id + '" cx="' + (cx || 0.36) + '" cy="' + (cy || 0.3) + '" r="0.78">' + stop(0, V(key + "-l")) + stop(0.5, V(key)) + stop(1, V(key + "-s")) + "</radialGradient>";
  }
  function vlin(id, key, y1, y2) {
    return '<linearGradient id="' + id + '" x1="0" y1="' + y1 + '" x2="0" y2="' + y2 + '" gradientUnits="userSpaceOnUse">' + stop(0, V(key + "-l")) + stop(0.35, V(key)) + stop(1, V(key + "-s")) + "</linearGradient>";
  }
  function fixedSph(id, c0, c1, c2, cx, cy) {
    return '<radialGradient id="' + id + '" cx="' + (cx || 0.36) + '" cy="' + (cy || 0.28) + '" r="0.8">' + stop(0, c0) + stop(0.55, c1) + stop(1, c2) + "</radialGradient>";
  }

  /* ---------- defs ---------- */
  var D = [];
  D.push('<linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">' + stop(0, V("skyTop")) + stop(0.55, V("skyMid")) + stop(1, V("skyBot")) + "</linearGradient>");
  D.push('<radialGradient id="g-glow">' + stop(0, V("sun"), 0.9) + stop(0.25, V("sun"), 0.45) + stop(1, V("sun"), 0) + "</radialGradient>");
  D.push('<radialGradient id="g-suncore" cx=".4" cy=".38" r=".7">' + stop(0, "#ffffff") + stop(0.45, V("sun")) + stop(1, V("sun-s")) + "</radialGradient>");
  D.push('<linearGradient id="g-ray" x1="0" y1="0" x2="1" y2="0">' + stop(0, V("sun"), 0.5) + stop(0.5, V("sun"), 0.12) + stop(1, V("sun"), 0) + "</linearGradient>");
  D.push('<radialGradient id="g-moonglow">' + stop(0, "#f3f0ff", 0.35) + stop(0.3, "#cfd6ff", 0.12) + stop(1, "#cfd6ff", 0) + "</radialGradient>");
  D.push('<radialGradient id="g-moon" cx=".38" cy=".35" r=".75">' + stop(0, "#ffffff") + stop(0.6, "#fbf3dc") + stop(1, "#d9cdb4") + "</radialGradient>");
  D.push(sph("g-cloud", "cloud", 0.42, 0.22));
  D.push(vlin("g-far", "far", 320, 660));
  D.push(vlin("g-mid", "mid", 530, 700));
  D.push(vlin("g-mesa", "mesa", 520, 650));
  D.push(vlin("g-h1", "hill1", 640, 800));
  D.push(vlin("g-h2", "hill2", 735, 880));
  D.push(vlin("g-h3", "hill3", 800, 900));
  D.push(vlin("g-path", "path", 650, 900));
  D.push('<linearGradient id="g-water" x1="0" y1="705" x2="0" y2="768" gradientUnits="userSpaceOnUse">' + stop(0, V("water-s")) + stop(0.45, V("water")) + stop(1, V("water-l")) + "</linearGradient>");
  D.push('<linearGradient id="g-haze" x1="0" y1="0" x2="0" y2="1">' + stop(0, V("skyBot"), 0) + stop(1, V("skyBot"), 0.85) + "</linearGradient>");
  D.push('<linearGradient id="g-fog" x1="0" y1="0" x2="0" y2="1">' + stop(0, "#ffffff", 0) + stop(0.5, "#eef1f6", 0.8) + stop(1, "#ffffff", 0.9) + "</linearGradient>");
  D.push('<radialGradient id="g-gold" cx=".5" cy=".6" r=".6">' + stop(0, "#ffb070", 0.55) + stop(1, "#ff8a5c", 0) + "</radialGradient>");
  D.push('<radialGradient id="g-vignette" cx=".5" cy=".45" r=".75">' + stop(0.6, "#1d1838", 0) + stop(1, "#1d1838", 0.32) + "</radialGradient>");
  D.push('<radialGradient id="g-lamp">' + stop(0, "#ffd88a", 0.95) + stop(0.35, "#ffb85c", 0.45) + stop(1, "#ff9a3c", 0) + "</radialGradient>");
  D.push('<radialGradient id="g-ao">' + stop(0, "#2a2246", 0.42) + stop(1, "#2a2246", 0) + "</radialGradient>");
  D.push(sph("g-canopy", "canopy"));
  D.push(sph("g-canopy2", "canopy2"));
  D.push('<linearGradient id="g-pine" x1="0" y1="0" x2="1" y2="0">' + stop(0, V("pine-l")) + stop(0.45, V("pine")) + stop(1, V("pine-s")) + "</linearGradient>");
  D.push('<linearGradient id="g-trunk" x1="0" y1="0" x2="1" y2="0">' + stop(0, V("trunk-l")) + stop(1, V("trunk-s")) + "</linearGradient>");
  /* Characters and the cottage keep their own colors; a light filter grades them for time of day. */
  D.push(fixedSph("g-fur", "#ffbe7d", "#f3812f", "#c4521d"));
  D.push(fixedSph("g-cream", "#fffaf2", "#f8e9d6", "#e2c7a8", 0.4, 0.2));
  D.push(fixedSph("g-bun", "#ffffff", "#efe6df", "#c9bbb1"));
  D.push(fixedSph("g-duck", "#ffffff", "#f2f4f8", "#c9d1de"));
  D.push(fixedSph("g-duckling", "#fff6b0", "#ffd84a", "#e2a91f"));
  D.push(fixedSph("g-owl", "#c9a27a", "#94704f", "#5e4430"));
  D.push(fixedSph("g-wall", "#fffaf0", "#f6e6cc", "#d8bd98", 0.3, 0.25));
  D.push(fixedSph("g-roof", "#ff9f73", "#e2704a", "#a8452f", 0.3, 0.2));
  D.push(fixedSph("g-wood", "#c88c5c", "#99613c", "#6c4127"));
  D.push(fixedSph("g-leaf", "#a6e07a", "#5fae48", "#2f7a35", 0.3, 0.3));
  D.push(fixedSph("g-pumpkin", "#ffc06a", "#f38a2c", "#c25a17"));
  D.push(fixedSph("g-snowball", "#ffffff", "#eef3fb", "#c4d0e6"));
  D.push(fixedSph("g-bird", "#9fd4ff", "#4f9fe6", "#2f6db5"));
  D.push('<filter id="f-far" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="2.6"/></filter>');
  D.push('<filter id="f-mid" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>');
  D.push('<filter id="f-soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>');
  D.push('<filter id="f-mist" x="-20%" y="-300%" width="140%" height="700%"><feGaussianBlur stdDeviation="16"/></filter>');
  D.push('<filter id="f-bokeh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>');
  D.push('<filter id="f-rays" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="10"/></filter>');

  /* ---------- scene pieces ---------- */
  var S = [];
  function ao(x, y, rx, op) { return tag("ellipse", { cx: x, cy: y, rx: rx, ry: f1(rx * 0.2), fill: "url(#g-ao)", opacity: op || 1 }); }

  /* Rounded mountain: a soft bell with a shaded right flank and a snow cap */
  function peak(x, y, w, base) {
    var h = base - y;
    var body = "M" + (x - w) + " " + base + " C" + f1(x - w * 0.55) + " " + base + " " + f1(x - w * 0.32) + " " + y + " " + x + " " + y +
      " C" + f1(x + w * 0.32) + " " + y + " " + f1(x + w * 0.55) + " " + base + " " + (x + w) + " " + base + " Z";
    var shade = "M" + x + " " + y + " C" + f1(x + w * 0.32) + " " + y + " " + f1(x + w * 0.55) + " " + base + " " + (x + w) + " " + base +
      " L" + f1(x + w * 0.12) + " " + base + " C" + f1(x + w * 0.16) + " " + f1(y + h * 0.5) + " " + f1(x + w * 0.1) + " " + f1(y + h * 0.15) + " " + x + " " + y + " Z";
    var cw = w * 0.3, cy = y + h * 0.2;
    var cap = "M" + f1(x - cw) + " " + f1(cy + 6) + " C" + f1(x - cw * 0.6) + " " + f1(y + 4) + " " + f1(x - cw * 0.3) + " " + y + " " + x + " " + y +
      " C" + f1(x + cw * 0.3) + " " + y + " " + f1(x + cw * 0.6) + " " + f1(y + 4) + " " + f1(x + cw) + " " + f1(cy + 6) +
      " Q" + f1(x + cw * 0.6) + " " + f1(cy - 2) + " " + f1(x + cw * 0.35) + " " + f1(cy + 8) + " Q" + f1(x + cw * 0.1) + " " + f1(cy - 4) + " " + f1(x - cw * 0.15) + " " + f1(cy + 10) +
      " Q" + f1(x - cw * 0.45) + " " + f1(cy - 2) + " " + f1(x - cw) + " " + f1(cy + 6) + " Z";
    return tag("path", { d: body, fill: "url(#g-far)" }) + tag("path", { d: shade, style: "fill:var(--far-s)", opacity: ".55" }) +
      tag("path", { d: cap, fill: "#ffffff", "class": "phc-cap" });
  }

  /* Puffy volumetric cloud */
  function cloudShape(sc) {
    var puffs = [[-62, 4, 26], [-34, -14, 34], [4, -30, 44], [44, -12, 34], [72, 6, 24], [0, 6, 52]];
    var s = tag("ellipse", { cx: 6, cy: 30, rx: 96, ry: 12, style: "fill:var(--cloud-s)", opacity: ".35" });
    puffs.forEach(function (p) { s += tag("circle", { cx: p[0], cy: p[1], r: p[2], fill: "url(#g-cloud)" }); });
    s += tag("ellipse", { cx: 4, cy: 18, rx: 84, ry: 16, style: "fill:var(--cloud-s)", opacity: ".45" });
    return '<g transform="scale(' + sc + ')">' + s + "</g>";
  }

  /* Trees: clustered spheres for leafy trees, stacked rounded tiers for pines */
  function roundTree(x, y, sc, kind, extra) {
    var g = ao(x + 6 * sc, y + 2, 46 * sc);
    var fill = "url(#g-" + kind + ")";
    var crown = "";
    [[-26, -62, 26], [24, -64, 28], [0, -92, 34], [-30, -96, 22], [30, -100, 22], [2, -122, 24], [0, -60, 30]].forEach(function (p) {
      crown += tag("circle", { cx: p[0], cy: p[1], r: p[2], fill: fill });
    });
    crown += tag("ellipse", { cx: -14, cy: -124, rx: 13, ry: 8, fill: "#ffffff", opacity: ".28" });
    crown += tag("path", { d: "M-40 -104 Q-30 -132 -2 -142 Q26 -140 42 -110 Q28 -122 0 -126 Q-24 -124 -40 -104 Z", fill: "#ffffff", "class": "phc-snowcap" });
    crown += '<g class="phc-dots">' + tag("circle", { cx: -18, cy: -74, r: 4.5, style: "fill:var(--flower1)" }) + tag("circle", { cx: 20, cy: -96, r: 4, style: "fill:var(--flower2)" }) + tag("circle", { cx: 4, cy: -64, r: 4, style: "fill:var(--flower1)" }) + "</g>";
    var trunk = tag("path", { d: "M-7 0 C-6 -16 -6 -34 -4 -52 L4 -52 C6 -34 6 -16 7 0 Z", fill: "url(#g-trunk)" }) +
      tag("path", { d: "M-3 -40 Q-14 -50 -20 -62 M3 -44 Q14 -54 18 -66", style: "stroke:var(--trunk-s)", "stroke-width": "4", "stroke-linecap": "round", fill: "none" });
    g += '<g transform="translate(' + x + "," + y + ") scale(" + sc + ')"><g class="phc-tree" style="animation-delay:-' + f1(rnd() * 8) + 's">' + trunk + crown + (extra || "") + "</g></g>";
    return g;
  }
  function pine(x, y, sc) {
    var g = ao(x + 5 * sc, y + 2, 32 * sc);
    var tiers = "";
    [[-118, 20, 34], [-92, 28, 40], [-62, 36, 46], [-30, 42, 44]].forEach(function (t) {
      var top = t[0], w = t[1], hh = t[2];
      tiers += tag("path", { d: "M0 " + top + " C" + f1(w * 0.3) + " " + (top + hh * 0.4) + " " + w + " " + (top + hh * 0.8) + " " + w + " " + (top + hh) +
        " Q0 " + (top + hh + 9) + " " + (-w) + " " + (top + hh) + " C" + (-w) + " " + (top + hh * 0.8) + " " + f1(-w * 0.3) + " " + (top + hh * 0.4) + " 0 " + top + " Z", fill: "url(#g-pine)" });
    });
    tiers += tag("path", { d: "M0 -118 C4 -110 10 -100 14 -92 Q2 -96 -10 -92 C-6 -100 -3 -110 0 -118 Z M-20 -58 Q0 -64 22 -58 Q0 -52 -20 -58 Z", fill: "#ffffff", "class": "phc-snowcap" });
    g += '<g transform="translate(' + x + "," + y + ") scale(" + sc + ')"><g class="phc-tree" style="animation-delay:-' + f1(rnd() * 8) + 's">' +
      tag("rect", { x: -5, y: -14, width: 10, height: 16, rx: 3, fill: "url(#g-trunk)" }) + tiers + "</g></g>";
    return g;
  }
  function bush(x, y, sc, kind) {
    var fill = "url(#g-" + kind + ")";
    return ao(x, y + 1, 30 * sc, 0.8) + '<g transform="translate(' + x + "," + y + ") scale(" + sc + ')">' +
      tag("circle", { cx: -14, cy: -12, r: 15, fill: fill }) + tag("circle", { cx: 12, cy: -14, r: 17, fill: fill }) + tag("circle", { cx: -1, cy: -24, r: 16, fill: fill }) +
      '<g class="phc-dots">' + tag("circle", { cx: -8, cy: -22, r: 3.2, style: "fill:var(--flower1)" }) + tag("circle", { cx: 10, cy: -12, r: 3, style: "fill:var(--flower2)" }) + "</g>" +
      tag("path", { d: "M-24 -22 Q-4 -46 22 -26 Q0 -34 -24 -22 Z", fill: "#ffffff", "class": "phc-snowcap" }) + "</g>";
  }
  function flowers(x, y, n, spread) {
    var s = "";
    for (var i = 0; i < n; i++) {
      var fx = f1(x + (rnd() - 0.5) * spread), fy = f1(y + rnd() * 20), col = rnd() > 0.5 ? "flower1" : "flower2";
      s += tag("path", { d: "M" + fx + " " + fy + " q-1 -8 0 -14", style: "stroke:var(--hill3-s)", "stroke-width": "2", fill: "none" });
      s += tag("circle", { cx: fx, cy: f1(fy - 15), r: f1(3 + rnd() * 1.6), style: "fill:var(--" + col + ")" });
      s += tag("circle", { cx: fx, cy: f1(fy - 15), r: 1.2, fill: "#fff6c8" });
    }
    return '<g class="phc-flowers">' + s + "</g>";
  }
  function tufts(y0, y1, n, key) {
    var s = "";
    for (var i = 0; i < n; i++) {
      var tx = f1(rnd() * W), ty = f1(y0 + rnd() * (y1 - y0));
      s += "M" + tx + " " + ty + " q-3 -10 -8 -14 M" + tx + " " + ty + " q0 -12 2 -18 M" + tx + " " + ty + " q4 -9 9 -12 ";
    }
    return tag("path", { d: s, style: "stroke:var(--" + key + "-s)", "stroke-width": "2.4", "stroke-linecap": "round", fill: "none", opacity: ".7" });
  }

  /* ---------- characters ---------- */
  var INK = "#2b1c1a";
  function eye(x, y, rx, ry) {
    return tag("ellipse", { cx: x, cy: y, rx: rx, ry: ry, fill: INK }) + tag("circle", { cx: f1(x + rx * 0.3), cy: f1(y - ry * 0.4), r: f1(rx * 0.42), fill: "#ffffff" }) +
      tag("circle", { cx: f1(x - rx * 0.35), cy: f1(y + ry * 0.35), r: f1(rx * 0.18), fill: "#ffffff", opacity: ".9" });
  }
  function fox() {
    var tail = '<g class="phc-fox-tail">' +
      tag("path", { d: "M18 -12 C64 -6 104 -30 98 -78 C94 -104 70 -112 60 -96 C70 -70 60 -40 20 -36 Z", fill: "url(#g-fur)" }) +
      tag("path", { d: "M98 -78 C94 -104 70 -112 60 -96 C66 -86 80 -78 98 -78 Z", fill: "url(#g-cream)" }) + "</g>";
    var body = '<g class="phc-fox-body">' +
      tag("path", { d: "M-38 0 C-50 -34 -36 -78 0 -84 C36 -78 50 -34 38 0 Z", fill: "url(#g-fur)" }) +
      tag("path", { d: "M-20 0 C-26 -26 -18 -58 0 -62 C18 -58 26 -26 20 0 Z", fill: "url(#g-cream)" }) +
      tag("ellipse", { cx: -40, cy: -8, rx: 15, ry: 10, fill: "url(#g-fur)" }) +
      tag("ellipse", { cx: -15, cy: -5, rx: 12, ry: 7.5, fill: "#4a2c24" }) + tag("ellipse", { cx: 15, cy: -5, rx: 12, ry: 7.5, fill: "#4a2c24" }) +
      tag("ellipse", { cx: -18, cy: -8, rx: 5, ry: 2.4, fill: "#ffffff", opacity: ".25" }) + "</g>";
    var scarf = '<g class="phc-fox-scarf">' +
      tag("path", { d: "M-34 -86 C-12 -74 12 -74 34 -86 L36 -72 C12 -60 -12 -60 -36 -72 Z", fill: "#e2475a" }) +
      tag("path", { d: "M-34 -82 C-12 -70 12 -70 34 -82", stroke: "#ffffff", "stroke-width": "3", fill: "none", opacity: ".7", "stroke-dasharray": "6 6" }) +
      tag("path", { d: "M12 -70 L26 -36 Q18 -32 10 -34 L2 -66 Z", fill: "#cf3a4e" }) +
      tag("path", { d: "M12 -40 l-3 8 M18 -40 l0 9 M24 -40 l2 8", stroke: "#cf3a4e", "stroke-width": "2.5", "stroke-linecap": "round" }) + "</g>";
    var ears = tag("path", { d: "M-36 -20 C-44 -40 -46 -58 -42 -66 C-36 -66 -22 -50 -12 -34 Z", fill: "url(#g-fur)", "class": "phc-ear-l" }) +
      tag("path", { d: "M36 -20 C44 -40 46 -58 42 -66 C36 -66 22 -50 12 -34 Z", fill: "url(#g-fur)", "class": "phc-ear-r" }) +
      tag("path", { d: "M-33 -26 C-38 -40 -40 -52 -38 -58 C-32 -56 -24 -44 -18 -34 Z M33 -26 C38 -40 40 -52 38 -58 C32 -56 24 -44 18 -34 Z", fill: "#5a3127" });
    var face = tag("path", { d: "M-50 4 C-52 -30 -28 -48 0 -48 C28 -48 52 -30 50 4 C44 28 20 38 0 38 C-20 38 -44 28 -50 4 Z", fill: "url(#g-fur)" }) +
      tag("path", { d: "M-50 4 C-42 12 -30 14 -20 10 C-12 28 12 28 20 10 C30 14 42 12 50 4 C44 28 20 40 0 40 C-20 40 -44 28 -50 4 Z", fill: "url(#g-cream)" }) +
      tag("ellipse", { cx: -30, cy: 12, rx: 8, ry: 4.5, fill: "#ff7d7d", opacity: ".35" }) + tag("ellipse", { cx: 30, cy: 12, rx: 8, ry: 4.5, fill: "#ff7d7d", opacity: ".35" }) +
      '<g class="phc-eyes">' + eye(-17, -6, 8, 10) + eye(17, -6, 8, 10) + "</g>" +
      '<g class="phc-sleepy">' + tag("path", { d: "M-25 -4 Q-17 3 -9 -4 M9 -4 Q17 3 25 -4", stroke: INK, "stroke-width": "3", "stroke-linecap": "round", fill: "none" }) + "</g>" +
      tag("path", { d: "M-7 13 Q0 8 7 13 Q4 19 0 19 Q-4 19 -7 13 Z", fill: INK }) + tag("ellipse", { cx: -2, cy: 12, rx: 2.4, ry: 1.2, fill: "#ffffff", opacity: ".7" }) +
      tag("path", { d: "M-6 23 Q-2 27 0 22 Q2 27 6 23", stroke: INK, "stroke-width": "2", "stroke-linecap": "round", fill: "none" }) +
      tag("ellipse", { cx: -16, cy: -40, rx: 14, ry: 6, fill: "#ffffff", opacity: ".22" });
    var head = '<g class="phc-fox-head" transform="translate(0,-104)">' + ears + face + "</g>";
    var umbrella = '<g class="phc-umbrella">' +
      tag("path", { d: "M30 -24 Q44 -120 14 -196", stroke: "#4f7d34", "stroke-width": "5", "stroke-linecap": "round", fill: "none" }) +
      tag("path", { d: "M-96 -176 C-60 -250 70 -262 120 -184 C70 -206 -40 -204 -96 -176 Z", fill: "url(#g-leaf)" }) +
      tag("path", { d: "M-80 -182 Q14 -240 110 -188 M-40 -196 L-20 -224 M10 -204 L20 -236 M56 -200 L74 -228", stroke: "#2f7a35", "stroke-width": "2.5", fill: "none", opacity: ".55" }) +
      tag("ellipse", { cx: 20, cy: -36, rx: 9, ry: 7, fill: "url(#g-fur)" }) + "</g>";
    var zz = '<g class="phc-zz">' + tag("text", { x: 46, y: -150, "font-size": "20", "font-weight": "800", fill: "#ffffff", "font-family": "Nunito, sans-serif" }, "z") +
      tag("text", { x: 60, y: -172, "font-size": "15", "font-weight": "800", fill: "#ffffff", "font-family": "Nunito, sans-serif" }, "z") + "</g>";
    return '<g class="phc-char phc-fox" transform="translate(300,846) scale(1.12)">' + ao(10, 2, 74) + tail + body + scarf + head + umbrella + zz + "</g>";
  }
  function bunny() {
    return '<g class="phc-char phc-bunny" transform="translate(930,808) scale(1.05)">' + ao(4, 1, 30) + '<g class="phc-hop">' +
      tag("circle", { cx: 26, cy: -16, r: 8, fill: "#ffffff" }) +
      tag("ellipse", { cx: 8, cy: -17, rx: 22, ry: 17, fill: "url(#g-bun)" }) +
      tag("ellipse", { cx: 18, cy: -4, rx: 12, ry: 5, fill: "#e5d9d0" }) +
      '<g class="phc-bun-ears">' + tag("ellipse", { cx: -16, cy: -56, rx: 5.5, ry: 16, fill: "url(#g-bun)", transform: "rotate(-12 -16 -44)" }) + tag("ellipse", { cx: -16, cy: -56, rx: 2.6, ry: 11, fill: "#ffb3c3", transform: "rotate(-12 -16 -44)" }) +
      tag("ellipse", { cx: -5, cy: -57, rx: 5.5, ry: 16, fill: "url(#g-bun)", transform: "rotate(10 -5 -44)" }) + tag("ellipse", { cx: -5, cy: -57, rx: 2.6, ry: 11, fill: "#ffb3c3", transform: "rotate(10 -5 -44)" }) + "</g>" +
      tag("circle", { cx: -12, cy: -32, r: 14, fill: "url(#g-bun)" }) +
      eye(-17, -34, 3, 3.6) + tag("ellipse", { cx: -10, cy: -26, rx: 4, ry: 2.4, fill: "#ff9aa9", opacity: ".45" }) +
      tag("circle", { cx: -25, cy: -29, r: 2, fill: "#ff8fa3", "class": "phc-nose" }) +
      tag("ellipse", { cx: -4, cy: -2, rx: 9, ry: 4, fill: "#f4ece6" }) + "</g></g>";
  }
  function duck(x, sc, kid, delay) {
    var body = kid ? "url(#g-duckling)" : "url(#g-duck)";
    var d = '<g class="phc-bob" style="animation-delay:-' + delay + 's">' +
      tag("ellipse", { cx: 0, cy: 4, rx: 36, ry: 5, fill: "#ffffff", opacity: ".35" }) +
      tag("path", { d: "M-30 0 C-30 -18 -10 -24 8 -20 C24 -18 36 -10 34 2 C22 10 -20 10 -30 0 Z", fill: body }) +
      tag("path", { d: "M28 -8 L42 -20 L36 0 Z", fill: body }) +
      tag("path", { d: "M-4 -10 C8 -18 22 -14 24 -6 C14 -1 2 -1 -4 -10 Z", fill: kid ? "#f2c23a" : "#e3e8f0" }) +
      tag("path", { d: "M-22 -12 C-26 -22 -24 -30 -20 -34", stroke: kid ? "#ffd84a" : "#f2f4f8", "stroke-width": "12", "stroke-linecap": "round", fill: "none" }) +
      tag("circle", { cx: -22, cy: -38, r: 13, fill: body }) +
      tag("path", { d: "M-34 -38 Q-48 -37 -45 -32 Q-39 -30 -33 -33 Z", fill: "#ff9f2e" }) +
      eye(-26, -41, 2.4, 2.8) + "</g>";
    return '<g transform="translate(' + x + ',0) scale(' + sc + ')">' + d + "</g>";
  }
  function ducks() {
    return '<g class="phc-ducks"><g class="phc-swim"><g class="phc-turn"><g transform="translate(0,742)">' +
      duck(0, 0.8, false, 0) + duck(56, 0.46, true, 0.7) + duck(92, 0.42, true, 1.4) + duck(124, 0.44, true, 2.1) + "</g></g></g></g>";
  }
  function owl() {
    var eyes = function (glow) {
      return '<g class="phc-owl-eyes">' + tag("circle", { cx: -9, cy: -30, r: 8, fill: glow ? "#ffe27a" : "#f6e7c4" }) + tag("circle", { cx: 9, cy: -30, r: 8, fill: glow ? "#ffe27a" : "#f6e7c4" }) +
        (glow ? "" : tag("circle", { cx: -9, cy: -30, r: 5.2, fill: "#ffcf3a" }) + tag("circle", { cx: 9, cy: -30, r: 5.2, fill: "#ffcf3a" }) +
          tag("circle", { cx: -9, cy: -30, r: 3, fill: INK }) + tag("circle", { cx: 9, cy: -30, r: 3, fill: INK }) +
          tag("circle", { cx: -7.6, cy: -31.6, r: 1.2, fill: "#ffffff" }) + tag("circle", { cx: 10.4, cy: -31.6, r: 1.2, fill: "#ffffff" })) + "</g>";
    };
    var o = '<g class="phc-owl-head">' + tag("path", { d: "M-18 -40 L-16 -54 L-8 -44 Z M18 -40 L16 -54 L8 -44 Z", fill: "#7a5a3f" }) +
      tag("ellipse", { cx: 0, cy: -32, rx: 20, ry: 17, fill: "url(#g-owl)" }) + eyes(false) + tag("path", { d: "M-3 -24 L0 -18 L3 -24 Z", fill: "#e8a43a" }) + "</g>";
    var bodyO = tag("ellipse", { cx: 0, cy: -8, rx: 18, ry: 20, fill: "url(#g-owl)" }) + tag("ellipse", { cx: 0, cy: -4, rx: 11, ry: 14, fill: "#e9d3b4" }) +
      tag("path", { d: "M-6 -10 l3 3 l3 -3 l3 3 l3 -3 M-6 -2 l3 3 l3 -3 l3 3 l3 -3", stroke: "#b8946c", "stroke-width": "1.6", fill: "none" }) +
      tag("path", { d: "M-8 12 l-3 4 M-4 12 l0 5 M4 12 l0 5 M8 12 l3 4", stroke: "#e8a43a", "stroke-width": "2.4", "stroke-linecap": "round" });
    return { body: '<g class="phc-char phc-owl" transform="translate(1394,764)">' + bodyO + o + "</g>",
      glow: '<g class="phc-owl-glow" transform="translate(1394,764)"><g class="phc-owl-head">' + eyes(true) + "</g></g>" };
  }
  function bird(delay, sc) {
    return '<g transform="scale(' + sc + ')"><g class="phc-bird" style="animation-delay:-' + delay + 's">' +
      tag("ellipse", { cx: 0, cy: 0, rx: 11, ry: 9, fill: "url(#g-bird)" }) + tag("ellipse", { cx: -2, cy: 4, rx: 7, ry: 4.5, fill: "#ffb36b" }) +
      tag("circle", { cx: -9, cy: -4, r: 6, fill: "url(#g-bird)" }) + tag("path", { d: "M-15 -4 L-20 -2 L-15 -1 Z", fill: "#f2a23a" }) +
      tag("circle", { cx: -11, cy: -5, r: 1.4, fill: INK }) + tag("path", { d: "M10 -2 L18 -6 L16 2 Z", fill: "#2f6db5" }) +
      '<g class="phc-wing">' + tag("path", { d: "M-2 -4 C2 -18 12 -22 16 -16 C10 -12 6 -6 -2 -4 Z", fill: "#3a82d0" }) + "</g></g></g>";
  }
  function butterfly(c1, c2, delay) {
    var wing = tag("path", { d: "M0 0 C-6 -14 -18 -16 -16 -4 C-15 2 -6 2 0 0 Z", fill: c1 }) + tag("path", { d: "M0 0 C-4 6 -12 10 -12 4 C-12 0 -6 0 0 0 Z", fill: c2 });
    return '<g class="phc-fly-path" style="animation-delay:-' + delay + 's"><g class="phc-butterfly">' +
      '<g class="phc-wing-l">' + wing + "</g>" + '<g class="phc-wing-r" transform="scale(-1,1)">' + wing + "</g>" +
      tag("ellipse", { cx: 0, cy: 0, rx: 1.6, ry: 6, fill: "#4a3a4a" }) + "</g></g>";
  }
  function cottage() {
    var winGlass = function (x, y, w, h) { return tag("rect", { x: x, y: y, width: w, height: h, rx: 6, fill: "#5a6c8f" }) + tag("rect", { x: x, y: y, width: w, height: h, rx: 6, fill: "#ffd47e", "class": "phc-lit" }); };
    var house = ao(0, 2, 120, 1) +
      tag("path", { d: "M34 -128 L34 -170 Q34 -176 40 -176 L58 -176 Q64 -176 64 -170 L64 -118 Z", fill: "#b85c44" }) +
      tag("rect", { x: 30, y: -182, width: 38, height: 10, rx: 4, fill: "#8f4535" }) +
      tag("path", { d: "M-76 0 L-76 -84 Q-76 -94 -66 -94 L66 -94 Q76 -94 76 -84 L76 0 Z", fill: "url(#g-wall)" }) +
      tag("path", { d: "M40 -94 L76 -94 L76 0 L52 0 Z", fill: "#b8957a", opacity: ".25" }) +
      tag("path", { d: "M-102 -86 Q-96 -104 -78 -112 L-8 -164 Q0 -170 8 -164 L78 -112 Q96 -104 102 -86 Q0 -70 -102 -86 Z", fill: "url(#g-roof)" }) +
      tag("path", { d: "M-102 -86 Q-96 -104 -78 -112 L-8 -164", stroke: "#ffd0b0", "stroke-width": "4", fill: "none", opacity: ".6", "stroke-linecap": "round" }) +
      tag("path", { d: "M-70 -100 Q-40 -92 -10 -98 M-50 -122 Q-20 -114 14 -120 M20 -102 Q50 -94 80 -100 M-30 -142 Q-4 -136 20 -140", stroke: "#a8452f", "stroke-width": "2.5", fill: "none", opacity: ".45" }) +
      tag("path", { d: "M-104 -88 Q-98 -110 -78 -118 L-8 -170 Q0 -176 8 -170 L78 -118 Q98 -110 104 -88 Q90 -100 76 -106 L8 -156 Q0 -160 -8 -156 L-76 -106 Q-92 -100 -104 -88 Z", fill: "#ffffff", "class": "phc-snowcap" }) +
      tag("circle", { cx: 0, cy: -126, r: 11, fill: "#7a4a32" }) + tag("circle", { cx: 0, cy: -126, r: 8, fill: "#5a6c8f" }) + tag("circle", { cx: 0, cy: -126, r: 8, fill: "#ffd47e", "class": "phc-lit" }) +
      tag("path", { d: "M-15 0 L-15 -44 Q0 -62 15 -44 L15 0 Z", fill: "url(#g-wood)" }) + tag("circle", { cx: 9, cy: -22, r: 2.2, fill: "#ffd36e" }) +
      tag("rect", { x: -62, y: -72, width: 32, height: 30, rx: 7, fill: "#8a5a3c" }) + winGlass(-58, -68, 24, 22) +
      tag("rect", { x: 30, y: -72, width: 32, height: 30, rx: 7, fill: "#8a5a3c" }) + winGlass(34, -68, 24, 22) +
      tag("path", { d: "M-46 -68 v22 M-58 -57 h24 M46 -68 v22 M34 -57 h24", stroke: "#8a5a3c", "stroke-width": "3" }) +
      tag("rect", { x: -64, y: -42, width: 36, height: 9, rx: 3, fill: "#9c6a46" }) + tag("rect", { x: 28, y: -42, width: 36, height: 9, rx: 3, fill: "#9c6a46" }) +
      '<g class="phc-flowers">' + [-58, -50, -42, -34, 34, 42, 50, 58].map(function (fx, i) { return tag("circle", { cx: fx, cy: -45, r: 4, style: "fill:var(--flower" + (i % 2 ? 2 : 1) + ")" }); }).join("") + "</g>" +
      tag("path", { d: "M26 0 L26 -36", stroke: "#5a4032", "stroke-width": "3" }) + tag("rect", { x: 20, y: -46, width: 12, height: 12, rx: 3, fill: "#3d2c24" }) +
      tag("rect", { x: 22.5, y: -43.5, width: 7, height: 7, rx: 2, fill: "#ffd47e", "class": "phc-lit" });
    var smoke = '<g class="phc-smoke">' + [0, 1, 2, 3, 4].map(function (i) {
      return tag("circle", { cx: 49, cy: -186, r: 9 + i, fill: "#f4f1f6", style: "animation-delay:-" + (i * 1.6) + "s" });
    }).join("") + "</g>";
    var props = '<g class="phc-autumn-only">' + tag("ellipse", { cx: 32, cy: -8, rx: 14, ry: 11, fill: "url(#g-pumpkin)" }) + tag("ellipse", { cx: 50, cy: -6, rx: 10, ry: 8, fill: "url(#g-pumpkin)" }) +
      tag("path", { d: "M32 -18 q2 -5 5 -6 M50 -13 q1 -4 4 -5", stroke: "#4f7d34", "stroke-width": "3", "stroke-linecap": "round", fill: "none" }) + "</g>" +
      '<g class="phc-summer-only">' + [[-96, -54], [-112, -44], [-84, -40]].map(function (p) {
        return tag("path", { d: "M" + p[0] + " 0 L" + p[0] + " " + p[1], stroke: "#4f8a34", "stroke-width": "3.5" }) +
          tag("circle", { cx: p[0], cy: p[1], r: 10, fill: "#ffc93c" }) + tag("circle", { cx: p[0], cy: p[1], r: 4.6, fill: "#7a4a22" });
      }).join("") + "</g>";
    return '<g class="phc-char phc-cottage" transform="translate(1200,658) scale(.9)">' + house + props + "</g>" + '<g transform="translate(1200,658) scale(.9)">' + smoke + "</g>";
  }
  function cottageGlow() {
    return '<g class="phc-glow" transform="translate(1200,658) scale(.9)">' +
      tag("circle", { cx: -46, cy: -57, r: 46, fill: "url(#g-lamp)" }) + tag("circle", { cx: 46, cy: -57, r: 46, fill: "url(#g-lamp)" }) +
      tag("circle", { cx: 0, cy: -126, r: 26, fill: "url(#g-lamp)" }) + tag("circle", { cx: 26, cy: -40, r: 30, fill: "url(#g-lamp)" }) +
      tag("ellipse", { cx: 0, cy: 18, rx: 90, ry: 16, fill: "url(#g-lamp)", opacity: ".6" }) + "</g>";
  }
  function snowman() {
    return '<g class="phc-char phc-winter-only" transform="translate(1316,672) scale(.62)">' + ao(0, 2, 34) +
      tag("circle", { cx: 0, cy: -24, r: 26, fill: "url(#g-snowball)" }) + tag("circle", { cx: 0, cy: -64, r: 19, fill: "url(#g-snowball)" }) +
      tag("circle", { cx: 0, cy: -94, r: 14, fill: "url(#g-snowball)" }) + tag("path", { d: "M2 -93 L18 -90 L2 -88 Z", fill: "#f38a2c" }) +
      tag("circle", { cx: -5, cy: -98, r: 2, fill: INK }) + tag("circle", { cx: 6, cy: -98, r: 2, fill: INK }) +
      tag("path", { d: "M-14 -80 Q0 -72 14 -80 L14 -74 Q0 -66 -14 -74 Z M6 -76 L12 -56 L4 -56 Z", fill: "#3f8fd6" }) +
      tag("path", { d: "M-18 -66 L-40 -80 M18 -66 L38 -84", stroke: "#7a5a3f", "stroke-width": "3", "stroke-linecap": "round" }) +
      tag("rect", { x: -11, y: -118, width: 22, height: 14, rx: 2, fill: "#3a3550" }) + tag("rect", { x: -16, y: -106, width: 32, height: 4, rx: 2, fill: "#3a3550" }) + "</g>";
  }

  /* ---------- the village: houses, people and holidays ---------- */
  var SKIN = ["#f7d2b6", "#e8b48f", "#c68a5e", "#8d5a3b"];
  SKIN.forEach(function (c, i) { D.push(fixedSph("g-skin" + i, mixRgb(c, "#ffffff", 0.35), c, mixRgb(c, "#6a3a2a", 0.35), 0.38, 0.3)); });
  D.push('<linearGradient id="g-roofshade" x1="0" y1="0" x2="1" y2="1">' + stop(0, "#ffffff", 0.22) + stop(0.5, "#ffffff", 0) + stop(1, "#2a1a30", 0.3) + "</linearGradient>");
  D.push(fixedSph("g-stone", "#f1ece6", "#cfc6bc", "#9d9288", 0.3, 0.25));
  D.push(fixedSph("g-xtree", "#7fd08a", "#2f9a55", "#1b6a3c", 0.4, 0.3));
  D.push('<radialGradient id="g-spark">' + stop(0, "#ffffff", 1) + stop(0.3, "#fff2b0", 0.8) + stop(1, "#ffb84a", 0) + "</radialGradient>");

  /* A rounded little person. Feet at 0,0, about 64 tall. Arms are drawn pointing down and turned at the shoulder,
     so anything held is drawn "below" the hand and turns with the arm. */
  function arm(side, ang, coat, skin, held, cls) {
    var sx = side * 11;
    return '<g transform="rotate(' + ang + " " + sx + ' -40)"><g class="phc-arm ' + (cls || "") + '">' +
      tag("path", { d: "M" + sx + " -40 L" + (sx + side * 1.5) + " -26", stroke: coat, "stroke-width": "7", "stroke-linecap": "round", fill: "none" }) +
      '<g transform="translate(' + (sx + side * 1.5) + ',-24)">' + (held || "") + tag("circle", { r: 3.6, fill: "url(#g-skin" + skin + ")" }) + "</g></g></g>";
  }
  var PS = 1;
  function person(o) {
    var coat = o.coat || "#3f8fd6", pants = o.pants || "#3a3550", skin = o.skin || 0, hair = o.hair || "#3a2a22";
    var legs = o.sit ? tag("path", { d: "M-8 -18 L-8 -8 L4 -8 M8 -18 L8 -8 L18 -8", stroke: pants, "stroke-width": "7", "stroke-linecap": "round", "stroke-linejoin": "round", fill: "none" }) +
        tag("ellipse", { cx: 6, cy: -6, rx: 4, ry: 2.5, fill: "#2b1c1a" }) + tag("ellipse", { cx: 20, cy: -6, rx: 4, ry: 2.5, fill: "#2b1c1a" })
      : '<g class="phc-leg-l">' + tag("path", { d: "M-5 -20 L-5 -3", stroke: pants, "stroke-width": "7", "stroke-linecap": "round" }) + tag("ellipse", { cx: -6, cy: -1.5, rx: 4.6, ry: 2.6, fill: o.boots || "#2b1c1a" }) + "</g>" +
        '<g class="phc-leg-r">' + tag("path", { d: "M5 -20 L5 -3", stroke: pants, "stroke-width": "7", "stroke-linecap": "round" }) + tag("ellipse", { cx: 6, cy: -1.5, rx: 4.6, ry: 2.6, fill: o.boots || "#2b1c1a" }) + "</g>";
    var body = tag("path", { d: "M-12 -16 C-14 -34 -10 -46 0 -46 C10 -46 14 -34 12 -16 Q0 -12 -12 -16 Z", fill: coat }) +
      tag("path", { d: "M3 -46 C10 -45 14 -34 12 -16 Q7 -14 3 -14 Z", fill: "#000000", opacity: ".14" }) +
      tag("path", { d: "M-8 -40 Q-10 -30 -9 -22", stroke: "#ffffff", "stroke-width": "2.4", "stroke-linecap": "round", fill: "none", opacity: ".3" });
    if (o.scarf) body += tag("path", { d: "M-9 -45 Q0 -40 9 -45 L9 -40 Q0 -35 -9 -40 Z M4 -40 L7 -28 L2 -28 Z", fill: o.scarf });
    var head = '<g class="phc-head">' + tag("circle", { cx: 0, cy: -57, r: 11.5, fill: "url(#g-skin" + skin + ")" }) +
      tag("circle", { cx: -4, cy: -57, r: 1.5, fill: "#2b1c1a" }) + tag("circle", { cx: 4, cy: -57, r: 1.5, fill: "#2b1c1a" }) +
      tag("ellipse", { cx: -7, cy: -53.5, rx: 2.6, ry: 1.5, fill: "#ff7d7d", opacity: ".45" }) + tag("ellipse", { cx: 7, cy: -53.5, rx: 2.6, ry: 1.5, fill: "#ff7d7d", opacity: ".45" }) +
      tag("path", { d: "M-2.5 -52.5 Q0 -50.5 2.5 -52.5", stroke: "#2b1c1a", "stroke-width": "1.3", fill: "none", "stroke-linecap": "round" }) +
      (o.hat ? o.hat : tag("path", { d: o.long ? "M-12 -58 C-13 -72 13 -72 12 -58 L13 -46 Q9 -50 8 -60 Q0 -64 -8 -60 Q-9 -50 -13 -46 Z" : "M-12 -58 C-12 -71 12 -71 12 -58 Q6 -63 0 -62 Q-6 -63 -12 -58 Z", fill: hair })) + "</g>";
    var arms = arm(-1, o.al === undefined ? 12 : o.al, coat, skin, o.hl, o.clsL) + arm(1, o.ar === undefined ? -12 : o.ar, coat, skin, o.hr, o.clsR);
    var back = o.back || "", front = o.front || "";
    return '<g transform="translate(' + o.x + "," + o.y + ") scale(" + (o.flip ? -1 : 1) * (o.s || 1) * PS + "," + (o.s || 1) * PS + ')"><g class="' + (o.cls || "") + '">' +
      ao(0, 0, 16, 0.8) + back + legs + body + arms + head + front + "</g></g>";
  }
  var HAT = {
    beanie: function (c) { return tag("path", { d: "M-12 -59 C-12 -73 12 -73 12 -59 Z", fill: c }) + tag("rect", { x: -13, y: -61, width: 26, height: 5, rx: 2.5, fill: "#ffffff", opacity: ".85" }) + tag("circle", { cx: 0, cy: -72, r: 3.5, fill: "#ffffff" }); },
    sun: function (c) { return tag("ellipse", { cx: 0, cy: -63, rx: 19, ry: 4, fill: c }) + tag("path", { d: "M-9 -63 C-9 -73 9 -73 9 -63 Z", fill: c }) + tag("path", { d: "M-9 -65 L9 -65", stroke: "#e2475a", "stroke-width": "2.4" }); },
    witch: function () { return tag("ellipse", { cx: 0, cy: -63, rx: 18, ry: 4, fill: "#3b2a5a" }) + tag("path", { d: "M-9 -64 L4 -92 L9 -64 Z", fill: "#3b2a5a" }) + tag("path", { d: "M-8 -67 L8 -67", stroke: "#f2a23a", "stroke-width": "2.4" }); },
    santa: function () { return tag("path", { d: "M-12 -61 C-10 -74 6 -78 16 -70 L12 -61 Z", fill: "#d93a4a" }) + tag("rect", { x: -13, y: -63, width: 26, height: 5, rx: 2.5, fill: "#ffffff" }) + tag("circle", { cx: 17, cy: -70, r: 3.5, fill: "#ffffff" }); },
    pilgrim: function () { return tag("rect", { x: -8, y: -78, width: 16, height: 16, rx: 2, fill: "#2b2630" }) + tag("ellipse", { cx: 0, cy: -63, rx: 16, ry: 3.5, fill: "#2b2630" }) + tag("rect", { x: -8, y: -68, width: 16, height: 3.5, fill: "#d9b44a" }); },
    hood: function (c) { return tag("path", { d: "M-14 -55 C-16 -75 16 -75 14 -55 Q12 -66 0 -67 Q-12 -66 -14 -55 Z", fill: c }); }
  };
  /* things to hold */
  var HELD = {
    umbrella: function (c) { return tag("path", { d: "M0 0 L0 40", stroke: "#4a3a3a", "stroke-width": "2" }) + tag("path", { d: "M-30 44 Q0 18 30 44 Q22 40 15 44 Q7 40 0 44 Q-7 40 -15 44 Q-22 40 -30 44 Z", fill: c, transform: "rotate(180 0 40)" }); },
    rake: function () { return tag("path", { d: "M0 -14 L0 30", stroke: "#a0703f", "stroke-width": "2.6", "stroke-linecap": "round" }) + tag("path", { d: "M-9 32 L9 32 M-8 32 l-1 6 M-3 32 l0 6 M3 32 l0 6 M8 32 l1 6", stroke: "#7a7f8a", "stroke-width": "2", "stroke-linecap": "round" }); },
    can: function () { return '<g class="phc-pour">' + tag("path", { d: "M-6 2 L8 2 L9 14 L-7 14 Z", fill: "#5aa9e6" }) + tag("path", { d: "M8 6 L18 -2", stroke: "#5aa9e6", "stroke-width": "3", "stroke-linecap": "round" }) +
      '<g class="phc-drops">' + tag("circle", { cx: 19, cy: 4, r: 1.4, fill: "#9fd4ff" }) + tag("circle", { cx: 21, cy: 9, r: 1.2, fill: "#9fd4ff" }) + tag("circle", { cx: 18, cy: 13, r: 1.3, fill: "#9fd4ff" }) + "</g></g>"; },
    lantern: function () { return tag("path", { d: "M0 0 L0 6", stroke: "#4a3a3a", "stroke-width": "1.6" }) + tag("rect", { x: -5, y: 6, width: 10, height: 12, rx: 2, fill: "#5a4032" }) + tag("rect", { x: -3.4, y: 8, width: 6.8, height: 8, rx: 1.4, fill: "#ffd47e" }); },
    rod: function () { return tag("path", { d: "M0 0 L0 -6 M0 0 L4 46", stroke: "#7a5a3f", "stroke-width": "2", "stroke-linecap": "round" }); },
    cone: function () { return tag("path", { d: "M-3 0 L3 0 L0 9 Z", fill: "#e0a560" }) + tag("circle", { cx: 0, cy: -2, r: 4, fill: "#ffb3d1" }); },
    book: function () { return tag("rect", { x: -6, y: -2, width: 12, height: 9, rx: 1.4, fill: "#b23a48" }) + tag("path", { d: "M0 -2 L0 7", stroke: "#ffffff", "stroke-width": "1" }); },
    basket: function (c) { return tag("path", { d: "M-7 4 Q0 -8 7 4", stroke: "#a0703f", "stroke-width": "1.8", fill: "none" }) + tag("path", { d: "M-8 4 L8 4 L6 13 L-6 13 Z", fill: "#c99a5b" }) + tag("ellipse", { cx: -3, cy: 4, rx: 2.4, ry: 3, fill: c || "#ff8fc6" }) + tag("ellipse", { cx: 3, cy: 4, rx: 2.4, ry: 3, fill: "#8fd3ff" }); },
    pail: function () { return tag("path", { d: "M-6 4 Q0 -6 6 4", stroke: "#4a3a3a", "stroke-width": "1.4", fill: "none" }) + tag("path", { d: "M-7 4 L7 4 L5 15 L-5 15 Z", fill: "#ff9f2e" }); },
    balloon: function () { return tag("path", { d: "M0 0 Q-4 -20 2 -44", stroke: "#ffffff", "stroke-width": "1", fill: "none" }) + tag("path", { d: "M2 -44 C-10 -54 -8 -66 2 -60 C12 -66 14 -54 2 -44 Z", fill: "#ff4f7a", "class": "phc-float" }); },
    pumpkin: function () { return tag("ellipse", { cx: 0, cy: 8, rx: 9, ry: 7, fill: "url(#g-pumpkin)" }) + tag("path", { d: "M0 1 q1 -3 3 -4", stroke: "#4f7d34", "stroke-width": "2", fill: "none" }); },
    kite: function () { return tag("path", { d: "M0 0 Q-40 -60 -70 -150", stroke: "#ffffff", "stroke-width": "1", fill: "none", opacity: ".8" }) +
      '<g class="phc-kite" transform="translate(-72,-160)">' + tag("path", { d: "M0 -18 L12 0 L0 20 L-12 0 Z", fill: "#ff5d73" }) + tag("path", { d: "M0 -18 L0 20 M-12 0 L12 0", stroke: "#ffffff", "stroke-width": "1.2", opacity: ".8" }) +
      tag("path", { d: "M0 20 q6 8 0 14 q-6 8 0 14", stroke: "#ffd84a", "stroke-width": "1.6", fill: "none" }) + "</g>"; }
  };
  var C = { red: "#e2475a", blue: "#3f8fd6", mustard: "#f2b632", green: "#4caf7a", purple: "#8e6bd6", coral: "#ff8a5c", navy: "#2f4f7a", teal: "#2fb3a6", pink: "#ff8fc6", brown: "#8a5a3c" };

  /* String lights along a roof line, used for Christmas and Halloween */
  function bulbs(pts, cls, colors) {
    var s = tag("path", { d: "M" + pts.map(function (p) { return p[0] + " " + p[1]; }).join(" L"), stroke: "#3a3040", "stroke-width": "1.2", fill: "none" });
    var n = 0;
    for (var k = 0; k < pts.length - 1; k++) {
      var p0 = pts[k], p1 = pts[k + 1], segs = Math.max(2, Math.round(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 12));
      for (var j = 0; j < segs; j++) {
        var t = j / segs, bx = p0[0] + (p1[0] - p0[0]) * t, by = p0[1] + (p1[1] - p0[1]) * t;
        s += tag("circle", { cx: f1(bx), cy: f1(by + 3), r: 3.4, fill: colors[n % colors.length], style: "animation-delay:-" + f1((n % 5) * 0.4) + "s" });
        n++;
      }
    }
    return '<g class="phc-bulbs ' + cls + '">' + s + "</g>";
  }
  var XMAS = ["#ff4d5e", "#ffd84a", "#4fd38a", "#5ab4ff", "#ff9a3c"], HWN = ["#ff8a2c", "#b46cff", "#ffb347"], USA = ["#e2475a", "#ffffff", "#3f8fd6"];


  /* Diwali: a clay diya with a flickering flame, a star lantern and a rangoli */
  function diya(x, y, sc) {
    return '<g transform="translate(' + x + "," + y + ") scale(" + (sc || 1) + ')">' + tag("path", { d: "M-7 -3 Q0 5 7 -3 Q0 -1 -7 -3 Z", fill: "#b5582c" }) + tag("ellipse", { cx: 0, cy: -3, rx: 7, ry: 1.8, fill: "#e08a3c" }) +
      '<g class="phc-flame">' + tag("path", { d: "M0 -12 Q3 -7 0 -4 Q-3 -7 0 -12 Z", fill: "#ffd25a" }) + tag("path", { d: "M0 -9.5 Q1.4 -6.5 0 -5 Q-1.4 -6.5 0 -9.5 Z", fill: "#fff6c8" }) + "</g></g>";
  }
  function diyaGlow(x, y, sc) { return tag("circle", { cx: x, cy: y - 8 * (sc || 1), r: f1(16 * (sc || 1)), fill: "url(#g-lamp)" }); }
  function starLantern(x, y, c) {
    var pts = "";
    for (var k = 0; k < 10; k++) { var an = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 6 : 13; pts += (k ? " L" : "M") + f1(x + Math.cos(an) * rr) + " " + f1(y + Math.sin(an) * rr); }
    return tag("path", { d: "M" + x + " " + (y - 30) + " L" + x + " " + (y - 12), stroke: "#4a3a3a", "stroke-width": "1.4" }) + '<g class="phc-swing" style="transform-origin:' + x + "px " + (y - 30) + 'px">' +
      tag("path", { d: pts + " Z", fill: c }) + tag("circle", { cx: x, cy: y, r: 4.5, fill: "#fff2b0", opacity: ".9" }) + tag("path", { d: "M" + (x - 4) + " " + (y + 12) + " v12 M" + x + " " + (y + 12) + " v16 M" + (x + 4) + " " + (y + 12) + " v12", stroke: c, "stroke-width": "1.6" }) + "</g>";
  }
  function rangoli(x, y, s) {
    var t = "", cols = ["#ff4f7a", "#ffb02e", "#3fbf7f", "#5a8cff", "#c86bff", "#ffe14a"];
    for (var ring = 3; ring >= 1; ring--) {
      var n = ring * 8, R = ring * 14;
      for (var k = 0; k < n; k++) { var an = k / n * Math.PI * 2; t += tag("ellipse", { cx: f1(Math.cos(an) * R), cy: f1(Math.sin(an) * R), rx: 7, ry: 4, fill: cols[(k + ring) % 6], transform: "rotate(" + f1(an * 180 / Math.PI) + " " + f1(Math.cos(an) * R) + " " + f1(Math.sin(an) * R) + ")" }); }
    }
    t += tag("circle", { r: 9, fill: "#ffe14a" }) + tag("circle", { r: 4, fill: "#ff4f7a" });
    var lamps = ""; for (var j = 0; j < 8; j++) { var aj = j / 8 * Math.PI * 2; lamps += diya(f1(x + Math.cos(aj) * 54 * s), f1(y + Math.sin(aj) * 54 * s * 0.28), 0.9); }
    return '<g class="phc-char"><g transform="translate(' + x + "," + y + ") scale(" + s + "," + f1(s * 0.28) + ')">' + t + "</g>" + lamps + "</g>";
  }
  /* A house. w = half width, h = wall height, roof style "gable" or "steep". */
  function house(o) {
    var w = o.w || 70, h = o.h || 80, rh = o.rh || 70, wall = o.wall || "#f6e6cc", roof = o.roof || "#e2704a";
    var wallD = "M" + (-w) + " 0 L" + (-w) + " " + (-h + 8) + " Q" + (-w) + " " + (-h) + " " + (-w + 8) + " " + (-h) + " L" + (w - 8) + " " + (-h) + " Q" + w + " " + (-h) + " " + w + " " + (-h + 8) + " L" + w + " 0 Z";
    var eave = w + 16, top = -h - rh;
    var roofD = "M" + (-eave) + " " + (-h + 6) + " Q" + (-eave + 4) + " " + (-h - 10) + " " + (-w) + " " + (-h - 16) + " L-6 " + (top + 4) + " Q0 " + top + " 6 " + (top + 4) + " L" + w + " " + (-h - 16) + " Q" + (eave - 4) + " " + (-h - 10) + " " + eave + " " + (-h + 6) + " Q0 " + (-h + 20) + " " + (-eave) + " " + (-h + 6) + " Z";
    var s = ao(0, 2, w + 30, 1);
    var chx = w * 0.45;
    s += tag("path", { d: "M" + (chx - 9) + " " + (-h - rh * 0.45) + " L" + (chx - 9) + " " + (top + rh * 0.15) + " L" + (chx + 9) + " " + (top + rh * 0.15) + " L" + (chx + 9) + " " + (-h - rh * 0.6) + " Z", fill: "#a85a46" });
    s += tag("rect", { x: chx - 12, y: f1(top + rh * 0.15 - 6), width: 24, height: 7, rx: 3, fill: "#8f4535" });
    s += tag("path", { d: wallD, fill: wall }) + tag("path", { d: "M" + (w * 0.45) + " " + (-h) + " L" + w + " " + (-h) + " L" + w + " 0 L" + (w * 0.6) + " 0 Z", fill: "#3a2a20", opacity: ".14" });
    if (o.timber) s += tag("path", { d: "M" + (-w) + " " + (-h * 0.55) + " L" + w + " " + (-h * 0.55) + " M" + (-w * 0.5) + " " + (-h) + " L" + (-w * 0.5) + " " + (-h * 0.55) + " M" + (w * 0.5) + " " + (-h) + " L" + (w * 0.5) + " " + (-h * 0.55), stroke: "#7a5038", "stroke-width": "4", opacity: ".7" });
    s += tag("path", { d: roofD, fill: roof }) + tag("path", { d: roofD, fill: "url(#g-roofshade)" });
    s += tag("path", { d: "M" + (-eave) + " " + (-h + 6) + " Q" + (-eave + 4) + " " + (-h - 10) + " " + (-w) + " " + (-h - 16) + " L-6 " + (top + 4), stroke: "#ffffff", "stroke-width": "3", fill: "none", opacity: ".35", "stroke-linecap": "round" });
    s += tag("path", { d: roofD, fill: "#ffffff", "class": "phc-snowcap", transform: "translate(0,-3) scale(1,.96)" });
    var win = function (x, y, ww, hh) {
      return tag("rect", { x: x - 3, y: y - 3, width: ww + 6, height: hh + 6, rx: 5, fill: "#7a5038" }) + tag("rect", { x: x, y: y, width: ww, height: hh, rx: 4, fill: "#566a8e" }) +
        tag("rect", { x: x, y: y, width: ww, height: hh, rx: 4, fill: "#ffd47e", "class": "phc-lit" }) + tag("path", { d: "M" + (x + ww / 2) + " " + y + " v" + hh + " M" + x + " " + (y + hh / 2) + " h" + ww, stroke: "#7a5038", "stroke-width": "2.4" });
    };
    var wy = -h * 0.78, wh = h * 0.32, ww = w * 0.36;
    s += win(-w * 0.78, wy, ww, wh) + win(w * 0.42, wy, ww, wh);
    if (rh > 50) s += win(-ww * 0.45, -h - rh * 0.5, ww * 0.9, wh * 0.8);
    var dw = w * 0.26, dh = h * 0.5;
    s += tag("path", { d: "M" + (-dw) + " 0 L" + (-dw) + " " + (-dh + dw) + " Q0 " + (-dh - dw * 0.4) + " " + dw + " " + (-dh + dw) + " L" + dw + " 0 Z", fill: o.door || "#8a4f32" }) + tag("circle", { cx: dw * 0.55, cy: -dh * 0.45, r: 2, fill: "#ffd36e" });
    /* holiday dressing */
    var roofPts = [[-eave + 2, -h + 4], [-w, -h - 14], [0, top + 6], [w, -h - 14], [eave - 2, -h + 4]];
    s += bulbs(roofPts, "phc-fest phc-fest-xmas", XMAS) + bulbs(roofPts, "phc-fest phc-fest-halloween", HWN);
    s += '<g class="phc-fest phc-fest-xmas">' + tag("circle", { cx: 0, cy: f1(-dh * 0.62), r: 9, fill: "none", stroke: "#2f8a4a", "stroke-width": "5" }) + tag("path", { d: "M-4 " + f1(-dh * 0.62 + 8) + " l4 -4 l4 4", stroke: "#d93a4a", "stroke-width": "3", fill: "none" }) + "</g>";
    s += '<g class="phc-fest phc-fest-halloween phc-fest-thanks">' + tag("ellipse", { cx: -dw - 14, cy: -7, rx: 10, ry: 8, fill: "url(#g-pumpkin)" }) +
      '<g class="phc-fest phc-fest-halloween">' + tag("path", { d: "M" + (-dw - 18) + " -9 l2.5 -3 l2.5 3 Z M" + (-dw - 12) + " -9 l2.5 -3 l2.5 3 Z M" + (-dw - 19) + " -5 q5 3 10 0", fill: "#ffd25a", stroke: "#ffd25a", "stroke-width": "1" }) + "</g></g>";
    s += '<g class="phc-fest phc-fest-thanks">' + tag("path", { d: "M" + (w - 4) + " 0 L" + (w + 2) + " -40 M" + (w + 4) + " 0 L" + (w + 10) + " -44 M" + (w + 10) + " 0 L" + (w + 18) + " -38", stroke: "#d6a84a", "stroke-width": "4", "stroke-linecap": "round" }) + tag("rect", { x: w - 8, y: -14, width: 28, height: 14, rx: 3, fill: "#e0b860" }) + "</g>";
    s += '<g class="phc-fest phc-fest-july4">' + tag("path", { d: "M" + (-w + 6) + " " + (-h + 4) + " l-16 -30", stroke: "#6a5a4a", "stroke-width": "2" }) +
      tag("path", { d: "M" + (-w - 10) + " " + (-h - 26) + " l22 -6 l4 14 l-22 6 Z", fill: "#ffffff" }) + tag("path", { d: "M" + (-w - 10) + " " + (-h - 26) + " l9 -2.5 l2 6 l-9 2.5 Z", fill: "#2f4f9a" }) +
      tag("path", { d: "M" + (-w - 6) + " " + (-h - 18) + " l20 -5.5 M" + (-w - 5) + " " + (-h - 13) + " l20 -5.5", stroke: "#d93a4a", "stroke-width": "2" }) + "</g>";
    s += '<g class="phc-fest phc-fest-diwali">' + diya(-dw - 10, 0) + diya(-dw - 24, 0) + diya(dw + 10, 0) + diya(dw + 24, 0) + diya(f1(-w * 0.78 + ww * 0.25), f1(wy + wh + 3)) + diya(f1(-w * 0.78 + ww * 0.75), f1(wy + wh + 3)) +
      diya(f1(w * 0.42 + ww * 0.25), f1(wy + wh + 3)) + diya(f1(w * 0.42 + ww * 0.75), f1(wy + wh + 3)) + starLantern(f1(-w - 4), f1(-h + 34), ["#ff6a3c", "#ffb02e", "#e2475a", "#c86bff"][Math.round(o.x) % 4]) +
      tag("path", { d: "M" + (-dw - 4) + " " + f1(-dh - 2) + " Q0 " + f1(-dh + 10) + " " + (dw + 4) + " " + f1(-dh - 2), stroke: "#ff9f1c", "stroke-width": "4", fill: "none", "stroke-dasharray": "4 3" }) + "</g>";
    var g = '<g class="phc-char" transform="translate(' + o.x + "," + o.y + ") scale(" + o.s + ')">' + s + "</g>";
    var smoke = '<g class="phc-smoke" transform="translate(' + o.x + "," + o.y + ") scale(" + o.s + ')">' + [0, 1, 2, 3].map(function (i) {
      return tag("circle", { cx: chx, cy: f1(top + rh * 0.15 - 12), r: 5 + i * 1.5, fill: "#f4f1f6", opacity: ".8", style: "animation-delay:-" + f1(i * 1.8 + o.x % 3) + "s" });
    }).join("") + "</g>";
    var glow = '<g transform="translate(' + o.x + "," + o.y + ") scale(" + o.s + ')">' + tag("circle", { cx: f1(-w * 0.78 + ww / 2), cy: f1(wy + wh / 2), r: f1(w * 0.55), fill: "url(#g-lamp)" }) +
      tag("circle", { cx: f1(w * 0.42 + ww / 2), cy: f1(wy + wh / 2), r: f1(w * 0.55), fill: "url(#g-lamp)" }) + tag("ellipse", { cx: 0, cy: 12, rx: w, ry: 12, fill: "url(#g-lamp)", opacity: ".5" }) + '<g class="phc-fest phc-fest-diwali">' + diyaGlow(-dw - 17, 0, 1.6) + diyaGlow(dw + 17, 0, 1.6) + "</g></g>";
    return { art: g + smoke, glow: glow };
  }
  function chapel(x, y, s) {
    var b = ao(0, 2, 70, 1) +
      tag("path", { d: "M-34 0 L-34 -150 L0 -200 L34 -150 L34 0 Z", fill: "#f4ecf2" }) + tag("path", { d: "M10 -160 L34 -150 L34 0 L14 0 Z", fill: "#3a2a20", opacity: ".14" }) +
      tag("path", { d: "M-40 -146 L0 -206 L40 -146 Q0 -138 -40 -146 Z", fill: "#5a7ab8" }) + tag("path", { d: "M-40 -146 L0 -206 L40 -146 Q0 -138 -40 -146 Z", fill: "#ffffff", "class": "phc-snowcap", transform: "translate(0,-3)" }) +
      tag("path", { d: "M0 -206 L0 -232 M-8 -222 L8 -222", stroke: "#d9b44a", "stroke-width": "4", "stroke-linecap": "round" }) +
      tag("path", { d: "M-12 -150 L-12 -126 Q0 -140 12 -126 L12 -150 Z", fill: "#4a3a3a" }) + '<g class="phc-bell">' + tag("path", { d: "M-6 -134 Q-6 -146 0 -146 Q6 -146 6 -134 Z", fill: "#e8c25a" }) + "</g>" +
      tag("path", { d: "M-10 -72 L-10 -100 Q0 -114 10 -100 L10 -72 Z", fill: "#566a8e" }) + tag("path", { d: "M-10 -72 L-10 -100 Q0 -114 10 -100 L10 -72 Z", fill: "#ffd47e", "class": "phc-lit" }) +
      tag("path", { d: "M-14 0 L-14 -36 Q0 -52 14 -36 L14 0 Z", fill: "#7a4a32" }) +
      bulbs([[-40, -144], [0, -204], [40, -144]], "phc-fest phc-fest-xmas", ["#ffd84a"]);
    return { art: '<g class="phc-char" transform="translate(' + x + "," + y + ") scale(" + s + ')">' + b + "</g>",
      glow: '<g transform="translate(' + x + "," + y + ") scale(" + s + ')">' + tag("circle", { cx: 0, cy: -88, r: 40, fill: "url(#g-lamp)" }) + "</g>" };
  }
  function lamp(x, y, s) {
    return { art: '<g class="phc-char" transform="translate(' + x + "," + y + ") scale(" + s + ')">' + ao(0, 0, 12) + tag("path", { d: "M0 0 L0 -64", stroke: "#3d3442", "stroke-width": "4" }) +
      tag("path", { d: "M-8 -64 L8 -64 L5 -80 L-5 -80 Z", fill: "#3d3442" }) + tag("rect", { x: -4.5, y: -78, width: 9, height: 12, rx: 2, fill: "#566a8e" }) + tag("rect", { x: -4.5, y: -78, width: 9, height: 12, rx: 2, fill: "#ffe08a", "class": "phc-lit" }) +
      '<g class="phc-fest phc-fest-xmas">' + tag("path", { d: "M-3 -60 Q0 -40 3 -20 M3 -60 Q0 -40 -3 -20", stroke: "#d93a4a", "stroke-width": "3" }) + tag("circle", { cx: 0, cy: -60, r: 5, fill: "none", stroke: "#2f8a4a", "stroke-width": "3" }) + "</g></g>",
      glow: '<g transform="translate(' + x + "," + y + ") scale(" + s + ')">' + tag("circle", { cx: 0, cy: -72, r: 46, fill: "url(#g-lamp)" }) + tag("ellipse", { cx: 0, cy: 2, rx: 40, ry: 9, fill: "url(#g-lamp)", opacity: ".6" }) + "</g>" };
  }
  function well(x, y, s) {
    return '<g class="phc-char" transform="translate(' + x + "," + y + ") scale(" + (s || 0.8) + ')">' + ao(0, 0, 34) +
      tag("path", { d: "M-24 0 L-24 -24 Q0 -30 24 -24 L24 0 Q0 6 -24 0 Z", fill: "url(#g-stone)" }) + tag("ellipse", { cx: 0, cy: -24, rx: 24, ry: 6, fill: "#5d5466" }) +
      tag("path", { d: "M-20 -24 L-20 -62 M20 -24 L20 -62", stroke: "#8a5a3c", "stroke-width": "4" }) + tag("path", { d: "M-30 -58 L0 -78 L30 -58 Z", fill: "#c0563c" }) + tag("path", { d: "M0 -60 L0 -40", stroke: "#4a3a3a", "stroke-width": "1.4" }) + tag("rect", { x: -5, y: -42, width: 10, height: 8, rx: 2, fill: "#9c6a46" }) + "</g>";
  }
  function xtree(x, y, s) {
    var t = ao(0, 0, 50) + tag("rect", { x: -6, y: -16, width: 12, height: 16, fill: "#7a4a32" });
    [[-46, -14, 40], [-38, -48, 34], [-28, -80, 26], [-18, -108, 18]].forEach(function (l) { t += tag("path", { d: "M" + l[0] + " " + l[1] + " Q0 " + (l[1] + 8) + " " + (-l[0]) + " " + l[1] + " L0 " + (l[1] - l[2] - 14) + " Z", fill: "url(#g-xtree)" }); });
    var lights = "";
    for (var k = 0; k < 26; k++) { var ty = -18 - k * 4.2, tw = 40 - k * 1.4; lights += tag("circle", { cx: f1(Math.sin(k * 2.4) * tw * 0.8), cy: f1(ty), r: 2.8, fill: XMAS[k % 5], style: "animation-delay:-" + f1((k % 6) * 0.35) + "s" }); }
    t += '<g class="phc-bulbs">' + lights + "</g>" + tag("path", { d: "M0 -150 l4 9 l10 1 l-8 6 l3 10 l-9 -6 l-9 6 l3 -10 l-8 -6 l10 -1 Z", fill: "#ffd84a", "class": "phc-star" });
    t += tag("rect", { x: -40, y: -12, width: 18, height: 12, rx: 2, fill: "#d93a4a" }) + tag("rect", { x: 22, y: -14, width: 16, height: 14, rx: 2, fill: "#3f8fd6" }) + tag("rect", { x: -18, y: -10, width: 14, height: 10, rx: 2, fill: "#f2b632" }) +
      tag("path", { d: "M-31 -12 v12 M30 -14 v14 M-11 -10 v10", stroke: "#ffffff", "stroke-width": "2" });
    return '<g class="phc-fest phc-fest-xmas"><g class="phc-char" transform="translate(' + x + "," + y + ") scale(" + s + ')">' + t + "</g></g>";
  }
  function feast(x, y) {
    var t = tag("rect", { x: -90, y: -26, width: 180, height: 10, rx: 4, fill: "#a0703f" }) + tag("path", { d: "M-80 -16 L-80 0 M80 -16 L80 0 M-20 -16 L-20 0 M20 -16 L20 0", stroke: "#7a5038", "stroke-width": "5" }) +
      tag("rect", { x: -92, y: -30, width: 184, height: 6, rx: 3, fill: "#f4e6c8" }) +
      tag("ellipse", { cx: 0, cy: -38, rx: 18, ry: 12, fill: "#c9773a" }) + tag("ellipse", { cx: -4, cy: -42, rx: 10, ry: 5, fill: "#e8a060", opacity: ".7" }) + tag("path", { d: "M14 -42 l8 -6 M-14 -42 l-8 -6", stroke: "#f4e6c8", "stroke-width": "4", "stroke-linecap": "round" }) +
      '<g class="phc-steam">' + [0, 1, 2].map(function (i) { return tag("path", { d: "M" + (-6 + i * 6) + " -54 q4 -6 0 -12 q-4 -6 0 -12", stroke: "#ffffff", "stroke-width": "2", fill: "none", opacity: ".7", style: "animation-delay:-" + i + "s" }); }).join("") + "</g>" +
      tag("ellipse", { cx: -50, cy: -34, rx: 12, ry: 5, fill: "#d9893a" }) + tag("ellipse", { cx: 50, cy: -34, rx: 12, ry: 5, fill: "#b84a3a" }) + tag("circle", { cx: -28, cy: -35, r: 5, fill: "#f2b632" }) + tag("circle", { cx: 30, cy: -35, r: 5, fill: "#7ab84a" });
    var folks = person({ x: -70, y: -6, s: 0.62, coat: C.brown, skin: 1, sit: true, al: -60, ar: -70, cls: "phc-eat" }) + person({ x: -36, y: -6, s: 0.5, coat: C.mustard, skin: 0, sit: true, long: true, hair: "#c98f4a", al: -70, ar: -50, cls: "phc-eat" }) +
      person({ x: 70, y: -6, s: 0.62, coat: C.green, skin: 2, sit: true, flip: true, hair: "#1f1a1a", al: -60, ar: -70, cls: "phc-eat" }) + person({ x: 36, y: -6, s: 0.52, coat: C.coral, skin: 3, sit: true, flip: true, long: true, al: -50, ar: -70, cls: "phc-eat" });
    return '<g class="phc-fest phc-fest-thanks phc-people" transform="translate(' + x + "," + y + ')">' + ao(0, 0, 110) + folks + '<g class="phc-char">' + t + "</g></g>";
  }
  function bunting(x0, y0, x1, y1, cls, colors) {
    var s = tag("path", { d: "M" + x0 + " " + y0 + " Q" + ((x0 + x1) / 2) + " " + (Math.max(y0, y1) + 22) + " " + x1 + " " + y1, stroke: "#5a4a4a", "stroke-width": "1.2", fill: "none" });
    for (var k = 1; k < 12; k++) {
      var t = k / 12, bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t * t * x1, by = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (Math.max(y0, y1) + 22) + t * t * y1;
      s += tag("path", { d: "M" + f1(bx - 5) + " " + f1(by) + " L" + f1(bx + 5) + " " + f1(by) + " L" + f1(bx) + " " + f1(by + 11) + " Z", fill: colors[k % colors.length] });
    }
    return '<g class="phc-char ' + cls + '">' + s + "</g>";
  }
  function fireworks() {
    var s = "", spots = [[80, 300, "#ff5d73"], [230, 450, "#ffd84a"], [560, 520, "#7ad3ff"], [900, 500, "#b46cff"], [1240, 530, "#7affb0"], [1510, 430, "#ff9a3c"], [1440, 250, "#ffd84a"]];
    spots.forEach(function (p, i) {
      var rays = "";
      for (var k = 0; k < 14; k++) { var an = k / 14 * Math.PI * 2; rays += tag("path", { d: "M" + f1(Math.cos(an) * 10) + " " + f1(Math.sin(an) * 10) + " L" + f1(Math.cos(an) * 70) + " " + f1(Math.sin(an) * 70), stroke: p[2], "stroke-width": "4", "stroke-linecap": "round" }) + tag("circle", { cx: f1(Math.cos(an) * 78), cy: f1(Math.sin(an) * 78), r: 3.2, fill: "#ffffff" }); }
      s += '<g transform="translate(' + p[0] + "," + p[1] + ')"><g class="phc-burst" style="animation-delay:-' + f1(i * 0.9) + 's">' + tag("circle", { r: 46, fill: "url(#g-spark)" }) + rays + "</g></g>";
    });
    return '<g class="phc-fest phc-fireworks">' + s + "</g>";
  }
  function bats() {
    var bat = function (x, y, d) { return '<g transform="translate(' + x + "," + y + ')"><g class="phc-bat" style="animation-delay:-' + d + 's">' + tag("path", { d: "M0 0 Q-8 -8 -18 -4 Q-12 -2 -10 4 Q-6 0 0 4 Q6 0 10 4 Q12 -2 18 -4 Q8 -8 0 0 Z", fill: "#2b2238" }) + "</g></g>"; };
    return '<g class="phc-fest phc-fest-halloween phc-bats">' + bat(980, 560, 0) + bat(1030, 540, 0.4) + bat(1290, 566, 0.8) + bat(1440, 552, 1.2) + bat(260, 580, 0.2) + bat(330, 556, 0.7) + "</g>";
  }
  function sleigh() {
    var deer = function (x) { return tag("ellipse", { cx: x, cy: 0, rx: 12, ry: 6, fill: "#2b2238" }) + tag("path", { d: "M" + (x - 10) + " 0 l-4 10 M" + (x + 8) + " 0 l4 10 M" + (x - 12) + " -4 l-6 -10 l-4 -4 M" + (x - 16) + " -12 l4 -4", stroke: "#2b2238", "stroke-width": "2.4", "stroke-linecap": "round" }); };
    return '<g class="phc-fest phc-fest-eve"><g class="phc-sleigh">' + deer(-60) + deer(-30) + deer(0) + tag("path", { d: "M10 -2 L30 2", stroke: "#2b2238", "stroke-width": "1.4" }) +
      tag("path", { d: "M30 -10 L64 -10 Q70 -10 70 -2 L68 6 L30 6 Q26 0 30 -10 Z M26 10 L72 10 Q78 10 78 4", fill: "#2b2238", stroke: "#2b2238", "stroke-width": "2" }) + tag("circle", { cx: 50, cy: -16, r: 7, fill: "#2b2238" }) + "</g></g>";
  }
  function eggs(list) {
    var cols = ["#ff8fc6", "#8fd3ff", "#ffe27a", "#a6e07a", "#c7a6ff"];
    return '<g class="phc-fest phc-fest-easter">' + list.map(function (p, i) { return tag("ellipse", { cx: p[0], cy: p[1], rx: 5, ry: 6.5, fill: cols[i % 5] }) + tag("path", { d: "M" + (p[0] - 5) + " " + p[1] + " q5 -3 10 0", stroke: "#ffffff", "stroke-width": "1.4", fill: "none" }); }).join("") + "</g>";
  }
  function hearts(x0, y0, x1, y1) {
    var s = tag("path", { d: "M" + x0 + " " + y0 + " Q" + ((x0 + x1) / 2) + " " + (y0 + 26) + " " + x1 + " " + y1, stroke: "#c95a7a", "stroke-width": "1.2", fill: "none" });
    for (var k = 1; k < 9; k++) { var t = k / 9, bx = x0 + (x1 - x0) * t, by = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 13; s += tag("path", { d: "M" + f1(bx) + " " + f1(by + 9) + " C" + f1(bx - 9) + " " + f1(by + 2) + " " + f1(bx - 5) + " " + f1(by - 4) + " " + f1(bx) + " " + f1(by + 1) + " C" + f1(bx + 5) + " " + f1(by - 4) + " " + f1(bx + 9) + " " + f1(by + 2) + " " + f1(bx) + " " + f1(by + 9) + " Z", fill: k % 2 ? "#ff5d8a" : "#ff9ab8" }); }
    return '<g class="phc-char phc-fest phc-fest-valentine">' + s + "</g>";
  }
  function notes() {
    return '<g class="phc-notes">' + [0, 1, 2].map(function (i) { return tag("text", { x: i * 14, y: 0, "font-size": "16", fill: "#ffffff", "font-family": "Nunito, sans-serif", style: "animation-delay:-" + f1(i * 1.1) + "s" }, i % 2 ? "♫" : "♪"); }).join("") + "</g>";
  }
  /* ---------- lay out the village ---------- */
  function act(cls, inner) { return '<g class="phc-act ' + cls + '">' + inner + "</g>"; }
  function stroll(inner, dur, dist, delay) {
    return '<g class="phc-stroll" style="--dist:' + dist + "px;animation-duration:" + dur + "s;animation-delay:-" + (delay || 0) + 's"><g class="phc-turn2" style="animation-duration:' + dur + "s;animation-delay:-" + (delay || 0) + 's">' + inner + "</g></g>";
  }
  function walker(o) { o.cls = (o.cls || "") + " phc-walk"; return person(o); }
  var vGlow = "", vH1 = "", vH2 = "", vH3 = "";
  [
    { x: 345, y: 662, s: 0.38, wall: "#eaf3e6", roof: "#e2a13a", rh: 56 },
    { x: 230, y: 666, s: 0.44, wall: "#f6e6cc", roof: "#b5654a", timber: true },
    { x: 1490, y: 686, s: 0.4, wall: "#f3ead2", roof: "#4f9a6a" },
    { x: 1370, y: 666, s: 0.44, wall: "#fbe3e0", roof: "#c0563c" },
    { x: 1000, y: 678, s: 0.46, wall: "#fff3dc", roof: "#e2704a", timber: true },
    { x: 1238, y: 660, s: 0.52, wall: "#e9f1f6", roof: "#5a8ac6", door: "#c0563c" }
  ].forEach(function (o) { o.s *= 1.35; var hz = house(o); vH1 += hz.art; vGlow += hz.glow; });
  var ch = chapel(1108, 670, 0.66); vH1 += ch.art; vGlow += ch.glow;
  /* the square */
  var l1 = lamp(1158, 710, 0.78), l2 = lamp(1336, 704, 0.78); vGlow += l1.glow + l2.glow;
  vH1 += bunting(1158, 650, 1336, 644, "phc-fest phc-fest-july4", USA) + hearts(1158, 650, 1336, 644) + bunting(1158, 650, 1336, 644, "phc-fest phc-fest-halloween", ["#ff8a2c", "#3b2a5a"]);
  vH1 += bunting(1158, 650, 1336, 644, "phc-fest phc-fest-holi", ["#ff4f7a", "#ffb02e", "#3fbf7f", "#5a8cff", "#c86bff"]) + bunting(1158, 650, 1336, 644, "phc-fest phc-fest-diwali", ["#ff9f1c", "#ffd25a", "#e2475a"]);
  vH1 += well(1404, 716, 0.75) + l1.art + l2.art + xtree(1246, 720, 0.82) + '<g class="phc-fest phc-fest-diwali">' + rangoli(1246, 722, 1.05) + "</g>";
  vGlow += '<g class="phc-fest phc-fest-diwali">' + diyaGlow(1246, 722, 4) + "</g>";
  PS = 1.2; vH1 += feast(1246, 726); PS = 1.45;

  /* people on the first hill */
  PS = 1.45;
  var dock = tag("path", { d: "M548 734 L612 734 L612 741 L548 741 Z", fill: "#a0703f" }) + tag("path", { d: "M556 741 v12 M604 741 v12", stroke: "#7a5038", "stroke-width": "4" });
  vH1 += '<g class="phc-char">' + dock + "</g>";
  vH1 += act("phc-act-summer phc-day", '<g class="phc-char">' + person({ x: 592, y: 734, s: 0.55, coat: C.mustard, skin: 1, sit: true, hat: HAT.sun("#f6d77a"), ar: -112, al: -95, hr: HELD.rod() }) +
    tag("path", { d: "M645 679 Q656 704 660 742", stroke: "#ffffff", "stroke-width": "1", fill: "none", opacity: ".8" }) + '<g class="phc-bobber">' + tag("circle", { cx: 660, cy: 742, r: 3, fill: "#ff4d5e" }) + "</g>" +
    '<g class="phc-swimmer" transform="translate(905,744)">' + tag("ellipse", { cx: 0, cy: 0, rx: 13, ry: 4.5, fill: "none", stroke: "#ff6b7a", "stroke-width": "4" }) + tag("circle", { cx: 0, cy: -8, r: 7, fill: "url(#g-skin2)" }) +
    tag("path", { d: "M-7 -12 Q0 -19 7 -12", fill: "#1f1a1a" }) + tag("circle", { cx: -2, cy: -8, r: 1, fill: INK }) + tag("circle", { cx: 2.5, cy: -8, r: 1, fill: INK }) + tag("path", { d: "M-6 -3 l-8 -8 M6 -3 l8 -8", stroke: "#c68a5e", "stroke-width": "3", "stroke-linecap": "round", "class": "phc-wave" }) + "</g></g>");
  vH1 += act("phc-act-skate", '<g class="phc-skate">' + person({ x: 720, y: 746, s: 0.5, coat: C.red, skin: 0, scarf: "#ffffff", hat: HAT.beanie("#3f8fd6"), al: 40, ar: -50 }) + "</g>" +
    '<g class="phc-skate phc-skate2">' + person({ x: 812, y: 750, s: 0.46, coat: C.teal, skin: 2, scarf: "#ffd84a", hat: HAT.beanie("#e2475a"), long: true, flip: true, al: 50, ar: -40 }) + "</g>");
  vH1 += act("phc-act-spring phc-day", '<g class="phc-char">' + tag("ellipse", { cx: 1036, cy: 722, rx: 40, ry: 7, fill: "#7a5038", opacity: ".7" }) + flowers(1014, 720, 7, 50) + "</g>" +
    person({ x: 1090, y: 722, s: 0.52, coat: C.green, skin: 3, hat: HAT.sun("#e8c88a"), flip: true, ar: -58, hr: HELD.can() }));
  var pile = '<g class="phc-char">' + [[-14, 0, 13, "#e8742c"], [0, -6, 15, "#f2a23a"], [14, 0, 12, "#c9472c"], [4, 2, 14, "#ffb84a"]].map(function (p) { return tag("ellipse", { cx: 1342 + p[0], cy: 712 + p[1], rx: p[2], ry: f1(p[2] * 0.55), fill: p[3] }); }).join("") + "</g>";
  vH1 += act("phc-act-autumn phc-day phc-square", person({ x: 1290, y: 718, s: 0.52, coat: C.brown, skin: 1, scarf: "#e8742c", al: -20, ar: 30, hr: HELD.rake(), clsR: "phc-raking" }) + pile +
    '<g class="phc-jump">' + person({ x: 1342, y: 708, s: 0.42, coat: C.purple, skin: 0, long: true, hair: "#c98f4a", al: 160, ar: -160 }) + "</g>");
  var miniSnow = '<g class="phc-char" transform="translate(1356,716) scale(.6)">' + ao(0, 2, 30) + tag("circle", { cx: 0, cy: -24, r: 26, fill: "url(#g-snowball)" }) + tag("circle", { cx: 0, cy: -62, r: 18, fill: "url(#g-snowball)" }) +
    tag("circle", { cx: -5, cy: -66, r: 2.2, fill: INK }) + tag("circle", { cx: 6, cy: -66, r: 2.2, fill: INK }) + tag("path", { d: "M1 -61 L16 -58 L1 -56 Z", fill: "#f38a2c" }) +
    tag("path", { d: "M-16 -40 L-36 -54 M16 -40 L36 -56", stroke: "#7a5a3f", "stroke-width": "3", "stroke-linecap": "round" }) + "</g>";
  vH1 += act("phc-act-winter phc-day", miniSnow + person({ x: 1306, y: 718, s: 0.5, coat: C.blue, skin: 2, scarf: "#e2475a", hat: HAT.beanie("#f2b632"), ar: -70, al: -60 }) +
    '<g class="phc-push">' + tag("circle", { cx: 1400, cy: 708, r: 10, fill: "url(#g-snowball)" }) + person({ x: 1424, y: 718, s: 0.42, coat: C.pink, skin: 0, long: true, hat: HAT.beanie("#8e6bd6"), flip: true, ar: -80, al: -70 }) + "</g>");
  vH1 += act("phc-act-night", stroll(walker({ x: 1040, y: 742, s: 0.5, coat: C.navy, skin: 1, scarf: "#e2475a", ar: -20, hr: HELD.lantern() }), 46, 220, 6));
  vH1 += act("phc-act-rain", stroll(walker({ x: 990, y: 744, s: 0.52, coat: C.coral, skin: 3, al: 10, ar: -178, hr: HELD.umbrella("#3f8fd6") }), 40, 260, 0) +
    stroll(walker({ x: 1180, y: 734, s: 0.48, coat: C.teal, skin: 0, long: true, hair: "#c98f4a", ar: -178, hr: HELD.umbrella("#ffd84a") }), 52, 160, 20));

  /* second hill */
  PS = 1.3;
  vH2 += act("phc-act-spring phc-day", person({ x: 760, y: 792, s: 0.7, coat: C.coral, skin: 2, long: true, hair: "#1f1a1a", ar: -160, al: 20 }) +
    tag("path", { d: "M774 741 Q744 686 704 622", stroke: "#ffffff", "stroke-width": "1", fill: "none", opacity: ".8" }) +
    '<g transform="translate(700,612)"><g class="phc-kite">' + tag("path", { d: "M0 -18 L12 0 L0 20 L-12 0 Z", fill: "#ff5d73" }) + tag("path", { d: "M0 -18 L0 20 M-12 0 L12 0", stroke: "#ffffff", "stroke-width": "1.2", opacity: ".8" }) +
    tag("path", { d: "M0 20 q6 8 0 14 q-6 8 0 14 q6 8 0 14", stroke: "#ffd84a", "stroke-width": "1.6", fill: "none" }) + "</g></g>" +
    stroll('<g class="phc-bike">' + '<g class="phc-char" transform="translate(1080,776) scale(1.4) translate(-1080,-776)">' + tag("circle", { cx: 1060, cy: 776, r: 11, fill: "none", stroke: "#3a3550", "stroke-width": "3" }) + tag("circle", { cx: 1100, cy: 772, r: 11, fill: "none", stroke: "#3a3550", "stroke-width": "3" }) +
      tag("path", { d: "M1060 776 L1076 760 L1096 758 L1100 772 M1076 760 L1084 774 L1060 776 M1096 758 L1092 748", stroke: "#e2475a", "stroke-width": "3", fill: "none", "stroke-linejoin": "round" }) + "</g>" +
      person({ x: 1080, y: 772, s: 0.6, coat: C.blue, skin: 1, sit: true, hat: HAT.beanie("#ffd84a"), ar: -70, al: -60 }) + "</g>", 34, -300, 8));
  vH2 += act("phc-act-summer phc-day", '<g class="phc-char">' + tag("path", { d: "M660 798 L760 790 L780 806 L670 814 Z", fill: "#e2475a" }) + tag("path", { d: "M680 797 L692 812 M705 795 L718 810 M730 793 L742 808 M760 790 L768 806", stroke: "#ffffff", "stroke-width": "4", opacity: ".7" }) + HELD.basket("#ffd84a").replace("<path", '<g transform="translate(740,786) scale(1.4)"><path') + "</g></g>" +
    person({ x: 688, y: 806, s: 0.62, coat: C.green, skin: 0, sit: true, long: true, hair: "#c98f4a", ar: -40, hr: HELD.cone() }) + person({ x: 712, y: 804, s: 0.66, coat: C.navy, skin: 2, sit: true, ar: -60, hr: HELD.book(), al: -50 }) +
    '<g class="phc-char" transform="translate(1250,758) scale(1.3) translate(-1250,-758)">' + tag("rect", { x: 1222, y: 724, width: 56, height: 30, rx: 6, fill: "#fff3e6" }) + tag("path", { d: "M1216 724 Q1250 700 1284 724 Z", fill: "#ff8fc6" }) + tag("path", { d: "M1222 712 L1250 704 L1278 712", stroke: "#ffffff", "stroke-width": "3", fill: "none" }) +
      tag("circle", { cx: 1232, cy: 758, r: 6, fill: "#3a3550" }) + tag("circle", { cx: 1268, cy: 758, r: 6, fill: "#3a3550" }) + tag("circle", { cx: 1240, cy: 738, r: 5, fill: "#ffb3d1" }) + tag("circle", { cx: 1252, cy: 738, r: 5, fill: "#b4f0c8" }) + tag("circle", { cx: 1264, cy: 738, r: 5, fill: "#fff08a" }) + "</g>" +
    person({ x: 1306, y: 756, s: 0.62, coat: "#ffffff", pants: "#4a90c8", skin: 3, hat: HAT.beanie("#ff8fc6"), flip: true, al: 20, ar: -40 }) + person({ x: 1186, y: 764, s: 0.5, coat: C.mustard, skin: 1, ar: -120, hr: HELD.cone() }));
  vH2 += act("phc-act-autumn phc-day", stroll(walker({ x: 1100, y: 774, s: 0.62, coat: C.red, skin: 2, scarf: "#f2b632", ar: -80, al: -80, front: '<g transform="translate(0,-28)">' + HELD.pumpkin() + "</g>" }), 44, -260, 4) +
    person({ x: 640, y: 790, s: 0.62, coat: C.mustard, skin: 0, long: true, hair: "#8a4a2a", scarf: "#c9472c", ar: -30, hr: HELD.basket("#f38a2c") }));
  vH2 += act("phc-act-winter phc-day", '<g class="phc-sled">' + '<g class="phc-char">' + tag("path", { d: "M1292 745 L1368 739 Q1380 737 1378 726", stroke: "#e2475a", "stroke-width": "5", fill: "none", "stroke-linecap": "round" }) + "</g>" +
    person({ x: 1312, y: 740, s: 0.6, coat: C.purple, skin: 1, sit: true, hat: HAT.beanie("#ffffff"), scarf: "#ffd84a", al: -150, ar: -150 }) + person({ x: 1334, y: 738, s: 0.52, coat: C.coral, skin: 3, sit: true, hat: HAT.beanie("#3f8fd6"), al: -60, ar: -70 }) + "</g>" +
    person({ x: 520, y: 776, s: 0.66, coat: C.green, skin: 0, scarf: "#e2475a", hat: HAT.beanie("#e2475a"), ar: -140, hr: tag("circle", { cx: 0, cy: 6, r: 5, fill: "url(#g-snowball)" }), clsR: "phc-throw" }));
  vH2 += act("phc-act-rain", '<g class="phc-char">' + tag("ellipse", { cx: 852, cy: 800, rx: 34, ry: 6, fill: "url(#g-water)", opacity: ".85" }) + "</g>" +
    '<g class="phc-splashes">' + tag("ellipse", { cx: 840, cy: 800, rx: 10, ry: 2.6, fill: "none", stroke: "#ffffff", "stroke-width": "1.6" }) + tag("ellipse", { cx: 866, cy: 801, rx: 8, ry: 2.2, fill: "none", stroke: "#ffffff", "stroke-width": "1.6", style: "animation-delay:-.8s" }) + "</g>" +
    '<g class="phc-puddle-hop">' + person({ x: 852, y: 800, s: 0.6, coat: "#ffd23a", pants: "#3a3550", boots: "#e2475a", skin: 2, hat: HAT.hood("#ffd23a"), al: 40, ar: -40 }) + "</g>");
  vH2 += '<g class="phc-fest phc-fest-easter">' + person({ x: 620, y: 788, s: 0.6, coat: C.pink, skin: 0, long: true, hair: "#c98f4a", ar: -30, hr: HELD.basket() }) +
    person({ x: 1150, y: 766, s: 0.58, coat: C.teal, skin: 3, flip: true, ar: -30, hr: HELD.basket("#ffe27a") }) + "</g>" + eggs([[560, 792], [690, 800], [760, 798], [1000, 790], [1080, 778], [1200, 770]]);
  vH2 += '<g class="phc-fest phc-fest-july4">' + '<g class="phc-char" transform="translate(300,756) scale(1.3) translate(-300,-756)">' + tag("path", { d: "M286 742 L314 742 L310 754 L290 754 Z", fill: "#3a3550" }) + tag("path", { d: "M292 754 L288 768 M308 754 L312 768", stroke: "#3a3550", "stroke-width": "3" }) + tag("path", { d: "M288 740 h24", stroke: "#8a8f9a", "stroke-width": "2" }) +
    tag("ellipse", { cx: 296, cy: 739, rx: 5, ry: 2.4, fill: "#a0522d" }) + tag("ellipse", { cx: 306, cy: 739, rx: 5, ry: 2.4, fill: "#a0522d" }) + "</g>" + '<g class="phc-steam">' + tag("path", { d: "M296 734 q4 -6 0 -12 q-4 -6 0 -12 M306 734 q4 -6 0 -12 q-4 -6 0 -12", stroke: "#ffffff", "stroke-width": "2", fill: "none", opacity: ".6" }) + "</g>" +
    person({ x: 340, y: 770, s: 0.62, coat: "#ffffff", skin: 1, flip: true, hat: HAT.sun("#e2475a"), ar: -60, hr: tag("path", { d: "M0 0 L0 14 M-3 14 h6", stroke: "#8a8f9a", "stroke-width": "2" }) }) + "</g>";

  /* third hill: bench, carolers, trick-or-treaters */
  PS = 1.1;
  var bench = '<g class="phc-char">' + tag("path", { d: "M556 820 L644 820 M556 806 L644 806", stroke: "#a0703f", "stroke-width": "6", "stroke-linecap": "round" }) + tag("path", { d: "M564 820 v18 M636 820 v18 M560 806 v14 M640 806 v14", stroke: "#6c4127", "stroke-width": "5" }) + ao(600, 838, 50) + "</g>";
  vH3 += bench + act("phc-act-night phc-stargazer", person({ x: 590, y: 828, s: 0.82, coat: C.purple, skin: 2, sit: true, scarf: "#ffd84a", hat: HAT.beanie("#3f8fd6"), ar: -150, al: 10 }) + '<g class="phc-sip">' + tag("path", { d: "M630 822 l4 -10 l8 0 l3 10 Z", fill: "#e8742c" }) + "</g>");
  vH3 += '<g class="phc-fest phc-fest-valentine">' + person({ x: 576, y: 828, s: 0.82, coat: C.red, skin: 1, sit: true, al: 10, ar: -50 }) + person({ x: 616, y: 828, s: 0.78, coat: C.pink, skin: 0, sit: true, long: true, hair: "#c98f4a", flip: true, al: 10, ar: -50 }) +
    '<g class="phc-floaty">' + tag("path", { d: "M596 760 C586 750 590 740 596 746 C602 740 606 750 596 760 Z", fill: "#ff5d8a" }) + "</g></g>";
  vH3 += '<g class="phc-fest phc-fest-xmas phc-carolers">' + person({ x: 1090, y: 846, s: 0.86, coat: C.red, skin: 0, scarf: "#ffffff", hat: HAT.santa(), ar: -70, al: -80, hr: HELD.book(), cls: "phc-sing" }) +
    person({ x: 1136, y: 844, s: 0.8, coat: C.green, skin: 2, long: true, hair: "#1f1a1a", scarf: "#e2475a", hat: HAT.beanie("#ffffff"), ar: -70, al: -80, hr: HELD.book(), cls: "phc-sing" }) +
    person({ x: 1180, y: 842, s: 0.7, coat: C.navy, skin: 3, scarf: "#f2b632", hat: HAT.beanie("#e2475a"), ar: -20, hr: HELD.lantern(), cls: "phc-sing" }) + '<g transform="translate(1100,762)">' + notes() + "</g></g>";
  var ghost = '<g transform="translate(872,852) scale(.9)"><g class="phc-bob2">' + ao(0, 0, 16) + tag("path", { d: "M-14 0 L-15 -40 C-15 -70 15 -70 15 -40 L14 0 L8 -5 L3 0 L-2 -5 L-7 0 Z", fill: "#fbfbff" }) +
    tag("ellipse", { cx: -5, cy: -46, rx: 2.6, ry: 4, fill: INK }) + tag("ellipse", { cx: 5, cy: -46, rx: 2.6, ry: 4, fill: INK }) + "</g></g>";
  vH3 += '<g class="phc-fest phc-fest-halloween-kids">' + person({ x: 820, y: 854, s: 0.8, coat: "#3b2a5a", pants: "#2b2238", skin: 1, hat: HAT.witch(), ar: -30, hr: HELD.pail() }) + ghost +
    person({ x: 914, y: 850, s: 0.72, coat: "#ff8a2c", skin: 3, hat: HAT.hood("#2b2238"), flip: true, ar: -20, hr: HELD.lantern() }) + "</g>";
  vH3 += eggs([[440, 852], [700, 860], [1000, 854], [1240, 846]]);
  function spark(x, y) { return '<g class="phc-sparkler" transform="translate(' + x + "," + y + ')">' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (k) { var an = k / 8 * Math.PI * 2; return tag("path", { d: "M0 0 L" + f1(Math.cos(an) * 9) + " " + f1(Math.sin(an) * 9), stroke: k % 2 ? "#fff6c8" : "#ffd25a", "stroke-width": "1.6", "stroke-linecap": "round" }); }).join("") + tag("circle", { r: 3, fill: "#ffffff" }) + "</g>"; }
  var stick = function () { return tag("path", { d: "M0 0 L0 22", stroke: "#8a8f9a", "stroke-width": "1.6" }) + '<g transform="translate(0,22)">' + spark(0, 0) + "</g>"; };
  vH3 += '<g class="phc-fest phc-fest-diwali">' +
    person({ x: 760, y: 852, s: 0.82, coat: "#ff9f1c", pants: "#e2475a", skin: 2, long: true, hair: "#1f1a1a", scarf: "#e2475a", ar: -40, hr: tag("rect", { x: -9, y: 2, width: 18, height: 10, rx: 2, fill: "#e2475a" }) + tag("path", { d: "M-9 7 h18", stroke: "#ffd25a", "stroke-width": "2" }) }) +
    person({ x: 820, y: 854, s: 0.74, coat: "#3fbf7f", skin: 1, ar: -150, hr: stick(), clsR: "phc-wave-arm" }) +
    person({ x: 876, y: 852, s: 0.66, coat: "#c86bff", skin: 3, long: true, hair: "#3a2a22", ar: -120, al: 30, hr: stick() }) +
    '<g class="phc-char">' + diya(712, 852, 1.4) + diya(930, 850, 1.4) + diya(960, 848, 1.4) + "</g></g>";
  vGlow += '<g class="phc-fest phc-fest-diwali">' + diyaGlow(712, 852, 1.6) + diyaGlow(945, 849, 1.8) + "</g>";
  /* Holi: villagers in white throwing colored powder */
  var splat = function (x, y, c, k) { return tag("circle", { cx: x, cy: y, r: k || 2.4, fill: c }); };
  var dots = function (cs) { return '<g opacity=".9">' + splat(-6, -36, cs[0], 3) + splat(5, -28, cs[1], 2.6) + splat(-2, -22, cs[2], 2.2) + splat(7, -40, cs[0], 2) + splat(-8, -55, cs[1], 2) + splat(6, -60, cs[2], 2.4) + "</g>"; };
  function puff(x, y, c, d) { return '<g transform="translate(' + x + "," + y + ')"><g class="phc-puff" style="animation-delay:-' + d + 's">' + tag("circle", { r: 14, fill: c, opacity: ".75" }) + tag("circle", { cx: 10, cy: -6, r: 10, fill: c, opacity: ".6" }) + tag("circle", { cx: -9, cy: -8, r: 9, fill: c, opacity: ".6" }) + "</g></g>"; }
  var gulal = function (c) { return tag("circle", { cx: 0, cy: 4, r: 4, fill: c }); };
  vH3 += '<g class="phc-fest phc-fest-holi">' + '<g class="phc-char">' + [[700, 858, "#ff4f7a"], [770, 860, "#ffe14a"], [840, 858, "#3fbf7f"], [900, 856, "#5a8cff"], [980, 852, "#c86bff"], [1040, 850, "#ffb02e"]].map(function (p) { return tag("ellipse", { cx: p[0], cy: p[1], rx: 22, ry: 5, fill: p[2], opacity: ".75" }); }).join("") + "</g>" +
    person({ x: 720, y: 856, s: 0.8, coat: "#fbfbff", pants: "#fbfbff", skin: 1, ar: -120, hr: gulal("#ff4f7a"), front: dots(["#ff4f7a", "#ffe14a", "#3fbf7f"]), clsR: "phc-throw" }) +
    person({ x: 806, y: 858, s: 0.76, coat: "#fbfbff", pants: "#fbfbff", skin: 3, long: true, hair: "#1f1a1a", flip: true, ar: -110, hr: gulal("#3fbf7f"), front: dots(["#5a8cff", "#ff4f7a", "#c86bff"]), clsR: "phc-throw" }) +
    person({ x: 900, y: 856, s: 0.7, coat: "#fbfbff", pants: "#fbfbff", skin: 0, ar: -90, hr: tag("path", { d: "M-4 0 L4 0 L3 16 L-3 16 Z", fill: "#ff8a2c" }), front: dots(["#ffe14a", "#3fbf7f", "#ff4f7a"]) }) +
    '<g class="phc-squirt">' + [0, 1, 2, 3, 4, 5].map(function (k) { return tag("circle", { cx: f1(922 + k * 10), cy: f1(812 - Math.sin(k / 5 * Math.PI) * 16 + k * 2), r: 2.6, fill: k % 2 ? "#ff4f7a" : "#c86bff", style: "animation-delay:-" + f1(k * 0.12) + "s" }); }).join("") + "</g>" +
    person({ x: 1000, y: 852, s: 0.8, coat: "#fbfbff", pants: "#fbfbff", skin: 2, flip: true, ar: -130, hr: gulal("#ffe14a"), front: dots(["#c86bff", "#ffb02e", "#5a8cff"]), clsR: "phc-throw" }) +
    puff(762, 806, "#ff4f7a", 0) + puff(850, 798, "#ffe14a", 0.8) + puff(960, 800, "#3fbf7f", 1.6) + puff(810, 780, "#c86bff", 2.4) + puff(1020, 790, "#5a8cff", 1.2) + "</g>";


  /* ---------- assemble ---------- */
  S.push('<rect width="' + W + '" height="' + H + '" fill="url(#g-sky)"/>');
  var st = "";
  for (var i = 0; i < 120; i++) {
    var sx = f1(rnd() * W), sy = f1(rnd() * 420), sr = f1(0.6 + rnd() * 1.6);
    st += tag("circle", { cx: sx, cy: sy, r: sr, fill: "#fff8e7", style: "animation-delay:-" + f1(rnd() * 6) + "s" });
    if (i % 12 === 0) st += tag("path", { d: "M" + sx + " " + f1(sy - 7) + " Q" + sx + " " + sy + " " + f1(sx + 7) + " " + sy + " Q" + sx + " " + sy + " " + sx + " " + f1(sy + 7) + " Q" + sx + " " + sy + " " + f1(sx - 7) + " " + sy + " Q" + sx + " " + sy + " " + sx + " " + f1(sy - 7) + " Z", fill: "#ffffff", style: "animation-delay:-" + f1(rnd() * 6) + "s" });
  }
  S.push('<g class="phc-stars">' + st + "</g>");
  var rays = "";
  for (var r = 0; r < 9; r++) rays += tag("path", { d: "M0 -14 L1100 -90 L1100 90 L0 14 Z", fill: "url(#g-ray)", transform: "rotate(" + f1(10 + r * 20 + rnd() * 8) + ")" });
  S.push('<g class="phc-sun"><g class="phc-rays" filter="url(#f-rays)">' + rays + "</g>" + tag("circle", { r: 300, fill: "url(#g-glow)", "class": "phc-halo" }) +
    tag("circle", { r: 48, fill: "url(#g-suncore)" }) + "</g>");
  S.push('<g class="phc-moon">' + tag("circle", { r: 200, fill: "url(#g-moonglow)" }) + tag("circle", { r: 36, fill: "url(#g-moon)" }) +
    tag("circle", { cx: -10, cy: -8, r: 6, fill: "#e6dcc2", opacity: ".7" }) + tag("circle", { cx: 12, cy: 8, r: 4.5, fill: "#e6dcc2", opacity: ".7" }) + tag("circle", { cx: 6, cy: -16, r: 3, fill: "#e6dcc2", opacity: ".6" }) + "</g>");

  var cl = "", cdefs = [[140, 1.15, 260, 20], [250, 0.8, 320, 150], [100, 0.65, 230, 80], [320, 1.3, 360, 260], [190, 0.95, 290, 200], [70, 0.85, 250, 10], [280, 1.05, 340, 110], [150, 1.4, 380, 300], [220, 0.75, 280, 60], [50, 1.2, 320, 230]];
  cdefs.forEach(function (c, i) {
    cl += '<g class="phc-cloud" data-dur="' + c[2] + '" style="animation-duration:' + c[2] + "s;animation-delay:-" + c[3] + 's"><g transform="translate(0,' + c[0] + ')">' + cloudShape(c[1]) + "</g></g>";
  });
  S.push('<g class="phc-layer" data-depth=".15">' + cl + "</g>");
  var deck = "";
  for (var di = 0; di < 9; di++) deck += tag("ellipse", { cx: di * 200 - 60, cy: 200 + (di % 3) * 26, rx: 200, ry: 70, fill: "url(#g-cloud)" });
  S.push('<g class="phc-layer" data-depth=".2"><g class="phc-deck">' + tag("rect", { x: -100, y: -40, width: 1800, height: 240, style: "fill:var(--cloud-s)" }) + deck + "</g></g>");

  /* far mountains */
  var far = "";
  [[90, 410, 190], [340, 330, 230], [610, 390, 200], [870, 318, 250], [1140, 370, 210], [1390, 326, 240], [1600, 400, 190]].forEach(function (p) { far += peak(p[0], p[1], p[2], 660); });
  S.push('<g class="phc-layer" data-depth=".3"><g filter="url(#f-far)">' + far + "</g>" + tag("rect", { x: 0, y: 470, width: W, height: 200, fill: "url(#g-haze)" }) + "</g>");
  S.push(fireworks() + sleigh());

  /* mid hills and the plateau */
  var mid = tag("path", { d: "M0 612 C110 548 230 544 330 586 C420 624 520 566 640 562 C760 558 830 618 940 610 C1050 602 1110 548 1240 552 C1360 556 1440 610 1600 592 L1600 900 L0 900 Z", fill: "url(#g-mid)" });
  mid += tag("path", { d: "M0 612 C110 548 230 544 330 586 C420 624 520 566 640 562 C760 558 830 618 940 610 C1050 602 1110 548 1240 552 C1360 556 1440 610 1600 592", style: "stroke:var(--mid-l)", "stroke-width": "4", fill: "none", opacity: ".8" });
  var mesa = tag("path", { d: "M150 648 L196 556 Q204 538 224 537 L476 532 Q496 532 504 548 L556 648 Z", fill: "url(#g-mesa)" }) +
    tag("path", { d: "M504 548 L556 648 L500 648 L470 562 Z", style: "fill:var(--mesa-s)", opacity: ".7" }) +
    tag("path", { d: "M224 537 L476 532 Q496 532 504 548 L470 556 Q350 562 214 556 Q200 552 206 544 Z", style: "fill:var(--mesa-l)" }) +
    tag("path", { d: "M190 584 Q350 576 516 580 M174 612 Q350 604 532 610", style: "stroke:var(--mesa-s)", "stroke-width": "5", "stroke-linecap": "round", fill: "none", opacity: ".5" }) +
    tag("path", { d: "M224 537 L476 532 Q496 532 504 548 L470 552 Q350 556 214 552 Q204 546 224 537 Z", fill: "#ffffff", "class": "phc-snowcap" });
  S.push('<g class="phc-layer" data-depth=".45"><g filter="url(#f-mid)">' + mid + mesa + "</g></g>");
  S.push('<g class="phc-layer" data-depth=".5"><g class="phc-mist" filter="url(#f-mist)">' + tag("ellipse", { cx: 500, cy: 646, rx: 560, ry: 26, fill: "#ffffff", opacity: ".42" }) + tag("ellipse", { cx: 1260, cy: 640, rx: 480, ry: 22, fill: "#ffffff", opacity: ".36" }) + "</g></g>");

  /* hill 1: cottage, pond and the back trees */
  var h1d = "M0 700 C180 640 380 650 560 682 C700 704 820 692 960 668 C1080 650 1150 642 1240 646 C1360 652 1460 680 1600 670";
  var h1 = tag("path", { d: h1d + " L1600 900 L0 900 Z", fill: "url(#g-h1)" }) + tag("path", { d: h1d, style: "stroke:var(--hill1-l)", "stroke-width": "5", fill: "none", opacity: ".9" });
  h1 += tufts(690, 760, 18, "hill1");
  h1 += pine(40, 708, 0.52) + pine(112, 698, 0.6) + pine(470, 676, 0.48) + roundTree(900, 684, 0.5, "canopy2") + pine(1560, 682, 0.58);
  h1 += pine(1302, 662, 0.5) + bush(1440, 690, 0.5, "canopy2") + bush(290, 672, 0.45, "canopy2");
  /* path from the cottage door */
  h1 += tag("path", { d: "M1100 668 L1116 668 C1116 700 1090 730 1078 790 L1006 790 C1036 730 1094 700 1100 668 Z", fill: "url(#g-path)" }) + tag("path", { d: "M1150 712 C1200 704 1290 700 1350 708 C1300 722 1200 724 1150 712 Z", fill: "url(#g-path)", opacity: ".8" });
  /* pond */
  h1 += tag("ellipse", { cx: 762, cy: 738, rx: 214, ry: 32, style: "fill:var(--hill1-s)", opacity: ".5" }) +
    tag("ellipse", { cx: 762, cy: 736, rx: 206, ry: 28, fill: "url(#g-water)" }) +
    tag("ellipse", { cx: 720, cy: 728, rx: 120, ry: 8, fill: "#ffffff", opacity: ".25" }) +
    '<g class="phc-shimmer">' + tag("path", { d: "M610 738 h70 M740 746 h90 M680 728 h40 M850 734 h40 M790 754 h50", stroke: "#ffffff", "stroke-width": "3", "stroke-linecap": "round", opacity: ".7" }) + "</g>" +
    '<g class="phc-ice">' + tag("ellipse", { cx: 762, cy: 736, rx: 206, ry: 28, fill: "#f4f9ff", opacity: ".55" }) + tag("path", { d: "M640 732 l60 6 M780 742 l70 -8 M700 748 l40 -4", stroke: "#ffffff", "stroke-width": "3", "stroke-linecap": "round" }) + "</g>" +
    '<g class="phc-splashes">' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (k) { return tag("ellipse", { cx: f1(600 + rnd() * 320), cy: f1(724 + rnd() * 24), rx: 9, ry: 2.4, fill: "none", stroke: "#ffffff", "stroke-width": "1.6", style: "animation-delay:-" + f1(rnd() * 1.6) + "s" }); }).join("") + "</g>";
  h1 += ducks();
  h1 += vH1;
  S.push('<g class="phc-layer" data-depth=".6">' + h1 + "</g>");

  /* hill 2: bunny, flowers */
  var h2d = "M0 782 C200 732 420 742 600 776 C720 798 880 802 1000 782 C1150 756 1300 738 1440 746 C1520 750 1570 760 1600 762";
  var h2 = tag("path", { d: h2d + " L1600 900 L0 900 Z", fill: "url(#g-h2)" }) + tag("path", { d: h2d, style: "stroke:var(--hill2-l)", "stroke-width": "5", fill: "none", opacity: ".9" });
  h2 += tufts(775, 840, 22, "hill2");
  h2 += tag("path", { d: "M1056 780 L1116 772 C1100 806 1070 830 1060 856 L960 856 C990 826 1040 806 1056 780 Z", fill: "url(#g-path)" });
  h2 += roundTree(200, 760, 0.86, "canopy") + pine(388, 748, 0.82) + roundTree(1530, 758, 0.9, "canopy");
  h2 += bush(470, 770, 0.8, "canopy2") + bush(1230, 762, 0.75, "canopy");
  h2 += flowers(860, 790, 10, 150) + flowers(1180, 780, 8, 120) + flowers(640, 786, 8, 110);
  h2 += bunny() + vH2;
  S.push('<g class="phc-layer" data-depth=".75">' + h2 + "</g>");

  /* hill 3: the fox and big framing trees */
  var h3d = "M0 842 C160 806 360 800 520 822 C700 844 860 852 1040 840 C1220 828 1380 814 1600 828";
  var h3 = tag("path", { d: h3d + " L1600 900 L0 900 Z", fill: "url(#g-h3)" }) + tag("path", { d: h3d, style: "stroke:var(--hill3-l)", "stroke-width": "5", fill: "none", opacity: ".9" });
  h3 += tag("path", { d: "M955 846 L1062 840 C1050 866 1046 884 1048 900 L880 900 C910 880 940 864 955 846 Z", fill: "url(#g-path)" });
  h3 += tufts(845, 895, 30, "hill3");
  var owlArt = owl();
  var branch = tag("path", { d: "M1440 772 Q1410 770 1372 768", stroke: "url(#g-trunk)", "stroke-width": "9", "stroke-linecap": "round", fill: "none" });
  h3 += roundTree(84, 856, 1.28, "canopy") + roundTree(1462, 846, 1.38, "canopy2");
  h3 += '<g class="phc-night-only">' + branch + owlArt.body + "</g>";
  h3 += flowers(470, 846, 12, 160) + flowers(140, 870, 8, 120) + flowers(1270, 846, 12, 180);
  h3 += vH3 + fox();
  S.push('<g class="phc-layer" data-depth=".95">' + h3 + "</g>");

  /* golden-hour wash and the emissive layer (lamps, fireflies, owl eyes) */
  S.push(tag("rect", { width: W, height: H, fill: "url(#g-gold)", "class": "phc-goldwash" }));
  var flies = "";
  for (var fl = 0; fl < 30; fl++) {
    flies += tag("circle", { cx: f1(rnd() * W), cy: f1(640 + rnd() * 240), r: 2.6, fill: "#fff3a0", style: "animation-delay:-" + f1(rnd() * 9) + "s;animation-duration:" + f1(6 + rnd() * 6) + "s" });
  }
  S.push('<g class="phc-layer" data-depth=".6"><g class="phc-glow">' + vGlow + "</g></g>");
  S.push('<g class="phc-layer" data-depth=".95"><g class="phc-night-only">' + owlArt.glow + "</g></g>");
  S.push('<g class="phc-flies">' + flies + "</g>");
  S.push(bats());

  /* birds and butterflies */
  S.push('<g class="phc-birds"><g transform="translate(0,0)">' + bird(0, 1) + '</g><g transform="translate(34,16)">' + bird(0.2, 0.8) + '</g><g transform="translate(64,-6)">' + bird(0.4, 0.9) + "</g></g>");
  S.push('<g class="phc-butterflies"><g transform="translate(500,742)">' + butterfly("#ffb3d1", "#ff8ab8", 0) + '</g><g transform="translate(1150,708)">' + butterfly("#fff08a", "#ffc94a", 4) + '</g><g transform="translate(220,770)">' + butterfly("#bfe3ff", "#8ec8ff", 8) + "</g></g>");

  /* foreground bokeh for depth of field */
  var bk = "";
  [[-30, 900, 70, -20], [30, 910, 60, 12], [90, 905, 50, -8], [1540, 905, 70, 18], [1600, 900, 60, -10], [1480, 912, 50, 6]].forEach(function (b) {
    bk += tag("path", { d: "M" + b[0] + " " + b[1] + " q" + b[3] + " -" + f1(b[2] * 1.6) + " " + f1(b[3] * 2.2) + " -" + f1(b[2] * 2.4) + " q-" + f1(b[2] * 0.2) + " " + f1(b[2] * 1.2) + " -" + f1(b[3] * 1.6 - 18) + " " + f1(b[2] * 2.4) + " Z", style: "fill:var(--hill3-s)" });
  });
  bk += tag("ellipse", { cx: 40, cy: 900, rx: 120, ry: 40, style: "fill:var(--hill3-s)" }) + tag("ellipse", { cx: 1560, cy: 900, rx: 120, ry: 40, style: "fill:var(--hill3-s)" });
  S.push('<g class="phc-layer phc-bokeh" data-depth="1.3"><g filter="url(#f-bokeh)">' + bk + "</g></g>");

  /* weather */
  var rain = "";
  for (var rr = 0; rr < 150; rr++) {
    var rx = f1(rnd() * (W + 300) - 150);
    rain += tag("line", { x1: rx, y1: 0, x2: rx, y2: f1(26 + rnd() * 18), stroke: "#eef4ff", "stroke-width": f1(1.4 + rnd()), "stroke-linecap": "round", opacity: f1(0.45 + rnd() * 0.35), style: "animation-duration:" + f1(0.8 + rnd() * 0.6) + "s;animation-delay:-" + f1(rnd() * 3) + "s" });
  }
  S.push('<g class="phc-rain">' + rain + "</g>");
  var fl2 = "";
  for (var fk = 0; fk < 90; fk++) {
    fl2 += '<g transform="translate(' + f1(rnd() * W) + ',0)">' + tag("ellipse", { rx: f1(1.8 + rnd() * 3), ry: f1(1.6 + rnd() * 2.4), style: "fill:var(--particle);animation-duration:" + f1(9 + rnd() * 9) + "s;animation-delay:-" + f1(rnd() * 16) + "s" }) + "</g>";
  }
  S.push('<g class="phc-flakes">' + fl2 + "</g>");
  S.push('<g class="phc-fog">' + tag("rect", { x: -200, y: 420, width: 2000, height: 480, fill: "url(#g-fog)" }) + "</g>");
  S.push(tag("path", { d: "M1040 60 L1010 150 L1036 150 L1000 250 L1080 130 L1050 130 L1080 60 Z", fill: "#fffbe0", "class": "phc-bolt" }));
  S.push(tag("rect", { width: W, height: H, fill: "#ffffff", "class": "phc-flash" }));
  S.push(tag("rect", { width: W, height: H, fill: "url(#g-vignette)", "pointer-events": "none" }));

  var host = document.createElement("div");
  host.id = "phc-scene";
  host.setAttribute("aria-hidden", "true");
  host.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMax slice" width="100%" height="100%"><defs>' + D.join("") + "</defs>" + S.join("") + "</svg>";
  document.body.insertBefore(host, document.body.firstChild);
  var svg = host.firstChild;
  function q(sel) { return svg.querySelector(sel); }
  var sunG = q(".phc-sun"), raysG = q(".phc-rays"), moonG = q(".phc-moon"), starsG = q(".phc-stars"), deckG = q(".phc-deck"), goldG = q(".phc-goldwash"), glowG = q(".phc-glow");
  var cloudList = [].slice.call(svg.querySelectorAll(".phc-cloud"));

  /* Gentle parallax on desktop */
  var layers = [].slice.call(svg.querySelectorAll(".phc-layer"));
  var tx0 = 0, ty0 = 0, cx = 0, cy = 0;
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!still) {
    window.addEventListener("mousemove", function (e) { tx0 = e.clientX / window.innerWidth - 0.5; ty0 = e.clientY / window.innerHeight - 0.5; }, { passive: true });
    (function tick() {
      cx += (tx0 - cx) * 0.04; cy += (ty0 - cy) * 0.04;
      if (Math.abs(tx0 - cx) > 0.0005 || Math.abs(ty0 - cy) > 0.0005) {
        layers.forEach(function (g) { var d = +g.dataset.depth; g.setAttribute("transform", "translate(" + (-cx * 30 * d).toFixed(1) + "," + (-cy * 10 * d).toFixed(1) + ")"); });
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
      chip.setAttribute("title", window.PHC_PLACE || "Local weather");
      wrap.appendChild(chip);
    }
    if (!wx) { chip.style.display = "none"; return; }
    chip.style.display = "";
    var k = wx.kind, icon;
    var sunIcon = '<circle cx="12" cy="12" r="5" fill="#f6b73c"/><g stroke="#f6b73c" stroke-width="2" stroke-linecap="round"><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></g>';
    var moonIcon = '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="#c9c3ef"/>';
    var cloudIcon = '<path d="M7 18h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.5A3.3 3.3 0 0 0 7 18z" fill="#c4cfdf"/>';
    if (k === "clear") icon = night ? moonIcon : sunIcon;
    else if (k === "partly") icon = '<g transform="translate(-3 -3) scale(.75)">' + (night ? moonIcon : sunIcon) + "</g>" + cloudIcon;
    else if (k === "snow") icon = cloudIcon + '<g fill="#9fb3d4"><circle cx="8" cy="21" r="1.3"/><circle cx="12" cy="22" r="1.3"/><circle cx="16" cy="21" r="1.3"/></g>';
    else if (k === "rain" || k === "drizzle") icon = cloudIcon + '<g stroke="#6f9bd8" stroke-width="2" stroke-linecap="round"><path d="M8 20l-1 2.5M12 20l-1 2.5M16 20l-1 2.5"/></g>';
    else if (k === "thunder") icon = cloudIcon + '<path d="M12 17l-2 4h3l-1.5 3.5" stroke="#f6b73c" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    else icon = cloudIcon;
    chip.innerHTML = '<svg viewBox="0 0 24 25" width="26" height="26" aria-hidden="true">' + icon + "</svg>" +
      '<div class="phc-weather-text"><span class="phc-weather-temp">' + Math.round(wx.temp) + "°F</span>" +
      '<span class="phc-weather-label">' + wx.label + "</span></div>";
  }

  /* ---------- holidays ---------- */
  function nthDow(y, m, dow, n) { var f = new Date(y, m, 1); return new Date(y, m, 1 + (dow - f.getDay() + 7) % 7 + 7 * (n - 1)); }
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
      h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, (h + l - 7 * m + 114) % 31 + 1);
  }
  function daysFrom(d, ref) { return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - ref) / 86400000); }
  /* Diwali and Holi follow the Hindu lunar calendar, so their dates are listed per year
     (Diwali = Lakshmi Puja day; Holi = the day of colors, sources differ by a day so the window covers both). */
  var DIWALI = { 2026: [10, 8], 2027: [9, 29], 2028: [9, 17], 2029: [10, 5], 2030: [9, 26] };
  var HOLI = { 2026: [2, 3], 2027: [2, 22], 2028: [2, 11], 2029: [2, 1], 2030: [2, 20] };
  function festival(d) {
    if (window.PHC_FEST !== undefined) return String(window.PHC_FEST).split(" ").filter(Boolean);
    var y = d.getFullYear(), m = d.getMonth(), day = d.getDate(), out = [];
    if (m === 9 && day >= 15) out.push("fest-halloween");
    if (m === 9 && day >= 25) out.push("fest-halloween-kids");
    var tg = daysFrom(d, nthDow(y, 10, 4, 4));
    if (tg >= -7 && tg <= 1) out.push("fest-thanks");
    if (m === 11 || (m === 0 && day <= 5)) out.push("fest-xmas");
    if (m === 11 && day === 24) out.push("fest-eve");
    if ((m === 11 && day === 31) || (m === 0 && day === 1)) out.push("fest-newyear", "fest-fw");
    if (m === 6 && day <= 5) out.push("fest-july4");
    if (m === 6 && (day === 3 || day === 4)) out.push("fest-fw");
    if (m === 1 && day >= 10 && day <= 14) out.push("fest-valentine");
    var ea = daysFrom(d, easter(y));
    if (ea >= -6 && ea <= 1) out.push("fest-easter");
    if (DIWALI[y]) { var dw = daysFrom(d, new Date(y, DIWALI[y][0], DIWALI[y][1])); if (dw >= -2 && dw <= 2) out.push("fest-diwali"); if (dw === 0) out.push("fest-fw"); }
    if (HOLI[y]) { var ho = daysFrom(d, new Date(y, HOLI[y][0], HOLI[y][1])); if (ho >= -1 && ho <= 2) out.push("fest-holi"); }
    return out;
  }
  var FESTS = ["fest-halloween", "fest-halloween-kids", "fest-thanks", "fest-xmas", "fest-eve", "fest-newyear", "fest-fw", "fest-july4", "fest-valentine", "fest-easter", "fest-diwali", "fest-holi"];

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
    var gloom = { clear: 0, partly: 0, cloudy: 0.22, fog: 0.2, drizzle: 0.32, rain: 0.48, snow: 0.18, thunder: 0.72 }[kind];
    gold *= 1 - cloudy * 0.8;
    function amt(name) { return (sb.a === name ? 1 - sb.t : 0) + (sb.b === name ? sb.t : 0); }
    var winter = amt("winter"), spring = amt("spring"), summer = amt("summer"), autumn = amt("autumn");
    var top = [["spring", spring], ["summer", summer], ["autumn", autumn], ["winter", winter]].sort(function (x, y) { return y[1] - x[1]; })[0][0];

    /* light and shadow tints follow the time of day */
    var lightTint = mixRgb(mixRgb("#fff6dc", "#ffb27a", gold), "#9db0ee", nf);
    var shadowTint = mixRgb(mixRgb("#5d5296", "#6a3f86", gold * 0.6), "#0f1534", nf);
    var stl = host.style;
    for (var k in A) {
      var isSky = k.indexOf("sky") === 0;
      var c = mixRgb(A[k], B[k], sb.t);
      if (isSky) {
        c = mixRgb(c, GOLD[k], gold * 0.7);
        c = mixRgb(c, STORM[k], gloom * 0.85);
        c = mixRgb(c, NIGHT[k], nf);
      } else if (k === "cloud") {
        c = mixRgb(c, "#8d95a8", gloom);
        c = mixRgb(c, "#ffd2b0", gold * 0.5);
        c = mixRgb(c, "#6f74a6", nf * 0.8);
      } else if (k === "far" || k === "mid") {
        c = mixRgb(c, "#8a92a8", gloom * 0.5);
        c = mixRgb(c, "#36386a", nf * 0.7);
      } else if (k !== "sun" && k !== "particle") {
        c = mixRgb(c, "#5f6880", gloom * 0.5);
        c = mixRgb(c, "#2c3466", nf * 0.62);
      }
      stl.setProperty("--" + k, c);
      stl.setProperty("--" + k + "-l", mixRgb(c, lightTint, k === "cloud" ? 0.6 : 0.34));
      stl.setProperty("--" + k + "-s", mixRgb(c, shadowTint, k === "cloud" ? 0.32 : 0.36));
    }
    /* characters and the cottage are graded with a light filter */
    stl.setProperty("--cb", (1 - nf * 0.5 - gloom * 0.16).toFixed(2));
    stl.setProperty("--cs", (1 - nf * 0.35 - gloom * 0.25).toFixed(2));
    stl.setProperty("--cg", (gold * 0.25).toFixed(2));
    var lamp = clamp(Math.max(nf, gloom * 0.7, gold * 0.5), 0, 1);
    stl.setProperty("--lamp", lamp.toFixed(2));
    var wind = wx ? wx.wind : 6;
    stl.setProperty("--drift", (-Math.min(260, wind * 9)).toFixed(0) + "px");
    stl.setProperty("--sway", (1 + Math.min(3, wind / 8)).toFixed(2) + "deg");
    stl.setProperty("--capop", Math.max(0.5, 1 - summer * 0.5).toFixed(2));
    var snowing = kind === "snow", raining = kind === "rain" || kind === "drizzle" || kind === "thunder";
    stl.setProperty("--snow", Math.max(snowing ? 0.95 : 0, winter > 0.6 ? (winter - 0.6) * 2.5 : 0).toFixed(2));

    var cls = host.classList;
    ["spring", "summer", "autumn", "winter"].forEach(function (s) { cls.toggle("s-" + s, s === top); });
    cls.toggle("phc-raining", raining);
    cls.toggle("phc-heavy", kind === "rain" && wx && wx.precip > 2.5 || kind === "thunder");
    cls.toggle("phc-drizzle", kind === "drizzle");
    cls.toggle("phc-thunder", kind === "thunder");
    cls.toggle("phc-snowing", snowing);
    cls.toggle("phc-petals", !raining && !snowing && spring > 0.55);
    cls.toggle("phc-leaves", !raining && !snowing && autumn > 0.55);
    cls.toggle("phc-blossom", spring > 0.45 || (summer > 0.5) || (winter > 0.5));
    cls.toggle("phc-fireflies", !raining && !snowing && summer > 0.45 && nf > 0.6);
    cls.toggle("phc-foggy", kind === "fog");
    cls.toggle("phc-is-night", nf > 0.5);
    cls.toggle("phc-is-day", nf < 0.5);
    cls.toggle("phc-frozen", winter > 0.6);
    cls.toggle("phc-smoky", winter > 0.3 || autumn > 0.5 || nf > 0.5 || (wx && wx.temp < 55));
    cls.toggle("phc-calm", !raining && !snowing && kind !== "thunder");
    cls.toggle("phc-wet", raining);
    var fz = festival(now);
    FESTS.forEach(function (f) { cls.toggle(f, fz.indexOf(f) >= 0); });
    document.documentElement.classList.toggle("phc-night", nf > 0.5);

    cloudList.forEach(function (c, i) {
      var need = Math.round(2 + cloudy * 8);
      c.style.opacity = i < need ? "1" : "0";
      c.style.animationDuration = (+c.dataset.dur / (0.6 + Math.min(2.5, wind / 7))).toFixed(0) + "s";
    });
    deckG.style.opacity = clamp((cloudy - 0.55) * 2.2, 0, 1).toFixed(2);
    starsG.style.opacity = (nf * (1 - cloudy * 0.9)).toFixed(2);
    goldG.style.opacity = gold.toFixed(2);
    glowG.style.opacity = lamp.toFixed(2);

    var dayT = clamp((h - sun.rise) / (sun.set - sun.rise), 0, 1);
    sunG.setAttribute("transform", "translate(" + (180 + dayT * 1240).toFixed(0) + "," + (420 - Math.sin(dayT * Math.PI) * 300).toFixed(0) + ")");
    sunG.style.opacity = ((1 - nf) * Math.max(0, 1 - cloudy * 0.95)).toFixed(2);
    raysG.style.opacity = ((1 - nf) * Math.max(0, 1 - cloudy * 1.6)).toFixed(2);
    var nightLen = 24 - (sun.set - sun.rise);
    var nt = clamp(((h - sun.set + 24) % 24) / nightLen, 0, 1);
    moonG.setAttribute("transform", "translate(" + (1420 - nt * 1240).toFixed(0) + "," + (330 - Math.sin(nt * Math.PI) * 230).toFixed(0) + ")");
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
  }
})();
