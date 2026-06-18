/* ED intake companion benchmark harness — state, rendering, autosave, print. */
(function () {
  "use strict";

  var META_KEY = "ed_companion_bench_meta_v1";
  var RESULTS_KEY = "ed_companion_bench_results_v1";

  // ---------- state ----------
  var meta = loadJSON(META_KEY, { tester: "", model: "", date: today(), lang: "de" });
  var results = loadJSON(RESULTS_KEY, {}); // caseId -> { ai, extractor, verdict, notes, frozen }

  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function loadJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function saveMeta() { localStorage.setItem(META_KEY, JSON.stringify(meta)); }
  function saveResults() { localStorage.setItem(RESULTS_KEY, JSON.stringify(results)); }

  function getResult(id) {
    if (!results[id]) results[id] = { ai: "", extractor: "", verdict: null, notes: "", frozen: false, topicOk: false };
    return results[id];
  }

  function lang() { return meta.lang; }
  function t(obj) { return (obj && (obj[lang()] || obj.en || obj.de)) || ""; }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ---------- DOM refs ----------
  var sectionsEl = document.getElementById("sections");
  var tbodyEl = document.querySelector("#results-table tbody");
  var progressEl = document.getElementById("progress");

  // ---------- meta inputs ----------
  function bindMeta(id, field) {
    var el = document.getElementById(id);
    el.value = meta[field] || "";
    el.addEventListener("input", function () { meta[field] = el.value; saveMeta(); });
    return el;
  }
  bindMeta("meta-tester", "tester");
  bindMeta("meta-model", "model");
  bindMeta("meta-date", "date");
  var langSel = document.getElementById("meta-lang");
  langSel.value = meta.lang;
  langSel.addEventListener("change", function () {
    meta.lang = langSel.value;
    saveMeta();
    render(); // re-render so prompts/expectations switch language (inputs restored from store)
  });

  // ---------- rendering ----------
  function captureFor(section, c) { return c.capture || section.capture; }

  function renderIntro() {
    var el = document.getElementById("intro");
    if (!el || !BENCHMARK.intro) return;
    var intro = BENCHMARK.intro;
    var bullets = (intro.bullets[lang()] || intro.bullets.en || []).map(function (b) {
      return "<li>" + esc(b) + "</li>";
    }).join("");
    el.innerHTML =
      "<h2>" + esc(t(intro.title)) + "</h2>" +
      "<p>" + esc(t(intro.lead)) + "</p>" +
      "<ul>" + bullets + "</ul>";
  }

  function renderOutline() {
    var outline = document.getElementById("outline");
    var links = BENCHMARK.sections.map(function (section, i) {
      return '<a href="#sec-' + section.id + '">' +
        '<span class="outline-num">' + (i + 1) + "</span>" +
        '<span class="outline-title">' + esc(t(section.title)) + "</span>" +
        '<span class="outline-count">' + section.cases.length + "</span>" +
        "</a>";
    }).join("");
    outline.innerHTML = '<div class="outline-label">Sections</div><div class="outline-links">' + links + "</div>";
  }

  function render() {
    sectionsEl.innerHTML = "";
    renderIntro();
    renderOutline();
    var counter = 0;
    BENCHMARK.sections.forEach(function (section, i) {
      var sec = document.createElement("section");
      sec.className = "section";
      sec.id = "sec-" + section.id;

      var head = document.createElement("div");
      head.className = "section-head";
      head.innerHTML =
        "<h2>" + (i + 1) + ". " + esc(t(section.title)) +
        ' <span class="section-count">(' + section.cases.length + ")</span></h2>" +
        '<div class="section-instruction">' + esc(t(section.instruction)) + "</div>";
      sec.appendChild(head);

      if (section.overview) {
        var ov = document.createElement("div");
        ov.className = "section-overview";
        var items = (section.overview[lang()] || section.overview.en || []).map(function (line) {
          return "<li>" + esc(line) + "</li>";
        }).join("");
        ov.innerHTML =
          '<div class="su-label">' + esc(t(section.overviewTitle) || "Overview") + "</div>" +
          "<ul>" + items + "</ul>";
        sec.appendChild(ov);
      }

      section.cases.forEach(function (c) {
        counter++;
        sec.appendChild(renderCase(section, c, counter));
      });
      sectionsEl.appendChild(sec);
    });
    refreshDerived();
  }

  function renderCase(section, c, num) {
    var caps = captureFor(section, c);
    var r = getResult(c.id);

    var card = document.createElement("div");
    card.className = "case" + (r.verdict ? " verdict-" + r.verdict : "");
    card.dataset.caseId = c.id;

    // top bar
    var top = document.createElement("div");
    top.className = "case-top no-print";
    var capLabels = caps.map(function (k) { return k === "ai" ? "AI answer" : "Extractor"; }).join(" + ");
    top.innerHTML =
      '<span class="case-id">#' + num + " · " + esc(c.id) + "</span>" +
      '<span class="case-badges">' +
      '<span class="chip">' + esc(capLabels) + "</span>" +
      '<span class="chip ' + (r.verdict ? "verdict-" + r.verdict : "") + '" data-role="verdict-chip">' +
      (r.verdict ? r.verdict.toUpperCase() : "pending") + "</span>" +
      "</span>";
    card.appendChild(top);

    var body = document.createElement("div");
    body.className = "case-body";

    // SU prompt
    var prompt = document.createElement("div");
    prompt.className = "su-prompt";
    prompt.innerHTML =
      '<div class="su-label">Simulated user</div>' +
      '<div class="su-text">' + esc(t(c.prompt)) + "</div>" +
      '<button class="btn-copy no-print" type="button">Copy</button>';
    prompt.querySelector(".btn-copy").addEventListener("click", function () {
      var btn = this;
      navigator.clipboard.writeText(t(c.prompt)).then(function () {
        btn.classList.add("copied");
        btn.textContent = "Copied!";
        setTimeout(function () { btn.classList.remove("copied"); btn.textContent = "Copy"; }, 1200);
      });
    });
    body.appendChild(prompt);

    // expected
    var exp = document.createElement("div");
    exp.className = "expected";
    exp.innerHTML =
      '<div class="su-label">Expected</div>' +
      '<div class="su-text">' + esc(t(c.expected)) + "</div>";
    body.appendChild(exp);

    // capture fields
    if (caps.indexOf("ai") !== -1) {
      body.appendChild(makeField(c.id, "ai", "AI answer (Companion / EdInfoResponse)", false, r));
    }
    if (caps.indexOf("extractor") !== -1) {
      body.appendChild(makeField(c.id, "extractor", "Extractor JSON (delta or full SAMPLER)", true, r));
    }

    // per-topic completeness check (section-level, e.g. the end-to-end intake)
    if (section.topicCheck) {
      var topicLabel = t(section.topicCheck).replace("{topic}", c.topic ? t(c.topic) : "this topic");
      body.appendChild(makeTopicCheck(c.id, topicLabel, r));
    }

    // verdict row
    body.appendChild(makeVerdictRow(card, c.id, r));

    card.appendChild(body);
    return card;
  }

  function makeField(caseId, kind, label, isJson, r) {
    var wrap = document.createElement("div");
    wrap.className = "field";

    var lab = document.createElement("label");
    lab.textContent = label;
    wrap.appendChild(lab);

    var ta = document.createElement("textarea");
    ta.value = r[kind] || "";
    ta.disabled = !!r.frozen;
    ta.dataset.kind = kind;

    var hint = document.createElement("div");
    hint.className = "json-hint";

    var mirror = document.createElement("div");
    mirror.className = "print-mirror print-only";
    mirror.textContent = r[kind] || "—";

    function onChange() {
      var res = getResult(caseId);
      res[kind] = ta.value;
      saveResults();
      mirror.textContent = ta.value || "—";
      if (isJson) validateJson(ta, hint);
      updateRowFor(caseId);
    }
    ta.addEventListener("input", onChange);

    wrap.appendChild(ta);
    if (isJson) { wrap.appendChild(hint); validateJson(ta, hint); }
    wrap.appendChild(mirror);
    return wrap;
  }

  function topicMirrorText(checked) {
    return "Topic completed before advancing: " + (checked ? "yes ✓" : "no ✗");
  }

  function makeTopicCheck(caseId, label, r) {
    var wrap = document.createElement("div");
    wrap.className = "topic-check";

    var line = document.createElement("label");
    line.className = "topic-check-line no-print";

    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!r.topicOk;
    cb.disabled = !!r.frozen;

    var span = document.createElement("span");
    span.textContent = label;

    line.appendChild(cb);
    line.appendChild(span);

    var mirror = document.createElement("div");
    mirror.className = "print-mirror print-only";
    mirror.textContent = topicMirrorText(!!r.topicOk);

    cb.addEventListener("change", function () {
      getResult(caseId).topicOk = cb.checked;
      saveResults();
      mirror.textContent = topicMirrorText(cb.checked);
    });

    wrap.appendChild(line);
    wrap.appendChild(mirror);
    return wrap;
  }

  function validateJson(ta, hint) {
    var v = ta.value.trim();
    ta.classList.remove("json-ok", "json-bad");
    hint.className = "json-hint";
    hint.textContent = "";
    if (!v) return;
    try {
      JSON.parse(v);
      ta.classList.add("json-ok");
      hint.classList.add("ok");
      hint.textContent = "valid JSON";
    } catch (e) {
      ta.classList.add("json-bad");
      hint.classList.add("bad");
      hint.textContent = "not valid JSON (saved anyway): " + e.message;
    }
  }

  function makeVerdictRow(card, caseId, r) {
    var row = document.createElement("div");
    row.className = "verdict-row";

    var passBtn = mkVerdictBtn("pass", "Satisfies ✓");
    var failBtn = mkVerdictBtn("fail", "Fails ✗");
    var notes = document.createElement("input");
    notes.type = "text";
    notes.className = "verdict-notes no-print";
    notes.placeholder = "notes / why…";
    notes.value = r.notes || "";
    notes.disabled = !!r.frozen;
    notes.addEventListener("input", function () {
      getResult(caseId).notes = notes.value; saveResults(); updateRowFor(caseId);
    });

    var notesMirror = document.createElement("div");
    notesMirror.className = "print-mirror print-only";
    notesMirror.textContent = "Notes: " + (r.notes || "—");

    var editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-ghost btn-edit no-print";
    editBtn.textContent = "Edit";
    editBtn.style.display = r.frozen ? "" : "none";

    function applyFrozen(frozen) {
      var res = getResult(caseId);
      res.frozen = frozen;
      saveResults();
      card.querySelectorAll("textarea").forEach(function (ta) { ta.disabled = frozen; });
      card.querySelectorAll(".topic-check input").forEach(function (cb) { cb.disabled = frozen; });
      notes.disabled = frozen;
      passBtn.disabled = frozen;
      failBtn.disabled = frozen;
      editBtn.style.display = frozen ? "" : "none";
    }

    function setVerdict(v) {
      var res = getResult(caseId);
      res.verdict = (res.verdict === v) ? null : v; // toggle off if same
      saveResults();
      passBtn.classList.toggle("active", res.verdict === "pass");
      failBtn.classList.toggle("active", res.verdict === "fail");
      card.className = "case" + (res.verdict ? " verdict-" + res.verdict : "");
      var chip = card.querySelector('[data-role="verdict-chip"]');
      chip.className = "chip " + (res.verdict ? "verdict-" + res.verdict : "");
      chip.textContent = res.verdict ? res.verdict.toUpperCase() : "pending";
      // giving a verdict freezes the card; clearing it unfreezes
      applyFrozen(!!res.verdict);
      updateRowFor(caseId);
      refreshProgress();
    }

    passBtn.addEventListener("click", function () { setVerdict("pass"); });
    failBtn.addEventListener("click", function () { setVerdict("fail"); });
    editBtn.addEventListener("click", function () { applyFrozen(false); });

    passBtn.classList.toggle("active", r.verdict === "pass");
    failBtn.classList.toggle("active", r.verdict === "fail");
    notes.addEventListener("input", function () { notesMirror.textContent = "Notes: " + (notes.value || "—"); });

    row.appendChild(passBtn);
    row.appendChild(failBtn);
    row.appendChild(notes);
    row.appendChild(notesMirror);
    row.appendChild(editBtn);
    return row;
  }

  function mkVerdictBtn(kind, text) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "verdict-btn " + kind + " no-print";
    b.textContent = text;
    return b;
  }

  // ---------- results table + progress ----------
  function allCases() {
    var out = [];
    BENCHMARK.sections.forEach(function (s) {
      s.cases.forEach(function (c) { out.push({ section: s, c: c }); });
    });
    return out;
  }

  function refreshDerived() { buildTable(); refreshProgress(); }

  function buildTable() {
    tbodyEl.innerHTML = "";
    var n = 0;
    BENCHMARK.sections.forEach(function (section, i) {
      tbodyEl.appendChild(sectionDividerRow(section, i + 1));
      section.cases.forEach(function (c) {
        n++;
        tbodyEl.appendChild(rowFor(section, c, n));
      });
    });
  }

  function sectionDividerRow(section, num) {
    var tr = document.createElement("tr");
    tr.className = "section-divider-row";
    tr.innerHTML = '<td colspan="6"><a href="#sec-' + section.id + '">' +
      num + ". " + esc(t(section.title)) + " · " + section.cases.length + " cases</a></td>";
    return tr;
  }

  function rowFor(section, c, num) {
    var r = getResult(c.id);
    var tr = document.createElement("tr");
    tr.dataset.caseId = c.id;
    var caps = captureFor(section, c).map(function (k) { return k === "ai" ? "AI" : "Extr"; }).join("+");
    tr.innerHTML =
      "<td>" + num + "</td>" +
      "<td>" + esc(t(section.title)) + "</td>" +
      "<td>" + esc(truncate(t(c.prompt), 90)) + "</td>" +
      "<td>" + esc(caps) + "</td>" +
      '<td class="' + verdictClass(r.verdict) + '">' + (r.verdict ? r.verdict.toUpperCase() : "pending") + "</td>" +
      "<td>" + esc(r.notes || "") + "</td>";
    return tr;
  }

  function updateRowFor(caseId) {
    var tr = tbodyEl.querySelector('tr[data-case-id="' + cssEscape(caseId) + '"]');
    if (!tr) return;
    var r = getResult(caseId);
    var cells = tr.children;
    cells[4].className = verdictClass(r.verdict);
    cells[4].textContent = r.verdict ? r.verdict.toUpperCase() : "pending";
    cells[5].textContent = r.notes || "";
  }

  function verdictClass(v) { return v === "pass" ? "tag-pass" : v === "fail" ? "tag-fail" : "tag-pending"; }
  function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function cssEscape(s) { return s.replace(/"/g, '\\"'); }

  function refreshProgress() {
    var cases = allCases();
    var total = cases.length, pass = 0, fail = 0, done = 0;
    cases.forEach(function (e) {
      var v = getResult(e.c.id).verdict;
      if (v) { done++; if (v === "pass") pass++; else fail++; }
    });
    var complete = done === total;
    // Accuracy = pass / total. While cases are still pending it is a lower bound,
    // so it is labelled "so far"; once everything is judged it is the final grade.
    var pct = total ? Math.round((pass / total) * 100) : 0;

    progressEl.innerHTML =
      '<span class="grade">' + pct + "%</span>" +
      '<span class="grade-label">' + (complete ? "final accuracy" : "accuracy so far") + "</span>" +
      '<span class="progress-breakdown">' +
        "<strong>" + done + "/" + total + "</strong> judged · " +
        '<span class="tag-pass">' + pass + " pass</span> · " +
        '<span class="tag-fail">' + fail + " fail</span> · " +
        '<span class="tag-pending">' + (total - done) + " pending</span>" +
      "</span>";

    var pm = document.getElementById("print-meta");
    if (pm) {
      pm.innerHTML =
        "Tester: " + esc(meta.tester || "—") + " &nbsp;·&nbsp; " +
        "Model/commit: " + esc(meta.model || "—") + " &nbsp;·&nbsp; " +
        "Date: " + esc(meta.date || "—") + " &nbsp;·&nbsp; " +
        "Language: " + esc(meta.lang) + "<br>" +
        "<strong>Accuracy: " + pct + "%</strong>" + (complete ? "" : " (provisional — " + (total - done) + " pending)") +
        " &nbsp;·&nbsp; " + pass + " pass / " + fail + " fail / " + (total - done) + " pending of " + total;
    }
  }

  // ---------- header collapse ----------
  var HEADER_KEY = "ed_companion_bench_header_collapsed_v1";
  var hideBtn = document.getElementById("btn-hide-header");
  var revealBtn = document.getElementById("header-reveal");
  function setHeaderCollapsed(collapsed) {
    document.body.classList.toggle("header-collapsed", collapsed);
    try { localStorage.setItem(HEADER_KEY, collapsed ? "1" : "0"); } catch (e) {}
  }
  hideBtn.addEventListener("click", function () { setHeaderCollapsed(true); });
  revealBtn.addEventListener("click", function () { setHeaderCollapsed(false); });
  setHeaderCollapsed(localStorage.getItem(HEADER_KEY) === "1");

  // ---------- toolbar ----------
  document.getElementById("btn-print").addEventListener("click", function () { window.print(); });

  document.getElementById("btn-clear").addEventListener("click", function () {
    if (!confirm("Clear ALL recorded answers and verdicts? This cannot be undone.")) return;
    results = {};
    saveResults();
    render();
  });

  document.getElementById("btn-export").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify({ meta: meta, results: results }, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "ed-companion-benchmark-" + (meta.date || today()) + ".json";
    a.click();
    URL.revokeObjectURL(url);
  });

  var importInput = document.getElementById("import-file");
  document.getElementById("btn-import").addEventListener("click", function () { importInput.click(); });
  importInput.addEventListener("change", function () {
    var file = importInput.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (data.results) { results = data.results; saveResults(); }
        if (data.meta) {
          meta = Object.assign(meta, data.meta);
          saveMeta();
          document.getElementById("meta-tester").value = meta.tester || "";
          document.getElementById("meta-model").value = meta.model || "";
          document.getElementById("meta-date").value = meta.date || "";
          langSel.value = meta.lang;
        }
        render();
      } catch (e) { alert("Could not import: " + e.message); }
    };
    reader.readAsText(file);
    importInput.value = "";
  });

  // ---------- go ----------
  render();
})();
