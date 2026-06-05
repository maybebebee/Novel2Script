import { NextResponse } from "next/server";
import { generateChatCompletion } from "@/lib/llm";
import { buildScriptGenerationPrompt } from "@/lib/prompts";
import { cleanYamlText } from "@/lib/yaml";

const MIN_NOVEL_LENGTH = 300;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "请求体不是有效的 JSON。",
      },
      {
        status: 400,
      },
    );
  }

  const novelText =
    typeof body === "object" && body !== null && "novelText" in body
      ? (body as { novelText?: unknown }).novelText
      : undefined;

  if (typeof novelText !== "string") {
    return NextResponse.json(
      {
        error: "novelText 必须是字符串。",
      },
      {
        status: 400,
      },
    );
  }

  const trimmedNovelText = novelText.trim();

  if (!trimmedNovelText) {
    return NextResponse.json(
      {
        error: "小说文本不能为空。",
      },
      {
        status: 400,
      },
    );
  }

  if (Array.from(trimmedNovelText).length < MIN_NOVEL_LENGTH) {
    return NextResponse.json(
      {
        error: `小说文本太短，请至少输入 ${MIN_NOVEL_LENGTH} 字以上内容。`,
      },
      {
        status: 400,
      },
    );
  }

  try {
    const { systemPrompt, userPrompt } =
      buildScriptGenerationPrompt(trimmedNovelText);
    const modelOutput = await generateChatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
    });
    const yaml = cleanYamlText(modelOutput);

    if (!yaml) {
      return NextResponse.json(
        {
          error: "模型返回内容为空，请稍后重试。",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      yaml,
      usageNote:
        "生成成功，结果为 AI 生成的细节版剧本 YAML 初稿，请继续人工打磨。",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "生成剧本 YAML 失败，请稍后重试。",
      },
      {
        status: 500,
      },
    );
  }
}
