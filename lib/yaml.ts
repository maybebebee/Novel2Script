import yaml from "js-yaml";

export function cleanYamlText(text: string): string {
  return text
    .trim()
    .replace(/^```(?:yaml|yml)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

export function parseYamlText(
  yamlText: string,
):
  | {
      ok: true;
      data: unknown;
    }
  | {
      ok: false;
      error: string;
    } {
  try {
    return {
      ok: true,
      data: yaml.load(yamlText),
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `YAML 解析失败：${error.message}`
          : "YAML 解析失败，请检查缩进、冒号和列表格式。",
    };
  }
}
