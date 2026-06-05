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
            一个 AI 小说转剧本工具，帮助作者把三章以上小说文本转换为结构化剧本
            YAML，获得可编辑、可校验、可导出的细节版剧本初稿。
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <SectionHeading
            eyebrow="Workflow"
            title="核心流程"
            description="从章节检测到 AI 生成，再到 YAML 编辑、剧本预览修改、Schema 校验和导出，评委可以在首页完成端到端体验。"
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
            description="粘贴三章以上小说文本，或直接加载示例小说。生成后会先展示 YAML，再通过“修改剧本”窗口以更接近剧作家的方式编辑正文、画面细节、动作和对白。"
          />
          <NovelInput />
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 sm:px-8 md:grid-cols-3 lg:px-10">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Schema 文档
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              YAML Schema 设计文档位于 docs/yaml-schema.md，包含字段说明、校验规则和设计取舍。
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              示例小说
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              原创三章节示例小说位于 examples/sample-novel.md，可用于快速演示输入流程。
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              示例输出
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              符合 Schema 的细节版剧本 YAML 示例位于 examples/sample-script.yaml，可用于校验流程演示。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
