import { AXIS_ORDER, type AxisId } from "../../lib/scoring";

interface Props {
  stats: Record<AxisId, number>;
  size?: number;
}

// Short labels so the outer ring text never clips the viewBox.
const SHORT: Record<AxisId, string> = {
  push: "PUSH",
  pull: "PULL",
  core: "CORE",
  skill: "SKILL",
  endurance: "END",
};

function point(cx: number, cy: number, radius: number, index: number, total: number): [number, number] {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function ring(cx: number, cy: number, radius: number, total: number): string {
  return Array.from({ length: total }, (_, i) => point(cx, cy, radius, i, total).join(",")).join(" ");
}

export default function Radar({ stats, size = 240 }: Props) {
  const total = AXIS_ORDER.length;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 46;

  const shape = AXIS_ORDER.map((axis, i) =>
    point(cx, cy, (radius * Math.max(stats[axis], 3)) / 100, i, total).join(","),
  ).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} class="radar" role="img" aria-label="Stat radar">
      {[25, 50, 75, 100].map((level) => (
        <polygon
          key={level}
          points={ring(cx, cy, (radius * level) / 100, total)}
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          opacity={level === 100 ? 0.45 : 0.18}
        />
      ))}
      {AXIS_ORDER.map((_, i) => {
        const [x, y] = point(cx, cy, radius, i, total);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" stroke-width="1" opacity={0.18} />;
      })}
      <polygon points={shape} fill="var(--rank-color, #ff4a1f)" fill-opacity={0.28} stroke="var(--rank-color, #ff4a1f)" stroke-width="2" />
      {AXIS_ORDER.map((axis, i) => {
        const [x, y] = point(cx, cy, radius + 24, i, total);
        return (
          <text
            key={axis}
            x={x}
            y={y}
            text-anchor="middle"
            dominant-baseline="middle"
            fill="currentColor"
            font-size="11"
            font-weight="600"
          >
            {SHORT[axis]} {stats[axis]}
          </text>
        );
      })}
    </svg>
  );
}
