import { NextResponse } from "next/server";
import { validateScriptYamlObject } from "@/lib/schema";
import { cleanYamlText, parseYamlText } from "@/lib/yaml";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        valid: false,
        issues: [
          {
            path: "request",
            message: "请求体不是有效的 JSON。",
          },
        ],
      },
      {
        status: 400,
      },
    );
  }

  const yamlText =
    typeof body === "object" && body !== null && "yamlText" in body
      ? (body as { yamlText?: unknown }).yamlText
      : undefined;

  if (typeof yamlText !== "string") {
    return NextResponse.json(
      {
        valid: false,
        issues: [
          {
            path: "yamlText",
            message: "yamlText 必须是字符串。",
          },
        ],
      },
      {
        status: 400,
      },
    );
  }

  const cleanedYaml = cleanYamlText(yamlText);

  if (!cleanedYaml) {
    return NextResponse.json(
      {
        valid: false,
        issues: [
          {
            path: "yaml",
            message: "YAML 内容不能为空。",
          },
        ],
      },
      {
        status: 400,
      },
    );
  }

  const parsed = parseYamlText(cleanedYaml);

  if (!parsed.ok) {
    return NextResponse.json({
      valid: false,
      issues: [
        {
          path: "yaml",
          message: parsed.error,
        },
      ],
    });
  }

  return NextResponse.json(validateScriptYamlObject(parsed.data));
}
