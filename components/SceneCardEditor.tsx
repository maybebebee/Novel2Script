"use client";

import type { Beat, Character, Dialogue, Scene } from "@/lib/scriptDocument";

type SceneCardEditorProps = {
  scene: Scene;
  sceneIndex: number;
  characterOptions: Character[];
  locationName: string;
  characterNames: string[];
  onChange: (nextScene: Scene) => void;
};

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinLines(value: string[]) {
  return value.join("\n");
}

function makeBeatId(scene: Scene, index: number) {
  return `${scene.scene_id}_beat_${String(index + 1).padStart(3, "0")}`;
}

function dialogueToLine(dialogue: Dialogue) {
  const name = dialogue.character_name || "角色";
  const emotion = dialogue.emotion ? `（${dialogue.emotion}）` : "";
  return `${name}${emotion}：${dialogue.line}`;
}

function makeSceneHeading(sceneIndex: number, locationName: string, time: string) {
  return `第${sceneIndex + 1}场 ${locationName} ${time}`.trim();
}

function formatSceneTextForEditor(
  scene: Scene,
  sceneIndex: number,
  locationName: string,
) {
  if (scene.screenplay_text.includes("\n")) {
    return scene.screenplay_text;
  }

  const paragraphs = [
    makeSceneHeading(sceneIndex, locationName, scene.time),
    scene.visual.atmosphere,
    ...scene.action_lines,
    ...scene.dialogues.map(dialogueToLine),
    scene.transition ? `转场：${scene.transition.replace(/^转场[:：]\s*/, "")}` : "",
  ].filter((paragraph) => paragraph.trim().length > 0);

  return paragraphs.join("\n\n");
}

function parseDialogueLine(
  value: string,
  fallback: Dialogue,
): Dialogue {
  const match = value.match(/^(.+?)(?:（(.+?)）)?[:：](.*)$/);

  if (!match) {
    return {
      ...fallback,
      line: value.trim(),
    };
  }

  return {
    ...fallback,
    character_name: match[1].trim(),
    emotion: (match[2] || fallback.emotion || "未标注").trim(),
    line: match[3].trim(),
  };
}

function makeFallbackDialogue(index: number): Dialogue {
  return {
    character_id: "",
    character_name: "角色",
    emotion: "未标注",
    line: "",
    action: "按正文语境表演",
  };
}

function parseDialogueText(value: string, fallbacks: Dialogue[]) {
  return splitLines(value).map((line, index) =>
    parseDialogueLine(line, fallbacks[index] || makeFallbackDialogue(index)),
  );
}

function parseBeatText(value: string, scene: Scene) {
  return splitLines(value).map((line, index) => {
    const fallback = scene.beats[index];

    return {
      beat_id: fallback?.beat_id || makeBeatId(scene, index),
      type: fallback?.type || "action",
      content: line,
      character_actions: fallback?.character_actions || [],
    };
  });
}

function lineLooksLikeDialogue(line: string) {
  return /^.+?(?:（.+?）)?[:：].+$/.test(line);
}

function lineLooksLikeSceneHeading(line: string) {
  return /^第.+?场\b/.test(line);
}

function lineLooksLikeTransition(line: string) {
  return /^转场[:：]/.test(line);
}

function deriveSceneFieldsFromScreenplayText(value: string, scene: Scene) {
  const lines = splitLines(value);
  const transitionLine = lines.find(lineLooksLikeTransition);
  const contentLines = lines.filter(
    (line) => !lineLooksLikeSceneHeading(line) && !lineLooksLikeTransition(line),
  );
  const dialogueLines = contentLines.filter(lineLooksLikeDialogue);
  const actionLines = contentLines.filter((line) => !lineLooksLikeDialogue(line));

  return {
    screenplay_text: value,
    action_lines: actionLines.length ? actionLines : ["动作待补充"],
    beats: actionLines.length
      ? parseBeatText(actionLines.join("\n"), scene)
      : scene.beats,
    dialogues: dialogueLines.length
      ? parseDialogueText(dialogueLines.join("\n"), scene.dialogues)
      : scene.dialogues,
    transition: transitionLine
      ? transitionLine.replace(/^转场[:：]\s*/, "")
      : scene.transition,
  };
}

const plainInput =
  "border-0 bg-transparent outline-none transition focus:bg-teal-50/60";
const plainTextarea =
  "w-full resize-y border-0 bg-transparent outline-none transition focus:bg-teal-50/60";
const editorLabel =
  "pt-2 text-sm font-semibold leading-7 tracking-wide text-slate-500";
const editorTextarea =
  `${plainTextarea} px-0 py-1 leading-8 text-slate-900`;

