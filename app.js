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
  const printChartRegistry = /* @__PURE__ */ new Set();
  function resizeAllChartsForPrint() {
  requestAnimationFrame(() => {
    printChartRegistry.forEach((c) => {
      try { c.resize(); } catch (e) {}
    });
  });
}
if (typeof window !== "undefined") {
  window.addEventListener("beforeprint", resizeAllChartsForPrint);
  window.addEventListener("afterprint", resizeAllChartsForPrint); // ← זה היה חסר
  if (window.matchMedia) {
    const mql = window.matchMedia("print");
    const handler = () => resizeAllChartsForPrint(); // תפעיל גם ביציאה מ-print, לא רק בכניסה
    if (mql.addEventListener) mql.addEventListener("change", handler);
    else if (mql.addListener) mql.addListener(handler);
  }
}
  const sb = window.supabase.createClient(
    window.APP_CONFIG.SUPABASE_URL,
    window.APP_CONFIG.SUPABASE_ANON_KEY
  );
  const YEARS_2010_2019 = Array.from({ length: 10 }, (_, i) => 2010 + i);
  const YEARS_2023_TODAY = [2023, 2024, 2025, 2026];
  const YEARS_FULL = [...YEARS_2010_2019, ...YEARS_2023_TODAY];
  const TAB_THEMES = {
    t1: { name: "🗓️ ניתוח נתונים 2010-2019", grad: "from-sky-500 to-blue-600", text: "text-sky-700 dark:text-sky-300", solid: "#0284c7", years: YEARS_2010_2019 },
    t2: { name: "📡 ניתוח נתונים 2023-היום", grad: "from-blue-600 to-indigo-600", text: "text-blue-700 dark:text-blue-300", solid: "#2563eb", years: YEARS_2023_TODAY },
    t3: { name: "🗄️ ניתוח מאגר נתונים מקיף", grad: "from-indigo-600 to-blue-900", text: "text-indigo-700 dark:text-indigo-300", solid: "#4338ca", years: YEARS_FULL },
    flights: { name: "✈️ מצב תעופתי כיום", grad: "from-cyan-500 to-teal-600", text: "text-cyan-700 dark:text-cyan-300", solid: "#0891b2" }
  };
  const RANK_PARAMS = [
    { key: "sentiment", label: "❤️ אהדה פרו-ישראלית" },
    { key: "roi", label: "💹 רווחיות (יעילות המרה)" },
    { key: "religiousAffinity", label: "🕎 זיקה דתית" },
    { key: "totalScore", label: "🏆 ציון כולל (משוקלל)" }
  ];
  function fmtNum(n) {
    return n === void 0 || n === null || isNaN(n) ? "-" : new Intl.NumberFormat("he-IL").format(Math.round(n));
  }
  function fmtDec(n) {
    return n === void 0 || n === null || isNaN(n) ? "-" : new Intl.NumberFormat("he-IL", { maximumFractionDigits: 2 }).format(n);
  }
  function sanitizeAiText(text) {
    if (!text) return text;
    return text.replace(/\*+/g, "").replace(/^#{1,6}\s*/gm, "").replace(/^[-•]\s+/gm, "").trim();
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
  function israelWallClockISO(date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jerusalem",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).formatToParts(date);
    const get = (t) => { var _a; return (_a = parts.find((p) => p.type === t)) == null ? void 0 : _a.value; };
    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
  }
  function nowAsIsraelNaiveDate() {
    return new Date(israelWallClockISO(/* @__PURE__ */ new Date()));
  }
  function fmtHM(ts) {
    if (!ts) return "-";
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "-";
    }
  }
  function fmtDayHM(ts) {
    if (!ts) return "-";
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "-";
    }
  }
  function fmtRelativeMinutes(mins) {
    if (mins == null || isNaN(mins)) return "-";
    const abs = Math.abs(Math.round(mins));
    if (abs < 60) return `${abs} דק'`;
    const h = Math.floor(abs / 60), m = abs % 60;
    return m ? `${h} שע' ${m} דק'` : `${h} שע'`;
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
    const advisoryByYear = {};
    filtered.forEach((r) => {
      visitorsByYear[r.year] = (r.entries_to_israel_thousands || 0) * 1e3;
      advisoryByYear[r.year] = r.travel_advisory;
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
    const roiScore = Math.round(Math.min(100, Math.max(0, roi * 20)));
    const first = filtered[0].entries_to_israel_thousands || 0;
    const last = filtered[filtered.length - 1].entries_to_israel_thousands || 0;
    const growthPct = first > 0 ? (last - first) / first * 100 : 0;
    const growthTrend = Math.round(Math.min(100, Math.max(0, 50 + growthPct / 4)));
    const totalScore = Math.round(sentiment * 0.35 + religiousAffinity * 0.25 + roiScore * 0.25 + growthTrend * 0.15);
    return {
      visitorsByYear,
      advisoryByYear,
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
    { key: "hdi", label: "מדד פיתוח אנושי (HDI)", get: (r) => r.hdi },
    { key: "outbound_tourism_millions", label: "נפח תיירות יוצאת", get: (r) => r.outbound_tourism_millions },
    { key: "online_search_index", label: "מדד חיפוש מקוון", get: (r) => r.online_search_index },
    { key: "air_transport_quality", label: "איכות תשתיות תעופה", get: (r) => r.air_transport_quality },
    { key: "jewish_population", label: "אוכלוסייה יהודית", get: (r) => r.jewish_population },
    { key: "has_direct_flights", label: "טיסות ישירות (יש/אין)", get: (r) => r.has_direct_flights == null ? null : r.has_direct_flights ? 1 : 0 },
    { key: "travel_advisory", label: "העדר אזהרת מסע", get: (r) => r.travel_advisory == null ? null : r.travel_advisory === 1 ? 1 : 0 },
    { key: "gdp_per_capita", label: "תוצר לנפש", get: (r) => r.gdp_per_capita },
    { key: "average_expenditure_per_trip", label: "הוצאה ממוצעת לנסיעה", get: (r) => r.average_expenditure_per_trip },
    { key: "number_of_passengers_per_year", label: "נוסעים בטיסות (שנתי)", get: (r) => r.number_of_passengers_per_year },
    { key: "evangelical_population", label: "אוכלוסייה אוונגליסטית", get: (r) => r.evangelical_population },
    { key: "distance", label: "מרחק מישראל (ק״מ)", get: (r) => r.distance }
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
  function invertMatrix(A) {
    const n = A.length;
    const M = A.map((row, i) => {
      const aug = new Array(n).fill(0);
      aug[i] = 1;
      return [...row, ...aug];
    });
    for (let col = 0; col < n; col++) {
      let pivotRow = col;
      for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivotRow][col])) pivotRow = r;
      [M[col], M[pivotRow]] = [M[pivotRow], M[col]];
      const pivot = M[col][col] || 1e-9;
      for (let c = 0; c < 2 * n; c++) M[col][c] /= pivot;
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const factor = M[r][col];
        for (let c = 0; c < 2 * n; c++) M[r][c] -= factor * M[col][c];
      }
    }
    return M.map((row) => row.slice(n));
  }
  function gammln(x) {
    const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x, tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) { y += 1; ser += cof[j] / y; }
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }
  function betacf(a, b, x) {
    const MAXIT = 200, EPS = 3e-9, FPMIN = 1e-30;
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c; h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }
  function betai(a, b, x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(gammln(a + b) - gammln(a) - gammln(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
    return 1 - bt * betacf(b, a, 1 - x) / b;
  }
  function tTestPValue(t, df) {
    if (!isFinite(t) || df <= 0) return null;
    const x = df / (df + t * t);
    const p = betai(df / 2, 0.5, x);
    return Math.max(0, Math.min(1, p));
  }
  function getValidRegressionRows(allMetrics, years) {
    return allMetrics.filter(
      (r) => years.includes(r.year) && REGRESSION_FIELDS.every((f) => f.get(r) != null) && r.entries_to_israel_thousands != null
    );
  }
  function olsR2(yZ, predictorZList) {
    const n = yZ.length;
    const p = predictorZList.length + 1;
    const X = yZ.map((_, i) => [1, ...predictorZList.map((z) => z[i])]);
    const XtX = Array.from({ length: p }, () => Array(p).fill(0));
    const Xty = Array(p).fill(0);
    for (let i = 0; i < n; i++) {
      for (let a = 0; a < p; a++) {
        Xty[a] += X[i][a] * yZ[i];
        for (let b = 0; b < p; b++) XtX[a][b] += X[i][a] * X[i][b];
      }
    }
    const beta = solveLinearSystem(XtX, Xty);
    const predictions = X.map((row) => row.reduce((s, v, idx) => s + v * beta[idx], 0));
    const ssRes = predictions.reduce((s, pred, i) => s + (yZ[i] - pred) ** 2, 0);
    const ssTot = yZ.reduce((s, v) => s + v ** 2, 0);
    return ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
  }
  function computeVIFs(predictorStats) {
    return predictorStats.map((target, i) => {
      const others = predictorStats.filter((_, j) => j !== i).map((s) => s.z);
      if (others.length === 0) return 1;
      const r2 = olsR2(target.z, others);
      return r2 >= 0.999 ? Infinity : 1 / (1 - r2);
    });
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
    const dfResid = n - p;
    const sigma2 = dfResid > 0 ? ssRes / dfResid : NaN;
    let se = new Array(p).fill(null), tStats = new Array(p).fill(null), pValues = new Array(p).fill(null);
    if (dfResid > 0) {
      const XtXinv = invertMatrix(XtX);
      se = XtXinv.map((row, i) => Math.sqrt(Math.max(sigma2 * row[i], 0)));
      tStats = beta.map((b, i) => se[i] > 0 ? b / se[i] : 0);
      pValues = tStats.map((t) => tTestPValue(t, dfResid));
    }
    const vifs = computeVIFs(predictorStats);
    const influence = REGRESSION_FIELDS.map((f, i) => ({
      key: f.key,
      label: f.label,
      coefficient: coeffs[i],
      influencePct: Math.round(Math.abs(coeffs[i]) / sumAbs * 1e3) / 10,
      direction: coeffs[i] >= 0 ? "positive" : "negative",
      pValue: pValues[i + 1],
      vif: vifs[i]
    })).sort((a, b) => b.influencePct - a.influencePct);
    return { n, r2: Math.round(r2 * 100) / 100, influence, intercept: beta[0], dfResid };
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
    },
    async fetchFlights({ direction = "all", sinceHours = 24, aheadHours = 24, limit = 800 } = {}) {
      const nowReal = /* @__PURE__ */ new Date();
      const from = israelWallClockISO(new Date(nowReal.getTime() - sinceHours * 3600 * 1e3));
      const to = israelWallClockISO(new Date(nowReal.getTime() + aheadHours * 3600 * 1e3));
      let q = sb.from("flights").select("*").gte("scheduled_time", from).lte("scheduled_time", to).order("scheduled_time", { ascending: false }).limit(limit);
      if (direction && direction !== "all") q = q.eq("direction", direction);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    async fetchFlightsSyncMeta() {
      const [{ data: last, error: e1 }, { count, error: e2 }] = await Promise.all([
        sb.from("flights").select("synced_at").order("synced_at", { ascending: false }).limit(1),
        sb.from("flights").select("id", { count: "exact", head: true })
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      return { lastSyncedAt: last && last[0] ? last[0].synced_at : null, totalRows: count != null ? count : null };
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
      .tooltip-bubble-fixed { background:#fef9c3; color:#78350f; font-size:12px; padding:8px 10px; border-radius:8px;
        box-shadow:0 4px 12px rgba(0,0,0,0.15); z-index:9999; line-height:1.5; text-align:right; pointer-events:none; }
      @keyframes fadeIn{ from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      @keyframes shake{ 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
      @media print {
        .app-nav, .no-print, button { display: none !important; }
        body, .app-page { background: white !important; }
        .card { break-inside: avoid; border: 1px solid #ccc !important; }
        .grid { display: block !important; }
        .grid > * { width: 100% !important; margin-bottom: 12px; }
        canvas { max-width: 100% !important; }
        .overflow-x-auto { overflow: visible !important; max-width: 100% !important; }
      }
    `);
  }
  function InfoTip({ text }) {
    const iconRef = useRef(null);
    const [pos, setPos] = useState(null);
    const BUBBLE_MAX = 260;
    const MARGIN = 12;
    const computePosition = () => {
      if (!iconRef.current) return;
      const r = iconRef.current.getBoundingClientRect();
      const width = Math.min(BUBBLE_MAX, window.innerWidth - MARGIN * 2);
      let left = r.right - width;
      left = Math.max(MARGIN, Math.min(left, window.innerWidth - width - MARGIN));
      let top = r.top - 8;
      setPos({ top, left, width });
    };
    const show = () => {
      computePosition();
    };
    const hide = () => setPos(null);
    return /* @__PURE__ */ React.createElement(
      "span",
      {
        ref: iconRef,
        className: "tooltip-i text-muted",
        onMouseEnter: show,
        onMouseLeave: hide,
        onFocus: show,
        onBlur: hide,
        tabIndex: 0
      },
      /* @__PURE__ */ React.createElement("span", { style: { width: 15, height: 15, borderRadius: "50%", border: "1px solid currentColor", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" } }, "i"),
      pos && ReactDOM.createPortal(
        /* @__PURE__ */ React.createElement(
          "span",
          {
            className: "tooltip-bubble-fixed",
            style: { position: "fixed", top: pos.top, left: pos.left, width: pos.width, transform: "translateY(-100%)" }
          },
          text
        ),
        document.body
      )
    );
  }
  function ExportBar() {
    return /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 justify-end no-print" }, /* @__PURE__ */ React.createElement("button", { onClick: () => window.print(), className: "text-xs px-3 py-1.5 rounded-lg border text-secondary hoverable flex items-center gap-1.5", style: { borderColor: "var(--card-border)" } }, "🖨️ ייצוא ל-PDF / הדפסה"));
  }
  function ChartCanvas({ type, data, options, height = 260, onChartReady }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const wrapRef = useRef(null);
    useEffect(() => {
      if (!canvasRef.current) return;
      if (chartRef.current) {
        printChartRegistry.delete(chartRef.current);
        chartRef.current.destroy();
      }
      const mergedOptions = onChartReady ? __spreadProps(__spreadValues({}, options), {
        onResize: (chart) => {
          requestAnimationFrame(() => onChartReady(chart));
        }
      }) : options;
      chartRef.current = new Chart(canvasRef.current.getContext("2d"), { type, data, options: mergedOptions });
      printChartRegistry.add(chartRef.current);
      if (onChartReady) requestAnimationFrame(() => onChartReady(chartRef.current));
      return () => {
        if (chartRef.current) {
          printChartRegistry.delete(chartRef.current);
          chartRef.current.destroy();
        }
      };
    }, [JSON.stringify(data), JSON.stringify(options), type]);
    return /* @__PURE__ */ React.createElement("div", { ref: wrapRef, style: { height } }, /* @__PURE__ */ React.createElement("canvas", { ref: canvasRef }));
  }
  function MinistryLogo({ size = 40 }) {
    return /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center shrink-0", style: { height: size, width: size * 1.43 } }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "logo.jpg",
        alt: "לוגו משרד התיירות",
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
        setError("🚫 סיסמה שגויה. נסו שוב.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden", dir: "rtl" }, /* @__PURE__ */ React.createElement(GlobalStyles, null), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 opacity-25", style: { backgroundImage: "radial-gradient(circle at 20% 20%, #0284c7 0, transparent 40%), radial-gradient(circle at 80% 70%, #4338ca 0, transparent 40%)" } }), /* @__PURE__ */ React.createElement("div", { className: `relative z-10 w-full max-w-md mx-4 ${shake ? "animate-[shake_0.4s]" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center justify-center mb-4 bg-white/90 rounded-xl p-3 shadow-lg" }, /* @__PURE__ */ React.createElement(MinistryLogo, { size: 56 })), /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-bold text-white tracking-tight" }, "🧳 מערכת ניתוח שיווק תיירות"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm mt-1" }, "✈️ לוח בקרה אנליטי — גישה מוגבלת 🔒")), /* @__PURE__ */ React.createElement("form", { onSubmit: submit, className: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl" }, /* @__PURE__ */ React.createElement("label", { className: "block text-sm text-slate-300 mb-2 font-medium" }, "🔑 סיסמת גישה"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
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
        placeholder: "הזינו סיסמה",
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
      showPw ? "🙈" : "👁️"
    )), error && /* @__PURE__ */ React.createElement("p", { className: "text-red-400 text-sm mt-2" }, error), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: submit, className: "w-full mt-6 bg-gradient-to-l from-sky-500 to-blue-700 hover:from-sky-400 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition shadow-lg cursor-pointer" }, "🚪 כניסה למערכת")), /* @__PURE__ */ React.createElement("p", { className: "text-center text-slate-500 text-xs mt-6" }, "© 2026 משרד התיירות · מחלקת שיווק")));
  }
  const WORLD_COUNTRIES_HE = [
    { name_he: "יוון", name_en: "Greece", flag: "🇬🇷", lat: 37.98, lng: 23.73, distance_km: 1253 },
    { name_he: "קפריסין", name_en: "Cyprus", flag: "🇨🇾", lat: 35.17, lng: 33.36, distance_km: 415 },
    { name_he: "מצרים", name_en: "Egypt", flag: "🇪🇬", lat: 30.04, lng: 31.24, distance_km: 425 },
    { name_he: "ירדן", name_en: "Jordan", flag: "🇯🇴", lat: 31.95, lng: 35.93, distance_km: 71 },
    { name_he: "טורקיה", name_en: "Turkey", flag: "🇹🇷", lat: 39.93, lng: 32.86, distance_km: 932 },
    { name_he: "פורטוגל", name_en: "Portugal", flag: "🇵🇹", lat: 38.72, lng: -9.14, distance_km: 4061 },
    { name_he: "מרוקו", name_en: "Morocco", flag: "🇲🇦", lat: 34.02, lng: -6.83, distance_km: 3906 },
    { name_he: "הולנד", name_en: "Netherlands", flag: "🇳🇱", lat: 52.37, lng: 4.9, distance_km: 3348 },
    { name_he: "בלגיה", name_en: "Belgium", flag: "🇧🇪", lat: 50.85, lng: 4.35, distance_km: 3297 },
    { name_he: "שוויץ", name_en: "Switzerland", flag: "🇨🇭", lat: 46.95, lng: 7.45, distance_km: 2898 },
    { name_he: "אוסטריה", name_en: "Austria", flag: "🇦🇹", lat: 48.21, lng: 16.37, distance_km: 2420 },
    { name_he: "שוודיה", name_en: "Sweden", flag: "🇸🇪", lat: 59.33, lng: 18.07, distance_km: 3320 },
    { name_he: "נורווגיה", name_en: "Norway", flag: "🇳🇴", lat: 59.91, lng: 10.75, distance_km: 3612 },
    { name_he: "דנמרק", name_en: "Denmark", flag: "🇩🇰", lat: 55.68, lng: 12.57, distance_km: 3190 },
    { name_he: "פינלנד", name_en: "Finland", flag: "🇫🇮", lat: 60.17, lng: 24.94, distance_km: 3248 },
    { name_he: "אירלנד", name_en: "Ireland", flag: "🇮🇪", lat: 53.35, lng: -6.26, distance_km: 4072 },
    { name_he: "הונגריה", name_en: "Hungary", flag: "🇭🇺", lat: 47.5, lng: 19.04, distance_km: 2222 },
    { name_he: "צ'כיה", name_en: "Czechia", flag: "🇨🇿", lat: 50.09, lng: 14.42, distance_km: 2665 },
    { name_he: "רומניה", name_en: "Romania", flag: "🇷🇴", lat: 44.43, lng: 26.1, distance_km: 1616 },
    { name_he: "בולגריה", name_en: "Bulgaria", flag: "🇧🇬", lat: 42.7, lng: 23.32, distance_km: 1605 },
    { name_he: "קרואטיה", name_en: "Croatia", flag: "🇭🇷", lat: 45.81, lng: 15.98, distance_km: 2273 },
    { name_he: "סרביה", name_en: "Serbia", flag: "🇷🇸", lat: 44.79, lng: 20.45, distance_km: 1932 },
    { name_he: "סלובקיה", name_en: "Slovakia", flag: "🇸🇰", lat: 48.15, lng: 17.11, distance_km: 2375 },
    { name_he: "סלובניה", name_en: "Slovenia", flag: "🇸🇮", lat: 46.06, lng: 14.51, distance_km: 2381 },
    { name_he: "ליטא", name_en: "Lithuania", flag: "🇱🇹", lat: 54.69, lng: 25.28, distance_km: 2667 },
    { name_he: "לטביה", name_en: "Latvia", flag: "🇱🇻", lat: 56.95, lng: 24.11, distance_km: 2927 },
    { name_he: "אסטוניה", name_en: "Estonia", flag: "🇪🇪", lat: 59.44, lng: 24.75, distance_km: 3174 },
    { name_he: "בלארוס", name_en: "Belarus", flag: "🇧🇾", lat: 53.9, lng: 27.57, distance_km: 2535 },
    { name_he: "מולדובה", name_en: "Moldova", flag: "🇲🇩", lat: 47.01, lng: 28.86, distance_km: 1779 },
    { name_he: "יפן", name_en: "Japan", flag: "🇯🇵", lat: 35.68, lng: 139.65, distance_km: 9145 },
    { name_he: "תאילנד", name_en: "Thailand", flag: "🇹🇭", lat: 13.75, lng: 100.5, distance_km: 6887 },
    { name_he: "וייטנאם", name_en: "Vietnam", flag: "🇻🇳", lat: 21.03, lng: 105.85, distance_km: 7019 },
    { name_he: "אינדונזיה", name_en: "Indonesia", flag: "🇮🇩", lat: -6.21, lng: 106.85, distance_km: 8664 },
    { name_he: "מלזיה", name_en: "Malaysia", flag: "🇲🇾", lat: 3.14, lng: 101.69, distance_km: 7609 },
    { name_he: "סינגפור", name_en: "Singapore", flag: "🇸🇬", lat: 1.35, lng: 103.82, distance_km: 7916 },
    { name_he: "איחוד האמירויות", name_en: "UAE", flag: "🇦🇪", lat: 24.47, lng: 54.37, distance_km: 2042 },
    { name_he: "ערב הסעודית", name_en: "Saudi Arabia", flag: "🇸🇦", lat: 24.71, lng: 46.68, distance_km: 1369 },
    { name_he: "קטאר", name_en: "Qatar", flag: "🇶🇦", lat: 25.29, lng: 51.53, distance_km: 1747 },
    { name_he: "כווית", name_en: "Kuwait", flag: "🇰🇼", lat: 29.38, lng: 47.98, distance_km: 1250 },
    { name_he: "מקסיקו", name_en: "Mexico", flag: "🇲🇽", lat: 19.43, lng: -99.13, distance_km: 12527 },
    { name_he: "ארגנטינה", name_en: "Argentina", flag: "🇦🇷", lat: -34.6, lng: -58.38, distance_km: 12237 },
    { name_he: "צ'ילה", name_en: "Chile", flag: "🇨🇱", lat: -33.45, lng: -70.67, distance_km: 13229 },
    { name_he: "קולומביה", name_en: "Colombia", flag: "🇨🇴", lat: 4.71, lng: -74.07, distance_km: 11529 },
    { name_he: "פרו", name_en: "Peru", flag: "🇵🇪", lat: -12.05, lng: -77.04, distance_km: 12803 },
    { name_he: "דרום אפריקה", name_en: "South Africa", flag: "🇿🇦", lat: -25.75, lng: 28.19, distance_km: 6439 },
    { name_he: "ניגריה", name_en: "Nigeria", flag: "🇳🇬", lat: 9.08, lng: 7.4, distance_km: 3819 },
    { name_he: "קניה", name_en: "Kenya", flag: "🇰🇪", lat: -1.29, lng: 36.82, distance_km: 3680 },
    { name_he: "אתיופיה", name_en: "Ethiopia", flag: "🇪🇹", lat: 9.03, lng: 38.74, distance_km: 2554 },
    { name_he: "אוסטרליה", name_en: "Australia", flag: "🇦🇺", lat: -35.28, lng: 149.13, distance_km: 13992 },
    { name_he: "ניו זילנד", name_en: "New Zealand", flag: "🇳🇿", lat: -41.29, lng: 174.78, distance_km: 16287 },
    { name_he: "אזרבייג'ן", name_en: "Azerbaijan", flag: "🇦🇿", lat: 40.41, lng: 49.87, distance_km: 1627 },
    { name_he: "גאורגיה", name_en: "Georgia", flag: "🇬🇪", lat: 41.72, lng: 44.79, distance_km: 1395 },
    { name_he: "ארמניה", name_en: "Armenia", flag: "🇦🇲", lat: 40.18, lng: 44.51, distance_km: 1253 },
    { name_he: "קזחסטן", name_en: "Kazakhstan", flag: "🇰🇿", lat: 51.18, lng: 71.45, distance_km: 3653 },
    { name_he: "אוזבקיסטן", name_en: "Uzbekistan", flag: "🇺🇿", lat: 41.3, lng: 69.24, distance_km: 3195 },
    { name_he: "אירן", name_en: "Iran", flag: "🇮🇷", lat: 35.69, lng: 51.39, distance_km: 1556 },
    { name_he: "עיראק", name_en: "Iraq", flag: "🇮🇶", lat: 33.31, lng: 44.36, distance_km: 874 },
    { name_he: "לבנון", name_en: "Lebanon", flag: "🇱🇧", lat: 33.89, lng: 35.5, distance_km: 237 },
    { name_he: "מלטה", name_en: "Malta", flag: "🇲🇹", lat: 35.9, lng: 14.51, distance_km: 1963 },
    { name_he: "איסלנד", name_en: "Iceland", flag: "🇮🇸", lat: 64.15, lng: -21.94, distance_km: 5288 },
    { name_he: "לוקסמבורג", name_en: "Luxembourg", flag: "🇱🇺", lat: 49.61, lng: 6.13, distance_km: 3120 }
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
        placeholder: "🔎 הקלידו שם מדינה...",
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
      /* @__PURE__ */ React.createElement("span", { className: "text-xs mr-auto" }, '✨ יושלם ע"י AI')
    )), noMatchesAtAll && query.trim() && /* @__PURE__ */ React.createElement(
      "button",
      {
        onMouseDown: () => {
          onChange(query.trim());
          setOpen(false);
        },
        className: "w-full text-right px-4 py-3 hoverable text-sm flex items-center gap-2 text-blue-500 font-medium"
      },
      '✨ "',
      query.trim(),
      '" לא נמצאה — הפעל הערכת AI'
    ), !query.trim() && /* @__PURE__ */ React.createElement("div", { className: "px-4 py-3 text-sm text-muted" }, "התחילו להקליד לחיפוש")));
  }
  function KpiCard({ emoji, label, value, sub, accentSolid, tip }) {
    return /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-secondary flex items-center gap-1" }, emoji, " ", label, " ", tip && /* @__PURE__ */ React.createElement(InfoTip, { text: tip }))), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-primary" }, value), sub && /* @__PURE__ */ React.createElement("div", { className: "text-xs text-muted mt-1" }, sub));
  }
  function AiEstimateBadge() {
    return /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", style: { background: "linear-gradient(to left,#f0abfc22,#818cf822)", color: "#818cf8", border: "1px solid #818cf855" } }, "✨🤖 נתונים הוערכו על ידי AI (Gemini)");
  }
  function AiLoadingState({ name }) {
    return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-20 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-4xl animate-spin" }, "🔄"), /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-primary" }, '🔍 "', name, '" לא נמצאה במאגר הנתונים'), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-secondary mt-1" }, "🤖 שולח בקשה ל-Gemini להשלמת נתונים משוערים...")));
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
          country: { id: null, name_he: nameHe, flag: "🌐", region: "🌐 מוערך על ידי AI", has_office: false }
        });
      }).catch((err) => {
        console.error(err);
        setState({ loading: false, metrics: null, estimated: false, country: null, error: String(err) });
      });
    }, [nameHe, countries, allMetrics, years]);
    return state;
  }
  function OpenQuestionAI({ theme, subject, data, placeholder, hint }) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const ask = async () => {
      const q = question.trim();
      if (!q || loading) return;
      setLoading(true);
      setError(null);
      setAnswer(null);
      try {
        const res = await DataAPI.generateInsight("custom_question", {
          subject,
          data,
          question: q
        });
        setAnswer(sanitizeAiText(res.text));
      } catch (err) {
        setError(String(err.message || err));
      }
      setLoading(false);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm space-y-3" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary text-sm flex items-center gap-2" }, "💬 שאלה חופשית ל-AI — ", subject), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted" }, hint || "שאלו כל שאלה על בסיס הנתונים שכבר מוצגים למעלה, ותקבלו תשובה מנוסחת מ-Gemini."), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: question,
        onChange: (e) => setQuestion(e.target.value),
        onKeyDown: (e) => e.key === "Enter" && ask(),
        placeholder: placeholder || "לדוגמה: האם כדאי להשקיע כאן יותר תקציב שיווק בקיץ?",
        className: "input-field flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: ask,
        disabled: loading || !question.trim(),
        className: `px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-l ${theme.grad} disabled:opacity-50 shrink-0`
      },
      loading ? "🔄 חושב..." : "▶️ שאל"
    )), error && /* @__PURE__ */ React.createElement("p", { className: "text-red-500 text-sm" }, "⚠️ שגיאה: ", error), answer && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-primary leading-relaxed whitespace-pre-line border-r-4 pr-4", style: { borderColor: theme.solid, animation: "fadeIn 0.3s ease-in" } }, answer));
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
          label: "🛂 מבקרים",
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
        labels: ["❤️ אהדה", "🕎 זיקה דתית", "📈 צמיחה", "🏆 ציון כולל"],
        datasets: [{
          label: (country == null ? void 0 : country.name_he) || "",
          data: [metrics.sentiment, metrics.religiousAffinity, metrics.growthTrend, metrics.totalScore],
          backgroundColor: theme.solid,
          borderRadius: 6
        }]
      };
    }, [metrics, theme, country]);
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-md" }, /* @__PURE__ */ React.createElement(CountryPicker, { label: "🌍 בחר מדינה לניתוח מעמיק", value: countryName, onChange: setCountryName, countries })), loading && /* @__PURE__ */ React.createElement(AiLoadingState, { name: countryName }), !loading && error && /* @__PURE__ */ React.createElement("div", { className: "text-center py-16" }, /* @__PURE__ */ React.createElement("p", { className: "text-red-500 font-medium" }, '⚠️ נכשלה השלמת הנתונים עבור "', countryName, '"'), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary mt-2" }, error)), !loading && metrics && country && /* @__PURE__ */ React.createElement("div", { className: "space-y-5", style: { animation: "fadeIn 0.3s ease-in" } }, /* @__PURE__ */ React.createElement(ExportBar, null), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 flex-wrap" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-primary flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl" }, country.flag || "🌐"), " ", country.name_he, metrics.hasOffice && /* @__PURE__ */ React.createElement("span", { title: "לשכה פעילה", className: "text-lg" }, "⭐")), /* @__PURE__ */ React.createElement("span", { className: "text-xs px-2.5 py-1 rounded-full font-medium", style: { background: hexA(theme.solid, 0.12), color: theme.solid } }, country.region), estimated && /* @__PURE__ */ React.createElement(AiEstimateBadge, null)), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement(KpiCard, { emoji: "🛂", label: "סה״כ נכנסים לישראל", value: fmtCompact(metrics.sumVisitors), accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "✈️", label: "נפח תיירות יוצאת מצטבר", value: `${fmtNum(metrics.sumOutbound)}M`, accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "❤️", label: "אהדה פרו-ישראלית", value: `${metrics.sentiment}/100`, tip: "ציון מחושב (לא סקר דעת קהל אמיתי): 60% ממדד חיפוש מקוון (online_search_index) + 40% ממצב אזהרת המסע (תקין=100, אזהרה=50), בממוצע על פני טווח השנים הנבחר.", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "💹", label: "רווחיות (יעילות המרה)", value: `${metrics.roi}%`, tip: "אחוז מסך התיירות היוצאת של המדינה שהומר לכניסות בפועל לישראל.", accentSolid: theme.solid })), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-2 gap-5" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "📈 מגמת כניסות לישראל"), lineData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "line", data: lineData, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } })), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "📊 פרופיל מדדים"), barData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: barData, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { max: 100 } } } }))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement(KpiCard, { emoji: "🕎", label: "זיקה דתית", value: `${metrics.religiousAffinity}/100`, sub: `אוכ' יהודית: ${fmtCompact(metrics.avgJewishPop)}`, tip: "מנורמל על סולם לוגריתמי מול כל המדינות במאגר.", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "📊", label: "מדד HDI ממוצע", value: fmtDec(metrics.avgHdi), accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "🛫", label: "איכות תעופה (TTDI)", value: fmtDec(metrics.avgAirQuality), sub: metrics.hasDirectFlights ? "✅ טיסות ישירות" : "❌ אין טיסות ישירות", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "🏆", label: "ציון כולל", value: `${metrics.totalScore}/100`, sub: metrics.advisoryYears > 0 ? `⚠️ ${metrics.advisoryYears} שנות אזהרה` : "✅ ללא אזהרות", tip: "ממוצע משוקלל: 35% אהדה, 25% זיקה דתית, 25% רווחיות, 15% מגמת צמיחה.", accentSolid: theme.solid })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement(KpiCard, { emoji: "💵", label: "תוצר לנפש", value: metrics.avgGdpPerCapita ? `$${fmtNum(metrics.avgGdpPerCapita)}` : "-", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "🧳", label: "הוצאה ממוצעת לנסיעה", value: metrics.avgExpenditurePerTrip ? `$${fmtNum(metrics.avgExpenditurePerTrip)}` : "-", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "✝️", label: "אוכלוסייה אוונגליסטית", value: fmtCompact(metrics.avgEvangelicalPop), accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "📍", label: "מרחק מישראל", value: country.Distance ? `${fmtNum(country.Distance)} ק"מ` : "-", accentSolid: theme.solid })), /* @__PURE__ */ React.createElement(CouncilAnalysis, { key: country.name_he, country, metrics, theme }), metrics.hasOffice && /* @__PURE__ */ React.createElement(OfficeContributionAnalysis, { key: `office-${country.name_he}`, country, metrics, countries, allMetrics, years, theme }), /* @__PURE__ */ React.createElement(CompetitorAnalysis, { key: `comp-${country.name_he}`, country, theme }), /* @__PURE__ */ React.createElement(OpenQuestionAI, { key: `ask-${country.name_he}`, theme, subject: country.name_he, data: { sumVisitors: metrics.sumVisitors, sumOutbound: metrics.sumOutbound, sentiment: metrics.sentiment, religiousAffinity: metrics.religiousAffinity, roi: metrics.roi, growthTrend: metrics.growthTrend, totalScore: metrics.totalScore, avgHdi: metrics.avgHdi, avgGdpPerCapita: metrics.avgGdpPerCapita } })));
  }
  const COUNCIL_SECTIONS = [
    { key: "executive_summary", label: "תקציר מנהלים", emoji: "📋" },
    { key: "economic_characteristics", label: "מאפיינים כלכליים", emoji: "💰" },
    { key: "religious_affinity", label: "זיקה דתית", emoji: "🕎" },
    { key: "sentiment_toward_israel", label: "אהדה לישראל", emoji: "❤️" },
    { key: "council_verdict", label: "ניתוח המועצה", emoji: "🏛️" }
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
    return /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3 mb-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary text-sm flex items-center gap-2" }, "🏛️ ניתוח המועצה — ", country.name_he), /* @__PURE__ */ React.createElement("button", { onClick: run, disabled: loading, className: `px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-l ${theme.grad} disabled:opacity-50` }, loading ? "🔄 המועצה מתכנסת..." : data ? "🔄 הרץ מחדש" : "▶️ בצע ניתוח")), error && /* @__PURE__ */ React.createElement("p", { className: "text-red-500 text-sm" }, "⚠️ שגיאה: ", error), !data && !loading && !error && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted" }, 'לחץ "בצע ניתוח" כדי לקבל ניתוח אסטרטגי מעמיק: תקציר מנהלים, מאפיינים כלכליים, זיקה דתית, אהדה לישראל, וסיכום ה"מועצה" עם ציון כולל.'), data && /* @__PURE__ */ React.createElement("div", { className: "space-y-4", style: { animation: "fadeIn 0.3s ease-in" } }, COUNCIL_SECTIONS.map((s) => data[s.key] ? /* @__PURE__ */ React.createElement("div", { key: s.key, className: "border-r-4 pr-4", style: { borderColor: theme.solid } }, /* @__PURE__ */ React.createElement("h5", { className: "font-semibold text-primary text-sm mb-1.5" }, s.emoji, " ", s.label), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-secondary leading-relaxed whitespace-pre-line" }, data[s.key])) : null), data.final_score != null && /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-2 pt-2 border-t divider" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm text-secondary" }, "🏆 ציון כולל:"), /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold", style: { color: theme.solid } }, data.final_score, "/100"))));
  }
  const COMPARE_METRIC_DEFS = [
    { key: "sentiment", label: "❤️ אהדה פרו-ישראלית", weight: 0.35, max: 100 },
    { key: "religiousAffinity", label: "🕎 זיקה דתית", weight: 0.25, max: 100 },
    { key: "roiScore", label: "💹 רווחיות", weight: 0.25, max: 100 },
    { key: "growthTrend", label: "📈 מגמת צמיחה", weight: 0.15, max: 100 }
  ];
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
    const [conclusion, setConclusion] = useState(null);
    const [conclusionLoading, setConclusionLoading] = useState(false);
    const [conclusionError, setConclusionError] = useState(null);
    const [yearPixelPositions, setYearPixelPositions] = useState(null);
    const handleLineChartReady = useCallback((chart) => {
      if (!chart || !chart.scales || !chart.scales.x) return;
      const xScale = chart.scales.x;
      const positions = years.map((_, i) => xScale.getPixelForTick ? xScale.getPixelForTick(i) : xScale.getPixelForValue(i));
      setYearPixelPositions(positions);
    }, [years]);
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
        labels: COMPARE_METRIC_DEFS.map((m) => m.label),
        datasets: [
          { label: c1, data: COMPARE_METRIC_DEFS.map((m) => r1.metrics[m.key]), backgroundColor: theme.solid },
          { label: c2, data: COMPARE_METRIC_DEFS.map((m) => r2.metrics[m.key]), backgroundColor: "#94a3b8" }
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
    const gap = useMemo(() => {
      if (!r1.metrics || !r2.metrics) return null;
      const leader = r1.metrics.totalScore >= r2.metrics.totalScore ? { name: c1, m: r1.metrics } : { name: c2, m: r2.metrics };
      const trailer = leader.name === c1 ? { name: c2, m: r2.metrics } : { name: c1, m: r1.metrics };
      const scoreDiff = Math.round(Math.abs(r1.metrics.totalScore - r2.metrics.totalScore));
      let topDriver = null, topDriverDiff = -1;
      COMPARE_METRIC_DEFS.forEach((m) => {
        const advantage = leader.m[m.key] - trailer.m[m.key];
        if (advantage <= 0) return;
        const weighted = advantage * m.weight;
        if (weighted > topDriverDiff) {
          topDriverDiff = weighted;
          topDriver = m;
        }
      });
      if (!topDriver) {
        let bestAbs = -1;
        COMPARE_METRIC_DEFS.forEach((m) => {
          const weightedAbs = Math.abs(leader.m[m.key] - trailer.m[m.key]) * m.weight;
          if (weightedAbs > bestAbs) {
            bestAbs = weightedAbs;
            topDriver = m;
          }
        });
      }
      const offsetByOthers = topDriver ? Math.round(topDriverDiff) > scoreDiff + 1 : false;
      return { leader, trailer, scoreDiff, topDriver, offsetByOthers };
    }, [r1.metrics, r2.metrics, c1, c2]);
    const runConclusion = async () => {
      setConclusionLoading(true);
      setConclusionError(null);
      try {
        const res = await DataAPI.generateInsight("comparative_analysis", {
          c1,
          c2,
          m1: { sentiment: r1.metrics.sentiment, religiousAffinity: r1.metrics.religiousAffinity, roi: r1.metrics.roi, growthTrend: r1.metrics.growthTrend, totalScore: r1.metrics.totalScore },
          m2: { sentiment: r2.metrics.sentiment, religiousAffinity: r2.metrics.religiousAffinity, roi: r2.metrics.roi, growthTrend: r2.metrics.growthTrend, totalScore: r2.metrics.totalScore }
        });
        setConclusion(sanitizeAiText(res.text));
      } catch (err) {
        setConclusionError(String(err.message || err));
      }
      setConclusionLoading(false);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-2 gap-4 max-w-2xl" }, /* @__PURE__ */ React.createElement(CountryPicker, { label: "🇦 מדינה א'", value: c1, onChange: (v) => {
      setC1(v);
      setConclusion(null);
    }, countries, exclude: [c2] }), /* @__PURE__ */ React.createElement(CountryPicker, { label: "🇧 מדינה ב'", value: c2, onChange: (v) => {
      setC2(v);
      setConclusion(null);
    }, countries, exclude: [c1] })), (r1.loading || r2.loading) && /* @__PURE__ */ React.createElement(AiLoadingState, { name: r1.loading ? c1 : c2 }), !r1.loading && !r2.loading && (r1.error || r2.error) && /* @__PURE__ */ React.createElement("div", { className: "text-center py-16" }, /* @__PURE__ */ React.createElement("p", { className: "text-red-500 font-medium" }, "⚠️ נכשלה השלמת נתונים"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary mt-2" }, r1.error || r2.error)), !r1.loading && !r2.loading && r1.metrics && r2.metrics && /* @__PURE__ */ React.createElement("div", { className: "space-y-5", style: { animation: "fadeIn 0.3s ease-in" } }, /* @__PURE__ */ React.createElement(ExportBar, null), /* @__PURE__ */ React.createElement("div", { className: "flex gap-6 flex-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl" }, (_c = r1.country) == null ? void 0 : _c.flag), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-primary" }, c1), r1.estimated && /* @__PURE__ */ React.createElement(AiEstimateBadge, null)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xl" }, (_d = r2.country) == null ? void 0 : _d.flag), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-primary" }, c2), r2.estimated && /* @__PURE__ */ React.createElement(AiEstimateBadge, null))), gap && gap.topDriver && /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl p-4 border flex items-center gap-3", style: { background: hexA(theme.solid, 0.07), borderColor: hexA(theme.solid, 0.25) } }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl" }, "🎯"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-primary leading-relaxed" }, /* @__PURE__ */ React.createElement("b", null, gap.leader.name), " מובילה על ", /* @__PURE__ */ React.createElement("b", null, gap.trailer.name), " ב-", /* @__PURE__ */ React.createElement("b", null, gap.scoreDiff), " נקודות ציון כולל. הגורם המשמעותי ביותר לטובת ", gap.leader.name, " הוא ", /* @__PURE__ */ React.createElement("b", null, gap.topDriver.label), " (", fmtDec(gap.leader.m[gap.topDriver.key]), " מול ", fmtDec(gap.trailer.m[gap.topDriver.key]), ")", gap.offsetByOthers ? /* @__PURE__ */ React.createElement(React.Fragment, null, ", אך יתרון זה מקוזז חלקית על ידי מדדים אחרים שבהם ", gap.trailer.name, " חזקה יותר — ולכן הפער הכולל קטן מהפער בממד הבודד הזה.") : ".")), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "📈 השוואת מגמת מבקרים"), lineData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "line", data: lineData, options: { responsive: true, maintainAspectRatio: false, scales: { x: { offset: false } } }, onChartReady: handleLineChartReady }), /* @__PURE__ */ React.createElement("div", { className: "mt-3 space-y-2" }, [{ name: c1, m: r1.metrics, color: theme.solid }, { name: c2, m: r2.metrics, color: "#94a3b8" }].map(({ name, m, color }) => /* @__PURE__ */ React.createElement("div", { key: name }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 text-xs mb-1" }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" } }), /* @__PURE__ */ React.createElement("span", { className: "text-secondary" }, name)), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", height: 12, direction: "ltr" } }, (yearPixelPositions || []).map((px, i) => {
      const y = years[i];
      return /* @__PURE__ */ React.createElement("div", {
        key: y,
        title: `${y}: ${m.advisoryByYear[y] === 2 ? "אזהרת מסע" : "תקין"}`,
        style: { position: "absolute", left: px - 5, top: 0, width: 10, height: 12, borderRadius: 2, background: m.advisoryByYear[y] === 2 ? "#ef4444" : hexA(color, 0.3) }
      });
    })))), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, background: "#ef4444", display: "inline-block", borderRadius: 2 } }), " שנים עם אזהרת מסע — בדקו אם הן מתואמות לירידות בגרף"))), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-2 gap-5" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "⚖️ השוואת מדדים מרכזיים (סולם 0-100)"), barData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: barData, options: { responsive: true, maintainAspectRatio: false } })), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm flex items-center gap-1.5" }, "💹 השוואת רווחיות (%)", /* @__PURE__ */ React.createElement(InfoTip, { text: "מוצג בגרף נפרד כי סולם הערכים שלו קטן משמעותית משאר המדדים (בדרך כלל פחות מ-1-2%)." })), roiChartData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: roiChartData, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } }))), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "🏅 מי מוביל בכל מדד"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-4 mb-3" }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5 text-xs font-semibold", style: { color: theme.solid } }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: "50%", background: theme.solid, display: "inline-block" } }), c1), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5 text-xs font-semibold text-secondary" }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: "50%", background: "#94a3b8", display: "inline-block" } }), c2)), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, COMPARE_METRIC_DEFS.map((m) => {
      const v1 = r1.metrics[m.key], v2 = r2.metrics[m.key];
      const c1Wins = v1 > v2, tie = v1 === v2;
      return /* @__PURE__ */ React.createElement("div", { key: m.key, className: "flex items-center justify-between text-sm py-1.5 border-b divider last:border-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-secondary" }, m.label), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement("span", { className: `font-semibold ${c1Wins && !tie ? "" : "text-secondary"}`, style: c1Wins && !tie ? { color: theme.solid } : {} }, c1Wins && !tie && "👑 ", fmtDec(v1)), /* @__PURE__ */ React.createElement("span", { className: "text-muted" }, "·"), /* @__PURE__ */ React.createElement("span", { className: `font-semibold ${!c1Wins && !tie ? "" : "text-secondary"}`, style: !c1Wins && !tie ? { color: theme.solid } : {} }, !tie && !c1Wins && "👑 ", fmtDec(v2))));
    }))), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3 mb-3" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary text-sm" }, "💬 מסקנה אסטרטגית"), /* @__PURE__ */ React.createElement("button", { onClick: runConclusion, disabled: conclusionLoading, className: `px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-l ${theme.grad} disabled:opacity-50` }, conclusionLoading ? "🔄 מנתח..." : conclusion ? "🔄 הרץ מחדש" : "▶️ בצע ניתוח השוואתי")), conclusionError && /* @__PURE__ */ React.createElement("p", { className: "text-red-500 text-sm" }, "⚠️ שגיאה: ", conclusionError), conclusion && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-primary leading-relaxed whitespace-pre-line", style: { animation: "fadeIn 0.3s ease-in" } }, conclusion), !conclusion && !conclusionLoading && !conclusionError && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted" }, "לחץ לקבלת ניתוח מנוסח: איזו מדינה חזקה יותר, ולאן כדאי להפנות משאבי שיווק.")), /* @__PURE__ */ React.createElement(OpenQuestionAI, { key: `ask-${c1}-${c2}`, theme, subject: `${c1} מול ${c2}`, data: { c1, c2, m1: { sentiment: r1.metrics.sentiment, religiousAffinity: r1.metrics.religiousAffinity, roi: r1.metrics.roi, growthTrend: r1.metrics.growthTrend, totalScore: r1.metrics.totalScore }, m2: { sentiment: r2.metrics.sentiment, religiousAffinity: r2.metrics.religiousAffinity, roi: r2.metrics.roi, growthTrend: r2.metrics.growthTrend, totalScore: r2.metrics.totalScore } }, placeholder: `לדוגמה: מה ההבדל העיקרי בין ${c1} ל-${c2}?` })));
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
              [name]: { metrics: deriveMetrics(result.rows, years), estimated: true, country: { flag: "🌐", name_he: name } }
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
    const medals = ["🥇", "🥈", "🥉"];
    const readyToShow = selected.length >= 3 && ranked.length > 0;
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-2" }, "🧭 בחירה מהירה לפי סינון"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, regionsAvailable.map((r) => {
      var _a;
      return /* @__PURE__ */ React.createElement("button", { key: r, onClick: () => filterByRegion(r), className: "text-xs px-3 py-1.5 rounded-full border text-secondary hoverable", style: { borderColor: "var(--card-border)" } }, "🌍 ", ((_a = REGION_OPTIONS.find((o) => o.value === r)) == null ? void 0 : _a.label) || r);
    }), /* @__PURE__ */ React.createElement("button", { onClick: filterPremium, className: "text-xs px-3 py-1.5 rounded-full border text-secondary hoverable", style: { borderColor: "var(--card-border)" } }, "🏆 שווקי פרימיום (HDI גבוה)"), /* @__PURE__ */ React.createElement("button", { onClick: filterEmerging, className: "text-xs px-3 py-1.5 rounded-full border text-secondary hoverable", style: { borderColor: "var(--card-border)" } }, "🌱 שווקים מתפתחים"), /* @__PURE__ */ React.createElement("button", { onClick: filterReligious, className: "text-xs px-3 py-1.5 rounded-full border text-secondary hoverable", style: { borderColor: "var(--card-border)" } }, "🕎 זיקה דתית גבוהה"), /* @__PURE__ */ React.createElement("button", { onClick: filterWithOffice, className: "text-xs px-3 py-1.5 rounded-full border text-secondary hoverable", style: { borderColor: "var(--card-border)" } }, "⭐ עם לשכה פעילה")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mt-2" }, "לחיצה מחליפה את הבחירה הנוכחית ברשימת המדינות המתאימות לסינון (עד 10).")), /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-2 gap-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1.5" }, "🌍 בחר מדינות לדירוג (3-10)"), /* @__PURE__ */ React.createElement("div", { className: "relative mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
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
        placeholder: "הקלד שם מדינה...",
        className: "input-field flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      }
    ), /* @__PURE__ */ React.createElement("button", { onClick: () => addCountry(pending.trim()), disabled: selected.length >= 10, className: "px-3 py-2 rounded-xl bg-blue-700 text-white disabled:opacity-40" }, "➕")), pendingOpen && pending.trim() && (dbSuggestions.length > 0 || worldSuggestions.length > 0) && /* @__PURE__ */ React.createElement("div", { className: "absolute z-20 mt-1 w-full card border rounded-xl shadow-lg max-h-56 overflow-y-auto" }, dbSuggestions.map((c) => /* @__PURE__ */ React.createElement("button", { key: `db-${c.id}`, onMouseDown: () => addCountry(c.name_he), className: "w-full text-right px-4 py-2 hoverable text-sm text-primary flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, c.flag), " ", c.name_he)), worldSuggestions.map((c) => /* @__PURE__ */ React.createElement("button", { key: `world-${c.name_he}`, onMouseDown: () => addCountry(c.name_he), className: "w-full text-right px-4 py-2 hoverable text-sm text-blue-500 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, c.flag), " ", c.name_he, " ", /* @__PURE__ */ React.createElement("span", { className: "text-xs mr-auto" }, '✨ יושלם ע"י AI'))))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, selected.map((n) => {
      var _a, _b, _c;
      return /* @__PURE__ */ React.createElement("span", { key: n, className: "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", style: { background: hexA(theme.solid, 0.12), color: theme.solid } }, n, " ", ((_a = resultsMap[n]) == null ? void 0 : _a.loading) && "⏳", " ", ((_b = resultsMap[n]) == null ? void 0 : _b.error) && "⚠️", " ", ((_c = resultsMap[n]) == null ? void 0 : _c.estimated) && "✨", " ", /* @__PURE__ */ React.createElement("button", { onClick: () => removeCountry(n), className: "hover:opacity-60" }, "✕"));
    })), selected.length < 3 && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-amber-500 mt-2" }, "⚠️ יש לבחור לפחות 3 מדינות"), errored.length > 0 && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-red-500 mt-2" }, "⚠️ נכשלה השלמת AI עבור: ", errored.join(", "), " — ", resultsMap[errored[0]].error)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1.5" }, "🎯 פרמטר לדירוג"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, RANK_PARAMS.map((p) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: p.key,
        onClick: () => setParam(p.key),
        className: `px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition ${param === p.key ? `border-transparent bg-gradient-to-l ${theme.grad} text-white shadow-md` : "text-secondary"}`,
        style: param !== p.key ? { borderColor: "var(--card-border)" } : {}
      },
      p.label
    ))))), stillLoading.length > 0 && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-secondary" }, "🔄 משלים נתונים עבור: ", stillLoading.join(", "), "..."), readyToShow && /* @__PURE__ */ React.createElement("div", { className: "space-y-5", style: { animation: "fadeIn 0.3s ease-in" } }, /* @__PURE__ */ React.createElement(ExportBar, null), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-4 text-sm" }, "🏆 דירוג לפי ", paramMeta == null ? void 0 : paramMeta.label), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, ranked.map((r, i) => /* @__PURE__ */ React.createElement("div", { key: r.name, className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-7 text-center" }, i < 3 ? medals[i] : /* @__PURE__ */ React.createElement("span", { className: "text-xs text-secondary" }, i + 1)), /* @__PURE__ */ React.createElement("div", { className: "w-32 shrink-0 text-sm font-medium text-primary truncate" }, r.name, " ", r.estimated && "✨"), /* @__PURE__ */ React.createElement("div", { className: "flex-1 rounded-full h-6 relative overflow-hidden", style: { background: "var(--hover-bg)" } }, /* @__PURE__ */ React.createElement("div", { className: "h-full rounded-full flex items-center justify-end px-2", style: { width: `${Math.max(4, r.metrics[param] / maxVal * 100)}%`, background: theme.solid } }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-white" }, fmtDec(r.metrics[param]))))))), ranked.some((r) => r.estimated) && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mt-3 flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", null, "✨"), " מדינות המסומנות הושלמו על ידי AI (לא נמצאו במאגר המקורי)")), /* @__PURE__ */ React.createElement(OpenQuestionAI, { key: `ask-rank-${param}-${selected.join(",")}`, theme, subject: `דירוג ${selected.length} מדינות לפי ${paramMeta == null ? void 0 : paramMeta.label}`, data: { param: paramMeta == null ? void 0 : paramMeta.label, ranked: ranked.map((r) => ({ name: r.name, value: r.metrics[param], estimated: !!r.estimated })) }, placeholder: "לדוגמה: מה משותף למדינות המובילות ברשימה הזו?" })), /* @__PURE__ */ React.createElement(RegressionAnalysis, { years, theme, allMetrics, countries }));
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
          label: "השפעה (%)",
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
    return /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary text-sm flex items-center gap-2" }, "🧮 ניתוח רגרסיה — אילו פרמטרים משפיעים על כניסות תיירים"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowPicker((s) => !s), className: "text-xs px-3 py-1.5 rounded-lg border text-secondary", style: { borderColor: "var(--card-border)" } }, showPicker ? "סגור בחירת מדינות ▲" : "🌍 בחר מדינות לרגרסיה ▼")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted" }, "המדינות הנכללות בחישוב (", selectedCountries.length, " מתוך ", countries.length, "): ", selectedCountries.map((c) => `${c.flag || ""} ${c.name_he}`).join(", ") || "אין מדינות נבחרות"), showPicker && /* @__PURE__ */ React.createElement("div", { className: "border rounded-xl p-3 divider", style: { maxHeight: 220, overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 mb-2" }, /* @__PURE__ */ React.createElement("button", { onClick: selectAll, className: "text-xs text-blue-500" }, "בחר הכל"), /* @__PURE__ */ React.createElement("button", { onClick: selectNone, className: "text-xs text-secondary" }, "נקה הכל")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-1.5" }, countries.map((c) => /* @__PURE__ */ React.createElement("label", { key: c.id, className: "flex items-center gap-1.5 text-xs text-secondary" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: selectedIds.includes(c.id), onChange: () => toggleCountry(c.id) }), c.flag, " ", c.name_he)))), !result ? /* @__PURE__ */ React.createElement("div", { className: "text-center py-10 text-secondary text-sm" }, "⚠️ אין מספיק נתונים מלאים (נדרשות לפחות ", REGRESSION_FIELDS.length + 2, " שורות תקינות) עבור המדינות/השנים הנבחרות.") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-2" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setShowAudit((s) => !s), className: "text-xs px-3 py-1.5 rounded-lg border text-secondary", style: { borderColor: "var(--card-border)" } }, showAudit ? "הסתר נתוני גלם ▲" : "🔍 הצג נתוני גלם ששימשו לחישוב ▼"), /* @__PURE__ */ React.createElement("span", { className: "text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1", style: { background: hexA(theme.solid, 0.12), color: theme.solid } }, "R² = ", result.r2, " · ", result.n, " תצפיות", /* @__PURE__ */ React.createElement(InfoTip, { text: `R² (מקדם המתאם) מודד כמה טוב המודל מסביר את השונות בנתונים, בסולם 0-1. ככלל אצבע: מעל 0.7 = הסבר חזק, 0.4-0.7 = בינוני, מתחת ל-0.4 = חלש (יש גורמים נוספים משמעותיים שלא נכללו במודל). R² גבוה לא מוכיח סיבתיות, רק קורלציה.` }))), /* @__PURE__ */ React.createElement("p", { className: "text-xs px-3 py-2 rounded-lg border", style: { background: hexA("#f59e0b", 0.08), borderColor: hexA("#f59e0b", 0.25), color: "var(--text-secondary)" } }, "⚠️ ה-p-value וה-VIF שמוצגים למטה הם חישוב ", /* @__PURE__ */ React.createElement("b", null, "נאיבי"), " — הוא מתייחס לכל שורת מדינה-שנה כתצפית בלתי-תלויה, אף שבפועל כמה שורות שייכות לאותה מדינה (ולכן קשורות זו לזו). המשמעות: רמות המובהקות המוצגות כאן ", /* @__PURE__ */ React.createElement("b", null, "עשויות להיראות טובות/מובהקות יותר ממה שהן באמת"), ". שימושי לכיוון חשיבה ראשוני, לא לקביעת מובהקות סטטיסטית סופית."), showAudit && /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto rounded-lg border divider", style: { maxHeight: 260, overflowY: "auto" } }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-xs" }, /* @__PURE__ */ React.createElement("thead", { className: "text-secondary sticky top-0", style: { background: "var(--hover-bg)" } }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "מדינה"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "שנה"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "HDI"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "תיירות יוצאת"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "חיפוש"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "איכות תעופה"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "אוכ' יהודית"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "טיסות ישירות"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "אזהרת מסע"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "כניסות לישראל (אלפים)"))), /* @__PURE__ */ React.createElement("tbody", null, auditRows.map((r, i) => /* @__PURE__ */ React.createElement("tr", { key: i, className: "border-t divider" }, /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-primary" }, r.countryName), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, r.year), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, fmtDec(r.hdi)), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, fmtDec(r.outbound_tourism_millions)), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, fmtDec(r.online_search_index)), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, fmtDec(r.air_transport_quality)), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, fmtDec(r.jewish_population)), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, r.has_direct_flights ? "כן" : "לא"), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, r.travel_advisory === 1 ? "תקין" : "אזהרה"), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1 text-secondary" }, fmtDec(r.entries_to_israel_thousands)))))), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted p-2" }, "💡 בדיקה עצמאית: אפשר להעתיק את הטבלה הזו לאקסל ולהריץ רגרסיה מקבילה (למשל עם כלי הרגרסיה המובנה של אקסל/Google Sheets) כדי לוודא שהתוצאות תואמות.")), chartData && /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: chartData, options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }, height: 220 }), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 text-xs text-secondary" }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 3, background: theme.solid, display: "inline-block" } }), " השפעה חיובית — ככל שהערך גבוה יותר, כך צפויים יותר תיירים"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 3, background: "#ef4444", display: "inline-block" } }), " השפעה שלילית — ככל שהערך גבוה יותר, כך צפויים פחות תיירים")), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, result.influence.map((f) => /* @__PURE__ */ React.createElement("div", { key: f.key, className: "flex items-center justify-between text-sm py-1 border-b divider last:border-0 flex-wrap gap-y-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-secondary" }, f.direction === "positive" ? "📈" : "📉", " ", f.label), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, f.vif != null && isFinite(f.vif) && f.vif >= 5 && /* @__PURE__ */ React.createElement("span", { className: "text-xs px-1.5 py-0.5 rounded font-medium", style: { background: hexA("#f59e0b", 0.15), color: "#b45309" }, title: `VIF=${f.vif.toFixed(1)} — קורלציה גבוהה עם פרמטרים אחרים במודל; הפרשנות הבודדת של הפרמטר הזה פחות אמינה` }, "⚠️ VIF ", f.vif.toFixed(1)), f.pValue != null && /* @__PURE__ */ React.createElement("span", { className: "text-xs px-1.5 py-0.5 rounded font-medium", style: f.pValue < 0.05 ? { background: hexA(theme.solid, 0.12), color: theme.solid } : { background: "var(--hover-bg)", color: "var(--text-muted)" }, title: "p-value נאיבי (לא מתחשב בחזרתיות לפי מדינה) — ראו הבהרה למעלה" }, "p", f.pValue < 0.001 ? "<0.001" : `=${f.pValue.toFixed(3)}`), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-primary" }, f.influencePct, "%"))))), /* @__PURE__ */ React.createElement("div", { className: "border-t divider pt-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3 mb-3" }, /* @__PURE__ */ React.createElement("h5", { className: "font-semibold text-primary text-sm" }, "💬 הסבר בשפה פשוטה"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: runAnalysis,
        disabled: loadingExplain,
        className: `px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-l ${theme.grad} disabled:opacity-50`
      },
      loadingExplain ? "🔄 מנתח..." : "▶️ בצע ניתוח"
    )), explainError && /* @__PURE__ */ React.createElement("p", { className: "text-red-500 text-sm" }, "⚠️ שגיאה: ", explainError), explanation && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-primary leading-relaxed whitespace-pre-line", style: { animation: "fadeIn 0.3s ease-in" } }, explanation), !explanation && !loadingExplain && !explainError && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted" }, 'לחץ "בצע ניתוח" כדי לקבל הסבר מנוסח מ-AI על המשמעות של התוצאות.'))));
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
    return /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3 mb-3" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary text-sm flex items-center gap-2" }, "🏢 ניתוח תרומת לשכה — ", country.name_he, " ⭐", /* @__PURE__ */ React.createElement(InfoTip, { text: "משווה למדינות דומות במספר מאפיינים במקביל (רמת פיתוח, תוצר לנפש, נפח תיירות יוצאת, מרחק מישראל) שאין בהן לשכה. ⚠️ אין עדיין נוהל רשמי במשרד למדידת הצלחת לשכה — זהו מודל ראשוני, פתוח לשינוי." })), /* @__PURE__ */ React.createElement("button", { onClick: run, disabled: loading, className: `px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-l ${theme.grad} disabled:opacity-50` }, loading ? "🔄 מנתח..." : text ? "🔄 הרץ מחדש" : "▶️ בצע ניתוח")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mb-3" }, "מושווה מול: ", comparables.map((c) => `${c.country.flag || ""} ${c.country.name_he}`).join(", "), " (מדינות ללא לשכה, בנפח תיירות יוצאת דומה)"), /* @__PURE__ */ React.createElement("div", { className: "grid gap-2 mb-3", style: { gridTemplateColumns: `repeat(${comparables.length + 1}, minmax(0,1fr))` } }, /* @__PURE__ */ React.createElement("div", { className: "text-center p-2 rounded-lg", style: { background: hexA(theme.solid, 0.12) } }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-secondary" }, country.name_he, " ⭐"), /* @__PURE__ */ React.createElement("div", { className: "font-bold text-primary text-sm" }, metrics.roi, "%")), comparables.map((c) => /* @__PURE__ */ React.createElement("div", { key: c.country.id, className: "text-center p-2 rounded-lg", style: { background: "var(--hover-bg)" } }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-secondary" }, c.country.name_he), /* @__PURE__ */ React.createElement("div", { className: "font-bold text-primary text-sm" }, c.metrics.roi, "%")))), error && /* @__PURE__ */ React.createElement("p", { className: "text-red-500 text-sm" }, "⚠️ שגיאה: ", error), text && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-primary leading-relaxed whitespace-pre-line", style: { animation: "fadeIn 0.3s ease-in" } }, text), !text && !loading && !error && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted" }, 'לחץ "בצע ניתוח" לקבלת הערכה מנומקת של תרומת הלשכה, בזהירות המתבקשת ממדגם קטן.'));
  }
  const SUGGESTED_COMPETITORS = ["יוון", "קפריסין", "מצרים", "ירדן", "איטליה", "ספרד", "טורקיה", "פורטוגל", "מרוקו"];
  function CompetitorAnalysis({ country, theme }) {
    const [selected, setSelected] = useState(["יוון", "קפריסין", "איטליה"]);
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
    return /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm space-y-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary text-sm flex items-center gap-2" }, "⚔️ ניתוח מתחרים דינמי — מי מתחרה בישראל על תיירים מ-", country.name_he), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary mb-2" }, "בחר עד 6 מדינות מתחרות (הצעות אזוריות/דתיות-תרבותיות, או הוסף משלך):"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 mb-2" }, SUGGESTED_COMPETITORS.map((c) => /* @__PURE__ */ React.createElement(
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
        placeholder: "הוסף מדינה מתחרה נוספת...",
        className: "input-field flex-1 border rounded-lg px-3 py-2 text-sm"
      }
    ), /* @__PURE__ */ React.createElement("button", { onClick: addCustom, className: "px-3 py-2 rounded-lg bg-blue-700 text-white text-sm" }, "➕"))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: runAll,
        disabled: anyLoading || selected.length === 0,
        className: `px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-l ${theme.grad} disabled:opacity-50`
      },
      anyLoading ? "🔄 מנתח..." : "▶️ בצע ניתוח"
    ), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, selected.map((c) => {
      const r = results[c];
      if (!r) return null;
      return /* @__PURE__ */ React.createElement("div", { key: c, className: "border rounded-xl p-4 divider" }, /* @__PURE__ */ React.createElement("h5", { className: "font-semibold text-primary text-sm mb-2" }, "🆚 ", c), r.loading && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary" }, "🔄 מנתח..."), r.error && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-red-500" }, "⚠️ ", r.error), r.text && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-secondary leading-relaxed whitespace-pre-line", style: { animation: "fadeIn 0.3s ease-in" } }, r.text));
    })));
  }
  const REGION_OPTIONS = [
    { value: "Europe", label: "אירופה (Europe)" },
    { value: "North America", label: "צפון אמריקה (North America)" },
    { value: "South America", label: "דרום אמריקה (South America)" },
    { value: "Americas", label: "יבשת אמריקה (Americas)" },
    { value: "Asia", label: "אסיה (Asia)" },
    { value: "Africa", label: "אפריקה (Africa)" },
    { value: "Oceania", label: "אוקיאניה (Oceania)" },
    { value: "Europe/Asia", label: "אירופה/אסיה (Europe/Asia)" }
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
    const [basicsAiLoading, setBasicsAiLoading] = useState(false);
    const [basicsAutoFilled, setBasicsAutoFilled] = useState(false);
    const selectExisting = (id) => {
      const c = countries.find((x) => x.id === Number(id));
      if (c) {
        setExistingId(c.id);
        setCountry(c);
      }
    };
    const handleNameEnBlur = () => {
      const fixed = toTitleCase(country.name_en);
      if (fixed === country.name_en && basicsAutoFilled) return;
      const match = lookupCanonicalCountry(fixed, country.name_he);
      if (match) {
        setCountry((c) => __spreadProps(__spreadValues({}, c), { name_en: fixed, name_he: c.name_he || match.name_he, flag: c.flag || match.flag, Distance: c.Distance !== "" ? c.Distance : match.distance_km }));
        setBasicsAutoFilled(true);
      } else {
        setCountry((c) => __spreadProps(__spreadValues({}, c), { name_en: fixed }));
        setBasicsAutoFilled(false);
      }
    };
    const aiCompleteBasics = async () => {
      if (!country.name_en.trim()) return;
      setBasicsAiLoading(true);
      try {
        const res = await DataAPI.generateInsight("country_basics", { name_en: country.name_en });
        const parsed = JSON.parse(res.text);
        setCountry((c) => {
          var _a;
          return __spreadProps(__spreadValues({}, c), {
            name_he: c.name_he || parsed.name_he || "",
            flag: c.flag || parsed.flag || "",
            Distance: c.Distance !== "" ? c.Distance : (_a = parsed.distance_km) != null ? _a : ""
          });
        });
      } catch (err) {
        alert("שגיאה בהשלמת AI: " + err.message);
      }
      setBasicsAiLoading(false);
    };
    const goPart2 = () => {
      if (mode === "new" && (!country.name_en || !country.name_he)) return;
      setStep(2);
    };
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
        alert("שגיאה בהשלמת AI: " + err.message);
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
        alert("שגיאה בשמירה: " + err.message);
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
    return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[60] flex items-center justify-center p-4", style: { background: "var(--overlay-bg)" }, dir: "rtl" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 border-b divider flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg text-primary" }, "📥 ניהול דאטה-בייס — חלק ", step, " מתוך 2"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-1.5 rounded-lg hoverable text-secondary" }, "✕")), /* @__PURE__ */ React.createElement("div", { className: "p-6 space-y-5" }, step === 1 && /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted" }, "חלק 1 מתוך 2: הקמת/בחירת מדינה — פרטים קבועים שאינם תלויי שנה."), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setMode("new"), className: `px-4 py-2 rounded-xl text-sm font-medium ${mode === "new" ? "bg-blue-600 text-white" : "text-secondary border"}` }, "➕ מדינה חדשה"), /* @__PURE__ */ React.createElement("button", { onClick: () => setMode("existing"), className: `px-4 py-2 rounded-xl text-sm font-medium ${mode === "existing" ? "bg-blue-600 text-white" : "text-secondary border"}` }, "✏️ מדינה קיימת")), mode === "existing" ? /* @__PURE__ */ React.createElement("select", { onChange: (e) => selectExisting(e.target.value), className: "input-field w-full border rounded-lg px-3 py-2 text-sm" }, /* @__PURE__ */ React.createElement("option", { value: "" }, "בחר מדינה..."), countries.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.flag, " ", c.name_he))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1" }, "שם באנגלית"), /* @__PURE__ */ React.createElement(
      "input",
      {
        placeholder: "Greece / FRANCE / france...",
        value: country.name_en,
        onChange: (e) => setCountry((c) => __spreadProps(__spreadValues({}, c), { name_en: e.target.value })),
        onBlur: handleNameEnBlur,
        className: "input-field w-full border rounded-lg px-3 py-2 text-sm"
      }
    ), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mt-0.5" }, "הפורמט מתוקן אוטומטית (אות ראשונה גדולה) כשעוברים לשדה הבא")), country.name_en.trim() && /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1" }, "שם בעברית ", basicsAutoFilled && /* @__PURE__ */ React.createElement("span", { className: "text-emerald-500" }, "✓ מולא אוטומטית")), /* @__PURE__ */ React.createElement("input", { placeholder: "יוון", value: country.name_he, onChange: (e) => setCountry((c) => __spreadProps(__spreadValues({}, c), { name_he: e.target.value })), className: "input-field w-full border rounded-lg px-3 py-2 text-sm" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1" }, "דגל"), /* @__PURE__ */ React.createElement("select", { value: country.flag, onChange: (e) => setCountry((c) => __spreadProps(__spreadValues({}, c), { flag: e.target.value })), className: "input-field w-full border rounded-lg px-3 py-2 text-sm" }, /* @__PURE__ */ React.createElement("option", { value: "" }, "בחר דגל..."), flagOptions.map((f) => /* @__PURE__ */ React.createElement("option", { key: f.flag, value: f.flag }, f.flag, " ", f.name))))), country.name_en.trim() && !country.name_he && /* @__PURE__ */ React.createElement("button", { onClick: aiCompleteBasics, disabled: basicsAiLoading, className: "text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium" }, basicsAiLoading ? "🔄 משלים..." : "🤖 השלם שם בעברית, דגל ומרחק עם AI")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1" }, "אזור / יבשת"), /* @__PURE__ */ React.createElement("select", { value: country.region, onChange: (e) => setCountry((c) => __spreadProps(__spreadValues({}, c), { region: e.target.value })), className: "input-field w-full border rounded-lg px-3 py-2 text-sm" }, /* @__PURE__ */ React.createElement("option", { value: "" }, "בחר אזור..."), REGION_OPTIONS.map((r) => /* @__PURE__ */ React.createElement("option", { key: r.value, value: r.value }, r.label)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1" }, 'מרחק מישראל (ק"מ) ', basicsAutoFilled && country.Distance !== "" && /* @__PURE__ */ React.createElement("span", { className: "text-emerald-500" }, "✓ חושב אוטומטית")), /* @__PURE__ */ React.createElement("input", { type: "number", min: "0", step: "1", value: country.Distance, onChange: (e) => setCountry((c) => __spreadProps(__spreadValues({}, c), { Distance: e.target.value })), className: "input-field w-full border rounded-lg px-3 py-2 text-sm" }))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end" }, /* @__PURE__ */ React.createElement("button", { onClick: goPart2, className: "bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium" }, "המשך לחלק 2 ←"))), step === 2 && /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted" }, "חלק 2 מתוך 2: נתונים שנתיים — ערכים שמשתנים משנה לשנה."), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-semibold text-secondary mb-1" }, "שנה"), /* @__PURE__ */ React.createElement("input", { type: "number", min: "2000", max: "2100", step: "1", value: year, onChange: (e) => setYear(Number(e.target.value)), className: "input-field border rounded-lg px-3 py-2 text-sm w-32" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, field("hdi", "HDI", { min: 0, max: 1, step: 1e-3, hint: "ערך בין 0.000 ל-1.000" }), field("outbound_tourism_millions", "נפח תיירות יוצאת (מיליון)", { min: 0, step: 0.1, hint: "מספר עשרוני, מיליוני נוסעים" }), field("air_transport_quality", "איכות תעופה (TTDI)", { min: 0, max: 10, step: 0.1, hint: "ערך בין 0 ל-10" }), field("jewish_population", "אוכלוסייה יהודית (אלפים)", { min: 0, step: 0.1, hint: "מספר עשרוני, באלפי אנשים" }), field("online_search_index", "מדד חיפוש מקוון", { min: 0, max: 100, step: 1, hint: "ערך בין 0 ל-100" }), field("entries_to_israel_thousands", "כניסות לישראל (אלפים)", { min: 0, step: 0.1, hint: "מספר עשרוני, באלפי אנשים" }), field("gdp_per_capita", "תוצר לנפש ($)", { min: 0, step: 1, hint: "דולרים לנפש" }), field("average_expenditure_per_trip", "הוצאה ממוצעת לנסיעה ($)", { min: 0, step: 1, hint: "דולרים לנסיעה" }), field("number_of_passengers_per_year", "נוסעים בטיסות (שנתי)", { min: 0, step: 1, hint: "מספר שלם" }), field("evangelical_population", "אוכלוסייה אוונגליסטית", { min: 0, step: 1, hint: "מספר שלם, אנשים" })), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-4 items-center" }, /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2 text-sm text-secondary" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: !!metric.has_direct_flights, onChange: (e) => setMetric((m) => __spreadProps(__spreadValues({}, m), { has_direct_flights: e.target.checked })) }), " ✈️ טיסות ישירות"), /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2 text-sm text-secondary" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: !!metric.has_office, onChange: (e) => setMetric((m) => __spreadProps(__spreadValues({}, m), { has_office: e.target.checked })) }), " ⭐ לשכה פעילה בשנה זו"), /* @__PURE__ */ React.createElement("label", { className: "text-sm text-secondary flex items-center gap-2" }, "אזהרת מסע:", /* @__PURE__ */ React.createElement("select", { value: metric.travel_advisory, onChange: (e) => setMetric((m) => __spreadProps(__spreadValues({}, m), { travel_advisory: e.target.value })), className: "input-field border rounded px-2 py-1 text-sm" }, /* @__PURE__ */ React.createElement("option", { value: 1 }, "1 · תקין"), /* @__PURE__ */ React.createElement("option", { value: 2 }, "2 · אזהרה")))), missingWarning.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "rounded-lg px-3 py-2 text-sm border", style: { background: hexA("#f59e0b", 0.1), borderColor: hexA("#f59e0b", 0.3), color: "#b45309" } }, "⚠️ יש ", missingWarning.length, " שדות חובה ריקים. אפשר למלא ידנית, להשלים אוטומטית עם AI, או להשאיר ריק ולהמשיך.", /* @__PURE__ */ React.createElement("div", { className: "mt-2 flex gap-2" }, /* @__PURE__ */ React.createElement("button", { onClick: fillFromAI, disabled: aiFilling, className: "bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium" }, aiFilling ? "🔄 משלים..." : "✨ השלם נתונים מהרשת (AI)"), /* @__PURE__ */ React.createElement("button", { onClick: () => doSave(metric), className: "border border-amber-400 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium" }, "השאר ריק והמשך"))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setStep(1), className: "text-secondary text-sm" }, "→ חזרה"), /* @__PURE__ */ React.createElement("button", { onClick: tryFinish, disabled: saving, className: "bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium" }, saving ? "שומר..." : "✅ שמור למאגר"))))));
  }
  function DataManagementPanel({ countries, allMetrics, onRefresh, onAddNew }) {
    const [filter, setFilter] = useState("");
    const rows = allMetrics.map((m) => __spreadProps(__spreadValues({}, m), { country: countries.find((c) => c.id === m.country_id) })).filter((r) => r.country).filter((r) => !filter || r.country.name_he.includes(filter)).sort((a, b) => a.country.name_he.localeCompare(b.country.name_he) || a.year - b.year);
    const deleteRow = async (row) => {
      if (!confirm(`למחוק את הנתונים של ${row.country.name_he} לשנת ${row.year}?`)) return;
      await DataAPI.deleteMetric(row.country_id, row.year);
      onRefresh();
    };
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3 flex-wrap" }, /* @__PURE__ */ React.createElement("input", { value: filter, onChange: (e) => setFilter(e.target.value), placeholder: "🔎 סינון לפי מדינה...", className: "input-field border rounded-lg px-3 py-2 text-sm w-64" }), /* @__PURE__ */ React.createElement("button", { onClick: onAddNew, className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium" }, "➕ הוספת מדינה/שנה")), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto rounded-lg border divider max-h-96 overflow-y-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-sm" }, /* @__PURE__ */ React.createElement("thead", { className: "text-secondary sticky top-0", style: { background: "var(--hover-bg)" } }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "text-right px-3 py-2" }, "מדינה"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-3 py-2" }, "שנה"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-3 py-2" }, "כניסות (אלפים)"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-3 py-2" }, "מקור"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-3 py-2" }))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((r) => /* @__PURE__ */ React.createElement("tr", { key: `${r.country_id}-${r.year}`, className: "border-t divider" }, /* @__PURE__ */ React.createElement("td", { className: "px-3 py-1.5 text-primary" }, r.country.flag, " ", r.country.name_he, " ", r.has_office && "⭐"), /* @__PURE__ */ React.createElement("td", { className: "px-3 py-1.5 text-secondary" }, r.year), /* @__PURE__ */ React.createElement("td", { className: "px-3 py-1.5 text-secondary" }, fmtDec(r.entries_to_israel_thousands)), /* @__PURE__ */ React.createElement("td", { className: "px-3 py-1.5 text-xs" }, r.is_ai_estimated ? "✨ AI" : r.source), /* @__PURE__ */ React.createElement("td", { className: "px-3 py-1.5" }, /* @__PURE__ */ React.createElement("button", { onClick: () => deleteRow(r), className: "text-red-500 hover:text-red-700 text-xs" }, "🗑️ מחק"))))))));
  }
  function SettingsSidebar({ open, onClose, mode, setMode, currentPassword, onChangePassword, countries, allMetrics, onRefresh, onLogout }) {
    const [showPwModal, setShowPwModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [showMethodModal, setShowMethodModal] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-40 transition-opacity", style: { background: "var(--overlay-bg)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }, onClick: onClose }), /* @__PURE__ */ React.createElement("div", { className: "fixed top-0 left-0 h-full w-full max-w-sm z-50 shadow-2xl transition-transform duration-300 overflow-y-auto card", style: { transform: open ? "translateX(0)" : "translateX(-100%)" }, dir: "rtl" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 border-b divider flex items-center justify-between sticky top-0 card z-10" }, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-lg text-primary" }, "⚙️ הגדרות"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-1.5 rounded-lg hoverable text-secondary" }, "✕")), /* @__PURE__ */ React.createElement("div", { className: "p-5 space-y-8" }, /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold text-secondary mb-3" }, "🌓 מצב תצוגה"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-2" }, [["light", "☀️ בהיר"], ["dark", "🌙 כהה"], ["system", "🖥️ אוטומטי"]].map(([key, label]) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key,
        onClick: () => setMode(key),
        className: "flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition",
        style: mode === key ? { borderColor: "#2563eb", background: hexA("#2563eb", 0.12), color: "#2563eb" } : { borderColor: "var(--card-border)", color: "var(--text-secondary)" }
      },
      /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium" }, label)
    ))), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mt-2" }, '💡 "אוטומטי" עובר לכהה אוטומטית בין 19:00 ל-06:00 לפי שעון המכשיר שלך.')), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold text-secondary mb-3" }, "🔑 סיסמה"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowPwModal(true), className: "w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg" }, "שינוי סיסמה")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold text-secondary mb-3" }, "🗄️ בסיס הנתונים"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowManageModal(true), className: "w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg" }, "ניהול נתונים (הוספה / עריכה / מחיקה)")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold text-secondary mb-3" }, "📖 עזרה"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowGuideModal(true), className: "w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white", style: { background: "linear-gradient(135deg,#0284c7,#4338ca)" } }, "מדריך למשתמש")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-semibold text-secondary mb-3" }, "🧮 מתודולוגיה"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowMethodModal(true), className: "w-full px-4 py-2.5 rounded-lg text-sm font-medium border", style: { borderColor: "var(--card-border)", color: "var(--text-primary)" } }, "איך מחושבת הרגרסיה הליניארית?")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("button", { onClick: onLogout, className: "w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 border border-red-300" }, "🚪 התנתקות")))), showPwModal && /* @__PURE__ */ React.createElement(ChangePasswordModal, { onClose: () => setShowPwModal(false), onChangePassword }), showManageModal && /* @__PURE__ */ React.createElement(DataManagementModal, { onClose: () => setShowManageModal(false), countries, allMetrics, onRefresh }), showGuideModal && /* @__PURE__ */ React.createElement(UserGuideModal, { onClose: () => setShowGuideModal(false) }), showMethodModal && /* @__PURE__ */ React.createElement(RegressionMethodologyModal, { onClose: () => setShowMethodModal(false) }));
  }
  const GUIDE_UNITS = [
    {
      emoji: "👋",
      title: "ברוכים הבאים — מה המערכת הזו עושה",
      body: `זו מערכת שעוזרת לצוות השיווק של משרד התיירות להבין מאיזה מדינות בעולם הכי כדאי למשוך תיירים לישראל, ולמה. במקום להסתמך על תחושת בטן, המערכת אוספת נתונים אמיתיים (כמו כמה תיירים הגיעו בעבר, כמה אנשים מחפשים "ישראל" באינטרנט, ועוד) ומציגה אותם בצורה ברורה — כולל, במקומות מסוימים, ניתוח בעזרת בינה מלאכותית (AI) שמסביר את המשמעות במילים פשוטות.`
    },
    {
      emoji: "🔑",
      title: "איך נכנסים למערכת",
      body: `בכניסה לאתר מופיע מסך שמבקש סיסמה. הסיסמה משותפת לצוות, וניתן לשנות אותה בכל עת דרך ⚙️ הגדרות ← "שינוי סיסמה" — בלי צורך להזין את הסיסמה הישנה. יש גם כפתור עין קטן (👁️) בשדה הסיסמה שמאפשר לראות מה הקלדתם, למקרה שקשה לקרוא תווים מוסתרים.`
    },
    {
      emoji: "🗂️",
      title: "שלוש הלשוניות הראשיות — מה ההבדל ביניהן",
      body: `בראש המסך יש שלוש לשוניות, וההבדל היחיד ביניהן הוא **טווח השנים** שהן מציגות: "2010-2019" מציגה נתונים היסטוריים אמיתיים, "2023-היום" מציגה נתונים מהתקופה האחרונה, ו"מאגר מקיף" מציגה את כל השנים יחד. בתוך כל לשונית קיימים אותם שלושה סוגי ניתוח: מדינה בודדת, השוואה, ודירוג.`
    },
    {
      emoji: "🔎",
      title: "ניתוח מדינה בודדת",
      body: `כאן בוחרים מדינה אחת ורואים עליה תמונה מלאה: כמה תיירים הגיעו ממנה לישראל, כמה זה "משתלם" ביחס לכמות התיירים הכללית שהמדינה שולחת לעולם, כמה אנשים במדינה מחפשים מידע על ישראל באינטרנט, ועוד. בתחתית המסך יש כמה כלים מבוססי בינה מלאכותית (לוחצים על כפתור "בצע ניתוח" כדי להפעיל אותם):

