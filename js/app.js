(function () {
  'use strict';

  var CFG = window.LED_CONFIG || { width: 1152, height: 2048, slideMs: 12000 };
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.dot'));
  var canvas = document.getElementById('canvas');
  var progress = document.getElementById('progress-bar');
  var hint = document.getElementById('pause-hint');
  var clockEl = document.getElementById('clock');
  var dateEl = document.getElementById('date-line');
  var index = 0;
  var paused = false;
  var timer = null;
  var cursorTimer = null;

  function path(obj, key) {
    if (!obj || !key) return undefined;
    return key.split('.').reduce(function (acc, part) {
      return acc == null ? acc : acc[part];
    }, obj);
  }

  function toneOf(status) {
    return status || 'good';
  }

  function setBoundText(el, value) {
    if (!el || value == null) return;
    var unit = el.querySelector('.unit');
    if (!unit) {
      el.textContent = String(value);
      return;
    }

    var textNode = Array.prototype.find.call(el.childNodes, function (node) {
      return node.nodeType === 3;
    });

    if (textNode) textNode.nodeValue = String(value);
    else el.insertBefore(document.createTextNode(String(value)), unit);
  }

  function applyMetric(root, metric) {
    if (!root || !metric) return;

    var valueEl = root.querySelector('.metric-value, .summary-value');
    var metaEl = root.querySelector('.metric-meta, .summary-meta');
    if (valueEl && metric.value != null) {
      var unitEl = valueEl.querySelector('.unit');
      if (unitEl) {
        setBoundText(valueEl, metric.value);
        if (metric.unit) unitEl.textContent = metric.unit;
      } else {
        valueEl.textContent = String(metric.value);
      }
    }
    if (metaEl && metric.meta) metaEl.textContent = metric.meta;
    if (metric.status) root.setAttribute('data-tone', toneOf(metric.status));
  }

  function applyAirCard(root, metric) {
    if (!root || !metric) return;
    var valueEl = root.querySelector('strong');
    var unitEl = root.querySelector('em');
    var metaEl = root.querySelector('small');
    if (valueEl && metric.value != null) valueEl.textContent = String(metric.value);
    if (unitEl && metric.unit) unitEl.textContent = metric.unit;
    if (metaEl && metric.meta) metaEl.textContent = metric.meta;
    if (metric.status) root.setAttribute('data-tone', toneOf(metric.status));
  }

  function bind(data) {
    document.querySelectorAll('[data-bind]').forEach(function (el) {
      var value = path(data, el.getAttribute('data-bind'));
      if (value != null && typeof value !== 'object') setBoundText(el, value);
    });

    document.querySelectorAll('.metric-card[data-metric], .summary-card[data-metric]').forEach(function (el) {
      applyMetric(el, path(data, el.getAttribute('data-metric')));
    });

    document.querySelectorAll('.air-card[data-metric]').forEach(function (el) {
      applyAirCard(el, path(data, el.getAttribute('data-metric')));
    });

    document.querySelectorAll('[data-status]').forEach(function (el) {
      var status = path(data, el.getAttribute('data-status'));
      if (status) el.setAttribute('data-tone', toneOf(status));
    });

    var campus = path(data, 'campus.name');
    var loc = path(data, 'campus.location');
    var sub = document.querySelector('.brand-sub');
    if (sub && campus) sub.textContent = loc ? campus + ' · ' + loc : campus;

    var deg = path(data, 'weather.windDirection.degrees');
    var windNeedle = document.getElementById('wind-needle');
    if (windNeedle && deg != null) windNeedle.style.transform = 'rotate(' + Number(deg) + 'deg)';

    var aqi = Number(path(data, 'air.aqi.value'));
    var aqiMarker = document.getElementById('aqi-marker');
    if (aqiMarker && !isNaN(aqi)) {
      aqiMarker.style.left = Math.max(2, Math.min(98, (aqi / 250) * 100)) + '%';
    }

    var db = Number(path(data, 'noise.level.value'));
    var noiseNeedle = document.getElementById('noise-needle');
    if (noiseNeedle && !isNaN(db)) {
      noiseNeedle.style.left = Math.max(2, Math.min(98, ((db - 30) / 60) * 100)) + '%';
    }

    var tier = path(data, 'noise.category.tier') || 'low';
    document.querySelectorAll('#noise-cats .category').forEach(function (cat) {
      cat.classList.toggle('is-on', cat.getAttribute('data-tier') === tier);
    });
  }

  function scale() {
    var s = Math.min(window.innerWidth / CFG.width, window.innerHeight / CFG.height);
    canvas.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }

  function tickClock() {
    var now = new Date();
    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    var ss = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = hh + ':' + mm + ':' + ss;
    clockEl.setAttribute('datetime', now.toISOString());
    dateEl.textContent = now.toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  function restartProgress() {
    progress.classList.remove('running');
    progress.style.animation = 'none';
    void progress.offsetWidth;
    progress.style.animation = '';
    document.documentElement.style.setProperty('--slide-ms', (CFG.slideMs / 1000) + 's');
    progress.classList.add('running');
  }

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (slide, n) {
      slide.classList.toggle('is-active', n === index);
    });
    dots.forEach(function (dot, n) {
      dot.classList.toggle('is-on', n === index);
    });
    if (!paused) restartProgress();
  }

  function next() {
    show(index + 1);
  }

  function arm() {
    clearInterval(timer);
    if (paused) return;
    timer = setInterval(next, CFG.slideMs);
    restartProgress();
  }

  function togglePause() {
    paused = !paused;
    document.body.classList.toggle('is-paused', paused);
    hint.textContent = paused ? 'Paused' : 'Auto · ' + Math.round(CFG.slideMs / 1000) + 's';
    if (paused) clearInterval(timer);
    else arm();
  }

  function hideCursorLater() {
    clearTimeout(cursorTimer);
    document.body.classList.add('show-cursor');
    cursorTimer = setTimeout(function () {
      document.body.classList.remove('show-cursor');
    }, CFG.hideCursorMs || 4000);
  }

  async function pollData() {
    if (!CFG.dataUrl) return;
    try {
      var res = await fetch(CFG.dataUrl, { cache: 'no-store' });
      if (!res.ok) return;
      var json = await res.json();
      window.ENV_DATA = json;
      bind(json);
    } catch (err) {
      /* file:// or unavailable data.json: keep embedded sample data. */
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.getAttribute('data-go')));
      arm();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      next(); arm();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      show(index - 1); arm();
    } else if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
      e.preventDefault(); togglePause();
    } else if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {});
      else document.exitFullscreen();
    } else if (/^[1-3]$/.test(e.key)) {
      show(Number(e.key) - 1); arm();
    }
  });

  window.addEventListener('resize', scale);
  window.addEventListener('mousemove', hideCursorLater);
  window.addEventListener('click', hideCursorLater);

  scale();
  tickClock();
  setInterval(tickClock, 1000);
  bind(window.ENV_DATA || {});
  show(0);
  arm();
  hideCursorLater();
  pollData();
  if (CFG.dataPollMs) setInterval(pollData, CFG.dataPollMs);
})();
