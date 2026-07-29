// =====================================================================
// Tourism Marketing BI — Phase 1 frontend
// Plain React (no build step) loaded via Babel-standalone in index.html.
// Talks to a real Supabase Postgres database (see database_schema_v2.sql
// + phase1_extra.sql) and to the `estimate-country` Edge Function for
// AI-based completion of countries missing from the database.
// =====================================================================
const { useState, useEffect, useMemo, useRef, useCallback } = React;

/* ---------------------------------------------------------------------
   Supabase client
--------------------------------------------------------------------- */
const sb = window.supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

/* ---------------------------------------------------------------------
   Theme config — blue family, one hue per tab
--------------------------------------------------------------------- */
const YEARS_2010_2019 = Array.from({ length: 10 }, (_, i) => 2010 + i);
const YEARS_2023_TODAY = [2023, 2024, 2025, 2026];
const YEARS_FULL = [...YEARS_2010_2019, ...YEARS_2023_TODAY];

const TAB_THEMES = {
  t1: { name: "🗓️ ניתוח נתונים 2010-2019", grad: "from-sky-500 to-blue-600", text: "text-sky-700 dark:text-sky-300", solid: "#0284c7", years: YEARS_2010_2019 },
  t2: { name: "📡 ניתוח נתונים 2023-היום", grad: "from-blue-600 to-indigo-600", text: "text-blue-700 dark:text-blue-300", solid: "#2563eb", years: YEARS_2023_TODAY },
  t3: { name: "🗄️ ניתוח מאגר נתונים מקיף", grad: "from-indigo-600 to-blue-900", text: "text-indigo-700 dark:text-indigo-300", solid: "#4338ca", years: YEARS_FULL },
};

const RANK_PARAMS = [
  { key: "sentiment", label: "❤️ אהדה פרו-ישראלית" },
  { key: "roi", label: "💹 רווחיות (יעילות המרה)" },
  { key: "religiousAffinity", label: "🕎 זיקה דתית" },
  { key: "totalScore", label: "🏆 ציון כולל (משוקלל)" },
];

/* ---------------------------------------------------------------------
   Helpers
--------------------------------------------------------------------- */
function fmtNum(n) { return n === undefined || n === null || isNaN(n) ? "-" : new Intl.NumberFormat("he-IL").format(Math.round(n)); }
function fmtCompact(n) {
  if (n === undefined || n === null || isNaN(n)) return "-";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.round(n).toString();
}
function hexA(hex, alpha) {
  const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
  return hex + a;
}

let LOG_MIN = 0, LOG_MAX = 1;
function setJewishPopBounds(allValues) {
  const vals = allValues.filter((v) => v != null && v > 0);
  if (!vals.length) return;
  LOG_MIN = Math.log1p(Math.min(...vals));
  LOG_MAX = Math.log1p(Math.max(...vals));
}

/* Compute derived analysis metrics for a set of yearly rows (snake_case DB fields) */
function deriveMetrics(rows, years) {
  const filtered = rows.filter((r) => years.includes(r.year));
  if (!filtered.length) return null;
  filtered.sort((a, b) => a.year - b.year);

  const visitorsByYear = {};
  filtered.forEach((r) => { visitorsByYear[r.year] = (r.entries_to_israel_thousands || 0) * 1000; });

  const sumVisitors = filtered.reduce((s, r) => s + (r.entries_to_israel_thousands || 0) * 1000, 0);
  const sumOutbound = filtered.reduce((s, r) => s + (r.outbound_tourism_millions || 0), 0);
  const avgHdi = filtered.reduce((s, r) => s + (r.hdi || 0), 0) / filtered.length;
  const avgAirQuality = filtered.reduce((s, r) => s + (r.air_transport_quality || 0), 0) / filtered.length;
  const avgJewishPop = filtered.reduce((s, r) => s + (r.jewish_population || 0), 0) / filtered.length;
  const advisoryYears = filtered.filter((r) => r.travel_advisory === 2).length;
  const hasDirectFlights = !!filtered[filtered.length - 1].has_direct_flights;
  const isAiEstimated = filtered.some((r) => r.is_ai_estimated);

  const sentiment = Math.round(
    filtered.reduce((s, r) => s + ((r.online_search_index || 0) * 0.6 + (r.travel_advisory === 1 ? 100 : 50) * 0.4), 0) / filtered.length
  );

  const religiousAffinity = Math.round(
    Math.max(0, Math.min(100, ((Math.log1p(avgJewishPop) - LOG_MIN) / (LOG_MAX - LOG_MIN || 1)) * 100))
  );

  const roi = sumOutbound > 0 ? +(((sumVisitors / 1e6) / sumOutbound) * 100).toFixed(2) : 0;
  const roiScore = Math.min(100, Math.max(0, roi * 20));

  const first = filtered[0].entries_to_israel_thousands || 0;
  const last = filtered[filtered.length - 1].entries_to_israel_thousands || 0;
  const growthPct = first > 0 ? ((last - first) / first) * 100 : 0;
  const growthTrend = Math.round(Math.min(100, Math.max(0, 50 + growthPct / 4)));

  const totalScore = Math.round(sentiment * 0.35 + religiousAffinity * 0.25 + roiScore * 0.25 + growthTrend * 0.15);

  return {
    visitorsByYear, sumVisitors, sumOutbound, avgHdi, avgAirQuality, avgJewishPop,
    advisoryYears, hasDirectFlights, sentiment, religiousAffinity, roi, roiScore,
    growthTrend, totalScore, isAiEstimated,
  };
}

