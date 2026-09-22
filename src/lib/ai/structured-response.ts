type StructuredRequest = {
  name: string;
  instructions: string;
  input: unknown;
  schema: Record<string, unknown>;
  maxOutputTokens?: number;
};

// Keep document/user content separate from the application's instructions.
export async function generateStructuredResponse(request: StructuredRequest): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Die KI ist noch nicht eingerichtet. Bitte versuche es später erneut.");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(90_000),
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      store: false,
      instructions: request.instructions,
      input: JSON.stringify(request.input),
      reasoning: { effort: "low" },
      max_output_tokens: request.maxOutputTokens ?? 7000,
      text: { format: { type: "json_schema", name: request.name, strict: true, schema: request.schema } }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("OpenAI structured response failed", {
      status: response.status,
      requestId: response.headers.get("x-request-id"),
      body: errorBody.slice(0, 2000)
    });
    if (response.status === 401) {
      throw new Error("Der OpenAI API-Schlüssel ist ungültig oder wurde widerrufen. Bitte aktualisiere OPENAI_API_KEY.");
    }
    if (response.status === 429) {
      throw new Error("Das KI-Nutzungslimit wurde erreicht. Bitte prüfe dein OpenAI-Guthaben oder versuche es später erneut.");
    }
    throw new Error("Die KI-Anfrage ist fehlgeschlagen. Bitte versuche es später erneut.");
  }
  const data = await response.json() as {
    status?: string;
    output?: { content?: { type: string; text?: string }[] }[];
  };
  if (data.status !== "completed") throw new Error("Die KI-Antwort war unvollständig. Bitte versuche es erneut.");
  const content = data.output?.flatMap((item) => item.content ?? []) ?? [];
  if (content.some((item) => item.type === "refusal")) throw new Error("Für diese Inhalte konnte die KI kein Feedback erstellen.");
  const text = content.filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("");
  try { return JSON.parse(text); } catch { throw new Error("Die KI-Antwort konnte nicht gelesen werden. Bitte versuche es erneut."); }
}

export function objectSchema(properties: Record<string, unknown>) {
  return { type: "object", properties, required: Object.keys(properties), additionalProperties: false };
}

export function textField(maxLength = 1200) {
  // maxLength is enforced by requiredText after the model response. The
  // Responses API strict JSON-schema subset does not accept maxLength.
  void maxLength;
  return { type: "string" };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function requiredText(value: unknown, maxLength = 1200) {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) throw new Error("Die KI-Antwort enthält ungültige Angaben. Bitte versuche es erneut.");
  return value.trim();
}

export function containsQuote(source: string, quote: string) {
  const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
  return Boolean(quote.trim()) && normalize(source).includes(normalize(quote));
}
