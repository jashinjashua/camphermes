import data from "../data/levels.json";

export type MetricId =
  | "pushups"
  | "situps"
  | "pullups"
  | "dips"
  | "burpees"
  | "plank"
  | "handstand"
  | "muscleups"
  | "statics"
  | "run";

export type AxisId = "push" | "pull" | "core" | "skill" | "endurance";

export interface MetricDef {
  label: string;
  question: string;
  unit: string;
  axis: AxisId;
  cap: number;
  step?: number;
  options?: string[];
}

export interface Requirement {
  text: string;
  metric?: string;
  min?: number;
}

export interface Rank {
  level: number | null;
  letter: string;
  name: string;
  image: string;
  locked?: boolean;
  requirements: Requirement[];
}

export type Answers = Record<MetricId, number>;

export interface QuestGap {
  label: string;
  text: string;
  current: string;
  needed: string;
}

export interface Result {
  letter: string;
  name: string;
  level: number;
  powerLevel: number;
  stats: Record<AxisId, number>;
  type: AxisId;
  typeLabel: string;
  nextLetter: string | null;
  nextName: string | null;
  gaps: QuestGap[];
}

export const METRIC_ORDER: MetricId[] = [
  "pushups",
  "situps",
  "pullups",
  "dips",
  "burpees",
  "plank",
  "handstand",
  "muscleups",
  "statics",
  "run",
];

export const AXIS_ORDER: AxisId[] = ["push", "pull", "core", "skill", "endurance"];

export const metrics = data.metrics as Record<MetricId, MetricDef>;
export const axes = data.axes as Record<AxisId, string>;
export const ranks = data.ranks as Rank[];
export const scoredRanks = ranks.filter((r) => !r.locked);
export const lockedRank = ranks.find((r) => r.locked) ?? null;
export const unranked = data.unranked as { letter: string; name: string };

// A ladder answer needs to be shown in words, a number just needs its unit.
export function formatValue(metric: MetricId, value: number): string {
  const def = metrics[metric];
  if (def.options) return def.options[Math.min(value, def.options.length - 1)] ?? String(value);
  if (def.unit === "seconds") return `${value} sec`;
  if (def.unit === "km") return `${value} km`;
  return `${value}`;
}

export function clampAnswer(metric: MetricId, value: number): number {
  const def = metrics[metric];
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(def.cap * (def.options ? 1 : 3), Math.round(value)));
}

export function emptyAnswers(): Answers {
  return Object.fromEntries(METRIC_ORDER.map((m) => [m, 0])) as Answers;
}

// A level passes on average satisfaction, not on meeting every minimum:
// each requirement contributes min(value / min, 1) and the level is awarded
// at 80%. One weak movement lowers the average instead of vetoing the class.
const PASS = 0.8;

export function levelSatisfaction(rank: Rank, answers: Answers): number {
  const mins = new Map<MetricId, number>();
  for (const req of rank.requirements) {
    if (!req.metric || req.min === undefined) continue;
    const m = req.metric as MetricId;
    mins.set(m, Math.max(mins.get(m) ?? 0, req.min));
  }
  if (!mins.size) return 0;
  let total = 0;
  for (const [m, min] of mins) {
    total += Math.min(answers[m] / min, 1);
  }
  return total / mins.size;
}

function achievedLevel(answers: Answers): number {
  let level = 0;
  for (const rank of scoredRanks) {
    if (levelSatisfaction(rank, answers) >= PASS) level = rank.level ?? level;
    else break;
  }
  return level;
}

// Power level: each metric contributes its progress toward the top defined
// threshold, capped at 125% so training past the ceiling still counts a bit.
// The formula is fixed so retests are comparable over time.
const POWER_SCALE = 500;
const POWER_OVERDRIVE = 1.25;

export function powerLevel(answers: Answers): number {
  let total = 0;
  for (const m of METRIC_ORDER) {
    const cap = metrics[m].cap;
    total += Math.min(answers[m] / cap, POWER_OVERDRIVE);
  }
  return Math.round(total * POWER_SCALE);
}

export function axisStats(answers: Answers): Record<AxisId, number> {
  const sums: Record<AxisId, { total: number; count: number }> = {
    push: { total: 0, count: 0 },
    pull: { total: 0, count: 0 },
    core: { total: 0, count: 0 },
    skill: { total: 0, count: 0 },
    endurance: { total: 0, count: 0 },
  };
  for (const m of METRIC_ORDER) {
    const def = metrics[m];
    sums[def.axis].total += Math.min(answers[m] / def.cap, 1);
    sums[def.axis].count += 1;
  }
  return Object.fromEntries(
    AXIS_ORDER.map((a) => [a, Math.round((sums[a].total / Math.max(sums[a].count, 1)) * 100)]),
  ) as Record<AxisId, number>;
}

export function dominantAxis(stats: Record<AxisId, number>): AxisId {
  let best: AxisId = AXIS_ORDER[0];
  for (const a of AXIS_ORDER) {
    if (stats[a] > stats[best]) best = a;
  }
  return best;
}

function rankForLevel(level: number): { letter: string; name: string } {
  if (level === 0) return unranked;
  const rank = scoredRanks.find((r) => r.level === level);
  return rank ?? unranked;
}

export function questGaps(answers: Answers, level: number): QuestGap[] {
  const next = scoredRanks.find((r) => r.level === level + 1);
  if (!next) return [];
  const gaps: QuestGap[] = [];
  const seen = new Set<string>();
  for (const req of next.requirements) {
    if (!req.metric || req.min === undefined) continue;
    const m = req.metric as MetricId;
    if (answers[m] >= req.min || seen.has(m)) continue;
    seen.add(m);
    // Ladder metrics read as a quest goal on their own ("10 handstand
    // push-ups in a row"); a "current / needed" pair would be two sentences.
    const ladder = Boolean(metrics[m].options);
    gaps.push({
      label: metrics[m].label,
      text: req.text,
      current: ladder ? "" : formatValue(m, answers[m]),
      needed: formatValue(m, req.min),
    });
  }
  return gaps;
}

export function score(answers: Answers): Result {
  const level = achievedLevel(answers);
  const { letter, name } = rankForLevel(level);
  const next = scoredRanks.find((r) => r.level === level + 1);
  const stats = axisStats(answers);
  const type = dominantAxis(stats);
  return {
    letter,
    name,
    level,
    powerLevel: powerLevel(answers),
    stats,
    type,
    typeLabel: `${axes[type]} type`,
    nextLetter: next?.letter ?? null,
    nextName: next?.name ?? null,
    gaps: questGaps(answers, level),
  };
}
