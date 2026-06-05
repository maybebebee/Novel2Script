"use client";

import { useMemo, useState } from "react";
import { detectChapters } from "@/lib/chapter";

const sampleNovel = `第一章 雨夜来信

林晚在旧书店打烊前收到一封没有署名的信。雨水沿着玻璃窗往下爬，街灯把店里的书架照得像一排沉默的人。信纸很旧，边缘有被火烤过的痕迹，上面只有一句话：明天日出前，不要打开阁楼的门。她抬头看向通往二楼的窄梯，忽然发现那扇多年没有动过的门缝里，正落下一点蓝色的灰。

第二章 阁楼脚步

午夜过后，书店的挂钟停在十二点十七分。阁楼上传来缓慢的脚步声，每一步都像踩在林晚的心口。她握着手电站在楼梯口，听见门后有人轻轻翻页。她想起外祖父临终前说过，阁楼里锁着一本不能写完的剧本。可现在，那本剧本似乎正在自己写下新的台词，甚至写出了她下一秒会说的话。

第三章 未写完的剧本

她最终推开了门。阁楼中央的桌上放着一本黑色封面的剧本，第一页写着她刚刚说过的话，最后一页却仍是空白。窗外雨声突然消失，整座书店像被按下暂停键。林晚看见剧本旁边摆着一枚旧钥匙，钥匙下面压着一张照片。照片里，她站在陌生舞台中央，而观众席第一排坐着一个和她长得一模一样的人。`;

function countWords(text: string) {
  return Array.from(text.replace(/\s/g, "")).length;
}

export function NovelInput() {
  const [text, setText] = useState("");
  const [yamlResult, setYamlResult] = useState("");
  const [usageNote, setUsageNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const chapterResult = useMemo(() => detectChapters(text), [text]);
  const wordCount = useMemo(() => countWords(text), [text]);
  const hasEnoughChapters = chapterResult.count >= 3;

  const detectionMessage =
    chapterResult.count === 0
      ? "未检测到章节标题，请使用‘第一章’、‘第1章’或‘Chapter 1’等格式"
      : hasEnoughChapters
        ? `已检测到 ${chapterResult.count} 个章节，可以开始生成剧本`
        : `当前检测到 ${chapterResult.count} 个章节，请至少输入 3 个章节以上的小说文本`;

  async function handleGenerateClick() {
    if (!hasEnoughChapters || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setUsageNote("");
    setYamlResult("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          novelText: text,
        }),
      });
      const data = (await response.json()) as {
        yaml?: string;
        usageNote?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "生成失败，请稍后重试。");
      }

      if (!data.yaml) {
        throw new Error("生成结果为空，请稍后重试。");
      }

      setYamlResult(data.yaml);
      setUsageNote(data.usageNote || "");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "生成剧本 YAML 失败，请稍后重试。",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleTextChange(value: string) {
    setText(value);
    setErrorMessage("");
    setUsageNote("");
  }

  function handleClearText() {
    setText("");
    setYamlResult("");
    setUsageNote("");
    setErrorMessage("");
  }

  function handleLoadSample() {
    setText(sampleNovel);
    setYamlResult("");
    setUsageNote("");
    setErrorMessage("");
  }

  return (
    <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label
            htmlFor="novel-text"
            className="block text-sm font-medium text-slate-700"
          >
            小说文本输入区
          </label>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            粘贴包含章节标题的小说文本，系统会自动检测章节数量。
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleClearText}
            disabled={!text}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            清空文本
          </button>
          <button
            type="button"
            onClick={handleLoadSample}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            加载示例小说
          </button>
        </div>
      </div>

      <textarea
        id="novel-text"
        value={text}
        onChange={(event) => handleTextChange(event.target.value)}
        className="mt-5 h-72 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-700/15"
        placeholder="请粘贴三章以上小说文本，例如：第一章 雨夜来信、第二章 阁楼脚步、第三章 未写完的剧本..."
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-500">当前输入字数</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">
            {wordCount}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-500">检测到章节数</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">
            {chapterResult.count}
          </p>
        </div>
      </div>

      <div
        className={`mt-4 rounded-lg border p-4 text-sm font-medium ${
          hasEnoughChapters
            ? "border-teal-200 bg-teal-50 text-teal-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        {detectionMessage}
      </div>

      {chapterResult.count > 0 ? (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-slate-700">章节预览</h3>
          <ol className="mt-3 space-y-2">
            {chapterResult.chapters.map((chapter) => (
              <li
                key={`${chapter.index}-${chapter.start}`}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
              >
                {chapter.index}. {chapter.title}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleGenerateClick}
          disabled={!hasEnoughChapters || isGenerating}
          className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          {isGenerating ? "正在生成剧本..." : "生成剧本 YAML"}
        </button>
        {isGenerating ? (
          <p className="text-sm font-medium text-slate-700">
            AI 正在分析章节、人物、场景和对白，请稍候。
          </p>
        ) : null}
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      {yamlResult ? (
        <div className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                生成的剧本 YAML
              </h3>
              {usageNote ? (
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {usageNote}
                </p>
              ) : null}
            </div>
          </div>
          <textarea
            value={yamlResult}
            onChange={(event) => setYamlResult(event.target.value)}
            className="mt-4 h-96 w-full resize-y rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-50 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            spellCheck={false}
          />
        </div>
      ) : null}
    </div>
  );
}
