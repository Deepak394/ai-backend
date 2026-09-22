type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT =
  "You are a helpful knowledge assistant. Answer clearly and concisely.";

export async function getChatReply(history: ChatMessage[]): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
  ];

  const response = await fetch(`${process.env.AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      messages,
      temperature: Number(process.env.AI_TEMPERATURE ?? 0.3),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI_REQUEST_FAILED: ${errorText}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;

  if (!reply) {
    throw new Error("AI_EMPTY_RESPONSE");
  }

  return reply;
}