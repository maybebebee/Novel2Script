# Novel2Script YAML Schema 设计文档

本文档定义 Novel2Script 当前阶段使用的剧本 YAML Schema，并说明字段结构、校验规则与设计取舍。该 Schema 面向比赛 Demo：既要让 AI 输出可被程序校验，也要让小说作者能够继续人工编辑、修改和导出。

## Schema 设计目标

- 将小说改编结果结构化，避免只得到一段不可编辑的纯文本剧本。
- 方便作者继续编辑，把 AI 生成结果作为可打磨的剧本初稿。
- 保留章节来源，方便追溯场景来自原小说的哪一章。
- 支持人物、地点、场景、剧情节拍、对白等剧本核心元素。
- 让 AI 输出结果可校验、可复用、可导出。

## 顶层结构

Novel2Script YAML 的顶层必须是对象，并包含以下字段：

- `script`
- `chapters`
- `characters`
- `locations`
- `scenes`
- `metadata`

## 顶层字段设计原因

### script

`script` 用于保存剧本全局信息，例如标题、来源类型、语言、一句话梗概和主题。它帮助作者快速理解剧本方向，也为后续封面页、项目摘要或 Demo 展示提供稳定入口。

### chapters

`chapters` 用于保留小说原始章节来源。小说转剧本不是凭空创作，场景应该能够追溯到原文结构。保留章节信息可以降低改编时丢失来源的风险，也方便作者按章节检查 AI 是否遗漏内容。

### characters

`characters` 用于独立管理人物信息，包括身份、动机、关系和描述。把人物从场景中抽出，可以让作者后续统一修改角色设定，避免同一角色在多个场景中出现不一致表达。

### locations

`locations` 用于独立管理场景地点。地点信息独立后，剧本可以进一步扩展到分镜、拍摄计划、舞台调度或场景成本估算。

### scenes

`scenes` 是剧本主体结构。每个 scene 对应一个可表演、可编辑的戏剧场景，并通过 `chapter_id` 和 `location_id` 关联原章节和地点。

### beats

`beats` 用于保存剧情节拍。它避免 AI 只生成对白而丢失叙事推进，让作者能看到每个场景内部发生了哪些动作、转折或信息揭示。

### dialogues

`dialogues` 用于保存角色对白。小说中的叙述可以在这里转化为更接近剧本的表达，并保留说话人、情绪和台词。

### metadata

`metadata` 用于保存 `schema_version`、生成模型和备注信息，方便版本管理、结果复现和后续兼容。

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
| `scenes[].beats` | array | 是 | 剧情节拍列表 |
| `scenes[].beats[].beat_id` | string | 是 | 节拍 ID，例如 `beat_001` |
| `scenes[].beats[].type` | string | 是 | 节拍类型，例如 `action` 或 `dialogue` |
| `scenes[].beats[].content` | string | 是 | 节拍内容 |
| `scenes[].dialogues` | array | 是 | 场景对白列表，可为空数组 |
| `scenes[].dialogues[].character_id` | string | 是 | 说话角色 ID |
| `scenes[].dialogues[].character_name` | string | 是 | 说话角色名称 |
| `scenes[].dialogues[].emotion` | string | 是 | 说话情绪 |
| `scenes[].dialogues[].line` | string | 是 | 台词 |
| `scenes[].transition` | string | 是 | 场景转场或结尾提示 |
| `metadata` | object | 是 | 元信息 |
| `metadata.schema_version` | string | 是 | 当前固定为 `"1.0.0"` |
| `metadata.generated_by` | string | 是 | 生成来源，例如 `llm` |
| `metadata.notes` | string | 是 | 备注 |

## 校验规则

当前版本采用手写校验逻辑，目标是清晰、可解释、适合比赛评审理解。

- 顶层字段必须完整。
- `chapters` 至少 3 个。
- `characters` 至少 1 个。
- `locations` 至少 1 个。
- `scenes` 至少 3 个。
- 每个 chapter 必须包含 `chapter_id`、`title`、`summary`。
- 每个 character 必须包含 `character_id`、`name`、`role`、`description`、`motivation`、`relationships`。
- 每个 location 必须包含 `location_id`、`name`、`description`。
- 每个 scene 必须包含 `scene_id`、`chapter_id`、`title`、`location_id`、`time`、`summary`、`characters`、`beats`、`dialogues`、`transition`。
- 每个 beat 必须包含 `beat_id`、`type`、`content`。
- 每个 dialogue 必须包含 `character_id`、`character_name`、`emotion`、`line`。
- `metadata.schema_version` 当前必须是 `"1.0.0"`。
- 校验会尽量返回所有发现的问题，而不是遇到第一个问题就停止。

## 完整 YAML 示例