/* ---------------------------------------------------------------------
   Data access layer (Supabase)
--------------------------------------------------------------------- */
const DataAPI = {
  async fetchCountries() {
    const { data, error } = await sb.from("countries").select("*").order("name_he");
    if (error) throw error;
    return data;
  },
  async fetchAllMetrics() {
    const { data, error } = await sb.from("country_metrics").select("*");
    if (error) throw error;
    return data;
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
    if (error) throw error;
    return data;
  },
};

/* ---------------------------------------------------------------------
   Global CSS (dark mode via CSS variables + data-mode attribute)
--------------------------------------------------------------------- */
function GlobalStyles() {
  return (
    <style>{`
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
    `}</style>
  );
}

/* ---------------------------------------------------------------------
   Info tooltip (i) — yellow-pastel bubble on hover
--------------------------------------------------------------------- */
function InfoTip({ text }) {
  return (
    <span className="tooltip-i text-muted">
      <span style={{ width: 15, height: 15, borderRadius: "50%", border: "1px solid currentColor", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>i</span>
      <span className="bubble">{text}</span>
    </span>
  );
}

/* ---------------------------------------------------------------------
   Chart.js wrapper components (no Recharts — CDN-friendly)
--------------------------------------------------------------------- */
function ChartCanvas({ type, data, options, height = 260 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current.getContext("2d"), { type, data, options });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [JSON.stringify(data), JSON.stringify(options), type]);

  return <div style={{ height }}><canvas ref={canvasRef}></canvas></div>;
}

/* ---------------------------------------------------------------------
   Ministry logo (embed your own base64 image here if desired)
--------------------------------------------------------------------- */
function MinistryLogo({ size = 40 }) {
  return (
    <div className="flex items-center justify-center shrink-0" style={{ height: size, width: size * 1.43 }}>
      <img src="logo.jpg" alt="לוגו משרד התיירות" style={{ width: "100%", height: "100%", objectFit: "contain" }}
           onError={(e) => { e.target.style.display = "none"; }} />
    </div>
  );
}

/* ---------------------------------------------------------------------
   Login screen
--------------------------------------------------------------------- */
function LoginScreen({ onLogin, currentPassword }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden" dir="rtl">
      <GlobalStyles />
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #0284c7 0, transparent 40%), radial-gradient(circle at 80% 70%, #4338ca 0, transparent 40%)" }} />
      <div className={`relative z-10 w-full max-w-md mx-4 ${shake ? "animate-[shake_0.4s]" : ""}`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 bg-white/90 rounded-xl p-3 shadow-lg">
            <MinistryLogo size={56} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">🧳 מערכת ניתוח שיווק תיירות</h1>
          <p className="text-slate-400 text-sm mt-1">✈️ לוח בקרה אנליטי — גישה מוגבלת 🔒</p>
        </div>
        <form onSubmit={submit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <label className="block text-sm text-slate-300 mb-2 font-medium">🔑 סיסמת גישה</label>
          <input
            type="password" value={pw}
            onChange={(e) => { setPw(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") submit(e); }}
            placeholder="הזינו סיסמה" autoFocus
            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <button type="button" onClick={submit} className="w-full mt-6 bg-gradient-to-l from-sky-500 to-blue-700 hover:from-sky-400 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition shadow-lg cursor-pointer">
            🚪 כניסה למערכת
          </button>
        </form>
        <p className="text-center text-slate-500 text-xs mt-6">© 2026 משרד התיירות · מחלקת שיווק</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Country picker (autocomplete)
--------------------------------------------------------------------- */
function CountryPicker({ label, value, onChange, countries, exclude = [] }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const options = countries.filter((c) => !exclude.includes(c.name_he));
  const filtered = options.filter((c) => c.name_he.includes(query.trim()));

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-secondary mb-1.5">{label}</label>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => { if (e.key === "Enter" && query.trim()) { onChange(query.trim()); setOpen(false); } }}
        placeholder="🔎 הקלידו שם מדינה..."
        className="input-field w-full border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full card border rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filtered.length > 0 ? filtered.map((c) => (
            <button key={c.id} onMouseDown={() => { onChange(c.name_he); setQuery(c.name_he); setOpen(false); }}
              className="w-full text-right px-4 py-2 hoverable text-sm text-primary flex items-center gap-2">
              <span>{c.flag}</span> {c.name_he} {c.has_office && <span title="לשכה פעילה">⭐</span>}
            </button>
          )) : query.trim() ? (
            <button onMouseDown={() => { onChange(query.trim()); setOpen(false); }}
              className="w-full text-right px-4 py-3 hoverable text-sm flex items-center gap-2 text-blue-500 font-medium">
              ✨ "{query.trim()}" לא נמצאה — הפעל הערכת AI
            </button>
          ) : <div className="px-4 py-3 text-sm text-muted">התחילו להקליד לחיפוש</div>}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   KPI card / AI badge / loading state
--------------------------------------------------------------------- */
function KpiCard({ emoji, label, value, sub, accentSolid, tip }) {
  return (
    <div className="card rounded-2xl p-4 border shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-secondary flex items-center gap-1">{emoji} {label} {tip && <InfoTip text={tip} />}</span>
      </div>
      <div className="text-2xl font-bold text-primary">{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}
function AiEstimateBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "linear-gradient(to left,#f0abfc22,#818cf822)", color: "#818cf8", border: "1px solid #818cf855" }}>
      ✨🤖 נתונים הוערכו על ידי AI (Gemini)
    </div>
  );
}
function AiLoadingState({ name }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="text-4xl animate-spin">🔄</div>
      <div className="text-center">
        <p className="font-semibold text-primary">🔍 "{name}" לא נמצאה במאגר הנתונים</p>
        <p className="text-sm text-secondary mt-1">🤖 שולח בקשה ל-Gemini להשלמת נתונים משוערים...</p>
      </div>
    </div>
  );
}

/* Resolve a country's metrics for a given year range — from DB or via real AI edge function */
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

    // Not found — call the AI edge function
    setState({ loading: true, metrics: null, estimated: false, country: null });
    DataAPI.estimateViaAI(nameHe, nameHe, years)
      .then((result) => {
        const rows = result.rows.map((r) => ({ ...r }));
        setState({
          loading: false,
          metrics: deriveMetrics(rows, years),
          estimated: true,
          country: { id: result.country_id, name_he: nameHe, flag: "🌐", region: "🌐 מוערך על ידי AI", has_office: false },
        });
      })
      .catch((err) => {
        console.error(err);
        setState({ loading: false, metrics: null, estimated: false, country: null, error: String(err) });
      });
  }, [nameHe, countries, allMetrics, years]);

  return state;
}

