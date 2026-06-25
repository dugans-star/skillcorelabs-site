(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DOMAINS = [
    { key: "AI", label: "AI", freq: 1.6, rich: 0.55, amp: 1.0, warmth: 0.16 },
    { key: "MARKETS", label: "Markets", freq: 3.2, rich: 0.65, amp: 0.92, warmth: 0.96 },
    { key: "SCIENCE", label: "Science", freq: 1.9, rich: 0.4, amp: 0.82, warmth: 0.05 },
    { key: "CREATIVE", label: "Creative", freq: 1.35, rich: 0.92, amp: 1.22, warmth: 0.62 }
  ];

  var root = document.documentElement;
  var nav = document.querySelector(".topbar");
  if (nav) {
    function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 24); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (!reduce && "IntersectionObserver" in window) {
    root.classList.add("enh");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }

  function setupField(canvas, domainIndex) {
    var ctx = canvas.getContext("2d", { alpha: true });
    var GOLD = "196,255,52";
    var INK = "8,8,10";
    var COOLW = [120, 150, 70];
    var GOLDP = [196, 255, 52];
    var W = 0;
    var H = 0;
    var DPR = 1;
    var L = 0;
    var SAMP = 0;
    var band = 0;
    var t = 0;
    var xH = 0;
    var raf = 0;
    var resolvedTotal = 0;
    var marks = [];
    var particles = [];
    var cur = { freq: 1.6, rich: 0.55, amp: 1.0, warmth: 0.16, r: 212, g: 216, b: 226 };
    var tgt = Object.assign({}, DOMAINS[domainIndex] || DOMAINS[0]);

    canvas.skillSetDomain = function (i) {
      tgt = Object.assign({}, DOMAINS[i] || DOMAINS[0]);
      if (reduce) staticFrame();
    };

    function rnd(a, b) { return a + Math.random() * (b - a); }
    function lerp(a, b, k) { return a + (b - a) * k; }
    function harmWeight(h, rich) {
      var v = rich * 10 - (h - 1);
      if (v <= 0) return 0;
      if (v >= 1) return 1;
      return v * v * (3 - 2 * v);
    }

    var breath = 1;
    function ease() {
      var k = 0.05;
      cur.freq += (tgt.freq - cur.freq) * k;
      cur.rich += (tgt.rich - cur.rich) * k;
      cur.amp += (tgt.amp - cur.amp) * k;
      cur.warmth += (tgt.warmth - cur.warmth) * k;
      cur.r = lerp(COOLW[0], GOLDP[0], cur.warmth);
      cur.g = lerp(COOLW[1], GOLDP[1], cur.warmth);
      cur.b = lerp(COOLW[2], GOLDP[2], cur.warmth);
    }

    function colStr(a) {
      return "rgba(" + (cur.r | 0) + "," + (cur.g | 0) + "," + (cur.b | 0) + "," + a + ")";
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      band = Math.max(90, W * 0.08);
      L = W < 760 ? 18 : 30;
      SAMP = Math.max(64, Math.min(150, Math.floor(W / 9)));
      var pcount = W < 760 ? 18 : 36;
      particles = [];
      for (var i = 0; i < pcount; i += 1) {
        particles.push({ x: rnd(0, W), y: rnd(0, H), v: rnd(0.12, 0.45), ph: rnd(0, 6.28), a: rnd(0.2, 0.6) });
      }
      if (xH === 0) xH = -band;
    }

    function layerY(i, x) {
      var baseY = ((i + 0.5) / L) * H;
      var env = Math.sin(((i + 0.5) / L) * Math.PI);
      var px = x / W;
      var detune = 1 + (i % 2 ? 0.012 : -0.01);
      var sum = 0;
      for (var h = 1; h <= 10; h += 1) {
        var weight = harmWeight(h, cur.rich);
        if (weight === 0) continue;
        var speed = 0.016 * h * (h % 2 ? 1 : -0.72);
        sum += (weight / h) * Math.sin(px * 6.2832 * cur.freq * detune * h + t * speed + i * 0.5);
      }
      var ampPx = (H / L) * 1.85 * cur.amp * env * breath;
      return baseY + sum * ampPx;
    }

    function render(staticMode) {
      if (!staticMode) {
        t += 1;
        ease();
        breath = 1 + 0.1 * Math.sin(t * 0.004);
        xH += W / (28 * 60);
        if (xH > W + band) xH = -band;
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = staticMode ? "rgb(" + INK + ")" : "rgba(" + INK + ",0.14)";
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";
      var rg = ctx.createRadialGradient(xH || W * 0.55, H * 0.5, 0, xH || W * 0.55, H * 0.5, band * 1.6);
      rg.addColorStop(0, colStr(0.12));
      rg.addColorStop(1, colStr(0));
      ctx.fillStyle = rg;
      ctx.fillRect((xH || W * 0.55) - band * 1.6, 0, band * 3.2, H);

      var dx = W / SAMP;
      for (var i = 0; i < L; i += 1) {
        var env = Math.sin(((i + 0.5) / L) * Math.PI);
        var d = i / (L - 1);
        ctx.beginPath();
        for (var s = 0; s <= SAMP; s += 1) {
          var x = s * dx;
          var y = layerY(i, x);
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = colStr(0.06 + 0.22 * env * (0.6 + 0.4 * d));
        ctx.lineWidth = 0.9 + 1.3 * env * (0.5 + 0.5 * d);
        ctx.stroke();
      }

      for (var p = 0; p < particles.length; p += 1) {
        var q = particles[p];
        if (!staticMode) {
          q.x += q.v;
          q.ph += 0.01;
          q.y += Math.sin(q.ph) * 0.22;
          if (q.x > W + 8) { q.x = -8; q.y = rnd(0, H); }
        }
        ctx.fillStyle = colStr(q.a * 0.7);
        ctx.beginPath();
        ctx.arc(q.x, q.y, 1.1, 0, 6.2832);
        ctx.fill();
      }

      if (!staticMode && xH > 0 && xH < W && Math.random() < 0.16 && marks.length < 70) {
        var li = (Math.random() * L) | 0;
        marks.push({ x: xH, y: layerY(li, xH), a: 1 });
        resolvedTotal += 1;
      }

      if (staticMode && marks.length === 0) {
        for (var j = 0; j < 9; j += 1) marks.push({ x: rnd(W * 0.1, W * 0.9), y: rnd(H * 0.22, H * 0.78), a: 1 });
      }

      for (var mi = marks.length - 1; mi >= 0; mi -= 1) {
        var m = marks[mi];
        if (!staticMode) m.a *= 0.986;
        if (m.a < 0.02) { marks.splice(mi, 1); continue; }
        ctx.fillStyle = "rgba(" + GOLD + "," + (m.a * 0.16).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(m.x, m.y, 7, 0, 6.2832); ctx.fill();
        ctx.fillStyle = "rgba(" + GOLD + "," + (m.a * 0.9).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(m.x, m.y, 1.7, 0, 6.2832); ctx.fill();
      }

      var hudLine = document.getElementById("hud-line");
      if (hudLine && canvas.id === "field") {
        var active = DOMAINS[Number(canvas.dataset.active || 0)] || DOMAINS[0];
        var hr = W ? Math.min(1, Math.max(0, xH) / W) : 0;
        hudLine.textContent = "DOMAIN " + active.key + " · f " + cur.freq.toFixed(2) + " · HARM " + Math.round(cur.rich * 10) + " · RESOLVED " + marks.length + " · HORIZON " + hr.toFixed(2);
      }
    }

    function step() {
      render(false);
      raf = requestAnimationFrame(step);
    }

    function staticFrame() {
      cur.freq = tgt.freq;
      cur.rich = tgt.rich;
      cur.amp = tgt.amp;
      cur.warmth = tgt.warmth;
      cur.r = lerp(COOLW[0], GOLDP[0], cur.warmth);
      cur.g = lerp(COOLW[1], GOLDP[1], cur.warmth);
      cur.b = lerp(COOLW[2], GOLDP[2], cur.warmth);
      breath = 1;
      render(true);
    }

    resize();
    if (reduce) staticFrame();
    else raf = requestAnimationFrame(step);

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        cancelAnimationFrame(raf);
        resize();
        if (reduce) staticFrame();
        else raf = requestAnimationFrame(step);
      }, 180);
    }, { passive: true });
  }

  var canvases = document.querySelectorAll("canvas.harmonic-field");
  canvases.forEach(function (canvas, i) {
    setupField(canvas, Number(canvas.dataset.domain || i) % DOMAINS.length);
  });

  var chipsWrap = document.getElementById("chips");
  var hword = document.getElementById("hword");
  var hwrap = document.getElementById("hwrap");
  var heroCanvas = document.getElementById("field");
  var cycleTimer = null;
  var active = 0;

  function setDomain(i, userInitiated) {
    active = i;
    if (heroCanvas) {
      heroCanvas.dataset.active = String(i);
      if (typeof heroCanvas.skillSetDomain === "function") heroCanvas.skillSetDomain(i);
    }
    if (chipsWrap) {
      chipsWrap.querySelectorAll(".chip").forEach(function (el, k) {
        var on = k === i;
        el.classList.toggle("active", on);
        el.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    if (hword && hwrap) {
      if (reduce) hword.textContent = DOMAINS[i].label.toUpperCase();
      else {
        hwrap.classList.add("swap");
        setTimeout(function () {
          hword.textContent = DOMAINS[i].label.toUpperCase();
          hwrap.classList.remove("swap");
        }, 240);
      }
    }
    if (userInitiated) resetCycle();
  }

  function resetCycle() {
    if (reduce || !hword) return;
    clearInterval(cycleTimer);
    cycleTimer = setInterval(function () { setDomain((active + 1) % DOMAINS.length, false); }, 5600);
  }

  if (chipsWrap) {
    DOMAINS.forEach(function (d, i) {
      var b = document.createElement("button");
      b.className = "chip" + (i === 0 ? " active" : "");
      b.type = "button";
      b.textContent = d.label;
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.addEventListener("click", function () { setDomain(i, true); });
      chipsWrap.appendChild(b);
    });
    chipsWrap.addEventListener("mouseenter", function () { clearInterval(cycleTimer); });
    chipsWrap.addEventListener("mouseleave", resetCycle);
    chipsWrap.addEventListener("focusin", function () { clearInterval(cycleTimer); });
    chipsWrap.addEventListener("focusout", resetCycle);
  }
  resetCycle();

  var marquee = document.getElementById("marquee");
  if (marquee) {
    var seq = ["AI", "CLAIMS", "EVIDENCE", "OUTCOMES", "TRUST", "REALITY"];
    var html = "";
    for (var rep = 0; rep < 2; rep += 1) {
      seq.forEach(function (w) { html += "<span>" + w + "</span><span class=\"mid\">·</span>"; });
    }
    marquee.innerHTML = html;
  }
})();