• "ניתוח המועצה" — סיכום אסטרטגי בחמישה חלקים, כאילו צוות יועצים בכיר ניתח את המדינה עבורכם.
• "ניתוח תרומת לשכה" — מופיע רק אם למדינה יש לשכת תיירות פעילה, ובודק אם הלשכה באמת מביאה יותר תיירים בהשוואה למדינות דומות בלי לשכה.
• "ניתוח מתחרים" — מראה אילו מדינות אחרות "מתחרות" בישראל על אותם תיירים, ולמה.
• "שאלה חופשית ל-AI" — תיבת טקסט פתוחה לשאול כל שאלה על המדינה, על בסיס הנתונים שכבר מוצגים.`
    },
    {
      emoji: "⚖️",
      title: "ניתוח השוואתי — שתי מדינות זו מול זו",
      body: `בוחרים שתי מדינות ומקבלים השוואה ויזואלית: גרפים, טבלת "מי מוביל" בכל מדד (עם כתר 👑 ליד המדינה החזקה יותר), וכרטיס "פער הזדמנות" שמסביר בכמה נקודות מדינה אחת מובילה ולמה. יש גם כפתור לקבלת מסקנה אסטרטגית כתובה מה-AI, וסרגל קטן שמראה אילו שנים היו עם אזהרת מסע — שימושי לבדוק אם ירידה בכניסות תיירים קשורה לאזהרה כזו.`
    },
    {
      emoji: "🏆",
      title: "ניתוח דירוג — והרגרסיה בשפה פשוטה",
      body: `כאן בוחרים כמה מדינות (3 עד 10) ומדרגים אותן לפי קריטריון שבוחרים — למשל "אהדה פרו-ישראלית" או "ציון כולל". יש גם כפתורי "בחירה מהירה" שממלאים את הרשימה אוטומטית (למשל כל מדינות אירופה, או כל המדינות עם לשכה פעילה).

