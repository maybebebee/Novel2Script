export type DetectedChapter = {
  index: number;
  title: string;
  start: number;
  end: number;
};

export type ChapterDetectionResult = {
  count: number;
  chapters: DetectedChapter[];
};

const CHAPTER_HEADING_PATTERN =
  /^(?:\s{0,3}#{1,6}\s*)?((?:第[\d一二三四五六七八九十百千万零两]+章)|(?:章节[\d一二三四五六七八九十百千万零两]+)|(?:Chapter\s+\d+))\s*[:：、.\-—]?\s*([^\r\n]*)$/gim;

export function detectChapters(text: string): ChapterDetectionResult {
  if (!text.trim()) {
    return {
      count: 0,
      chapters: [],
    };
  }

  const matches = Array.from(text.matchAll(CHAPTER_HEADING_PATTERN));

  if (matches.length === 0) {
    return {
      count: 0,
      chapters: [],
    };
  }

  const chapters = matches.map((match, position) => {
    const marker = match[1].trim();
    const subtitle = match[2].trim();
    const title = subtitle ? `${marker} ${subtitle}` : marker;
    const start = match.index ?? 0;
    const nextMatch = matches[position + 1];
    const end = nextMatch?.index ?? text.length;

    return {
      index: position + 1,
      title,
      start,
      end,
    };
  });

  return {
    count: chapters.length,
    chapters,
  };
}