```yaml
script:
  title: 雨夜来信
  source_type: novel
  language: zh-CN
  logline: 旧书店继承人收到神秘来信，被迫打开尘封阁楼，发现一本正在书写她命运的剧本。
  themes:
    - 命运与选择
    - 记忆与秘密
chapters:
  - chapter_id: chapter_001
    title: 雨夜来信
    summary: 林晚在旧书店收到无名来信，信中警告她日出前不要打开阁楼的门。
  - chapter_id: chapter_002
    title: 阁楼脚步
    summary: 午夜后阁楼响起脚步声，林晚听见门后有人翻动外祖父留下的剧本。
  - chapter_id: chapter_003
    title: 未写完的剧本
    summary: 林晚推开阁楼门，看见剧本记录着她的言行，并发现一张诡异舞台照片。
characters:
  - character_id: char_001
    name: 林晚
    role: 主角
    description: 旧书店继承人，谨慎但无法抗拒真相。
    motivation: 查清外祖父留下的阁楼秘密。
    relationships:
      - 与外祖父有深厚情感连接
locations:
  - location_id: loc_001
    name: 旧书店
    description: 雨夜中的老书店，通往阁楼的窄梯藏在店铺深处。
scenes:
  - scene_id: scene_001
    chapter_id: chapter_001
    title: 无名来信
    location_id: loc_001
    time: 雨夜打烊前
    summary: 林晚收到警告信，并注意到阁楼门缝落下蓝色灰尘。
    characters:
      - char_001
    beats:
      - beat_id: beat_001
        type: action
        content: 林晚整理柜台时发现一封没有署名的旧信。
      - beat_id: beat_002
        type: dialogue
        content: 林晚读出信上的警告。
    dialogues:
      - character_id: char_001
        character_name: 林晚
        emotion: 不安
        line: 明天日出前，不要打开阁楼的门？
    transition: 门缝中落下一点蓝色的灰。
  - scene_id: scene_002
    chapter_id: chapter_002
    title: 门后的翻页声
    location_id: loc_001
    time: 午夜
    summary: 林晚听见阁楼脚步和翻页声。
    characters:
      - char_001
    beats:
      - beat_id: beat_003
        type: action
        content: 挂钟停在十二点十七分。
      - beat_id: beat_004
        type: dialogue
        content: 林晚低声质问门后的人。
    dialogues:
      - character_id: char_001
        character_name: 林晚
        emotion: 紧张
        line: 谁在里面？
    transition: 剧本似乎写下了她下一秒的话。
  - scene_id: scene_003
    chapter_id: chapter_003
    title: 空白末页
    location_id: loc_001
    time: 午夜后
    summary: 林晚发现剧本和一张显示另一个自己的舞台照片。
    characters:
      - char_001
    beats:
      - beat_id: beat_005
        type: action
        content: 林晚推开阁楼门。
      - beat_id: beat_006
        type: action
        content: 她看见照片中的另一个自己。
    dialogues: []
    transition: 书店外的雨声彻底消失。
metadata:
  schema_version: "1.0.0"
  generated_by: llm
  notes: 示例 YAML，仅用于展示 Novel2Script 目标输出结构。
```

## 设计取舍

## YAML 数据层与剧本修改窗口

Novel2Script 使用 YAML Schema 定义底层数据结构，但最终用户不一定需要直接理解所有 ID 字段。为了兼顾机器可处理性和作者可读性，项目在 YAML 数据层之上增加了剧本修改窗口。

- YAML Schema 负责定义底层数据结构，保证 `script`、`chapters`、`characters`、`locations`、`scenes`、`metadata` 等字段稳定可解析。
- 剧本修改窗口基于 YAML 渲染，把结构化数据转换成更接近作者阅读习惯的一页式剧本视图。
- 用户在剧本修改窗口中修改标题、人物、地点、场景摘要、剧情节拍或对白后，系统会在点击“应用修改到 YAML”时更新结构化对象并重新生成 YAML。
- 用户也可以直接编辑 YAML，并在点击“修改剧本”时用当前 YAML 打开修改窗口。

这个设计让 Novel2Script 同时服务两类需求：对机器而言，YAML 是可校验、可导出、可被后续工具处理的数据层；对作者而言，剧本修改窗口是更直观的创作和修改界面。

### 为什么使用 YAML，而不是纯文本剧本

纯文本剧本适合阅读，但不适合程序继续处理。Novel2Script 的目标不是一次性生成最终稿，而是生成可编辑、可校验、可导出的初稿。YAML 兼顾可读性和结构化，作者可以直接修改，程序也能解析和校验。

### 为什么保留 chapters

小说天然以章节组织。保留 `chapters` 可以让 AI 改编结果回到原文来源，方便作者检查每章是否被覆盖，也为后续按章节重新生成或局部修订留下空间。

### 为什么把 characters 和 locations 独立出来

人物和地点会跨多个场景重复出现。如果只写在 scene 里，后续修改容易不一致。独立 `characters` 和 `locations` 可以形成统一设定表，让剧本更接近专业创作流程。

### 为什么 scenes 是主体结构

剧本的核心是可表演的场景，而不是小说段落。`scenes` 让小说叙述变成一个个可编辑的戏剧单元，每个 scene 都可以继续扩写为分镜、对白或拍摄计划。

### 为什么需要 metadata

AI 生成内容会随模型、Prompt 和 Schema 版本变化。`metadata` 用于记录版本和生成来源，帮助未来做兼容、调试和结果复现。
