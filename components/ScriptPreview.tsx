"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Beat,
  Character,
  CharacterAction,
  Dialogue,
  Location,
  ScriptDocument,
  Scene,
} from "@/lib/scriptDocument";
import { getCharacterName, getLocationName } from "@/lib/scriptDocument";

type ScriptPreviewProps = {
  document: ScriptDocument;
  onApply: (nextDocument: ScriptDocument) => void;
  onClose: () => void;
};

type DetailTab = "characters" | "locations" | "notes";

function cloneDocument(document: ScriptDocument): ScriptDocument {
  return JSON.parse(JSON.stringify(document)) as ScriptDocument;
}

function listFromText(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToText(value: string[]) {
  return value.join("\n");
}

function FieldLabel({
  children,
  path,
}: {
  children: React.ReactNode;
  path?: string;
}) {
  return (
    <label className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
      <span>{children}</span>
      {path ? (
        <span className="font-mono text-xs font-normal text-slate-400">
          {path}
        </span>
      ) : null}
    </label>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      {children}
    </p>
  );
}

export function ScriptPreview({
  document,
  onApply,
  onClose,
}: ScriptPreviewProps) {
  const [draft, setDraft] = useState<ScriptDocument>(() =>
    cloneDocument(document),
  );
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [detailTab, setDetailTab] = useState<DetailTab>("characters");

  useEffect(() => {
    setDraft(cloneDocument(document));
    setSelectedSceneIndex(0);
    setDetailTab("characters");
  }, [document]);

  const selectedScene = useMemo(
    () => draft.scenes[selectedSceneIndex],
    [draft.scenes, selectedSceneIndex],
  );

  function updateScriptField<K extends keyof ScriptDocument["script"]>(
    key: K,
    value: ScriptDocument["script"][K],
  ) {
    setDraft((current) => ({
      ...current,
      script: {
        ...current.script,
        [key]: value,
      },
    }));
  }

  function updateCharacter(index: number, nextCharacter: Character) {
    setDraft((current) => ({
      ...current,
      characters: current.characters.map((character, characterIndex) =>
        characterIndex === index ? nextCharacter : character,
      ),
    }));
  }

  function updateLocation(index: number, nextLocation: Location) {
    setDraft((current) => ({
      ...current,
      locations: current.locations.map((location, locationIndex) =>
        locationIndex === index ? nextLocation : location,
      ),
    }));
  }

  function updateMetadataNotes(notes: string) {
    setDraft((current) => ({
      ...current,
      metadata: {
        ...current.metadata,
        notes,
      },
    }));
  }

  function updateScene(nextScene: Scene) {
    setDraft((current) => ({
      ...current,
      scenes: current.scenes.map((scene, index) =>
        index === selectedSceneIndex ? nextScene : scene,
      ),
    }));
  }

  function updateSceneField<K extends keyof Scene>(key: K, value: Scene[K]) {
    if (!selectedScene) {
      return;
    }

    updateScene({
      ...selectedScene,
      [key]: value,
    });
  }

  function updateVisualField(
    key: keyof Scene["visual"],
    value: string | string[],
  ) {
    if (!selectedScene) {
      return;
    }

    updateScene({
      ...selectedScene,
      visual: {
        ...selectedScene.visual,
        [key]: value,
      },
    });
  }

  function updateActionLine(index: number, value: string) {
    if (!selectedScene) {
      return;
    }

    updateScene({
      ...selectedScene,
      action_lines: selectedScene.action_lines.map((line, lineIndex) =>
        lineIndex === index ? value : line,
      ),
    });
  }

  function addActionLine() {
    if (!selectedScene) {
      return;
    }

    updateScene({
      ...selectedScene,
      action_lines: [...selectedScene.action_lines, ""],
    });
  }

  function removeActionLine(index: number) {
    if (!selectedScene) {
      return;
    }

    updateScene({
      ...selectedScene,
      action_lines: selectedScene.action_lines.filter(
        (_line, lineIndex) => lineIndex !== index,
      ),
    });
  }

  function updateBeat<K extends keyof Pick<Beat, "type" | "content">>(
    beatIndex: number,
    key: K,
    value: Beat[K],
  ) {
    if (!selectedScene) {
      return;
    }

    updateScene({
      ...selectedScene,
      beats: selectedScene.beats.map((beat, index) =>
        index === beatIndex
          ? {
              ...beat,
              [key]: value,
            }
          : beat,
      ),
    });
  }

  function updateCharacterAction<K extends keyof CharacterAction>(
    beatIndex: number,
    actionIndex: number,
    key: K,
    value: CharacterAction[K],
  ) {
    if (!selectedScene) {
      return;
    }

    updateScene({
      ...selectedScene,
      beats: selectedScene.beats.map((beat, index) =>
        index === beatIndex
          ? {
              ...beat,
              character_actions: beat.character_actions.map(
                (characterAction, currentActionIndex) =>
                  currentActionIndex === actionIndex
                    ? {
                        ...characterAction,
                        [key]: value,
                      }
                    : characterAction,
              ),
            }
          : beat,
      ),
    });
  }

  function addCharacterAction(beatIndex: number) {
    if (!selectedScene) {
      return;
    }

    const firstCharacterId = selectedScene.characters[0] || "";

    updateScene({
      ...selectedScene,
      beats: selectedScene.beats.map((beat, index) =>
        index === beatIndex
          ? {
              ...beat,
              character_actions: [
                ...beat.character_actions,
                {
                  character_id: firstCharacterId,
                  character_name: firstCharacterId
                    ? getCharacterName(draft, firstCharacterId)
                    : "",
                  action: "",
                },
              ],
            }
          : beat,
      ),
    });
  }

  function removeCharacterAction(beatIndex: number, actionIndex: number) {
    if (!selectedScene) {
      return;
    }

    updateScene({
      ...selectedScene,
      beats: selectedScene.beats.map((beat, index) =>
        index === beatIndex
          ? {
              ...beat,
              character_actions: beat.character_actions.filter(
                (_action, currentActionIndex) =>
                  currentActionIndex !== actionIndex,
              ),
            }
          : beat,
      ),
    });
  }

  function updateDialogue<K extends keyof Dialogue>(
    dialogueIndex: number,
    key: K,
    value: Dialogue[K],
  ) {
    if (!selectedScene) {
      return;
    }

    updateScene({
      ...selectedScene,
      dialogues: selectedScene.dialogues.map((dialogue, index) =>
        index === dialogueIndex
          ? {
              ...dialogue,
              [key]: value,
            }
          : dialogue,
      ),
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 px-4 py-6">
      <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Script Workspace
            </p>
            <input
              value={draft.script.title}
              onChange={(event) =>
                updateScriptField("title", event.target.value)
              }
              className="mt-1 w-full border-0 bg-transparent text-2xl font-semibold text-slate-950 outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => onApply(draft)}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              应用修改到 YAML
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
            <div>
              <FieldLabel path="script.logline">一句话梗概</FieldLabel>
              <textarea
                value={draft.script.logline}
                onChange={(event) =>
                  updateScriptField("logline", event.target.value)
                }
                className="mt-2 h-28 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600"
              />
            </div>

            <div className="mt-4">
              <FieldLabel path="script.themes">主题</FieldLabel>
              <textarea
                value={listToText(draft.script.themes)}
                onChange={(event) =>
                  updateScriptField("themes", listFromText(event.target.value))
                }
                className="mt-2 h-20 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600"
              />
            </div>

            <div className="mt-6">
              <FieldLabel>场景目录</FieldLabel>
              <div className="mt-2 space-y-2">
                {draft.scenes.map((scene, index) => (
                  <button
                    key={scene.scene_id}
                    type="button"
                    onClick={() => setSelectedSceneIndex(index)}
                    className={`w-full rounded-lg border px-3 py-3 text-left text-sm transition ${
                      index === selectedSceneIndex
                        ? "border-teal-600 bg-white text-slate-950 shadow-sm"
                        : "border-transparent bg-transparent text-slate-600 hover:bg-white"
                    }`}
                  >
                    <span className="block font-semibold">
                      场景 {index + 1}
                    </span>
                    <span className="mt-1 block truncate">{scene.title}</span>
                    <span className="mt-1 block truncate text-xs text-slate-400">
                      {getLocationName(draft, scene.location_id)} · {scene.time}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto bg-[#fbfaf6] p-4 sm:p-6">
            {selectedScene ? (
              <div className="mx-auto max-w-4xl space-y-6">
                <section className="rounded-lg bg-white px-6 py-8 shadow-sm sm:px-10">
                  <p className="text-center text-sm font-semibold text-slate-500">
                    场景 {selectedSceneIndex + 1}
                  </p>
                  <input
                    value={selectedScene.title}
                    onChange={(event) =>
                      updateSceneField("title", event.target.value)
                    }
                    className="mt-2 w-full border-0 bg-transparent text-center text-3xl font-semibold text-slate-950 outline-none"
                  />

                  <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
                      地点：{getLocationName(draft, selectedScene.location_id)}
                    </div>
                    <input
                      value={selectedScene.time}
                      onChange={(event) =>
                        updateSceneField("time", event.target.value)
                      }
                      className="rounded-lg border-0 bg-slate-50 px-3 py-2 text-sm text-slate-600 outline-none"
                    />
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
                      {selectedScene.characters
                        .map((characterId) =>
                          getCharacterName(draft, characterId),
                        )
                        .join("、") || "未标注人物"}
                    </div>
                  </div>

                  <div className="mt-8">
                    <FieldLabel
                      path={`scenes[${selectedSceneIndex}].screenplay_text`}
                    >
                      剧本正文
                    </FieldLabel>
                    <textarea
                      value={selectedScene.screenplay_text}
                      onChange={(event) =>
                        updateSceneField("screenplay_text", event.target.value)
                      }
                      className="mt-3 min-h-72 w-full resize-y border-0 bg-transparent text-base leading-8 text-slate-950 outline-none"
                      placeholder="这里是适合剧作家阅读和直接修改的完整场景正文。"
                    />
                  </div>
                </section>

                <section className="rounded-lg bg-white px-6 py-6 shadow-sm sm:px-10">
                  <FieldLabel path={`scenes[${selectedSceneIndex}].summary`}>
                    场景摘要
                  </FieldLabel>
                  <textarea
                    value={selectedScene.summary}
                    onChange={(event) =>
                      updateSceneField("summary", event.target.value)
                    }
                    className="mt-3 h-20 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600"
                  />
                </section>

                <section className="rounded-lg bg-white px-6 py-6 shadow-sm sm:px-10">
                  <h3 className="text-lg font-semibold text-slate-950">
                    画面与动作细节
                  </h3>
                  <div className="mt-4 grid gap-5 md:grid-cols-2">
                    <div>
                      <FieldLabel
                        path={`scenes[${selectedSceneIndex}].visual.atmosphere`}
                      >
                        画面氛围
                      </FieldLabel>
                      <textarea
                        value={selectedScene.visual.atmosphere}
                        onChange={(event) =>
                          updateVisualField("atmosphere", event.target.value)
                        }
                        className="mt-2 h-24 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <FieldLabel
                        path={`scenes[${selectedSceneIndex}].visual.key_props`}
                      >
                        关键道具
                      </FieldLabel>
                      <textarea
                        value={listToText(selectedScene.visual.key_props)}
                        onChange={(event) =>
                          updateVisualField(
                            "key_props",
                            listFromText(event.target.value),
                          )
                        }
                        className="mt-2 h-24 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>
                  <div className="mt-5">
                    <FieldLabel
                      path={`scenes[${selectedSceneIndex}].visual.sensory_details`}
                    >
                      感官细节
                    </FieldLabel>
                    <textarea
                      value={listToText(selectedScene.visual.sensory_details)}
                      onChange={(event) =>
                        updateVisualField(
                          "sensory_details",
                          listFromText(event.target.value),
                        )
                      }
                      className="mt-2 h-24 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600"
                    />
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel
                        path={`scenes[${selectedSceneIndex}].action_lines`}
                      >
                        动作线
                      </FieldLabel>
                      <button
                        type="button"
                        onClick={addActionLine}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        添加动作
                      </button>
                    </div>
                    <div className="mt-3 space-y-3">
                      {selectedScene.action_lines.length > 0 ? (
                        selectedScene.action_lines.map((line, index) => (
                          <div
                            key={`${selectedScene.scene_id}-action-${index}`}
                            className="flex gap-2"
                          >
                            <textarea
                              value={line}
                              onChange={(event) =>
                                updateActionLine(index, event.target.value)
                              }
                              className="min-h-16 flex-1 resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600"
                            />
                            <button
                              type="button"
                              onClick={() => removeActionLine(index)}
                              className="h-10 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                              删除
                            </button>
                          </div>
                        ))
                      ) : (
                        <EmptyState>当前场景还没有动作线。</EmptyState>
                      )}
                    </div>
                  </div>
                </section>

                <section className="rounded-lg bg-white px-6 py-6 shadow-sm sm:px-10">
                  <h3 className="text-lg font-semibold text-slate-950">
                    剧情节拍
                  </h3>
                  <div className="mt-4 space-y-5">
                    {selectedScene.beats.map((beat, beatIndex) => (
                      <div
                        key={beat.beat_id}
                        className="border-l-2 border-teal-100 pl-4"
                      >
                        <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                          <div>
                            <FieldLabel
                              path={`scenes[${selectedSceneIndex}].beats[${beatIndex}].type`}
                            >
                              类型
                            </FieldLabel>
                            <input
                              value={beat.type}
                              onChange={(event) =>
                                updateBeat(
                                  beatIndex,
                                  "type",
                                  event.target.value,
                                )
                              }
                              className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-teal-600"
                            />
                          </div>
                          <div>
                            <FieldLabel
                              path={`scenes[${selectedSceneIndex}].beats[${beatIndex}].content`}
                            >
                              节拍内容
                            </FieldLabel>
                            <textarea
                              value={beat.content}
                              onChange={(event) =>
                                updateBeat(
                                  beatIndex,
                                  "content",
                                  event.target.value,
                                )
                              }
                              className="mt-2 h-20 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between gap-3">
                            <FieldLabel
                              path={`scenes[${selectedSceneIndex}].beats[${beatIndex}].character_actions`}
                            >
                              人物动作
                            </FieldLabel>
                            <button
                              type="button"
                              onClick={() => addCharacterAction(beatIndex)}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              添加动作
                            </button>
                          </div>
                          <div className="mt-2 space-y-2">
                            {beat.character_actions.length > 0 ? (
                              beat.character_actions.map(
                                (characterAction, actionIndex) => (
                                  <div
                                    key={`${beat.beat_id}-character-action-${actionIndex}`}
                                    className="grid gap-2 sm:grid-cols-[120px_1fr_auto]"
                                  >
                                    <input
                                      value={characterAction.character_name}
                                      onChange={(event) =>
                                        updateCharacterAction(
                                          beatIndex,
                                          actionIndex,
                                          "character_name",
                                          event.target.value,
                                        )
                                      }
                                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-teal-600"
                                    />
                                    <input
                                      value={characterAction.action}
                                      onChange={(event) =>
                                        updateCharacterAction(
                                          beatIndex,
                                          actionIndex,
                                          "action",
                                          event.target.value,
                                        )
                                      }
                                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-teal-600"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeCharacterAction(
                                          beatIndex,
                                          actionIndex,
                                        )
                                      }
                                      className="rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >
                                      删除
                                    </button>
                                  </div>
                                ),
                              )
                            ) : (
                              <EmptyState>当前节拍没有人物动作。</EmptyState>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg bg-white px-6 py-6 shadow-sm sm:px-10">
                  <h3 className="text-lg font-semibold text-slate-950">
                    对白
                  </h3>
                  <div className="mt-4 space-y-6">
                    {selectedScene.dialogues.length > 0 ? (
                      selectedScene.dialogues.map((dialogue, dialogueIndex) => (
                        <div
                          key={`${dialogue.character_id}-${dialogueIndex}`}
                          className="grid gap-3 border-l-2 border-slate-100 pl-4"
                        >
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                              <FieldLabel
                                path={`scenes[${selectedSceneIndex}].dialogues[${dialogueIndex}].character_name`}
                              >
                                角色
                              </FieldLabel>
                              <input
                                value={dialogue.character_name}
                                onChange={(event) =>
                                  updateDialogue(
                                    dialogueIndex,
                                    "character_name",
                                    event.target.value,
                                  )
                                }
                                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-teal-600"
                              />
                            </div>
                            <div>
                              <FieldLabel
                                path={`scenes[${selectedSceneIndex}].dialogues[${dialogueIndex}].emotion`}
                              >
                                情绪
                              </FieldLabel>
                              <input
                                value={dialogue.emotion}
                                onChange={(event) =>
                                  updateDialogue(
                                    dialogueIndex,
                                    "emotion",
                                    event.target.value,
                                  )
                                }
                                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-teal-600"
                              />
                            </div>
                            <div>
                              <FieldLabel
                                path={`scenes[${selectedSceneIndex}].dialogues[${dialogueIndex}].action`}
                              >
                                说话动作
                              </FieldLabel>
                              <input
                                value={dialogue.action}
                                onChange={(event) =>
                                  updateDialogue(
                                    dialogueIndex,
                                    "action",
                                    event.target.value,
                                  )
                                }
                                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-teal-600"
                              />
                            </div>
                          </div>
                          <div>
                            <FieldLabel
                              path={`scenes[${selectedSceneIndex}].dialogues[${dialogueIndex}].line`}
                            >
                              台词
                            </FieldLabel>
                            <textarea
                              value={dialogue.line}
                              onChange={(event) =>
                                updateDialogue(
                                  dialogueIndex,
                                  "line",
                                  event.target.value,
                                )
                              }
                              className="mt-2 h-20 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState>当前场景没有对白。</EmptyState>
                    )}
                  </div>
                </section>

                <section className="rounded-lg bg-white px-6 py-6 shadow-sm sm:px-10">
                  <FieldLabel path={`scenes[${selectedSceneIndex}].transition`}>
                    转场
                  </FieldLabel>
                  <textarea
                    value={selectedScene.transition}
                    onChange={(event) =>
                      updateSceneField("transition", event.target.value)
                    }
                    className="mt-3 h-16 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600"
                  />
                </section>
              </div>
            ) : null}

            <div className="mx-auto mt-6 max-w-4xl rounded-lg bg-white p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {[
                  ["characters", "人物设定"],
                  ["locations", "地点设定"],
                  ["notes", "备注"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDetailTab(key as DetailTab)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                      detailTab === key
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {detailTab === "characters" ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {draft.characters.map((character, index) => (
                    <div
                      key={character.character_id}
                      className="rounded-lg bg-slate-50 p-4"
                    >
                      <FieldLabel path={`characters[${index}].name`}>
                        人物名
                      </FieldLabel>
                      <input
                        value={character.name}
                        onChange={(event) =>
                          updateCharacter(index, {
                            ...character,
                            name: event.target.value,
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-teal-600"
                      />
                      <FieldLabel path={`characters[${index}].role`}>
                        角色功能
                      </FieldLabel>
                      <input
                        value={character.role}
                        onChange={(event) =>
                          updateCharacter(index, {
                            ...character,
                            role: event.target.value,
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
                      />
                      <FieldLabel path={`characters[${index}].description`}>
                        描述
                      </FieldLabel>
                      <textarea
                        value={character.description}
                        onChange={(event) =>
                          updateCharacter(index, {
                            ...character,
                            description: event.target.value,
                          })
                        }
                        className="mt-2 h-16 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600"
                      />
                      <FieldLabel path={`characters[${index}].motivation`}>
                        动机
                      </FieldLabel>
                      <textarea
                        value={character.motivation}
                        onChange={(event) =>
                          updateCharacter(index, {
                            ...character,
                            motivation: event.target.value,
                          })
                        }
                        className="mt-2 h-16 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600"
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              {detailTab === "locations" ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {draft.locations.map((location, index) => (
                    <div
                      key={location.location_id}
                      className="rounded-lg bg-slate-50 p-4"
                    >
                      <FieldLabel path={`locations[${index}].name`}>
                        地点名
                      </FieldLabel>
                      <input
                        value={location.name}
                        onChange={(event) =>
                          updateLocation(index, {
                            ...location,
                            name: event.target.value,
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-teal-600"
                      />
                      <FieldLabel path={`locations[${index}].description`}>
                        地点描述
                      </FieldLabel>
                      <textarea
                        value={location.description}
                        onChange={(event) =>
                          updateLocation(index, {
                            ...location,
                            description: event.target.value,
                          })
                        }
                        className="mt-2 h-20 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600"
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              {detailTab === "notes" ? (
                <div className="mt-4">
                  <FieldLabel path="metadata.notes">备注</FieldLabel>
                  <textarea
                    value={draft.metadata.notes}
                    onChange={(event) => updateMetadataNotes(event.target.value)}
                    className="mt-2 h-24 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-teal-600"
                  />
                </div>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
