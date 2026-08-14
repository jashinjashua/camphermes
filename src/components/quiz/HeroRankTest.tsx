import { useEffect, useMemo, useState } from "preact/hooks";
import {
  METRIC_ORDER,
  type Answers,
  type MetricId,
  clampAnswer,
  emptyAnswers,
  metrics,
  score,
} from "../../lib/scoring";
import { loadResult, previousResult, saveResult } from "../../lib/storage";
import { pictogramSvg } from "../../lib/pictograms";
import ResultCard from "./ResultCard";
import ResultActions from "./ResultActions";

type Phase = "quiz" | "result";

interface Delta {
  power: number;
  rankedUp: boolean;
  fromLetter: string;
}

function NumberQuestion({
  metric,
  value,
  onChange,
}: {
  metric: MetricId;
  value: number;
  onChange: (v: number) => void;
}) {
  const def = metrics[metric];
  const step = def.step ?? 1;
  const set = (v: number) => onChange(clampAnswer(metric, v));

  return (
    <div class="q-number">
      <button type="button" class="q-step" onClick={() => set(value - step)} aria-label="Decrease">
        −
      </button>
      <div class="q-value">
        <input
          type="number"
          inputMode="numeric"
          min="0"
          value={value}
          onInput={(e) => set(Number((e.target as HTMLInputElement).value))}
          aria-label={def.question}
        />
        <span class="q-unit">{def.unit === "seconds" ? "sec" : def.unit}</span>
      </div>
      <button type="button" class="q-step" onClick={() => set(value + step)} aria-label="Increase">
        +
      </button>
    </div>
  );
}

function LadderQuestion({
  metric,
  value,
  onChange,
}: {
  metric: MetricId;
  value: number;
  onChange: (v: number) => void;
}) {
  const def = metrics[metric];
  return (
    <div class="q-ladder" role="radiogroup" aria-label={def.question}>
      {def.options?.map((option, i) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === i}
          class={`q-option ${value === i ? "is-selected" : ""}`}
          onClick={() => onChange(i)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default function HeroRankTest() {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [index, setIndex] = useState(0);
  const [delta, setDelta] = useState<Delta | null>(null);
  const [animate, setAnimate] = useState(true);

  // A previously saved result resumes as the card, never as question 1.
  useEffect(() => {
    const saved = loadResult();
    if (saved) {
      setAnswers(saved.answers);
      setAnimate(false);
      setPhase("result");
    }
  }, []);

  const metric = METRIC_ORDER[index];
  const def = metrics[metric];
  const result = useMemo(() => score(answers), [answers]);

  const finish = () => {
    const prev = loadResult();
    saveResult(answers);
    if (prev) {
      const prevScore = score(prev.answers);
      const next = score(answers);
      setDelta({
        power: next.powerLevel - prevScore.powerLevel,
        rankedUp: next.level > prevScore.level,
        fromLetter: prevScore.letter,
      });
    }
    setAnimate(true);
    setPhase("result");
    window.scrollTo({ top: 0 });
  };

  const retake = () => {
    setAnswers(emptyAnswers());
    setIndex(0);
    setDelta(null);
    setPhase("quiz");
  };

  const next = () => (index === METRIC_ORDER.length - 1 ? finish() : setIndex(index + 1));

  if (phase === "result") {
    return (
      <div class="test-result">
        {delta && (
          <div class={`delta-banner ${delta.rankedUp ? "is-rankup" : ""}`}>
            {delta.rankedUp
              ? `RANK UP! ${delta.fromLetter} → ${result.letter}`
              : `Power level ${delta.power >= 0 ? "+" : ""}${delta.power.toLocaleString("en-US")} since last test`}
          </div>
        )}
        <ResultCard result={result} animate={animate} />
        <ResultActions result={result} answers={answers} onRetake={retake} />
      </div>
    );
  }

  return (
    <div class="test-quiz">
      <div class="q-progress" aria-hidden="true">
        <div class="q-progress-fill" style={{ width: `${(index / METRIC_ORDER.length) * 100}%` }} />
      </div>
      <p class="q-count">
        {index + 1} / {METRIC_ORDER.length}
      </p>

      <div class="q-icon" dangerouslySetInnerHTML={{ __html: pictogramSvg(metric, 72) }} />
      <h1 class="q-question">{def.question}</h1>

      {def.options ? (
        <LadderQuestion metric={metric} value={answers[metric]} onChange={(v) => setAnswers({ ...answers, [metric]: v })} />
      ) : (
        <NumberQuestion metric={metric} value={answers[metric]} onChange={(v) => setAnswers({ ...answers, [metric]: v })} />
      )}

      <div class="q-nav">
        {index > 0 ? (
          <button type="button" class="btn btn-ghost" onClick={() => setIndex(index - 1)}>
            Back
          </button>
        ) : (
          <span />
        )}
        <button type="button" class="btn btn-primary" onClick={next}>
          {index === METRIC_ORDER.length - 1 ? "Reveal my rank" : "Next"}
        </button>
      </div>
    </div>
  );
}
