import type { VercelRequest, VercelResponse } from "@vercel/node";

const SYSTEM_PROMPT = `You are Aria, a friendly and knowledgeable AI assistant for OutsourcEdge — a premium outsourcing company that provides:

1. **Dedicated Growth Partners** – Strategic teams focused on scaling business operations and driving sustainable growth.
2. **Property Management Support** – Expert assistance with tenant relations, maintenance coordination, and compliance.
3. **Virtual Staffing** – Access to pre-vetted, skilled professionals for administrative, technical, and specialized roles.
4. **Customer Service Support** – 24/7 support teams delivering exceptional customer experiences across all channels.
5. **Administrative Support** – Handling day-to-day operations so clients can focus on strategic growth.
6. **Business Operations** – End-to-end support for streamlined, efficient operations.
7. **Project Management Services** – Including Landlord Support, Tenant Management, Maintenance Coordination, Property Inspections, and Rent Collection.

Key facts:
- Onboarding typically takes 5–7 business days
- Services can reduce operational costs by up to 40%
- 24/7 support is available
- 98% client retention rate
- 500+ properties managed
- They serve property management, real estate, tech startups, e-commerce, and more

Your job is to:
- Help visitors understand which OutsourcEdge service is right for them
- Answer questions about services, pricing approach, and onboarding
- Guide users toward booking a consultation via the Contact page
- Be warm, professional, and concise (keep replies under 120 words unless detail is truly needed)
- Always end with a helpful follow-up question or a CTA to visit /contact

Do NOT make up specific pricing — tell users to contact the team for a custom quote.
Do NOT answer questions unrelated to OutsourcEdge or outsourcing/property management.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS headers — allow your own domain only
  res.setHeader("Access-Control-Allow-Origin", "https://outsourcedge.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  // Validate message shape and strip anything unexpected
  const sanitised = messages
    .filter(
      (m: unknown) =>
        m !== null &&
        typeof m === "object" &&
        ("role" in (m as object)) &&
        ("content" in (m as object)) &&
        ["user", "assistant"].includes((m as { role: string }).role) &&
        typeof (m as { content: unknown }).content === "string"
    )
    .map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content.slice(0, 2000), // cap per-message length
    }))
    .slice(-20); // keep last 20 messages max to control token usage

  if (sanitised.length === 0 || sanitised[sanitised.length - 1].role !== "user") {
    return res.status(400).json({ error: "Last message must be from the user" });
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: sanitised,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic error:", errText);
      return res.status(502).json({ error: "Upstream API error" });
    }

    const data = await anthropicRes.json();
    const reply = data?.content?.[0]?.text ?? "Sorry, I couldn't generate a response.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
