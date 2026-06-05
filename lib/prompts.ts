export function buildScriptGenerationPrompt(novelText: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `你是一名专业编剧和结构化数据转换助手。

你的任务是把 3 个章节以上的中文小说文本改编为结构化剧本 YAML 初稿。

必须严格遵守以下输出约束：
- 只输出 YAML
- 不要输出 Markdown 代码块
- 不要输出解释
- 不要在 YAML 前后添加任何额外文字
- 必须使用 UTF-8 中文内容
- 字段名必须使用英文 snake_case
- YAML 必须能被标准 YAML 解析器解析`;

  const userPrompt = `请将下面的小说文本改编为结构化剧本 YAML。

YAML 顶层结构必须包含：

script:
  title:
  source_type:
  language:
  logline:
  themes:
chapters:
  - chapter_id:
    title:
    summary:
characters:
  - character_id:
    name:
    role:
    description:
    motivation:
    relationships:
locations:
  - location_id:
    name:
    description:
scenes:
  - scene_id:
    chapter_id:
    title:
    location_id:
    time:
    summary:
    characters:
    beats:
      - beat_id:
        type:
        content:
    dialogues:
      - character_id:
        character_name:
        emotion:
        line:
    transition:
metadata:
  schema_version:
  generated_by:
  notes:

生成规则：
- chapter_id 使用 chapter_001、chapter_002 这种格式
- character_id 使用 char_001、char_002 这种格式
- location_id 使用 loc_001、loc_002 这种格式
- scene_id 使用 scene_001、scene_002 这种格式
- beat_id 使用 beat_001、beat_002 这种格式
- 每个章节至少生成 1 个 scene
- 每个 scene 至少包含 2 个 beats
- 每个 scene 尽量包含 dialogue；如果原文没有明确对白，可以根据剧情合理改写
- 不要改变原小说核心剧情
- 可以适度压缩叙述
- 不要凭空增加与主线无关的新角色、新地点或新事件
- characters 字段中要列出主要角色
- locations 字段中要列出主要场景地点
- metadata.schema_version 固定为 "1.0.0"
- metadata.generated_by 使用 "llm"
- 如果输入小说过长，仍然尽力输出较短但完整的 YAML 初稿

小说文本：

${novelText}`;

  return {
    systemPrompt,
    userPrompt,
  };
}
