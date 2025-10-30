export default async function handler(req, res) {
  try {
    const data = {
      location: "Kuala Lumpur",
      timestamp: new Date().toISOString(),
      pm25: (Math.random() * (60 - 10) + 10).toFixed(1),
      pm10: (Math.random() * (80 - 20) + 20).toFixed(1),
      temperature: (Math.random() * (34 - 27) + 27).toFixed(1),
      humidity: (Math.random() * (90 - 60) + 60).toFixed(0)
    };
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

