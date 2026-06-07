"use client";

import { useState } from "react";
import { SceneCardEditor } from "@/components/SceneCardEditor";
import type { ValidationIssue } from "@/lib/schema";
import type {
  Character,
  Location,
  ScriptDocument,
  Scene,
} from "@/lib/scriptDocument";
import { getCharacterName, getLocationName } from "@/lib/scriptDocument";
import { scriptDocumentToYaml } from "@/lib/scriptDocument";

type ScriptPreviewProps = {
  document: ScriptDocument;
  onChange: (nextDocument: ScriptDocument) => void;
  onGenerateYaml: () => void;
};

type ValidationState = {
  status: "idle" | "valid" | "invalid";
  issues: ValidationIssue[];
  message: string;
};

function splitListText(value: string) {
  return value
    .split(/[，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinListText(value: string[]) {
  return value.join("、");
}

function updateByIndex<T>(items: T[], index: number, nextItem: T) {
  return items.map((item, itemIndex) => (itemIndex === index ? nextItem : item));
}

function getChapterScenes(document: ScriptDocument) {
  const knownChapterIds = new Set(
    document.chapters.map((chapter) => chapter.chapter_id),
  );
  const grouped = document.chapters.map((chapter) => ({
    chapter,
    scenes: document.scenes
      .map((scene, sceneIndex) => ({ scene, sceneIndex }))
      .filter(({ scene }) => scene.chapter_id === chapter.chapter_id),
  }));
  const unassignedScenes = document.scenes
    .map((scene, sceneIndex) => ({ scene, sceneIndex }))
    .filter(({ scene }) => !knownChapterIds.has(scene.chapter_id));

  if (unassignedScenes.length === 0) {
    return grouped;
  }

  return [
    ...grouped,
    {
      chapter: {
        chapter_id: "__unassigned",
        title: "未归入章节",
        summary: "这些场景还没有匹配到章节。",
      },
      scenes: unassignedScenes,
    },
  ];
}

const quietInput =
  "mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-teal-600 focus:bg-teal-50/40";
const quietTextarea =
  "mt-2 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal leading-6 outline-none transition focus:border-teal-600 focus:bg-teal-50/40";

export function ScriptPreview({
  document,
  onChange,
  onGenerateYaml,
}: ScriptPreviewProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({
    status: "idle",
    issues: [],
    message: "",
  });

  function updateScriptField<K extends keyof ScriptDocument["script"]>(
    key: K,
    value: ScriptDocument["script"][K],
  ) {
    onChange({
      ...document,
      script: {
        ...document.script,
        [key]: value,
      },
    });
  }

  function updateMetadataNotes(notes: string) {
    onChange({
      ...document,
      metadata: {
        ...document.metadata,
        notes,
      },
    });
  }

  function updateCharacter(index: number, nextCharacter: Character) {
    onChange({
      ...document,
      characters: updateByIndex(document.characters, index, nextCharacter),
    });
  }

  function updateLocation(index: number, nextLocation: Location) {
    onChange({
      ...document,
      locations: updateByIndex(document.locations, index, nextLocation),
    });
  }

  function updateScene(index: number, nextScene: Scene) {
    onChange({
      ...document,
      scenes: updateByIndex(document.scenes, index, nextScene),
    });
  }

  async function handleValidateSchema() {
    setIsValidating(true);
    setValidation({
      status: "idle",
      issues: [],
      message: "",
    });

    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          yamlText: scriptDocumentToYaml(document),
        }),
      });
      const data = (await response.json()) as {
        valid?: boolean;
        issues?: ValidationIssue[];
      };
      const issues = data.issues || [];

      if (data.valid) {
        setValidation({
          status: "valid",
          issues: [],
          message: "Schema 校验通过，当前修改稿可以生成 YAML。",
        });
      } else {
        setValidation({
          status: "invalid",
          issues,
          message: "Schema 校验未通过，请根据以下问题继续修改。",
        });
      }
    } catch {
      setValidation({
        status: "invalid",
        issues: [
          {
            path: "network",
            message: "校验请求失败，请稍后重试。",
          },
        ],
        message: "Schema 校验未通过，请根据以下问题继续修改。",
      });
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-[#fbfaf6] p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Script Draft
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            中文剧本修改页
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            这里先以编剧熟悉的连续场景正文展示。结构化字段会保留在折叠区中，确认后再生成 YAML。
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerateYaml}
          className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          生成 YAML
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h4 className="text-base font-semibold text-slate-950">剧本信息</h4>
        <div className="mt-4 grid gap-4">
          <label className="text-sm font-semibold text-slate-700">
            剧本标题
            <input
              value={document.script.title}
              onChange={(event) =>
                updateScriptField("title", event.target.value)
              }
              className={quietInput}
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            一句话梗概
            <textarea
              value={document.script.logline}
              onChange={(event) =>
                updateScriptField("logline", event.target.value)
              }
              className={`${quietTextarea} h-20`}
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            主题
            <input
              value={joinListText(document.script.themes)}
              onChange={(event) =>
                updateScriptField("themes", splitListText(event.target.value))
              }
              className={quietInput}
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            备注
            <textarea
              value={document.metadata.notes}
              onChange={(event) => updateMetadataNotes(event.target.value)}
              className={`${quietTextarea} h-20`}
            />
          </label>
        </div>
      </div>

      <details className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <summary className="cursor-pointer text-base font-semibold text-slate-950">
          人物与地点设定
        </summary>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section>
            <h4 className="text-sm font-semibold text-slate-700">人物</h4>
            <div className="mt-3 space-y-4">
              {document.characters.map((character, index) => (
                <div
                  key={character.character_id}
                  className="rounded-lg border border-slate-100 p-4"
                >
                  <label className="text-sm font-semibold text-slate-700">
                    人物
                    <input
                      value={character.name}
                      onChange={(event) =>
                        updateCharacter(index, {
                          ...character,
                          name: event.target.value,
                        })
                      }
                      className={quietInput}
                    />
                  </label>
                  <label className="mt-3 block text-sm font-semibold text-slate-700">
                    角色定位
                    <input
                      value={character.role}
                      onChange={(event) =>
                        updateCharacter(index, {
                          ...character,
                          role: event.target.value,
                        })
                      }
                      className={quietInput}
                    />
                  </label>
                  <label className="mt-3 block text-sm font-semibold text-slate-700">
                    描述
                    <textarea
                      value={character.description}
                      onChange={(event) =>
                        updateCharacter(index, {
                          ...character,
                          description: event.target.value,
                        })
                      }
                      className={`${quietTextarea} h-20`}
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-slate-700">地点</h4>
            <div className="mt-3 space-y-4">
              {document.locations.map((location, index) => (
                <div
                  key={location.location_id}
                  className="rounded-lg border border-slate-100 p-4"
                >
                  <label className="text-sm font-semibold text-slate-700">
                    地点
                    <input
                      value={location.name}
                      onChange={(event) =>
                        updateLocation(index, {
                          ...location,
                          name: event.target.value,
                        })
                      }
                      className={quietInput}
                    />
                  </label>
                  <label className="mt-3 block text-sm font-semibold text-slate-700">
                    描述
                    <textarea
                      value={location.description}
                      onChange={(event) =>
                        updateLocation(index, {
                          ...location,
                          description: event.target.value,
                        })
                      }
                      className={`${quietTextarea} h-24`}
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>
        </div>
      </details>

      <section className="mt-6 bg-white px-5 py-8 shadow-sm ring-1 ring-slate-200 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <input
            value={document.script.title}
            onChange={(event) => updateScriptField("title", event.target.value)}
            className="w-full rounded-md border-0 bg-transparent px-2 py-1 text-center text-3xl font-semibold text-slate-950 outline-none transition focus:bg-teal-50/60"
            aria-label="剧本标题"
          />
          <textarea
            value={document.script.logline}
            onChange={(event) =>
              updateScriptField("logline", event.target.value)
            }
            className="mx-auto mt-3 min-h-16 w-full max-w-3xl resize-y rounded-md border-0 bg-transparent px-2 py-2 text-center text-base leading-8 text-slate-600 outline-none transition focus:bg-teal-50/60"
            aria-label="剧本梗概"
          />
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          {getChapterScenes(document).map(({ chapter, scenes }) => (
            <article
              key={chapter.chapter_id}
              className="min-h-[70vh] border-t border-slate-200 py-10 first:border-t-0 first:pt-0"
            >
              <header className="mb-10">
                <p className="text-sm font-semibold tracking-wide text-teal-700">
                  {chapter.chapter_id}
                </p>
                <h4 className="mt-2 text-3xl font-semibold text-slate-950">
                  {chapter.title}
                </h4>
                <p className="mt-4 text-base leading-8 text-slate-600">
                  {chapter.summary}
                </p>
              </header>

              {scenes.map(({ scene, sceneIndex }) => (
                <SceneCardEditor
                  key={scene.scene_id}
                  scene={scene}
                  sceneIndex={sceneIndex}
                  characterOptions={document.characters}
                  locationName={getLocationName(document, scene.location_id)}
                  characterNames={scene.characters.map((characterId) =>
                    getCharacterName(document, characterId),
                  )}
                  onChange={(nextScene) => updateScene(sceneIndex, nextScene)}
                />
              ))}
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-4xl border-t border-slate-200 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-base font-semibold text-slate-950">
                完成修改
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                在这里直接生成 YAML 或检查当前稿件是否符合 Schema。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onGenerateYaml}
                className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                生成 YAML
              </button>
              <button
                type="button"
                onClick={handleValidateSchema}
                disabled={isValidating}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isValidating ? "正在校验..." : "Schema 校验"}
              </button>
            </div>
          </div>

          {validation.message ? (
            <div
              className={`mt-4 rounded-lg border p-4 text-sm ${
                validation.status === "valid"
                  ? "border-teal-200 bg-teal-50 text-teal-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <p className="font-semibold">{validation.message}</p>
              {validation.issues.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {validation.issues.map((issue, index) => (
                    <li
                      key={`${issue.path}-${index}`}
                      className="rounded-md bg-white/70 px-3 py-2"
                    >
                      <span className="font-mono text-xs">{issue.path}</span>
                      <span className="mx-2">-</span>
                      <span>{issue.message}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </section>
  );
}