/* ---------------------------------------------------------------------
   Single country deep dive
--------------------------------------------------------------------- */
function SingleCountryDive({ years, theme, countries, allMetrics }) {
  const [countryName, setCountryName] = useState(countries[0]?.name_he || "");
  useEffect(() => { if (!countryName && countries[0]) setCountryName(countries[0].name_he); }, [countries]);
  const { loading, metrics, estimated, country } = useResolvedCountry(countryName, countries, allMetrics, years);

  const lineData = useMemo(() => {
    if (!metrics) return null;
    return {
      labels: years,
      datasets: [{
        label: "🛂 מבקרים", data: years.map((y) => Math.round(metrics.visitorsByYear[y] || 0)),
        borderColor: theme.solid, backgroundColor: hexA(theme.solid, 0.2), fill: true, tension: 0.3,
      }],
    };
  }, [metrics, years, theme]);

  const barData = useMemo(() => {
    if (!metrics) return null;
    return {
      labels: ["❤️ אהדה", "🕎 זיקה דתית", "💹 רווחיות", "📈 צמיחה", "🏆 ציון כולל"],
      datasets: [{
        label: country?.name_he || "",
        data: [metrics.sentiment, metrics.religiousAffinity, Math.round(metrics.roiScore), metrics.growthTrend, metrics.totalScore],
        backgroundColor: theme.solid, borderRadius: 6,
      }],
    };
  }, [metrics, theme, country]);

  return (
    <div className="space-y-5">
      <div className="max-w-md">
        <CountryPicker label="🌍 בחר מדינה לניתוח מעמיק" value={countryName} onChange={setCountryName} countries={countries} />
      </div>

      {loading && <AiLoadingState name={countryName} />}

      {!loading && metrics && country && (
        <div className="space-y-5" style={{ animation: "fadeIn 0.3s ease-in" }}>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="text-2xl">{country.flag || "🌐"}</span> {country.name_he}
              {country.has_office && <span title="לשכה פעילה" className="text-lg">⭐</span>}
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: hexA(theme.solid, 0.12), color: theme.solid }}>
              {country.region}
            </span>
            {estimated && <AiEstimateBadge />}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard emoji="🛂" label="סה״כ נכנסים לישראל" value={fmtCompact(metrics.sumVisitors)} accentSolid={theme.solid} />
            <KpiCard emoji="✈️" label="נפח תיירות יוצאת מצטבר" value={`${fmtNum(metrics.sumOutbound)}M`} accentSolid={theme.solid} />
            <KpiCard emoji="❤️" label="אהדה פרו-ישראלית" value={`${metrics.sentiment}/100`} tip="מחושב מ-60% מדד חיפוש מקוון + 40% מצב אזהרת מסע, ממוצע על פני טווח השנים." accentSolid={theme.solid} />
            <KpiCard emoji="💹" label="רווחיות (יעילות המרה)" value={`${metrics.roi}%`} tip="אחוז מסך התיירות היוצאת של המדינה שהומר לכניסות בפועל לישראל." accentSolid={theme.solid} />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="card rounded-2xl p-4 border shadow-sm">
              <h4 className="font-semibold text-primary mb-3 text-sm">📈 מגמת כניסות לישראל</h4>
              {lineData && <ChartCanvas type="line" data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
            </div>
            <div className="card rounded-2xl p-4 border shadow-sm">
              <h4 className="font-semibold text-primary mb-3 text-sm">📊 פרופיל מדדים</h4>
              {barData && <ChartCanvas type="bar" data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { max: 100 } } }} />}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard emoji="🕎" label="זיקה דתית" value={`${metrics.religiousAffinity}/100`} sub={`אוכ' יהודית: ${fmtCompact(metrics.avgJewishPop)}`} tip="מנורמל על סולם לוגריתמי מול כל המדינות במאגר." accentSolid={theme.solid} />
            <KpiCard emoji="📊" label="מדד HDI ממוצע" value={metrics.avgHdi.toFixed(3)} accentSolid={theme.solid} />
            <KpiCard emoji="🛫" label="איכות תעופה (TTDI)" value={metrics.avgAirQuality.toFixed(1)} sub={metrics.hasDirectFlights ? "✅ טיסות ישירות" : "❌ אין טיסות ישירות"} accentSolid={theme.solid} />
            <KpiCard emoji="🏆" label="ציון כולל" value={`${metrics.totalScore}/100`} sub={metrics.advisoryYears > 0 ? `⚠️ ${metrics.advisoryYears} שנות אזהרה` : "✅ ללא אזהרות"} tip="ממוצע משוקלל: 35% אהדה, 25% זיקה דתית, 25% רווחיות, 15% מגמת צמיחה." accentSolid={theme.solid} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Comparative analysis