export function SceneCardEditor({
  scene,
  sceneIndex,
  locationName,
  characterNames,
  onChange,
}: SceneCardEditorProps) {
  function updateScene<K extends keyof Scene>(key: K, value: Scene[K]) {
    onChange({
      ...scene,
      [key]: value,
    });
  }

  function updateActionLines(value: string) {
    const lines = splitLines(value);
    updateScene("action_lines", lines.length ? lines : ["动作待补充"]);
  }

  function updateSensoryDetails(value: string) {
    updateScene("visual", {
      ...scene.visual,
      sensory_details: splitLines(value),
    });
  }

  function updateDialogues(value: string) {
    updateScene("dialogues", parseDialogueText(value, scene.dialogues));
  }

  function updateBeats(value: string) {
    const beats = parseBeatText(value, scene);
    updateScene(
      "beats",
      beats.length
        ? beats
        : [
            {
              beat_id: makeBeatId(scene, 0),
              type: "action",
              content: "剧情节拍待补充",
              character_actions: [],
            },
          ],
    );
  }

  function updateScreenplayText(value: string) {
    onChange({
      ...scene,
      ...deriveSceneFieldsFromScreenplayText(value, scene),
    });
  }

  return (
    <article className="py-8 first:pt-0">
      <header>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-base font-semibold text-slate-950">
          <span>第{sceneIndex + 1}场</span>
          <span>{locationName}</span>
          <input
            value={scene.time}
            onChange={(event) => updateScene("time", event.target.value)}
            className={`${plainInput} w-28 px-0 text-slate-600`}
            aria-label={`第${sceneIndex + 1}场时间`}
          />
        </div>
        <input
          value={scene.title}
          onChange={(event) => updateScene("title", event.target.value)}
          className={`${plainInput} mt-2 w-full px-0 py-1 text-2xl font-semibold text-slate-950`}
          aria-label={`第${sceneIndex + 1}场标题`}
        />
        <p className="mt-3 text-sm leading-6 text-slate-500">
          出场人物：{characterNames.join("、") || "未标注"}
        </p>
      </header>

      <div className="mt-7 text-base leading-8 text-slate-950">
        <section>
          <h4 className="mb-3 text-sm font-semibold tracking-wide text-slate-500">
            场景正文：
          </h4>
          <textarea
            value={formatSceneTextForEditor(scene, sceneIndex, locationName)}
            onChange={(event) => updateScreenplayText(event.target.value)}
            className={`${editorTextarea} min-h-96 w-full text-slate-950`}
            aria-label={`第${sceneIndex + 1}场场景正文`}
          />
        </section>

        <details className="mt-6 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">
            结构化字段
          </summary>

          <div className="mt-5 grid gap-y-5 text-base leading-8 text-slate-950">
            <section className="grid gap-3 sm:grid-cols-[6rem_1fr]">
              <h4 className={editorLabel}>
                画面：
              </h4>
              <textarea
                value={scene.visual.atmosphere}
                onChange={(event) =>
                  updateScene("visual", {
                    ...scene.visual,
                    atmosphere: event.target.value,
                  })
                }
                className={`${editorTextarea} min-h-16`}
              />
            </section>

            <section className="grid gap-3 sm:grid-cols-[6rem_1fr]">
              <h4 className={editorLabel}>
                动作：
              </h4>
              <textarea
                value={joinLines(scene.action_lines)}
                onChange={(event) => updateActionLines(event.target.value)}
                className={`${editorTextarea} min-h-24`}
              />
            </section>

            <section className="grid gap-3 sm:grid-cols-[6rem_1fr]">
              <h4 className={editorLabel}>
                台词：
              </h4>
              <textarea
                value={joinLines(scene.dialogues.map(dialogueToLine))}
                onChange={(event) => updateDialogues(event.target.value)}
                placeholder="当前场景没有对白。"
                className={`${editorTextarea} min-h-28 text-slate-900`}
                aria-label={`第${sceneIndex + 1}场台词`}
              />
            </section>

            <section className="grid gap-3 sm:grid-cols-[6rem_1fr]">
              <h4 className={editorLabel}>
                音效：
              </h4>
              <textarea
                value={joinLines(scene.visual.sensory_details)}
                onChange={(event) => updateSensoryDetails(event.target.value)}
                className={`${editorTextarea} min-h-16 text-slate-700`}
              />
            </section>

            <section className="grid gap-3 sm:grid-cols-[6rem_1fr]">
              <h4 className={editorLabel}>
                场景摘要：
              </h4>
              <textarea
                value={scene.summary}
                onChange={(event) => updateScene("summary", event.target.value)}
                className={`${editorTextarea} min-h-16 text-slate-700`}
              />
            </section>

            <section className="grid gap-3 sm:grid-cols-[6rem_1fr]">
              <h4 className={editorLabel}>
                剧情节拍：
              </h4>
              <textarea
                value={joinLines(scene.beats.map((beat) => beat.content))}
                onChange={(event) => updateBeats(event.target.value)}
                className={`${editorTextarea} min-h-28 text-slate-700`}
                aria-label={`第${sceneIndex + 1}场剧情节拍`}
              />
            </section>

            <section className="grid gap-3 sm:grid-cols-[6rem_1fr]">
              <h4 className={editorLabel}>
                转场：
              </h4>
              <textarea
                value={scene.transition}
                onChange={(event) => updateScene("transition", event.target.value)}
                className={`${editorTextarea} min-h-12 text-slate-700`}
              />
            </section>
          </div>
        </details>
      </div>
    </article>
  );
}
