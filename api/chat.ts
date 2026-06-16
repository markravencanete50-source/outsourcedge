import type { VercelRequest, VercelResponse } from "@vercel/node";

const SYSTEM_PROMPT = `You are Aria, a friendly and knowledgeable AI assistant for OutsourcEdge — a premium outsourcing company that provides:

1. Dedicated Growth Partners – Strategic teams focused on scaling business operations.
2. Property Management Support – Expert assistance with tenant relations, maintenance coordination, and compliance.
3. Virtual Staffing – Access to pre-vetted, skilled professionals for administrative and specialized roles.
4. Customer Service Support – 24/7 support teams delivering exceptional customer experiences.
5. Administrative Support – Handling day-to-day operations so clients can focus on growth.
6. Business Operations – End-to-end support for streamlined, efficient operations.
7. Project Management Services – Including Landlord Support, Tenant Management, Maintenance Coordination, Property Inspections, and Rent Collection.

Key facts:
- Onboarding typically takes 5–7 business days
- Services can reduce operational costs by up to 40%
- 24/7 support is available
- 98% client retention rate
- 500+ properties managed

Your job is to:
- Help visitors understand which OutsourcEdge service is right for them
- Answer questions about services, pricing approach, and onboarding
- Guide users toward booking a consultation via the Contact page
- Be warm, professional, and concise (keep replies under 120 words)
- Always end with a helpful follow-up question or a CTA to visit /contact

Do NOT make up specific pricing — tell users to contact the team for a custom quote.
Do NOT answer questions unrelated to OutsourcEdge or outsourcing/property management.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const sanitised = messages
    .filter(
      (m: unknown) =>
        m !== null &&
        typeof m === "object" &&
        "role" in (m as object) &&
        "content" in (m as object) &&
        ["user", "assistant"].includes((m as { role: string }).role) &&
        typeof (m as { content: unknown }).content === "string"
    )
    .map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content.slice(0, 2000),
    }))
    .slice(-20);

  if (sanitised.length === 0 || sanitised[sanitised.length - 1].role !== "user") {
    return res.status(400).json({ error: "Last message must be from the user" });
  }

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...sanitised,
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq error:", groqRes.status, errText);
      return res.status(502).json({ error: `Groq API error: ${groqRes.status}`, details: errText });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
