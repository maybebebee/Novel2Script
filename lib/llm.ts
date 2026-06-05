type GenerateChatCompletionOptions = {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function generateChatCompletion({
  systemPrompt,
  userPrompt,
  temperature = 0.3,
}: GenerateChatCompletionOptions): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("缺少 OPENAI_API_KEY，请先在 .env.local 中配置模型 API Key。");
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  let data: ChatCompletionResponse;

  try {
    data = (await response.json()) as ChatCompletionResponse;
  } catch {
    throw new Error("模型接口返回了无法解析的响应，请稍后重试。");
  }

  if (!response.ok) {
    throw new Error(
      data.error?.message || `模型接口请求失败，状态码：${response.status}`,
    );
  }

  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("模型返回内容为空，请调整输入后重试。");
  }

  return content;
}
