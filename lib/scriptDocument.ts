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
  beats: Beat[];
  dialogues: Dialogue[];
  transition: string;
};

export type Beat = {
  beat_id: string;
  type: string;
  content: string;
};

export type Dialogue = {
  character_id: string;
  character_name: string;
  emotion: string;
  line: string;
};

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

  const validation = validateScriptYamlObject(parsed.data);

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
    document: parsed.data as ScriptDocument,
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
