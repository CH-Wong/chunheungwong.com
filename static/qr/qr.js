/* QR code generator UI logic for /qr/. Depends on qrcode.min.js (loaded first).
   Runs entirely client-side. */
(function () {
  "use strict";

  // Encode text as UTF-8 bytes (the library defaults to Latin-1 otherwise).
  if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs["UTF-8"]) {
    qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
  }

  var $ = function (id) { return document.getElementById(id); };
  var els = {
    data: $("data"), ecl: $("ecl"), margin: $("margin"),
    resolution: $("resolution"), resolutionCustom: $("resolutionCustom"),
    fg: $("fg"), bg: $("bg"),
    preview: $("preview"), meta: $("meta"), error: $("error"), warn: $("warn"),
    downloadPng: $("downloadPng"), downloadSvg: $("downloadSvg"), copyPng: $("copyPng")
  };

  var state = { qr: null, count: 0, version: 0 };

  function currentResolution() {
    if (els.resolution.value === "custom") {
      return Math.max(64, Math.min(8192, parseInt(els.resolutionCustom.value, 10) || 0));
    }
    return parseInt(els.resolution.value, 10);
  }

  function currentMargin() {
    var m = parseInt(els.margin.value, 10);
    if (isNaN(m) || m < 0) m = 0;
    if (m > 16) m = 16;
    return m;
  }

  // Build the smallest QR version that fits the data at the chosen EC level.
  function buildQR(text, ecl) {
    var lastErr = null;
    for (var type = 1; type <= 40; type++) {
      try {
        var qr = qrcode(type, ecl);
        qr.addData(text, "Byte");
        qr.make();
        return qr;
      } catch (e) { lastErr = e; }
    }
    throw new Error("Content is too long to fit in a QR code. Shorten it or lower the error correction level.");
  }

  function drawCanvas(qr, size, margin, fg, bg) {
    var count = qr.getModuleCount();
    var total = count + margin * 2;
    var cell = Math.floor(size / total);
    if (cell < 1) {
      throw new Error("Resolution " + size + "px is too small for this content (needs at least " + total + "px). Increase the resolution or reduce the quiet zone.");
    }
    var offset = Math.floor((size - cell * count) / 2); // centered; quiet zone >= requested margin
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = fg;
    for (var r = 0; r < count; r++) {
      for (var c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect(offset + c * cell, offset + r * cell, cell, cell);
        }
      }
    }
    return canvas;
  }

  function buildSVG(qr, margin, fg, bg) {
    var count = qr.getModuleCount();
    var total = count + margin * 2;
    var path = [];
    for (var r = 0; r < count; r++) {
      for (var c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          path.push("M" + (c + margin) + " " + (r + margin) + "h1v1h-1z");
        }
      }
    }
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + " " + total + '" ' +
      'shape-rendering="crispEdges">' +
      '<rect width="' + total + '" height="' + total + '" fill="' + bg + '"/>' +
      '<path d="' + path.join("") + '" fill="' + fg + '"/>' +
      "</svg>\n";
  }

  function luminance(hex) {
    var c = hex.replace("#", "");
    var r = parseInt(c.substr(0, 2), 16) / 255;
    var g = parseInt(c.substr(2, 2), 16) / 255;
    var b = parseInt(c.substr(4, 2), 16) / 255;
    var f = function (v) { return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }

  function contrastRatio(a, b) {
    var l1 = luminance(a), l2 = luminance(b);
    var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  function render() {
    els.error.textContent = "";
    els.warn.textContent = "";
    var text = els.data.value;
    if (!text) {
      els.preview.removeAttribute("src");
      els.meta.textContent = "";
      return;
    }

    var ecl = els.ecl.value;
    var margin = currentMargin();
    var fg = els.fg.value;
    var bg = els.bg.value;

    try {
      var qr = buildQR(text, ecl);
      state.qr = qr;
      state.count = qr.getModuleCount();
      state.version = (state.count - 17) / 4;

      // Preview: fixed on-screen size, independent of download resolution.
      var previewCanvas = drawCanvas(qr, 320, margin, fg, bg);
      els.preview.src = previewCanvas.toDataURL("image/png");

      var res = currentResolution();
      var bytes = unescape(encodeURIComponent(text)).length;
      els.meta.innerHTML =
        "<b>" + bytes + "</b> bytes &middot; " +
        "version <b>" + state.version + "</b> (" + state.count + "&times;" + state.count + " modules) &middot; " +
        "EC level <b>" + ecl + "</b><br>" +
        "PNG export: <b>" + res + " &times; " + res + " px</b>";

      var ratio = contrastRatio(fg, bg);
      if (ratio < 3) {
        els.warn.textContent = "Low contrast (" + ratio.toFixed(1) + ":1) - many scanners will fail. Keep it dark-on-light.";
      } else if (luminance(fg) > luminance(bg)) {
        els.warn.textContent = "Inverted (light on dark) - some scanners will not read this.";
      }
    } catch (e) {
      state.qr = null;
      els.preview.removeAttribute("src");
      els.meta.textContent = "";
      els.error.textContent = e.message || String(e);
    }
  }

  function slug(text) {
    return (text.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "qr-code").slice(0, 40);
  }

  function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function withPng(cb) {
    if (!state.qr) { render(); if (!state.qr) return; }
    var size = currentResolution();
    var canvas;
    try {
      canvas = drawCanvas(state.qr, size, currentMargin(), els.fg.value, els.bg.value);
    } catch (e) {
      els.error.textContent = e.message || String(e);
      return;
    }
    canvas.toBlob(function (blob) { cb(blob, size); }, "image/png");
  }

  els.resolution.addEventListener("change", function () {
    var custom = els.resolution.value === "custom";
    els.resolutionCustom.disabled = !custom;
    if (custom) els.resolutionCustom.focus();
    render();
  });

  ["input", "change"].forEach(function (evt) {
    els.data.addEventListener(evt, render);
    els.ecl.addEventListener(evt, render);
    els.margin.addEventListener(evt, render);
    els.resolutionCustom.addEventListener(evt, render);
    els.fg.addEventListener(evt, render);
    els.bg.addEventListener(evt, render);
  });

  els.downloadPng.addEventListener("click", function () {
    withPng(function (blob) {
      triggerDownload(blob, slug(els.data.value) + "-" + currentResolution() + ".png");
    });
  });

  els.downloadSvg.addEventListener("click", function () {
    if (!state.qr) { render(); if (!state.qr) return; }
    var svg = buildSVG(state.qr, currentMargin(), els.fg.value, els.bg.value);
    triggerDownload(new Blob([svg], { type: "image/svg+xml" }), slug(els.data.value) + ".svg");
  });

  els.copyPng.addEventListener("click", function () {
    if (!navigator.clipboard || !window.ClipboardItem) {
      els.error.textContent = "This browser does not support copying images to the clipboard. Use Download PNG.";
      return;
    }
    withPng(function (blob) {
      navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]).then(function () {
        var original = els.copyPng.textContent;
        els.copyPng.textContent = "Copied";
        setTimeout(function () { els.copyPng.textContent = original; }, 1500);
      }).catch(function (e) {
        els.error.textContent = "Copy failed: " + (e.message || e);
      });
    });
  });

  render();
})();
