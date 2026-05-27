export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LLMConfig = {
  apiUrl: string;
  apiKey: string;
  model: string;
};

/** OpenAI-compatible chat completions (Zhipu GLM / DeepSeek). */
export function getLLMConfig(): LLMConfig {
  const apiKey =
    process.env.LLM_API_KEY ??
    process.env.ZHIPU_API_KEY ??
    process.env.DEEPSEEK_API_KEY ??
    "";
  const apiUrl =
    process.env.LLM_API_URL ?? "https://open.bigmodel.cn/api/paas/v4/chat/completions";
  const model =
    process.env.LLM_MODEL ??
    (apiUrl.includes("bigmodel.cn") ? "glm-4-flash-250414" : "deepseek-chat");

  return { apiUrl, apiKey, model };
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

  if (!response.ok) {
    if (process.env.NODE_ENV !== "production") {
      const body = await response.text();
      console.error("[LLM]", response.status, body);
    }
    return null;
  }

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
