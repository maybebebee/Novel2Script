# Novel2Script YAML Schema 设计文档

本文档定义 Novel2Script 当前阶段使用的剧本 YAML Schema，并说明字段结构、校验规则与设计原因。当前版本为 `1.1.0`。

## Schema 设计目标

- 将小说改编结果结构化，避免只得到一段不可维护的纯文本剧本。
- 让作者可以先在中文剧本稿中修改，再生成 YAML 数据。
- 保留章节来源，方便追溯每个场景来自原小说的哪一章。
- 保留足够多的细节，降低后续漫剧、分镜或视频改编时 AI 凭空补内容的风险。
- 支持人物、地点、场景、画面、动作、节拍、对白、音效、情绪和转场等核心元素。
- 让 YAML 输出结果可校验、可复用、可导出。

## 顶层结构

Novel2Script YAML 的顶层必须是对象，并包含以下字段：

- `script`
- `chapters`
- `characters`
- `locations`
- `scenes`
- `metadata`

## 关键设计：大纲与细节都保留

如果只生成简单大纲，作者后续继续修改时会缺少场面、动作和对白依据；如果后续再让 AI 基于大纲生成漫剧或分镜，模型很容易自行补足细节，导致偏离原小说。因此 `1.1.0` 采用“大纲 + 细节资产”并存的结构：

- `summary` 用于快速理解章节或场景。
- `screenplay_text` 用于人类直接阅读和修改完整场景正文。
- `visual` 用于保存画面氛围、关键道具和感官细节。
- `action_lines` 用于保存可表演、可分镜的动作线。
- `beats[].character_actions` 用于保存节拍内人物具体动作。
- `dialogues[].action` 用于保存角色说话时的动作、表情或停顿。

## 字段说明

| 字段 | 类型 | 是否必填 | 说明 |
| --- | --- | --- | --- |
| `script` | object | 是 | 剧本全局信息 |
| `script.title` | string | 是 | 剧本标题 |
| `script.source_type` | string | 是 | 来源类型，当前通常为 `novel` |
| `script.language` | string | 是 | 语言，例如 `zh-CN` |
| `script.logline` | string | 是 | 一句话梗概 |
| `script.themes` | array | 是 | 主题列表 |
| `chapters` | array | 是 | 原小说章节摘要，至少 3 项 |
| `characters` | array | 是 | 主要角色列表，至少 1 项 |
| `locations` | array | 是 | 主要地点列表，至少 1 项 |
| `scenes` | array | 是 | 剧本场景列表，至少 3 项 |
| `metadata` | object | 是 | 元信息 |

## scenes 字段

每个 `scenes[]` 必须包含：

- `scene_id`
- `chapter_id`
- `title`
- `location_id`
- `time`
- `summary`
- `characters`
- `visual`
- `action_lines`
- `beats`
- `dialogues`
- `transition`
- `screenplay_text`

其中 `visual` 包含：

- `atmosphere`
- `key_props`
- `sensory_details`

## 校验规则

当前版本采用手写校验逻辑，目标是清晰、可解释、适合比赛评审理解。

- 顶层字段必须完整。
- `chapters` 至少 3 个。
- `characters` 至少 1 个。
- `locations` 至少 1 个。
- `scenes` 至少 3 个。
- 所有必填字符串字段必须是非空字符串。
- 所有数组字段必须是数组。
- `scenes[].visual` 必须存在。
- `scenes[].action_lines` 至少 1 项。
- `scenes[].beats[].character_actions` 必须存在，可为空数组。
- `scenes[].dialogues` 必须存在，可为空数组。
- `metadata.schema_version` 当前必须是 `"1.1.0"`。

## 中文剧本修改页与 YAML 同步

中文剧本修改页不是独立文档，而是当前 YAML 解析后的结构化对象视图。用户在修改页中编辑后，系统会更新对应字段，再重新生成 YAML。

典型映射关系：

- 剧本标题 -> `script.title`
- 一句话梗概 -> `script.logline`
- 画面 -> `scenes[].visual.atmosphere`
- 动作 -> `scenes[].action_lines`
- 台词 -> `scenes[].dialogues[].line`
- 音效 -> `scenes[].visual.sensory_details`
- 情绪 -> `scenes[].summary`
- 剧情节拍 -> `scenes[].beats[].content`
- 转场 -> `scenes[].transition`

这个设计让 YAML 保持机器可处理，同时让作者能在更自然的创作界面中修改内容。
