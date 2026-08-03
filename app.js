(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  const { useState, useEffect, useMemo, useRef, useCallback } = React;
  const sb = window.supabase.createClient(
    window.APP_CONFIG.SUPABASE_URL,
    window.APP_CONFIG.SUPABASE_ANON_KEY
  );
  const YEARS_2010_2019 = Array.from({ length: 10 }, (_, i) => 2010 + i);
  const YEARS_2023_TODAY = [2023, 2024, 2025, 2026];
  const YEARS_FULL = [...YEARS_2010_2019, ...YEARS_2023_TODAY];
  const TAB_THEMES = {
    t1: { name: "\u{1F5D3}\uFE0F \u05E0\u05D9\u05EA\u05D5\u05D7 \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD 2010-2019", grad: "from-sky-500 to-blue-600", text: "text-sky-700 dark:text-sky-300", solid: "#0284c7", years: YEARS_2010_2019 },
    t2: { name: "\u{1F4E1} \u05E0\u05D9\u05EA\u05D5\u05D7 \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD 2023-\u05D4\u05D9\u05D5\u05DD", grad: "from-blue-600 to-indigo-600", text: "text-blue-700 dark:text-blue-300", solid: "#2563eb", years: YEARS_2023_TODAY },
    t3: { name: "\u{1F5C4}\uFE0F \u05E0\u05D9\u05EA\u05D5\u05D7 \u05DE\u05D0\u05D2\u05E8 \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05DE\u05E7\u05D9\u05E3", grad: "from-indigo-600 to-blue-900", text: "text-indigo-700 dark:text-indigo-300", solid: "#4338ca", years: YEARS_FULL }
  };
  const DRILLIN_THEME = {
    name: "\u{1F52C} Drill In \u2014 \u05E0\u05D9\u05EA\u05D5\u05D7 \u05E1\u05E7\u05E8\u05D9 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA",
    navLabel: "\u{1F52C} Drill In",
    grad: "from-teal-600 to-emerald-600",
    text: "text-teal-700 dark:text-teal-300",
    solid: "#0d9488"
  };
  const RANK_PARAMS = [
    { key: "sentiment", label: "\u2764\uFE0F \u05D0\u05D4\u05D3\u05D4 \u05E4\u05E8\u05D5-\u05D9\u05E9\u05E8\u05D0\u05DC\u05D9\u05EA" },
    { key: "roi", label: "\u{1F4B9} \u05E8\u05D5\u05D5\u05D7\u05D9\u05D5\u05EA (\u05D9\u05E2\u05D9\u05DC\u05D5\u05EA \u05D4\u05DE\u05E8\u05D4)" },
    { key: "religiousAffinity", label: "\u{1F54E} \u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA" },
    { key: "totalScore", label: "\u{1F3C6} \u05E6\u05D9\u05D5\u05DF \u05DB\u05D5\u05DC\u05DC (\u05DE\u05E9\u05D5\u05E7\u05DC\u05DC)" }
  ];
  function fmtNum(n) {
    return n === void 0 || n === null || isNaN(n) ? "-" : new Intl.NumberFormat("he-IL").format(Math.round(n));
  }
  function sanitizeAiText(text) {
    if (!text) return text;
    return text.replace(/\*\*/g, "").replace(/^#{1,6}\s*/gm, "").replace(/^[-•]\s+/gm, "").trim();
  }
  function fmtCompact(n) {
    if (n === void 0 || n === null || isNaN(n)) return "-";
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return Math.round(n).toString();
  }
  function hexA(hex, alpha) {
    const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
    return hex + a;
  }
  let LOG_MIN = 0;
  let LOG_MAX = 1;
  function setJewishPopBounds(allValues) {
    const vals = allValues.filter((v) => v != null && v > 0);
    if (!vals.length) return;
    LOG_MIN = Math.log1p(Math.min(...vals));
    LOG_MAX = Math.log1p(Math.max(...vals));
  }
  function deriveMetrics(rows, years) {
    const filtered = rows.filter((r) => years.includes(r.year));
    if (!filtered.length) return null;
    filtered.sort((a, b) => a.year - b.year);
    const visitorsByYear = {};
    filtered.forEach((r) => {
      visitorsByYear[r.year] = (r.entries_to_israel_thousands || 0) * 1e3;
    });
    const avg = (key) => filtered.reduce((s, r) => s + (r[key] || 0), 0) / filtered.length;
    const sumVisitors = filtered.reduce((s, r) => s + (r.entries_to_israel_thousands || 0) * 1e3, 0);
    const sumOutbound = filtered.reduce((s, r) => s + (r.outbound_tourism_millions || 0), 0);
    const avgHdi = avg("hdi");
    const avgAirQuality = avg("air_transport_quality");
    const avgJewishPop = avg("jewish_population");
    const avgGdpPerCapita = avg("gdp_per_capita");
    const avgExpenditurePerTrip = avg("average_expenditure_per_trip");
    const avgPassengersPerYear = avg("number_of_passengers_per_year");
    const avgEvangelicalPop = avg("evangelical_population");
    const advisoryYears = filtered.filter((r) => r.travel_advisory === 2).length;
    const hasDirectFlights = !!filtered[filtered.length - 1].has_direct_flights;
    const hasOffice = !!filtered[filtered.length - 1].has_office;
    const isAiEstimated = filtered.some((r) => r.is_ai_estimated);
    const sentiment = Math.round(
      filtered.reduce((s, r) => s + ((r.online_search_index || 0) * 0.6 + (r.travel_advisory === 1 ? 100 : 50) * 0.4), 0) / filtered.length
    );
    const religiousAffinity = Math.round(
      Math.max(0, Math.min(100, (Math.log1p(avgJewishPop) - LOG_MIN) / (LOG_MAX - LOG_MIN || 1) * 100))
    );
    const roi = sumOutbound > 0 ? +(sumVisitors / 1e6 / sumOutbound * 100).toFixed(2) : 0;
    const roiScore = Math.min(100, Math.max(0, roi * 20));
    const first = filtered[0].entries_to_israel_thousands || 0;
    const last = filtered[filtered.length - 1].entries_to_israel_thousands || 0;
    const growthPct = first > 0 ? (last - first) / first * 100 : 0;
    const growthTrend = Math.round(Math.min(100, Math.max(0, 50 + growthPct / 4)));
    const totalScore = Math.round(sentiment * 0.35 + religiousAffinity * 0.25 + roiScore * 0.25 + growthTrend * 0.15);
    return {
      visitorsByYear,
      sumVisitors,
      sumOutbound,
      avgHdi,
      avgAirQuality,
      avgJewishPop,
      avgGdpPerCapita,
      avgExpenditurePerTrip,
      avgPassengersPerYear,
      avgEvangelicalPop,
      advisoryYears,
      hasDirectFlights,
      hasOffice,
      sentiment,
      religiousAffinity,
      roi,
      roiScore,
      growthTrend,
      totalScore,
      isAiEstimated
    };
  }
  const REGRESSION_FIELDS = [
    { key: "hdi", label: "\u05DE\u05D3\u05D3 \u05E4\u05D9\u05EA\u05D5\u05D7 \u05D0\u05E0\u05D5\u05E9\u05D9 (HDI)", get: (r) => r.hdi },
    { key: "outbound_tourism_millions", label: "\u05E0\u05E4\u05D7 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05D9\u05D5\u05E6\u05D0\u05EA", get: (r) => r.outbound_tourism_millions },
    { key: "online_search_index", label: "\u05DE\u05D3\u05D3 \u05D7\u05D9\u05E4\u05D5\u05E9 \u05DE\u05E7\u05D5\u05D5\u05DF", get: (r) => r.online_search_index },
    { key: "air_transport_quality", label: "\u05D0\u05D9\u05DB\u05D5\u05EA \u05EA\u05E9\u05EA\u05D9\u05D5\u05EA \u05EA\u05E2\u05D5\u05E4\u05D4", get: (r) => r.air_transport_quality },
    { key: "jewish_population", label: "\u05D0\u05D5\u05DB\u05DC\u05D5\u05E1\u05D9\u05D9\u05D4 \u05D9\u05D4\u05D5\u05D3\u05D9\u05EA", get: (r) => r.jewish_population },
    { key: "has_direct_flights", label: "\u05D8\u05D9\u05E1\u05D5\u05EA \u05D9\u05E9\u05D9\u05E8\u05D5\u05EA (\u05D9\u05E9/\u05D0\u05D9\u05DF)", get: (r) => r.has_direct_flights == null ? null : r.has_direct_flights ? 1 : 0 },
    { key: "travel_advisory", label: "\u05D4\u05E2\u05D3\u05E8 \u05D0\u05D6\u05D4\u05E8\u05EA \u05DE\u05E1\u05E2", get: (r) => r.travel_advisory == null ? null : r.travel_advisory === 1 ? 1 : 0 },
    { key: "gdp_per_capita", label: "\u05EA\u05D5\u05E6\u05E8 \u05DC\u05E0\u05E4\u05E9", get: (r) => r.gdp_per_capita },
    { key: "average_expenditure_per_trip", label: "\u05D4\u05D5\u05E6\u05D0\u05D4 \u05DE\u05DE\u05D5\u05E6\u05E2\u05EA \u05DC\u05E0\u05E1\u05D9\u05E2\u05D4", get: (r) => r.average_expenditure_per_trip },
    { key: "number_of_passengers_per_year", label: "\u05E0\u05D5\u05E1\u05E2\u05D9\u05DD \u05D1\u05D8\u05D9\u05E1\u05D5\u05EA (\u05E9\u05E0\u05EA\u05D9)", get: (r) => r.number_of_passengers_per_year },
    { key: "evangelical_population", label: "\u05D0\u05D5\u05DB\u05DC\u05D5\u05E1\u05D9\u05D9\u05D4 \u05D0\u05D5\u05D5\u05E0\u05D2\u05DC\u05D9\u05E1\u05D8\u05D9\u05EA", get: (r) => r.evangelical_population },
    { key: "distance", label: "\u05DE\u05E8\u05D7\u05E7 \u05DE\u05D9\u05E9\u05E8\u05D0\u05DC (\u05E7\u05F4\u05DE)", get: (r) => r.distance }
  ];
  function zscore(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    const std = Math.sqrt(variance) || 1;
    return { mean, std, z: values.map((v) => (v - mean) / std) };
  }
  function solveLinearSystem(A, b) {
    const n = A.length;
    const M = A.map((row, i) => [...row, b[i]]);
    for (let col = 0; col < n; col++) {
      let pivotRow = col;
      for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivotRow][col])) pivotRow = r;
      [M[col], M[pivotRow]] = [M[pivotRow], M[col]];
      const pivot = M[col][col] || 1e-9;
      for (let c = col; c <= n; c++) M[col][c] /= pivot;
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const factor = M[r][col];
        for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
      }
    }
    return M.map((row) => row[n]);
  }
  function getValidRegressionRows(allMetrics, years) {
    return allMetrics.filter(
      (r) => years.includes(r.year) && REGRESSION_FIELDS.every((f) => f.get(r) != null) && r.entries_to_israel_thousands != null
    );
  }
  function runRegression(allMetrics, years) {
    const rows = getValidRegressionRows(allMetrics, years);
    if (rows.length < REGRESSION_FIELDS.length + 2) return null;
    const y = rows.map((r) => r.entries_to_israel_thousands);
    const yStats = zscore(y);
    const predictorStats = REGRESSION_FIELDS.map((f) => zscore(rows.map((r) => f.get(r))));
    const n = rows.length;
    const p = REGRESSION_FIELDS.length + 1;
    const X = rows.map((_, i) => [1, ...predictorStats.map((s) => s.z[i])]);
    const XtX = Array.from({ length: p }, () => Array(p).fill(0));
    const Xty = Array(p).fill(0);
    for (let i = 0; i < n; i++) {
      for (let a = 0; a < p; a++) {
        Xty[a] += X[i][a] * yStats.z[i];
        for (let b = 0; b < p; b++) XtX[a][b] += X[i][a] * X[i][b];
      }
    }
    const beta = solveLinearSystem(XtX, Xty);
    const predictions = X.map((row) => row.reduce((s, v, idx) => s + v * beta[idx], 0));
    const ssRes = predictions.reduce((s, pred, i) => s + (yStats.z[i] - pred) ** 2, 0);
    const ssTot = yStats.z.reduce((s, v) => s + v ** 2, 0);
    const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
    const coeffs = beta.slice(1);
    const sumAbs = coeffs.reduce((s, c) => s + Math.abs(c), 0) || 1;
    const influence = REGRESSION_FIELDS.map((f, i) => ({
      key: f.key,
      label: f.label,
      coefficient: coeffs[i],
      influencePct: Math.round(Math.abs(coeffs[i]) / sumAbs * 1e3) / 10,
      direction: coeffs[i] >= 0 ? "positive" : "negative"
    })).sort((a, b) => b.influencePct - a.influencePct);
    return { n, r2: Math.round(r2 * 1e3) / 1e3, influence, intercept: beta[0] };
  }
  function normalizeMetricRow(row) {
    var _a, _b;
    return __spreadProps(__spreadValues({}, row), {
      air_transport_quality: (_a = row["air_transport_quality-TTDI"]) != null ? _a : row.air_transport_quality,
      gdp_per_capita: (_b = row["gpd_per_Capita"]) != null ? _b : row.gdp_per_capita
    });
  }
  const DataAPI = {
    async fetchCountries() {
      const { data, error } = await sb.from("countries").select("*").order("name_he");
      if (error) throw error;
      return data;
    },
    async fetchAllMetrics() {
      const { data, error } = await sb.from("country_metrics").select("*");
      if (error) throw error;
      return data.map(normalizeMetricRow);
    },
    async upsertCountry(country) {
      const { data, error } = await sb.from("countries").upsert(country, { onConflict: "name_en" }).select().single();
      if (error) throw error;
      return data;
    },
    async deleteCountry(countryId) {
      const { error } = await sb.from("countries").delete().eq("id", countryId);
      if (error) throw error;
    },
    async upsertMetric(row) {
      const { error } = await sb.from("country_metrics").upsert(row, { onConflict: "country_id,year" });
      if (error) throw error;
    },
    async deleteMetric(countryId, year) {
      const { error } = await sb.from("country_metrics").delete().eq("country_id", countryId).eq("year", year);
      if (error) throw error;
    },
    async getSetting(key, fallback) {
      const { data, error } = await sb.from("app_settings").select("value").eq("key", key).maybeSingle();
      if (error || !data) return fallback;
      return data.value;
    },
    async setSetting(key, value) {
      const { error } = await sb.from("app_settings").upsert({ key, value }, { onConflict: "key" });
      if (error) throw error;
    },
    async estimateViaAI(name_en, name_he, years) {
      const { data, error } = await sb.functions.invoke("estimate-country", { body: { name_en, name_he, years } });
      if (error) throw new Error(await extractFunctionError(error));
      return data;
    },
    async generateInsight(type, context) {
      const { data, error } = await sb.functions.invoke("generate-insight", { body: { type, context } });
      if (error) throw new Error(await extractFunctionError(error));
      return data;
    }
  };
  async function extractFunctionError(error) {
    try {
      if ((error == null ? void 0 : error.context) && typeof error.context.json === "function") {
        const body = await error.context.json();
        if (body == null ? void 0 : body.error) return body.error;
        return JSON.stringify(body);
      }
      if ((error == null ? void 0 : error.context) && typeof error.context.text === "function") {
        return await error.context.text();
      }
    } catch (e) {
    }
    return (error == null ? void 0 : error.message) || String(error);
  }
  function GlobalStyles() {
    return /* @__PURE__ */ React.createElement("style", null, `
      :root {
        --page-bg:#eff6ff; --nav-bg:#ffffff; --card-bg:#ffffff; --card-border:#dbeafe;
        --text-primary:#0f172a; --text-secondary:#475569; --text-muted:#94a3b8;
        --input-bg:#ffffff; --input-border:#cbd5e1; --hover-bg:#eff6ff; --overlay-bg:rgba(15,23,42,0.5);
      }
      [data-mode="dark"] {
        --page-bg:#0a0e1a; --nav-bg:#0f172a; --card-bg:#111c33; --card-border:#1e2c4d;
        --text-primary:#f1f5f9; --text-secondary:#94a3b8; --text-muted:#64748b;
        --input-bg:#16213d; --input-border:#2b3b60; --hover-bg:#182541; --overlay-bg:rgba(2,6,23,0.7);
      }
      .app-page{ background:var(--page-bg); }
      .app-nav{ background:var(--nav-bg); border-color:var(--card-border); }
      .card{ background:var(--card-bg); border-color:var(--card-border); }
      .text-primary{ color:var(--text-primary); }
      .text-secondary{ color:var(--text-secondary); }
      .text-muted{ color:var(--text-muted); }
      .input-field{ background:var(--input-bg); border-color:var(--input-border); color:var(--text-primary); }
      .input-field::placeholder{ color:var(--text-muted); }
      .hoverable:hover{ background:var(--hover-bg); }
      .divider{ border-color:var(--card-border); }
      .tooltip-i { position:relative; display:inline-flex; cursor:help; }
      .tooltip-i .bubble { display:none; position:absolute; bottom:130%; right:50%; transform:translateX(50%);
        background:#fef9c3; color:#78350f; font-size:12px; padding:8px 10px; border-radius:8px; width:220px;
        box-shadow:0 4px 12px rgba(0,0,0,0.15); z-index:50; line-height:1.5; text-align:right; }
      .tooltip-i:hover .bubble { display:block; }
      @keyframes fadeIn{ from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      @keyframes shake{ 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
      @media print {
        .app-nav, .no-print, button { display: none !important; }
        body, .app-page { background: white !important; }
        .card { break-inside: avoid; border: 1px solid #ccc !important; }
      }
    `);
  }
  function InfoTip({ text }) {
    return /* @__PURE__ */ React.createElement("span", { className: "tooltip-i text-muted" }, /* @__PURE__ */ React.createElement("span", { style: { width: 15, height: 15, borderRadius: "50%", border: "1px solid currentColor", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" } }, "i"), /* @__PURE__ */ React.createElement("span", { className: "bubble" }, text));
  }
  function exportToExcel(filename, sheets) {
    if (!window.XLSX) {
      alert("\u05E1\u05E4\u05E8\u05D9\u05D9\u05EA \u05D4\u05D0\u05E7\u05E1\u05DC \u05E2\u05D3\u05D9\u05D9\u05DF \u05E0\u05D8\u05E2\u05E0\u05EA, \u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1 \u05D1\u05E2\u05D5\u05D3 \u05E8\u05D2\u05E2.");
      return;
    }
    const wb = XLSX.utils.book_new();
    sheets.forEach(({ name, rows }) => {
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
    });
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }
  function ExportBar({ onExcel }) {
    return /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 justify-end no-print" }, /* @__PURE__ */ React.createElement("button", { onClick: onExcel, className: "text-xs px-3 py-1.5 rounded-lg border text-secondary hoverable flex items-center gap-1.5", style: { borderColor: "var(--card-border)" } }, "\u{1F4CA} \u05D9\u05D9\u05E6\u05D5\u05D0 \u05DC\u05D0\u05E7\u05E1\u05DC"), /* @__PURE__ */ React.createElement("button", { onClick: () => window.print(), className: "text-xs px-3 py-1.5 rounded-lg border text-secondary hoverable flex items-center gap-1.5", style: { borderColor: "var(--card-border)" } }, "\u{1F5A8}\uFE0F \u05D9\u05D9\u05E6\u05D5\u05D0 \u05DC-PDF / \u05D4\u05D3\u05E4\u05E1\u05D4"));
  }
  function ChartCanvas({ type, data, options, height = 260 }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    useEffect(() => {
      if (!canvasRef.current) return;
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new Chart(canvasRef.current.getContext("2d"), { type, data, options });
      return () => {
        if (chartRef.current) chartRef.current.destroy();
      };
    }, [JSON.stringify(data), JSON.stringify(options), type]);
    return /* @__PURE__ */ React.createElement("div", { style: { height } }, /* @__PURE__ */ React.createElement("canvas", { ref: canvasRef }));
  }
  function MinistryLogo({ size = 40 }) {
    return /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center shrink-0", style: { height: size, width: size * 1.43 } }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "logo.jpg",
        alt: "\u05DC\u05D5\u05D2\u05D5 \u05DE\u05E9\u05E8\u05D3 \u05D4\u05EA\u05D9\u05D9\u05E8\u05D5\u05EA",
        style: { width: "100%", height: "100%", objectFit: "contain" },
        onError: (e) => {
          e.target.style.display = "none";
        }
      }
    ));
  }
  function LoginScreen({ onLogin, currentPassword }) {
    const [pw, setPw] = useState("");
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const submit = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      if (pw.trim().length > 0 && pw.trim() === (currentPassword || "").trim()) {
        setError("");
        onLogin();
      } else {
        setError("\u{1F6AB} \u05E1\u05D9\u05E1\u05DE\u05D4 \u05E9\u05D2\u05D5\u05D9\u05D4. \u05E0\u05E1\u05D5 \u05E9\u05D5\u05D1.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden", dir: "rtl" }, /* @__PURE__ */ React.createElement(GlobalStyles, null), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 opacity-25", style: { backgroundImage: "radial-gradient(circle at 20% 20%, #0284c7 0, transparent 40%), radial-gradient(circle at 80% 70%, #4338ca 0, transparent 40%)" } }), /* @__PURE__ */ React.createElement("div", { className: `relative z-10 w-full max-w-md mx-4 ${shake ? "animate-[shake_0.4s]" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center justify-center mb-4 bg-white/90 rounded-xl p-3 shadow-lg" }, /* @__PURE__ */ React.createElement(MinistryLogo, { size: 56 })), /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-bold text-white tracking-tight" }, "\u{1F9F3} \u05DE\u05E2\u05E8\u05DB\u05EA \u05E0\u05D9\u05EA\u05D5\u05D7 \u05E9\u05D9\u05D5\u05D5\u05E7 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm mt-1" }, "\u2708\uFE0F \u05DC\u05D5\u05D7 \u05D1\u05E7\u05E8\u05D4 \u05D0\u05E0\u05DC\u05D9\u05D8\u05D9 \u2014 \u05D2\u05D9\u05E9\u05D4 \u05DE\u05D5\u05D2\u05D1\u05DC\u05EA \u{1F512}")), /* @__PURE__ */ React.createElement("form", { onSubmit: submit, className: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl" }, /* @__PURE__ */ React.createElement("label", { className: "block text-sm text-slate-300 mb-2 font-medium" }, "\u{1F511} \u05E1\u05D9\u05E1\u05DE\u05EA \u05D2\u05D9\u05E9\u05D4"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: showPw ? "text" : "password",
        value: pw,
        onChange: (e) => {
          setPw(e.target.value);
          setError("");
        },
        onKeyDown: (e) => {
          if (e.key === "Enter") submit(e);
        },
        placeholder: "\u05D4\u05D6\u05D9\u05E0\u05D5 \u05E1\u05D9\u05E1\u05DE\u05D4",
        autoFocus: true,
        className: "w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 px-4 pl-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setShowPw((s) => !s),
        tabIndex: -1,
        className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-lg"
      },
      showPw ? "\u{1F648}" : "\u{1F441}\uFE0F"
    )), error && /* @__PURE__ */ React.createElement("p", { className: "text-red-400 text-sm mt-2" }, error), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: submit, className: "w-full mt-6 bg-gradient-to-l from-sky-500 to-blue-700 hover:from-sky-400 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition shadow-lg cursor-pointer" }, "\u{1F6AA} \u05DB\u05E0\u05D9\u05E1\u05D4 \u05DC\u05DE\u05E2\u05E8\u05DB\u05EA")), /* @__PURE__ */ React.createElement("p", { className: "text-center text-slate-500 text-xs mt-6" }, "\xA9 2026 \u05DE\u05E9\u05E8\u05D3 \u05D4\u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \xB7 \u05DE\u05D7\u05DC\u05E7\u05EA \u05E9\u05D9\u05D5\u05D5\u05E7")));
  }
  const WORLD_COUNTRIES_HE = [
    { name_he: "\u05D9\u05D5\u05D5\u05DF", name_en: "Greece", flag: "\u{1F1EC}\u{1F1F7}", lat: 37.98, lng: 23.73, distance_km: 1253 },
    { name_he: "\u05E7\u05E4\u05E8\u05D9\u05E1\u05D9\u05DF", name_en: "Cyprus", flag: "\u{1F1E8}\u{1F1FE}", lat: 35.17, lng: 33.36, distance_km: 415 },
    { name_he: "\u05DE\u05E6\u05E8\u05D9\u05DD", name_en: "Egypt", flag: "\u{1F1EA}\u{1F1EC}", lat: 30.04, lng: 31.24, distance_km: 425 },
    { name_he: "\u05D9\u05E8\u05D3\u05DF", name_en: "Jordan", flag: "\u{1F1EF}\u{1F1F4}", lat: 31.95, lng: 35.93, distance_km: 71 },
    { name_he: "\u05D8\u05D5\u05E8\u05E7\u05D9\u05D4", name_en: "Turkey", flag: "\u{1F1F9}\u{1F1F7}", lat: 39.93, lng: 32.86, distance_km: 932 },
    { name_he: "\u05E4\u05D5\u05E8\u05D8\u05D5\u05D2\u05DC", name_en: "Portugal", flag: "\u{1F1F5}\u{1F1F9}", lat: 38.72, lng: -9.14, distance_km: 4061 },
    { name_he: "\u05DE\u05E8\u05D5\u05E7\u05D5", name_en: "Morocco", flag: "\u{1F1F2}\u{1F1E6}", lat: 34.02, lng: -6.83, distance_km: 3906 },
    { name_he: "\u05D4\u05D5\u05DC\u05E0\u05D3", name_en: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}", lat: 52.37, lng: 4.9, distance_km: 3348 },
    { name_he: "\u05D1\u05DC\u05D2\u05D9\u05D4", name_en: "Belgium", flag: "\u{1F1E7}\u{1F1EA}", lat: 50.85, lng: 4.35, distance_km: 3297 },
    { name_he: "\u05E9\u05D5\u05D5\u05D9\u05E5", name_en: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}", lat: 46.95, lng: 7.45, distance_km: 2898 },
    { name_he: "\u05D0\u05D5\u05E1\u05D8\u05E8\u05D9\u05D4", name_en: "Austria", flag: "\u{1F1E6}\u{1F1F9}", lat: 48.21, lng: 16.37, distance_km: 2420 },
    { name_he: "\u05E9\u05D5\u05D5\u05D3\u05D9\u05D4", name_en: "Sweden", flag: "\u{1F1F8}\u{1F1EA}", lat: 59.33, lng: 18.07, distance_km: 3320 },
    { name_he: "\u05E0\u05D5\u05E8\u05D5\u05D5\u05D2\u05D9\u05D4", name_en: "Norway", flag: "\u{1F1F3}\u{1F1F4}", lat: 59.91, lng: 10.75, distance_km: 3612 },
    { name_he: "\u05D3\u05E0\u05DE\u05E8\u05E7", name_en: "Denmark", flag: "\u{1F1E9}\u{1F1F0}", lat: 55.68, lng: 12.57, distance_km: 3190 },
    { name_he: "\u05E4\u05D9\u05E0\u05DC\u05E0\u05D3", name_en: "Finland", flag: "\u{1F1EB}\u{1F1EE}", lat: 60.17, lng: 24.94, distance_km: 3248 },
    { name_he: "\u05D0\u05D9\u05E8\u05DC\u05E0\u05D3", name_en: "Ireland", flag: "\u{1F1EE}\u{1F1EA}", lat: 53.35, lng: -6.26, distance_km: 4072 },
    { name_he: "\u05D4\u05D5\u05E0\u05D2\u05E8\u05D9\u05D4", name_en: "Hungary", flag: "\u{1F1ED}\u{1F1FA}", lat: 47.5, lng: 19.04, distance_km: 2222 },
    { name_he: "\u05E6'\u05DB\u05D9\u05D4", name_en: "Czechia", flag: "\u{1F1E8}\u{1F1FF}", lat: 50.09, lng: 14.42, distance_km: 2665 },
    { name_he: "\u05E8\u05D5\u05DE\u05E0\u05D9\u05D4", name_en: "Romania", flag: "\u{1F1F7}\u{1F1F4}", lat: 44.43, lng: 26.1, distance_km: 1616 },
    { name_he: "\u05D1\u05D5\u05DC\u05D2\u05E8\u05D9\u05D4", name_en: "Bulgaria", flag: "\u{1F1E7}\u{1F1EC}", lat: 42.7, lng: 23.32, distance_km: 1605 },
    { name_he: "\u05E7\u05E8\u05D5\u05D0\u05D8\u05D9\u05D4", name_en: "Croatia", flag: "\u{1F1ED}\u{1F1F7}", lat: 45.81, lng: 15.98, distance_km: 2273 },
    { name_he: "\u05E1\u05E8\u05D1\u05D9\u05D4", name_en: "Serbia", flag: "\u{1F1F7}\u{1F1F8}", lat: 44.79, lng: 20.45, distance_km: 1932 },
    { name_he: "\u05E1\u05DC\u05D5\u05D1\u05E7\u05D9\u05D4", name_en: "Slovakia", flag: "\u{1F1F8}\u{1F1F0}", lat: 48.15, lng: 17.11, distance_km: 2375 },
    { name_he: "\u05E1\u05DC\u05D5\u05D1\u05E0\u05D9\u05D4", name_en: "Slovenia", flag: "\u{1F1F8}\u{1F1EE}", lat: 46.06, lng: 14.51, distance_km: 2381 },
    { name_he: "\u05DC\u05D9\u05D8\u05D0", name_en: "Lithuania", flag: "\u{1F1F1}\u{1F1F9}", lat: 54.69, lng: 25.28, distance_km: 2667 },
    { name_he: "\u05DC\u05D8\u05D1\u05D9\u05D4", name_en: "Latvia", flag: "\u{1F1F1}\u{1F1FB}", lat: 56.95, lng: 24.11, distance_km: 2927 },
    { name_he: "\u05D0\u05E1\u05D8\u05D5\u05E0\u05D9\u05D4", name_en: "Estonia", flag: "\u{1F1EA}\u{1F1EA}", lat: 59.44, lng: 24.75, distance_km: 3174 },
    { name_he: "\u05D1\u05DC\u05D0\u05E8\u05D5\u05E1", name_en: "Belarus", flag: "\u{1F1E7}\u{1F1FE}", lat: 53.9, lng: 27.57, distance_km: 2535 },
    { name_he: "\u05DE\u05D5\u05DC\u05D3\u05D5\u05D1\u05D4", name_en: "Moldova", flag: "\u{1F1F2}\u{1F1E9}", lat: 47.01, lng: 28.86, distance_km: 1779 },
    { name_he: "\u05D9\u05E4\u05DF", name_en: "Japan", flag: "\u{1F1EF}\u{1F1F5}", lat: 35.68, lng: 139.65, distance_km: 9145 },
    { name_he: "\u05EA\u05D0\u05D9\u05DC\u05E0\u05D3", name_en: "Thailand", flag: "\u{1F1F9}\u{1F1ED}", lat: 13.75, lng: 100.5, distance_km: 6887 },
    { name_he: "\u05D5\u05D9\u05D9\u05D8\u05E0\u05D0\u05DD", name_en: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}", lat: 21.03, lng: 105.85, distance_km: 7019 },
    { name_he: "\u05D0\u05D9\u05E0\u05D3\u05D5\u05E0\u05D6\u05D9\u05D4", name_en: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}", lat: -6.21, lng: 106.85, distance_km: 8664 },
    { name_he: "\u05DE\u05DC\u05D6\u05D9\u05D4", name_en: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}", lat: 3.14, lng: 101.69, distance_km: 7609 },
    { name_he: "\u05E1\u05D9\u05E0\u05D2\u05E4\u05D5\u05E8", name_en: "Singapore", flag: "\u{1F1F8}\u{1F1EC}", lat: 1.35, lng: 103.82, distance_km: 7916 },
    { name_he: "\u05D0\u05D9\u05D7\u05D5\u05D3 \u05D4\u05D0\u05DE\u05D9\u05E8\u05D5\u05D9\u05D5\u05EA", name_en: "UAE", flag: "\u{1F1E6}\u{1F1EA}", lat: 24.47, lng: 54.37, distance_km: 2042 },
    { name_he: "\u05E2\u05E8\u05D1 \u05D4\u05E1\u05E2\u05D5\u05D3\u05D9\u05EA", name_en: "Saudi Arabia", flag: "\u{1F1F8}\u{1F1E6}", lat: 24.71, lng: 46.68, distance_km: 1369 },
    { name_he: "\u05E7\u05D8\u05D0\u05E8", name_en: "Qatar", flag: "\u{1F1F6}\u{1F1E6}", lat: 25.29, lng: 51.53, distance_km: 1747 },
    { name_he: "\u05DB\u05D5\u05D5\u05D9\u05EA", name_en: "Kuwait", flag: "\u{1F1F0}\u{1F1FC}", lat: 29.38, lng: 47.98, distance_km: 1250 },
    { name_he: "\u05DE\u05E7\u05E1\u05D9\u05E7\u05D5", name_en: "Mexico", flag: "\u{1F1F2}\u{1F1FD}", lat: 19.43, lng: -99.13, distance_km: 12527 },
    { name_he: "\u05D0\u05E8\u05D2\u05E0\u05D8\u05D9\u05E0\u05D4", name_en: "Argentina", flag: "\u{1F1E6}\u{1F1F7}", lat: -34.6, lng: -58.38, distance_km: 12237 },
    { name_he: "\u05E6'\u05D9\u05DC\u05D4", name_en: "Chile", flag: "\u{1F1E8}\u{1F1F1}", lat: -33.45, lng: -70.67, distance_km: 13229 },
    { name_he: "\u05E7\u05D5\u05DC\u05D5\u05DE\u05D1\u05D9\u05D4", name_en: "Colombia", flag: "\u{1F1E8}\u{1F1F4}", lat: 4.71, lng: -74.07, distance_km: 11529 },
    { name_he: "\u05E4\u05E8\u05D5", name_en: "Peru", flag: "\u{1F1F5}\u{1F1EA}", lat: -12.05, lng: -77.04, distance_km: 12803 },
    { name_he: "\u05D3\u05E8\u05D5\u05DD \u05D0\u05E4\u05E8\u05D9\u05E7\u05D4", name_en: "South Africa", flag: "\u{1F1FF}\u{1F1E6}", lat: -25.75, lng: 28.19, distance_km: 6439 },
    { name_he: "\u05E0\u05D9\u05D2\u05E8\u05D9\u05D4", name_en: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}", lat: 9.08, lng: 7.4, distance_km: 3819 },
    { name_he: "\u05E7\u05E0\u05D9\u05D4", name_en: "Kenya", flag: "\u{1F1F0}\u{1F1EA}", lat: -1.29, lng: 36.82, distance_km: 3680 },
    { name_he: "\u05D0\u05EA\u05D9\u05D5\u05E4\u05D9\u05D4", name_en: "Ethiopia", flag: "\u{1F1EA}\u{1F1F9}", lat: 9.03, lng: 38.74, distance_km: 2554 },
    { name_he: "\u05D0\u05D5\u05E1\u05D8\u05E8\u05DC\u05D9\u05D4", name_en: "Australia", flag: "\u{1F1E6}\u{1F1FA}", lat: -35.28, lng: 149.13, distance_km: 13992 },
    { name_he: "\u05E0\u05D9\u05D5 \u05D6\u05D9\u05DC\u05E0\u05D3", name_en: "New Zealand", flag: "\u{1F1F3}\u{1F1FF}", lat: -41.29, lng: 174.78, distance_km: 16287 },
    { name_he: "\u05D0\u05D6\u05E8\u05D1\u05D9\u05D9\u05D2'\u05DF", name_en: "Azerbaijan", flag: "\u{1F1E6}\u{1F1FF}", lat: 40.41, lng: 49.87, distance_km: 1627 },
    { name_he: "\u05D2\u05D0\u05D5\u05E8\u05D2\u05D9\u05D4", name_en: "Georgia", flag: "\u{1F1EC}\u{1F1EA}", lat: 41.72, lng: 44.79, distance_km: 1395 },
    { name_he: "\u05D0\u05E8\u05DE\u05E0\u05D9\u05D4", name_en: "Armenia", flag: "\u{1F1E6}\u{1F1F2}", lat: 40.18, lng: 44.51, distance_km: 1253 },
    { name_he: "\u05E7\u05D6\u05D7\u05E1\u05D8\u05DF", name_en: "Kazakhstan", flag: "\u{1F1F0}\u{1F1FF}", lat: 51.18, lng: 71.45, distance_km: 3653 },
    { name_he: "\u05D0\u05D5\u05D6\u05D1\u05E7\u05D9\u05E1\u05D8\u05DF", name_en: "Uzbekistan", flag: "\u{1F1FA}\u{1F1FF}", lat: 41.3, lng: 69.24, distance_km: 3195 },
    { name_he: "\u05D0\u05D9\u05E8\u05DF", name_en: "Iran", flag: "\u{1F1EE}\u{1F1F7}", lat: 35.69, lng: 51.39, distance_km: 1556 },
    { name_he: "\u05E2\u05D9\u05E8\u05D0\u05E7", name_en: "Iraq", flag: "\u{1F1EE}\u{1F1F6}", lat: 33.31, lng: 44.36, distance_km: 874 },
    { name_he: "\u05DC\u05D1\u05E0\u05D5\u05DF", name_en: "Lebanon", flag: "\u{1F1F1}\u{1F1E7}", lat: 33.89, lng: 35.5, distance_km: 237 },
    { name_he: "\u05DE\u05DC\u05D8\u05D4", name_en: "Malta", flag: "\u{1F1F2}\u{1F1F9}", lat: 35.9, lng: 14.51, distance_km: 1963 },
    { name_he: "\u05D0\u05D9\u05E1\u05DC\u05E0\u05D3", name_en: "Iceland", flag: "\u{1F1EE}\u{1F1F8}", lat: 64.15, lng: -21.94, distance_km: 5288 },
    { name_he: "\u05DC\u05D5\u05E7\u05E1\u05DE\u05D1\u05D5\u05E8\u05D2", name_en: "Luxembourg", flag: "\u{1F1F1}\u{1F1FA}", lat: 49.61, lng: 6.13, distance_km: 3120 }
  ];
  function toTitleCase(str) {
    return str.trim().toLowerCase().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  function lookupCanonicalCountry(name_en, name_he) {
    const normalizedEn = (name_en || "").trim().toLowerCase();
    return WORLD_COUNTRIES_HE.find(
      (c) => c.name_en.toLowerCase() === normalizedEn || c.name_he === (name_he || "").trim()
    );
  }
  function CountryPicker({ label, value, onChange, countries, exclude = [] }) {
    const [query, setQuery] = useState(value || "");
    const [open, setOpen] = useState(false);
    const options = countries.filter((c) => !exclude.includes(c.name_he));
    const dbMatches = options.filter((c) => c.name_he.includes(query.trim()));
    const dbNames = new Set(countries.map((c) => c.name_he));
    const worldMatches = query.trim() ? WORLD_COUNTRIES_HE.filter((c) => c.name_he.includes(query.trim()) && !dbNames.has(c.name_he) && !exclude.includes(c.name_he)).filter((c, i, arr) => arr.findIndex((x) => x.name_he === c.name_he) === i) : [];
    const noMatchesAtAll = dbMatches.length === 0 && worldMatches.length === 0;
    return /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1.5" }, label), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: query,
        onChange: (e) => {
          setQuery(e.target.value);
          setOpen(true);
        },
        onFocus: () => setOpen(true),
        onBlur: () => setTimeout(() => setOpen(false), 150),
        onKeyDown: (e) => {
          if (e.key === "Enter" && query.trim()) {
            onChange(query.trim());
            setOpen(false);
          }
        },
        placeholder: "\u{1F50E} \u05D4\u05E7\u05DC\u05D9\u05D3\u05D5 \u05E9\u05DD \u05DE\u05D3\u05D9\u05E0\u05D4...",
        className: "input-field w-full border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      }
    ), open && /* @__PURE__ */ React.createElement("div", { className: "absolute z-20 mt-1 w-full card border rounded-xl shadow-lg max-h-72 overflow-y-auto" }, dbMatches.map((c) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: `db-${c.id}`,
        onMouseDown: () => {
          onChange(c.name_he);
          setQuery(c.name_he);
          setOpen(false);
        },
        className: "w-full text-right px-4 py-2 hoverable text-sm text-primary flex items-center gap-2"
      },
      /* @__PURE__ */ React.createElement("span", null, c.flag),
      " ",
      c.name_he
    )), worldMatches.map((c) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: `world-${c.name_he}`,
        onMouseDown: () => {
          onChange(c.name_he);
          setQuery(c.name_he);
          setOpen(false);
        },
        className: "w-full text-right px-4 py-2 hoverable text-sm text-blue-500 flex items-center gap-2"
      },
      /* @__PURE__ */ React.createElement("span", null, c.flag),
      " ",
      c.name_he,
      /* @__PURE__ */ React.createElement("span", { className: "text-xs mr-auto" }, '\u2728 \u05D9\u05D5\u05E9\u05DC\u05DD \u05E2"\u05D9 AI')
    )), noMatchesAtAll && query.trim() && /* @__PURE__ */ React.createElement(
      "button",
      {
        onMouseDown: () => {
          onChange(query.trim());
          setOpen(false);
        },
        className: "w-full text-right px-4 py-3 hoverable text-sm flex items-center gap-2 text-blue-500 font-medium"
      },
      '\u2728 "',
      query.trim(),
      '" \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D4 \u2014 \u05D4\u05E4\u05E2\u05DC \u05D4\u05E2\u05E8\u05DB\u05EA AI'
    ), !query.trim() && /* @__PURE__ */ React.createElement("div", { className: "px-4 py-3 text-sm text-muted" }, "\u05D4\u05EA\u05D7\u05D9\u05DC\u05D5 \u05DC\u05D4\u05E7\u05DC\u05D9\u05D3 \u05DC\u05D7\u05D9\u05E4\u05D5\u05E9")));
  }
  function KpiCard({ emoji, label, value, sub, accentSolid, tip }) {
    return /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-secondary flex items-center gap-1" }, emoji, " ", label, " ", tip && /* @__PURE__ */ React.createElement(InfoTip, { text: tip }))), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-primary" }, value), sub && /* @__PURE__ */ React.createElement("div", { className: "text-xs text-muted mt-1" }, sub));
  }
  function AiEstimateBadge() {
    return /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", style: { background: "linear-gradient(to left,#f0abfc22,#818cf822)", color: "#818cf8", border: "1px solid #818cf855" } }, "\u2728\u{1F916} \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05D4\u05D5\u05E2\u05E8\u05DB\u05D5 \u05E2\u05DC \u05D9\u05D3\u05D9 AI (Gemini)");
  }
  function AiLoadingState({ name }) {
    return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-20 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-4xl animate-spin" }, "\u{1F504}"), /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-primary" }, '\u{1F50D} "', name, '" \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D4 \u05D1\u05DE\u05D0\u05D2\u05E8 \u05D4\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD'), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-secondary mt-1" }, "\u{1F916} \u05E9\u05D5\u05DC\u05D7 \u05D1\u05E7\u05E9\u05D4 \u05DC-Gemini \u05DC\u05D4\u05E9\u05DC\u05DE\u05EA \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05DE\u05E9\u05D5\u05E2\u05E8\u05D9\u05DD...")));
  }
  function useResolvedCountry(nameHe, countries, allMetrics, years) {
    const [state, setState] = useState({ loading: false, metrics: null, estimated: false, country: null });
    useEffect(() => {
      if (!nameHe || !countries.length) return;
      const country = countries.find((c) => c.name_he === nameHe);
      if (country) {
        const rows = allMetrics.filter((m) => m.country_id === country.id);
        setState({ loading: false, metrics: deriveMetrics(rows, years), estimated: false, country });
        return;
      }
      setState({ loading: true, metrics: null, estimated: false, country: null });
      DataAPI.estimateViaAI(nameHe, nameHe, years).then((result) => {
        const rows = result.rows.map((r) => __spreadValues({}, r));
        setState({
          loading: false,
          metrics: deriveMetrics(rows, years),
          estimated: true,
          country: { id: null, name_he: nameHe, flag: "\u{1F310}", region: "\u{1F310} \u05DE\u05D5\u05E2\u05E8\u05DA \u05E2\u05DC \u05D9\u05D3\u05D9 AI", has_office: false }
        });
      }).catch((err) => {
        console.error(err);
        setState({ loading: false, metrics: null, estimated: false, country: null, error: String(err) });
      });
    }, [nameHe, countries, allMetrics, years]);
    return state;
  }
  function SingleCountryDive({ years, theme, countries, allMetrics }) {
    var _a;
    const [countryName, setCountryName] = useState(((_a = countries[0]) == null ? void 0 : _a.name_he) || "");
    useEffect(() => {
      if (!countryName && countries[0]) setCountryName(countries[0].name_he);
    }, [countries]);
    const { loading, metrics, estimated, country, error } = useResolvedCountry(countryName, countries, allMetrics, years);
    const lineData = useMemo(() => {
      if (!metrics) return null;
      return {
        labels: years,
        datasets: [{
          label: "\u{1F6C2} \u05DE\u05D1\u05E7\u05E8\u05D9\u05DD",
          data: years.map((y) => Math.round(metrics.visitorsByYear[y] || 0)),
          borderColor: theme.solid,
          backgroundColor: hexA(theme.solid, 0.2),
          fill: true,
          tension: 0.3
        }]
      };
    }, [metrics, years, theme]);
    const barData = useMemo(() => {
      if (!metrics) return null;
      return {
        labels: ["\u2764\uFE0F \u05D0\u05D4\u05D3\u05D4", "\u{1F54E} \u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA", "\u{1F4C8} \u05E6\u05DE\u05D9\u05D7\u05D4", "\u{1F3C6} \u05E6\u05D9\u05D5\u05DF \u05DB\u05D5\u05DC\u05DC"],
        datasets: [{
          label: (country == null ? void 0 : country.name_he) || "",
          data: [metrics.sentiment, metrics.religiousAffinity, metrics.growthTrend, metrics.totalScore],
          backgroundColor: theme.solid,
          borderRadius: 6
        }]
      };
    }, [metrics, theme, country]);
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-md" }, /* @__PURE__ */ React.createElement(CountryPicker, { label: "\u{1F30D} \u05D1\u05D7\u05E8 \u05DE\u05D3\u05D9\u05E0\u05D4 \u05DC\u05E0\u05D9\u05EA\u05D5\u05D7 \u05DE\u05E2\u05DE\u05D9\u05E7", value: countryName, onChange: setCountryName, countries })), loading && /* @__PURE__ */ React.createElement(AiLoadingState, { name: countryName }), !loading && error && /* @__PURE__ */ React.createElement("div", { className: "text-center py-16" }, /* @__PURE__ */ React.createElement("p", { className: "text-red-500 font-medium" }, '\u26A0\uFE0F \u05E0\u05DB\u05E9\u05DC\u05D4 \u05D4\u05E9\u05DC\u05DE\u05EA \u05D4\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05E2\u05D1\u05D5\u05E8 "', countryName, '"'), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary mt-2" }, error)), !loading && metrics && country && /* @__PURE__ */ React.createElement("div", { className: "space-y-5", style: { animation: "fadeIn 0.3s ease-in" } }, /* @__PURE__ */ React.createElement(ExportBar, { onExcel: () => exportToExcel(`${country.name_he}-\u05E0\u05D9\u05EA\u05D5\u05D7`, [
      { name: "\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05E9\u05E0\u05EA\u05D9\u05D9\u05DD", rows: years.map((y) => ({ \u05E9\u05E0\u05D4: y, "\u05DB\u05E0\u05D9\u05E1\u05D5\u05EA \u05DC\u05D9\u05E9\u05E8\u05D0\u05DC (\u05D0\u05DC\u05E4\u05D9\u05DD)": (metrics.visitorsByYear[y] || 0) / 1e3 })) },
      { name: "\u05E1\u05D9\u05DB\u05D5\u05DD KPI", rows: [{
        \u05DE\u05D3\u05D9\u05E0\u05D4: country.name_he,
        "\u05E1\u05D4\u05F4\u05DB \u05E0\u05DB\u05E0\u05E1\u05D9\u05DD": metrics.sumVisitors,
        "\u05E0\u05E4\u05D7 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05D9\u05D5\u05E6\u05D0\u05EA": metrics.sumOutbound,
        "\u05D0\u05D4\u05D3\u05D4 \u05E4\u05E8\u05D5-\u05D9\u05E9\u05E8\u05D0\u05DC\u05D9\u05EA": metrics.sentiment,
        "\u05E8\u05D5\u05D5\u05D7\u05D9\u05D5\u05EA %": metrics.roi,
        "\u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA": metrics.religiousAffinity,
        "\u05DE\u05D2\u05DE\u05EA \u05E6\u05DE\u05D9\u05D7\u05D4": metrics.growthTrend,
        "\u05E6\u05D9\u05D5\u05DF \u05DB\u05D5\u05DC\u05DC": metrics.totalScore,
        "\u05EA\u05D5\u05E6\u05E8 \u05DC\u05E0\u05E4\u05E9": metrics.avgGdpPerCapita,
        '\u05DE\u05E8\u05D7\u05E7 \u05DE\u05D9\u05E9\u05E8\u05D0\u05DC (\u05E7"\u05DE)': country.Distance
      }] }
    ]) }), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 flex-wrap" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-primary flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl" }, country.flag || "\u{1F310}"), " ", country.name_he, metrics.hasOffice && /* @__PURE__ */ React.createElement("span", { title: "\u05DC\u05E9\u05DB\u05D4 \u05E4\u05E2\u05D9\u05DC\u05D4", className: "text-lg" }, "\u2B50")), /* @__PURE__ */ React.createElement("span", { className: "text-xs px-2.5 py-1 rounded-full font-medium", style: { background: hexA(theme.solid, 0.12), color: theme.solid } }, country.region), estimated && /* @__PURE__ */ React.createElement(AiEstimateBadge, null)), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F6C2}", label: "\u05E1\u05D4\u05F4\u05DB \u05E0\u05DB\u05E0\u05E1\u05D9\u05DD \u05DC\u05D9\u05E9\u05E8\u05D0\u05DC", value: fmtCompact(metrics.sumVisitors), accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u2708\uFE0F", label: "\u05E0\u05E4\u05D7 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05D9\u05D5\u05E6\u05D0\u05EA \u05DE\u05E6\u05D8\u05D1\u05E8", value: `${fmtNum(metrics.sumOutbound)}M`, accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u2764\uFE0F", label: "\u05D0\u05D4\u05D3\u05D4 \u05E4\u05E8\u05D5-\u05D9\u05E9\u05E8\u05D0\u05DC\u05D9\u05EA", value: `${metrics.sentiment}/100`, tip: "\u05E6\u05D9\u05D5\u05DF \u05DE\u05D7\u05D5\u05E9\u05D1 (\u05DC\u05D0 \u05E1\u05E7\u05E8 \u05D3\u05E2\u05EA \u05E7\u05D4\u05DC \u05D0\u05DE\u05D9\u05EA\u05D9): 60% \u05DE\u05DE\u05D3\u05D3 \u05D7\u05D9\u05E4\u05D5\u05E9 \u05DE\u05E7\u05D5\u05D5\u05DF (online_search_index) + 40% \u05DE\u05DE\u05E6\u05D1 \u05D0\u05D6\u05D4\u05E8\u05EA \u05D4\u05DE\u05E1\u05E2 (\u05EA\u05E7\u05D9\u05DF=100, \u05D0\u05D6\u05D4\u05E8\u05D4=50), \u05D1\u05DE\u05DE\u05D5\u05E6\u05E2 \u05E2\u05DC \u05E4\u05E0\u05D9 \u05D8\u05D5\u05D5\u05D7 \u05D4\u05E9\u05E0\u05D9\u05DD \u05D4\u05E0\u05D1\u05D7\u05E8.", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F4B9}", label: "\u05E8\u05D5\u05D5\u05D7\u05D9\u05D5\u05EA (\u05D9\u05E2\u05D9\u05DC\u05D5\u05EA \u05D4\u05DE\u05E8\u05D4)", value: `${metrics.roi}%`, tip: "\u05D0\u05D7\u05D5\u05D6 \u05DE\u05E1\u05DA \u05D4\u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05D4\u05D9\u05D5\u05E6\u05D0\u05EA \u05E9\u05DC \u05D4\u05DE\u05D3\u05D9\u05E0\u05D4 \u05E9\u05D4\u05D5\u05DE\u05E8 \u05DC\u05DB\u05E0\u05D9\u05E1\u05D5\u05EA \u05D1\u05E4\u05D5\u05E2\u05DC \u05DC\u05D9\u05E9\u05E8\u05D0\u05DC.", accentSolid: theme.solid })), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-2 gap-5" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "\u{1F4C8} \u05DE\u05D2\u05DE\u05EA \u05DB\u05E0\u05D9\u05E1\u05D5\u05EA \u05DC\u05D9\u05E9\u05E8\u05D0\u05DC"), lineData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "line", data: lineData, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } })), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "\u{1F4CA} \u05E4\u05E8\u05D5\u05E4\u05D9\u05DC \u05DE\u05D3\u05D3\u05D9\u05DD"), barData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: barData, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { max: 100 } } } }))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F54E}", label: "\u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA", value: `${metrics.religiousAffinity}/100`, sub: `\u05D0\u05D5\u05DB' \u05D9\u05D4\u05D5\u05D3\u05D9\u05EA: ${fmtCompact(metrics.avgJewishPop)}`, tip: "\u05DE\u05E0\u05D5\u05E8\u05DE\u05DC \u05E2\u05DC \u05E1\u05D5\u05DC\u05DD \u05DC\u05D5\u05D2\u05E8\u05D9\u05EA\u05DE\u05D9 \u05DE\u05D5\u05DC \u05DB\u05DC \u05D4\u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05D1\u05DE\u05D0\u05D2\u05E8.", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F4CA}", label: "\u05DE\u05D3\u05D3 HDI \u05DE\u05DE\u05D5\u05E6\u05E2", value: metrics.avgHdi.toFixed(3), accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F6EB}", label: "\u05D0\u05D9\u05DB\u05D5\u05EA \u05EA\u05E2\u05D5\u05E4\u05D4 (TTDI)", value: metrics.avgAirQuality.toFixed(1), sub: metrics.hasDirectFlights ? "\u2705 \u05D8\u05D9\u05E1\u05D5\u05EA \u05D9\u05E9\u05D9\u05E8\u05D5\u05EA" : "\u274C \u05D0\u05D9\u05DF \u05D8\u05D9\u05E1\u05D5\u05EA \u05D9\u05E9\u05D9\u05E8\u05D5\u05EA", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F3C6}", label: "\u05E6\u05D9\u05D5\u05DF \u05DB\u05D5\u05DC\u05DC", value: `${metrics.totalScore}/100`, sub: metrics.advisoryYears > 0 ? `\u26A0\uFE0F ${metrics.advisoryYears} \u05E9\u05E0\u05D5\u05EA \u05D0\u05D6\u05D4\u05E8\u05D4` : "\u2705 \u05DC\u05DC\u05D0 \u05D0\u05D6\u05D4\u05E8\u05D5\u05EA", tip: "\u05DE\u05DE\u05D5\u05E6\u05E2 \u05DE\u05E9\u05D5\u05E7\u05DC\u05DC: 35% \u05D0\u05D4\u05D3\u05D4, 25% \u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA, 25% \u05E8\u05D5\u05D5\u05D7\u05D9\u05D5\u05EA, 15% \u05DE\u05D2\u05DE\u05EA \u05E6\u05DE\u05D9\u05D7\u05D4.", accentSolid: theme.solid })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F4B5}", label: "\u05EA\u05D5\u05E6\u05E8 \u05DC\u05E0\u05E4\u05E9", value: metrics.avgGdpPerCapita ? `$${fmtNum(metrics.avgGdpPerCapita)}` : "-", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F9F3}", label: "\u05D4\u05D5\u05E6\u05D0\u05D4 \u05DE\u05DE\u05D5\u05E6\u05E2\u05EA \u05DC\u05E0\u05E1\u05D9\u05E2\u05D4", value: metrics.avgExpenditurePerTrip ? `$${fmtNum(metrics.avgExpenditurePerTrip)}` : "-", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u271D\uFE0F", label: "\u05D0\u05D5\u05DB\u05DC\u05D5\u05E1\u05D9\u05D9\u05D4 \u05D0\u05D5\u05D5\u05E0\u05D2\u05DC\u05D9\u05E1\u05D8\u05D9\u05EA", value: fmtCompact(metrics.avgEvangelicalPop), accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F4CD}", label: "\u05DE\u05E8\u05D7\u05E7 \u05DE\u05D9\u05E9\u05E8\u05D0\u05DC", value: country.Distance ? `${fmtNum(country.Distance)} \u05E7"\u05DE` : "-", accentSolid: theme.solid })), /* @__PURE__ */ React.createElement(CouncilAnalysis, { key: country.name_he, country, metrics, theme }), metrics.hasOffice && /* @__PURE__ */ React.createElement(OfficeContributionAnalysis, { key: `office-${country.name_he}`, country, metrics, countries, allMetrics, years, theme }), /* @__PURE__ */ React.createElement(CompetitorAnalysis, { key: `comp-${country.name_he}`, country, theme })));
  }
  const COUNCIL_SECTIONS = [
    { key: "executive_summary", label: "\u05EA\u05E7\u05E6\u05D9\u05E8 \u05DE\u05E0\u05D4\u05DC\u05D9\u05DD", emoji: "\u{1F4CB}" },
    { key: "economic_characteristics", label: "\u05DE\u05D0\u05E4\u05D9\u05D9\u05E0\u05D9\u05DD \u05DB\u05DC\u05DB\u05DC\u05D9\u05D9\u05DD", emoji: "\u{1F4B0}" },
    { key: "religious_affinity", label: "\u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA", emoji: "\u{1F54E}" },
    { key: "sentiment_toward_israel", label: "\u05D0\u05D4\u05D3\u05D4 \u05DC\u05D9\u05E9\u05E8\u05D0\u05DC", emoji: "\u2764\uFE0F" },
    { key: "council_verdict", label: "\u05E0\u05D9\u05EA\u05D5\u05D7 \u05D4\u05DE\u05D5\u05E2\u05E6\u05D4", emoji: "\u{1F3DB}\uFE0F" }
  ];
  function CouncilAnalysis({ country, metrics, theme }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await DataAPI.generateInsight("council_analysis", { name_he: country.name_he, metrics });
        const parsed = JSON.parse(res.text);
        COUNCIL_SECTIONS.forEach((s) => {
          if (parsed[s.key]) parsed[s.key] = sanitizeAiText(parsed[s.key]);
        });
        setData(parsed);
      } catch (err) {
        setError(String(err.message || err));
      }
      setLoading(false);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3 mb-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary text-sm flex items-center gap-2" }, "\u{1F3DB}\uFE0F \u05E0\u05D9\u05EA\u05D5\u05D7 \u05D4\u05DE\u05D5\u05E2\u05E6\u05D4 \u2014 ", country.name_he), /* @__PURE__ */ React.createElement("button", { onClick: run, disabled: loading, className: `px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-l ${theme.grad} disabled:opacity-50` }, loading ? "\u{1F504} \u05D4\u05DE\u05D5\u05E2\u05E6\u05D4 \u05DE\u05EA\u05DB\u05E0\u05E1\u05EA..." : data ? "\u{1F504} \u05D4\u05E8\u05E5 \u05DE\u05D7\u05D3\u05E9" : "\u25B6\uFE0F \u05D1\u05E6\u05E2 \u05E0\u05D9\u05EA\u05D5\u05D7")), error && /* @__PURE__ */ React.createElement("p", { className: "text-red-500 text-sm" }, "\u26A0\uFE0F \u05E9\u05D2\u05D9\u05D0\u05D4: ", error), !data && !loading && !error && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted" }, '\u05DC\u05D7\u05E5 "\u05D1\u05E6\u05E2 \u05E0\u05D9\u05EA\u05D5\u05D7" \u05DB\u05D3\u05D9 \u05DC\u05E7\u05D1\u05DC \u05E0\u05D9\u05EA\u05D5\u05D7 \u05D0\u05E1\u05D8\u05E8\u05D8\u05D2\u05D9 \u05DE\u05E2\u05DE\u05D9\u05E7: \u05EA\u05E7\u05E6\u05D9\u05E8 \u05DE\u05E0\u05D4\u05DC\u05D9\u05DD, \u05DE\u05D0\u05E4\u05D9\u05D9\u05E0\u05D9\u05DD \u05DB\u05DC\u05DB\u05DC\u05D9\u05D9\u05DD, \u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA, \u05D0\u05D4\u05D3\u05D4 \u05DC\u05D9\u05E9\u05E8\u05D0\u05DC, \u05D5\u05E1\u05D9\u05DB\u05D5\u05DD \u05D4"\u05DE\u05D5\u05E2\u05E6\u05D4" \u05E2\u05DD \u05E6\u05D9\u05D5\u05DF \u05DB\u05D5\u05DC\u05DC.'), data && /* @__PURE__ */ React.createElement("div", { className: "space-y-4", style: { animation: "fadeIn 0.3s ease-in" } }, COUNCIL_SECTIONS.map((s) => data[s.key] ? /* @__PURE__ */ React.createElement("div", { key: s.key, className: "border-r-4 pr-4", style: { borderColor: theme.solid } }, /* @__PURE__ */ React.createElement("h5", { className: "font-semibold text-primary text-sm mb-1.5" }, s.emoji, " ", s.label), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-secondary leading-relaxed whitespace-pre-line" }, data[s.key])) : null), data.final_score != null && /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-2 pt-2 border-t divider" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm text-secondary" }, "\u{1F3C6} \u05E6\u05D9\u05D5\u05DF \u05DB\u05D5\u05DC\u05DC:"), /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold", style: { color: theme.solid } }, data.final_score, "/100"))));
  }
  function ComparativeAnalysis({ years, theme, countries, allMetrics }) {
    var _a, _b, _c, _d;
    const [c1, setC1] = useState(((_a = countries[0]) == null ? void 0 : _a.name_he) || "");
    const [c2, setC2] = useState(((_b = countries[1]) == null ? void 0 : _b.name_he) || "");
    useEffect(() => {
      if (!c1 && countries[0]) setC1(countries[0].name_he);
      if (!c2 && countries[1]) setC2(countries[1].name_he);
    }, [countries]);
    const r1 = useResolvedCountry(c1, countries, allMetrics, years);
    const r2 = useResolvedCountry(c2, countries, allMetrics, years);
    const lineData = useMemo(() => {
      if (!r1.metrics || !r2.metrics) return null;
      return {
        labels: years,
        datasets: [
          { label: c1, data: years.map((y) => Math.round(r1.metrics.visitorsByYear[y] || 0)), borderColor: theme.solid, backgroundColor: hexA(theme.solid, 0.15), tension: 0.3 },
          { label: c2, data: years.map((y) => Math.round(r2.metrics.visitorsByYear[y] || 0)), borderColor: "#94a3b8", backgroundColor: "#94a3b822", tension: 0.3 }
        ]
      };
    }, [r1.metrics, r2.metrics, years, c1, c2, theme]);
    const barData = useMemo(() => {
      if (!r1.metrics || !r2.metrics) return null;
      return {
        labels: ["\u2764\uFE0F \u05D0\u05D4\u05D3\u05D4", "\u{1F54E} \u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA", "\u{1F4C8} \u05E6\u05DE\u05D9\u05D7\u05D4", "\u{1F3C6} \u05E6\u05D9\u05D5\u05DF \u05DB\u05D5\u05DC\u05DC"],
        datasets: [
          { label: c1, data: [r1.metrics.sentiment, r1.metrics.religiousAffinity, r1.metrics.growthTrend, r1.metrics.totalScore], backgroundColor: theme.solid },
          { label: c2, data: [r2.metrics.sentiment, r2.metrics.religiousAffinity, r2.metrics.growthTrend, r2.metrics.totalScore], backgroundColor: "#94a3b8" }
        ]
      };
    }, [r1.metrics, r2.metrics, c1, c2, theme]);
    const roiChartData = useMemo(() => {
      if (!r1.metrics || !r2.metrics) return null;
      return {
        labels: [c1, c2],
        datasets: [{ data: [r1.metrics.roi, r2.metrics.roi], backgroundColor: [theme.solid, "#94a3b8"], borderRadius: 6 }]
      };
    }, [r1.metrics, r2.metrics, c1, c2, theme]);
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-2 gap-4 max-w-2xl" }, /* @__PURE__ */ React.createElement(CountryPicker, { label: "\u{1F1E6} \u05DE\u05D3\u05D9\u05E0\u05D4 \u05D0'", value: c1, onChange: setC1, countries, exclude: [c2] }), /* @__PURE__ */ React.createElement(CountryPicker, { label: "\u{1F1E7} \u05DE\u05D3\u05D9\u05E0\u05D4 \u05D1'", value: c2, onChange: setC2, countries, exclude: [c1] })), (r1.loading || r2.loading) && /* @__PURE__ */ React.createElement(AiLoadingState, { name: r1.loading ? c1 : c2 }), !r1.loading && !r2.loading && (r1.error || r2.error) && /* @__PURE__ */ React.createElement("div", { className: "text-center py-16" }, /* @__PURE__ */ React.createElement("p", { className: "text-red-500 font-medium" }, "\u26A0\uFE0F \u05E0\u05DB\u05E9\u05DC\u05D4 \u05D4\u05E9\u05DC\u05DE\u05EA \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary mt-2" }, r1.error || r2.error)), !r1.loading && !r2.loading && r1.metrics && r2.metrics && /* @__PURE__ */ React.createElement("div", { className: "space-y-5", style: { animation: "fadeIn 0.3s ease-in" } }, /* @__PURE__ */ React.createElement(ExportBar, { onExcel: () => exportToExcel(`\u05D4\u05E9\u05D5\u05D5\u05D0\u05D4-${c1}-${c2}`, [
      { name: "\u05DE\u05D2\u05DE\u05EA \u05DE\u05D1\u05E7\u05E8\u05D9\u05DD", rows: years.map((y) => ({ \u05E9\u05E0\u05D4: y, [c1]: Math.round(r1.metrics.visitorsByYear[y] || 0), [c2]: Math.round(r2.metrics.visitorsByYear[y] || 0) })) },
      { name: "\u05D4\u05E9\u05D5\u05D5\u05D0\u05EA \u05DE\u05D3\u05D3\u05D9\u05DD", rows: [
        { \u05DE\u05D3\u05D3: "\u05D0\u05D4\u05D3\u05D4", [c1]: r1.metrics.sentiment, [c2]: r2.metrics.sentiment },
        { \u05DE\u05D3\u05D3: "\u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA", [c1]: r1.metrics.religiousAffinity, [c2]: r2.metrics.religiousAffinity },
        { \u05DE\u05D3\u05D3: "\u05E8\u05D5\u05D5\u05D7\u05D9\u05D5\u05EA %", [c1]: r1.metrics.roi, [c2]: r2.metrics.roi },
        { \u05DE\u05D3\u05D3: "\u05E6\u05DE\u05D9\u05D7\u05D4", [c1]: r1.metrics.growthTrend, [c2]: r2.metrics.growthTrend },
        { \u05DE\u05D3\u05D3: "\u05E6\u05D9\u05D5\u05DF \u05DB\u05D5\u05DC\u05DC", [c1]: r1.metrics.totalScore, [c2]: r2.metrics.totalScore }
      ] }
    ]) }), /* @__PURE__ */ React.createElement("div", { className: "flex gap-6 flex-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl" }, (_c = r1.country) == null ? void 0 : _c.flag), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-primary" }, c1), r1.estimated && /* @__PURE__ */ React.createElement(AiEstimateBadge, null)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl" }, (_d = r2.country) == null ? void 0 : _d.flag), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-primary" }, c2), r2.estimated && /* @__PURE__ */ React.createElement(AiEstimateBadge, null))), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "\u{1F4C8} \u05D4\u05E9\u05D5\u05D5\u05D0\u05EA \u05DE\u05D2\u05DE\u05EA \u05DE\u05D1\u05E7\u05E8\u05D9\u05DD"), lineData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "line", data: lineData, options: { responsive: true, maintainAspectRatio: false } })), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-2 gap-5" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "\u2696\uFE0F \u05D4\u05E9\u05D5\u05D5\u05D0\u05EA \u05DE\u05D3\u05D3\u05D9\u05DD \u05DE\u05E8\u05DB\u05D6\u05D9\u05D9\u05DD (\u05E1\u05D5\u05DC\u05DD 0-100)"), barData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: barData, options: { responsive: true, maintainAspectRatio: false } })), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm flex items-center gap-1.5" }, "\u{1F4B9} \u05D4\u05E9\u05D5\u05D5\u05D0\u05EA \u05E8\u05D5\u05D5\u05D7\u05D9\u05D5\u05EA (%)", /* @__PURE__ */ React.createElement(InfoTip, { text: "\u05DE\u05D5\u05E6\u05D2 \u05D1\u05D2\u05E8\u05E3 \u05E0\u05E4\u05E8\u05D3 \u05DB\u05D9 \u05E1\u05D5\u05DC\u05DD \u05D4\u05E2\u05E8\u05DB\u05D9\u05DD \u05E9\u05DC\u05D5 \u05E7\u05D8\u05DF \u05DE\u05E9\u05DE\u05E2\u05D5\u05EA\u05D9\u05EA \u05DE\u05E9\u05D0\u05E8 \u05D4\u05DE\u05D3\u05D3\u05D9\u05DD (\u05D1\u05D3\u05E8\u05DA \u05DB\u05DC\u05DC \u05E4\u05D7\u05D5\u05EA \u05DE-1-2%)." })), roiChartData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: roiChartData, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } })))));
  }
  function RankingAnalysis({ years, theme, countries, allMetrics }) {
    const [selected, setSelected] = useState(countries.slice(0, 5).map((c) => c.name_he));
    const [param, setParam] = useState("totalScore");
    const [pending, setPending] = useState("");
    const [pendingOpen, setPendingOpen] = useState(false);
    const [resultsMap, setResultsMap] = useState({});
    useEffect(() => {
      if (selected.length === 0 && countries.length) setSelected(countries.slice(0, 5).map((c) => c.name_he));
    }, [countries]);
    useEffect(() => {
      selected.forEach((name) => {
        if (resultsMap[name]) return;
        const country = countries.find((c) => c.name_he === name);
        if (country) {
          const rows = allMetrics.filter((m) => m.country_id === country.id);
          setResultsMap((prev) => __spreadProps(__spreadValues({}, prev), { [name]: { metrics: deriveMetrics(rows, years), estimated: false, country } }));
        } else {
          setResultsMap((prev) => __spreadProps(__spreadValues({}, prev), { [name]: { loading: true } }));
          DataAPI.estimateViaAI(name, name, years).then((result) => {
            setResultsMap((prev) => __spreadProps(__spreadValues({}, prev), {
              [name]: { metrics: deriveMetrics(result.rows, years), estimated: true, country: { flag: "\u{1F310}", name_he: name } }
            }));
          }).catch((err) => {
            console.error("AI estimate failed for", name, err);
            setResultsMap((prev) => __spreadProps(__spreadValues({}, prev), { [name]: { error: String(err.message || err) } }));
          });
        }
      });
    }, [selected, countries, allMetrics, years]);
    const addCountry = (name) => {
      if (!name || selected.includes(name) || selected.length >= 10) return;
      setSelected((s) => [...s, name]);
      setPending("");
      setPendingOpen(false);
    };
    const removeCountry = (name) => {
      setSelected((s) => s.filter((n) => n !== name));
      setResultsMap((prev) => {
        const next = __spreadValues({}, prev);
        delete next[name];
        return next;
      });
    };
    const withMetrics = useMemo(() => countries.map((c) => {
      const rows = allMetrics.filter((m) => m.country_id === c.id);
      const metrics = deriveMetrics(rows, years);
      return metrics ? { country: c, metrics } : null;
    }).filter(Boolean), [countries, allMetrics, years]);
    const regionsAvailable = useMemo(() => {
      const set = new Set(countries.map((c) => c.region).filter(Boolean));
      return Array.from(set);
    }, [countries]);
    const applyFilter = (names) => setSelected(names.slice(0, 10));
    const filterByRegion = (region) => applyFilter(countries.filter((c) => c.region === region).map((c) => c.name_he));
    const filterPremium = () => {
      const hdiVals = withMetrics.map((e) => e.metrics.avgHdi).sort((a, b) => a - b);
      const median = hdiVals[Math.floor(hdiVals.length / 2)] || 0;
      applyFilter(withMetrics.filter((e) => e.metrics.avgHdi >= median).map((e) => e.country.name_he));
    };
    const filterEmerging = () => {
      const hdiVals = withMetrics.map((e) => e.metrics.avgHdi).sort((a, b) => a - b);
      const median = hdiVals[Math.floor(hdiVals.length / 2)] || 0;
      applyFilter(withMetrics.filter((e) => e.metrics.avgHdi < median).map((e) => e.country.name_he));
    };
    const filterReligious = () => {
      const sorted = [...withMetrics].sort((a, b) => b.metrics.religiousAffinity - a.metrics.religiousAffinity);
      applyFilter(sorted.slice(0, Math.max(3, Math.ceil(sorted.length / 3))).map((e) => e.country.name_he));
    };
    const filterWithOffice = () => applyFilter(withMetrics.filter((e) => e.metrics.hasOffice).map((e) => e.country.name_he));
    const dbSuggestions = countries.filter((c) => !selected.includes(c.name_he) && c.name_he.includes(pending.trim()));
    const dbNamesSet = new Set(countries.map((c) => c.name_he));
    const worldSuggestions = pending.trim() ? WORLD_COUNTRIES_HE.filter((c) => c.name_he.includes(pending.trim()) && !dbNamesSet.has(c.name_he) && !selected.includes(c.name_he)).filter((c, i, arr) => arr.findIndex((x) => x.name_he === c.name_he) === i) : [];
    const ranked = selected.map((name) => resultsMap[name] ? __spreadValues({ name }, resultsMap[name]) : null).filter((r) => r && r.metrics).sort((a, b) => b.metrics[param] - a.metrics[param]);
    const errored = selected.filter((name) => {
      var _a;
      return (_a = resultsMap[name]) == null ? void 0 : _a.error;
    });
    const stillLoading = selected.filter((name) => {
      var _a;
      return (_a = resultsMap[name]) == null ? void 0 : _a.loading;
    });
    const maxVal = Math.max(...ranked.map((r) => r.metrics[param]), 1);
    const paramMeta = RANK_PARAMS.find((p) => p.key === param);
    const medals = ["\u{1F947}", "\u{1F948}", "\u{1F949}"];
    const readyToShow = selected.length >= 3 && ranked.length > 0;
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-2" }, "\u{1F9ED} \u05D1\u05D7\u05D9\u05E8\u05D4 \u05DE\u05D4\u05D9\u05E8\u05D4 \u05DC\u05E4\u05D9 \u05E1\u05D9\u05E0\u05D5\u05DF"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, regionsAvailable.map((r) => {
      var _a;
      return /* @__PURE__ */ React.createElement("button", { key: r, onClick: () => filterByRegion(r), className: "text-xs px-3 py-1.5 rounded-full border text-secondary hoverable", style: { borderColor: "var(--card-border)" } }, "\u{1F30D} ", ((_a = REGION_OPTIONS.find((o) => o.value === r)) == null ? void 0 : _a.label) || r);
    }), /* @__PURE__ */ React.createElement("button", { onClick: filterPremium, className: "text-xs px-3 py-1.5 rounded-full border text-secondary hoverable", style: { borderColor: "var(--card-border)" } }, "\u{1F3C6} \u05E9\u05D5\u05D5\u05E7\u05D9 \u05E4\u05E8\u05D9\u05DE\u05D9\u05D5\u05DD (HDI \u05D2\u05D1\u05D5\u05D4)"), /* @__PURE__ */ React.createElement("button", { onClick: filterEmerging, className: "text-xs px-3 py-1.5 rounded-full border text-secondary hoverable", style: { borderColor: "var(--card-border)" } }, "\u{1F331} \u05E9\u05D5\u05D5\u05E7\u05D9\u05DD \u05DE\u05EA\u05E4\u05EA\u05D7\u05D9\u05DD"), /* @__PURE__ */ React.createElement("button", { onClick: filterReligious, className: "text-xs px-3 py-1.5 rounded-full border text-secondary hoverable", style: { borderColor: "var(--card-border)" } }, "\u{1F54E} \u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA \u05D2\u05D1\u05D5\u05D4\u05D4"), /* @__PURE__ */ React.createElement("button", { onClick: filterWithOffice, className: "text-xs px-3 py-1.5 rounded-full border text-secondary hoverable", style: { borderColor: "var(--card-border)" } }, "\u2B50 \u05E2\u05DD \u05DC\u05E9\u05DB\u05D4 \u05E4\u05E2\u05D9\u05DC\u05D4")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mt-2" }, "\u05DC\u05D7\u05D9\u05E6\u05D4 \u05DE\u05D7\u05DC\u05D9\u05E4\u05D4 \u05D0\u05EA \u05D4\u05D1\u05D7\u05D9\u05E8\u05D4 \u05D4\u05E0\u05D5\u05DB\u05D7\u05D9\u05EA \u05D1\u05E8\u05E9\u05D9\u05DE\u05EA \u05D4\u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05DC\u05E1\u05D9\u05E0\u05D5\u05DF (\u05E2\u05D3 10).")), /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-2 gap-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1.5" }, "\u{1F30D} \u05D1\u05D7\u05E8 \u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05DC\u05D3\u05D9\u05E8\u05D5\u05D2 (3-10)"), /* @__PURE__ */ React.createElement("div", { className: "relative mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: pending,
        onChange: (e) => {
          setPending(e.target.value);
          setPendingOpen(true);
        },
        onFocus: () => setPendingOpen(true),
        onBlur: () => setTimeout(() => setPendingOpen(false), 150),
        onKeyDown: (e) => e.key === "Enter" && addCountry(pending.trim()),
        placeholder: "\u05D4\u05E7\u05DC\u05D3 \u05E9\u05DD \u05DE\u05D3\u05D9\u05E0\u05D4...",
        className: "input-field flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      }
    ), /* @__PURE__ */ React.createElement("button", { onClick: () => addCountry(pending.trim()), disabled: selected.length >= 10, className: "px-3 py-2 rounded-xl bg-blue-700 text-white disabled:opacity-40" }, "\u2795")), pendingOpen && pending.trim() && (dbSuggestions.length > 0 || worldSuggestions.length > 0) && /* @__PURE__ */ React.createElement("div", { className: "absolute z-20 mt-1 w-full card border rounded-xl shadow-lg max-h-56 overflow-y-auto" }, dbSuggestions.map((c) => /* @__PURE__ */ React.createElement("button", { key: `db-${c.id}`, onMouseDown: () => addCountry(c.name_he), className: "w-full text-right px-4 py-2 hoverable text-sm text-primary flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, c.flag), " ", c.name_he)), worldSuggestions.map((c) => /* @__PURE__ */ React.createElement("button", { key: `world-${c.name_he}`, onMouseDown: () => addCountry(c.name_he), className: "w-full text-right px-4 py-2 hoverable text-sm text-blue-500 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, c.flag), " ", c.name_he, " ", /* @__PURE__ */ React.createElement("span", { className: "text-xs mr-auto" }, '\u2728 \u05D9\u05D5\u05E9\u05DC\u05DD \u05E2"\u05D9 AI'))))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, selected.map((n) => {
      var _a, _b, _c;
      return /* @__PURE__ */ React.createElement("span", { key: n, className: "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", style: { background: hexA(theme.solid, 0.12), color: theme.solid } }, n, " ", ((_a = resultsMap[n]) == null ? void 0 : _a.loading) && "\u23F3", " ", ((_b = resultsMap[n]) == null ? void 0 : _b.error) && "\u26A0\uFE0F", " ", ((_c = resultsMap[n]) == null ? void 0 : _c.estimated) && "\u2728", " ", /* @__PURE__ */ React.createElement("button", { onClick: () => removeCountry(n), className: "hover:opacity-60" }, "\u2715"));
    })), selected.length < 3 && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-amber-500 mt-2" }, "\u26A0\uFE0F \u05D9\u05E9 \u05DC\u05D1\u05D7\u05D5\u05E8 \u05DC\u05E4\u05D7\u05D5\u05EA 3 \u05DE\u05D3\u05D9\u05E0\u05D5\u05EA"), errored.length > 0 && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-red-500 mt-2" }, "\u26A0\uFE0F \u05E0\u05DB\u05E9\u05DC\u05D4 \u05D4\u05E9\u05DC\u05DE\u05EA AI \u05E2\u05D1\u05D5\u05E8: ", errored.join(", "), " \u2014 ", resultsMap[errored[0]].error)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1.5" }, "\u{1F3AF} \u05E4\u05E8\u05DE\u05D8\u05E8 \u05DC\u05D3\u05D9\u05E8\u05D5\u05D2"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, RANK_PARAMS.map((p) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: p.key,
        onClick: () => setParam(p.key),
        className: `px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition ${param === p.key ? `border-transparent bg-gradient-to-l ${theme.grad} text-white shadow-md` : "text-secondary"}`,
        style: param !== p.key ? { borderColor: "var(--card-border)" } : {}
      },
      p.label
    ))))), stillLoading.length > 0 && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-secondary" }, "\u{1F504} \u05DE\u05E9\u05DC\u05D9\u05DD \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05E2\u05D1\u05D5\u05E8: ", stillLoading.join(", "), "..."), readyToShow && /* @__PURE__ */ React.createElement("div", { className: "space-y-5", style: { animation: "fadeIn 0.3s ease-in" } }, /* @__PURE__ */ React.createElement(ExportBar, { onExcel: () => exportToExcel(`\u05D3\u05D9\u05E8\u05D5\u05D2-${(paramMeta == null ? void 0 : paramMeta.label) || param}`, [
      { name: "\u05D3\u05D9\u05E8\u05D5\u05D2", rows: ranked.map((r, i) => ({
        \u05DE\u05E7\u05D5\u05DD: i + 1,
        \u05DE\u05D3\u05D9\u05E0\u05D4: r.name,
        "\u05D0\u05D4\u05D3\u05D4": r.metrics.sentiment,
        "\u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA": r.metrics.religiousAffinity,
        "\u05E8\u05D5\u05D5\u05D7\u05D9\u05D5\u05EA %": r.metrics.roi,
        "\u05E6\u05DE\u05D9\u05D7\u05D4": r.metrics.growthTrend,
        "\u05E6\u05D9\u05D5\u05DF \u05DB\u05D5\u05DC\u05DC": r.metrics.totalScore,
        "\u05DE\u05D5\u05E2\u05E8\u05DA AI": r.estimated ? "\u05DB\u05DF" : "\u05DC\u05D0"
      })) }
    ]) }), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-4 text-sm" }, "\u{1F3C6} \u05D3\u05D9\u05E8\u05D5\u05D2 \u05DC\u05E4\u05D9 ", paramMeta == null ? void 0 : paramMeta.label), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, ranked.map((r, i) => /* @__PURE__ */ React.createElement("div", { key: r.name, className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-7 text-center" }, i < 3 ? medals[i] : /* @__PURE__ */ React.createElement("span", { className: "text-xs text-secondary" }, i + 1)), /* @__PURE__ */ React.createElement("div", { className: "w-32 shrink-0 text-sm font-medium text-primary truncate" }, r.name, " ", r.estimated && "\u2728"), /* @__PURE__ */ React.createElement("div", { className: "flex-1 rounded-full h-6 relative overflow-hidden", style: { background: "var(--hover-bg)" } }, /* @__PURE__ */ React.createElement("div", { className: "h-full rounded-full flex items-center justify-end px-2", style: { width: `${Math.max(4, r.metrics[param] / maxVal * 100)}%`, background: theme.solid } }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-white" }, r.metrics[param].toFixed(1))))))), ranked.some((r) => r.estimated) && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mt-3 flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", null, "\u2728"), " \u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05D4\u05DE\u05E1\u05D5\u05DE\u05E0\u05D5\u05EA \u05D4\u05D5\u05E9\u05DC\u05DE\u05D5 \u05E2\u05DC \u05D9\u05D3\u05D9 AI (\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D5 \u05D1\u05DE\u05D0\u05D2\u05E8 \u05D4\u05DE\u05E7\u05D5\u05E8\u05D9)"))), /* @__PURE__ */ React.createElement(RegressionAnalysis, { years, theme, allMetrics, countries }));
  }
  function RegressionAnalysis({ years, theme, allMetrics, countries }) {
    const [selectedIds, setSelectedIds] = useState(() => countries.map((c) => c.id));
    useEffect(() => {
      setSelectedIds((prev) => prev.length ? prev : countries.map((c) => c.id));
    }, [countries]);
    const toggleCountry = (id) => {
      setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };
    const selectAll = () => setSelectedIds(countries.map((c) => c.id));
    const selectNone = () => setSelectedIds([]);
    const filteredMetrics = useMemo(
      () => allMetrics.filter((m) => selectedIds.includes(m.country_id)).map((m) => {
        var _a, _b;
        return __spreadProps(__spreadValues({}, m), { distance: (_b = (_a = countries.find((c) => c.id === m.country_id)) == null ? void 0 : _a.Distance) != null ? _b : null });
      }),
      [allMetrics, selectedIds, countries]
    );
    const result = useMemo(() => runRegression(filteredMetrics, years), [filteredMetrics, years]);
    const [explanation, setExplanation] = useState(null);
    const [loadingExplain, setLoadingExplain] = useState(false);
    const [explainError, setExplainError] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const [showAudit, setShowAudit] = useState(false);
    const auditRows = useMemo(() => {
      const rows = getValidRegressionRows(filteredMetrics, years);
      return rows.map((r) => {
        var _a;
        return __spreadProps(__spreadValues({}, r), { countryName: ((_a = countries.find((c) => c.id === r.country_id)) == null ? void 0 : _a.name_he) || "?" });
      }).sort((a, b) => a.countryName.localeCompare(b.countryName) || a.year - b.year);
    }, [filteredMetrics, years, countries]);
    const chartData = useMemo(() => {
      if (!result) return null;
      return {
        labels: result.influence.map((f) => f.label),
        datasets: [{
          label: "\u05D4\u05E9\u05E4\u05E2\u05D4 (%)",
          data: result.influence.map((f) => f.influencePct),
          backgroundColor: result.influence.map((f) => f.direction === "positive" ? theme.solid : "#ef4444"),
          borderRadius: 6
        }]
      };
    }, [result, theme]);
    const runAnalysis = async () => {
      if (!result) return;
      setLoadingExplain(true);
      setExplainError(null);
      setExplanation(null);
      try {
        const res = await DataAPI.generateInsight("regression_explain", {
          r2: result.r2,
          n: result.n,
          influence: result.influence
        });
        setExplanation(sanitizeAiText(res.text));
      } catch (err) {
        setExplainError(String(err.message || err));
      }
      setLoadingExplain(false);
    };
    const selectedCountries = countries.filter((c) => selectedIds.includes(c.id));
    return /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary text-sm flex items-center gap-2" }, "\u{1F9EE} \u05E0\u05D9\u05EA\u05D5\u05D7 \u05E8\u05D2\u05E8\u05E1\u05D9\u05D4 \u2014 \u05D0\u05D9\u05DC\u05D5 \u05E4\u05E8\u05DE\u05D8\u05E8\u05D9\u05DD \u05DE\u05E9\u05E4\u05D9\u05E2\u05D9\u05DD \u05E2\u05DC \u05DB\u05E0\u05D9\u05E1\u05D5\u05EA \u05EA\u05D9\u05D9\u05E8\u05D9\u05DD"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowPicker((s) => !s), className: "text-xs px-3 py-1.5 rounded-lg border text-secondary", style: { borderColor: "var(--card-border)" } }, showPicker ? "\u05E1\u05D2\u05D5\u05E8 \u05D1\u05D7\u05D9\u05E8\u05EA \u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u25B2" : "\u{1F30D} \u05D1\u05D7\u05E8 \u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05DC\u05E8\u05D2\u05E8\u05E1\u05D9\u05D4 \u25BC")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted" }, "\u05D4\u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05D4\u05E0\u05DB\u05DC\u05DC\u05D5\u05EA \u05D1\u05D7\u05D9\u05E9\u05D5\u05D1 (", selectedCountries.length, " \u05DE\u05EA\u05D5\u05DA ", countries.length, "): ", selectedCountries.map((c) => `${c.flag || ""} ${c.name_he}`).join(", ") || "\u05D0\u05D9\u05DF \u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05E0\u05D1\u05D7\u05E8\u05D5\u05EA"), showPicker && /* @__PURE__ */ React.createElement("div", { className: "border rounded-xl p-3 divider", style: { maxHeight: 220, overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 mb-2" }, /* @__PURE__ */ React.createElement("button", { onClick: selectAll, className: "text-xs text-blue-500" }, "\u05D1\u05D7\u05E8 \u05D4\u05DB\u05DC"), /* @__PURE__ */ React.createElement("button", { onClick: selectNone, className: "text-xs text-secondary" }, "\u05E0\u05E7\u05D4 \u05D4\u05DB\u05DC")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-1.5" }, countries.map((c) => /* @__PURE__ */ React.createElement("label", { key: c.id, className: "flex items-center gap-1.5 text-xs text-secondary" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: selectedIds.includes(c.id), onChange: () => toggleCountry(c.id) }), c.flag, " ", c.name_he)))), !result ? /* @__PURE__ */ React.createElement("div", { className: "text-center py-10 text-secondary text-sm" }, "\u26A0\uFE0F \u05D0\u05D9\u05DF \u05DE\u05E1\u05E4\u05D9\u05E7 \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05DE\u05DC\u05D0\u05D9\u05DD (\u05E0\u05D3\u05E8\u05E9\u05D5\u05EA \u05DC\u05E4\u05D7\u05D5\u05EA ", REGRESSION_FIELDS.length + 2, " \u05E9\u05D5\u05E8\u05D5\u05EA \u05EA\u05E7\u05D9\u05E0\u05D5\u05EA) \u05E2\u05D1\u05D5\u05E8 \u05D4\u05DE\u05D3\u05D9\u05E0\u05D5\u05EA/\u05D4\u05E9\u05E0\u05D9\u05DD \u05D4\u05E0\u05D1\u05D7\u05E8\u05D5\u05EA.") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-2" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setShowAudit((s) => !s), className: "text-xs px-3 py-1.5 rounded-lg border text-secondary", style: { borderColor: "var(--card-border)" } }, showAudit ? "\u05D4\u05E1\u05EA\u05E8 \u05E0\u05EA\u05D5\u05E0\u05D9 \u05D2\u05DC\u05DD \u25B2" : "\u{1F50D} \u05D4\u05E6\u05D2 \u05E0\u05EA\u05D5\u05E0\u05D9 \u05D2\u05DC\u05DD \u05E9\u05E9\u05D9\u05DE\u05E9\u05D5 \u05DC\u05D7\u05D9\u05E9\u05D5\u05D1 \u25BC"), /* @__PURE__ */ React.createElement("span", { className: "text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1", style: { background: hexA(theme.solid, 0.12), color: theme.solid } }, "R\xB2 = ", result.r2, " \xB7 ", result.n, " \u05EA\u05E6\u05E4\u05D9\u05D5\u05EA", /* @__PURE__ */ React.createElement(InfoTip, { text: `R\xB2 (\u05DE\u05E7\u05D3\u05DD \u05D4\u05DE\u05EA\u05D0\u05DD) \u05DE\u05D5\u05D3\u05D3 \u05DB\u05DE\u05D4 \u05D8\u05D5\u05D1 \u05D4\u05DE\u05D5\u05D3\u05DC \u05DE\u05E1\u05D1\u05D9\u05E8 \u05D0\u05EA \u05D4\u05E9\u05D5\u05E0\u05D5\u05EA \u05D1\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD, \u05D1\u05E1\u05D5\u05DC\u05DD 0-1. \u05DB\u05DB\u05DC\u05DC \u05D0\u05E6\u05D1\u05E2: \u05DE\u05E2\u05DC 0.7 = \u05D4\u05E1\u05D1\u05E8 \u05D7\u05D6\u05E7, 0.4-0.7 = \u05D1\u05D9\u05E0\u05D5\u05E0\u05D9, \u05DE\u05EA\u05D7\u05EA \u05DC-0.4 = \u05D7\u05DC\u05E9 (\u05D9\u05E9 \u05D2\u05D5\u05E8\u05DE\u05D9\u05DD \u05E0\u05D5\u05E1\u05E4\u05D9\u05DD \u05DE\u05E9\u05DE\u05E2\u05D5\u05EA\u05D9\u05D9\u05DD \u05E9\u05DC\u05D0 \u05E0\u05DB\u05DC\u05DC\u05D5 \u05D1\u05DE\u05D5\u05D3\u05DC). R\xB2 \u05D2\u05D1\u05D5\u05D4 \u05DC\u05D0 \u05DE\u05D5\u05DB\u05D9\u05D7 \u05E1\u05D9\u05D1\u05EA\u05D9\u05D5\u05EA, \u05E8\u05E7 \u05E7\u05D5\u05E8\u05DC\u05E6\u05D9\u05D4.` }))), showAudit && /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto rounded-lg border divider", style: { maxHeight: 260, overflowY: "auto" } }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-xs" }, /* @__PURE__ */ React.createElement("thead", { className: "text-secondary sticky top-0", style: { background: "var(--hover-bg)" } }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "\u05DE\u05D3\u05D9\u05E0\u05D4"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "\u05E9\u05E0\u05D4"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "HDI"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "\u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05D9\u05D5\u05E6\u05D0\u05EA"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "\u05D7\u05D9\u05E4\u05D5\u05E9"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "\u05D0\u05D9\u05DB\u05D5\u05EA \u05EA\u05E2\u05D5\u05E4\u05D4"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "\u05D0\u05D5\u05DB' \u05D9\u05D4\u05D5\u05D3\u05D9\u05EA"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "\u05D8\u05D9\u05E1\u05D5\u05EA \u05D9\u05E9\u05D9\u05E8\u05D5\u05EA"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "\u05D0\u05D6\u05D4\u05E8\u05EA \u05DE\u05E1\u05E2"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "\u05DB\u05E0\u05D9\u05E1\u05D5\u05EA \u05DC\u05D9\u05E9\u05E8\u05D0\u05DC (\u05D0\u05DC\u05E4\u05D9\u05DD)"))), /* @__PURE__ */ React.createElement("tbody", null, auditRows.map((r, i) => /* @__PURE__ */ React.createElement("tr", { key: i, className: "border-t divider" }, /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-primary" }, r.countryName), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, r.year), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, r.hdi), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, r.outbound_tourism_millions), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, r.online_search_index), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, r.air_transport_quality), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, r.jewish_population), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, r.has_direct_flights ? "\u05DB\u05DF" : "\u05DC\u05D0"), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, r.travel_advisory === 1 ? "\u05EA\u05E7\u05D9\u05DF" : "\u05D0\u05D6\u05D4\u05E8\u05D4"), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, r.entries_to_israel_thousands))))), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted p-2" }, "\u{1F4A1} \u05D1\u05D3\u05D9\u05E7\u05D4 \u05E2\u05E6\u05DE\u05D0\u05D9\u05EA: \u05D0\u05E4\u05E9\u05E8 \u05DC\u05D4\u05E2\u05EA\u05D9\u05E7 \u05D0\u05EA \u05D4\u05D8\u05D1\u05DC\u05D4 \u05D4\u05D6\u05D5 \u05DC\u05D0\u05E7\u05E1\u05DC \u05D5\u05DC\u05D4\u05E8\u05D9\u05E5 \u05E8\u05D2\u05E8\u05E1\u05D9\u05D4 \u05DE\u05E7\u05D1\u05D9\u05DC\u05D4 (\u05DC\u05DE\u05E9\u05DC \u05E2\u05DD \u05DB\u05DC\u05D9 \u05D4\u05E8\u05D2\u05E8\u05E1\u05D9\u05D4 \u05D4\u05DE\u05D5\u05D1\u05E0\u05D4 \u05E9\u05DC \u05D0\u05E7\u05E1\u05DC/Google Sheets) \u05DB\u05D3\u05D9 \u05DC\u05D5\u05D5\u05D3\u05D0 \u05E9\u05D4\u05EA\u05D5\u05E6\u05D0\u05D5\u05EA \u05EA\u05D5\u05D0\u05DE\u05D5\u05EA.")), chartData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: chartData, options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }, height: 220 }), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 text-xs text-secondary" }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 3, background: theme.solid, display: "inline-block" } }), " \u05D4\u05E9\u05E4\u05E2\u05D4 \u05D7\u05D9\u05D5\u05D1\u05D9\u05EA \u2014 \u05DB\u05DB\u05DC \u05E9\u05D4\u05E2\u05E8\u05DA \u05D2\u05D1\u05D5\u05D4 \u05D9\u05D5\u05EA\u05E8, \u05DB\u05DA \u05E6\u05E4\u05D5\u05D9\u05D9\u05DD \u05D9\u05D5\u05EA\u05E8 \u05EA\u05D9\u05D9\u05E8\u05D9\u05DD"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 3, background: "#ef4444", display: "inline-block" } }), " \u05D4\u05E9\u05E4\u05E2\u05D4 \u05E9\u05DC\u05D9\u05DC\u05D9\u05EA \u2014 \u05DB\u05DB\u05DC \u05E9\u05D4\u05E2\u05E8\u05DA \u05D2\u05D1\u05D5\u05D4 \u05D9\u05D5\u05EA\u05E8, \u05DB\u05DA \u05E6\u05E4\u05D5\u05D9\u05D9\u05DD \u05E4\u05D7\u05D5\u05EA \u05EA\u05D9\u05D9\u05E8\u05D9\u05DD")), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, result.influence.map((f) => /* @__PURE__ */ React.createElement("div", { key: f.key, className: "flex items-center justify-between text-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-secondary" }, f.direction === "positive" ? "\u{1F4C8}" : "\u{1F4C9}", " ", f.label), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-primary" }, f.influencePct, "%")))), /* @__PURE__ */ React.createElement("div", { className: "border-t divider pt-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3 mb-3" }, /* @__PURE__ */ React.createElement("h5", { className: "font-semibold text-primary text-sm" }, "\u{1F4AC} \u05D4\u05E1\u05D1\u05E8 \u05D1\u05E9\u05E4\u05D4 \u05E4\u05E9\u05D5\u05D8\u05D4"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: runAnalysis,
        disabled: loadingExplain,
        className: `px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-l ${theme.grad} disabled:opacity-50`
      },
      loadingExplain ? "\u{1F504} \u05DE\u05E0\u05EA\u05D7..." : "\u25B6\uFE0F \u05D1\u05E6\u05E2 \u05E0\u05D9\u05EA\u05D5\u05D7"
    )), explainError && /* @__PURE__ */ React.createElement("p", { className: "text-red-500 text-sm" }, "\u26A0\uFE0F \u05E9\u05D2\u05D9\u05D0\u05D4: ", explainError), explanation && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-primary leading-relaxed whitespace-pre-line", style: { animation: "fadeIn 0.3s ease-in" } }, explanation), !explanation && !loadingExplain && !explainError && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted" }, '\u05DC\u05D7\u05E5 "\u05D1\u05E6\u05E2 \u05E0\u05D9\u05EA\u05D5\u05D7" \u05DB\u05D3\u05D9 \u05DC\u05E7\u05D1\u05DC \u05D4\u05E1\u05D1\u05E8 \u05DE\u05E0\u05D5\u05E1\u05D7 \u05DE-AI \u05E2\u05DC \u05D4\u05DE\u05E9\u05DE\u05E2\u05D5\u05EA \u05E9\u05DC \u05D4\u05EA\u05D5\u05E6\u05D0\u05D5\u05EA.'))));
  }
  function findComparableCountries(targetCountry, targetMetrics, countries, allMetrics, years, n = 3) {
    const candidates = countries.map((c) => {
      const rows = allMetrics.filter((m) => m.country_id === c.id);
      const metrics = deriveMetrics(rows, years);
      if (!metrics) return null;
      return { country: c, metrics };
    }).filter(Boolean);
    const pool = candidates.filter((c) => c.country.id !== targetCountry.id);
    const targetEntry = { country: targetCountry, metrics: targetMetrics };
    const all = [...pool, targetEntry];
    const dims = [
      { get: (e) => e.metrics.avgHdi },
      { get: (e) => e.metrics.avgGdpPerCapita || 0 },
      { get: (e) => e.metrics.sumOutbound / years.length },
      // avg per year, so range length doesn't skew it
      { get: (e) => e.country.Distance || 0 }
    ];
    const stats = dims.map((d) => {
      const vals = all.map(d.get);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
      return { mean, std: Math.sqrt(variance) || 1 };
    });
    const zVector = (e) => dims.map((d, i) => (d.get(e) - stats[i].mean) / stats[i].std);
    const targetZ = zVector(targetEntry);
    const scored = pool.filter((e) => !e.metrics.hasOffice).map((e) => {
      const z = zVector(e);
      const dist = Math.sqrt(z.reduce((s, v, i) => s + (v - targetZ[i]) ** 2, 0));
      return { country: e.country, metrics: e.metrics, dist };
    });
    scored.sort((a, b) => a.dist - b.dist);
    return scored.slice(0, n);
  }
  function OfficeContributionAnalysis({ country, metrics, countries, allMetrics, years, theme }) {
    const comparables = useMemo(
      () => findComparableCountries(country, metrics, countries, allMetrics, years),
      [country, metrics, countries, allMetrics, years]
    );
    const [text, setText] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await DataAPI.generateInsight("office_contribution", {
          target: { name_he: country.name_he, metrics: { sumVisitors: metrics.sumVisitors, sumOutbound: metrics.sumOutbound, roi: metrics.roi } },
          comparables: comparables.map((c) => ({ name_he: c.country.name_he, metrics: { sumVisitors: c.metrics.sumVisitors, sumOutbound: c.metrics.sumOutbound, roi: c.metrics.roi } }))
        });
        setText(sanitizeAiText(res.text));
      } catch (err) {
        setError(String(err.message || err));
      }
      setLoading(false);
    };
    if (comparables.length === 0) {
      return null;
    }
    return /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3 mb-3" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary text-sm flex items-center gap-2" }, "\u{1F3E2} \u05E0\u05D9\u05EA\u05D5\u05D7 \u05EA\u05E8\u05D5\u05DE\u05EA \u05DC\u05E9\u05DB\u05D4 \u2014 ", country.name_he, " \u2B50", /* @__PURE__ */ React.createElement(InfoTip, { text: "\u05DE\u05E9\u05D5\u05D5\u05D4 \u05DC\u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05D3\u05D5\u05DE\u05D5\u05EA \u05D1\u05DE\u05E1\u05E4\u05E8 \u05DE\u05D0\u05E4\u05D9\u05D9\u05E0\u05D9\u05DD \u05D1\u05DE\u05E7\u05D1\u05D9\u05DC (\u05E8\u05DE\u05EA \u05E4\u05D9\u05EA\u05D5\u05D7, \u05EA\u05D5\u05E6\u05E8 \u05DC\u05E0\u05E4\u05E9, \u05E0\u05E4\u05D7 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05D9\u05D5\u05E6\u05D0\u05EA, \u05DE\u05E8\u05D7\u05E7 \u05DE\u05D9\u05E9\u05E8\u05D0\u05DC) \u05E9\u05D0\u05D9\u05DF \u05D1\u05D4\u05DF \u05DC\u05E9\u05DB\u05D4. \u26A0\uFE0F \u05D0\u05D9\u05DF \u05E2\u05D3\u05D9\u05D9\u05DF \u05E0\u05D5\u05D4\u05DC \u05E8\u05E9\u05DE\u05D9 \u05D1\u05DE\u05E9\u05E8\u05D3 \u05DC\u05DE\u05D3\u05D9\u05D3\u05EA \u05D4\u05E6\u05DC\u05D7\u05EA \u05DC\u05E9\u05DB\u05D4 \u2014 \u05D6\u05D4\u05D5 \u05DE\u05D5\u05D3\u05DC \u05E8\u05D0\u05E9\u05D5\u05E0\u05D9, \u05E4\u05EA\u05D5\u05D7 \u05DC\u05E9\u05D9\u05E0\u05D5\u05D9." })), /* @__PURE__ */ React.createElement("button", { onClick: run, disabled: loading, className: `px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-l ${theme.grad} disabled:opacity-50` }, loading ? "\u{1F504} \u05DE\u05E0\u05EA\u05D7..." : text ? "\u{1F504} \u05D4\u05E8\u05E5 \u05DE\u05D7\u05D3\u05E9" : "\u25B6\uFE0F \u05D1\u05E6\u05E2 \u05E0\u05D9\u05EA\u05D5\u05D7")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mb-3" }, "\u05DE\u05D5\u05E9\u05D5\u05D5\u05D4 \u05DE\u05D5\u05DC: ", comparables.map((c) => `${c.country.flag || ""} ${c.country.name_he}`).join(", "), " (\u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05DC\u05DC\u05D0 \u05DC\u05E9\u05DB\u05D4, \u05D1\u05E0\u05E4\u05D7 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05D9\u05D5\u05E6\u05D0\u05EA \u05D3\u05D5\u05DE\u05D4)"), /* @__PURE__ */ React.createElement("div", { className: "grid gap-2 mb-3", style: { gridTemplateColumns: `repeat(${comparables.length + 1}, minmax(0,1fr))` } }, /* @__PURE__ */ React.createElement("div", { className: "text-center p-2 rounded-lg", style: { background: hexA(theme.solid, 0.12) } }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-secondary" }, country.name_he, " \u2B50"), /* @__PURE__ */ React.createElement("div", { className: "font-bold text-primary text-sm" }, metrics.roi, "%")), comparables.map((c) => /* @__PURE__ */ React.createElement("div", { key: c.country.id, className: "text-center p-2 rounded-lg", style: { background: "var(--hover-bg)" } }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-secondary" }, c.country.name_he), /* @__PURE__ */ React.createElement("div", { className: "font-bold text-primary text-sm" }, c.metrics.roi, "%")))), error && /* @__PURE__ */ React.createElement("p", { className: "text-red-500 text-sm" }, "\u26A0\uFE0F \u05E9\u05D2\u05D9\u05D0\u05D4: ", error), text && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-primary leading-relaxed whitespace-pre-line", style: { animation: "fadeIn 0.3s ease-in" } }, text), !text && !loading && !error && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted" }, '\u05DC\u05D7\u05E5 "\u05D1\u05E6\u05E2 \u05E0\u05D9\u05EA\u05D5\u05D7" \u05DC\u05E7\u05D1\u05DC\u05EA \u05D4\u05E2\u05E8\u05DB\u05D4 \u05DE\u05E0\u05D5\u05DE\u05E7\u05EA \u05E9\u05DC \u05EA\u05E8\u05D5\u05DE\u05EA \u05D4\u05DC\u05E9\u05DB