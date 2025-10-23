// api/generate.js (Pro Version)
export const config = { runtime: "edge" };

/**
 * Vercel Edge function
 * Env required: OPENAI_API_KEY
 */
export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Allow": "POST", "Content-Type": "application/json" } }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response(
        JSON.stringify({ error: "Content-Type must be application/json" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { prompt, tone = "inspirational", length = "pro" } = body;

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build messages for Pro output
    const systemMsg = {
      role: "system",
      content: "You are Zenith-AI Pro, a highly helpful and detailed Indonesian motivation coach. Provide inspiring and actionable advice."
    };

    const userMsg = {
      role: "user",
      content: `Buatkan teks motivasi versi PRO dengan tone ${tone}. Panjang lebih mendalam dan detail (2-5 paragraf jika perlu). Prompt: ${prompt}.`
    };

    const maxTokens = length === "pro" ? 400 : 200; // versi Pro lebih panjang

    // Call OpenAI API
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        ...(process.env.OPENAI_PROJECT_ID ? { "OpenAI-Project": process.env.OPENAI_PROJECT_ID } : {})
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [systemMsg, userMsg],
        max_tokens: maxTokens,
        temperature: 0.8
      })
    });

    const data = await resp.json();
    if (!resp.ok) {
      return new Response(
        JSON.stringify({ error: "OpenAI error", details: data }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const text = data?.choices?.[0]?.message?.content?.trim() || "";

    return new Response(
      JSON.stringify({ result: text, raw: data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
