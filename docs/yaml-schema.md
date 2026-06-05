# Novel2Script YAML Schema 设计文档

本文档定义 Novel2Script 当前阶段使用的剧本 YAML Schema，并说明字段结构、校验规则与设计取舍。当前版本为 `1.1.0`。

## Schema 设计目标

- 将小说改编结果结构化，避免只得到一段不可编辑的纯文本剧本。
- 让作者可以继续编辑，把 AI 生成结果作为可打磨的剧本初稿。
- 保留章节来源，方便追溯场景来自原小说的哪一章。
- 保留足够多的细节，降低后续漫剧、分镜或视频改编时 AI 凭空补内容的风险。
- 支持人物、地点、场景、画面、动作、节拍、对白和转场等核心元素。
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

这样既能让作者快速看懂结构，也能让后续功能拥有足够细的素材。

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
| `chapters[].chapter_id` | string | 是 | 章节 ID，例如 `chapter_001` |
| `chapters[].title` | string | 是 | 章节标题 |
| `chapters[].summary` | string | 是 | 章节摘要 |
| `characters` | array | 是 | 主要角色列表，至少 1 项 |
| `characters[].character_id` | string | 是 | 角色 ID，例如 `char_001` |
| `characters[].name` | string | 是 | 角色名称 |
| `characters[].role` | string | 是 | 角色功能或身份 |
| `characters[].description` | string | 是 | 角色描述 |
| `characters[].motivation` | string | 是 | 角色动机 |
| `characters[].relationships` | array | 是 | 角色关系说明 |
| `locations` | array | 是 | 主要地点列表，至少 1 项 |
| `locations[].location_id` | string | 是 | 地点 ID，例如 `loc_001` |
| `locations[].name` | string | 是 | 地点名称 |
| `locations[].description` | string | 是 | 地点描述 |
| `scenes` | array | 是 | 剧本场景列表，至少 3 项 |
| `scenes[].scene_id` | string | 是 | 场景 ID，例如 `scene_001` |
| `scenes[].chapter_id` | string | 是 | 场景来源章节 ID |
| `scenes[].title` | string | 是 | 场景标题 |
| `scenes[].location_id` | string | 是 | 场景地点 ID |
| `scenes[].time` | string | 是 | 场景时间 |
| `scenes[].summary` | string | 是 | 场景摘要 |
| `scenes[].characters` | array | 是 | 出场角色 ID 列表 |
| `scenes[].visual` | object | 是 | 画面细节 |
| `scenes[].visual.atmosphere` | string | 是 | 光线、情绪和画面气质 |
| `scenes[].visual.key_props` | array | 是 | 关键道具列表，可为空 |
| `scenes[].visual.sensory_details` | array | 是 | 声音、气味、触感、光影等感官细节 |
| `scenes[].action_lines` | array | 是 | 场景动作线，至少 1 项 |
| `scenes[].beats` | array | 是 | 剧情节拍列表 |
| `scenes[].beats[].beat_id` | string | 是 | 节拍 ID，例如 `beat_001` |
| `scenes[].beats[].type` | string | 是 | 节拍类型，例如 `action` 或 `dialogue` |
| `scenes[].beats[].content` | string | 是 | 节拍内容 |
| `scenes[].beats[].character_actions` | array | 是 | 当前节拍中的人物动作列表 |
| `scenes[].beats[].character_actions[].character_id` | string | 是 | 动作所属角色 ID |
| `scenes[].beats[].character_actions[].character_name` | string | 是 | 动作所属角色名称 |
| `scenes[].beats[].character_actions[].action` | string | 是 | 具体动作 |
| `scenes[].dialogues` | array | 是 | 场景对白列表，可为空数组 |
| `scenes[].dialogues[].character_id` | string | 是 | 说话角色 ID |
| `scenes[].dialogues[].character_name` | string | 是 | 说话角色名称 |
| `scenes[].dialogues[].emotion` | string | 是 | 说话情绪 |
| `scenes[].dialogues[].line` | string | 是 | 台词 |
| `scenes[].dialogues[].action` | string | 是 | 说话时的动作或表情 |
| `scenes[].transition` | string | 是 | 场景转场或结尾提示 |
| `scenes[].screenplay_text` | string | 是 | 面向剧作家阅读和修改的完整场景正文 |
| `metadata` | object | 是 | 元信息 |
| `metadata.schema_version` | string | 是 | 当前固定为 `"1.1.0"` |
| `metadata.generated_by` | string | 是 | 生成来源，例如 `llm` |
| `metadata.notes` | string | 是 | 备注 |

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

## 示例

完整示例见：[../examples/sample-script.yaml](../examples/sample-script.yaml)

## 剧本修改窗口与 YAML 同步

剧本修改窗口不是独立文档，而是当前 YAML 解析后的结构化对象视图。用户在窗口中修改后，系统会更新对应字段并重新导出 YAML。

典型映射关系：

- 剧本正文 -> `scenes[].screenplay_text`
- 画面氛围 -> `scenes[].visual.atmosphere`
- 关键道具 -> `scenes[].visual.key_props`
- 感官细节 -> `scenes[].visual.sensory_details`
- 动作线 -> `scenes[].action_lines`
- 节拍内容 -> `scenes[].beats[].content`
- 人物动作 -> `scenes[].beats[].character_actions`
- 对白动作 -> `scenes[].dialogues[].action`
- 台词 -> `scenes[].dialogues[].line`

这个设计让 YAML 保持机器可处理，同时让作者能在更自然的创作界面中修改内容。
