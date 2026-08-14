import { useMemo } from "preact/hooks";
import { score } from "../../lib/scoring";
import { decodeAnswers } from "../../lib/result-url";
import ResultCard from "./ResultCard";

// Renders a result shared by someone else. The URL always wins here: the
// viewer's own saved result never overrides a card a friend sent them.
export default function ResultViewer() {
  const answers = useMemo(
    () => (typeof location !== "undefined" ? decodeAnswers(location.search) : null),
    [],
  );

  if (!answers) {
    return (
      <div class="test-result">
        <p class="viewer-missing">This link is missing its result.</p>
        <a href="/rank/" class="btn btn-primary">
          Take the Hero Rank Test
        </a>
      </div>
    );
  }

  const result = score(answers);

  return (
    <div class="test-result">
      <ResultCard result={result} animate={true} />
      <div class="result-actions">
        <a href="/rank/" class="btn btn-primary">
          Take the test yourself
        </a>
        <a href="/" class="btn btn-ghost">
          What is Camp Hermes?
        </a>
      </div>
    </div>
  );
}
