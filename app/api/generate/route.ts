import { NextResponse } from "next/server";
import { generateChatCompletion } from "@/lib/llm";
import {
  buildScriptGenerationPrompt,
  buildYamlRepairPrompt,
} from "@/lib/prompts";
import {
  parseScriptDocumentFromYaml,
  scriptDocumentToYaml,
  type ScriptDocument,
} from "@/lib/scriptDocument";
import { cleanYamlText } from "@/lib/yaml";

const MIN_NOVEL_LENGTH = 300;

async function parseOrRepairGeneratedYaml(
  rawYaml: string,
): Promise<{
  document: ScriptDocument;
  repaired: boolean;
}> {
  const parsed = parseScriptDocumentFromYaml(rawYaml);

  if (parsed.ok) {
    return {
      document: parsed.document,
      repaired: false,
    };
  }

  const { systemPrompt, userPrompt } = buildYamlRepairPrompt(
    rawYaml,
    parsed.error,
  );
  const repairedOutput = await generateChatCompletion({
    systemPrompt,
    userPrompt,
    temperature: 0,
  });
  const repairedYaml = cleanYamlText(repairedOutput);
  const repairedParsed = parseScriptDocumentFromYaml(repairedYaml);

  if (!repairedParsed.ok) {
    throw new Error(
      `模型返回的 YAML 仍无法解析：${repairedParsed.error}。请重新生成一次。`,
    );
  }

  return {
    document: repairedParsed.document,
    repaired: true,
  };
}

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
    const rawYaml = cleanYamlText(modelOutput);

    if (!rawYaml) {
      return NextResponse.json(
        {
          error: "模型返回内容为空，请稍后重试。",
        },
        {
          status: 500,
        },
      );
    }

    const parsed = await parseOrRepairGeneratedYaml(rawYaml);
    const yaml = scriptDocumentToYaml(parsed.document);

    return NextResponse.json({
      yaml,
      usageNote: parsed.repaired
        ? "剧本稿生成成功，并已自动修复 YAML 语法后规范化为 Novel2Script 细节版 YAML。"
        : "剧本稿生成成功，底层数据已规范化为 Novel2Script 细节版 YAML。",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "生成剧本失败，请稍后重试。",
      },
      {
        status: 500,
      },
    );
  }
}