--------------------------------------------------------------------- */
function ComparativeAnalysis({ years, theme, countries, allMetrics }) {
  const [c1, setC1] = useState(countries[0]?.name_he || "");
  const [c2, setC2] = useState(countries[1]?.name_he || "");
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
        { label: c2, data: years.map((y) => Math.round(r2.metrics.visitorsByYear[y] || 0)), borderColor: "#94a3b8", backgroundColor: "#94a3b822", tension: 0.3 },
      ],
    };
  }, [r1.metrics, r2.metrics, years, c1, c2, theme]);

  const barData = useMemo(() => {
    if (!r1.metrics || !r2.metrics) return null;
    return {
      labels: ["❤️ אהדה", "🕎 זיקה דתית", "💹 רווחיות %", "📈 צמיחה", "🏆 ציון כולל"],
      datasets: [
        { label: c1, data: [r1.metrics.sentiment, r1.metrics.religiousAffinity, r1.metrics.roi, r1.metrics.growthTrend, r1.metrics.totalScore], backgroundColor: theme.solid },
        { label: c2, data: [r2.metrics.sentiment, r2.metrics.religiousAffinity, r2.metrics.roi, r2.metrics.growthTrend, r2.metrics.totalScore], backgroundColor: "#94a3b8" },
      ],
    };
  }, [r1.metrics, r2.metrics, c1, c2, theme]);

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
        <CountryPicker label="🇦 מדינה א'" value={c1} onChange={setC1} countries={countries} exclude={[c2]} />
        <CountryPicker label="🇧 מדינה ב'" value={c2} onChange={setC2} countries={countries} exclude={[c1]} />
      </div>

      {(r1.loading || r2.loading) && <AiLoadingState name={r1.loading ? c1 : c2} />}

      {!r1.loading && !r2.loading && r1.metrics && r2.metrics && (
        <div className="space-y-5" style={{ animation: "fadeIn 0.3s ease-in" }}>
          <div className="flex gap-6 flex-wrap">
            <div className="flex items-center gap-2"><span className="text-xl">{r1.country?.flag}</span><span className="font-semibold text-primary">{c1}</span>{r1.estimated && <AiEstimateBadge />}</div>
            <div className="flex items-center gap-2"><span className="text-xl">{r2.country?.flag}</span><span className="font-semibold text-primary">{c2}</span>{r2.estimated && <AiEstimateBadge />}</div>
          </div>

          <div className="card rounded-2xl p-4 border shadow-sm">
            <h4 className="font-semibold text-primary mb-3 text-sm">📈 השוואת מגמת מבקרים</h4>
            {lineData && <ChartCanvas type="line" data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />}
          </div>
          <div className="card rounded-2xl p-4 border shadow-sm">
            <h4 className="font-semibold text-primary mb-3 text-sm">⚖️ השוואת מדדים מרכזיים</h4>
            {barData && <ChartCanvas type="bar" data={barData} options={{ responsive: true, maintainAspectRatio: false }} />}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Ranking analysis
--------------------------------------------------------------------- */
function RankingAnalysis({ years, theme, countries, allMetrics }) {
  const [selected, setSelected] = useState(countries.slice(0, 5).map((c) => c.name_he));
  const [param, setParam] = useState("totalScore");
  const [pending, setPending] = useState("");
  const [resultsMap, setResultsMap] = useState({});

  useEffect(() => { if (selected.length === 0 && countries.length) setSelected(countries.slice(0, 5).map((c) => c.name_he)); }, [countries]);

  useEffect(() => {
    selected.forEach((name) => {
      if (resultsMap[name]) return;
      const country = countries.find((c) => c.name_he === name);
      if (country) {
        const rows = allMetrics.filter((m) => m.country_id === country.id);
        setResultsMap((prev) => ({ ...prev, [name]: { metrics: deriveMetrics(rows, years), estimated: false, country } }));
      } else {
        setResultsMap((prev) => ({ ...prev, [name]: { loading: true } }));
        DataAPI.estimateViaAI(name, name, years).then((result) => {
          setResultsMap((prev) => ({
            ...prev,
            [name]: { metrics: deriveMetrics(result.rows, years), estimated: true, country: { flag: "🌐", name_he: name } },
          }));
        });
      }
    });
  }, [selected, countries, allMetrics, years]);

  const addCountry = (name) => {
    if (!name || selected.includes(name) || selected.length >= 10) return;
    setSelected((s) => [...s, name]);
    setPending("");
  };
  const removeCountry = (name) => setSelected((s) => s.filter((n) => n !== name));

  const ranked = selected
    .map((name) => resultsMap[name] ? { name, ...resultsMap[name] } : null)
    .filter((r) => r && r.metrics)
    .sort((a, b) => b.metrics[param] - a.metrics[param]);

  const maxVal = Math.max(...ranked.map((r) => r.metrics[param]), 1);
  const paramMeta = RANK_PARAMS.find((p) => p.key === param);
  const medals = ["🥇", "🥈", "🥉"];
  const allLoaded = selected.length >= 3 && ranked.length === selected.length;

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-secondary mb-1.5">🌍 בחר מדינות לדירוג (3-10)</label>
          <div className="flex gap-2 mb-2">
            <input value={pending} onChange={(e) => setPending(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCountry(pending.trim())}
              placeholder="הקלד שם מדינה והוסף..." className="input-field flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button onClick={() => addCountry(pending.trim())} disabled={selected.length >= 10} className="px-3 py-2 rounded-xl bg-blue-700 text-white disabled:opacity-40">➕</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map((n) => (
              <span key={n} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium" style={{ background: hexA(theme.solid, 0.12), color: theme.solid }}>
                {n} <button onClick={() => removeCountry(n)} className="hover:opacity-60">✕</button>
              </span>
            ))}
          </div>
          {selected.length < 3 && <p className="text-xs text-amber-500 mt-2">⚠️ יש לבחור לפחות 3 מדינות</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-secondary mb-1.5">🎯 פרמטר לדירוג</label>
          <div className="grid grid-cols-2 gap-2">
            {RANK_PARAMS.map((p) => (
              <button key={p.key} onClick={() => setParam(p.key)}
                className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition ${param === p.key ? `border-transparent bg-gradient-to-l ${theme.grad} text-white shadow-md` : "text-secondary"}`}
                style={param !== p.key ? { borderColor: "var(--card-border)" } : {}}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {allLoaded && (
        <div className="space-y-5" style={{ animation: "fadeIn 0.3s ease-in" }}>
          <div className="card rounded-2xl p-5 border shadow-sm">
            <h4 className="font-semibold text-primary mb-4 text-sm">🏆 דירוג לפי {paramMeta?.label}</h4>
            <div className="space-y-3">
              {ranked.map((r, i) => (
                <div key={r.name} className="flex items-center gap-3">
                  <div className="w-7 text-center">{i < 3 ? medals[i] : <span className="text-xs text-secondary">{i + 1}</span>}</div>
                  <div className="w-32 shrink-0 text-sm font-medium text-primary truncate">{r.name} {r.estimated && "✨"}</div>
                  <div className="flex-1 rounded-full h-6 relative overflow-hidden" style={{ background: "var(--hover-bg)" }}>
                    <div className="h-full rounded-full flex items-center justify-end px-2" style={{ width: `${Math.max(4, (r.metrics[param] / maxVal) * 100)}%`, background: theme.solid }}>
                      <span className="text-xs font-bold text-white">{r.metrics[param].toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   3-step CRUD modal — add/edit country + yearly metrics
--------------------------------------------------------------------- */
function CrudModal({ onClose, countries, onSaved }) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("new"); // "new" | "existing"
  const [country, setCountry] = useState({ name_en: "", name_he: "", flag: "", region: "", has_office: false });
  const [existingId, setExistingId] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [metric, setMetric] = useState({
    hdi: "", outbound_tourism_millions: "", air_transport_quality: "", has_direct_flights: false,
    jewish_population: "", online_search_index: "", travel_advisory: 1, entries_to_israel_thousands: "",
  });
  const [missingWarning, setMissingWarning] = useState([]);
  const [saving, setSaving] = useState(false);
  const [aiFilling, setAiFilling] = useState(false);

  const selectExisting = (id) => {
    const c = countries.find((x) => x.id === Number(id));
    if (c) { setExistingId(c.id); setCountry(c); }
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
      setMetric((m) => ({
        hdi: m.hdi !== "" ? m.hdi : row.hdi,
        outbound_tourism_millions: m.outbound_tourism_millions !== "" ? m.outbound_tourism_millions : row.outbound_tourism_millions,
        air_transport_quality: m.air_transport_quality !== "" ? m.air_transport_quality : row.air_transport_quality,
        has_direct_flights: m.has_direct_flights || row.has_direct_flights,
        jewish_population: m.jewish_population !== "" ? m.jewish_population : row.jewish_population,
        online_search_index: m.online_search_index !== "" ? m.online_search_index : row.online_search_index,
        travel_advisory: m.travel_advisory || row.travel_advisory,
        entries_to_israel_thousands: m.entries_to_israel_thousands !== "" ? m.entries_to_israel_thousands : row.entries_to_israel_thousands,
        _aiFilled: true,
      }));
      setMissingWarning([]);
    } catch (err) {
      alert("שגיאה בהשלמת AI: " + err.message);
    }
    setAiFilling(false);
  };

  const doSave = async (finalMetric, forceEmpty) => {
    setSaving(true);
    try {
      let countryId = existingId;
      if (mode === "new") {
        const saved = await DataAPI.upsertCountry(country);
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
        is_ai_estimated: !!finalMetric._aiFilled,
        source: finalMetric._aiFilled ? "gemini_ai_estimate" : "manual_edit",
      });
      onSaved();
      onClose();
    } catch (err) {
      alert("שגיאה בשמירה: " + err.message);
    }
    setSaving(false);
  };

  const field = (key, label, type = "number") => (
    <div>
      <label className="block text-xs font-semibold text-secondary mb-1">{label}</label>
      <input type={type} value={metric[key]} onChange={(e) => setMetric((m) => ({ ...m, [key]: e.target.value, _aiFilled: false }))}
        className={`input-field w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${missingWarning.includes(key) ? "ring-2 ring-amber-400" : ""}`} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "var(--overlay-bg)" }} dir="rtl">
      <div className="card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border">
        <div className="p-5 border-b divider flex items-center justify-between">
          <h3 className="font-bold text-lg text-primary">📥 ניהול דאטה-בייס — שלב {step} מתוך 3</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hoverable text-secondary">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button onClick={() => setMode("new")} className={`px-4 py-2 rounded-xl text-sm font-medium ${mode === "new" ? "bg-blue-600 text-white" : "text-secondary border"}`}>➕ מדינה חדשה</button>
                <button onClick={() => setMode("existing")} className={`px-4 py-2 rounded-xl text-sm font-medium ${mode === "existing" ? "bg-blue-600 text-white" : "text-secondary border"}`}>✏️ מדינה קיימת</button>
              </div>

              {mode === "existing" ? (
                <select onChange={(e) => selectExisting(e.target.value)} className="input-field w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">בחר מדינה...</option>
                  {countries.map((c) => <option key={c.id} value={c.id}>{c.flag} {c.name_he}</option>)}
                </select>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="שם באנגלית (name_en)" value={country.name_en} onChange={(e) => setCountry((c) => ({ ...c, name_en: e.target.value }))} className="input-field border rounded-lg px-3 py-2 text-sm" />
                  <input placeholder="שם בעברית (name_he)" value={country.name_he} onChange={(e) => setCountry((c) => ({ ...c, name_he: e.target.value }))} className="input-field border rounded-lg px-3 py-2 text-sm" />
                  <input placeholder="דגל (אימוג'י)" value={country.flag} onChange={(e) => setCountry((c) => ({ ...c, flag: e.target.value }))} className="input-field border rounded-lg px-3 py-2 text-sm" />
                  <input placeholder="אזור/יבשת" value={country.region} onChange={(e) => setCountry((c) => ({ ...c, region: e.target.value }))} className="input-field border rounded-lg px-3 py-2 text-sm" />
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-secondary">
                <input type="checkbox" checked={!!country.has_office} onChange={(e) => setCountry((c) => ({ ...c, has_office: e.target.checked }))} />
                ⭐ יש למשרד התיירות לשכה פעילה במדינה זו
              </label>

              <div className="flex justify-end">
                <button onClick={goStep2} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium">המשך לשלב 2 ←</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-secondary">שלב זה מיועד לנתונים הקבועים של המדינה (כבר הוזנו בשלב 1). לחצו המשך כדי לעבור להזנת הנתונים השנתיים.</p>
              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="text-secondary text-sm">→ חזרה</button>
                <button onClick={goStep3} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium">המשך לשלב 3 ←</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">שנה</label>
                <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-field border rounded-lg px-3 py-2 text-sm w-32" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {field("hdi", "HDI (0-1)")}
                {field("outbound_tourism_millions", "נפח תיירות יוצאת (מיליון)")}
                {field("air_transport_quality", "איכות תעופה (0-10)")}
                {field("jewish_population", "אוכלוסייה יהודית")}
                {field("online_search_index", "מדד חיפוש מקוון (0-100)")}
                {field("entries_to_israel_thousands", "כניסות לישראל (אלפים)")}
              </div>
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 text-sm text-secondary">
                  <input type="checkbox" checked={!!metric.has_direct_flights} onChange={(e) => setMetric((m) => ({ ...m, has_direct_flights: e.target.checked }))} /> ✈️ טיסות ישירות
                </label>
                <label className="text-sm text-secondary flex items-center gap-2">
                  אזהרת מסע:
                  <select value={metric.travel_advisory} onChange={(e) => setMetric((m) => ({ ...m, travel_advisory: e.target.value }))} className="input-field border rounded px-2 py-1 text-sm">
                    <option value={1}>1 · תקין</option>
                    <option value={2}>2 · אזהרה</option>
                  </select>
                </label>
              </div>

              {missingWarning.length > 0 && (
                <div className="rounded-lg px-3 py-2 text-sm border" style={{ background: hexA("#f59e0b", 0.1), borderColor: hexA("#f59e0b", 0.3), color: "#b45309" }}>
                  ⚠️ יש {missingWarning.length} שדות ריקים. אפשר למלא ידנית, להשלים אוטומטית עם AI, או להשאיר ריק ולהמשיך.
                  <div className="mt-2 flex gap-2">
                    <button onClick={fillFromAI} disabled={aiFilling} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                      {aiFilling ? "🔄 משלים..." : "✨ השלם נתונים מהרשת (AI)"}
                    </button>
                    <button onClick={() => doSave(metric)} className="border border-amber-400 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium">השאר ריק והמשך</button>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="text-secondary text-sm">→ חזרה</button>
                <button onClick={tryFinish} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
                  {saving ? "שומר..." : "✅ שמור למאגר"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Data management table (view / edit / delete existing rows)
--------------------------------------------------------------------- */
function DataManagementPanel({ countries, allMetrics, onRefresh, onAddNew }) {
  const [filter, setFilter] = useState("");
  const rows = allMetrics
    .map((m) => ({ ...m, country: countries.find((c) => c.id === m.country_id) }))
    .filter((r) => r.country)
    .filter((r) => !filter || r.country.name_he.includes(filter))
    .sort((a, b) => a.country.name_he.localeCompare(b.country.name_he) || a.year - b.year);

  const deleteRow = async (row) => {
    if (!confirm(`למחוק את הנתונים של ${row.country.name_he} לשנת ${row.year}?`)) return;
    await DataAPI.deleteMetric(row.country_id, row.year);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="🔎 סינון לפי מדינה..." className="input-field border rounded-lg px-3 py-2 text-sm w-64" />
        <button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">➕ הוספת מדינה/שנה</button>
      </div>
      <div className="overflow-x-auto rounded-lg border divider max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="text-secondary sticky top-0" style={{ background: "var(--hover-bg)" }}>
            <tr>
              <th className="text-right px-3 py-2">מדינה</th><th className="text-right px-3 py-2">שנה</th>
              <th className="text-right px-3 py-2">כניסות (אלפים)</th><th className="text-right px-3 py-2">מקור</th>
              <th className="text-right px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.country_id}-${r.year}`} className="border-t divider">
                <td className="px-3 py-1.5 text-primary">{r.country.flag} {r.country.name_he} {r.country.has_office && "⭐"}</td>
                <td className="px-3 py-1.5 text-secondary">{r.year}</td>
                <td className="px-3 py-1.5 text-secondary">{r.entries_to_israel_thousands}</td>
                <td className="px-3 py-1.5 text-xs">{r.is_ai_estimated ? "✨ AI" : r.source}</td>
                <td className="px-3 py-1.5"><button onClick={() => deleteRow(r)} className="text-red-500 hover:text-red-700 text-xs">🗑️ מחק</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Settings sidebar
--------------------------------------------------------------------- */
function SettingsSidebar({ open, onClose, mode, setMode, currentPassword, onChangePassword }) {
  const [newPw, setNewPw] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  const savePw = async () => {
    if (newPw.trim().length < 3) return;
    await DataAPI.setSetting("site_password", newPw.trim());
    onChangePassword(newPw.trim());
    setPwSaved(true);
    setNewPw("");
    setTimeout(() => setPwSaved(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 transition-opacity" style={{ background: "var(--overlay-bg)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }} onClick={onClose} />
      <div className="fixed top-0 left-0 h-full w-full max-w-sm z-50 shadow-2xl transition-transform duration-300 overflow-y-auto card" style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }} dir="rtl">
        <div className="p-5 border-b divider flex items-center justify-between sticky top-0 card z-10">
          <h2 className="font-bold text-lg text-primary">⚙️ הגדרות</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hoverable text-secondary">✕</button>
        </div>
        <div className="p-5 space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-secondary mb-3">🌓 מצב תצוגה</h3>
            <div className="grid grid-cols-3 gap-2">
              {[["light", "☀️ בהיר"], ["dark", "🌙 כהה"], ["system", "🖥️ אוטומטי"]].map(([key, label]) => (
                <button key={key} onClick={() => setMode(key)} className="flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition"
                  style={mode === key ? { borderColor: "#2563eb", background: hexA("#2563eb", 0.12), color: "#2563eb" } : { borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-secondary mb-3">🔑 שינוי סיסמה</h3>
            <div className="flex gap-2">
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="סיסמה חדשה" className="input-field flex-1 border rounded-lg px-3 py-2 text-sm" />
              <button onClick={savePw} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">עדכון</button>
            </div>
            {pwSaved && <p className="text-emerald-500 text-xs mt-2">✅ הסיסמה עודכנה בהצלחה</p>}
          </section>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------
   Tab content wrapper
--------------------------------------------------------------------- */
const SUB_MODULES = [
  { key: "single", label: "🔎 ניתוח מדינה בודדת" },
  { key: "compare", label: "⚖️ ניתוח השוואתי" },
  { key: "rank", label: "🏆 ניתוח דירוג" },
  { key: "manage", label: "📥 ניהול דאטה-בייס" },
];

function TabContent({ theme, years, countries, allMetrics, onRefresh, onAddNew }) {
  const [sub, setSub] = useState("single");
  return (
    <div>
      <div className="flex gap-1 p-1 rounded-2xl border w-fit mb-6 flex-wrap" style={{ background: hexA(theme.solid, 0.06), borderColor: hexA(theme.solid, 0.25) }}>
        {SUB_MODULES.map((m) => (
          <button key={m.key} onClick={() => setSub(m.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${sub === m.key ? `bg-gradient-to-l ${theme.grad} text-white shadow-md` : "hoverable"}`}
            style={sub !== m.key ? { color: theme.solid } : {}}>
            {m.label}
          </button>
        ))}
      </div>
      {sub === "single" && <SingleCountryDive years={years} theme={theme} countries={countries} allMetrics={allMetrics} />}
      {sub === "compare" && <ComparativeAnalysis years={years} theme={theme} countries={countries} allMetrics={allMetrics} />}
      {sub === "rank" && <RankingAnalysis years={years} theme={theme} countries={countries} allMetrics={allMetrics} />}
      {sub === "manage" && <DataManagementPanel countries={countries} allMetrics={allMetrics} onRefresh={onRefresh} onAddNew={onAddNew} />}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Main app
--------------------------------------------------------------------- */
function App() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("tourism.marketing");
  const [activeTab, setActiveTab] = useState("t1");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCrud, setShowCrud] = useState(false);
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
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const listener = (e) => setSystemDark(e.matches);
    mq.addEventListener?.("change", listener);
    return () => mq.removeEventListener?.("change", listener);
  }, []);

  const isDark = mode === "dark" || (mode === "system" && systemDark);
  const theme = TAB_THEMES[activeTab];

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} currentPassword={password} />;

  return (
    <div dir="rtl" data-mode={isDark ? "dark" : "light"} className="app-page min-h-screen transition-colors duration-300">
      <GlobalStyles />
      <header className="app-nav sticky top-0 z-30 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MinistryLogo size={36} />
            <span className="font-bold text-primary hidden sm:block">🧳 שיווק תיירות · BI</span>
          </div>
          <nav className="flex-1 flex justify-center">
            <div className="flex gap-1 p-1 rounded-2xl overflow-x-auto max-w-full" style={{ background: "var(--hover-bg)" }}>
              {Object.entries(TAB_THEMES).map(([key, t]) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${activeTab === key ? `bg-gradient-to-l ${t.grad} text-white shadow-md` : "text-secondary hoverable"}`}>
                  {t.name}
                </button>
              ))}
            </div>
          </nav>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hoverable transition shrink-0 text-secondary">⚙️</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="rounded-2xl border px-5 py-4 mb-6" style={{ background: hexA(theme.solid, 0.07), borderColor: hexA(theme.solid, 0.25) }}>
          <h1 className={`text-lg font-bold ${theme.text}`}>{theme.name}</h1>
          <p className="text-xs text-secondary mt-0.5">📅 {theme.years[0]}–{theme.years[theme.years.length - 1]} · 🌍 {countries.length} מדינות במאגר</p>
        </div>

        {dataLoading && <div className="text-center py-20 text-secondary">🔄 טוען נתונים מהמאגר...</div>}
        {dataError && <div className="text-center py-20 text-red-500">⚠️ שגיאה בטעינת נתונים: {dataError}<br /><span className="text-xs text-secondary">בדוק את config.js (SUPABASE_URL / ANON_KEY) ואת מדיניות ה-RLS.</span></div>}
        {!dataLoading && !dataError && (
          <TabContent theme={theme} years={theme.years} countries={countries} allMetrics={allMetrics} onRefresh={loadData} onAddNew={() => setShowCrud(true)} />
        )}
      </main>

      <footer className="text-center text-xs text-muted py-8">🧳 מערכת ניתוח שיווק תיירות · משרד התיירות</footer>

      <SettingsSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} mode={mode} setMode={setMode} currentPassword={password} onChangePassword={setPassword} />
      {showCrud && <CrudModal onClose={() => setShowCrud(false)} countries={countries} onSaved={loadData} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