בתוך אותה לשונית יש גם כלי בשם "ניתוח רגרסיה". בלי להיכנס למתמטיקה: **זה כלי שבודק אילו גורמים באמת משפיעים על כמות התיירים שמגיעים לישראל, ובאיזו מידה**. התוצאה מוצגת כאחוזי השפעה לכל גורם (למשל: "מדד החיפוש המקוון אחראי ל-30% מההשפעה"), עם צבע כחול אם ההשפעה חיובית (יותר מזה = יותר תיירים) וצבע אדום אם היא שלילית. יש כפתור נפרד שמייצר הסבר מילולי פשוט של התוצאות, ואפשר גם ללחוץ "הצג נתוני גלם" כדי לראות בדיוק אילו מספרים נכנסו לחישוב — לשקיפות מלאה. **חשוב:** אין עדיין לוגיקה שקובעת רמת "מובהקות סטטיסטית" — זו הערכה ראשונית לכיוון חשיבה, לא הוכחה מדעית חד-משמעית.`
    },
    {
      emoji: "✨",
      title: "מה זה אומר כש'הבינה המלאכותית' מעורבת",
      body: `יש שני סוגים שונים של שימוש ב-AI במערכת, וחשוב להבדיל ביניהם:

1. **השלמת מדינה חסרה** — אם מקלידים שם של מדינה שלא קיימת במאגר (למשל "פינלנד"), המערכת תשאל בינה מלאכותית להעריך עבורה נתונים סבירים, ותסמן זאת בבירור בתג "✨ מוערך על ידי AI" בכל מקום שהמדינה הזו מופיעה. **זו הערכה, לא נתון מאומת** — שימושי לקבל תמונה ראשונית, אבל לא להחלטות תקציביות גדולות בלי בדיקה נוספת.

