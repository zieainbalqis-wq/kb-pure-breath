export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const API_KEY = "a752207ef27e1883a1f2b2d1a6cc08ea6693c2210e359fce94afdea07ab0125a";
  const CITY = "Kuala Lumpur";

  try {
    const apiUrl = `https://api.openaq.org/v2/latest?city=${encodeURIComponent(
      CITY
    )}&parameter[]=pm25&parameter[]=pm10&limit=100&api_key=${API_KEY}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `OpenAQ API Error ${response.status}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      return new Response(JSON.stringify({ error: "No data found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const measurements = data.results[0].measurements || [];
    const pm25 = measurements.find((m) => m.parameter === "pm25")?.value || 0;
    const pm10 = measurements.find((m) => m.parameter === "pm10")?.value || 0;

    // Simulate trend (10 hours)
    const now = new Date();
    const trend = Array.from({ length: 10 }).map((_, i) => ({
      time: new Date(now - i * 3600000).toLocaleTimeString("en-MY", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      pm25: pm25 + (Math.random() * 3 - 1.5),
      pm10: pm10 + (Math.random() * 3 - 1.5),
    })).reverse();

    return new Response(
      JSON.stringify({
        city: CITY,
        pm25,
        pm10,
        trend,
        updatedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server Error", details: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
