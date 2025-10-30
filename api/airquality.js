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

    const response = await fetch(apiUrl);

    // Return the raw response first (for debugging)
    const raw = await response.text();

    return new Response(
      JSON.stringify({
        debug: {
          status: response.status,
          statusText: response.statusText,
          body: raw.slice(0, 1000), // limit length
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Server Error",
        details: err.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
