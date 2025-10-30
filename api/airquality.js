export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.openaq.org/v3/latest?location=Kuala%20Lumpur&parameter=pm25,pm10&limit=2",
      {
        headers: {
          "X-API-Key": "a752207ef27e1883a1f2b2d1a6cc08ea6693c2210e359fce94afdea07ab0125a",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`OpenAQ API returned ${response.status}`);
    }

    const data = await response.json();

    // Extract PM2.5 & PM10 values
    const measurements = data.results[0]?.measurements || [];
    const pm25 = measurements.find(m => m.parameter === "pm25")?.value || null;
    const pm10 = measurements.find(m => m.parameter === "pm10")?.value || null;

    res.status(200).json({
      location: "Kuala Lumpur",
      pm25,
      pm10,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching from OpenAQ:", error);
    res.status(500).json({ error: "Failed to fetch air quality data" });
  }
}
