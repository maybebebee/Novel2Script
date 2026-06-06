import yaml from "js-yaml";
import { validateScriptYamlObject } from "@/lib/schema";
import { cleanYamlText, parseYamlText } from "@/lib/yaml";

export type ScriptDocument = {
  script: {
    title: string;
    source_type: string;
    language: string;
    logline: string;
    themes: string[];
  };
  chapters: Chapter[];
  characters: Character[];
  locations: Location[];
  scenes: Scene[];
  metadata: {
    schema_version: string;
    generated_by: string;
    notes: string;
  };
};

export type Chapter = {
  chapter_id: string;
  title: string;
  summary: string;
};

export type Character = {
  character_id: string;
  name: string;
  role: string;
  description: string;
  motivation: string;
  relationships: unknown[];
};

export type Location = {
  location_id: string;
  name: string;
  description: string;
};

export type Scene = {
  scene_id: string;
  chapter_id: string;
  title: string;
  location_id: string;
  time: string;
  summary: string;
  characters: string[];
  visual: SceneVisual;
  action_lines: string[];
  beats: Beat[];
  dialogues: Dialogue[];
  transition: string;
  screenplay_text: string;
};

export type SceneVisual = {
  atmosphere: string;
  key_props: string[];
  sensory_details: string[];
};

export type Beat = {
  beat_id: string;
  type: string;
  content: string;
  character_actions: CharacterAction[];
};

export type CharacterAction = {
  character_id: string;
  character_name: string;
  action: string;
};

export type Dialogue = {
  character_id: string;
  character_name: string;
  emotion: string;
  line: string;
  action: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringValue(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null || value === "") {
    return [];
  }

  return [value];
}

function toStringArray(value: unknown): string[] {
  return toArray(value)
    .map((item) => toStringValue(item).trim())
    .filter(Boolean);
}

function normalizeCharacterAction(
  value: unknown,
  fallbackCharacterId = "",
): CharacterAction {
  if (isRecord(value)) {
    return {
      character_id: toStringValue(value.character_id, fallbackCharacterId),
      character_name: toStringValue(value.character_name),
      action: toStringValue(value.action),
    };
  }

  return {
    character_id: fallbackCharacterId,
    character_name: "",
    action: toStringValue(value),
  };
}

function normalizeDialogue(value: unknown): Dialogue {
  if (isRecord(value)) {
    return {
      character_id: toStringValue(value.character_id),
      character_name: toStringValue(value.character_name),
      emotion: toStringValue(value.emotion, "未标注"),
      line: toStringValue(value.line),
      action: toStringValue(value.action, "按正文语境表演"),
    };
  }

  return {
    character_id: "",
    character_name: "",
    emotion: "未标注",
    line: toStringValue(value),
    action: "按正文语境表演",
  };
}

function normalizeBeat(value: unknown, index: number): Beat {
  if (isRecord(value)) {
    return {
      beat_id: toStringValue(
        value.beat_id,
        `beat_${String(index + 1).padStart(3, "0")}`,
      ),
      type: toStringValue(value.type, "action"),
      content: toStringValue(value.content),
      character_actions: toArray(value.character_actions).map((action) =>
        normalizeCharacterAction(action),
      ),
    };
  }

  return {
    beat_id: `beat_${String(index + 1).padStart(3, "0")}`,
    type: "action",
    content: toStringValue(value),
    character_actions: [],
  };
}

function normalizeScene(value: unknown, index: number): Scene {
  const scene = isRecord(value) ? value : {};
  const visual = isRecord(scene.visual) ? scene.visual : {};
  const summary = toStringValue(scene.summary);
  const screenplayText = toStringValue(
    scene.screenplay_text,
    summary || toStringValue(scene.title),
  );
  const actionLines = toStringArray(scene.action_lines);
  const beats = toArray(scene.beats);

  return {
    scene_id: toStringValue(
      scene.scene_id,
      `scene_${String(index + 1).padStart(3, "0")}`,
    ),
    chapter_id: toStringValue(scene.chapter_id),
    title: toStringValue(scene.title, `场景 ${index + 1}`),
    location_id: toStringValue(scene.location_id),
    time: toStringValue(scene.time, "未标注时间"),
    summary: summary || screenplayText,
    characters: toStringArray(scene.characters).length
      ? toStringArray(scene.characters)
      : ["char_001"],
    visual: {
      atmosphere: toStringValue(visual.atmosphere, "未标注画面氛围"),
      key_props: toStringArray(visual.key_props),
      sensory_details: toStringArray(visual.sensory_details),
    },
    action_lines: actionLines.length ? actionLines : [screenplayText],
    beats: beats.length
      ? beats.map((beat, beatIndex) => normalizeBeat(beat, beatIndex))
      : [
          {
            beat_id: `beat_${String(index + 1).padStart(3, "0")}_001`,
            type: "action",
            content: screenplayText,
            character_actions: [],
          },
        ],
    dialogues: toArray(scene.dialogues).map((dialogue) =>
      normalizeDialogue(dialogue),
    ),
    transition: toStringValue(scene.transition, "转场待补充"),
    screenplay_text: screenplayText,
  };
}

