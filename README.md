# Novel2Script

Novel2Script 是一个 AI 小说转剧本工具，目标是帮助小说作者将三章以上的小说文本自动转换为结构化剧本 YAML，让作者获得可编辑、可继续打磨的剧本初稿。

## 核心功能规划

- 小说文本输入
- AI 剧本改编
- 结构化 YAML 生成
- YAML Schema 校验
- 剧本导出

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- 暂不接入数据库
- OpenAI-compatible Chat Completions API

## 本地启动方式

复制环境变量文件：

```bash
cp .env.example .env.local
```

填写自己的模型 API Key：

```text
OPENAI_API_KEY=你的模型 API Key
OPENAI_BASE_URL=OpenAI-compatible API 地址，可选
OPENAI_MODEL=模型名称，可选
```

安装依赖并启动：

```bash
npm install
npm run dev
```

启动后访问：

```text
http://localhost:3000
```

## 当前开发进度

- 已初始化基础项目结构
- 已完成 Demo 首页静态页面
- 已添加文档与示例占位
- 已添加环境变量示例文件
- 已完成小说文本输入
- 已完成章节数量检测
- 已完成示例小说加载
- 已完成生成按钮状态控制
- 已完成 AI 生成接口
- 已完成 OpenAI-compatible API 调用封装
- 已完成小说到剧本 YAML 的核心生成链路
- 已完成前端生成状态和结果展示

## 后续计划

- 设计剧本 YAML Schema
- 下一阶段将实现 YAML Schema 校验
- 下一阶段将实现 YAML 编辑和导出

## 原创功能说明

待补充。

## Demo 视频链接

待补充。

## YAML Schema 文档

待补充，后续将链接到 `docs/yaml-schema.md`。
