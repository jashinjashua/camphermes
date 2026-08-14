import { describe, expect, it } from "vitest";
import {
  METRIC_ORDER,
  type Answers,
  axisStats,
  dominantAxis,
  emptyAnswers,
  powerLevel,
  score,
  scoredRanks,
} from "../lib/scoring";
import { decodeAnswers, encodeAnswers } from "../lib/result-url";

// Exact minimums for each level, cumulative over the levels below it.
const levelAnswers: Record<number, Answers> = {
  1: { pushups: 10, situps: 20, pullups: 5, dips: 10, burpees: 10, plank: 20, handstand: 0, muscleups: 0, statics: 0, run: 1 },
  2: { pushups: 30, situps: 50, pullups: 10, dips: 20, burpees: 30, plank: 60, handstand: 1, muscleups: 0, statics: 0, run: 3 },
  3: { pushups: 60, situps: 80, pullups: 15, dips: 30, burpees: 50, plank: 180, handstand: 2, muscleups: 1, statics: 0, run: 5 },
  4: { pushups: 100, situps: 80, pullups: 15, dips: 30, burpees: 50, plank: 300, handstand: 3, muscleups: 2, statics: 1, run: 10 },
  5: { pushups: 100, situps: 80, pullups: 15, dips: 30, burpees: 50, plank: 300, handstand: 4, muscleups: 3, statics: 2, run: 20 },
};

const letters: Record<number, string> = { 1: "D", 2: "C", 3: "B", 4: "A", 5: "S" };

describe("rank boundaries", () => {
  it("awards no rank below the Level 1 minimums", () => {
    const result = score(emptyAnswers());
    expect(result.level).toBe(0);
    expect(result.letter).toBe("E");
    expect(result.name).toBe("Civilian");
    expect(result.nextLetter).toBe("D");
  });

  for (const level of [1, 2, 3, 4, 5]) {
    it(`awards ${letters[level]} at the exact Level ${level} minimums`, () => {
      const result = score(levelAnswers[level]);
      expect(result.level).toBe(level);
      expect(result.letter).toBe(letters[level]);
    });

    it(`drops below ${letters[level]} when one requirement is one short`, () => {
      const short = { ...levelAnswers[level] };
      const rank = scoredRanks.find((r) => r.level === level)!;
      const req = rank.requirements.find((r) => r.metric && r.min)!;
      short[req.metric as keyof Answers] = (req.min ?? 1) - 1;
      expect(score(short).level).toBeLessThan(level);
    });
  }

  it("caps at S even far above the Level 5 minimums", () => {
    const monster: Answers = { ...levelAnswers[5], pushups: 300, situps: 200, run: 42 };
    const result = score(monster);
    expect(result.letter).toBe("S");
    expect(result.nextLetter).toBeNull();
    expect(result.gaps).toEqual([]);
  });

  it("ranks are cumulative: meeting Level 4 numbers without Level 1 dips is unranked", () => {
    const gap: Answers = { ...levelAnswers[4], dips: 0 };
    expect(score(gap).level).toBe(0);
  });
});

describe("power level", () => {
  it("is zero for empty answers", () => {
    expect(powerLevel(emptyAnswers())).toBe(0);
  });

  it("is 5000 at exactly the top thresholds", () => {
    expect(powerLevel(levelAnswers[5])).toBe(5000);
  });

  it("never decreases when any input increases (monotonicity)", () => {
    for (const metric of METRIC_ORDER) {
      const base = { ...levelAnswers[2] };
      const more = { ...base, [metric]: base[metric] + 1 };
      expect(powerLevel(more)).toBeGreaterThanOrEqual(powerLevel(base));
    }
  });

  it("caps each metric at 125% so one stat cannot run away", () => {
    const a = { ...emptyAnswers(), pushups: 125 };
    const b = { ...emptyAnswers(), pushups: 300 };
    expect(powerLevel(a)).toBe(powerLevel(b));
  });
});

describe("stats and type", () => {
  it("stays within 0-100 per axis", () => {
    for (const answers of Object.values(levelAnswers)) {
      for (const value of Object.values(axisStats(answers))) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });

  it("picks the dominant axis", () => {
    const runner: Answers = { ...emptyAnswers(), run: 20, burpees: 50 };
    expect(dominantAxis(axisStats(runner))).toBe("endurance");
  });

  it("breaks ties deterministically in axis order", () => {
    expect(dominantAxis(axisStats(emptyAnswers()))).toBe("push");
  });
});

describe("quest gaps", () => {
  it("lists what blocks the next rank with current vs needed", () => {
    const result = score(levelAnswers[2]);
    expect(result.nextLetter).toBe("B");
    const pushups = result.gaps.find((g) => g.label === "Push-ups");
    expect(pushups).toBeDefined();
    expect(pushups!.current).toBe("30");
    expect(pushups!.needed).toBe("60");
  });

  it("lists each blocking metric once even if the next level repeats it", () => {
    const result = score(levelAnswers[4]);
    const staticGaps = result.gaps.filter((g) => g.label === "Statics");
    expect(staticGaps).toHaveLength(1);
  });
});

describe("result url", () => {
  it("round-trips answers", () => {
    for (const answers of Object.values(levelAnswers)) {
      expect(decodeAnswers(`?${encodeAnswers(answers)}`)).toEqual(answers);
    }
  });

  it("rejects malformed input", () => {
    expect(decodeAnswers("")).toBeNull();
    expect(decodeAnswers("?v=1")).toBeNull();
    expect(decodeAnswers("?v=2&a=1.2.3")).toBeNull();
    expect(decodeAnswers("?v=1&a=1.2.3")).toBeNull();
    expect(decodeAnswers("?v=1&a=1.2.3.4.5.6.7.8.9.x")).toBeNull();
    expect(decodeAnswers("?v=1&a=-1.2.3.4.5.6.7.8.9.10")).toBeNull();
  });

  it("clamps oversized values instead of rejecting them", () => {
    const decoded = decodeAnswers("?v=1&a=9999.9999.9999.9999.9999.9999.9999.9999.9999.9999");
    expect(decoded).not.toBeNull();
    expect(decoded!.handstand).toBe(4);
    expect(decoded!.statics).toBe(2);
    expect(decoded!.pushups).toBeLessThanOrEqual(300);
  });
});
