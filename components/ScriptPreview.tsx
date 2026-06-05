"use client";

import { useEffect, useState } from "react";
import type { Character, Location, ScriptDocument, Scene } from "@/lib/scriptDocument";
import { getCharacterName, getLocationName } from "@/lib/scriptDocument";

type ScriptPreviewProps = {
  document: ScriptDocument;
  onApply: (nextDocument: ScriptDocument) => void;
  onClose: () => void;
};

function cloneDocument(document: ScriptDocument): ScriptDocument {
  return JSON.parse(JSON.stringify(document)) as ScriptDocument;
}

export function ScriptPreview({ document, onApply, onClose }: ScriptPreviewProps) {
  const [draft, setDraft] = useState<ScriptDocument>(() =>
    cloneDocument(document),
  );

  useEffect(() => {
    setDraft(cloneDocument(document));
  }, [document]);

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

  function updateScene(index: number, nextScene: Scene) {
    setDraft((current) => ({
      ...current,
      scenes: current.scenes.map((scene, sceneIndex) =>
        sceneIndex === index ? nextScene : scene,
      ),
    }));
  }

  function updateBeat(
    sceneIndex: number,
    beatIndex: number,
    key: keyof Scene["beats"][number],
    value: string,
  ) {
    const scene = draft.scenes[sceneIndex];

    updateScene(sceneIndex, {
      ...scene,
      beats: scene.beats.map((beat, index) =>
        index === beatIndex
          ? {
              ...beat,
              [key]: value,
            }
          : beat,
      ),
    });
  }

  function updateDialogue(
    sceneIndex: number,
    dialogueIndex: number,
    key: keyof Scene["dialogues"][number],
    value: string,
  ) {
    const scene = draft.scenes[sceneIndex];

    updateScene(sceneIndex, {
      ...scene,
      dialogues: scene.dialogues.map((dialogue, index) =>
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
      <div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-lg bg-[#fbfaf6] shadow-2xl">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Script Draft
            </p>
            <h2 className="text-xl font-semibold text-slate-950">
              修改剧本
            </h2>
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

        <div className="overflow-y-auto px-5 py-6">
          <article className="mx-auto max-w-3xl bg-white px-6 py-8 text-slate-950 shadow-sm sm:px-10">
            <input
              value={draft.script.title}
              onChange={(event) =>
                updateScriptField("title", event.target.value)
              }
              className="w-full border-0 bg-transparent text-center text-3xl font-semibold outline-none"
            />

            <textarea
              value={draft.script.logline}
              onChange={(event) =>
                updateScriptField("logline", event.target.value)
              }
              className="mx-auto mt-5 block h-24 w-full resize-y border-0 bg-transparent text-center text-base leading-7 text-slate-700 outline-none"
            />

            <input
              value={draft.script.themes.join("、")}
              onChange={(event) =>
                updateScriptField(
                  "themes",
                  event.target.value
                    .split(/[、,，]/)
                    .map((theme) => theme.trim())
                    .filter(Boolean),
                )
              }
              className="mt-2 w-full border-0 bg-transparent text-center text-sm text-slate-500 outline-none"
            />

            <section className="mt-10 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold tracking-wide text-slate-500">
                主要人物
              </h3>
              <div className="mt-4 space-y-5">
                {draft.characters.map((character, index) => (
                  <div key={character.character_id}>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        value={character.name}
                        onChange={(event) =>
                          updateCharacter(index, {
                            ...character,
                            name: event.target.value,
                          })
                        }
                        className="flex-1 border-0 bg-transparent text-base font-semibold outline-none"
                      />
                      <input
                        value={character.role}
                        onChange={(event) =>
                          updateCharacter(index, {
                            ...character,
                            role: event.target.value,
                          })
                        }
                        className="flex-1 border-0 bg-transparent text-sm text-slate-500 outline-none"
                      />
                    </div>
                    <textarea
                      value={character.description}
                      onChange={(event) =>
                        updateCharacter(index, {
                          ...character,
                          description: event.target.value,
                        })
                      }
                      className="mt-1 h-16 w-full resize-y border-0 bg-transparent text-sm leading-6 outline-none"
                    />
                    <textarea
                      value={character.motivation}
                      onChange={(event) =>
                        updateCharacter(index, {
                          ...character,
                          motivation: event.target.value,
                        })
                      }
                      className="mt-1 h-14 w-full resize-y border-0 bg-transparent text-sm leading-6 text-slate-600 outline-none"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold tracking-wide text-slate-500">
                主要地点
              </h3>
              <div className="mt-4 space-y-4">
                {draft.locations.map((location, index) => (
                  <div key={location.location_id}>
                    <input
                      value={location.name}
                      onChange={(event) =>
                        updateLocation(index, {
                          ...location,
                          name: event.target.value,
                        })
                      }
                      className="w-full border-0 bg-transparent text-base font-semibold outline-none"
                    />
                    <textarea
                      value={location.description}
                      onChange={(event) =>
                        updateLocation(index, {
                          ...location,
                          description: event.target.value,
                        })
                      }
                      className="mt-1 h-16 w-full resize-y border-0 bg-transparent text-sm leading-6 text-slate-600 outline-none"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10 space-y-10">
              {draft.scenes.map((scene, sceneIndex) => (
                <div key={scene.scene_id} className="border-t border-slate-200 pt-8">
                  <p className="text-center text-sm font-semibold text-slate-500">
                    场景 {sceneIndex + 1}
                  </p>
                  <input
                    value={scene.title}
                    onChange={(event) =>
                      updateScene(sceneIndex, {
                        ...scene,
                        title: event.target.value,
                      })
                    }
                    className="mt-2 w-full border-0 bg-transparent text-center text-2xl font-semibold outline-none"
                  />
                  <p className="mt-2 text-center text-sm text-slate-500">
                    地点：{getLocationName(draft, scene.location_id)}　时间：
                    <input
                      value={scene.time}
                      onChange={(event) =>
                        updateScene(sceneIndex, {
                          ...scene,
                          time: event.target.value,
                        })
                      }
                      className="inline-block w-40 border-0 bg-transparent text-center outline-none"
                    />
                  </p>
                  <p className="mt-2 text-center text-sm text-slate-500">
                    出场人物：
                    {scene.characters
                      .map((characterId) => getCharacterName(draft, characterId))
                      .join("、") || "未标注"}
                  </p>

                  <textarea
                    value={scene.summary}
                    onChange={(event) =>
                      updateScene(sceneIndex, {
                        ...scene,
                        summary: event.target.value,
                      })
                    }
                    className="mt-5 h-20 w-full resize-y border-0 bg-transparent text-base leading-7 outline-none"
                  />

                  <div className="mt-5 space-y-4">
                    {scene.beats.map((beat, beatIndex) => (
                      <div key={beat.beat_id}>
                        <input
                          value={beat.type}
                          onChange={(event) =>
                            updateBeat(
                              sceneIndex,
                              beatIndex,
                              "type",
                              event.target.value,
                            )
                          }
                          className="w-full border-0 bg-transparent text-sm font-semibold uppercase tracking-wide text-slate-500 outline-none"
                        />
                        <textarea
                          value={beat.content}
                          onChange={(event) =>
                            updateBeat(
                              sceneIndex,
                              beatIndex,
                              "content",
                              event.target.value,
                            )
                          }
                          className="mt-1 h-16 w-full resize-y border-0 bg-transparent text-base leading-7 outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-4">
                    {scene.dialogues.map((dialogue, dialogueIndex) => (
                      <div key={`${dialogue.character_id}-${dialogueIndex}`}>
                        <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-center">
                          <input
                            value={dialogue.character_name}
                            onChange={(event) =>
                              updateDialogue(
                                sceneIndex,
                                dialogueIndex,
                                "character_name",
                                event.target.value,
                              )
                            }
                            className="border-0 bg-transparent text-center font-semibold outline-none"
                          />
                          <input
                            value={dialogue.emotion}
                            onChange={(event) =>
                              updateDialogue(
                                sceneIndex,
                                dialogueIndex,
                                "emotion",
                                event.target.value,
                              )
                            }
                            className="border-0 bg-transparent text-center text-sm text-slate-500 outline-none"
                          />
                        </div>
                        <textarea
                          value={dialogue.line}
                          onChange={(event) =>
                            updateDialogue(
                              sceneIndex,
                              dialogueIndex,
                              "line",
                              event.target.value,
                            )
                          }
                          className="mx-auto mt-1 block h-16 w-full resize-y border-0 bg-transparent text-center text-base leading-7 outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <textarea
                    value={scene.transition}
                    onChange={(event) =>
                      updateScene(sceneIndex, {
                        ...scene,
                        transition: event.target.value,
                      })
                    }
                    className="mt-6 h-14 w-full resize-y border-0 bg-transparent text-center text-sm italic text-slate-500 outline-none"
                  />
                </div>
              ))}
            </section>

            <section className="mt-10 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold tracking-wide text-slate-500">
                备注
              </h3>
              <textarea
                value={draft.metadata.notes}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    metadata: {
                      ...current.metadata,
                      notes: event.target.value,
                    },
                  }))
                }
                className="mt-2 h-20 w-full resize-y border-0 bg-transparent text-sm leading-6 outline-none"
              />
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
