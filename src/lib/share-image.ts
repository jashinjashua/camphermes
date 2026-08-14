import { AXIS_ORDER, axes, type Result } from "./scoring";

// Renders the status-window card as a 1080x1350 PNG (4:5, feed-friendly).
// Kept in plain canvas so it works everywhere and needs no backend.

const RANK_COLORS: Record<string, string> = {
  e: "#8a919c",
  d: "#c08552",
  c: "#9fb2c8",
  b: "#ff4a1f",
  a: "#a78bfa",
  s: "#f5c542",
};

const W = 1080;
const H = 1350;

function radarPoint(cx: number, cy: number, r: number, i: number, total: number): [number, number] {
  const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

export function renderShareImage(result: Result): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const color = RANK_COLORS[result.letter.toLowerCase()] ?? "#ff4a1f";

  const display = (size: number) => `${size}px "Archivo Black", "Arial Black", sans-serif`;
  const body = (size: number, weight = 600) => `${weight} ${size}px "Inter", system-ui, sans-serif`;

  // Background and frame
  ctx.fillStyle = "#0a0b0d";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#39404d";
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  // Header bar
  ctx.fillStyle = "#12141a";
  ctx.fillRect(40, 40, W - 80, 84);
  ctx.strokeRect(40, 40, W - 80, 84);
  ctx.fillStyle = "#9aa3af";
  ctx.font = display(26);
  ctx.textAlign = "left";
  ctx.fillText("HERO RANK", 76, 96);
  ctx.textAlign = "right";
  ctx.fillText("CAMP HERMES", W - 76, 96);

  // Rank letter and identity
  ctx.textAlign = "left";
  ctx.fillStyle = color;
  ctx.font = display(300);
  ctx.fillText(result.letter, 76, 470);

  ctx.fillStyle = "#eceef1";
  ctx.font = display(52);
  ctx.fillText(result.name.toUpperCase(), 460, 300);
  ctx.fillStyle = "#9aa3af";
  ctx.font = body(34);
  ctx.fillText(result.typeLabel.toUpperCase(), 460, 356);

  ctx.fillStyle = "#9aa3af";
  ctx.font = body(30, 700);
  ctx.fillText("POWER LEVEL", 460, 430);
  ctx.fillStyle = "#eceef1";
  ctx.font = display(72);
  ctx.fillText(result.powerLevel.toLocaleString("en-US"), 460, 500);

  // Radar
  const cx = W / 2;
  const cy = 810;
  const radius = 210;
  const total = AXIS_ORDER.length;

  ctx.strokeStyle = "rgba(154, 163, 175, 0.3)";
  ctx.lineWidth = 2;
  for (const level of [25, 50, 75, 100]) {
    ctx.beginPath();
    for (let i = 0; i <= total; i++) {
      const [x, y] = radarPoint(cx, cy, (radius * level) / 100, i % total, total);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.beginPath();
  for (let i = 0; i <= total; i++) {
    const axis = AXIS_ORDER[i % total];
    const [x, y] = radarPoint(cx, cy, (radius * Math.max(result.stats[axis], 3)) / 100, i % total, total);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = `${color}48`;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "#9aa3af";
  ctx.font = body(26, 700);
  ctx.textAlign = "center";
  for (let i = 0; i < total; i++) {
    const axis = AXIS_ORDER[i];
    const [x, y] = radarPoint(cx, cy, radius + 52, i, total);
    ctx.fillText(`${axes[axis].toUpperCase()} ${result.stats[axis]}`, x, y + 8);
  }

  // Quest line
  ctx.textAlign = "left";
  ctx.fillStyle = "#9aa3af";
  ctx.font = body(30, 700);
  const questY = 1130;
  if (result.nextLetter) {
    ctx.fillText(`QUEST → ${result.nextLetter}-RANK · ${result.nextName?.toUpperCase()}`, 76, questY);
    ctx.font = body(28);
    const gaps = result.gaps.slice(0, 3);
    gaps.forEach((gap, i) => {
      ctx.fillStyle = "#eceef1";
      const value = gap.current ? `${gap.current} / ${gap.needed}` : gap.needed;
      ctx.fillText(`${gap.label}: ${value}`, 76, questY + 48 + i * 42);
    });
  } else {
    ctx.fillText("NEXT → X-RANK · ??? THE TEST CANNOT TAKE YOU THERE.", 76, questY);
  }

  // Footer
  ctx.fillStyle = color;
  ctx.font = body(28, 700);
  ctx.textAlign = "right";
  ctx.fillText("camphermes.com/rank", W - 76, H - 76);

  return canvas;
}

export async function shareResultImage(result: Result): Promise<"shared" | "downloaded"> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await Promise.all([
        (document as Document).fonts.load('400 72px "Archivo Black"'),
        (document as Document).fonts.load('700 30px "Inter"'),
      ]);
    } catch {
      // Fall back to system fonts silently.
    }
  }

  const canvas = renderShareImage(result);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not render the card");

  const file = new File([blob], `hero-rank-${result.letter.toLowerCase()}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "My Hero Rank" });
      return "shared";
    } catch {
      // User cancelled or share failed: fall through to download.
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
