import { useEffect, useState } from "preact/hooks";
import type { Result } from "../../lib/scoring";
import { lockedRank } from "../../lib/scoring";
import Radar from "./Radar";

interface Props {
  result: Result;
  animate?: boolean;
}

function useCountUp(target: number, enabled: boolean): number {
  const [value, setValue] = useState(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    let frame = 0;
    const started = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled]);

  return value;
}

export default function ResultCard({ result, animate = true }: Props) {
  const power = useCountUp(result.powerLevel, animate);
  const rankClass = `rank-${result.letter.toLowerCase()}`;

  return (
    <div class={`result-card ${rankClass} ${animate ? "is-animated" : ""}`}>
      <div class="result-bar">
        <span>HERO RANK</span>
        <span>CAMP HERMES</span>
      </div>

      <div class="result-head">
        <div class="result-letter" aria-label={`Class ${result.letter}`}>
          {result.letter}
        </div>
        <div class="result-title">
          <p class="result-name">{result.name}</p>
          <p class="result-type">{result.typeLabel}</p>
          <p class="result-power">
            POWER LEVEL <strong>{power.toLocaleString("en-US")}</strong>
          </p>
        </div>
      </div>

      <div class="result-radar">
        <Radar stats={result.stats} />
      </div>

      <div class="result-quest">
        {result.nextLetter ? (
          <>
            <p class="quest-title">
              QUEST → {result.nextLetter}-CLASS · {result.nextName}
            </p>
            <ul>
              {result.gaps.slice(0, 4).map((gap) => (
                <li key={gap.label}>
                  <span>{gap.label}</span>
                  <span>{gap.current ? `${gap.current} / ${gap.needed}` : gap.needed}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p class="quest-title quest-locked">
            NEXT → {lockedRank?.letter ?? "X"}-CLASS · ??? The test cannot take you there.
          </p>
        )}
      </div>

      <div class="result-foot">camphermes.com/rank</div>
    </div>
  );
}
