// Generates the Open Graph images into public/og/. Run locally with
// `npm run og` and commit the output; CI does not need fonts this way.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "public", "og");

const RANKS = [
  { letter: "E", name: "CIVILIAN", color: "#8a919c" },
  { letter: "D", name: "RECRUIT", color: "#c08552" },
  { letter: "C", name: "DISCIPLE", color: "#9fb2c8" },
  { letter: "B", name: "WARRIOR", color: "#ff4a1f" },
  { letter: "A", name: "DEMIGOD", color: "#a78bfa" },
  { letter: "S", name: "OLYMPIAN", color: "#f5c542" },
];

const W = 1200;
const H = 630;
const FONT = 'font-family="DejaVu Sans, Arial, sans-serif" font-weight="bold"';

function frame(inner) {
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#0a0b0d"/>
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="#39404d" stroke-width="3"/>
    <text x="60" y="88" ${FONT} font-size="26" letter-spacing="10" fill="#9aa3af">HERO RANK</text>
    <text x="${W - 60}" y="88" ${FONT} font-size="26" letter-spacing="10" fill="#9aa3af" text-anchor="end">CAMP HERMES</text>
    <line x1="28" y1="116" x2="${W - 28}" y2="116" stroke="#39404d" stroke-width="2"/>
    ${inner}
    <text x="${W - 60}" y="${H - 56}" ${FONT} font-size="24" fill="#ff4a1f" text-anchor="end">camphermes.com/rank</text>
  </svg>`;
}

function rankCard({ letter, name, color }) {
  return frame(`
    <text x="70" y="470" ${FONT} font-size="360" fill="${color}">${letter}</text>
    <text x="430" y="300" ${FONT} font-size="64" letter-spacing="4" fill="#eceef1">${name}</text>
    <text x="430" y="370" ${FONT} font-size="30" letter-spacing="6" fill="#9aa3af">HERO RANK TEST RESULT</text>
    <text x="430" y="460" ${FONT} font-size="34" fill="#9aa3af">What's your power level?</text>
  `);
}

function testCard() {
  const letters = RANKS.slice(1)
    .map(
      (r, i) =>
        `<text x="${60 + i * 120}" y="510" ${FONT} font-size="90" fill="${r.color}">${r.letter}</text>`,
    )
    .join("");
  return frame(`
    <text x="60" y="250" ${FONT} font-size="76" fill="#eceef1">WHAT'S YOUR</text>
    <text x="60" y="340" ${FONT} font-size="76" fill="#ff4a1f">POWER LEVEL?</text>
    <text x="60" y="405" ${FONT} font-size="32" fill="#9aa3af">10 movements · 3 minutes · D to S</text>
    ${letters}
    <text x="${60 + 5 * 120}" y="510" ${FONT} font-size="90" fill="#ffffff" opacity="0.3">?</text>
  `);
}

await mkdir(outDir, { recursive: true });

await sharp(Buffer.from(testCard())).png().toFile(path.join(outDir, "rank.png"));
for (const rank of RANKS) {
  await sharp(Buffer.from(rankCard(rank)))
    .png()
    .toFile(path.join(outDir, `rank-${rank.letter.toLowerCase()}.png`));
}

await sharp(path.join(root, "src", "assets", "site", "img-01.jpg"))
  .resize(W, H, { fit: "cover", position: "attention" })
  .png()
  .toFile(path.join(outDir, "default.png"));

console.log(`Wrote ${RANKS.length + 2} images to ${outDir}`);
