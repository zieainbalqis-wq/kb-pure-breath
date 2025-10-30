export const config = {
  runtime: "nodejs20.x",
};

export default async function handler(req, res) {
  const API_KEY = "a752207ef27e1883a1f2b2d1a6cc08ea6693c2210e359fce94afdea07ab0125a";
  const CITY = "Kuala Lumpur";

  try {
    const apiUrl = `https://api.openaq.org/v2/latest?city=${encodeURIComponent(
      CITY
    )}&parameter[]=pm25&parameter[]=pm10&limit=100&api_key=${API_KEY}`;

    const fetch = (await import("node-fetch")).default;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(response.status).json({ error: `OpenAQ API error ${response.status}` });
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: "No data found for Kuala Lumpur" });
    }

    const measurements = data.results[0].measurements || [];
    const pm25 = measurements.find((m) => m.parameter === "pm25")?.value || 0;
    const pm10 = measurements.find((m) => m.parameter === "pm10")?.value || 0;

    // Generate trend mock data
    const now = new Date();
    const trend = Array.from({ length: 10 }).map((_, i) => ({
      time: new Date(now - i * 3600000).toLocaleTimeString("en-MY", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      pm25: pm25 + (Math.random() * 4 - 2),
      pm10: pm10 + (Math.random() * 4 - 2),
    })).reverse();

    return res.status(200).json({
      city: CITY,
      pm25,
      pm10,
      trend,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({
      error: "Server Error",
      details: err.message,
    });
  }
}
