# Novel2Script YAML Schema 设计文档

本文档定义 Novel2Script 当前阶段使用的剧本 YAML Schema，并说明字段结构、校验规则与设计原因。当前版本为 `1.1.0`。

## Schema 设计目标

- 将小说改编结果结构化，避免只得到一段不可维护的纯文本剧本。
- 让作者可以先在中文剧本稿中修改，再生成 YAML 数据。
- 保留章节来源，方便追溯每个场景来自原小说的哪一章。
- 保留足够多的细节，降低后续漫剧、分镜或视频改编时 AI 凭空补内容的风险。
- 支持人物、地点、场景、画面、动作、节拍、对白、音效、情绪语气和转场等核心元素。
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

## 为什么不只生成普通剧本文本

普通剧本文本适合人类阅读，但不适合作为后续工具链的数据源。小说改编剧本的核心难点不是“生成一段看起来像剧本的文字”，而是把小说中的信息拆成可以继续编辑、校验和复用的创作资产：

- 人物需要单独抽取，方便统一角色名称和关系。
- 地点需要单独抽取，方便场景管理和后续拍摄/分镜规划。
- 章节需要保留，方便作者知道每个场景来自原文哪一部分。
- 场景需要包含画面、动作、对白、音效、情绪语气和转场，方便继续打磨。
- YAML 需要能被程序校验，避免 AI 输出缺字段、错缩进或结构漂移。

因此 Novel2Script 选择先生成结构化 YAML，再把 YAML 映射成中文剧本修改页。这样既保留作者熟悉的文本编辑体验，也保留机器可处理的数据结构。

## 字段设计原因

| 结构 | 设计原因 |
| --- | --- |
| `script` | 保存标题、语言、主题和一句话梗概，作为剧本全局信息。 |
| `chapters` | 保留原小说章节来源，确保改编过程可追溯。 |
| `characters` | 将人物从正文中独立出来，方便后续统一称呼、角色动机和关系。 |
| `locations` | 将地点资产化，方便场景复用、分镜规划和制作管理。 |
| `scenes` | 剧本的核心生产单位，每个场景都能单独修改、校验和导出。 |
| `visual` | 保存画面氛围、关键道具和感官信息，降低后续视觉生成时的随意补写。 |
| `action_lines` | 保存可表演、可分镜的动作，不让场景只停留在心理描写层面。 |
| `beats` | 将场景拆成剧情节拍，方便控制节奏和检查冲突推进。 |
| `dialogues` | 保存角色对白、单句台词情绪和说话动作，方便作者继续润色台词。 |
| `transition` | 保存场景之间的连接方式，帮助剧本保持连续性。 |
| `metadata` | 保存 Schema 版本和生成来源，方便后续升级和兼容。 |

## 面向后续创作链路

这个 Schema 不只服务当前页面展示，也为后续扩展留出空间：

- 分镜：可以基于 `scenes[].visual`、`action_lines` 和 `beats` 生成镜头列表。
- 漫剧：可以基于 `characters`、`locations`、`visual.key_props` 和 `dialogues` 生成画面提示词。
- 短剧拍摄：可以基于 `locations`、`characters`、`action_lines` 和 `transition` 形成拍摄拆解。
- 版本管理：可以按 `scene_id` 或 `chapter_id` 对局部场景做增量修改。
- 质量检查：可以通过 Schema 校验发现缺少对白、动作、场景或必要元信息的问题。

## 设计取舍

- 当前没有引入 JSON Schema 库，而是使用手写校验逻辑。这样便于在比赛项目中展示字段规则和错误提示，也减少依赖复杂度。
- 当前要求至少 3 个章节和 3 个场景，是为了贴合题目“3 个章节以上”的输入要求，并确保输出不是过短示例。
- `screenplay_text` 与结构化字段会有一定重复，这是有意设计：前者服务人类快速阅读，后者服务机器处理和后续生成。
- `dialogues` 允许为空数组，因为有些场景可能以动作或环境铺垫为主；但字段本身必须存在，保证数据结构稳定。
- `beats[].character_actions` 允许为空数组，因为某些节拍可能是环境变化或悬念揭示；但保留字段可以让后续补写动作。

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

中文剧本修改页不是独立文档，而是当前 YAML 解析后的结构化对象视图。面向作者的主编辑区采用连续场景正文，保证动作、台词和节拍能像真正剧本一样连贯阅读；结构化字段则放在折叠区，方便需要时查看或微调 YAML 映射。用户在修改页中编辑后，系统会更新对应字段，再重新生成 YAML。

典型映射关系：

- 剧本标题 -> `script.title`
- 一句话梗概 -> `script.logline`
- 场景正文 -> `scenes[].screenplay_text`
- 场景正文中的动作行 -> `scenes[].action_lines`
- 场景正文中的对白行 -> `scenes[].dialogues[].line`
- 场景正文中的非对白段落 -> `scenes[].beats[].content`
- 画面 -> `scenes[].visual.atmosphere`
- 音效 -> `scenes[].visual.sensory_details`
- 场景摘要 -> `scenes[].summary`
- 台词情绪 -> `scenes[].dialogues[].emotion`
- 场景气质 -> `scenes[].visual.atmosphere`
- 转场 -> `scenes[].transition`

这个设计让 YAML 保持机器可处理，同时让作者能在更自然的创作界面中修改内容。
