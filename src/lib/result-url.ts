import { METRIC_ORDER, clampAnswer, type Answers, emptyAnswers } from "./scoring";

// A result travels as the raw answers, not the computed rank, so every card
// is recomputed from one scoring engine and links can never disagree with it.
// Format: ?v=1&a=100.80.15.30.50.300.4.3.2.20 (fixed metric order).

export function encodeAnswers(answers: Answers): string {
  const values = METRIC_ORDER.map((m) => answers[m]).join(".");
  return `v=1&a=${values}`;
}

export function decodeAnswers(search: string): Answers | null {
  const params = new URLSearchParams(search);
  if (params.get("v") !== "1") return null;
  const raw = params.get("a");
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== METRIC_ORDER.length) return null;
  const answers = emptyAnswers();
  for (let i = 0; i < METRIC_ORDER.length; i++) {
    const value = Number(parts[i]);
    if (!Number.isFinite(value) || value < 0) return null;
    answers[METRIC_ORDER[i]] = clampAnswer(METRIC_ORDER[i], value);
  }
  return answers;
}

export function shareUrl(answers: Answers, letter: string): string {
  const segment = letter.toLowerCase();
  return `${location.origin}/rank/${segment}/?${encodeAnswers(answers)}`;
}
