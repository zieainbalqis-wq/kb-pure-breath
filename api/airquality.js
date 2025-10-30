export default async function handler(req, res) {
  const API_KEY = "a752207ef27e1883a1f2b2d1a6cc08ea6693c2210e359fce94afdea07ab0125a";
  const CITY = "Kuala Lumpur";

  try {
    const response = await fetch(
      `https://api.openaq.org/v2/latest?city=${encodeURIComponent(CITY)}&limit=100&parameter[]=pm25&parameter[]=pm10&api_key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`OpenAQ API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("No data found for Kuala Lumpur");
    }

    const measurements = data.results[0].measurements;
    const pm25 = measurements.find(m => m.parameter === "pm25")?.value || 0;
    const pm10 = measurements.find(m => m.parameter === "pm10")?.value || 0;

    // Simulate trend data for chart (use historical endpoint if needed)
    const now = new Date();
    const trend = Array.from({ length: 10 }).map((_, i) => ({
      time: new Date(now - i * 3600000).toLocaleTimeString(),
      pm25: pm25 + (Math.random() * 5 - 2.5),
      pm10: pm10 + (Math.random() * 5 - 2.5),
    })).reverse();

    res.status(200).json({
      city: CITY,
      pm25,
      pm10,
      trend,
      updatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error: "Failed to fetch air quality data",
      details: error.message,
    });
  }
}
