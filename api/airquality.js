// /api/airquality.js
// Node serverless function for Vercel (Node 18+). Returns { city, pm25, pm10, trend, updatedAt }
// Uses OpenAQ v3: https://docs.openaq.org
export default async function handler(req, res) {
  const CITY = "Kuala Lumpur";
  const KEY = process.env.OPENAQ_KEY || ""; // set this in Vercel dashboard (Environment Variables)

  try {
    // Use OpenAQ v3 endpoint - we query measurements for the city, parameters pm25 and pm10
    const base = 'https://api.openaq.org/v3/latest';
    const url = `${base}?city=${encodeURIComponent(CITY)}&parameter=pm25,pm10&limit=10`;

    const opts = {};
    if (KEY) opts.headers = { 'X-API-Key': KEY };

    // Node 18+ environment (Vercel) supports global fetch
    const r = await fetch(url, opts);

    if (!r.ok) {
      const text = await r.text().catch(()=>null);
      return res.status(502).json({ error: `OpenAQ fetch failed ${r.status}`, details: text });
    }

    const data = await r.json();

    if (!data.results || data.results.length === 0) {
      // fallback: return nulls but 200 so frontend can show message
      return res.status(200).json({
        city: CITY,
        pm25: null,
        pm10: null,
        trend: [],
        updatedAt: new Date().toISOString()
      });
    }

    // Combine available measurements (take first station with pm readings)
    let pm25 = null, pm10 = null, updatedAt = null;
    // Prefer to find the latest station that has both or at least one
    for (const st of data.results) {
      if (Array.isArray(st.measurements)) {
        for (const m of st.measurements) {
          if (m.parameter === 'pm25' && pm25 === null) pm25 = m.value;
          if (m.parameter === 'pm10' && pm10 === null) pm10 = m.value;
          if (!updatedAt && m.lastUpdated) updatedAt = m.lastUpdated;
        }
        if (pm25 !== null || pm10 !== null) break;
      }
    }

    // If no updatedAt from measurements, use now
    if (!updatedAt) updatedAt = new Date().toISOString();

    // For trend: simple approach — use the 'measurements' lists of all results to create a small trend
    // (OpenAQ latest endpoint doesn't provide historical series; for real historical you should call /measurements with date_from/date_to)
    const trend = [];
    // Build trend by sampling different returned stations (best-effort)
    for (let i = 0; i < data.results.length && trend.length < 10; i++) {
      const st = data.results[i];
      const t = { time: st.location || `pt${i}`, pm25: null, pm10: null };
      for (const m of st.measurements) {
        if (m.parameter === 'pm25') t.pm25 = m.value;
        if (m.parameter === 'pm10') t.pm10 = m.value;
      }
      trend.push(t);
    }

    return res.status(200).json({
      city: CITY,
      pm25: pm25 === null ? null : Number(pm25),
      pm10: pm10 === null ? null : Number(pm10),
      trend,
      updatedAt
    });

  } catch (err) {
    console.error('airquality error', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
