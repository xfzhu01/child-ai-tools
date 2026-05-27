export type AssessmentLevel = {
  level: number;
  title: string;
  description: string;
  /** Text to type — covers assigned keyboard zones. */
  text: string;
};

/** 3 assessment stages covering most keyboard keys (home → top/numbers → full). */
export const ASSESSMENT_LEVELS: AssessmentLevel[] = [
  {
    level: 1,
    title: "主键盘位",
    description: "覆盖 A–L 与空格",
    text: "asdf jkl asdf jkl ff jj dd kk ll",
  },
  {
    level: 2,
    title: "上排与数字",
    description: "覆盖 Q–P、数字 0–9",
    text: "quick wind type 12345 over purple sky 67890",
  },
  {
    level: 3,
    title: "全键盘覆盖",
    description: "字母、数字、空格、逗号与句号",
    text: "the 5 quick foxes jump, play 9 games well.",
  },
];

export const ASSESSMENT_LEVEL_COUNT = ASSESSMENT_LEVELS.length;
