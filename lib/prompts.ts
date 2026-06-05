export function buildScriptGenerationPrompt(novelText: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `你是一名专业编剧、漫剧改编策划和结构化数据转换助手。
你的任务是把 3 个章节以上的中文小说文本改编为结构化剧本 YAML 初稿。

必须严格遵守以下输出约束：
- 只输出 YAML
- 不要输出 Markdown 代码块
- 不要输出解释
- 不要在 YAML 前后添加任何额外文字
- 必须使用 UTF-8 中文内容
- 字段名必须使用英文 snake_case
- YAML 必须能被标准 YAML 解析器解析
- 不要只输出大纲，必须保留可继续改成漫剧、分镜和对白稿的细节
- 优先保留小说中的关键道具、场面细节、角色动作、视觉氛围、对白语气和悬念信息`;

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
    visual:
      atmosphere:
      key_props:
      sensory_details:
    action_lines:
      - ...
    beats:
      - beat_id:
        type:
        content:
        character_actions:
          - character_id:
            character_name:
            action:
    dialogues:
      - character_id:
        character_name:
        emotion:
        line:
        action:
    transition:
    screenplay_text:
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
- 每个 scene 至少包含 4 个 beats
- 每个 scene 至少包含 3 条 action_lines，用于保留画面、动作、走位和场面细节
- visual.atmosphere 必须描述光线、情绪或画面气质
- visual.key_props 必须列出关键道具，可为空数组，但优先从原文提取
- visual.sensory_details 必须列出声音、气味、触感、光影等感官细节，可合理压缩
- beats[].character_actions 用于记录该节拍中人物具体做了什么，不要只写心理判断
- dialogues[].action 用于记录角色说话时的动作、表情或停顿
- screenplay_text 必须是面向剧作家阅读的完整场景正文，包含场面描写、动作、对白和转场，不少于 120 个中文字符
- 不要改变原小说核心剧情
- 不要凭空增加与主线无关的新角色、新地点或新事件
- 可以合理扩写原文暗示出的动作、氛围和对白，但必须服务于原剧情
- characters 字段中要列出主要角色
- locations 字段中要列出主要场景地点
- metadata.schema_version 固定为 "1.1.0"
- metadata.generated_by 使用 "llm"
- 如果输入小说较长，优先保留主线、人物动机、关键道具、场景氛围和对白细节

小说文本：
${novelText}`;

  return {
    systemPrompt,
    userPrompt,
  };
}