2. **ניתוחים מילוליים** (ניתוח המועצה, מסקנות השוואה, ניתוח מתחרים, שאלה חופשית וכו') — אלה תמיד מבוססים על הנתונים האמיתיים שכבר במערכת, ורק "מנסחים" אותם למסקנות קריאות. הם עדיין דעה של כלי AI, לא עובדה מוחלטת — כדאי להתייחס אליהם כאל חוות דעת ראשונית לדיון, לא כפסק דין.

בשני המקרים, פעולות ה-AI לוקחות כמה שניות לרוץ (יש אנימציית טעינה) כי המערכת פונה בזמן אמת לשירות חיצוני (Gemini של גוגל).`
    },
    {
      emoji: "🔬",
      title: "Drill In — ניתוח סקרי תיירות",
      body: `לשונית נפרדת בראש הדף. כאן אפשר להעלות קובץ (Excel, CSV או PDF) עם נתוני סקר תיירות נכנסת, ולקבל ניתוח מפורט שמחולק לפי נושאים (למשל צליינות, מורשת, פנאי, תיירות עסקים) עם סיכום מסודר בסוף. **הקובץ עצמו נקרא בדפדפן בלבד ולא נשמר בשום מקום במערכת** — רק הניתוח שמופק ממנו מוצג על המסך.`
    },
    {
      emoji: "🗄️",
      title: "ניהול בסיס הנתונים — הוספה, עריכה ומחיקה",
      body: `דרך ⚙️ הגדרות ← "ניהול נתונים" נפתח מסך שמראה את כל המדינות והשנים שבמאגר, עם אפשרות מחיקה לכל שורה. כפתור "➕ הוספת מדינה/שנה" פותח טופס בשני חלקים: קודם פרטי המדינה עצמה (שם, דגל, אזור, מרחק מישראל — חלק מהשדות מתמלאים אוטומטית), ואז הנתונים של שנה ספציפית. אם שוכחים למלא שדה חובה, המערכת מציעה להשלים אותו אוטומטית עם AI, או להשאיר אותו ריק במודע.`
    },
    {
      emoji: "✈️",
      title: "מצב תעופתי כיום — לשונית טיסות נתב״ג",
      body: `לשונית רביעית בראש הדף, נפרדת לגמרי משלוש לשוניות טווחי השנים — היא לא מבוססת על נתוני המדינות שהוזנו ידנית, אלא על נתוני טיסות אמיתיים שמתעדכנים אוטומטית כל 15 דקות ממאגר "טיסות" הפתוח של רשות שדות התעופה. יש בה שני תתי-מסך:

• **🗺️ סיכום שבועי לפי מדינה/עיר** (תת-המסך שנפתח כברירת מחדל) — מציג רק **נחיתות** (טיסות נכנסות לישראל) של 7 הימים האחרונים, לפי מדינת/עיר מוצא, כדי לעזור להבין מאיפה בפועל אפשר להביא תיירים. כולל: טבלת סיכום (עם לחיצה על שורה לפירוט חברות התעופה), Top מדינות/ערים בגרף, השוואה לשבוע הקודם, תג "🆕 חדש" למסלול שלא היה קיים שבוע קודם, ואפשרות מעבר בין רמת מדינה לרמת עיר. יש גם כפתור כתום "🎯 פערי הזדמנות מול countries" (כבוי כברירת מחדל) — לוחצים עליו כדי להשוות בין מה שמוגדר ידנית בטבלת המדינות (יש/אין טיסות ישירות) לבין מה שבאמת קורה בשטח באותו שבוע; מדינה שמוגדרת עם טיסות ישירות אך כמעט ואין לה נחיתות בפועל מסומנת ב"⚠️ נפח נמוך".
• **📡 סטטוס כיום** — תמונת מצב חיה של ±24 שעות סביב הרגע הנוכחי, כולל גם נחיתות וגם המראות, עם אפשרות סינון לפי כיוון וחברת תעופה, וטבלת טיסות ממוינת לפי קרבה לזמן הנוכחי.

בשני תתי-המסך יש גם כפתור "🖨️ ייצוא ל-PDF / הדפסה", בדיוק כמו בשאר מסכי הניתוח.`
    },
    {
      emoji: "💬",
      title: "עוזר הניווט הצף",
      body: `כפתור עגול ירוק בפינה השמאלית התחתונה של המסך, בכל מקום באתר. זה צ'אט קטן שעונה על שאלות לגבי **איך להשתמש באתר עצמו** — למשל "איפה משנים סיסמה" או "מה זה ציון כולל". הוא מתוכנת בכוונה לענות רק על שאלות הקשורות למערכת, ולסרב בנימוס לכל נושא אחר.`
    },
    {
      emoji: "📊",
      title: "ייצוא דוחות",
      body: `כמעט בכל מסך ניתוח יש כפתור "🖨️ ייצוא ל-PDF / הדפסה" שפותח את חלון ההדפסה הרגיל של הדפדפן (משם אפשר לבחור "שמור כ-PDF") בתצוגה נקייה בלי כפתורים מיותרים — נוח לשליחה במייל או הצגה בפגישה.`
    }
  ];
  function UserGuideModal({ onClose }) {
    function renderInlineBold(text) {
      return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
          ? React.createElement("strong", { key: i, className: "font-semibold text-primary" }, part.slice(2, -2))
          : part
      );
    }
    
    const [openIdx, setOpenIdx] = useState(0);
    return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[75] flex items-center justify-center p-4", style: { background: "var(--overlay-bg)" }, dir: "rtl" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 border-b divider flex items-center justify-between sticky top-0 card z-10" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg text-primary" }, "📖 מדריך למשתמש"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-1.5 rounded-lg hoverable text-secondary" }, "✕")), /* @__PURE__ */ React.createElement("div", { className: "p-5" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-secondary mb-4" }, "מדריך זה מסביר כל חלק במערכת בשפה פשוטה, בלי צורך ברקע בקוד או בסטטיסטיקה. לחצו על כל יחידה כדי להרחיב אותה."), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, GUIDE_UNITS.map((unit, i) => {
      const isOpen = openIdx === i;
      return /* @__PURE__ */ React.createElement("div", { key: i, className: "border rounded-xl divider overflow-hidden" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setOpenIdx(isOpen ? -1 : i), className: "w-full flex items-center justify-between gap-3 px-4 py-3 hoverable text-right" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-primary text-sm flex items-center gap-2" }, unit.emoji, " ", unit.title), /* @__PURE__ */ React.createElement("span", { className: "text-secondary text-xs shrink-0" }, isOpen ? "▲" : "▼")), isOpen && /* @__PURE__ */ React.createElement("div", { className: "px-4 pb-4", style: { animation: "fadeIn 0.2s ease-in" } }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-secondary leading-relaxed whitespace-pre-line" }, renderInlineBold(unit.body))));
    })))));
  }
  function RegressionMethodologyModal({ onClose }) {
    return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[75] flex items-center justify-center p-4", style: { background: "var(--overlay-bg)" }, dir: "rtl" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 border-b divider flex items-center justify-between sticky top-0 card z-10" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg text-primary" }, "🧮 איך מחושבת הרגרסיה הליניארית — הסבר מלא"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-1.5 rounded-lg hoverable text-secondary" }, "✕")), /* @__PURE__ */ React.createElement("div", { className: "p-6 space-y-5 text-sm text-primary leading-relaxed" }, /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "1️⃣ סוג המודל"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, 'רגרסיה ליניארית מרובה קלאסית בשיטת "ריבועים פחותים" (OLS — Ordinary Least Squares). המודל מנסה להסביר את מספר הכניסות לישראל ממדינה מסוימת בשנה מסוימת, כפונקציה ליניארית של ', /* @__PURE__ */ React.createElement("b", null, "כל"), " הפרמטרים הזמינים בטבלת הנתונים: מדד פיתוח אנושי (HDI), נפח תיירות יוצאת, מדד חיפוש מקוון, איכות תשתיות תעופה, אוכלוסייה יהודית, קיום טיסות ישירות, והעדר אזהרת מסע.")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "2️⃣ תקנון הנתונים (Standardization)"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, "לפני החישוב, כל משתנה (כולל המשתנה המוסבר) מתוקנן לציון תקן (z-score): מחסירים את הממוצע ומחלקים בסטיית התקן. כך לכל משתנה יש ממוצע 0 וסטיית תקן 1, ללא קשר ליחידות המקוריות שלו. זה הכרחי כדי שאפשר יהיה להשוות בין המקדמים בהמשך.")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "3️⃣ פתרון המודל"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, "המודל נפתר באמצעות משוואות נורמליות: XᵀX·β = Xᵀy (כאשר X היא מטריצת הפרמטרים המתוקננים ועמודת חיתוך, ו-y הוא המשתנה המוסבר המתוקנן). המשוואות נפתרות באמצעות אלימינציית גאוס-ג'ורדן — שיטה אלגברית סטנדרטית ומדויקת, לא קירוב.")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "4️⃣ R² — מידת ההתאמה"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, 'R² מודד איזה אחוז מהשונות בכניסות התיירים "מוסבר" על ידי כל הפרמטרים במודל, בסולם 0 עד 1. ככל שגבוה יותר — המודל מסביר יותר. ככלל אצבע גס: מעל 0.7 = הסבר חזק, 0.4-0.7 = בינוני, מתחת ל-0.4 = חלש (יש כנראה גורמים משמעותיים נוספים מחוץ למודל). ', /* @__PURE__ */ React.createElement("b", null, "חשוב:"), " R² גבוה מראה קורלציה חזקה, אך אינו מוכיח קשר סיבתי.")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, '5️⃣ "אחוז ההשפעה" של כל פרמטר — ומה המגבלה שלו'), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, "האחוז מחושב כך: ", /* @__PURE__ */ React.createElement("code", null, "|מקדם הפרמטר| ÷ סכום כל המקדמים המוחלטים × 100"), '. זו הערכה פשוטה ואינטואיטיבית ל"חשיבות יחסית", המבוססת על כך שכל המקדמים כבר מתוקננים ולכן בני-השוואה. ', /* @__PURE__ */ React.createElement("b", null, "זו לא רמת מובהקות סטטיסטית (p-value)"), " ולא שיטת ייחוס פורמלית (כמו Shapley values). המגבלה המרכזית: אם שני פרמטרים מתואמים ביניהם (למשל HDI וחיפוש מקוון עשויים לנוע יחד במדינות מפותחות), האחוזים עלולים להיות מוטים. זהו כלי טוב לתובנה ראשונית — לא תחליף למחקר סטטיסטי מלא.")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "5.5️⃣ p-value ו-VIF שנוספו לכל פרמטר"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, "ליד כל פרמטר מוצג גם ", /* @__PURE__ */ React.createElement("b", null, "p-value"), " (ההסתברות לקבל תוצאה כזו או קיצונית ממנה אם בפועל אין קשר אמיתי — נמוך יותר = חשד חזק יותר שהקשר אמיתי ולא מקרי) ו-", /* @__PURE__ */ React.createElement("b", null, "VIF"), " — מדד שמתריע כשפרמטר מתואם חזק עם פרמטרים אחרים במודל (VIF מעל 5 נחשב חשוד, מעל 10 בעייתי — במקרה כזה קשה להפריד בין ההשפעה ה'אמיתית' של כל אחד מהם). ", /* @__PURE__ */ React.createElement("b", null, "אזהרה חשובה:"), " ה-p-value מחושב באופן 'נאיבי' — הוא מניח שכל שורת מדינה-שנה היא תצפית עצמאית, בעוד שבפועל שורות של אותה מדינה על פני שנים שונות קשורות זו לזו. המשמעות: p-values כאן ", /* @__PURE__ */ React.createElement("b", null, "עלולים להיראות טובים יותר ממה שהם באמת"), ". חישוב מדויק (Clustered Standard Errors לפי מדינה) דורש מספר גדול משמעותית של מדינות במאגר כדי להיות אמין, ועדיין לא מומש.")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "6️⃣ הצבעים בגרף"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, "🔵 כחול = השפעה חיובית (ככל שהפרמטר גבוה יותר, כך צפויים יותר תיירים). 🔴 אדום = השפעה שלילית (ככל שהפרמטר גבוה יותר, כך צפויים פחות תיירים).")), /* @__PURE__ */ React.createElement("section", null, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "7️⃣ איך לבדוק בעצמכם"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, 'בלשונית "ניתוח דירוג" → "ניתוח רגרסיה" יש כפתור "🔍 הצג נתוני גלם ששימשו לחישוב" שמציג את כל השורות (מדינה/שנה/ערכים) שנכנסו בפועל לחישוב. אפשר להעתיק את הטבלה לאקסל ולהריץ שם רגרסיה מקבילה (Data → Data Analysis → Regression באקסל, או פונקציית LINEST) כדי לוודא שהתוצאות שלנו תואמות.')), /* @__PURE__ */ React.createElement("section", { className: "rounded-xl p-3", style: { background: hexA("#f59e0b", 0.1), border: `1px solid ${hexA("#f59e0b", 0.3)}` } }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold mb-1.5" }, "⚠️ מגבלות שחשוב להכיר"), /* @__PURE__ */ React.createElement("p", { className: "text-secondary" }, "(1) חושבו p-value ו-VIF לכל מקדם, אך ב'אופן נאיבי' — בלי תיקון לכך שכל מדינה תורמת כמה שורות קשורות (repeated measures/panel data), מה שעלול להציג מובהקות טובה יותר ממה שקיימת בפועל. (2) VIF מזהה קורלציה בין זוגות/קבוצות פרמטרים, אבל לא מתקן אותה אוטומטית — הפרשנות של פרמטר עם VIF גבוה נשארת פחות אמינה. (3) המודל מבוסס על כל הנתונים במאגר (2010-2019 בלבד עדיין) — ככל שיתווספו שנים ומדינות, התוצאות עשויות להשתנות, וגם תיקון סטטיסטי נכון יותר (Clustered SE) ייעשה משמעותי יותר. אם צריך רמת דיוק סטטיסטי גבוהה יותר לצורך החלטות תקציביות משמעותיות, מומלץ להיוועץ באנליסט סטטיסטי.")))));
  }
  function DataManagementModal({ onClose, countries, allMetrics, onRefresh }) {
    const [showCrud, setShowCrud] = useState(false);
    return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[65] flex items-center justify-center p-4", style: { background: "var(--overlay-bg)" }, dir: "rtl" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 border-b divider flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg text-primary" }, "🗄️ ניהול בסיס הנתונים"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-1.5 rounded-lg hoverable text-secondary" }, "✕")), /* @__PURE__ */ React.createElement("div", { className: "p-6" }, /* @__PURE__ */ React.createElement(DataManagementPanel, { countries, allMetrics, onRefresh, onAddNew: () => setShowCrud(true) }))), showCrud && /* @__PURE__ */ React.createElement(CrudModal, { onClose: () => setShowCrud(false), countries, onSaved: onRefresh }));
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
    return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[70] flex items-center justify-center p-4", style: { background: "var(--overlay-bg)" }, dir: "rtl" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl shadow-2xl w-full max-w-sm border" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 border-b divider flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg text-primary" }, "🔑 שינוי סיסמה"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-1.5 rounded-lg hoverable text-secondary" }, "✕")), /* @__PURE__ */ React.createElement("div", { className: "p-5 space-y-4" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        value: newPw,
        autoFocus: true,
        onChange: (e) => setNewPw(e.target.value),
        onKeyDown: (e) => e.key === "Enter" && save(),
        placeholder: "הזן סיסמה חדשה",
        className: "input-field w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      }
    ), saved && /* @__PURE__ */ React.createElement("p", { className: "text-emerald-500 text-sm" }, "✅ הסיסמה עודכנה בהצלחה"), /* @__PURE__ */ React.createElement("button", { onClick: save, disabled: saving || newPw.trim().length < 3, className: "w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg text-sm" }, saving ? "שומר..." : "שמור סיסמה חדשה"))));
  }
  const SUB_MODULES = [
    { key: "single", label: "🔎 ניתוח מדינה בודדת" },
    { key: "compare", label: "⚖️ ניתוח השוואתי" },
    { key: "rank", label: "🏆 ניתוח דירוג" },
    { key: "drillin", label: "🔬 Drill In" }
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
    ))), sub === "single" && /* @__PURE__ */ React.createElement(SingleCountryDive, { years, theme, countries, allMetrics }), sub === "compare" && /* @__PURE__ */ React.createElement(ComparativeAnalysis, { years, theme, countries, allMetrics }), sub === "rank" && /* @__PURE__ */ React.createElement(RankingAnalysis, { years, theme, countries, allMetrics }), sub === "drillin" && /* @__PURE__ */ React.createElement(SurveyDrillIn, { theme }));
  }
  const MAX_EXTRACT_CHARS = 9e3;
  async function extractFileContent(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "csv" || ext === "xlsx" || ext === "xls") {
      if (!window.XLSX) throw new Error("ספריית קריאת האקסל לא נטענה (בדוק חיבור לאינטרנט ורענן).");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      let text = "";
      wb.SheetNames.forEach((name) => {
        const sheet = wb.Sheets[name];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        text += `
== גיליון: ${name} ==
${csv}`;
      });
      return text.slice(0, MAX_EXTRACT_CHARS);
    }
    if (ext === "pdf") {
      if (!window.pdfjsLib) throw new Error("ספריית קריאת ה-PDF לא נטענה (בדוק חיבור לאינטרנט ורענן).");
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
    throw new Error(`סוג קובץ לא נתמך: .${ext}. יש להעלות Excel (.xlsx/.xls), CSV או PDF.`);
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
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border px-5 py-4", style: { background: hexA(theme.solid, 0.07), borderColor: hexA(theme.solid, 0.25) } }, /* @__PURE__ */ React.createElement("h1", { className: `text-lg font-bold ${theme.text}` }, "🔬 Drill In — ניתוח סקרי תיירות"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary mt-0.5" }, "העלה קובץ סקר תיירות נכנסת (Excel / CSV / PDF) לניתוח מעמיק לפי סגמנטים. הקובץ נקרא ומעובד בדפדפן בלבד — ", /* @__PURE__ */ React.createElement("b", null, "אינו נשמר"), " במערכת.")), !file && /* @__PURE__ */ React.createElement(
      "label",
      {
        className: "flex flex-col items-center justify-center gap-3 rounded-2xl border-4 border-dashed cursor-pointer transition hover:opacity-80",
        style: { borderColor: hexA(theme.solid, 0.35), background: hexA(theme.solid, 0.04), minHeight: 260 }
      },
      /* @__PURE__ */ React.createElement("div", { style: { width: 64, height: 64, borderRadius: "50%", background: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 32, color: "white" } }, "⬇️")),
      /* @__PURE__ */ React.createElement("p", { className: "text-primary font-semibold" }, "לחץ כדי להעלות קובץ סקר"),
      /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted" }, "Excel (.xlsx/.xls) · CSV · PDF"),
      /* @__PURE__ */ React.createElement("input", { ref: fileInputRef, type: "file", accept: ".xlsx,.xls,.csv,.pdf", className: "hidden", onChange: (e) => onFileSelected(e.target.files[0]) })
    ), file && /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-5 border shadow-sm space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm text-primary font-medium" }, "📄 ", file.name), /* @__PURE__ */ React.createElement("button", { onClick: reset, className: "text-xs text-red-500" }, "🗑️ הסר קובץ ובחר אחר")), extracting && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-secondary" }, "🔄 קורא את הקובץ..."), extractError && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-red-500" }, "⚠️ ", extractError), extractedText && !extracting && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted" }, "✅ נקראו ", fmtNum(extractedPreviewLen), " תווים מהקובץ (אם הקובץ ארוך, ייתכן שנלקח רק חלקו הראשון)."), extractedText && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: runAnalysis,
        disabled: analyzing,
        className: `px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-l ${theme.grad} disabled:opacity-50`
      },
      analyzing ? "🔄 מנתח..." : "▶️ בצע ניתוח"
    ), analysisError && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-red-500" }, "⚠️ שגיאה: ", analysisError), analysis && /* @__PURE__ */ React.createElement("div", { className: "space-y-4 border-t divider pt-4", style: { animation: "fadeIn 0.3s ease-in" } }, parseParagraphSections(analysis).map((para, i) => /* @__PURE__ */ React.createElement("p", { key: i, className: "text-sm text-primary leading-relaxed whitespace-pre-line border-r-4 pr-4", style: { borderColor: theme.solid } }, para))), analysis && /* @__PURE__ */ React.createElement(OpenQuestionAI, { key: `ask-survey-${file == null ? void 0 : file.name}`, theme, subject: (file == null ? void 0 : file.name) || "ניתוח הסקר", data: { survey_analysis_summary: analysis.slice(0, 4000) }, placeholder: "לדוגמה: מה הממצא הכי מפתיע בסקר הזה?" })));
  }
  const FLIGHT_DIRECTION_FILTERS = [
    { key: "all", label: "🌐 הכל" },
    { key: "arrival", label: "🛬 נחיתות" },
    { key: "departure", label: "🛫 המראות" }
  ];
  function flightStatusMeta(f) {
    const raw = (f.status_he || f.status_en || "").toString().trim();
    if (!raw) return { label: "מתוכננת", color: "#94a3b8" };
    const lower = raw.toLowerCase();
    if (raw.includes("בוטל") || lower.includes("cancel")) return { label: raw, color: "#ef4444" };
    if (raw.includes("עיכוב") || raw.includes("מתעכב") || lower.includes("delay")) return { label: raw, color: "#f59e0b" };
    return { label: raw, color: "#16a34a" };
  }
  function FlightsStatusTab({ theme }) {
    const WINDOW_HOURS = 24;
    const [direction, setDirection] = useState("all");
    const [airlineFilter, setAirlineFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [flights, setFlights] = useState([]);
    const [meta, setMeta] = useState({ lastSyncedAt: null, totalRows: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const [rows, m] = await Promise.all([
          DataAPI.fetchFlights({ direction, sinceHours: WINDOW_HOURS, aheadHours: WINDOW_HOURS }),
          DataAPI.fetchFlightsSyncMeta()
        ]);
        setFlights(rows);
        setMeta(m);
      } catch (err) {
        console.error(err);
        setError(String(err.message || err));
      }
      setLoading(false);
    }, [direction]);
    useEffect(() => {
      load();
    }, [load]);
    const airlineOptions = useMemo(() => {
      const set = new Set(flights.map((f) => f.airline_name).filter(Boolean));
      return Array.from(set).sort((a, b) => a.localeCompare(b, "he"));
    }, [flights]);
    useEffect(() => {
      if (airlineFilter !== "all" && !airlineOptions.includes(airlineFilter)) setAirlineFilter("all");
    }, [airlineOptions, airlineFilter]);
    const filtered = useMemo(() => {
      const q = search.trim();
      return flights.filter((f) => {
        if (airlineFilter !== "all" && f.airline_name !== airlineFilter) return false;
        if (!q) return true;
        const hay = [f.airline_name, f.airline_code, f.flight_number, f.other_city_he, f.other_city_en, f.other_country_he, f.other_country_en].filter(Boolean).join(" ");
        return hay.includes(q);
      });
    }, [flights, airlineFilter, search]);
    const stats = useMemo(() => {
      const total = filtered.length;
      const arrivals = filtered.filter((f) => f.direction === "arrival").length;
      const departures = filtered.filter((f) => f.direction === "departure").length;
      const delayVals = filtered.filter((f) => f.delay_minutes != null).map((f) => f.delay_minutes);
      const avgDelay = delayVals.length ? delayVals.reduce((s, v) => s + v, 0) / delayVals.length : null;
      const delayedCount = filtered.filter((f) => f.delay_minutes != null && f.delay_minutes >= 15).length;
      return { total, arrivals, departures, avgDelay, delayedCount };
    }, [filtered]);
    const hourlyChart = useMemo(() => {
      if (!filtered.length) return null;
      const buckets = Array.from({ length: 24 }, () => ({ arrival: 0, departure: 0 }));
      filtered.forEach((f) => {
        const d = new Date(f.scheduled_time);
        if (isNaN(d.getTime())) return;
        const h = d.getHours();
        buckets[h][f.direction] = (buckets[h][f.direction] || 0) + 1;
      });
      return {
        labels: buckets.map((_, h) => `${String(h).padStart(2, "0")}:00`),
        datasets: [
          { label: "🛬 נחיתות", data: buckets.map((b) => b.arrival), backgroundColor: theme.solid, borderRadius: 4 },
          { label: "🛫 המראות", data: buckets.map((b) => b.departure), backgroundColor: "#94a3b8", borderRadius: 4 }
        ]
      };
    }, [filtered, theme]);
    const countryChart = useMemo(() => {
      if (!filtered.length) return null;
      const counts = {};
      filtered.forEach((f) => {
        const name = f.other_country_he || f.other_country_en;
        if (!name) return;
        counts[name] = (counts[name] || 0) + 1;
      });
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
      if (!top.length) return null;
      return {
        labels: top.map(([name]) => name),
        datasets: [{ label: "מס' טיסות", data: top.map(([, c]) => c), backgroundColor: theme.solid, borderRadius: 4 }]
      };
    }, [filtered, theme]);
    const delayByAirlineChart = useMemo(() => {
      const byAirline = {};
      filtered.forEach((f) => {
        if (f.delay_minutes == null || !f.airline_name) return;
        (byAirline[f.airline_name] = byAirline[f.airline_name] || []).push(f.delay_minutes);
      });
      const entries = Object.entries(byAirline).filter(([, arr]) => arr.length >= 2).map(([name, arr]) => [name, arr.reduce((s, v) => s + v, 0) / arr.length, arr.length]).sort((a, b) => b[1] - a[1]).slice(0, 8);
      if (!entries.length) return null;
      return {
        labels: entries.map(([name, , n]) => `${name} (${n})`),
        datasets: [{ label: "עיכוב ממוצע (דק')", data: entries.map(([, avg]) => Math.round(avg * 10) / 10), backgroundColor: entries.map(([, avg]) => avg >= 15 ? "#ef4444" : theme.solid), borderRadius: 4 }]
      };
    }, [filtered, theme]);
    const tableRows = useMemo(() => {
      const nowIl = nowAsIsraelNaiveDate();
      return [...filtered].sort((a, b) => Math.abs(new Date(a.scheduled_time) - nowIl) - Math.abs(new Date(b.scheduled_time) - nowIl)).slice(0, 60);
    }, [filtered]);
    const freshnessMinutesAgo = meta.lastSyncedAt ? Math.round((Date.now() - new Date(meta.lastSyncedAt).getTime()) / 6e4) : null;
    const isStale = freshnessMinutesAgo != null && freshnessMinutesAgo > 20;
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-3 border shadow-sm flex items-center justify-between flex-wrap gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-xs" }, freshnessMinutesAgo == null ? /* @__PURE__ */ React.createElement("span", { className: "text-muted" }, "⏳ טרם התקבל סנכרון") : /* @__PURE__ */ React.createElement("span", { className: "font-medium", style: { color: isStale ? "#ef4444" : "#16a34a" } }, isStale ? "⚠️ " : "🟢 ", "עודכן לפני ", fmtRelativeMinutes(freshnessMinutesAgo)), meta.totalRows != null && /* @__PURE__ */ React.createElement("span", { className: "text-muted" }, "· ", fmtNum(meta.totalRows), " רשומות בהיסטוריה"), /* @__PURE__ */ React.createElement(InfoTip, { text: "הנתונים מסונכרנים אוטומטית כל 15 דקות ממאגר 'טיסות' הפתוח של רשות שדות התעופה ב-data.gov.il. הטבלה כאן מציגה חלון של ±24 שעות סביב הרגע הנוכחי (לפי שעון ישראל)." })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("button", { onClick: load, disabled: loading, className: "text-xs px-3 py-1.5 rounded-lg border text-secondary hoverable disabled:opacity-50", style: { borderColor: "var(--card-border)" } }, loading ? "🔄 מרענן..." : "🔄 רענן עכשיו"), /* @__PURE__ */ React.createElement(ExportBar, null))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-1 p-1 rounded-2xl border", style: { background: hexA(theme.solid, 0.06), borderColor: hexA(theme.solid, 0.25) } }, FLIGHT_DIRECTION_FILTERS.map((d) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: d.key,
        onClick: () => setDirection(d.key),
        className: `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${direction === d.key ? `bg-gradient-to-l ${theme.grad} text-white shadow-md` : "hoverable"}`,
        style: direction !== d.key ? { color: theme.solid } : {}
      },
      d.label
    ))), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: airlineFilter,
        onChange: (e) => setAirlineFilter(e.target.value),
        className: "input-field border rounded-lg px-3 py-1.5 text-xs sm:text-sm"
      },
      /* @__PURE__ */ React.createElement("option", { value: "all" }, "✈️ כל חברות התעופה"),
      airlineOptions.map((a) => /* @__PURE__ */ React.createElement("option", { key: a, value: a }, a))
    ), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: search,
        onChange: (e) => setSearch(e.target.value),
        placeholder: "🔍 חיפוש: עיר, מדינה, מס' טיסה...",
        className: "input-field border rounded-lg px-3 py-1.5 text-xs sm:text-sm flex-1 min-w-[180px]"
      }
    )), loading && !flights.length && /* @__PURE__ */ React.createElement("div", { className: "text-center py-20 text-secondary" }, "🔄 טוען נתוני טיסות..."), error && /* @__PURE__ */ React.createElement("div", { className: "text-center py-16 text-red-500" }, "⚠️ שגיאה בטעינת נתוני טיסות: ", error, /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-secondary" }, "ודאו שטבלת flights קיימת ושה-RLS מאפשר קריאה ל-anon.")), !loading && !error && !flights.length && /* @__PURE__ */ React.createElement("div", { className: "text-center py-16 text-secondary" }, "🕊️ אין טיסות בחלון הזמן הנוכחי (±", WINDOW_HOURS, " שעות)."), !error && !!flights.length && /* @__PURE__ */ React.createElement("div", { className: "space-y-5", style: { animation: "fadeIn 0.3s ease-in" } }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3" }, /* @__PURE__ */ React.createElement(KpiCard, { emoji: "📋", label: "סה״כ טיסות בחלון", value: fmtNum(stats.total), sub: `±${WINDOW_HOURS} שעות מעכשיו`, accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "🛬", label: "נחיתות", value: fmtNum(stats.arrivals), accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "🛫", label: "המראות", value: fmtNum(stats.departures), accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "⏱️", label: "עיכוב ממוצע", value: stats.avgDelay != null ? `${fmtDec(stats.avgDelay)} דק'` : "-", sub: "טיסות עם נתון בפועל בלבד", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "⚠️", label: "עיכוב מהותי (15+ דק')", value: fmtNum(stats.delayedCount), accentSolid: "#ef4444" })), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "📊 התפלגות טיסות לפי שעה"), hourlyChart ? /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: hourlyChart, options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: false } } } }) : /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted text-center py-10" }, "אין מספיק נתונים להצגת גרף.")), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-2 gap-5" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "🌍 מדינות מובילות (מוצא/יעד)"), countryChart ? /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: countryChart, options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } }) : /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted text-center py-10" }, "אין מספיק נתונים להצגת גרף.")), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm flex items-center gap-1.5" }, "🏢 עיכוב ממוצע לפי חברת תעופה", /* @__PURE__ */ React.createElement(InfoTip, { text: "מחושב רק עבור חברות עם לפחות 2 טיסות בעלות שעה מעודכנת בחלון הנוכחי. עיכוב = הפרש בדקות בין השעה המתוכננת לשעה המעודכנת בפועל." })), delayByAirlineChart ? /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: delayByAirlineChart, options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } }) : /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted text-center py-10" }, "אין מספיק נתונים להצגת גרף."))), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary text-sm" }, "📃 טיסות (הקרובות ביותר לזמן הנוכחי)"), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-muted" }, "מוצגות ", fmtNum(tableRows.length), " מתוך ", fmtNum(filtered.length))), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto rounded-lg border divider", style: { maxHeight: 420, overflowY: "auto" } }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-xs" }, /* @__PURE__ */ React.createElement("thead", { className: "text-secondary sticky top-0", style: { background: "var(--hover-bg)" } }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "כיוון"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "חברה"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "טיסה"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "מתוכננת"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "מעודכנת"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "יעד/מוצא"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "טרמינל"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "סטטוס"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "עיכוב"))), /* @__PURE__ */ React.createElement("tbody", null, tableRows.map((f) => {
      const st = flightStatusMeta(f);
      return /* @__PURE__ */ React.createElement("tr", { key: f.id, className: "border-t divider" }, /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5" }, f.direction === "arrival" ? "🛬" : "🛫"), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5 text-primary" }, f.airline_name || f.airline_code || "-"), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5 text-secondary" }, f.airline_code, " ", f.flight_number), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5 text-secondary" }, fmtDayHM(f.scheduled_time)), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5 text-secondary" }, fmtDayHM(f.updated_time)), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5 text-secondary" }, f.other_city_he || f.other_city_en || "-", " · ", f.other_country_he || f.other_country_en || "-"), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5 text-secondary" }, f.terminal || "-"), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5" }, /* @__PURE__ */ React.createElement("span", { className: "font-medium", style: { color: st.color } }, st.label)), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5" }, f.delay_minutes != null && f.delay_minutes >= 15 ? /* @__PURE__ */ React.createElement("span", { className: "text-xs px-1.5 py-0.5 rounded font-medium", style: { background: hexA("#ef4444", 0.12), color: "#ef4444" } }, "+", Math.round(f.delay_minutes), " דק'") : f.delay_minutes != null ? /* @__PURE__ */ React.createElement("span", { className: "text-muted" }, fmtDec(f.delay_minutes), " דק'") : /* @__PURE__ */ React.createElement("span", { className: "text-muted" }, "-")));
    }))))), /* @__PURE__ */ React.createElement(OpenQuestionAI, { key: `ask-flights-${direction}`, theme, subject: "מצב תעופתי כיום בנתב\"ג", data: { direction, windowHours: WINDOW_HOURS, stats, topCountries: countryChart ? countryChart.labels.slice(0, 5) : [] }, placeholder: "לדוגמה: איזו חברת תעופה הכי מעוכבת היום?" })));
  }
  const WEEKDAY_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  function fmtTrendPct(pct) {
    if (pct == null) return null;
    const sign = pct > 0 ? "+" : "";
    return `${sign}${fmtDec(pct)}%`;
  }
  function latestMetricForCountry(countryId, allMetrics) {
    const rows = allMetrics.filter((m) => m.country_id === countryId);
    if (!rows.length) return null;
    return rows.reduce((a, b) => b.year > a.year ? b : a);
  }
  function buildWeeklyGroups(rows, level) {
    const map = /* @__PURE__ */ new Map();
    rows.forEach((f) => {
      const country = f.other_country_he || f.other_country_en || "לא ידוע";
      const city = f.other_city_he || f.other_city_en || "לא ידוע";
      const key = level === "city" ? `${city}__${country}` : country;
      if (!map.has(key)) map.set(key, { key, name: level === "city" ? city : country, country, rows: [] });
      map.get(key).rows.push(f);
    });
    return map;
  }
  function computeGroupStats(group, prevCount) {
    const rows = group.rows;
    const count = rows.length;
    const airlineCounts = /* @__PURE__ */ new Map();
    rows.forEach((r) => {
      const name = r.airline_name || r.airline_code;
      if (!name) return;
      airlineCounts.set(name, (airlineCounts.get(name) || 0) + 1);
    });
    const airlineList = Array.from(airlineCounts.entries()).sort((a, b) => b[1] - a[1]);
    const topAirline = airlineList[0];
    const uniqueCities = new Set(rows.map((r) => r.other_city_he || r.other_city_en).filter(Boolean));
    const weekdayCounts = new Array(7).fill(0);
    rows.forEach((r) => {
      const d = new Date(r.scheduled_time);
      if (!isNaN(d.getTime())) weekdayCounts[d.getDay()]++;
    });
    let peakWeekdayIdx = 0;
    weekdayCounts.forEach((c, i) => {
      if (c > weekdayCounts[peakWeekdayIdx]) peakWeekdayIdx = i;
    });
    const delayVals = rows.filter((r) => r.delay_minutes != null).map((r) => r.delay_minutes);
    const onTimeRate = delayVals.length ? delayVals.filter((v) => v < 15).length / delayVals.length * 100 : null;
    const trendPct = prevCount > 0 ? (count - prevCount) / prevCount * 100 : null;
    const isNewRoute = prevCount === 0 && count > 0;
    return {
      key: group.key,
      name: group.name,
      country: group.country,
      count,
      prevCount,
      trendPct,
      isNewRoute,
      airlineCount: airlineList.length,
      airlineList,
      topAirline: topAirline ? { name: topAirline[0], count: topAirline[1], sharePct: Math.round(topAirline[1] / count * 1e3) / 10 } : null,
      uniqueCityCount: uniqueCities.size,
      avgPerDay: count / 7,
      peakWeekdayLabel: count > 0 ? WEEKDAY_HE[peakWeekdayIdx] : "-",
      onTimeRate
    };
  }
  function WeeklyCountrySummary({ theme, countries, allMetrics }) {
    const direction = "arrival";
    const [level, setLevel] = useState("country");
    const [countryFilter, setCountryFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("volume");
    const [showAll, setShowAll] = useState(false);
    const [expandedKey, setExpandedKey] = useState(null);
    const [showGaps, setShowGaps] = useState(false);
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await DataAPI.fetchFlights({ direction, sinceHours: 24 * 14, aheadHours: 0, limit: 6e3 });
        setFlights(rows);
      } catch (err) {
        console.error(err);
        setError(String(err.message || err));
      }
      setLoading(false);
    }, [direction]);
    useEffect(() => {
      load();
    }, [load]);
    useEffect(() => {
      if (level !== "country") setShowGaps(false);
    }, [level]);
    const { currentWeekRows, prevWeekRows } = useMemo(() => {
      const nowIl = nowAsIsraelNaiveDate();
      const weekAgo = new Date(nowIl.getTime() - 7 * 24 * 3600 * 1e3);
      const twoWeeksAgo = new Date(nowIl.getTime() - 14 * 24 * 3600 * 1e3);
      const cur = [], prev = [];
      flights.forEach((f) => {
        const d = new Date(f.scheduled_time);
        if (isNaN(d.getTime())) return;
        if (d >= weekAgo && d <= nowIl) cur.push(f);
        else if (d >= twoWeeksAgo && d < weekAgo) prev.push(f);
      });
      return { currentWeekRows: cur, prevWeekRows: prev };
    }, [flights]);
    const countryOptions = useMemo(() => {
      const set = new Set(currentWeekRows.map((f) => f.other_country_he || f.other_country_en).filter(Boolean));
      return Array.from(set).sort((a, b) => a.localeCompare(b, "he"));
    }, [currentWeekRows]);
    const groupStats = useMemo(() => {
      const curMap = buildWeeklyGroups(currentWeekRows, level);
      const prevMap = buildWeeklyGroups(prevWeekRows, level);
      let stats = Array.from(curMap.values()).map((g) => computeGroupStats(g, (prevMap.get(g.key) || { rows: [] }).rows.length));
      if (level === "city" && countryFilter !== "all") stats = stats.filter((s) => s.country === countryFilter);
      const q = search.trim();
      if (q) stats = stats.filter((s) => s.name.includes(q) || s.country.includes(q));
      if (showGaps && level === "country") {
        stats = stats.map((s) => {
          const country = countries.find((c) => c.name_he === s.country);
          if (!country) return { ...s, hasDirectFlights: null, gapFlag: null };
          const latest = latestMetricForCountry(country.id, allMetrics);
          const hasDirectFlights = !!(latest && latest.has_direct_flights);
          const gapFlag = hasDirectFlights && s.avgPerDay < 1 ? "underused" : null;
          return { ...s, hasDirectFlights, gapFlag };
        });
        const presentNames = new Set(stats.map((s) => s.country));
        const zeroFlightGaps = countries.filter((c) => {
          if (presentNames.has(c.name_he)) return false;
          if (q && !c.name_he.includes(q)) return false;
          const latest = latestMetricForCountry(c.id, allMetrics);
          return !!(latest && latest.has_direct_flights);
        }).map((c) => ({
          key: c.name_he,
          name: c.name_he,
          country: c.name_he,
          count: 0,
          prevCount: (prevMap.get(c.name_he) || { rows: [] }).rows.length,
          trendPct: null,
          isNewRoute: false,
          airlineCount: 0,
          airlineList: [],
          topAirline: null,
          uniqueCityCount: 0,
          avgPerDay: 0,
          peakWeekdayLabel: "-",
          onTimeRate: null,
          hasDirectFlights: true,
          gapFlag: "zero"
        }));
        stats = [...stats, ...zeroFlightGaps];
      }
      const sorted = [...stats].sort((a, b) => {
        if (sortBy === "trend") {
          const av = a.isNewRoute ? 1e4 : a.trendPct != null ? a.trendPct : -1e4;
          const bv = b.isNewRoute ? 1e4 : b.trendPct != null ? b.trendPct : -1e4;
          return bv - av;
        }
        if (sortBy === "name") return a.name.localeCompare(b.name, "he");
        return b.count - a.count;
      });
      return sorted;
    }, [currentWeekRows, prevWeekRows, level, countryFilter, search, showGaps, countries, allMetrics, sortBy]);
    const kpis = useMemo(() => {
      const totalCurrent = currentWeekRows.length;
      const totalPrev = prevWeekRows.length;
      const trendPct = totalPrev > 0 ? (totalCurrent - totalPrev) / totalPrev * 100 : null;
      const activeCountries = new Set(currentWeekRows.map((f) => f.other_country_he || f.other_country_en).filter(Boolean)).size;
      const activeCities = new Set(currentWeekRows.map((f) => f.other_city_he || f.other_city_en).filter(Boolean)).size;
      const emerging = groupStats.filter((s) => s.isNewRoute || s.trendPct != null && s.trendPct >= 50).length;
      const delayVals = currentWeekRows.filter((f) => f.delay_minutes != null).map((f) => f.delay_minutes);
      const onTimeShare = delayVals.length ? delayVals.filter((v) => v < 15).length / delayVals.length * 100 : null;
      return { totalCurrent, trendPct, activeCountries, activeCities, emerging, onTimeShare };
    }, [currentWeekRows, prevWeekRows, groupStats]);
    const topChart = useMemo(() => {
      const top = groupStats.slice(0, 12);
      if (!top.length) return null;
      return {
        labels: top.map((s) => s.name),
        datasets: [{ label: "נחיתות השבוע", data: top.map((s) => s.count), backgroundColor: top.map((s) => s.isNewRoute ? "#22c55e" : theme.solid), borderRadius: 4 }]
      };
    }, [groupStats, theme]);
    const trendChart = useMemo(() => {
      const top = groupStats.slice(0, 8);
      if (!top.length) return null;
      return {
        labels: top.map((s) => s.name),
        datasets: [
          { label: "שבוע קודם", data: top.map((s) => s.prevCount), backgroundColor: "#94a3b8", borderRadius: 4 },
          { label: "השבוע", data: top.map((s) => s.count), backgroundColor: theme.solid, borderRadius: 4 }
        ]
      };
    }, [groupStats, theme]);
    const airlineChart = useMemo(() => {
      const counts = /* @__PURE__ */ new Map();
      currentWeekRows.forEach((f) => {
        const name = f.airline_name || f.airline_code;
        if (!name) return;
        counts.set(name, (counts.get(name) || 0) + 1);
      });
      const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
      if (!top.length) return null;
      return {
        labels: top.map(([name]) => name),
        datasets: [{ label: "מס' נחיתות", data: top.map(([, c]) => c), backgroundColor: theme.solid, borderRadius: 4 }]
      };
    }, [currentWeekRows, theme]);
    const visibleStats = showAll ? groupStats : groupStats.slice(0, 15);
    return /* @__PURE__ */ React.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-secondary flex items-center gap-1.5" }, "🛬 הנתונים כאן כוללים נחיתות בלבד — מיועד לניתוח מקורות תיירות נכנסת"), /* @__PURE__ */ React.createElement(ExportBar, null)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-1 p-1 rounded-2xl border", style: { background: hexA(theme.solid, 0.06), borderColor: hexA(theme.solid, 0.25) } }, [{ key: "country", label: "🗺️ לפי מדינה" }, { key: "city", label: "🏙️ לפי עיר" }].map((l) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: l.key,
        onClick: () => setLevel(l.key),
        className: `px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${level === l.key ? `bg-gradient-to-l ${theme.grad} text-white shadow-md` : "hoverable"}`,
        style: level !== l.key ? { color: theme.solid } : {}
      },
      l.label
    ))), level === "city" && /* @__PURE__ */ React.createElement(
      "select",
      { value: countryFilter, onChange: (e) => setCountryFilter(e.target.value), className: "input-field border rounded-lg px-3 py-1.5 text-xs sm:text-sm" },
      /* @__PURE__ */ React.createElement("option", { value: "all" }, "🌍 כל המדינות"),
      countryOptions.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c))
    ), /* @__PURE__ */ React.createElement(
      "select",
      { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "input-field border rounded-lg px-3 py-1.5 text-xs sm:text-sm" },
      /* @__PURE__ */ React.createElement("option", { value: "volume" }, "מיין: נפח 📊"),
      /* @__PURE__ */ React.createElement("option", { value: "trend" }, "מיין: מגמה 📈"),
      /* @__PURE__ */ React.createElement("option", { value: "name" }, "מיין: א-ב")
    ), /* @__PURE__ */ React.createElement(
      "input",
      { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "🔍 חיפוש...", className: "input-field border rounded-lg px-3 py-1.5 text-xs sm:text-sm flex-1 min-w-[160px]" }
    ), level === "country" && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setShowGaps((s) => !s),
        disabled: !countries.length,
        className: `text-xs px-3 py-1.5 rounded-lg border font-medium disabled:opacity-40 ${showGaps ? "text-white" : "hoverable"}`,
        style: showGaps ? { background: "#f59e0b", borderColor: "#f59e0b" } : { borderColor: "var(--card-border)", color: "#f59e0b" },
        title: countries.length ? "" : "נתוני countries עדיין נטענים"
      },
      "🎯 פערי הזדמנות מול countries"
    )), loading && !flights.length && /* @__PURE__ */ React.createElement("div", { className: "text-center py-20 text-secondary" }, "🔄 טוען נתוני שבועיים..."), error && /* @__PURE__ */ React.createElement("div", { className: "text-center py-16 text-red-500" }, "⚠️ שגיאה: ", error), !error && !!flights.length && /* @__PURE__ */ React.createElement("div", { className: "space-y-5", style: { animation: "fadeIn 0.3s ease-in" } }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" }, /* @__PURE__ */ React.createElement(KpiCard, { emoji: "📋", label: "סה״כ (7 ימים)", value: fmtNum(kpis.totalCurrent), sub: kpis.trendPct != null ? `מגמה: ${fmtTrendPct(kpis.trendPct)} מול שבוע קודם` : "אין נתוני שבוע קודם להשוואה", accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "🗺️", label: "מדינות מקור פעילות", value: fmtNum(kpis.activeCountries), accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "🏙️", label: "ערים מקור פעילות", value: fmtNum(kpis.activeCities), accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "✈️", label: "חברות תעופה פעילות", value: fmtNum(new Set(currentWeekRows.map((f) => f.airline_name || f.airline_code).filter(Boolean)).size), accentSolid: theme.solid }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "🆕", label: "מסלולים חדשים/מתעוררים", value: fmtNum(kpis.emerging), sub: "חדש השבוע או צמיחה של 50%+", accentSolid: "#22c55e" }), /* @__PURE__ */ React.createElement(KpiCard, { emoji: "✅", label: "אמינות (בזמן)", value: kpis.onTimeShare != null ? `${fmtDec(kpis.onTimeShare)}%` : "-", sub: "עיכוב מתחת ל-15 דק'", accentSolid: theme.solid })), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "🏆 Top ", level === "country" ? "מדינות" : "ערים", " מקור — 7 ימים אחרונים"), topChart ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: topChart, options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } }), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted mt-2 flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, background: "#22c55e", display: "inline-block", borderRadius: 2 } }), " ירוק = מסלול חדש (לא הופיע בשבוע הקודם)")) : /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted text-center py-10" }, "אין מספיק נתונים.")), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-2 gap-5" }, /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "📈 השוואת שבוע נוכחי מול קודם (Top 8)"), trendChart ? /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: trendChart, options: { responsive: true, maintainAspectRatio: false } }) : /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted text-center py-10" }, "אין מספיק נתונים.")), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary mb-3 text-sm" }, "✈️ Top חברות תעופה — 7 ימים אחרונים"), airlineChart ? /* @__PURE__ */ React.createElement(ChartCanvas, { type: "bar", data: airlineChart, options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } }) : /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted text-center py-10" }, "אין מספיק נתונים."))), /* @__PURE__ */ React.createElement("div", { className: "card rounded-2xl p-4 border shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3 flex-wrap gap-2" }, /* @__PURE__ */ React.createElement("h4", { className: "font-semibold text-primary text-sm" }, "📃 טבלת סיכום — ", level === "country" ? "מדינה" : "עיר", " (לחץ על שורה לפירוט חברות תעופה)"), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-muted" }, "מוצגות ", fmtNum(visibleStats.length), " מתוך ", fmtNum(groupStats.length))), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto rounded-lg border divider", style: { maxHeight: 460, overflowY: "auto" } }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-xs" }, /* @__PURE__ */ React.createElement("thead", { className: "text-secondary sticky top-0", style: { background: "var(--hover-bg)" } }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, level === "country" ? "מדינה" : "עיר"), level === "city" && /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "מדינה"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "נחיתות השבוע"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "מגמה"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "חברות"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "חברה דומיננטית"), level === "country" && /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "ערים"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "יום שיא"), /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "בזמן"), showGaps && level === "country" && /* @__PURE__ */ React.createElement("th", { className: "text-right px-2 py-1.5" }, "פער"))), /* @__PURE__ */ React.createElement("tbody", null, visibleStats.map((s) => {
      const isExpanded = expandedKey === s.key;
      const rowsOut = [/* @__PURE__ */ React.createElement("tr", { key: s.key, className: "border-t divider cursor-pointer hoverable", onClick: () => setExpandedKey(isExpanded ? null : s.key) }, /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5 text-primary font-medium" }, s.isNewRoute && "🆕 ", s.name), level === "city" && /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5 text-secondary" }, s.country), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5 text-secondary" }, fmtNum(s.count), /* @__PURE__ */ React.createElement("span", { className: "text-muted" }, " (", fmtDec(s.avgPerDay), "/יום)")), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5" }, s.isNewRoute ? /* @__PURE__ */ React.createElement("span", { className: "font-medium", style: { color: "#22c55e" } }, "🆕 חדש") : s.trendPct != null ? /* @__PURE__ */ React.createElement("span", { className: "font-medium", style: { color: s.trendPct >= 0 ? "#16a34a" : "#ef4444" } }, s.trendPct >= 0 ? "▲ " : "▼ ", fmtTrendPct(s.trendPct)) : /* @__PURE__ */ React.createElement("span", { className: "text-muted" }, "-")), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5 text-secondary" }, s.airlineCount), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5 text-secondary" }, s.topAirline ? `${s.topAirline.name} (${s.topAirline.sharePct}%)` : "-"), level === "country" && /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5 text-secondary" }, s.uniqueCityCount), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5 text-secondary" }, s.peakWeekdayLabel), /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5 text-secondary" }, s.onTimeRate != null ? `${fmtDec(s.onTimeRate)}%` : "-"), showGaps && level === "country" && /* @__PURE__ */ React.createElement("td", { className: "px-2 py-1.5" }, s.gapFlag === "zero" ? /* @__PURE__ */ React.createElement("span", { className: "text-xs px-1.5 py-0.5 rounded font-medium", style: { background: hexA("#ef4444", 0.15), color: "#ef4444" }, title: "מוגדר עם טיסות ישירות ב-countries, אך אין ולו נחיתה אחת בשבוע האחרון" }, "🚫 אין נחיתות השבוע") : s.gapFlag === "underused" ? /* @__PURE__ */ React.createElement("span", { className: "text-xs px-1.5 py-0.5 rounded font-medium", style: { background: hexA("#f59e0b", 0.15), color: "#b45309" }, title: "מוגדר עם טיסות ישירות ב-countries, אך נפח נמוך מטיסה ביום בפועל בשבוע האחרון" }, "⚠️ נפח נמוך") : s.hasDirectFlights === false ? /* @__PURE__ */ React.createElement("span", { className: "text-muted" }, "אין טיסות ישירות מוצהרות") : s.hasDirectFlights == null ? /* @__PURE__ */ React.createElement("span", { className: "text-muted" }, "-") : /* @__PURE__ */ React.createElement("span", { className: "text-secondary" }, "✓ תואם")))];
      if (isExpanded) {
        rowsOut.push(/* @__PURE__ */ React.createElement("tr", { key: `${s.key}-detail` }, /* @__PURE__ */ React.createElement("td", { colSpan: 9, className: "px-3 py-3 border-t divider", style: { background: "var(--hover-bg)" } }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-semibold text-secondary mb-2" }, "פילוח חברות תעופה עבור ", s.name, ":"), s.airlineList.length ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, s.airlineList.map(([name, count]) => /* @__PURE__ */ React.createElement("span", { key: name, className: "text-xs px-2.5 py-1 rounded-full font-medium", style: { background: hexA(theme.solid, 0.1), color: theme.solid } }, name, " — ", count, " (", Math.round(count / s.count * 100), "%)"))) : /* @__PURE__ */ React.createElement("p", { className: "text-xs text-muted" }, "אין נתוני טיסות עבור ", s.name, " בשבוע האחרון."))));
      }
      return rowsOut;
    }))))), !showAll && groupStats.length > 15 && /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setShowAll(true), className: "text-xs px-4 py-2 rounded-lg border text-secondary hoverable", style: { borderColor: "var(--card-border)" } }, "הצג את כל ", groupStats.length, " התוצאות ▼")), showAll && groupStats.length > 15 && /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setShowAll(false), className: "text-xs px-4 py-2 rounded-lg border text-secondary hoverable", style: { borderColor: "var(--card-border)" } }, "הצג פחות ▲"))), /* @__PURE__ */ React.createElement(OpenQuestionAI, { key: `ask-weekly-${direction}-${level}`, theme, subject: "סיכום שבועי של כניסות תיירים לפי מדינה/עיר", data: { direction, level, kpis, topGroups: groupStats.slice(0, 8).map((s) => ({ name: s.name, count: s.count, trendPct: s.trendPct, isNewRoute: s.isNewRoute, topAirline: s.topAirline })) }, placeholder: "לדוגמה: מאיפה כדאי להגביר שיווק על סמך הנתונים האלו?" }));
  }
  const FLIGHTS_SUB_MODULES = [
  { key: "weekly", label: "🗺️ סיכום שבועי לפי מדינה/עיר" },
  { key: "today", label: "📡 סטטוס כיום" }
];
  function FlightsMainTab({ theme, countries, allMetrics }) {
    const [sub, setSub] = useState("weekly");
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex gap-1 p-1 rounded-2xl border w-fit mb-6 flex-wrap", style: { background: hexA(theme.solid, 0.06), borderColor: hexA(theme.solid, 0.25) } }, FLIGHTS_SUB_MODULES.map((m) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: m.key,
        onClick: () => setSub(m.key),
        className: `px-4 py-2 rounded-xl text-sm font-medium transition ${sub === m.key ? `bg-gradient-to-l ${theme.grad} text-white shadow-md` : "hoverable"}`,
        style: sub !== m.key ? { color: theme.solid } : {}
      },
      m.label
    ))), sub === "today" && /* @__PURE__ */ React.createElement(FlightsStatusTab, { theme }), sub === "weekly" && /* @__PURE__ */ React.createElement(WeeklyCountrySummary, { theme, countries, allMetrics }));
  }
  function NavAssistant() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
      { role: "assistant", text: "👋 היי! אני עוזר הניווט של המערכת. אני יכול לעזור לך להבין איך להשתמש באתר, מה כל מסך עושה, ואיך מחושבים המדדים והנוסחאות. במה אוכל לעזור?" }
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
        const history = nextMessages.slice(-8).map((m) => `${m.role === "user" ? "משתמש" : "עוזר"}: ${m.text}`).join("\n");
        const res = await DataAPI.generateInsight("nav_help", { question: q, history });
        setMessages((prev) => [...prev, { role: "assistant", text: sanitizeAiText(res.text) }]);
      } catch (err) {
        setMessages((prev) => [...prev, { role: "assistant", text: "⚠️ שגיאה בפנייה לעוזר: " + String(err.message || err) }]);
      }
      setLoading(false);
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        title: "עוזר ניווט AI",
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
      open ? "✕" : "💬"
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
    } }, /* @__PURE__ */ React.createElement("div", { className: "p-3 border-b divider flex items-center gap-2", style: { background: "linear-gradient(135deg, #86efac33, #4ade8033)" } }, /* @__PURE__ */ React.createElement("span", { className: "text-lg" }, "💬"), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-primary text-sm" }, "עוזר ניווט AI")), /* @__PURE__ */ React.createElement("div", { ref: scrollRef, className: "flex-1 overflow-y-auto p-3 space-y-2" }, messages.map((m, i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        className: `text-sm rounded-xl px-3 py-2 max-w-[85%] ${m.role === "user" ? "mr-auto text-white" : "ml-auto"}`,
        style: m.role === "user" ? { background: "#4ade80" } : { background: "var(--hover-bg)", color: "var(--text-primary)" }
      },
      m.text
    )), loading && /* @__PURE__ */ React.createElement("div", { className: "text-xs text-muted" }, "🔄 חושב...")), /* @__PURE__ */ React.createElement("div", { className: "p-3 border-t divider flex gap-2" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: input,
        onChange: (e) => setInput(e.target.value),
        onKeyDown: (e) => e.key === "Enter" && send(),
        placeholder: "שאל אותי על השימוש באתר...",
        className: "input-field flex-1 border rounded-lg px-3 py-2 text-sm"
      }
    ), /* @__PURE__ */ React.createElement("button", { onClick: send, disabled: loading, className: "bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm" }, "➤"))));
  }
  const SESSION_KEY = "tourism_dashboard_session";
  const SESSION_HOURS = 24;
  function hasValidSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const { ts } = JSON.parse(raw);
      return Date.now() - ts < SESSION_HOURS * 60 * 60 * 1e3;
    } catch (e) {
      return false;
    }
  }
  function saveSession() {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now() }));
    } catch (e) {
    }
  }
  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
    }
  }
  function App() {
    const [authed, setAuthed] = useState(() => hasValidSession());
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
    const theme = TAB_THEMES[activeTab];
    const isFlightsTab = activeTab === "flights";
    const subheaderNode = isFlightsTab ? /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary mt-0.5" }, "🛫 נתוני טיסות חיים מנתב״ג · מאגר \"טיסות\" הפתוח של רשות שדות התעופה (data.gov.il) · מתעדכן אוטומטית כל 15 דקות") : /* @__PURE__ */ React.createElement("p", { className: "text-xs text-secondary mt-0.5" }, "📅 ", theme.years[0], "–", theme.years[theme.years.length - 1], " · 🌍 ", countries.length, " מדינות במאגר");
    const mainContent = isFlightsTab ? /* @__PURE__ */ React.createElement(FlightsMainTab, { theme, countries, allMetrics }) : /* @__PURE__ */ React.createElement(React.Fragment, null, dataLoading && /* @__PURE__ */ React.createElement("div", { className: "text-center py-20 text-secondary" }, "🔄 טוען נתונים מהמאגר..."), dataError && /* @__PURE__ */ React.createElement("div", { className: "text-center py-20 text-red-500" }, "⚠️ שגיאה בטעינת נתונים: ", dataError, /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-secondary" }, "בדוק את config.js (SUPABASE_URL / ANON_KEY) ואת מדיניות ה-RLS.")), !dataLoading && !dataError && /* @__PURE__ */ React.createElement(TabContent, { theme, years: theme.years, countries, allMetrics }));
    if (!authed) return /* @__PURE__ */ React.createElement(LoginScreen, { onLogin: () => {
      saveSession();
      setAuthed(true);
    }, currentPassword: password });
    return /* @__PURE__ */ React.createElement("div", { dir: "rtl", "data-mode": isDark ? "dark" : "light", className: "app-page min-h-screen transition-colors duration-300" }, /* @__PURE__ */ React.createElement(GlobalStyles, null), /* @__PURE__ */ React.createElement("header", { className: "app-nav sticky top-0 z-30 border-b shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(MinistryLogo, { size: 36 }), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-primary hidden sm:block" }, "🧳 שיווק תיירות · BI")), /* @__PURE__ */ React.createElement("nav", { className: "flex-1 flex justify-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-1 p-1 rounded-2xl overflow-x-auto max-w-full", style: { background: "var(--hover-bg)" } }, Object.entries(TAB_THEMES).map(([key, t]) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key,
        onClick: () => setActiveTab(key),
        className: `px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${activeTab === key ? `bg-gradient-to-l ${t.grad} text-white shadow-md` : "text-secondary hoverable"}`
      },
      t.name
    )))), /* @__PURE__ */ React.createElement("button", { onClick: () => setSidebarOpen(true), className: "p-2 rounded-xl hoverable transition shrink-0 text-secondary" }, "⚙️"))), /* @__PURE__ */ React.createElement("main", { className: "max-w-7xl mx-auto px-4 py-6" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border px-5 py-4 mb-6", style: { background: hexA(theme.solid, 0.07), borderColor: hexA(theme.solid, 0.25) } }, /* @__PURE__ */ React.createElement("h1", { className: `text-lg font-bold ${theme.text}` }, theme.name), /* @__PURE__ */ subheaderNode), mainContent), /* @__PURE__ */ React.createElement("footer", { className: "text-center text-xs text-muted py-8" }, "🧳 מערכת ניתוח שיווק תיירות · משרד התיירות"), /* @__PURE__ */ React.createElement(SettingsSidebar, { open: sidebarOpen, onClose: () => setSidebarOpen(false), mode, setMode, currentPassword: password, onChangePassword: setPassword, countries, allMetrics, onRefresh: loadData, onLogout: () => {
      clearSession();
      setAuthed(false);
    } }), /* @__PURE__ */ React.createElement(NavAssistant, null));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
})();
