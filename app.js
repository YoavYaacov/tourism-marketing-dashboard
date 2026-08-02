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
    `);
  }
  function InfoTip({ text }) {
    return /* @__PURE__ */ React.createElement("span", { className: "tooltip-i text-muted" }, /* @__PURE__ */ React.createElement("span", { style: { width: 15, height: 15, borderRadius: "50%", border: "1px solid currentColor", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" } }, "i"), /* @__PURE__ */ React.createElement("span", { className: "bubble" }, text));
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
    { name_he: "\u05D9\u05D5\u05D5\u05DF", name_en: "Greece", flag: "\u{1F1EC}\u{1F1F7}" },
    { name_he: "\u05E7\u05E4\u05E8\u05D9\u05E1\u05D9\u05DF", name_en: "Cyprus", flag: "\u{1F1E8}\u{1F1FE}" },
    { name_he: "\u05DE\u05E6\u05E8\u05D9\u05DD", name_en: "Egypt", flag: "\u{1F1EA}\u{1F1EC}" },
    { name_he: "\u05D9\u05E8\u05D3\u05DF", name_en: "Jordan", flag: "\u{1F1EF}\u{1F1F4}" },
    { name_he: "\u05D8\u05D5\u05E8\u05E7\u05D9\u05D4", name_en: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" },
    { name_he: "\u05E4\u05D5\u05E8\u05D8\u05D5\u05D2\u05DC", name_en: "Portugal", flag: "\u{1F1F5}\u{1F1F9}" },
    { name_he: "\u05DE\u05E8\u05D5\u05E7\u05D5", name_en: "Morocco", flag: "\u{1F1F2}\u{1F1E6}" },
    { name_he: "\u05D4\u05D5\u05DC\u05E0\u05D3", name_en: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}" },
    { name_he: "\u05D1\u05DC\u05D2\u05D9\u05D4", name_en: "Belgium", flag: "\u{1F1E7}\u{1F1EA}" },
    { name_he: "\u05E9\u05D5\u05D5\u05D9\u05E5", name_en: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}" },
    { name_he: "\u05D0\u05D5\u05E1\u05D8\u05E8\u05D9\u05D4", name_en: "Austria", flag: "\u{1F1E6}\u{1F1F9}" },
    { name_he: "\u05E9\u05D5\u05D5\u05D3\u05D9\u05D4", name_en: "Sweden", flag: "\u{1F1F8}\u{1F1EA}" },
    { name_he: "\u05E0\u05D5\u05E8\u05D5\u05D5\u05D2\u05D9\u05D4", name_en: "Norway", flag: "\u{1F1F3}\u{1F1F4}" },
    { name_he: "\u05D3\u05E0\u05DE\u05E8\u05E7", name_en: "Denmark", flag: "\u{1F1E9}\u{1F1F0}" },
    { name_he: "\u05E4\u05D9\u05E0\u05DC\u05E0\u05D3", name_en: "Finland", flag: "\u{1F1EB}\u{1F1EE}" },
    { name_he: "\u05D0\u05D9\u05E8\u05DC\u05E0\u05D3", name_en: "Ireland", flag: "\u{1F1EE}\u{1F1EA}" },
    { name_he: "\u05D9\u05D5\u05D5\u05DF", name_en: "Greece", flag: "\u{1F1EC}\u{1F1F7}" },
    { name_he: "\u05D4\u05D5\u05E0\u05D2\u05E8\u05D9\u05D4", name_en: "Hungary", flag: "\u{1F1ED}\u{1F1FA}" },
    { name_he: "\u05E6'\u05DB\u05D9\u05D4", name_en: "Czechia", flag: "\u{1F1E8}\u{1F1FF}" },
    { name_he: "\u05E8\u05D5\u05DE\u05E0\u05D9\u05D4", name_en: "Romania", flag: "\u{1F1F7}\u{1F1F4}" },
    { name_he: "\u05D1\u05D5\u05DC\u05D2\u05E8\u05D9\u05D4", name_en: "Bulgaria", flag: "\u{1F1E7}\u{1F1EC}" },
    { name_he: "\u05E7\u05E8\u05D5\u05D0\u05D8\u05D9\u05D4", name_en: "Croatia", flag: "\u{1F1ED}\u{1F1F7}" },
    { name_he: "\u05E1\u05E8\u05D1\u05D9\u05D4", name_en: "Serbia", flag: "\u{1F1F7}\u{1F1F8}" },
    { name_he: "\u05E1\u05DC\u05D5\u05D1\u05E7\u05D9\u05D4", name_en: "Slovakia", flag: "\u{1F1F8}\u{1F1F0}" },
    { name_he: "\u05E1\u05DC\u05D5\u05D1\u05E0\u05D9\u05D4", name_en: "Slovenia", flag: "\u{1F1F8}\u{1F1EE}" },
    { name_he: "\u05DC\u05D9\u05D8\u05D0", name_en: "Lithuania", flag: "\u{1F1F1}\u{1F1F9}" },
    { name_he: "\u05DC\u05D8\u05D1\u05D9\u05D4", name_en: "Latvia", flag: "\u{1F1F1}\u{1F1FB}" },
    { name_he: "\u05D0\u05E1\u05D8\u05D5\u05E0\u05D9\u05D4", name_en: "Estonia", flag: "\u{1F1EA}\u{1F1EA}" },
    { name_he: "\u05D1\u05DC\u05D0\u05E8\u05D5\u05E1", name_en: "Belarus", flag: "\u{1F1E7}\u{1F1FE}" },
    { name_he: "\u05DE\u05D5\u05DC\u05D3\u05D5\u05D1\u05D4", name_en: "Moldova", flag: "\u{1F1F2}\u{1F1E9}" },
    { name_he: "\u05D9\u05E4\u05DF", name_en: "Japan", flag: "\u{1F1EF}\u{1F1F5}" },
    { name_he: "\u05EA\u05D0\u05D9\u05DC\u05E0\u05D3", name_en: "Thailand", flag: "\u{1F1F9}\u{1F1ED}" },
    { name_he: "\u05D5\u05D9\u05D9\u05D8\u05E0\u05D0\u05DD", name_en: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}" },
    { name_he: "\u05D0\u05D9\u05E0\u05D3\u05D5\u05E0\u05D6\u05D9\u05D4", name_en: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}" },
    { name_he: "\u05DE\u05DC\u05D6\u05D9\u05D4", name_en: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}" },
    { name_he: "\u05E1\u05D9\u05E0\u05D2\u05E4\u05D5\u05E8", name_en: "Singapore", flag: "\u{1F1F8}\u{1F1EC}" },
    { name_he: "\u05D0\u05D9\u05D7\u05D5\u05D3 \u05D4\u05D0\u05DE\u05D9\u05E8\u05D5\u05D9\u05D5\u05EA", name_en: "UAE", flag: "\u{1F1E6}\u{1F1EA}" },
    { name_he: "\u05E2\u05E8\u05D1 \u05D4\u05E1\u05E2\u05D5\u05D3\u05D9\u05EA", name_en: "Saudi Arabia", flag: "\u{1F1F8}\u{1F1E6}" },
    { name_he: "\u05E7\u05D8\u05D0\u05E8", name_en: "Qatar", flag: "\u{1F1F6}\u{1F1E6}" },
    { name_he: "\u05DB\u05D5\u05D5\u05D9\u05EA", name_en: "Kuwait", flag: "\u{1F1F0}\u{1F1FC}" },
    { name_he: "\u05DE\u05E7\u05E1\u05D9\u05E7\u05D5", name_en: "Mexico", flag: "\u{1F1F2}\u{1F1FD}" },
    { name_he: "\u05D0\u05E8\u05D2\u05E0\u05D8\u05D9\u05E0\u05D4", name_en: "Argentina", flag: "\u{1F1E6}\u{1F1F7}" },
    { name_he: "\u05E6'\u05D9\u05DC\u05D4", name_en: "Chile", flag: "\u{1F1E8}\u{1F1F1}" },
    { name_he: "\u05E7\u05D5\u05DC\u05D5\u05DE\u05D1\u05D9\u05D4", name_en: "Colombia", flag: "\u{1F1E8}\u{1F1F4}" },
    { name_he: "\u05E4\u05E8\u05D5", name_en: "Peru", flag: "\u{1F1F5}\u{1F1EA}" },
    { name_he: "\u05D3\u05E8\u05D5\u05DD \u05D0\u05E4\u05E8\u05D9\u05E7\u05D4", name_en: "South Africa", flag: "\u{1F1FF}\u{1F1E6}" },
    { name_he: "\u05E0\u05D9\u05D2\u05E8\u05D9\u05D4", name_en: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}" },
    { name_he: "\u05E7\u05E0\u05D9\u05D4", name_en: "Kenya", flag: "\u{1F1F0}\u{1F1EA}" },
    { name_he: "\u05D0\u05EA\u05D9\u05D5\u05E4\u05D9\u05D4", name_en: "Ethiopia", flag: "\u{1F1EA}\u{1F1F9}" },
    { name_he: "\u05D0\u05D5\u05E1\u05D8\u05E8\u05DC\u05D9\u05D4", name_en: "Australia", flag: "\u{1F1E6}\u{1F1FA}" },
    { name_he: "\u05E0\u05D9\u05D5 \u05D6\u05D9\u05DC\u05E0\u05D3", name_en: "New Zealand", flag: "\u{1F1F3}\u{1F1FF}" },
    { name_he: "\u05D0\u05D6\u05E8\u05D1\u05D9\u05D9\u05D2'\u05DF", name_en: "Azerbaijan", flag: "\u{1F1E6}\u{1F1FF}" },
    { name_he: "\u05D2\u05D0\u05D5\u05E8\u05D2\u05D9\u05D4", name_en: "Georgia", flag: "\u{1F1EC}\u{1F1EA}" },
    { name_he: "\u05D0\u05E8\u05DE\u05E0\u05D9\u05D4", name_en: "Armenia", flag: "\u{1F1E6}\u{1F1F2}" },
    { name_he: "\u05E7\u05D6\u05D7\u05E1\u05D8\u05DF", name_en: "Kazakhstan", flag: "\u{1F1F0}\u{1F1FF}" },
    { name_he: "\u05D0\u05D5\u05D6\u05D1\u05E7\u05D9\u05E1\u05D8\u05DF", name_en: "Uzbekistan", flag: "\u{1F1FA}\u{1F1FF}" },
    { name_he: "\u05D0\u05D9\u05E8\u05DF", name_en: "Iran", flag: "\u{1F1EE}\u{1F1F7}" },
    { name_he: "\u05E2\u05D9\u05E8\u05D0\u05E7", name_en: "Iraq", flag: "\u{1F1EE}\u{1F1F6}" },
    { name_he: "\u05DC\u05D1\u05E0\u05D5\u05DF", name_en: "Lebanon", flag: "\u{1F1F1}\u{1F1E7}" },
    { name_he: "\u05DE\u05DC\u05D8\u05D4", name_en: "Malta", flag: "\u{1F1F2}\u{1F1F9}" },
    { name_he: "\u05D0\u05D9\u05E1\u05DC\u05E0\u05D3", name_en: "Iceland", flag: "\u{1F1EE}\u{1F1F8}" },
    { name_he: "\u05DC\u05D5\u05E7\u05E1\u05DE\u05D1\u05D5\u05E8\u05D2", name_en: "Luxembourg", flag: "\u{1F1F1}\u{1F1FA}" }
  ];
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
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-md" }, /* @__PURE__ */ React.createElement(CountryPicker, { label: "\u{1F30D} \u05D1\u05D7\u05E8 \u05DE\u05D3\u05D9\u05E0\u05D4 \u05DC\u05E0\u05D9\u05EA\u05D5\u05D7 \u05DE\u05E2\u05DE\u05D9\u05E7", value: countryName, onChange: setCountryName, countries })), loading && /* @__PURE__ */ React.createElement(AiLoadingState, { name: countryName }), !loading && error && /* @__PURE__ */ React.createElement("div", { className: "text-center py-16" }, /* @__PURE__ */ React.createElement("p", { className: "text-red-500 font-medium" }, '\u26A0\uFE0F \u05E0\u05DB\u05E9\u05DC\u05D4 \u05D4\u05E9\u05DC\u05DE\u05EA \u05D4\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05E2\u05D1\u05D5\u05E8 "', countryName, '"'), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary mt-2" }, error)), !loading && metrics && country && /* @__PURE__ */ React.createElement("div", { className: "space-y-5", style: { animation: "fadeIn 0.3s ease-in" } }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 flex-wrap" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-primary flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl" }, country.flag || "\u{1F310}"), " ", country.name_he, metrics.hasOffice && /* @__PURE__ */ React.createElement("span", { title: "\u05DC\u05E9\u05DB\u05D4 \u05E4\u05E2\u05D9\u05DC\u05D4", className: "text-lg" }, "\u2B50")), /* @__PURE__ */ React.createElement("span", { className: "text-xs px-2.5 py-1 rounded-full font-medium", style: { background: hexA(theme.solid, 0.12), color: theme.solid } }, country.region), estimated && /* @__PURE__ */ React.createElement(AiEstimateBadge, null)), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F6C2}", label: "\u05E1\u05D4\u05F4\u05DB \u05E0\u05DB\u05E0\u05E1\u05D9\u05DD \u05DC\u05D9\u05E9\u05E8\u05D0\u05DC", value: fmtCompact(metrics.sumVisitors), accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u2708\uFE0F", label: "\u05E0\u05E4\u05D7 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05D9\u05D5\u05E6\u05D0\u05EA \u05DE\u05E6\u05D8\u05D1\u05E8", value: `${fmtNum(metrics.sumOutbound)}M`, accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u2764\uFE0F", label: "\u05D0\u05D4\u05D3\u05D4 \u05E4\u05E8\u05D5-\u05D9\u05E9\u05E8\u05D0\u05DC\u05D9\u05EA", value: `${metrics.sentiment}/100`, tip: "\u05E6\u05D9\u05D5\u05DF \u05DE\u05D7\u05D5\u05E9\u05D1 (\u05DC\u05D0 \u05E1\u05E7\u05E8 \u05D3\u05E2\u05EA \u05E7\u05D4\u05DC \u05D0\u05DE\u05D9\u05EA\u05D9): 60% \u05DE\u05DE\u05D3\u05D3 \u05D7\u05D9\u05E4\u05D5\u05E9 \u05DE\u05E7\u05D5\u05D5\u05DF (online_search_index) + 40% \u05DE\u05DE\u05E6\u05D1 \u05D0\u05D6\u05D4\u05E8\u05EA \u05D4\u05DE\u05E1\u05E2 (\u05EA\u05E7\u05D9\u05DF=100, \u05D0\u05D6\u05D4\u05E8\u05D4=50), \u05D1\u05DE\u05DE\u05D5\u05E6\u05E2 \u05E2\u05DC \u05E4\u05E0\u05D9 \u05D8\u05D5\u05D5\u05D7 \u05D4\u05E9\u05E0\u05D9\u05DD \u05D4\u05E0\u05D1\u05D7\u05E8.", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F4B9}", label: "\u05E8\u05D5\u05D5\u05D7\u05D9\u05D5\u05EA (\u05D9\u05E2\u05D9\u05DC\u05D5\u05EA \u05D4\u05DE\u05E8\u05D4)", value: `${metrics.roi}%`, tip: "\u05D0\u05D7\u05D5\u05D6 \u05DE\u05E1\u05DA \u05D4\u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05D4\u05D9\u05D5\u05E6\u05D0\u05EA \u05E9\u05DC \u05D4\u05DE\u05D3\u05D9\u05E0\u05D4 \u05E9\u05D4\u05D5\u05DE\u05E8 \u05DC\u05DB\u05E0\u05D9\u05E1\u05D5\u05EA \u05D1\u05E4\u05D5\u05E2\u05DC \u05DC\u05D9\u05E9\u05E8\u05D0\u05DC.", accentSolid: theme.solid })), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-2 gap-5" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "\u{1F4C8} \u05DE\u05D2\u05DE\u05EA \u05DB\u05E0\u05D9\u05E1\u05D5\u05EA \u05DC\u05D9\u05E9\u05E8\u05D0\u05DC"), lineData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "line", data: lineData, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } })), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "\u{1F4CA} \u05E4\u05E8\u05D5\u05E4\u05D9\u05DC \u05DE\u05D3\u05D3\u05D9\u05DD"), barData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: barData, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { max: 100 } } } }))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F54E}", label: "\u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA", value: `${metrics.religiousAffinity}/100`, sub: `\u05D0\u05D5\u05DB' \u05D9\u05D4\u05D5\u05D3\u05D9\u05EA: ${fmtCompact(metrics.avgJewishPop)}`, tip: "\u05DE\u05E0\u05D5\u05E8\u05DE\u05DC \u05E2\u05DC \u05E1\u05D5\u05DC\u05DD \u05DC\u05D5\u05D2\u05E8\u05D9\u05EA\u05DE\u05D9 \u05DE\u05D5\u05DC \u05DB\u05DC \u05D4\u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05D1\u05DE\u05D0\u05D2\u05E8.", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F4CA}", label: "\u05DE\u05D3\u05D3 HDI \u05DE\u05DE\u05D5\u05E6\u05E2", value: metrics.avgHdi.toFixed(3), accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F6EB}", label: "\u05D0\u05D9\u05DB\u05D5\u05EA \u05EA\u05E2\u05D5\u05E4\u05D4 (TTDI)", value: metrics.avgAirQuality.toFixed(1), sub: metrics.hasDirectFlights ? "\u2705 \u05D8\u05D9\u05E1\u05D5\u05EA \u05D9\u05E9\u05D9\u05E8\u05D5\u05EA" : "\u274C \u05D0\u05D9\u05DF \u05D8\u05D9\u05E1\u05D5\u05EA \u05D9\u05E9\u05D9\u05E8\u05D5\u05EA", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F3C6}", label: "\u05E6\u05D9\u05D5\u05DF \u05DB\u05D5\u05DC\u05DC", value: `${metrics.totalScore}/100`, sub: metrics.advisoryYears > 0 ? `\u26A0\uFE0F ${metrics.advisoryYears} \u05E9\u05E0\u05D5\u05EA \u05D0\u05D6\u05D4\u05E8\u05D4` : "\u2705 \u05DC\u05DC\u05D0 \u05D0\u05D6\u05D4\u05E8\u05D5\u05EA", tip: "\u05DE\u05DE\u05D5\u05E6\u05E2 \u05DE\u05E9\u05D5\u05E7\u05DC\u05DC: 35% \u05D0\u05D4\u05D3\u05D4, 25% \u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA, 25% \u05E8\u05D5\u05D5\u05D7\u05D9\u05D5\u05EA, 15% \u05DE\u05D2\u05DE\u05EA \u05E6\u05DE\u05D9\u05D7\u05D4.", accentSolid: theme.solid })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F4B5}", label: "\u05EA\u05D5\u05E6\u05E8 \u05DC\u05E0\u05E4\u05E9", value: metrics.avgGdpPerCapita ? `$${fmtNum(metrics.avgGdpPerCapita)}` : "-", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F9F3}", label: "\u05D4\u05D5\u05E6\u05D0\u05D4 \u05DE\u05DE\u05D5\u05E6\u05E2\u05EA \u05DC\u05E0\u05E1\u05D9\u05E2\u05D4", value: metrics.avgExpenditurePerTrip ? `$${fmtNum(metrics.avgExpenditurePerTrip)}` : "-", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u271D\uFE0F", label: "\u05D0\u05D5\u05DB\u05DC\u05D5\u05E1\u05D9\u05D9\u05D4 \u05D0\u05D5\u05D5\u05E0\u05D2\u05DC\u05D9\u05E1\u05D8\u05D9\u05EA", value: fmtCompact(metrics.avgEvangelicalPop), accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "\u{1F4CD}", label: "\u05DE\u05E8\u05D7\u05E7 \u05DE\u05D9\u05E9\u05E8\u05D0\u05DC", value: country.Distance ? `${fmtNum(country.Distance)} \u05E7"\u05DE` : "-", accentSolid: theme.solid })), /* @__PURE__ */ React.createElement(CouncilAnalysis, { key: country.name_he, country, metrics, theme }), metrics.hasOffice && /* @__PURE__ */ React.createElement(OfficeContributionAnalysis, { key: `office-${country.name_he}`, country, metrics, countries, allMetrics, years, theme }), /* @__PURE__ */ React.createElement(CompetitorAnalysis, { key: `comp-${country.name_he}`, country, theme })));
  }
  const COUNCIL_SECTIONS = [
    { key: "\u05D0", label: "\u05EA\u05E7\u05E6\u05D9\u05E8 \u05DE\u05E0\u05D4\u05DC\u05D9\u05DD", emoji: "\u{1F4CB}" },
    { key: "\u05D1", label: "\u05DE\u05D0\u05E4\u05D9\u05D9\u05E0\u05D9\u05DD \u05DB\u05DC\u05DB\u05DC\u05D9\u05D9\u05DD", emoji: "\u{1F4B0}" },
    { key: "\u05D2", label: "\u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA", emoji: "\u{1F54E}" },
    { key: "\u05D3", label: "\u05D0\u05D4\u05D3\u05D4 \u05DC\u05D9\u05E9\u05E8\u05D0\u05DC", emoji: "\u2764\uFE0F" },
    { key: "\u05D4", label: "\u05E6\u05D9\u05D5\u05DF \u05DB\u05D5\u05DC\u05DC \u05D5\u05E0\u05D9\u05EA\u05D5\u05D7 \u05D4\u05DE\u05D5\u05E2\u05E6\u05D4", emoji: "\u{1F3C6}" }
  ];
  function parseCouncilSections(text) {
    const pattern = /(^|\n)\s*([אבגדה])['׳]?\s*[-–—:]?\s*/g;
    const parts = [];
    let match, lastIndex = 0, lastKey = null;
    while ((match = pattern.exec(text)) !== null) {
      if (lastKey !== null) parts.push({ key: lastKey, body: text.slice(lastIndex, match.index).trim() });
      lastKey = match[2];
      lastIndex = pattern.lastIndex;
    }
    if (lastKey !== null) parts.push({ key: lastKey, body: text.slice(lastIndex).trim() });
    return parts.length ? parts : [{ key: "\u05D0", body: text }];
  }
  function CouncilAnalysis({ country, metrics, theme }) {
    const [text, setText] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await DataAPI.generateInsight("council_analysis", { name_he: country.name_he, metrics });
        setText(sanitizeAiText(res.text));
      } catch (err) {
        setError(String(err.message || err));
      }
      setLoading(false);
    };
    const sections = text ? parseCouncilSections(text) : null;
    return /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3 mb-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary text-sm flex items-center gap-2" }, "\u{1F3DB}\uFE0F \u05E0\u05D9\u05EA\u05D5\u05D7 \u05D4\u05DE\u05D5\u05E2\u05E6\u05D4 \u2014 ", country.name_he), /* @__PURE__ */ React.createElement("button", { onClick: run, disabled: loading, className: `px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-l ${theme.grad} disabled:opacity-50` }, loading ? "\u{1F504} \u05D4\u05DE\u05D5\u05E2\u05E6\u05D4 \u05DE\u05EA\u05DB\u05E0\u05E1\u05EA..." : text ? "\u{1F504} \u05D4\u05E8\u05E5 \u05DE\u05D7\u05D3\u05E9" : "\u25B6\uFE0F \u05D1\u05E6\u05E2 \u05E0\u05D9\u05EA\u05D5\u05D7")), error && /* @__PURE__ */ React.createElement("p", { className: "text-red-500 text-sm" }, "\u26A0\uFE0F \u05E9\u05D2\u05D9\u05D0\u05D4: ", error), !text && !loading && !error && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted" }, '\u05DC\u05D7\u05E5 "\u05D1\u05E6\u05E2 \u05E0\u05D9\u05EA\u05D5\u05D7" \u05DB\u05D3\u05D9 \u05DC\u05E7\u05D1\u05DC \u05E0\u05D9\u05EA\u05D5\u05D7 \u05D0\u05E1\u05D8\u05E8\u05D8\u05D2\u05D9 \u05DE\u05E2\u05DE\u05D9\u05E7 \u05D1\u05D7\u05DE\u05D9\u05E9\u05D4 \u05E1\u05E2\u05D9\u05E4\u05D9\u05DD: \u05EA\u05E7\u05E6\u05D9\u05E8 \u05DE\u05E0\u05D4\u05DC\u05D9\u05DD, \u05DE\u05D0\u05E4\u05D9\u05D9\u05E0\u05D9\u05DD \u05DB\u05DC\u05DB\u05DC\u05D9\u05D9\u05DD, \u05D6\u05D9\u05E7\u05D4 \u05D3\u05EA\u05D9\u05EA, \u05D0\u05D4\u05D3\u05D4 \u05DC\u05D9\u05E9\u05E8\u05D0\u05DC, \u05D5\u05E6\u05D9\u05D5\u05DF \u05DB\u05D5\u05DC\u05DC \u05DE\u05D8\u05E2\u05DD "\u05D4\u05DE\u05D5\u05E2\u05E6\u05D4".'), sections && /* @__PURE__ */ React.createElement("div", { className: "space-y-4", style: { animation: "fadeIn 0.3s ease-in" } }, sections.map((s) => {
      const meta = COUNCIL_SECTIONS.find((c) => c.key === s.key);
      return /* @__PURE__ */ React.createElement("div", { key: s.key, className: "border-r-4 pr-4", style: { borderColor: theme.solid } }, /* @__PURE__ */ React.createElement("h5", { className: "font-semibold text-primary text-sm mb-1.5" }, (meta == null ? void 0 : meta.emoji) || "\u{1F4CC}", " ", s.key, "' \u2014 ", (meta == null ? void 0 : meta.label) || ""), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-secondary leading-relaxed whitespace-pre-line" }, s.body));
    })));
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
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-2 gap-4 max-w-2xl" }, /* @__PURE__ */ React.createElement(CountryPicker, { label: "\u{1F1E6} \u05DE\u05D3\u05D9\u05E0\u05D4 \u05D0'", value: c1, onChange: setC1, countries, exclude: [c2] }), /* @__PURE__ */ React.createElement(CountryPicker, { label: "\u{1F1E7} \u05DE\u05D3\u05D9\u05E0\u05D4 \u05D1'", value: c2, onChange: setC2, countries, exclude: [c1] })), (r1.loading || r2.loading) && /* @__PURE__ */ React.createElement(AiLoadingState, { name: r1.loading ? c1 : c2 }), !r1.loading && !r2.loading && (r1.error || r2.error) && /* @__PURE__ */ React.createElement("div", { className: "text-center py-16" }, /* @__PURE__ */ React.createElement("p", { className: "text-red-500 font-medium" }, "\u26A0\uFE0F \u05E0\u05DB\u05E9\u05DC\u05D4 \u05D4\u05E9\u05DC\u05DE\u05EA \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary mt-2" }, r1.error || r2.error)), !r1.loading && !r2.loading && r1.metrics && r2.metrics && /* @__PURE__ */ React.createElement("div", { className: "space-y-5", style: { animation: "fadeIn 0.3s ease-in" } }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-6 flex-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl" }, (_c = r1.country) == null ? void 0 : _c.flag), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-primary" }, c1), r1.estimated && /* @__PURE__ */ React.createElement(AiEstimateBadge, null)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl" }, (_d = r2.country) == null ? void 0 : _d.flag), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-primary" }, c2), r2.estimated && /* @__PURE__ */ React.createElement(AiEstimateBadge, null))), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "\u{1F4C8} \u05D4\u05E9\u05D5\u05D5\u05D0\u05EA \u05DE\u05D2\u05DE\u05EA \u05DE\u05D1\u05E7\u05E8\u05D9\u05DD"), lineData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "line", data: lineData, options: { responsive: true, maintainAspectRatio: false } })), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-2 gap-5" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "\u2696\uFE0F \u05D4\u05E9\u05D5\u05D5\u05D0\u05EA \u05DE\u05D3\u05D3\u05D9\u05DD \u05DE\u05E8\u05DB\u05D6\u05D9\u05D9\u05DD (\u05E1\u05D5\u05DC\u05DD 0-100)"), barData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: barData, options: { responsive: true, maintainAspectRatio: false } })), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm flex items-center gap-1.5" }, "\u{1F4B9} \u05D4\u05E9\u05D5\u05D5\u05D0\u05EA \u05E8\u05D5\u05D5\u05D7\u05D9\u05D5\u05EA (%)", /* @__PURE__ */ React.createElement(InfoTip, { text: "\u05DE\u05D5\u05E6\u05D2 \u05D1\u05D2\u05E8\u05E3 \u05E0\u05E4\u05E8\u05D3 \u05DB\u05D9 \u05E1\u05D5\u05DC\u05DD \u05D4\u05E2\u05E8\u05DB\u05D9\u05DD \u05E9\u05DC\u05D5 \u05E7\u05D8\u05DF \u05DE\u05E9\u05DE\u05E2\u05D5\u05EA\u05D9\u05EA \u05DE\u05E9\u05D0\u05E8 \u05D4\u05DE\u05D3\u05D3\u05D9\u05DD (\u05D1\u05D3\u05E8\u05DA \u05DB\u05DC\u05DC \u05E4\u05D7\u05D5\u05EA \u05DE-1-2%)." })), roiChartData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: roiChartData, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } })))));
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
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-2 gap-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1.5" }, "\u{1F30D} \u05D1\u05D7\u05E8 \u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05DC\u05D3\u05D9\u05E8\u05D5\u05D2 (3-10)"), /* @__PURE__ */ React.createElement("div", { className: "relative mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
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
    ))))), stillLoading.length > 0 && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-secondary" }, "\u{1F504} \u05DE\u05E9\u05DC\u05D9\u05DD \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05E2\u05D1\u05D5\u05E8: ", stillLoading.join(", "), "..."), readyToShow && /* @__PURE__ */ React.createElement("div", { className: "space-y-5", style: { animation: "fadeIn 0.3s ease-in" } }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-4 text-sm" }, "\u{1F3C6} \u05D3\u05D9\u05E8\u05D5\u05D2 \u05DC\u05E4\u05D9 ", paramMeta == null ? void 0 : paramMeta.label), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, ranked.map((r, i) => /* @__PURE__ */ React.createElement("div", { key: r.name, className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-7 text-center" }, i < 3 ? medals[i] : /* @__PURE__ */ React.createElement("span", { className: "text-xs text-secondary" }, i + 1)), /* @__PURE__ */ React.createElement("div", { className: "w-32 shrink-0 text-sm font-medium text-primary truncate" }, r.name, " ", r.estimated && "\u2728"), /* @__PURE__ */ React.createElement("div", { className: "flex-1 rounded-full h-6 relative overflow-hidden", style: { background: "var(--hover-bg)" } }, /* @__PURE__ */ React.createElement("div", { className: "h-full rounded-full flex items-center justify-end px-2", style: { width: `${Math.max(4, r.metrics[param] / maxVal * 100)}%`, background: theme.solid } }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-white" }, r.metrics[param].toFixed(1))))))), ranked.some((r) => r.estimated) && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mt-3 flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", null, "\u2728"), " \u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05D4\u05DE\u05E1\u05D5\u05DE\u05E0\u05D5\u05EA \u05D4\u05D5\u05E9\u05DC\u05DE\u05D5 \u05E2\u05DC \u05D9\u05D3\u05D9 AI (\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D5 \u05D1\u05DE\u05D0\u05D2\u05E8 \u05D4\u05DE\u05E7\u05D5\u05E8\u05D9)"))), /* @__PURE__ */ React.createElement(RegressionAnalysis, { years, theme, allMetrics, countries }));
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
    const candidates = countries.filter((c) => c.id !== targetCountry.id);
    const scored = candidates.map((c) => {
      const rows = allMetrics.filter((m) => m.country_id === c.id);
      const metrics = deriveMetrics(rows, years);
      if (!metrics || metrics.hasOffice) return null;
      const dist = Math.abs(metrics.sumOutbound - targetMetrics.sumOutbound) / (targetMetrics.sumOutbound || 1);
      return { country: c, metrics, dist };
    }).filter(Boolean);
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
    return /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3 mb-3" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary text-sm flex items-center gap-2" }, "\u{1F3E2} \u05E0\u05D9\u05EA\u05D5\u05D7 \u05EA\u05E8\u05D5\u05DE\u05EA \u05DC\u05E9\u05DB\u05D4 \u2014 ", country.name_he, " \u2B50", /* @__PURE__ */ React.createElement(InfoTip, { text: "\u05D1\u05D5\u05D3\u05E7 \u05D0\u05DD \u05E7\u05D9\u05D5\u05DD \u05DC\u05E9\u05DB\u05EA \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05E4\u05E2\u05D9\u05DC\u05D4 \u05D1\u05DE\u05D3\u05D9\u05E0\u05D4 \u05D6\u05D5 \u05DE\u05EA\u05D5\u05E8\u05D2\u05DD \u05DC\u05D9\u05D5\u05EA\u05E8 \u05DB\u05E0\u05D9\u05E1\u05D5\u05EA \u05EA\u05D9\u05D9\u05E8\u05D9\u05DD \u05D1\u05D9\u05D7\u05E1 \u05DC\u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05D3\u05D5\u05DE\u05D5\u05EA \u05D1\u05E0\u05E4\u05D7 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05D9\u05D5\u05E6\u05D0\u05EA, \u05E9\u05D0\u05D9\u05DF \u05D1\u05D4\u05DF \u05DC\u05E9\u05DB\u05D4." })), /* @__PURE__ */ React.createElement("button", { onClick: run, disabled: loading, className: `px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-l ${theme.grad} disabled:opacity-50` }, loading ? "\u{1F504} \u05DE\u05E0\u05EA\u05D7..." : text ? "\u{1F504} \u05D4\u05E8\u05E5 \u05DE\u05D7\u05D3\u05E9" : "\u25B6\uFE0F \u05D1\u05E6\u05E2 \u05E0\u05D9\u05EA\u05D5\u05D7")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mb-3" }, "\u05DE\u05D5\u05E9\u05D5\u05D5\u05D4 \u05DE\u05D5\u05DC: ", comparables.map((c) => `${c.country.flag || ""} ${c.country.name_he}`).join(", "), " (\u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05DC\u05DC\u05D0 \u05DC\u05E9\u05DB\u05D4, \u05D1\u05E0\u05E4\u05D7 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05D9\u05D5\u05E6\u05D0\u05EA \u05D3\u05D5\u05DE\u05D4)"), /* @__PURE__ */ React.createElement("div", { className: "grid gap-2 mb-3", style: { gridTemplateColumns: `repeat(${comparables.length + 1}, minmax(0,1fr))` } }, /* @__PURE__ */ React.createElement("div", { className: "text-center p-2 rounded-lg", style: { background: hexA(theme.solid, 0.12) } }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-secondary" }, country.name_he, " \u2B50"), /* @__PURE__ */ React.createElement("div", { className: "font-bold text-primary text-sm" }, metrics.roi, "%")), comparables.map((c) => /* @__PURE__ */ React.createElement("div", { key: c.country.id, className: "text-center p-2 rounded-lg", style: { background: "var(--hover-bg)" } }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-secondary" }, c.country.name_he), /* @__PURE__ */ React.createElement("div", { className: "font-bold text-primary text-sm" }, c.metrics.roi, "%")))), error && /* @__PURE__ */ React.createElement("p", { className: "text-red-500 text-sm" }, "\u26A0\uFE0F \u05E9\u05D2\u05D9\u05D0\u05D4: ", error), text && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-primary leading-relaxed whitespace-pre-line", style: { animation: "fadeIn 0.3s ease-in" } }, text), !text && !loading && !error && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted" }, '\u05DC\u05D7\u05E5 "\u05D1\u05E6\u05E2 \u05E0\u05D9\u05EA\u05D5\u05D7" \u05DC\u05E7\u05D1\u05DC\u05EA \u05D4\u05E2\u05E8\u05DB\u05D4 \u05DE\u05E0\u05D5\u05DE\u05E7\u05EA \u05E9\u05DC \u05EA\u05E8\u05D5\u05DE\u05EA \u05D4\u05DC\u05E9\u05DB\u05D4, \u05D1\u05D6\u05D4\u05D9\u05E8\u05D5\u05EA \u05D4\u05DE\u05EA\u05D1\u05E7\u05E9\u05EA \u05DE\u05DE\u05D3\u05D2\u05DD \u05E7\u05D8\u05DF.'));
  }
  const SUGGESTED_COMPETITORS = ["\u05D9\u05D5\u05D5\u05DF", "\u05E7\u05E4\u05E8\u05D9\u05E1\u05D9\u05DF", "\u05DE\u05E6\u05E8\u05D9\u05DD", "\u05D9\u05E8\u05D3\u05DF", "\u05D0\u05D9\u05D8\u05DC\u05D9\u05D4", "\u05E1\u05E4\u05E8\u05D3", "\u05D8\u05D5\u05E8\u05E7\u05D9\u05D4", "\u05E4\u05D5\u05E8\u05D8\u05D5\u05D2\u05DC", "\u05DE\u05E8\u05D5\u05E7\u05D5"];
  function CompetitorAnalysis({ country, theme }) {
    const [selected, setSelected] = useState(["\u05D9\u05D5\u05D5\u05DF", "\u05E7\u05E4\u05E8\u05D9\u05E1\u05D9\u05DF", "\u05D0\u05D9\u05D8\u05DC\u05D9\u05D4"]);
    const [pending, setPending] = useState("");
    const [results, setResults] = useState({});
    const toggle = (name) => setSelected((s) => s.includes(name) ? s.filter((n) => n !== name) : s.length < 6 ? [...s, name] : s);
    const addCustom = () => {
      const name = pending.trim();
      if (name && !selected.includes(name) && selected.length < 6) setSelected((s) => [...s, name]);
      setPending("");
    };
    const runAll = async () => {
      for (const competitor of selected) {
        setResults((prev) => __spreadProps(__spreadValues({}, prev), { [competitor]: { loading: true } }));
        try {
          const res = await DataAPI.generateInsight("competitor_analysis", { source_country: country.name_he, competitor });
          setResults((prev) => __spreadProps(__spreadValues({}, prev), { [competitor]: { text: sanitizeAiText(res.text) } }));
        } catch (err) {
          setResults((prev) => __spreadProps(__spreadValues({}, prev), { [competitor]: { error: String(err.message || err) } }));
        }
      }
    };
    const anyLoading = Object.values(results).some((r) => r == null ? void 0 : r.loading);
    return /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm space-y-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary text-sm flex items-center gap-2" }, "\u2694\uFE0F \u05E0\u05D9\u05EA\u05D5\u05D7 \u05DE\u05EA\u05D7\u05E8\u05D9\u05DD \u05D3\u05D9\u05E0\u05DE\u05D9 \u2014 \u05DE\u05D9 \u05DE\u05EA\u05D7\u05E8\u05D4 \u05D1\u05D9\u05E9\u05E8\u05D0\u05DC \u05E2\u05DC \u05EA\u05D9\u05D9\u05E8\u05D9\u05DD \u05DE-", country.name_he), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary mb-2" }, "\u05D1\u05D7\u05E8 \u05E2\u05D3 6 \u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05DE\u05EA\u05D7\u05E8\u05D5\u05EA (\u05D4\u05E6\u05E2\u05D5\u05EA \u05D0\u05D6\u05D5\u05E8\u05D9\u05D5\u05EA/\u05D3\u05EA\u05D9\u05D5\u05EA-\u05EA\u05E8\u05D1\u05D5\u05EA\u05D9\u05D5\u05EA, \u05D0\u05D5 \u05D4\u05D5\u05E1\u05E3 \u05DE\u05E9\u05DC\u05DA):"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 mb-2" }, SUGGESTED_COMPETITORS.map((c) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: c,
        onClick: () => toggle(c),
        className: "text-xs px-3 py-1.5 rounded-full border font-medium transition",
        style: selected.includes(c) ? { background: theme.solid, color: "white", borderColor: theme.solid } : { borderColor: "var(--card-border)", color: "var(--text-secondary)" }
      },
      c
    ))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: pending,
        onChange: (e) => setPending(e.target.value),
        onKeyDown: (e) => e.key === "Enter" && addCustom(),
        placeholder: "\u05D4\u05D5\u05E1\u05E3 \u05DE\u05D3\u05D9\u05E0\u05D4 \u05DE\u05EA\u05D7\u05E8\u05D4 \u05E0\u05D5\u05E1\u05E4\u05EA...",
        className: "input-field flex-1 border rounded-lg px-3 py-2 text-sm"
      }
    ), /* @__PURE__ */ React.createElement("button", { onClick: addCustom, className: "px-3 py-2 rounded-lg bg-blue-700 text-white text-sm" }, "\u2795"))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: runAll,
        disabled: anyLoading || selected.length === 0,
        className: `px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-l ${theme.grad} disabled:opacity-50`
      },
      anyLoading ? "\u{1F504} \u05DE\u05E0\u05EA\u05D7..." : "\u25B6\uFE0F \u05D1\u05E6\u05E2 \u05E0\u05D9\u05EA\u05D5\u05D7"
    ), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, selected.map((c) => {
      const r = results[c];
      if (!r) return null;
      return /* @__PURE__ */ React.createElement("div", { key: c, className: "border rounded-xl p-4 divider" }, /* @__PURE__ */ React.createElement("h5", { className: "font-semibold text-primary text-sm mb-2" }, "\u{1F19A} ", c), r.loading && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary" }, "\u{1F504} \u05DE\u05E0\u05EA\u05D7..."), r.error && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-red-500" }, "\u26A0\uFE0F ", r.error), r.text && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-secondary leading-relaxed whitespace-pre-line", style: { animation: "fadeIn 0.3s ease-in" } }, r.text));
    })));
  }
  const REGION_OPTIONS = [
    { value: "Europe", label: "\u05D0\u05D9\u05E8\u05D5\u05E4\u05D4 (Europe)" },
    { value: "North America", label: "\u05E6\u05E4\u05D5\u05DF \u05D0\u05DE\u05E8\u05D9\u05E7\u05D4 (North America)" },
    { value: "South America", label: "\u05D3\u05E8\u05D5\u05DD \u05D0\u05DE\u05E8\u05D9\u05E7\u05D4 (South America)" },
    { value: "Americas", label: "\u05D9\u05D1\u05E9\u05EA \u05D0\u05DE\u05E8\u05D9\u05E7\u05D4 (Americas)" },
    { value: "Asia", label: "\u05D0\u05E1\u05D9\u05D4 (Asia)" },
    { value: "Africa", label: "\u05D0\u05E4\u05E8\u05D9\u05E7\u05D4 (Africa)" },
    { value: "Oceania", label: "\u05D0\u05D5\u05E7\u05D9\u05D0\u05E0\u05D9\u05D4 (Oceania)" },
    { value: "Europe/Asia", label: "\u05D0\u05D9\u05E8\u05D5\u05E4\u05D4/\u05D0\u05E1\u05D9\u05D4 (Europe/Asia)" }
  ];
  function buildFlagOptions(countries) {
    const map = /* @__PURE__ */ new Map();
    WORLD_COUNTRIES_HE.forEach((c) => map.set(c.flag, c.name_he));
    countries.forEach((c) => {
      if (c.flag) map.set(c.flag, c.name_he);
    });
    return Array.from(map.entries()).map(([flag, name]) => ({ flag, name }));
  }
  function CrudModal({ onClose, countries, onSaved }) {
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState("new");
    const [country, setCountry] = useState({ name_en: "", name_he: "", flag: "", region: "", Distance: "" });
    const [existingId, setExistingId] = useState(null);
    const [year, setYear] = useState((/* @__PURE__ */ new Date()).getFullYear());
    const [metric, setMetric] = useState({
      hdi: "",
      outbound_tourism_millions: "",
      air_transport_quality: "",
      has_direct_flights: false,
      jewish_population: "",
      online_search_index: "",
      travel_advisory: 1,
      entries_to_israel_thousands: "",
      has_office: false,
      gdp_per_capita: "",
      average_expenditure_per_trip: "",
      number_of_passengers_per_year: "",
      evangelical_population: ""
    });
    const [missingWarning, setMissingWarning] = useState([]);
    const [saving, setSaving] = useState(false);
    const [aiFilling, setAiFilling] = useState(false);
    const flagOptions = useMemo(() => buildFlagOptions(countries), [countries]);
    const selectExisting = (id) => {
      const c = countries.find((x) => x.id === Number(id));
      if (c) {
        setExistingId(c.id);
        setCountry(c);
      }
    };
    const goStep2 = () => {
      if (mode === "new" && (!country.name_en || !country.name_he)) return;
      setStep(2);
    };
    const goStep3 = () => setStep(3);
    const checkMissing = () => {
      const required = ["hdi", "outbound_tourism_millions", "air_transport_quality", "jewish_population", "online_search_index", "entries_to_israel_thousands"];
      return required.filter((k) => metric[k] === "" || metric[k] === null);
    };
    const tryFinish = () => {
      const missing = checkMissing();
      setMissingWarning(missing);
      if (missing.length === 0) doSave(metric);
    };
    const fillFromAI = async () => {
      setAiFilling(true);
      try {
        const result = await DataAPI.estimateViaAI(country.name_en, country.name_he, [year]);
        const row = result.rows.find((r) => r.year === year) || result.rows[0];
        setMetric((m) => __spreadProps(__spreadValues({}, m), {
          hdi: m.hdi !== "" ? m.hdi : row.hdi,
          outbound_tourism_millions: m.outbound_tourism_millions !== "" ? m.outbound_tourism_millions : row.outbound_tourism_millions,
          air_transport_quality: m.air_transport_quality !== "" ? m.air_transport_quality : row.air_transport_quality,
          has_direct_flights: m.has_direct_flights || row.has_direct_flights,
          jewish_population: m.jewish_population !== "" ? m.jewish_population : row.jewish_population,
          online_search_index: m.online_search_index !== "" ? m.online_search_index : row.online_search_index,
          travel_advisory: m.travel_advisory || row.travel_advisory,
          entries_to_israel_thousands: m.entries_to_israel_thousands !== "" ? m.entries_to_israel_thousands : row.entries_to_israel_thousands,
          _aiFilled: true
        }));
        setMissingWarning([]);
      } catch (err) {
        alert("\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D4\u05E9\u05DC\u05DE\u05EA AI: " + err.message);
      }
      setAiFilling(false);
    };
    const doSave = async (finalMetric) => {
      setSaving(true);
      try {
        let countryId = existingId;
        if (mode === "new" || country.flag || country.region || country.Distance !== "") {
          const saved = await DataAPI.upsertCountry({
            name_en: country.name_en,
            name_he: country.name_he,
            flag: country.flag,
            region: country.region,
            Distance: country.Distance === "" ? null : Number(country.Distance)
          });
          countryId = saved.id;
        }
        await DataAPI.upsertMetric({
          country_id: countryId,
          year,
          hdi: finalMetric.hdi === "" ? null : Number(finalMetric.hdi),
          outbound_tourism_millions: finalMetric.outbound_tourism_millions === "" ? null : Number(finalMetric.outbound_tourism_millions),
          air_transport_quality: finalMetric.air_transport_quality === "" ? null : Number(finalMetric.air_transport_quality),
          has_direct_flights: !!finalMetric.has_direct_flights,
          jewish_population: finalMetric.jewish_population === "" ? null : Math.round(Number(finalMetric.jewish_population)),
          online_search_index: finalMetric.online_search_index === "" ? null : Math.round(Number(finalMetric.online_search_index)),
          travel_advisory: Number(finalMetric.travel_advisory) || 1,
          entries_to_israel_thousands: finalMetric.entries_to_israel_thousands === "" ? null : Number(finalMetric.entries_to_israel_thousands),
          has_office: !!finalMetric.has_office,
          gdp_per_capita: finalMetric.gdp_per_capita === "" ? null : Number(finalMetric.gdp_per_capita),
          average_expenditure_per_trip: finalMetric.average_expenditure_per_trip === "" ? null : Number(finalMetric.average_expenditure_per_trip),
          number_of_passengers_per_year: finalMetric.number_of_passengers_per_year === "" ? null : Number(finalMetric.number_of_passengers_per_year),
          evangelical_population: finalMetric.evangelical_population === "" ? null : Math.round(Number(finalMetric.evangelical_population)),
          is_ai_estimated: !!finalMetric._aiFilled,
          source: finalMetric._aiFilled ? "gemini_ai_estimate" : "manual_edit"
        });
        onSaved();
        onClose();
      } catch (err) {
        alert("\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05E9\u05DE\u05D9\u05E8\u05D4: " + err.message);
      }
      setSaving(false);
    };
    const field = (key, label, opts = {}) => {
      var _a;
      return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1" }, label), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "number",
          value: metric[key],
          min: opts.min,
          max: opts.max,
          step: (_a = opts.step) != null ? _a : "any",
          onChange: (e) => setMetric((m) => __spreadProps(__spreadValues({}, m), { [key]: e.target.value, _aiFilled: false })),
          className: `input-field w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${missingWarning.includes(key) ? "ring-2 ring-amber-400" : ""}`
        }
      ), opts.hint && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mt-0.5" }, opts.hint));
    };
    return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[60] flex items-center justify-center p-4", style: { background: "var(--overlay-bg)" }, dir: "rtl" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 border-b divider flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg text-primary" }, "\u{1F4E5} \u05E0\u05D9\u05D4\u05D5\u05DC \u05D3\u05D0\u05D8\u05D4-\u05D1\u05D9\u05D9\u05E1 \u2014 \u05E9\u05DC\u05D1 ", step, " \u05DE\u05EA\u05D5\u05DA 3"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-1.5 rounded-lg hoverable text-secondary" }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "p-6 space-y-5" }, step === 1 && /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted" }, "\u05E9\u05DC\u05D1 1 \u05DE\u05EA\u05D5\u05DA 3: \u05D6\u05D9\u05D4\u05D5\u05D9 \u05D4\u05DE\u05D3\u05D9\u05E0\u05D4 \u05D1\u05DC\u05D1\u05D3. \u05D0\u05EA \u05D4\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05D4\u05E7\u05D1\u05D5\u05E2\u05D9\u05DD (\u05D3\u05D2\u05DC, \u05D0\u05D6\u05D5\u05E8) \u05E0\u05DE\u05DC\u05D0 \u05D1\u05E9\u05DC\u05D1 \u05D4\u05D1\u05D0."), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setMode("new"), className: `px-4 py-2 rounded-xl text-sm font-medium ${mode === "new" ? "bg-blue-600 text-white" : "text-secondary border"}` }, "\u2795 \u05DE\u05D3\u05D9\u05E0\u05D4 \u05D7\u05D3\u05E9\u05D4"), /* @__PURE__ */ React.createElement("button", { onClick: () => setMode("existing"), className: `px-4 py-2 rounded-xl text-sm font-medium ${mode === "existing" ? "bg-blue-600 text-white" : "text-secondary border"}` }, "\u270F\uFE0F \u05DE\u05D3\u05D9\u05E0\u05D4 \u05E7\u05D9\u05D9\u05DE\u05EA")), mode === "existing" ? /* @__PURE__ */ React.createElement("select", { onChange: (e) => selectExisting(e.target.value), className: "input-field w-full border rounded-lg px-3 py-2 text-sm" }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u05D1\u05D7\u05E8 \u05DE\u05D3\u05D9\u05E0\u05D4..."), countries.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.flag, " ", c.name_he))) : /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("input", { placeholder: "Greece", value: country.name_en, onChange: (e) => setCountry((c) => __spreadProps(__spreadValues({}, c), { name_en: e.target.value })), className: "input-field w-full border rounded-lg px-3 py-2 text-sm" }), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mt-0.5" }, "\u05E9\u05DD \u05D1\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA, \u05D0\u05D5\u05EA \u05E8\u05D0\u05E9\u05D5\u05E0\u05D4 \u05D2\u05D3\u05D5\u05DC\u05D4 (name_en)")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("input", { placeholder: "\u05D9\u05D5\u05D5\u05DF", value: country.name_he, onChange: (e) => setCountry((c) => __spreadProps(__spreadValues({}, c), { name_he: e.target.value })), className: "input-field w-full border rounded-lg px-3 py-2 text-sm" }), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mt-0.5" }, "\u05E9\u05DD \u05D1\u05E2\u05D1\u05E8\u05D9\u05EA \u05DC\u05EA\u05E6\u05D5\u05D2\u05D4 (name_he)"))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end" }, /* @__PURE__ */ React.createElement("button", { onClick: goStep2, className: "bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium" }, "\u05D4\u05DE\u05E9\u05DA \u05DC\u05E9\u05DC\u05D1 2 \u2190"))), step === 2 && /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted" }, "\u05E9\u05DC\u05D1 2 \u05DE\u05EA\u05D5\u05DA 3: \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05E7\u05D1\u05D5\u05E2\u05D9\u05DD \u05E9\u05DC \u05D4\u05DE\u05D3\u05D9\u05E0\u05D4 (\u05DC\u05D0 \u05DE\u05E9\u05EA\u05E0\u05D9\u05DD \u05DE\u05E9\u05E0\u05D4 \u05DC\u05E9\u05E0\u05D4)."), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1" }, "\u05D3\u05D2\u05DC"), /* @__PURE__ */ React.createElement("select", { value: country.flag, onChange: (e) => setCountry((c) => __spreadProps(__spreadValues({}, c), { flag: e.target.value })), className: "input-field w-full border rounded-lg px-3 py-2 text-sm" }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u05D1\u05D7\u05E8 \u05D3\u05D2\u05DC..."), flagOptions.map((f) => /* @__PURE__ */ React.createElement("option", { key: f.flag, value: f.flag }, f.flag, " ", f.name)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1" }, "\u05D0\u05D6\u05D5\u05E8 / \u05D9\u05D1\u05E9\u05EA"), /* @__PURE__ */ React.createElement("select", { value: country.region, onChange: (e) => setCountry((c) => __spreadProps(__spreadValues({}, c), { region: e.target.value })), className: "input-field w-full border rounded-lg px-3 py-2 text-sm" }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u05D1\u05D7\u05E8 \u05D0\u05D6\u05D5\u05E8..."), REGION_OPTIONS.map((r) => /* @__PURE__ */ React.createElement("option", { key: r.value, value: r.value }, r.label))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1" }, '\u05DE\u05E8\u05D7\u05E7 \u05DE\u05D9\u05E9\u05E8\u05D0\u05DC (\u05E7"\u05DE)'), /* @__PURE__ */ React.createElement("input", { type: "number", min: "0", step: "1", value: country.Distance, onChange: (e) => setCountry((c) => __spreadProps(__spreadValues({}, c), { Distance: e.target.value })), className: "input-field w-40 border rounded-lg px-3 py-2 text-sm" }), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mt-0.5" }, "\u05DE\u05E8\u05D7\u05E7 \u05D0\u05D5\u05D5\u05D9\u05E8\u05D9 \u05DE\u05E9\u05D5\u05E2\u05E8 \u05D1\u05E7\u05D9\u05DC\u05D5\u05DE\u05D8\u05E8\u05D9\u05DD, \u05DE\u05E1\u05E4\u05E8 \u05E9\u05DC\u05DD (\u05DC\u05DE\u05E9\u05DC: 1200)")), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setStep(1), className: "text-secondary text-sm" }, "\u2192 \u05D7\u05D6\u05E8\u05D4"), /* @__PURE__ */ React.createElement("button", { onClick: goStep3, className: "bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium" }, "\u05D4\u05DE\u05E9\u05DA \u05DC\u05E9\u05DC\u05D1 3 \u2190"))), step === 3 && /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted" }, "\u05E9\u05DC\u05D1 3 \u05DE\u05EA\u05D5\u05DA 3: \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05E9\u05E0\u05EA\u05D9\u05D9\u05DD \u2014 \u05E2\u05E8\u05DB\u05D9\u05DD \u05E9\u05DE\u05E9\u05EA\u05E0\u05D9\u05DD \u05DE\u05E9\u05E0\u05D4 \u05DC\u05E9\u05E0\u05D4."), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1" }, "\u05E9\u05E0\u05D4"), /* @__PURE__ */ React.createElement("input", { type: "number", min: "2000", max: "2100", step: "1", value: year, onChange: (e) => setYear(Number(e.target.value)), className: "input-field border rounded-lg px-3 py-2 text-sm w-32" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, field("hdi", "HDI", { min: 0, max: 1, step: 1e-3, hint: "\u05E2\u05E8\u05DA \u05D1\u05D9\u05DF 0.000 \u05DC-1.000" }), field("outbound_tourism_millions", "\u05E0\u05E4\u05D7 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05D9\u05D5\u05E6\u05D0\u05EA (\u05DE\u05D9\u05DC\u05D9\u05D5\u05DF)", { min: 0, step: 0.1, hint: "\u05DE\u05E1\u05E4\u05E8 \u05E2\u05E9\u05E8\u05D5\u05E0\u05D9, \u05DE\u05D9\u05DC\u05D9\u05D5\u05E0\u05D9 \u05E0\u05D5\u05E1\u05E2\u05D9\u05DD" }), field("air_transport_quality", "\u05D0\u05D9\u05DB\u05D5\u05EA \u05EA\u05E2\u05D5\u05E4\u05D4 (TTDI)", { min: 0, max: 10, step: 0.1, hint: "\u05E2\u05E8\u05DA \u05D1\u05D9\u05DF 0 \u05DC-10" }), field("jewish_population", "\u05D0\u05D5\u05DB\u05DC\u05D5\u05E1\u05D9\u05D9\u05D4 \u05D9\u05D4\u05D5\u05D3\u05D9\u05EA", { min: 0, step: 1, hint: "\u05DE\u05E1\u05E4\u05E8 \u05E9\u05DC\u05DD, \u05D0\u05E0\u05E9\u05D9\u05DD" }), field("online_search_index", "\u05DE\u05D3\u05D3 \u05D7\u05D9\u05E4\u05D5\u05E9 \u05DE\u05E7\u05D5\u05D5\u05DF", { min: 0, max: 100, step: 1, hint: "\u05E2\u05E8\u05DA \u05D1\u05D9\u05DF 0 \u05DC-100" }), field("entries_to_israel_thousands", "\u05DB\u05E0\u05D9\u05E1\u05D5\u05EA \u05DC\u05D9\u05E9\u05E8\u05D0\u05DC (\u05D0\u05DC\u05E4\u05D9\u05DD)", { min: 0, step: 0.1, hint: "\u05DE\u05E1\u05E4\u05E8 \u05E2\u05E9\u05E8\u05D5\u05E0\u05D9, \u05D1\u05D0\u05DC\u05E4\u05D9 \u05D0\u05E0\u05E9\u05D9\u05DD" }), field("gdp_per_capita", "\u05EA\u05D5\u05E6\u05E8 \u05DC\u05E0\u05E4\u05E9 ($)", { min: 0, step: 1, hint: "\u05D3\u05D5\u05DC\u05E8\u05D9\u05DD \u05DC\u05E0\u05E4\u05E9" }), field("average_expenditure_per_trip", "\u05D4\u05D5\u05E6\u05D0\u05D4 \u05DE\u05DE\u05D5\u05E6\u05E2\u05EA \u05DC\u05E0\u05E1\u05D9\u05E2\u05D4 ($)", { min: 0, step: 1, hint: "\u05D3\u05D5\u05DC\u05E8\u05D9\u05DD \u05DC\u05E0\u05E1\u05D9\u05E2\u05D4" }), field("number_of_passengers_per_year", "\u05E0\u05D5\u05E1\u05E2\u05D9\u05DD \u05D1\u05D8\u05D9\u05E1\u05D5\u05EA (\u05E9\u05E0\u05EA\u05D9)", { min: 0, step: 1, hint: "\u05DE\u05E1\u05E4\u05E8 \u05E9\u05DC\u05DD" }), field("evangelical_population", "\u05D0\u05D5\u05DB\u05DC\u05D5\u05E1\u05D9\u05D9\u05D4 \u05D0\u05D5\u05D5\u05E0\u05D2\u05DC\u05D9\u05E1\u05D8\u05D9\u05EA", { min: 0, step: 1, hint: "\u05DE\u05E1\u05E4\u05E8 \u05E9\u05DC\u05DD, \u05D0\u05E0\u05E9\u05D9\u05DD" })), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-4 items-center" }, /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2 text-sm text-secondary" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: !!metric.has_direct_flights, onChange: (e) => setMetric((m) => __spreadProps(__spreadValues({}, m), { has_direct_flights: e.target.checked })) }), " \u2708\uFE0F \u05D8\u05D9\u05E1\u05D5\u05EA \u05D9\u05E9\u05D9\u05E8\u05D5\u05EA"), /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2 text-sm text-secondary" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: !!metric.has_office, onChange: (e) => setMetric((m) => __spreadProps(__spreadValues({}, m), { has_office: e.target.checked })) }), " \u2B50 \u05DC\u05E9\u05DB\u05D4 \u05E4\u05E2\u05D9\u05DC\u05D4 \u05D1\u05E9\u05E0\u05D4 \u05D6\u05D5"), /* @__PURE__ */ React.createElement("label", { className: "text-sm text-secondary flex items-center gap-2" }, "\u05D0\u05D6\u05D4\u05E8\u05EA \u05DE\u05E1\u05E2:", /* @__PURE__ */ React.createElement("select", { value: metric.travel_advisory, onChange: (e) => setMetric((m) => __spreadProps(__spreadValues({}, m), { travel_advisory: e.target.value })), className: "input-field border rounded px-2 py-1 text-sm" }, /* @__PURE__ */ React.createElement("option", { value: 1 }, "1 \xB7 \u05EA\u05E7\u05D9\u05DF"), /* @__PURE__ */ React.createElement("option", { value: 2 }, "2 \xB7 \u05D0\u05D6\u05D4\u05E8\u05D4")))), missingWarning.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "rounded-lg px-3 py-2 text-sm border", style: { background: hexA("#f59e0b", 0.1), borderColor: hexA("#f59e0b", 0.3), color: "#b45309" } }, "\u26A0\uFE0F \u05D9\u05E9 ", missingWarning.length, " \u05E9\u05D3\u05D5\u05EA \u05D7\u05D5\u05D1\u05D4 \u05E8\u05D9\u05E7\u05D9\u05DD. \u05D0\u05E4\u05E9\u05E8 \u05DC\u05DE\u05DC\u05D0 \u05D9\u05D3\u05E0\u05D9\u05EA, \u05DC\u05D4\u05E9\u05DC\u05D9\u05DD \u05D0\u05D5\u05D8\u05D5\u05DE\u05D8\u05D9\u05EA \u05E2\u05DD AI, \u05D0\u05D5 \u05DC\u05D4\u05E9\u05D0\u05D9\u05E8 \u05E8\u05D9\u05E7 \u05D5\u05DC\u05D4\u05DE\u05E9\u05D9\u05DA.", /* @__PURE__ */ React.createElement("div", { className: "mt-2 flex gap-2" }, /* @__PURE__ */ React.createElement("button", { onClick: fillFromAI, disabled: aiFilling, className: "bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium" }, aiFilling ? "\u{1F504} \u05DE\u05E9\u05DC\u05D9\u05DD..." : "\u2728 \u05D4\u05E9\u05DC\u05DD \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05DE\u05D4\u05E8\u05E9\u05EA (AI)"), /* @__PURE__ */ React.createElement("button", { onClick: () => doSave(metric), className: "border border-amber-400 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium" }, "\u05D4\u05E9\u05D0\u05E8 \u05E8\u05D9\u05E7 \u05D5\u05D4\u05DE\u05E9\u05DA"))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setStep(2), className: "text-secondary text-sm" }, "\u2192 \u05D7\u05D6\u05E8\u05D4"), /* @__PURE__ */ React.createElement("button", { onClick: tryFinish, disabled: saving, className: "bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium" }, saving ? "\u05E9\u05D5\u05DE\u05E8..." : "\u2705 \u05E9\u05DE\u05D5\u05E8 \u05DC\u05DE\u05D0\u05D2\u05E8"))))));
  }
  function DataManagementPanel({ countries, allMetrics, onRefresh, onAddNew }) {
    const [filter, setFilter] = useState("");
    const rows = allMetrics.map((m) => __spreadProps(__spreadValues({}, m), { country: countries.find((c) => c.id === m.country_id) })).filter((r) => r.country).filter((r) => !filter || r.country.name_he.includes(filter)).sort((a, b) => a.country.name_he.localeCompare(b.country.name_he) || a.year - b.year);
    const deleteRow = async (row) => {
      if (!confirm(`\u05DC\u05DE\u05D7\u05D5\u05E7 \u05D0\u05EA \u05D4\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05E9\u05DC ${row.country.name_he} \u05DC\u05E9\u05E0\u05EA ${row.year}?`)) return;
      await DataAPI.deleteMetric(row.country_id, row.year);
      onRefresh();
    };
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3 flex-wrap" }, /* @__PURE__ */ React.createElement("input", { value: filter, onChange: (e) => setFilter(e.target.value), placeholder: "\u{1F50E} \u05E1\u05D9\u05E0\u05D5\u05DF \u05DC\u05E4\u05D9 \u05DE\u05D3\u05D9\u05E0\u05D4...", className: "input-field border rounded-lg px-3 py-2 text-sm w-64" }), /* @__PURE__ */ React.createElement("button", { onClick: onAddNew, className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium" }, "\u2795 \u05D4\u05D5\u05E1\u05E4\u05EA \u05DE\u05D3\u05D9\u05E0\u05D4/\u05E9\u05E0\u05D4")), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto rounded-lg border divider max-h-96 overflow-y-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-sm" }, /* @__PURE__ */ React.createElement("thead", { className: "text-secondary sticky top-0", style: { background: "var(--hover-bg)" } }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "text-right px-3 py-2" }, "\u05DE\u05D3\u05D9\u05E0\u05D4"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-3 py-2" }, "\u05E9\u05E0\u05D4"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-3 py-2" }, "\u05DB\u05E0\u05D9\u05E1\u05D5\u05EA (\u05D0\u05DC\u05E4\u05D9\u05DD)"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-3 py-2" }, "\u05DE\u05E7\u05D5\u05E8"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-3 py-2" }))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((r) => /* @__PURE__ */ React.createElement("tr", { key: `${r.country_id}-${r.year}`, className: "border-t divider" }, /* @__PURE__ */ React.createElement("td", { className: "px-3 py-1.5 text-primary" }, r.country.flag, " ", r.country.name_he, " ", r.has_office && "\u2B50"), /* @__PURE__ */ React.createElement("td", { className: "px-3 py-1.5 text-secondary" }, r.year), /* @__PURE__ */ React.createElement("td", { className: "px-3 py-1.5 text-secondary" }, r.entries_to_israel_thousands), /* @__PURE__ */ React.createElement("td", { className: "px-3 py-1.5 text-xs" }, r.is_ai_estimated ? "\u2728 AI" : r.source), /* @__PURE__ */ React.createElement("td", { className: "px-3 py-1.5" }, /* @__PURE__ */ React.createElement("button", { onClick: () => deleteRow(r), className: "text-red-500 hover:text-red-700 text-xs" }, "\u{1F5D1}\uFE0F \u05DE\u05D7\u05E7"))))))));
  }
  function SettingsSidebar({ open, onClose, mode, setMode, currentPassword, onChangePassword, countries, allMetrics, onRefresh }) {
    const [showPwModal, setShowPwModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [showMethodModal, setShowMethodModal] = useState(false);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-40 transition-opacity", style: { background: "var(--overlay-bg)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }, onClick: onClose }), /* @__PURE__ */ React.createElement("div", { className: "fixed top-0 left-0 h-full w-full max-w-sm z-50 shadow-2xl transition-transform duration-300 overflow-y-auto card", style: { transform: open ? "translateX(0)" : "translateX(-100%)" }, dir: "rtl" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 border-b divider flex items-center justify-between sticky top-0 card z-10" }, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-lg text-primary" }, "\u2699\uFE0F \u05D4\u05D2\u05D3\u05E8\u05D5\u05EA"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-1.5 rounded-lg hoverable text-secondary" }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "p-5 space-y-8" }, /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold text-secondary mb-3" }, "\u{1F313} \u05DE\u05E6\u05D1 \u05EA\u05E6\u05D5\u05D2\u05D4"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-2" }, [["light", "\u2600\uFE0F \u05D1\u05D4\u05D9\u05E8"], ["dark", "\u{1F319} \u05DB\u05D4\u05D4"], ["system", "\u{1F5A5}\uFE0F \u05D0\u05D5\u05D8\u05D5\u05DE\u05D8\u05D9"]].map(([key, label]) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key,
        onClick: () => setMode(key),
        className: "flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition",
        style: mode === key ? { borderColor: "#2563eb", background: hexA("#2563eb", 0.12), color: "#2563eb" } : { borderColor: "var(--card-border)", color: "var(--text-secondary)" }
      },
      /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium" }, label)
    ))), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mt-2" }, '\u{1F4A1} "\u05D0\u05D5\u05D8\u05D5\u05DE\u05D8\u05D9" \u05E2\u05D5\u05D1\u05E8 \u05DC\u05DB\u05D4\u05D4 \u05D0\u05D5\u05D8\u05D5\u05DE\u05D8\u05D9\u05EA \u05D1\u05D9\u05DF 19:00 \u05DC-06:00 \u05DC\u05E4\u05D9 \u05E9\u05E2\u05D5\u05DF \u05D4\u05DE\u05DB\u05E9\u05D9\u05E8 \u05E9\u05DC\u05DA.')), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold text-secondary mb-3" }, "\u{1F511} \u05E1\u05D9\u05E1\u05DE\u05D4"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowPwModal(true), className: "w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg" }, "\u05E9\u05D9\u05E0\u05D5\u05D9 \u05E1\u05D9\u05E1\u05DE\u05D4")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold text-secondary mb-3" }, "\u{1F5C4}\uFE0F \u05D1\u05E1\u05D9\u05E1 \u05D4\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowManageModal(true), className: "w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg" }, "\u05E0\u05D9\u05D4\u05D5\u05DC \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD (\u05D4\u05D5\u05E1\u05E4\u05D4 / \u05E2\u05E8\u05D9\u05DB\u05D4 / \u05DE\u05D7\u05D9\u05E7\u05D4)")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold text-secondary mb-3" }, "\u{1F9EE} \u05DE\u05EA\u05D5\u05D3\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowMethodModal(true), className: "w-full px-4 py-2.5 rounded-lg text-sm font-medium border", style: { borderColor: "var(--card-border)", color: "var(--text-primary)" } }, "\u05D0\u05D9\u05DA \u05DE\u05D7\u05D5\u05E9\u05D1\u05EA \u05D4\u05E8\u05D2\u05E8\u05E1\u05D9\u05D4 \u05D4\u05DC\u05D9\u05E0\u05D9\u05D0\u05E8\u05D9\u05EA?")))), showPwModal && /* @__PURE__ */ React.createElement(ChangePasswordModal, { onClose: () => setShowPwModal(false), onChangePassword }), showManageModal && /* @__PURE__ */ React.createElement(DataManagementModal, { onClose: () => setShowManageModal(false), countries, allMetrics, onRefresh }), showMethodModal && /* @__PURE__ */ React.createElement(RegressionMethodologyModal, { onClose: () => setShowMethodModal(false) }));
  }
  function RegressionMethodologyModal({ onClose }) {
    return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[75] flex items-center justify-center p-4", style: { background: "var(--overlay-bg)" }, dir: "rtl" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 border-b divider flex items-center justify-between sticky top-0 card z-10" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg text-primary" }, "\u{1F9EE} \u05D0\u05D9\u05DA \u05DE\u05D7\u05D5\u05E9\u05D1\u05EA \u05D4\u05E8\u05D2\u05E8\u05E1\u05D9\u05D4 \u05D4\u05DC\u05D9\u05E0\u05D9\u05D0\u05E8\u05D9\u05EA \u2014 \u05D4\u05E1\u05D1\u05E8 \u05DE\u05DC\u05D0"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-1.5 rounded-lg hoverable text-secondary" }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "p-6 space-y-5 text-sm text-primary leading-relaxed" }, /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "1\uFE0F\u20E3 \u05E1\u05D5\u05D2 \u05D4\u05DE\u05D5\u05D3\u05DC"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, '\u05E8\u05D2\u05E8\u05E1\u05D9\u05D4 \u05DC\u05D9\u05E0\u05D9\u05D0\u05E8\u05D9\u05EA \u05DE\u05E8\u05D5\u05D1\u05D4 \u05E7\u05DC\u05D0\u05E1\u05D9\u05EA \u05D1\u05E9\u05D9\u05D8\u05EA "\u05E8\u05D9\u05D1\u05D5\u05E2\u05D9\u05DD \u05E4\u05D7\u05D5\u05EA\u05D9\u05DD" (OLS \u2014 Ordinary Least Squares). \u05D4\u05DE\u05D5\u05D3\u05DC \u05DE\u05E0\u05E1\u05D4 \u05DC\u05D4\u05E1\u05D1\u05D9\u05E8 \u05D0\u05EA \u05DE\u05E1\u05E4\u05E8 \u05D4\u05DB\u05E0\u05D9\u05E1\u05D5\u05EA \u05DC\u05D9\u05E9\u05E8\u05D0\u05DC \u05DE\u05DE\u05D3\u05D9\u05E0\u05D4 \u05DE\u05E1\u05D5\u05D9\u05DE\u05EA \u05D1\u05E9\u05E0\u05D4 \u05DE\u05E1\u05D5\u05D9\u05DE\u05EA, \u05DB\u05E4\u05D5\u05E0\u05E7\u05E6\u05D9\u05D4 \u05DC\u05D9\u05E0\u05D9\u05D0\u05E8\u05D9\u05EA \u05E9\u05DC ', /* @__PURE__ */ React.createElement("b", null, "\u05DB\u05DC"), " \u05D4\u05E4\u05E8\u05DE\u05D8\u05E8\u05D9\u05DD \u05D4\u05D6\u05DE\u05D9\u05E0\u05D9\u05DD \u05D1\u05D8\u05D1\u05DC\u05EA \u05D4\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD: \u05DE\u05D3\u05D3 \u05E4\u05D9\u05EA\u05D5\u05D7 \u05D0\u05E0\u05D5\u05E9\u05D9 (HDI), \u05E0\u05E4\u05D7 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05D9\u05D5\u05E6\u05D0\u05EA, \u05DE\u05D3\u05D3 \u05D7\u05D9\u05E4\u05D5\u05E9 \u05DE\u05E7\u05D5\u05D5\u05DF, \u05D0\u05D9\u05DB\u05D5\u05EA \u05EA\u05E9\u05EA\u05D9\u05D5\u05EA \u05EA\u05E2\u05D5\u05E4\u05D4, \u05D0\u05D5\u05DB\u05DC\u05D5\u05E1\u05D9\u05D9\u05D4 \u05D9\u05D4\u05D5\u05D3\u05D9\u05EA, \u05E7\u05D9\u05D5\u05DD \u05D8\u05D9\u05E1\u05D5\u05EA \u05D9\u05E9\u05D9\u05E8\u05D5\u05EA, \u05D5\u05D4\u05E2\u05D3\u05E8 \u05D0\u05D6\u05D4\u05E8\u05EA \u05DE\u05E1\u05E2.")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "2\uFE0F\u20E3 \u05EA\u05E7\u05E0\u05D5\u05DF \u05D4\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD (Standardization)"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, "\u05DC\u05E4\u05E0\u05D9 \u05D4\u05D7\u05D9\u05E9\u05D5\u05D1, \u05DB\u05DC \u05DE\u05E9\u05EA\u05E0\u05D4 (\u05DB\u05D5\u05DC\u05DC \u05D4\u05DE\u05E9\u05EA\u05E0\u05D4 \u05D4\u05DE\u05D5\u05E1\u05D1\u05E8) \u05DE\u05EA\u05D5\u05E7\u05E0\u05DF \u05DC\u05E6\u05D9\u05D5\u05DF \u05EA\u05E7\u05DF (z-score): \u05DE\u05D7\u05E1\u05D9\u05E8\u05D9\u05DD \u05D0\u05EA \u05D4\u05DE\u05DE\u05D5\u05E6\u05E2 \u05D5\u05DE\u05D7\u05DC\u05E7\u05D9\u05DD \u05D1\u05E1\u05D8\u05D9\u05D9\u05EA \u05D4\u05EA\u05E7\u05DF. \u05DB\u05DA \u05DC\u05DB\u05DC \u05DE\u05E9\u05EA\u05E0\u05D4 \u05D9\u05E9 \u05DE\u05DE\u05D5\u05E6\u05E2 0 \u05D5\u05E1\u05D8\u05D9\u05D9\u05EA \u05EA\u05E7\u05DF 1, \u05DC\u05DC\u05D0 \u05E7\u05E9\u05E8 \u05DC\u05D9\u05D7\u05D9\u05D3\u05D5\u05EA \u05D4\u05DE\u05E7\u05D5\u05E8\u05D9\u05D5\u05EA \u05E9\u05DC\u05D5. \u05D6\u05D4 \u05D4\u05DB\u05E8\u05D7\u05D9 \u05DB\u05D3\u05D9 \u05E9\u05D0\u05E4\u05E9\u05E8 \u05D9\u05D4\u05D9\u05D4 \u05DC\u05D4\u05E9\u05D5\u05D5\u05EA \u05D1\u05D9\u05DF \u05D4\u05DE\u05E7\u05D3\u05DE\u05D9\u05DD \u05D1\u05D4\u05DE\u05E9\u05DA.")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "3\uFE0F\u20E3 \u05E4\u05EA\u05E8\u05D5\u05DF \u05D4\u05DE\u05D5\u05D3\u05DC"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, "\u05D4\u05DE\u05D5\u05D3\u05DC \u05E0\u05E4\u05EA\u05E8 \u05D1\u05D0\u05DE\u05E6\u05E2\u05D5\u05EA \u05DE\u05E9\u05D5\u05D5\u05D0\u05D5\u05EA \u05E0\u05D5\u05E8\u05DE\u05DC\u05D9\u05D5\u05EA: X\u1D40X\xB7\u03B2 = X\u1D40y (\u05DB\u05D0\u05E9\u05E8 X \u05D4\u05D9\u05D0 \u05DE\u05D8\u05E8\u05D9\u05E6\u05EA \u05D4\u05E4\u05E8\u05DE\u05D8\u05E8\u05D9\u05DD \u05D4\u05DE\u05EA\u05D5\u05E7\u05E0\u05E0\u05D9\u05DD \u05D5\u05E2\u05DE\u05D5\u05D3\u05EA \u05D7\u05D9\u05EA\u05D5\u05DA, \u05D5-y \u05D4\u05D5\u05D0 \u05D4\u05DE\u05E9\u05EA\u05E0\u05D4 \u05D4\u05DE\u05D5\u05E1\u05D1\u05E8 \u05D4\u05DE\u05EA\u05D5\u05E7\u05E0\u05DF). \u05D4\u05DE\u05E9\u05D5\u05D5\u05D0\u05D5\u05EA \u05E0\u05E4\u05EA\u05E8\u05D5\u05EA \u05D1\u05D0\u05DE\u05E6\u05E2\u05D5\u05EA \u05D0\u05DC\u05D9\u05DE\u05D9\u05E0\u05E6\u05D9\u05D9\u05EA \u05D2\u05D0\u05D5\u05E1-\u05D2'\u05D5\u05E8\u05D3\u05DF \u2014 \u05E9\u05D9\u05D8\u05D4 \u05D0\u05DC\u05D2\u05D1\u05E8\u05D9\u05EA \u05E1\u05D8\u05E0\u05D3\u05E8\u05D8\u05D9\u05EA \u05D5\u05DE\u05D3\u05D5\u05D9\u05E7\u05EA, \u05DC\u05D0 \u05E7\u05D9\u05E8\u05D5\u05D1.")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "4\uFE0F\u20E3 R\xB2 \u2014 \u05DE\u05D9\u05D3\u05EA \u05D4\u05D4\u05EA\u05D0\u05DE\u05D4"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, 'R\xB2 \u05DE\u05D5\u05D3\u05D3 \u05D0\u05D9\u05D6\u05D4 \u05D0\u05D7\u05D5\u05D6 \u05DE\u05D4\u05E9\u05D5\u05E0\u05D5\u05EA \u05D1\u05DB\u05E0\u05D9\u05E1\u05D5\u05EA \u05D4\u05EA\u05D9\u05D9\u05E8\u05D9\u05DD "\u05DE\u05D5\u05E1\u05D1\u05E8" \u05E2\u05DC \u05D9\u05D3\u05D9 \u05DB\u05DC \u05D4\u05E4\u05E8\u05DE\u05D8\u05E8\u05D9\u05DD \u05D1\u05DE\u05D5\u05D3\u05DC, \u05D1\u05E1\u05D5\u05DC\u05DD 0 \u05E2\u05D3 1. \u05DB\u05DB\u05DC \u05E9\u05D2\u05D1\u05D5\u05D4 \u05D9\u05D5\u05EA\u05E8 \u2014 \u05D4\u05DE\u05D5\u05D3\u05DC \u05DE\u05E1\u05D1\u05D9\u05E8 \u05D9\u05D5\u05EA\u05E8. \u05DB\u05DB\u05DC\u05DC \u05D0\u05E6\u05D1\u05E2 \u05D2\u05E1: \u05DE\u05E2\u05DC 0.7 = \u05D4\u05E1\u05D1\u05E8 \u05D7\u05D6\u05E7, 0.4-0.7 = \u05D1\u05D9\u05E0\u05D5\u05E0\u05D9, \u05DE\u05EA\u05D7\u05EA \u05DC-0.4 = \u05D7\u05DC\u05E9 (\u05D9\u05E9 \u05DB\u05E0\u05E8\u05D0\u05D4 \u05D2\u05D5\u05E8\u05DE\u05D9\u05DD \u05DE\u05E9\u05DE\u05E2\u05D5\u05EA\u05D9\u05D9\u05DD \u05E0\u05D5\u05E1\u05E4\u05D9\u05DD \u05DE\u05D7\u05D5\u05E5 \u05DC\u05DE\u05D5\u05D3\u05DC). ', /* @__PURE__ */ React.createElement("b", null, "\u05D7\u05E9\u05D5\u05D1:"), " R\xB2 \u05D2\u05D1\u05D5\u05D4 \u05DE\u05E8\u05D0\u05D4 \u05E7\u05D5\u05E8\u05DC\u05E6\u05D9\u05D4 \u05D7\u05D6\u05E7\u05D4, \u05D0\u05DA \u05D0\u05D9\u05E0\u05D5 \u05DE\u05D5\u05DB\u05D9\u05D7 \u05E7\u05E9\u05E8 \u05E1\u05D9\u05D1\u05EA\u05D9.")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, '5\uFE0F\u20E3 "\u05D0\u05D7\u05D5\u05D6 \u05D4\u05D4\u05E9\u05E4\u05E2\u05D4" \u05E9\u05DC \u05DB\u05DC \u05E4\u05E8\u05DE\u05D8\u05E8 \u2014 \u05D5\u05DE\u05D4 \u05D4\u05DE\u05D2\u05D1\u05DC\u05D4 \u05E9\u05DC\u05D5'), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, "\u05D4\u05D0\u05D7\u05D5\u05D6 \u05DE\u05D7\u05D5\u05E9\u05D1 \u05DB\u05DA: ", /* @__PURE__ */ React.createElement("code", null, "|\u05DE\u05E7\u05D3\u05DD \u05D4\u05E4\u05E8\u05DE\u05D8\u05E8| \xF7 \u05E1\u05DB\u05D5\u05DD \u05DB\u05DC \u05D4\u05DE\u05E7\u05D3\u05DE\u05D9\u05DD \u05D4\u05DE\u05D5\u05D7\u05DC\u05D8\u05D9\u05DD \xD7 100"), '. \u05D6\u05D5 \u05D4\u05E2\u05E8\u05DB\u05D4 \u05E4\u05E9\u05D5\u05D8\u05D4 \u05D5\u05D0\u05D9\u05E0\u05D8\u05D5\u05D0\u05D9\u05D8\u05D9\u05D1\u05D9\u05EA \u05DC"\u05D7\u05E9\u05D9\u05D1\u05D5\u05EA \u05D9\u05D7\u05E1\u05D9\u05EA", \u05D4\u05DE\u05D1\u05D5\u05E1\u05E1\u05EA \u05E2\u05DC \u05DB\u05DA \u05E9\u05DB\u05DC \u05D4\u05DE\u05E7\u05D3\u05DE\u05D9\u05DD \u05DB\u05D1\u05E8 \u05DE\u05EA\u05D5\u05E7\u05E0\u05E0\u05D9\u05DD \u05D5\u05DC\u05DB\u05DF \u05D1\u05E0\u05D9-\u05D4\u05E9\u05D5\u05D5\u05D0\u05D4. ', /* @__PURE__ */ React.createElement("b", null, "\u05D6\u05D5 \u05DC\u05D0 \u05E8\u05DE\u05EA \u05DE\u05D5\u05D1\u05D4\u05E7\u05D5\u05EA \u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9\u05EA (p-value)"), " \u05D5\u05DC\u05D0 \u05E9\u05D9\u05D8\u05EA \u05D9\u05D9\u05D7\u05D5\u05E1 \u05E4\u05D5\u05E8\u05DE\u05DC\u05D9\u05EA (\u05DB\u05DE\u05D5 Shapley values). \u05D4\u05DE\u05D2\u05D1\u05DC\u05D4 \u05D4\u05DE\u05E8\u05DB\u05D6\u05D9\u05EA: \u05D0\u05DD \u05E9\u05E0\u05D9 \u05E4\u05E8\u05DE\u05D8\u05E8\u05D9\u05DD \u05DE\u05EA\u05D5\u05D0\u05DE\u05D9\u05DD \u05D1\u05D9\u05E0\u05D9\u05D4\u05DD (\u05DC\u05DE\u05E9\u05DC HDI \u05D5\u05D7\u05D9\u05E4\u05D5\u05E9 \u05DE\u05E7\u05D5\u05D5\u05DF \u05E2\u05E9\u05D5\u05D9\u05D9\u05DD \u05DC\u05E0\u05D5\u05E2 \u05D9\u05D7\u05D3 \u05D1\u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05DE\u05E4\u05D5\u05EA\u05D7\u05D5\u05EA), \u05D4\u05D0\u05D7\u05D5\u05D6\u05D9\u05DD \u05E2\u05DC\u05D5\u05DC\u05D9\u05DD \u05DC\u05D4\u05D9\u05D5\u05EA \u05DE\u05D5\u05D8\u05D9\u05DD. \u05D6\u05D4\u05D5 \u05DB\u05DC\u05D9 \u05D8\u05D5\u05D1 \u05DC\u05EA\u05D5\u05D1\u05E0\u05D4 \u05E8\u05D0\u05E9\u05D5\u05E0\u05D9\u05EA \u2014 \u05DC\u05D0 \u05EA\u05D7\u05DC\u05D9\u05E3 \u05DC\u05DE\u05D7\u05E7\u05E8 \u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9 \u05DE\u05DC\u05D0.")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "6\uFE0F\u20E3 \u05D4\u05E6\u05D1\u05E2\u05D9\u05DD \u05D1\u05D2\u05E8\u05E3"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, "\u{1F535} \u05DB\u05D7\u05D5\u05DC = \u05D4\u05E9\u05E4\u05E2\u05D4 \u05D7\u05D9\u05D5\u05D1\u05D9\u05EA (\u05DB\u05DB\u05DC \u05E9\u05D4\u05E4\u05E8\u05DE\u05D8\u05E8 \u05D2\u05D1\u05D5\u05D4 \u05D9\u05D5\u05EA\u05E8, \u05DB\u05DA \u05E6\u05E4\u05D5\u05D9\u05D9\u05DD \u05D9\u05D5\u05EA\u05E8 \u05EA\u05D9\u05D9\u05E8\u05D9\u05DD). \u{1F534} \u05D0\u05D3\u05D5\u05DD = \u05D4\u05E9\u05E4\u05E2\u05D4 \u05E9\u05DC\u05D9\u05DC\u05D9\u05EA (\u05DB\u05DB\u05DC \u05E9\u05D4\u05E4\u05E8\u05DE\u05D8\u05E8 \u05D2\u05D1\u05D5\u05D4 \u05D9\u05D5\u05EA\u05E8, \u05DB\u05DA \u05E6\u05E4\u05D5\u05D9\u05D9\u05DD \u05E4\u05D7\u05D5\u05EA \u05EA\u05D9\u05D9\u05E8\u05D9\u05DD).")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "7\uFE0F\u20E3 \u05D0\u05D9\u05DA \u05DC\u05D1\u05D3\u05D5\u05E7 \u05D1\u05E2\u05E6\u05DE\u05DB\u05DD"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, '\u05D1\u05DC\u05E9\u05D5\u05E0\u05D9\u05EA "\u05E0\u05D9\u05EA\u05D5\u05D7 \u05D3\u05D9\u05E8\u05D5\u05D2" \u2192 "\u05E0\u05D9\u05EA\u05D5\u05D7 \u05E8\u05D2\u05E8\u05E1\u05D9\u05D4" \u05D9\u05E9 \u05DB\u05E4\u05EA\u05D5\u05E8 "\u{1F50D} \u05D4\u05E6\u05D2 \u05E0\u05EA\u05D5\u05E0\u05D9 \u05D2\u05DC\u05DD \u05E9\u05E9\u05D9\u05DE\u05E9\u05D5 \u05DC\u05D7\u05D9\u05E9\u05D5\u05D1" \u05E9\u05DE\u05E6\u05D9\u05D2 \u05D0\u05EA \u05DB\u05DC \u05D4\u05E9\u05D5\u05E8\u05D5\u05EA (\u05DE\u05D3\u05D9\u05E0\u05D4/\u05E9\u05E0\u05D4/\u05E2\u05E8\u05DB\u05D9\u05DD) \u05E9\u05E0\u05DB\u05E0\u05E1\u05D5 \u05D1\u05E4\u05D5\u05E2\u05DC \u05DC\u05D7\u05D9\u05E9\u05D5\u05D1. \u05D0\u05E4\u05E9\u05E8 \u05DC\u05D4\u05E2\u05EA\u05D9\u05E7 \u05D0\u05EA \u05D4\u05D8\u05D1\u05DC\u05D4 \u05DC\u05D0\u05E7\u05E1\u05DC \u05D5\u05DC\u05D4\u05E8\u05D9\u05E5 \u05E9\u05DD \u05E8\u05D2\u05E8\u05E1\u05D9\u05D4 \u05DE\u05E7\u05D1\u05D9\u05DC\u05D4 (Data \u2192 Data Analysis \u2192 Regression \u05D1\u05D0\u05E7\u05E1\u05DC, \u05D0\u05D5 \u05E4\u05D5\u05E0\u05E7\u05E6\u05D9\u05D9\u05EA LINEST) \u05DB\u05D3\u05D9 \u05DC\u05D5\u05D5\u05D3\u05D0 \u05E9\u05D4\u05EA\u05D5\u05E6\u05D0\u05D5\u05EA \u05E9\u05DC\u05E0\u05D5 \u05EA\u05D5\u05D0\u05DE\u05D5\u05EA.')), /* @__PURE__ */ React.createElement("section", { className: "rounded-xl p-3", style: { background: hexA("#f59e0b", 0.1), border: `1px solid ${hexA("#f59e0b", 0.3)}` } }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "\u26A0\uFE0F \u05DE\u05D2\u05D1\u05DC\u05D5\u05EA \u05E9\u05D7\u05E9\u05D5\u05D1 \u05DC\u05D4\u05DB\u05D9\u05E8"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, "(1) \u05D0\u05D9\u05DF \u05D7\u05D9\u05E9\u05D5\u05D1 \u05DE\u05D5\u05D1\u05D4\u05E7\u05D5\u05EA \u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9\u05EA (p-values/\u05E8\u05D5\u05D5\u05D7\u05D9 \u05E1\u05DE\u05DA) \u05DC\u05DB\u05DC \u05DE\u05E7\u05D3\u05DD. (2) \u05D0\u05D9\u05DF \u05D8\u05D9\u05E4\u05D5\u05DC \u05E4\u05D5\u05E8\u05DE\u05DC\u05D9 \u05D1\u05E7\u05D5\u05E8\u05DC\u05E6\u05D9\u05D4 \u05D1\u05D9\u05DF \u05E4\u05E8\u05DE\u05D8\u05E8\u05D9\u05DD (multicollinearity). (3) \u05D4\u05DE\u05D5\u05D3\u05DC \u05DE\u05D1\u05D5\u05E1\u05E1 \u05E2\u05DC \u05DB\u05DC \u05D4\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05D1\u05DE\u05D0\u05D2\u05E8 (2010-2019 \u05D1\u05DC\u05D1\u05D3 \u05E2\u05D3\u05D9\u05D9\u05DF) \u2014 \u05DB\u05DB\u05DC \u05E9\u05D9\u05EA\u05D5\u05D5\u05E1\u05E4\u05D5 \u05E9\u05E0\u05D9\u05DD \u05D5\u05DE\u05D3\u05D9\u05E0\u05D5\u05EA, \u05D4\u05EA\u05D5\u05E6\u05D0\u05D5\u05EA \u05E2\u05E9\u05D5\u05D9\u05D5\u05EA \u05DC\u05D4\u05E9\u05EA\u05E0\u05D5\u05EA. \u05D0\u05DD \u05E6\u05E8\u05D9\u05DA \u05E8\u05DE\u05EA \u05D3\u05D9\u05D5\u05E7 \u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9 \u05D2\u05D1\u05D5\u05D4\u05D4 \u05D9\u05D5\u05EA\u05E8 \u05DC\u05E6\u05D5\u05E8\u05DA \u05D4\u05D7\u05DC\u05D8\u05D5\u05EA \u05EA\u05E7\u05E6\u05D9\u05D1\u05D9\u05D5\u05EA \u05DE\u05E9\u05DE\u05E2\u05D5\u05EA\u05D9\u05D5\u05EA, \u05DE\u05D5\u05DE\u05DC\u05E5 \u05DC\u05D4\u05D9\u05D5\u05D5\u05E2\u05E5 \u05D1\u05D0\u05E0\u05DC\u05D9\u05E1\u05D8 \u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9.")))));
  }
  function DataManagementModal({ onClose, countries, allMetrics, onRefresh }) {
    const [showCrud, setShowCrud] = useState(false);
    return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[65] flex items-center justify-center p-4", style: { background: "var(--overlay-bg)" }, dir: "rtl" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 border-b divider flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg text-primary" }, "\u{1F5C4}\uFE0F \u05E0\u05D9\u05D4\u05D5\u05DC \u05D1\u05E1\u05D9\u05E1 \u05D4\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-1.5 rounded-lg hoverable text-secondary" }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "p-6" }, /* @__PURE__ */ React.createElement(DataManagementPanel, { countries, allMetrics, onRefresh, onAddNew: () => setShowCrud(true) }))), showCrud && /* @__PURE__ */ React.createElement(CrudModal, { onClose: () => setShowCrud(false), countries, onSaved: onRefresh }));
  }
  function ChangePasswordModal({ onClose, onChangePassword }) {
    const [newPw, setNewPw] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const save = async () => {
      if (newPw.trim().length < 3) return;
      setSaving(true);
      await DataAPI.setSetting("site_password", newPw.trim());
      onChangePassword(newPw.trim());
      setSaving(false);
      setSaved(true);
      setTimeout(onClose, 1200);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[70] flex items-center justify-center p-4", style: { background: "var(--overlay-bg)" }, dir: "rtl" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl shadow-2xl w-full max-w-sm border" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 border-b divider flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg text-primary" }, "\u{1F511} \u05E9\u05D9\u05E0\u05D5\u05D9 \u05E1\u05D9\u05E1\u05DE\u05D4"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-1.5 rounded-lg hoverable text-secondary" }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "p-5 space-y-4" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        value: newPw,
        autoFocus: true,
        onChange: (e) => setNewPw(e.target.value),
        onKeyDown: (e) => e.key === "Enter" && save(),
        placeholder: "\u05D4\u05D6\u05DF \u05E1\u05D9\u05E1\u05DE\u05D4 \u05D7\u05D3\u05E9\u05D4",
        className: "input-field w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      }
    ), saved && /* @__PURE__ */ React.createElement("p", { className: "text-emerald-500 text-sm" }, "\u2705 \u05D4\u05E1\u05D9\u05E1\u05DE\u05D4 \u05E2\u05D5\u05D3\u05DB\u05E0\u05D4 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4"), /* @__PURE__ */ React.createElement("button", { onClick: save, disabled: saving || newPw.trim().length < 3, className: "w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg text-sm" }, saving ? "\u05E9\u05D5\u05DE\u05E8..." : "\u05E9\u05DE\u05D5\u05E8 \u05E1\u05D9\u05E1\u05DE\u05D4 \u05D7\u05D3\u05E9\u05D4"))));
  }
  const SUB_MODULES = [
    { key: "single", label: "\u{1F50E} \u05E0\u05D9\u05EA\u05D5\u05D7 \u05DE\u05D3\u05D9\u05E0\u05D4 \u05D1\u05D5\u05D3\u05D3\u05EA" },
    { key: "compare", label: "\u2696\uFE0F \u05E0\u05D9\u05EA\u05D5\u05D7 \u05D4\u05E9\u05D5\u05D5\u05D0\u05EA\u05D9" },
    { key: "rank", label: "\u{1F3C6} \u05E0\u05D9\u05EA\u05D5\u05D7 \u05D3\u05D9\u05E8\u05D5\u05D2" }
  ];
  function TabContent({ theme, years, countries, allMetrics }) {
    const [sub, setSub] = useState("single");
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex gap-1 p-1 rounded-2xl border w-fit mb-6 flex-wrap", style: { background: hexA(theme.solid, 0.06), borderColor: hexA(theme.solid, 0.25) } }, SUB_MODULES.map((m) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: m.key,
        onClick: () => setSub(m.key),
        className: `px-4 py-2 rounded-xl text-sm font-medium transition ${sub === m.key ? `bg-gradient-to-l ${theme.grad} text-white shadow-md` : "hoverable"}`,
        style: sub !== m.key ? { color: theme.solid } : {}
      },
      m.label
    ))), sub === "single" && /* @__PURE__ */ React.createElement(SingleCountryDive, { years, theme, countries, allMetrics }), sub === "compare" && /* @__PURE__ */ React.createElement(ComparativeAnalysis, { years, theme, countries, allMetrics }), sub === "rank" && /* @__PURE__ */ React.createElement(RankingAnalysis, { years, theme, countries, allMetrics }));
  }
  const MAX_EXTRACT_CHARS = 9e3;
  async function extractFileContent(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "csv" || ext === "xlsx" || ext === "xls") {
      if (!window.XLSX) throw new Error("\u05E1\u05E4\u05E8\u05D9\u05D9\u05EA \u05E7\u05E8\u05D9\u05D0\u05EA \u05D4\u05D0\u05E7\u05E1\u05DC \u05DC\u05D0 \u05E0\u05D8\u05E2\u05E0\u05D4 (\u05D1\u05D3\u05D5\u05E7 \u05D7\u05D9\u05D1\u05D5\u05E8 \u05DC\u05D0\u05D9\u05E0\u05D8\u05E8\u05E0\u05D8 \u05D5\u05E8\u05E2\u05E0\u05DF).");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      let text = "";
      wb.SheetNames.forEach((name) => {
        const sheet = wb.Sheets[name];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        text += `
== \u05D2\u05D9\u05DC\u05D9\u05D5\u05DF: ${name} ==
${csv}`;
      });
      return text.slice(0, MAX_EXTRACT_CHARS);
    }
    if (ext === "pdf") {
      if (!window.pdfjsLib) throw new Error("\u05E1\u05E4\u05E8\u05D9\u05D9\u05EA \u05E7\u05E8\u05D9\u05D0\u05EA \u05D4-PDF \u05DC\u05D0 \u05E0\u05D8\u05E2\u05E0\u05D4 (\u05D1\u05D3\u05D5\u05E7 \u05D7\u05D9\u05D1\u05D5\u05E8 \u05DC\u05D0\u05D9\u05E0\u05D8\u05E8\u05E0\u05D8 \u05D5\u05E8\u05E2\u05E0\u05DF).");
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages && text.length < MAX_EXTRACT_CHARS; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((it) => it.str).join(" ") + "\n";
      }
      return text.slice(0, MAX_EXTRACT_CHARS);
    }
    throw new Error(`\u05E1\u05D5\u05D2 \u05E7\u05D5\u05D1\u05E5 \u05DC\u05D0 \u05E0\u05EA\u05DE\u05DA: .${ext}. \u05D9\u05E9 \u05DC\u05D4\u05E2\u05DC\u05D5\u05EA Excel (.xlsx/.xls), CSV \u05D0\u05D5 PDF.`);
  }
  function parseParagraphSections(text) {
    return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  }
  function SurveyDrillIn({ theme }) {
    const [file, setFile] = useState(null);
    const [extracting, setExtracting] = useState(false);
    const [extractError, setExtractError] = useState(null);
    const [extractedPreviewLen, setExtractedPreviewLen] = useState(0);
    const [extractedText, setExtractedText] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const fileInputRef = useRef(null);
    const onFileSelected = async (f) => {
      if (!f) return;
      setFile(f);
      setAnalysis(null);
      setAnalysisError(null);
      setExtracting(true);
      setExtractError(null);
      try {
        const text = await extractFileContent(f);
        setExtractedText(text);
        setExtractedPreviewLen(text.length);
      } catch (err) {
        setExtractError(String(err.message || err));
        setExtractedText(null);
      }
      setExtracting(false);
    };
    const runAnalysis = async () => {
      if (!extractedText) return;
      setAnalyzing(true);
      setAnalysisError(null);
      try {
        const res = await DataAPI.generateInsight("survey_analysis", { extracted_text: extractedText, filename: file == null ? void 0 : file.name });
        setAnalysis(sanitizeAiText(res.text));
      } catch (err) {
        setAnalysisError(String(err.message || err));
      }
      setAnalyzing(false);
    };
    const reset = () => {
      setFile(null);
      setExtractedText(null);
      setAnalysis(null);
      setExtractError(null);
      setAnalysisError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border px-5 py-4", style: { background: hexA(theme.solid, 0.07), borderColor: hexA(theme.solid, 0.25) } }, /* @__PURE__ */ React.createElement("h1", { className: `text-lg font-bold ${theme.text}` }, "\u{1F52C} Drill In \u2014 \u05E0\u05D9\u05EA\u05D5\u05D7 \u05E1\u05E7\u05E8\u05D9 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary mt-0.5" }, "\u05D4\u05E2\u05DC\u05D4 \u05E7\u05D5\u05D1\u05E5 \u05E1\u05E7\u05E8 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \u05E0\u05DB\u05E0\u05E1\u05EA (Excel / CSV / PDF) \u05DC\u05E0\u05D9\u05EA\u05D5\u05D7 \u05DE\u05E2\u05DE\u05D9\u05E7 \u05DC\u05E4\u05D9 \u05E1\u05D2\u05DE\u05E0\u05D8\u05D9\u05DD. \u05D4\u05E7\u05D5\u05D1\u05E5 \u05E0\u05E7\u05E8\u05D0 \u05D5\u05DE\u05E2\u05D5\u05D1\u05D3 \u05D1\u05D3\u05E4\u05D3\u05E4\u05DF \u05D1\u05DC\u05D1\u05D3 \u2014 ", /* @__PURE__ */ React.createElement("b", null, "\u05D0\u05D9\u05E0\u05D5 \u05E0\u05E9\u05DE\u05E8"), " \u05D1\u05DE\u05E2\u05E8\u05DB\u05EA.")), !file && /* @__PURE__ */ React.createElement(
      "label",
      {
        className: "flex flex-col items-center justify-center gap-3 rounded-2xl border-4 border-dashed cursor-pointer transition hover:opacity-80",
        style: { borderColor: hexA(theme.solid, 0.35), background: hexA(theme.solid, 0.04), minHeight: 260 }
      },
      /* @__PURE__ */ React.createElement("div", { style: { width: 64, height: 64, borderRadius: "50%", background: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 32, color: "white" } }, "\u2B07\uFE0F")),
      /* @__PURE__ */ React.createElement("p", { className: "text-primary font-semibold" }, "\u05DC\u05D7\u05E5 \u05DB\u05D3\u05D9 \u05DC\u05D4\u05E2\u05DC\u05D5\u05EA \u05E7\u05D5\u05D1\u05E5 \u05E1\u05E7\u05E8"),
      /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted" }, "Excel (.xlsx/.xls) \xB7 CSV \xB7 PDF"),
      /* @__PURE__ */ React.createElement("input", { ref: fileInputRef, type: "file", accept: ".xlsx,.xls,.csv,.pdf", className: "hidden", onChange: (e) => onFileSelected(e.target.files[0]) })
    ), file && /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm text-primary font-medium" }, "\u{1F4C4} ", file.name), /* @__PURE__ */ React.createElement("button", { onClick: reset, className: "text-xs text-red-500" }, "\u{1F5D1}\uFE0F \u05D4\u05E1\u05E8 \u05E7\u05D5\u05D1\u05E5 \u05D5\u05D1\u05D7\u05E8 \u05D0\u05D7\u05E8")), extracting && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-secondary" }, "\u{1F504} \u05E7\u05D5\u05E8\u05D0 \u05D0\u05EA \u05D4\u05E7\u05D5\u05D1\u05E5..."), extractError && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-red-500" }, "\u26A0\uFE0F ", extractError), extractedText && !extracting && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted" }, "\u2705 \u05E0\u05E7\u05E8\u05D0\u05D5 ", fmtNum(extractedPreviewLen), " \u05EA\u05D5\u05D5\u05D9\u05DD \u05DE\u05D4\u05E7\u05D5\u05D1\u05E5 (\u05D0\u05DD \u05D4\u05E7\u05D5\u05D1\u05E5 \u05D0\u05E8\u05D5\u05DA, \u05D9\u05D9\u05EA\u05DB\u05DF \u05E9\u05E0\u05DC\u05E7\u05D7 \u05E8\u05E7 \u05D7\u05DC\u05E7\u05D5 \u05D4\u05E8\u05D0\u05E9\u05D5\u05DF)."), extractedText && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: runAnalysis,
        disabled: analyzing,
        className: `px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-l ${theme.grad} disabled:opacity-50`
      },
      analyzing ? "\u{1F504} \u05DE\u05E0\u05EA\u05D7..." : "\u25B6\uFE0F \u05D1\u05E6\u05E2 \u05E0\u05D9\u05EA\u05D5\u05D7"
    ), analysisError && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-red-500" }, "\u26A0\uFE0F \u05E9\u05D2\u05D9\u05D0\u05D4: ", analysisError), analysis && /* @__PURE__ */ React.createElement("div", { className: "space-y-4 border-t divider pt-4", style: { animation: "fadeIn 0.3s ease-in" } }, parseParagraphSections(analysis).map((para, i) => /* @__PURE__ */ React.createElement("p", { key: i, className: "text-sm text-primary leading-relaxed whitespace-pre-line border-r-4 pr-4", style: { borderColor: theme.solid } }, para)))));
  }
  function NavAssistant() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
      { role: "assistant", text: "\u{1F44B} \u05D4\u05D9\u05D9! \u05D0\u05E0\u05D9 \u05E2\u05D5\u05D6\u05E8 \u05D4\u05E0\u05D9\u05D5\u05D5\u05D8 \u05E9\u05DC \u05D4\u05DE\u05E2\u05E8\u05DB\u05EA. \u05D0\u05E0\u05D9 \u05D9\u05DB\u05D5\u05DC \u05DC\u05E2\u05D6\u05D5\u05E8 \u05DC\u05DA \u05DC\u05D4\u05D1\u05D9\u05DF \u05D0\u05D9\u05DA \u05DC\u05D4\u05E9\u05EA\u05DE\u05E9 \u05D1\u05D0\u05EA\u05E8, \u05DE\u05D4 \u05DB\u05DC \u05DE\u05E1\u05DA \u05E2\u05D5\u05E9\u05D4, \u05D5\u05D0\u05D9\u05DA \u05DE\u05D7\u05D5\u05E9\u05D1\u05D9\u05DD \u05D4\u05DE\u05D3\u05D3\u05D9\u05DD \u05D5\u05D4\u05E0\u05D5\u05E1\u05D7\u05D0\u05D5\u05EA. \u05D1\u05DE\u05D4 \u05D0\u05D5\u05DB\u05DC \u05DC\u05E2\u05D6\u05D5\u05E8?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    useEffect(() => {
      var _a;
      (_a = scrollRef.current) == null ? void 0 : _a.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages, open]);
    const send = async () => {
      const q = input.trim();
      if (!q || loading) return;
      const nextMessages = [...messages, { role: "user", text: q }];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);
      try {
        const history = nextMessages.slice(-8).map((m) => `${m.role === "user" ? "\u05DE\u05E9\u05EA\u05DE\u05E9" : "\u05E2\u05D5\u05D6\u05E8"}: ${m.text}`).join("\n");
        const res = await DataAPI.generateInsight("nav_help", { question: q, history });
        setMessages((prev) => [...prev, { role: "assistant", text: sanitizeAiText(res.text) }]);
      } catch (err) {
        setMessages((prev) => [...prev, { role: "assistant", text: "\u26A0\uFE0F \u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05E4\u05E0\u05D9\u05D9\u05D4 \u05DC\u05E2\u05D5\u05D6\u05E8: " + String(err.message || err) }]);
      }
      setLoading(false);
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        title: "\u05E2\u05D5\u05D6\u05E8 \u05E0\u05D9\u05D5\u05D5\u05D8 AI",
        style: {
          position: "fixed",
          bottom: 24,
          left: 24,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #86efac, #4ade80)",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 0 0 6px rgba(74,222,128,0.15), 0 4px 14px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26
        }
      },
      open ? "\u2715" : "\u{1F4AC}"
    ), open && /* @__PURE__ */ React.createElement("div", { dir: "rtl", className: "card border", style: {
      position: "fixed",
      bottom: 90,
      left: 24,
      zIndex: 9998,
      width: 380,
      maxWidth: "90vw",
      height: 500,
      maxHeight: "70vh",
      borderRadius: 16,
      boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    } }, /* @__PURE__ */ React.createElement("div", { className: "p-3 border-b divider flex items-center gap-2", style: { background: "linear-gradient(135deg, #86efac33, #4ade8033)" } }, /* @__PURE__ */ React.createElement("span", { className: "text-lg" }, "\u{1F4AC}"), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-primary text-sm" }, "\u05E2\u05D5\u05D6\u05E8 \u05E0\u05D9\u05D5\u05D5\u05D8 AI")), /* @__PURE__ */ React.createElement("div", { ref: scrollRef, className: "flex-1 overflow-y-auto p-3 space-y-2" }, messages.map((m, i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        className: `text-sm rounded-xl px-3 py-2 max-w-[85%] ${m.role === "user" ? "mr-auto text-white" : "ml-auto"}`,
        style: m.role === "user" ? { background: "#4ade80" } : { background: "var(--hover-bg)", color: "var(--text-primary)" }
      },
      m.text
    )), loading && /* @__PURE__ */ React.createElement("div", { className: "text-xs text-muted" }, "\u{1F504} \u05D7\u05D5\u05E9\u05D1...")), /* @__PURE__ */ React.createElement("div", { className: "p-3 border-t divider flex gap-2" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: input,
        onChange: (e) => setInput(e.target.value),
        onKeyDown: (e) => e.key === "Enter" && send(),
        placeholder: "\u05E9\u05D0\u05DC \u05D0\u05D5\u05EA\u05D9 \u05E2\u05DC \u05D4\u05E9\u05D9\u05DE\u05D5\u05E9 \u05D1\u05D0\u05EA\u05E8...",
        className: "input-field flex-1 border rounded-lg px-3 py-2 text-sm"
      }
    ), /* @__PURE__ */ React.createElement("button", { onClick: send, disabled: loading, className: "bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm" }, "\u27A4"))));
  }
  function App() {
    const [authed, setAuthed] = useState(false);
    const [password, setPassword] = useState("tourism.marketing");
    const [activeTab, setActiveTab] = useState("t1");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mode, setMode] = useState("light");
    const [systemDark, setSystemDark] = useState(false);
    const [countries, setCountries] = useState([]);
    const [allMetrics, setAllMetrics] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataError, setDataError] = useState(null);
    const loadData = useCallback(async () => {
      setDataLoading(true);
      try {
        const [c, m] = await Promise.all([DataAPI.fetchCountries(), DataAPI.fetchAllMetrics()]);
        setCountries(c);
        setAllMetrics(m);
        setJewishPopBounds(m.map((r) => r.jewish_population));
        setDataError(null);
      } catch (err) {
        console.error(err);
        setDataError(String(err.message || err));
      }
      setDataLoading(false);
    }, []);
    useEffect(() => {
      DataAPI.getSetting("site_password", "tourism.marketing").then(setPassword);
      loadData();
    }, [loadData]);
    useEffect(() => {
      const checkClock = () => {
        const hour = (/* @__PURE__ */ new Date()).getHours();
        const isNight = hour >= 19 || hour < 6;
        setSystemDark(isNight);
      };
      checkClock();
      const interval = setInterval(checkClock, 60 * 1e3);
      return () => clearInterval(interval);
    }, []);
    const isDark = mode === "dark" || mode === "system" && systemDark;
    const isDrillIn = activeTab === "drillin";
    const theme = isDrillIn ? DRILLIN_THEME : TAB_THEMES[activeTab];
    if (!authed) return /* @__PURE__ */ React.createElement(LoginScreen, { onLogin: () => setAuthed(true), currentPassword: password });
    return /* @__PURE__ */ React.createElement("div", { dir: "rtl", "data-mode": isDark ? "dark" : "light", className: "app-page min-h-screen transition-colors duration-300" }, /* @__PURE__ */ React.createElement(GlobalStyles, null), /* @__PURE__ */ React.createElement("header", { className: "app-nav sticky top-0 z-30 border-b shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(MinistryLogo, { size: 36 }), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-primary hidden sm:block" }, "\u{1F9F3} \u05E9\u05D9\u05D5\u05D5\u05E7 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \xB7 BI")), /* @__PURE__ */ React.createElement("nav", { className: "flex-1 flex justify-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-1 p-1 rounded-2xl overflow-x-auto max-w-full", style: { background: "var(--hover-bg)" } }, Object.entries(TAB_THEMES).map(([key, t]) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key,
        onClick: () => setActiveTab(key),
        className: `px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${activeTab === key ? `bg-gradient-to-l ${t.grad} text-white shadow-md` : "text-secondary hoverable"}`
      },
      t.name
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setActiveTab("drillin"),
        className: `px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${isDrillIn ? `bg-gradient-to-l ${DRILLIN_THEME.grad} text-white shadow-md` : "text-secondary hoverable"}`
      },
      DRILLIN_THEME.navLabel
    ))), /* @__PURE__ */ React.createElement("button", { onClick: () => setSidebarOpen(true), className: "p-2 rounded-xl hoverable transition shrink-0 text-secondary" }, "\u2699\uFE0F"))), /* @__PURE__ */ React.createElement("main", { className: "max-w-7xl mx-auto px-4 py-6" }, !isDrillIn && /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border px-5 py-4 mb-6", style: { background: hexA(theme.solid, 0.07), borderColor: hexA(theme.solid, 0.25) } }, /* @__PURE__ */ React.createElement("h1", { className: `text-lg font-bold ${theme.text}` }, theme.name), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary mt-0.5" }, "\u{1F4C5} ", theme.years[0], "\u2013", theme.years[theme.years.length - 1], " \xB7 \u{1F30D} ", countries.length, " \u05DE\u05D3\u05D9\u05E0\u05D5\u05EA \u05D1\u05DE\u05D0\u05D2\u05E8")), isDrillIn && /* @__PURE__ */ React.createElement(SurveyDrillIn, { theme: DRILLIN_THEME }), !isDrillIn && dataLoading && /* @__PURE__ */ React.createElement("div", { className: "text-center py-20 text-secondary" }, "\u{1F504} \u05D8\u05D5\u05E2\u05DF \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05DE\u05D4\u05DE\u05D0\u05D2\u05E8..."), !isDrillIn && dataError && /* @__PURE__ */ React.createElement("div", { className: "text-center py-20 text-red-500" }, "\u26A0\uFE0F \u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D8\u05E2\u05D9\u05E0\u05EA \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD: ", dataError, /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-secondary" }, "\u05D1\u05D3\u05D5\u05E7 \u05D0\u05EA config.js (SUPABASE_URL / ANON_KEY) \u05D5\u05D0\u05EA \u05DE\u05D3\u05D9\u05E0\u05D9\u05D5\u05EA \u05D4-RLS.")), !isDrillIn && !dataLoading && !dataError && /* @__PURE__ */ React.createElement(TabContent, { theme, years: theme.years, countries, allMetrics })), /* @__PURE__ */ React.createElement("footer", { className: "text-center text-xs text-muted py-8" }, "\u{1F9F3} \u05DE\u05E2\u05E8\u05DB\u05EA \u05E0\u05D9\u05EA\u05D5\u05D7 \u05E9\u05D9\u05D5\u05D5\u05E7 \u05EA\u05D9\u05D9\u05E8\u05D5\u05EA \xB7 \u05DE\u05E9\u05E8\u05D3 \u05D4\u05EA\u05D9\u05D9\u05E8\u05D5\u05EA"), /* @__PURE__ */ React.createElement(SettingsSidebar, { open: sidebarOpen, onClose: () => setSidebarOpen(false), mode, setMode, currentPassword: password, onChangePassword: setPassword, countries, allMetrics, onRefresh: loadData }), /* @__PURE__ */ React.createElement(NavAssistant, null));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
})();
