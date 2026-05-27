export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LLMConfig = {
  apiUrl: string;
  apiKey: string;
  model: string;
};

/** OpenAI-compatible chat completions (DeepSeek default). */
export function getLLMConfig(): LLMConfig {
  return {
    apiUrl: process.env.LLM_API_URL ?? "https://api.deepseek.com/v1/chat/completions",
    apiKey: process.env.LLM_API_KEY ?? process.env.DEEPSEEK_API_KEY ?? "",
    model: process.env.LLM_MODEL ?? "deepseek-chat",
  };
}

export function isLLMConfigured() {
  return Boolean(getLLMConfig().apiKey);
}

export async function chatCompletionJson<T>(
  messages: LLMMessage[],
  options?: { temperature?: number },
): Promise<T | null> {
  const { apiUrl, apiKey, model } = getLLMConfig();
  if (!apiKey) return null;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}
