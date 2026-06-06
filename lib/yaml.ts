import yaml from "js-yaml";

function repairMismatchedSmartQuoteLine(line: string): string {
  const listItemMatch = line.match(/^(\s*-\s+)(.*?)(\s*)$/);

  if (listItemMatch) {
    const [, prefix, value, suffix] = listItemMatch;
    const trimmedValue = value.trim();

    if (
      trimmedValue.startsWith('"') &&
      trimmedValue.endsWith("”") &&
      !trimmedValue.endsWith('"')
    ) {
      return `${prefix}${value.replace(/”(\s*)$/, '"$1')}${suffix}`;
    }

    if (
      trimmedValue.startsWith("“") &&
      trimmedValue.endsWith('"') &&
      !trimmedValue.startsWith('"')
    ) {
      return `${prefix}${value.replace(/^(\s*)“/, '$1"')}${suffix}`;
    }
  }

  const mappingMatch = line.match(/^(\s*(?:-\s*)?[\w.-]+:\s*)(.*?)(\s*)$/);

  if (!mappingMatch) {
    return line;
  }

  const [, prefix, value, suffix] = mappingMatch;
  const trimmedValue = value.trim();

  if (
    trimmedValue.startsWith('"') &&
    trimmedValue.endsWith("”") &&
    !trimmedValue.endsWith('"')
  ) {
    return `${prefix}${value.replace(/”(\s*)$/, '"$1')}${suffix}`;
  }

  if (
    trimmedValue.startsWith("“") &&
    trimmedValue.endsWith('"') &&
    !trimmedValue.startsWith('"')
  ) {
    return `${prefix}${value.replace(/^(\s*)“/, '$1"')}${suffix}`;
  }

  return line;
}

export function repairYamlText(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => repairMismatchedSmartQuoteLine(line))
    .join("\n");
}

export function cleanYamlText(text: string): string {
  const cleaned = text
    .trim()
    .replace(/^```(?:yaml|yml)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  return repairYamlText(cleaned);
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
    const repairedYamlText = repairYamlText(yamlText);

    if (repairedYamlText !== yamlText) {
      try {
        return {
          ok: true,
          data: yaml.load(repairedYamlText),
        };
      } catch {
        // Preserve the original parser message because it points to the source line.
      }
    }

    return {
      ok: false,
      error:
        error instanceof Error
          ? `YAML 解析失败：${error.message}`
          : "YAML 解析失败，请检查缩进、冒号和列表格式。",
    };
  }
}
