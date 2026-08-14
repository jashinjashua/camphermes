import { useState } from "preact/hooks";
import type { Answers, Result } from "../../lib/scoring";
import { shareUrl } from "../../lib/result-url";
import { shareResultImage } from "../../lib/share-image";

interface Props {
  result: Result;
  answers: Answers;
  onRetake?: () => void;
}

export default function ResultActions({ result, answers, onRetake }: Props) {
  const [status, setStatus] = useState("");

  const share = async () => {
    setStatus("Rendering card…");
    try {
      const outcome = await shareResultImage(result);
      setStatus(outcome === "shared" ? "Shared." : "Card downloaded.");
    } catch {
      setStatus("Could not render the card.");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(answers, result.letter));
      setStatus("Link copied.");
    } catch {
      setStatus("Could not copy the link.");
    }
  };

  const applyHref = result.level > 0 ? "/#contact" : "/#classes";
  const applyLabel =
    result.level > 0 ? `Apply for the ${result.letter}-Class camp` : "See the camp classes";

  return (
    <div class="result-actions">
      <div class="result-buttons">
        <button type="button" class="btn btn-primary" onClick={share}>
          Share card
        </button>
        <button type="button" class="btn btn-ghost" onClick={copyLink}>
          Copy link
        </button>
        {onRetake && (
          <button type="button" class="btn btn-ghost" onClick={onRetake}>
            Retake the test
          </button>
        )}
      </div>
      <a href={applyHref} class="btn btn-ghost result-apply">
        {applyLabel}
      </a>
      <p class="result-status" role="status">
        {status}
      </p>
    </div>
  );
}
