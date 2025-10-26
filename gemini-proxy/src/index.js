export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = env.GEMINI_API_KEY;
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const body = await request.text();

      const geminiResponse = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const resultText = await geminiResponse.text();

      return new Response(resultText, {
        status: geminiResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
