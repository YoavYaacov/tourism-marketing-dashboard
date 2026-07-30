// =====================================================================
// Supabase Edge Function: estimate-country
// Deploy this via the Supabase Dashboard (Edge Functions → Create a
// new function → paste this code → Deploy). No CLI needed.
//
// What it does:
//   1. Receives a country name from the frontend (a country typed by
//      the user that isn't in our database yet).
//   2. Asks Gemini for a best-effort numeric estimate of every metric
//      field, for a given list of years.
//   3. Writes the result into `countries` / `country_metrics` with
//      is_ai_estimated = true, so the UI can show the "✨ AI estimate"
//      badge.
//
// Required secrets (set in Supabase Dashboard → Edge Functions →
// estimate-country → Secrets):
//   GEMINI_API_KEY  — from aistudio.google.com (free tier)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically
// by Supabase to every Edge Function — you do not need to set them.
// =====================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { name_en, name_he, years } = await req.json();

    if (!name_en || !Array.isArray(years) || years.length === 0) {
      return new Response(JSON.stringify({ error: "missing name_en or years[]" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const prompt = `אתה מומחה נתוני תיירות בינלאומיים. עבור המדינה "${name_en}"${name_he ? ` (${name_he})` : ""}, הערך את הערכים הבאים עבור כל אחת מהשנים: ${years.join(", ")}.
זו הערכה סבירה על בסיס ידע כללי על המדינה, לא נתון מדויק שצריך לאמת.

השדות הנדרשים לכל שנה:
- hdi: מדד הפיתוח האנושי של המדינה (מספר בין 0 ל-1)
- outbound_tourism_millions: נפח תיירות יוצאת שנתי במיליוני אנשים
- air_transport_quality: איכות תשתיות תעופה, ציון בין 0 ל-10
- has_direct_flights: true/false — האם סביר שקיימות טיסות ישירות לישראל
- jewish_population: גודל אוכלוסייה יהודית משוער במדינה (מספר שלם)
- online_search_index: מדד עניין בחיפוש מקוון בנושא ישראל, בין 0 ל-100
- travel_advisory: 1 אם המצב הביטחוני/מדיני תקין, 2 אם קיימת אזהרת מסע
- entries_to_israel_thousands: הערכת מספר כניסות תיירים לישראל באלפים, לשנה זו

החזר אך ורק אובייקט JSON תקני בפורמט הבא, בלי שום טקסט נוסף לפני או אחרי:
{"years": {"2024": {"hdi":0.9,"outbound_tourism_millions":10.5,"air_transport_quality":6.0,"has_direct_flights":true,"jewish_population":5000,"online_search_index":40,"travel_advisory":1,"entries_to_israel_thousands":25.3}}}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API error (${geminiRes.status}): ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned no usable content");

    const parsed = JSON.parse(text);
    if (!parsed.years) throw new Error("Gemini response missing 'years' object");

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Ensure the country row exists (create it if this is a brand new country)
    let countryId;
    const { data: existing } = await supabase
      .from("countries")
      .select("id")
      .eq("name_en", name_en)
      .maybeSingle();

    if (existing) {
      countryId = existing.id;
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("countries")
        .insert({
          name_en,
          name_he: name_he || name_en,
          region: "🌐 מוערך על ידי AI",
          is_seeded: false,
        })
        .select("id")
        .single();
      if (insertErr) throw insertErr;
      countryId = inserted.id;
    }

    const rows = Object.entries(parsed.years).map(([year, v]) => ({
      country_id: countryId,
      year: Number(year),
      hdi: v.hdi ?? null,
      outbound_tourism_millions: v.outbound_tourism_millions ?? null,
      air_transport_quality: v.air_transport_quality ?? null,
      has_direct_flights: !!v.has_direct_flights,
      jewish_population: v.jewish_population != null ? Math.round(v.jewish_population) : null,
      online_search_index: v.online_search_index != null ? Math.round(v.online_search_index) : null,
      travel_advisory: v.travel_advisory ?? 1,
      entries_to_israel_thousands: v.entries_to_israel_thousands ?? null,
      is_ai_estimated: true,
      source: "gemini_ai_estimate",
    }));

    const { error: upsertErr } = await supabase
      .from("country_metrics")
      .upsert(rows, { onConflict: "country_id,year" });
    if (upsertErr) throw upsertErr;

    return new Response(JSON.stringify({ success: true, country_id: countryId, rows }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
