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


export async function streamChatReply(
  history: ChatMessage[],
  onChunk: (text: string) => void
): Promise<string> {
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
      stream: true, // <-- the key difference
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`AI_REQUEST_FAILED: ${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // OpenAI-compatible streaming sends newline-separated "data: {...}" lines
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // keep any incomplete line for next loop

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const jsonStr = trimmed.replace(/^data:\s*/, "");
      if (jsonStr === "[DONE]") continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const deltaText = parsed.choices?.[0]?.delta?.content;
        if (deltaText) {
          fullText += deltaText;
          onChunk(deltaText);
        }
      } catch {
        // incomplete/malformed JSON fragment — skip, next chunk will complete it
      }
    }
  }

  return fullText;
}


export async function generateTitle(firstMessage: string): Promise<string> {
  const response = await fetch(`${process.env.AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Generate a short title (3-6 words) summarizing the topic of the user's message. " +
            "Respond with ONLY the title text — no quotes, no punctuation at the end, no explanation.",
        },
        { role: "user", content: firstMessage },
      ],
      temperature: 0.3,
      max_tokens: 20, // titles are short — cap output to keep this fast and cheap
    }),
  });

  if (!response.ok) {
    throw new Error("TITLE_GENERATION_FAILED");
  }

  const data = await response.json();
  const title = data.choices?.[0]?.message?.content?.trim();

  return title || "New Conversation"; // graceful fallback, never leave title empty
}