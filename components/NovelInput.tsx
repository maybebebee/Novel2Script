"use client";

import { useMemo, useState } from "react";
import { detectChapters } from "@/lib/chapter";

const sampleNovel = `第一章：雨夜来信

林晚在旧书店打烊前收到一封没有署名的信。信里只有一句话：明天日出前，不要打开阁楼的门。

第二章：阁楼脚步

午夜过后，阁楼上传来缓慢的脚步声。林晚握着手电站在楼梯口，发现门缝下渗出一线微弱的蓝光。

第三章：未写完的剧本

她最终推开了门。阁楼中央的桌上放着一本剧本，第一页写着她刚刚说过的话，而最后一页仍是空白。`;

function countWords(text: string) {
  return Array.from(text.replace(/\s/g, "")).length;
}

export function NovelInput() {
  const [text, setText] = useState("");
  const chapterResult = useMemo(() => detectChapters(text), [text]);
  const wordCount = useMemo(() => countWords(text), [text]);
  const hasEnoughChapters = chapterResult.count >= 3;

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
            onClick={() => setText("")}
            disabled={!text}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            清空文本
          </button>
          <button
            type="button"
            onClick={() => setText(sampleNovel)}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            加载示例小说
          </button>
        </div>
      </div>

      <textarea
        id="novel-text"
        value={text}
        onChange={(event) => setText(event.target.value)}
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
        {hasEnoughChapters
          ? `已检测到 ${chapterResult.count} 个章节，可以开始生成剧本`
          : "请至少输入 3 个章节以上的小说文本"}
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
    </div>
  );
}
