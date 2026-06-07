# Novel2Script

Novel2Script 是一个面向小说作者的 AI 小说转剧本工具。它将 3 个章节以上的小说文本改编成适合编剧继续修改的中文剧本稿，并可进一步生成符合 Schema 的结构化 YAML。

## 项目简介

小说改编剧本时，作者通常需要整理章节、人物、地点、场景、画面、动作、对白、音效、情绪和转场。Novel2Script 将这个流程拆成清晰的产品链路：

1. 输入或粘贴三章以上小说文本。
2. 自动检测章节数量。
3. 调用 OpenAI-compatible API 生成结构化剧本数据。
4. 先展示适合编剧修改的中文剧本稿。
5. 作者修改后，再生成 YAML 数据层。
6. 对 YAML 进行 Schema 校验并导出。

项目不把 AI 输出当成最终稿，而是把它变成可继续打磨、可校验、可导出的剧本初稿。

## 核心功能

- 多章节小说输入与章节数量检测
- 示例小说一键加载
- AI 生成细节版结构化剧本数据
- 中文剧本修改页
- 修改内容同步到 YAML
- YAML 在线编辑
- YAML Schema 校验
- YAML 导出

## 产品流程

```mermaid
flowchart LR
  A["小说文本输入"] --> B["章节检测"]
  B --> C["AI 生成结构化剧本数据"]
  C --> D["中文剧本稿修改"]
  D --> E["生成 YAML"]
  E --> F["Schema 校验"]
  F --> G["导出 YAML"]
```

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- js-yaml
- OpenAI-compatible API
- Node.js

## 目录结构

```text
app/          Next.js 页面与 API Route
components/   前端 UI 组件
lib/          章节检测、LLM 调用、Prompt、YAML 解析和 Schema 校验
docs/         Schema 文档、Demo 指南和提交检查清单
examples/     示例小说输入和示例 YAML 输出
```

## 本地启动

1. 安装依赖：

```bash
npm install
```

2. 复制环境变量文件：

```bash
cp .env.example .env.local
```

3. 配置模型 API：

```text
OPENAI_API_KEY=你的 API Key
OPENAI_BASE_URL=OpenAI-compatible API 地址，可选
OPENAI_MODEL=模型名称，可选
```

4. 启动项目：

```bash
npm run dev
```

5. 打开浏览器访问：

```text
http://localhost:3000
```

## 环境变量说明

`OPENAI_API_KEY`  
模型服务 API Key，不可提交到仓库。

`OPENAI_BASE_URL`  
OpenAI-compatible API 地址。未配置时默认使用 `https://api.openai.com/v1`。

`OPENAI_MODEL`  
模型名称。未配置时默认使用 `gpt-4o-mini`。

## 使用方式

1. 打开首页。
2. 点击“加载示例小说”或粘贴自己的小说文本。
3. 确认检测到 3 个章节以上。
4. 点击“生成可修改剧本”。
5. 在中文剧本修改页修改标题、梗概、人物、地点和每一场的画面、动作、台词、音效、情绪、节拍与转场。
6. 点击“生成 YAML”。
7. 校验 YAML。
8. 校验通过后导出 YAML。

## YAML Schema 文档

完整文档见：[docs/yaml-schema.md](docs/yaml-schema.md)

当前 Schema 顶层结构：

- `script`
- `chapters`
- `characters`
- `locations`
- `scenes`
- `metadata`

## 示例文件

- [examples/sample-novel.md](examples/sample-novel.md)：原创三章节小说示例。
- [examples/sample-script.yaml](examples/sample-script.yaml)：符合 Schema `1.1.0` 的细节版剧本 YAML 示例。

## Demo 视频

Demo 视频链接：待补充

最终提交前需要替换为可访问的视频链接，例如 bilibili、网盘或其他公开可访问平台。

## 持续交付与 PR 记录

本项目按功能逐步提交，避免最后一次性导入代码。主要开发记录包括：

- 小说输入与章节检测
- AI YAML 生成流程
- YAML 校验、编辑和导出
- Demo 文档与提交检查清单
- 细节版剧本 Schema 与中文剧本修改页
- 分章节连续剧本编辑器

当前主要 PR：

- [PR #2 Add chaptered screenplay editor](https://github.com/maybebebee/Novel2Script/pull/2)

每个 PR 描述应包含功能描述、实现思路和测试方式，方便评委核对功能变更与代码提交记录。

## 原创功能说明

本项目原创实现部分包括：

- 小说章节检测逻辑
- 细节版剧本 YAML Schema 设计
- AI 小说转剧本 Prompt
- YAML 结构校验逻辑
- 中文剧本稿与 YAML 数据层同步
- YAML 编辑、校验和导出流程
- 示例小说与示例 YAML

## 当前开发进度

项目已经完成：

- 输入 3 章以上小说
- 章节数量检测
- 示例小说加载
- AI 生成结构化剧本数据
- 细节版 Schema `1.1.0`
- 中文剧本修改页
- 修改后生成 YAML
- YAML 数据层编辑
- YAML Schema 校验
- YAML 导出

## 后续计划

- 长篇小说分块处理
- 更精准的中文剧本稿反向解析
- 多版本剧本管理
- 分镜脚本生成
- 漫剧画面提示词生成
- 多模型切换
