// Geometric movement pictograms in one stroke style (Olympic-pictogram
// spirit). Inner SVG markup for a 64x64 viewBox, stroked with currentColor;
// rendered by Astro via set:html and by Preact via dangerouslySetInnerHTML.

const S = 'fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
const HEAD = 'fill="currentColor" stroke="none"';
const GROUND = '<line x1="6" y1="56" x2="58" y2="56" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.35"/>';

export const pictograms: Record<string, string> = {
  pushups: `${GROUND}
    <circle cx="11" cy="36" r="4.5" ${HEAD}/>
    <path d="M17 39 L48 43 L54 50" ${S}/>
    <path d="M21 40 L18 50" ${S}/>`,

  situps: `${GROUND}
    <circle cx="17" cy="24" r="4.5" ${HEAD}/>
    <path d="M21 28 L32 46" ${S}/>
    <path d="M32 46 L44 38 L50 50" ${S}/>
    <path d="M23 32 L34 38" ${S}/>`,

  pullups: `<line x1="12" y1="10" x2="52" y2="10" ${S}/>
    <circle cx="32" cy="17" r="4.5" ${HEAD}/>
    <path d="M24 10 L27 22 M40 10 L37 22" ${S}/>
    <path d="M32 22 L32 38" ${S}/>
    <path d="M32 38 L27 50 M32 38 L37 50" ${S}/>`,

  dips: `<path d="M12 22 L12 52 M52 22 L52 52" ${S}/>
    <circle cx="32" cy="14" r="4.5" ${HEAD}/>
    <path d="M32 19 L32 34" ${S}/>
    <path d="M27 22 L14 24 M37 22 L50 24" ${S}/>
    <path d="M32 34 L28 44 L30 52" ${S}/>`,

  burpees: `${GROUND}
    <circle cx="32" cy="12" r="4.5" ${HEAD}/>
    <path d="M32 17 L32 34" ${S}/>
    <path d="M32 21 L20 10 M32 21 L44 10" ${S}/>
    <path d="M32 34 L23 48 M32 34 L41 48" ${S}/>`,

  plank: `${GROUND}
    <circle cx="11" cy="34" r="4.5" ${HEAD}/>
    <path d="M17 37 L50 41 L55 50" ${S}/>
    <path d="M20 38 L20 50 L28 50" ${S}/>`,

  handstand: `${GROUND}
    <circle cx="32" cy="43" r="4.5" ${HEAD}/>
    <path d="M27 50 L27 36 M37 50 L37 36" ${S}/>
    <path d="M32 36 L32 20" ${S}/>
    <path d="M32 20 L25 8 M32 20 L39 8" ${S}/>`,

  muscleups: `<line x1="12" y1="26" x2="52" y2="26" ${S}/>
    <circle cx="32" cy="8" r="4.5" ${HEAD}/>
    <path d="M32 13 L32 30" ${S}/>
    <path d="M28 16 L24 26 M36 16 L40 26" ${S}/>
    <path d="M32 30 L28 42 L32 52" ${S}/>`,

  statics: `${GROUND}
    <circle cx="53" cy="30" r="4.5" ${HEAD}/>
    <path d="M14 34 L48 32" ${S}/>
    <path d="M28 34 L27 50 M36 33 L37 50" ${S}/>`,

  run: `${GROUND}
    <circle cx="37" cy="11" r="4.5" ${HEAD}/>
    <path d="M35 16 L29 32" ${S}/>
    <path d="M33 20 L44 26 M33 20 L20 24" ${S}/>
    <path d="M29 32 L40 38 L44 50" ${S}/>
    <path d="M29 32 L19 40 L13 36" ${S}/>`,
};

export function pictogramSvg(id: string, size = 40): string {
  const inner = pictograms[id];
  if (!inner) return "";
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${inner}</svg>`;
}
