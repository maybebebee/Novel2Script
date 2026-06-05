export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function addIssue(
  issues: ValidationIssue[],
  path: string,
  message: string,
) {
  issues.push({
    path,
    message,
  });
}

function requireObject(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): value is Record<string, unknown> {
  if (!isRecord(value)) {
    addIssue(issues, path, `${path} 必须是对象`);
    return false;
  }

  return true;
}

function requireString(
  object: Record<string, unknown>,
  key: string,
  path: string,
  issues: ValidationIssue[],
) {
  const value = object[key];

  if (!isNonEmptyString(value)) {
    addIssue(issues, path, `${path} 必须是非空字符串`);
  }
}

function requireArray(
  object: Record<string, unknown>,
  key: string,
  path: string,
  minLength: number,
  issues: ValidationIssue[],
): unknown[] | null {
  const value = object[key];

  if (!Array.isArray(value)) {
    addIssue(issues, path, `${path} 必须是数组`);
    return null;
  }

  if (value.length < minLength) {
    addIssue(issues, path, `${path} 至少需要 ${minLength} 项`);
  }

  return value;
}

function validateStringFields(
  object: Record<string, unknown>,
  fields: string[],
  basePath: string,
  issues: ValidationIssue[],
) {
  fields.forEach((field) => {
    requireString(object, field, `${basePath}.${field}`, issues);
  });
}

export function validateScriptYamlObject(data: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!isRecord(data)) {
    return {
      valid: false,
      issues: [
        {
          path: "root",
          message: "YAML 顶层必须是对象",
        },
      ],
    };
  }

  const requiredTopLevelFields = [
    "script",
    "chapters",
    "characters",
    "locations",
    "scenes",
    "metadata",
  ];

  requiredTopLevelFields.forEach((field) => {
    if (!(field in data)) {
      addIssue(issues, field, `顶层字段 ${field} 是必填项`);
    }
  });

  if (requireObject(data.script, "script", issues)) {
    validateStringFields(
      data.script,
      ["title", "source_type", "language", "logline"],
      "script",
      issues,
    );
    requireArray(data.script, "themes", "script.themes", 1, issues);
  }

  const chapters = requireArray(data, "chapters", "chapters", 3, issues);
  chapters?.forEach((chapter, index) => {
    const path = `chapters[${index}]`;

    if (!requireObject(chapter, path, issues)) {
      return;
    }

    validateStringFields(
      chapter,
      ["chapter_id", "title", "summary"],
      path,
      issues,
    );
  });

  const characters = requireArray(data, "characters", "characters", 1, issues);
  characters?.forEach((character, index) => {
    const path = `characters[${index}]`;

    if (!requireObject(character, path, issues)) {
      return;
    }

    validateStringFields(
      character,
      ["character_id", "name", "role", "description", "motivation"],
      path,
      issues,
    );
    requireArray(character, "relationships", `${path}.relationships`, 0, issues);
  });

  const locations = requireArray(data, "locations", "locations", 1, issues);
  locations?.forEach((location, index) => {
    const path = `locations[${index}]`;

    if (!requireObject(location, path, issues)) {
      return;
    }

    validateStringFields(
      location,
      ["location_id", "name", "description"],
      path,
      issues,
    );
  });

  const scenes = requireArray(data, "scenes", "scenes", 3, issues);
  scenes?.forEach((scene, sceneIndex) => {
    const path = `scenes[${sceneIndex}]`;

    if (!requireObject(scene, path, issues)) {
      return;
    }

    validateStringFields(
      scene,
      [
        "scene_id",
        "chapter_id",
        "title",
        "location_id",
        "time",
        "summary",
        "transition",
      ],
      path,
      issues,
    );
    requireArray(scene, "characters", `${path}.characters`, 1, issues);
    const beats = requireArray(scene, "beats", `${path}.beats`, 1, issues);
    const dialogues = requireArray(
      scene,
      "dialogues",
      `${path}.dialogues`,
      0,
      issues,
    );

    beats?.forEach((beat, beatIndex) => {
      const beatPath = `${path}.beats[${beatIndex}]`;

      if (!requireObject(beat, beatPath, issues)) {
        return;
      }

      validateStringFields(
        beat,
        ["beat_id", "type", "content"],
        beatPath,
        issues,
      );
    });

    dialogues?.forEach((dialogue, dialogueIndex) => {
      const dialoguePath = `${path}.dialogues[${dialogueIndex}]`;

      if (!requireObject(dialogue, dialoguePath, issues)) {
        return;
      }

      validateStringFields(
        dialogue,
        ["character_id", "character_name", "emotion", "line"],
        dialoguePath,
        issues,
      );
    });
  });

  if (requireObject(data.metadata, "metadata", issues)) {
    validateStringFields(
      data.metadata,
      ["schema_version", "generated_by", "notes"],
      "metadata",
      issues,
    );

    if (
      typeof data.metadata.schema_version === "string" &&
      data.metadata.schema_version !== "1.0.0"
    ) {
      addIssue(
        issues,
        "metadata.schema_version",
        'metadata.schema_version 当前必须是 "1.0.0"',
      );
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
