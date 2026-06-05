import { NovelInput } from "@/components/NovelInput";
import { SectionHeading } from "@/components/SectionHeading";
import { APP_NAME, CORE_FLOW } from "@/lib/constants";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-slate-200 bg-[#fbfaf6]">
        <div className="mx-auto flex min-h-[62vh] w-full max-w-6xl flex-col justify-center px-6 py-16 sm:px-8 lg:px-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-teal-700">
            AI Novel to Script
          </p>
          <h1 className="text-5xl font-bold text-slate-950 sm:text-6xl">
            {APP_NAME}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            一个 AI 小说转剧本工具，帮助作者把三章以上的小说文本转换为结构化剧本 YAML，快速获得可编辑、可继续打磨的剧本初稿。
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <SectionHeading
            eyebrow="Workflow"
            title="核心流程"
            description="本 PR 先搭建清晰的 Demo 骨架，后续会逐步接入小说解析、AI 改编、Schema 校验与导出能力。"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {CORE_FLOW.map((step, index) => (
              <div
                key={step}
                className="rounded-lg border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-slate-950">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f3ea]">
        <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Start"
            title="开始使用"
            description="粘贴三章以上小说文本，先完成章节检测。后续版本会在此基础上接入 AI 改编、YAML 生成和导出能力。"
          />
          <NovelInput />
        </div>
      </section>
    </main>
  );
}