export function normalizeScriptDocumentData(data: unknown): unknown {
  if (!isRecord(data)) {
    return data;
  }

  const script = isRecord(data.script) ? data.script : {};
  const metadata = isRecord(data.metadata) ? data.metadata : {};

  return {
    ...data,
    script: {
      ...script,
      title: toStringValue(script.title, "未命名剧本"),
      source_type: toStringValue(script.source_type, "novel"),
      language: toStringValue(script.language, "zh-CN"),
      logline: toStringValue(script.logline, "待补充一句话梗概"),
      themes: toStringArray(script.themes).length
        ? toStringArray(script.themes)
        : ["待补充主题"],
    },
    chapters: toArray(data.chapters).map((chapter, index) => {
      const normalizedChapter = isRecord(chapter) ? chapter : {};

      return {
        ...normalizedChapter,
        chapter_id: toStringValue(
          normalizedChapter.chapter_id,
          `chapter_${String(index + 1).padStart(3, "0")}`,
        ),
        title: toStringValue(normalizedChapter.title, `第 ${index + 1} 章`),
        summary: toStringValue(normalizedChapter.summary, "章节摘要待补充"),
      };
    }),
    characters: toArray(data.characters).map((character, index) => {
      const normalizedCharacter = isRecord(character) ? character : {};

      return {
        ...normalizedCharacter,
        character_id: toStringValue(
          normalizedCharacter.character_id,
          `char_${String(index + 1).padStart(3, "0")}`,
        ),
        name: toStringValue(normalizedCharacter.name, `角色 ${index + 1}`),
        role: toStringValue(normalizedCharacter.role, "未标注角色功能"),
        description: toStringValue(
          normalizedCharacter.description,
          "角色描述待补充",
        ),
        motivation: toStringValue(
          normalizedCharacter.motivation,
          "角色动机待补充",
        ),
        relationships: toArray(normalizedCharacter.relationships),
      };
    }),
    locations: toArray(data.locations).map((location, index) => {
      const normalizedLocation = isRecord(location) ? location : {};

      return {
        ...normalizedLocation,
        location_id: toStringValue(
          normalizedLocation.location_id,
          `loc_${String(index + 1).padStart(3, "0")}`,
        ),
        name: toStringValue(normalizedLocation.name, `地点 ${index + 1}`),
        description: toStringValue(
          normalizedLocation.description,
          "地点描述待补充",
        ),
      };
    }),
    scenes: toArray(data.scenes).map((scene, index) =>
      normalizeScene(scene, index),
    ),
    metadata: {
      ...metadata,
      schema_version: "1.1.0",
      generated_by: toStringValue(metadata.generated_by, "llm"),
      notes: toStringValue(
        metadata.notes,
        "已自动规范化为 Novel2Script Schema。",
      ),
    },
  };
}

export function isScriptDocument(data: unknown): data is ScriptDocument {
  return validateScriptYamlObject(data).valid;
}

export function parseScriptDocumentFromYaml(
  yamlText: string,
):
  | {
      ok: true;
      document: ScriptDocument;
    }
  | {
      ok: false;
      error: string;
    } {
  const parsed = parseYamlText(cleanYamlText(yamlText));

  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error,
    };
  }

  const normalizedData = normalizeScriptDocumentData(parsed.data);
  const validation = validateScriptYamlObject(normalizedData);

  if (!validation.valid) {
    return {
      ok: false,
      error:
        validation.issues[0]?.message ||
        "YAML 结构不符合 Novel2Script Schema。",
    };
  }

  return {
    ok: true,
    document: normalizedData as ScriptDocument,
  };
}

export function scriptDocumentToYaml(document: ScriptDocument): string {
  return yaml.dump(document, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
    forceQuotes: false,
  });
}

export function getCharacterName(
  document: ScriptDocument,
  characterId: string,
) {
  return (
    document.characters.find(
      (character) => character.character_id === characterId,
    )?.name || characterId
  );
}

export function getLocationName(document: ScriptDocument, locationId: string) {
  return (
    document.locations.find((location) => location.location_id === locationId)
      ?.name || locationId
  );
}
