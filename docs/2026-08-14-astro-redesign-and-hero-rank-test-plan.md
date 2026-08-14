---
title: Astro Redesign and Hero Rank Test Plan
author: Onur Solmaz <2453968+osolmaz@users.noreply.github.com>
date: 2026-08-14
tags: [plan, astro, redesign, hero-rank-test]
---

# Astro redesign and Hero Rank Test plan

## Goal

Rebuild the Camp Hermes site on Astro, make it look nicer and more
interactive, and add a level survey: visitors enter what they can do
(push-ups, pull-ups, runs, and so on), the site deduces their camp level,
and presents it in an MBTI-like "find your type" result they want to share.

The camp trains calisthenics skills (muscle-ups, handstands, planche,
levers) plus endurance running. The working umbrella term is "hybrid
athleticism"; the terminology and naming are still being figured out, so
product copy stays term-agnostic where possible.

**Theme note: we intentionally mash up Greek god and anime (shonen)
themes.** The brand is Greek (Camp Hermes, "Where Men are Forged") and the
audience is shonen-aware (the About page name-drops Luffy, Naruto, Goku,
Baki). The mash-up is a feature, not an inconsistency: Greek names carry
the brand, shonen formats (rank exams, power levels, training arcs) carry
the virality. Do not "clean up" one theme in favor of the other.

The desired feel: brutal in the sports sense without being too brutish.
Visuals lean toward simple, modern, flat illustrations (Duolingo-like),
drawn bold and geometric.

## Decisions made

- **Survey name:** "Find Your Hero Rank" — the Hero Rank Test. Chosen
  because it is understood instantly without explanation. "Hermes"-based
  names were rejected: the brand is not known yet, so the name must borrow
  recognition the audience already has (hero rankings from One Punch Man
  and My Hero Academia, letter tiers from games).
- **Ranks:** letter ladder D–S mapped to the existing camp Levels 1–5, each
  with an original name. Working set: D Recruit, C Disciple, B Warrior,
  A Demigod, S Olympian. "D-Class — Recruit" is locked in spirit; final
  names for C–S are open (see open questions).
- **Level X** stays off the scale. The test shows it as "???", locked, and
  never awards it. It has no physical minimums (willpower, discipline,
  never-give-up philosophy), so the test cannot measure it — the lock makes
  it more desirable.
- **Power level:** a number on the result card next to the rank. It is a
  fixed formula over the inputs (normalized against S-Rank thresholds), not
  an arbitrary score, so retests are comparable and "my number went up"
  posts work.
- **Type:** the dominant stat axis gives an MBTI-like second dimension
  ("B-Rank · Power type" vs "B-Rank · Endurance type"). Two people at the
  same rank get different cards.
- **Result card:** status-window aesthetic (the Solo Leveling floating stat
  panel look). Rank letter large, power level, stat radar, and a quest line
  showing what blocks the next rank ("4 more pull-ups to A-Rank").
- **IP rule:** other companies' anime names (One Punch Man, Chunin Exam,
  Solo Leveling) appear only in marketing captions and memes, never in the
  product name or UI. Naming the product after an anime invites a takedown
  exactly when the test goes viral. The Saitama workout
  (100/100/100 + 10 km) may appear as a named achievement badge, since that
  is a descriptive reference to a known fitness challenge.
- **Art rule:** hand-authored SVG only for geometric work — movement
  pictograms (Olympic-pictogram style), radar chart, badges, the status
  window. Character illustrations come from an image-generation pass that a
  human curates; LLM-coded character SVGs are explicitly out.
- **Marketing frame:** "your training arc is real." The training-arc meme
  is established in fitness social media and the camp literally is one.
- **Site hierarchy: the test is the prominent thing.** The first screen
  shows the most important information about the camp (what it is, the
  feel, the proof), immediately followed by the test with a themed call to
  action. Visitors should be able to start the test right away. Everything
  else (levels, gallery, trainer, contact) supports that funnel.
- **Redesign freedom, content stability:** the current design is assumed
  to be weak. Rehash, refactor, and redesign the site at will — layout,
  sections, structure, visual system — but do not rewrite the prose much.
  All original content survives: level requirements, about text, camp
  dates, trainer profile, gallery, contact details. Corrections are
  welcome (spelling, grammar, factual slips such as "Malasia" or
  "August 31th"); wholesale rewording of the camp's voice is not. Derive
  the design from the camp's own principles: discipline, measurable
  standards, nature, brotherhood, brutal in the sports sense without being
  brutish.
- **No backend, confirmed.** Scoring runs in the browser; results are
  encoded in the URL; the name and saved results live in localStorage; the
  share image is canvas-rendered; the form stays on EmailJS; hosting stays
  on GitHub Pages; analytics is a third-party script. Accepted trade-offs:
  Open Graph images are per-rank, not per-person (the personal card
  travels as a screenshot or PNG); no aggregate stats, percentiles, or
  leaderboards at launch (would need a small worker + store later);
  applications arrive as email, not structured records.
- **The test lives on a standalone page** (own URL), not inside a
  single-page app. The shared link is the viral unit: it must land directly
  on the test or a result, carry per-rank Open Graph images, and load fast.
  The homepage embeds a teaser (the hook and first question) that hands off
  to the test page.
- **The result must be screenshotable.** The result view is designed as a
  self-contained card that fits one phone viewport: rank, name, power
  level, radar, and the Camp Hermes mark all visible without scrolling, no
  surrounding chrome that ruins a screenshot. The canvas-rendered share
  image is the polished path, but a raw screenshot of the screen must also
  look good, because that is what most people actually post.

## UX principles

The test comes first. Every UX call resolves in favor of getting a visitor
into question 1 and back out with a shareable result.

- **Test-first funnel:** the first screen states what the camp is; the test
  call to action is visible in or immediately after the first viewport.
  One tap from landing to question 1. Levels, gallery, trainer, and
  contact exist to support that path, never to compete with it.
- **Mobile-first:** the audience arrives from Instagram and TikTok links.
  Design for one-hand phone use; desktop is the adaptation.
- **Inside the test, nothing else:** no navigation, no footer, no exits
  besides back. One movement per screen, big touch targets, a progress
  bar, 7–9 questions, under 3 minutes.
- **The result is the reward:** animated status-window reveal, then a card
  that fits one phone viewport and survives a raw screenshot. Share and
  apply actions sit directly under the card, in that order.
- **Returning visitors resume, not restart:** saved result shows first
  with a retake option; retakes lead with the delta and the RANK UP
  moment.
- **Themed, not costumed:** shonen tone lives in microcopy, reveal
  animations, and the card format. It never adds steps, modals, or
  friction to the funnel.

## Current state of the repo

- Static site, two pages (`index.html`, `about.html`), no build system.
- Served on GitHub Pages with a custom domain (`CNAME` → camphermes.com).
  `.htaccess` does nothing there.
- Old stack: jQuery 3.4, Slick carousel, Isotope gallery filter, Magnific
  popup, Bootstrap CSS, Font Awesome, EmailJS for the contact form.
- The key asset: six camp levels already defined in HTML with exact
  exercise minimums (push-ups, sit-ups, pull-ups, dips, burpees, plank,
  handstand, muscle-ups, planche, levers, runs). Levels 1–5 are measurable;
  Level X is philosophy only. This data is what the test scores against.

## Scope

### Phase 1 — Astro migration (foundation)

1. Scaffold an Astro project in this repo; port `index` and `about`.
2. Extract all level requirements from HTML into one data file
   (`src/data/levels.json` or a content collection). Single source of truth
   for the level cards and the test's scoring engine.
3. Componentize: Header, Hero, LevelCards, Gallery, Trainer, Contact,
   Footer, shared Layout.
4. Remove the jQuery stack: Isotope → small filter script, Slick → CSS
   scroll-snap carousel, Magnific → lightweight lightbox. Keep EmailJS.
5. Use `astro:assets` for the ~35 gallery images (responsive sizes, lazy
   loading).
6. GitHub Actions workflow deploying to Pages; keep the CNAME.

Exit criteria: same site, same URL, modern stack, better Lighthouse scores.

### Phase 2 — Redesign and interactivity

1. Restructure the homepage around the funnel: first screen states what the
   camp is in one hard sentence plus proof (nature, training, standards);
   the next block is the test teaser with a themed call to action
   ("What's your Hero Rank?" / "Take the test"). Levels, gallery, trainer,
   and contact follow in support. This is a free redesign — keep the
   content, not the current layout.
2. Sharpen the visual system: dark athletic palette, bolder display type,
   consistent spacing tokens.
3. Scroll-reveal animations, view transitions between pages, hover and
   press states on level cards.
4. Rebrand the "Levels" section with the D–S rank letters so the site and
   the test speak one language.
5. Movement pictogram SVG set, used on the cards now and in the test later.

### Phase 3 — The Hero Rank Test

1. The test is a standalone Astro page with the quiz as an island (Svelte
   or Preact): one movement per screen, big sliders and steppers, progress
   bar, 7–9 questions, under 3 minutes. Duolingo pacing, shonen tone in the
   microcopy. The homepage teaser links or hands off into this page.
2. Scoring engine as pure, unit-tested functions reading `levels.json`:
   - Rank = highest level whose minimums are met.
   - Power level = weighted sum of inputs normalized against S-Rank
     thresholds.
   - Five stat axes (Push / Pull / Core / Skill / Endurance) → radar and
     dominant-stat type.
   - Quest line = the specific gaps to the next rank.
3. Result screen: animated status-window reveal, radar draws itself, quest
   line, "Apply for a Level N camp" call to action. The card fits one phone
   viewport and looks good in a raw screenshot (see the screenshotable
   decision above).
4. Sharing: canvas-rendered PNG of the status card plus the Web Share API;
   the result is also encoded in the URL so links reproduce the card;
   per-rank Open Graph images.
5. Persistence and retakes (localStorage, per browser):
   - Finishing the test saves the result (rank, stats, power level, date).
     Reloading the test page shows the saved result card with a "Retake the
     test" button instead of question 1.
   - Retaking pushes the old result into a history array; an abandoned
     retake leaves the previous result standing.
   - A finished retake shows the delta against the previous result
     ("Power Level 2,340 → 2,580") and a RANK UP moment on a tier change —
     the before/after is the strongest share format the product has.
   - Precedence on the test page: URL-encoded result (a shared link) wins
     and renders with a "Take the test yourself" call to action; otherwise
     the saved result; otherwise the quiz.
   - The homepage shows "Your rank: C — Retake" to returning visitors.

### Phase 4 — Character art and polish

1. Style-locked prompts for an image model; one character per rank doing
   that rank's signature movement. A human curates the winners.
2. Winners go into rank cards, result screens, and Open Graph images.
3. Saitama-workout achievement badge on the result card.

### Phase 5 — Launch loop

1. Homepage hero gets "What's your Hero Rank?" as a primary call to action
   next to Apply.
2. Privacy-friendly analytics (Plausible or GoatCounter) on test starts,
   completions, shares, and applications.
3. Marketing asset pack for the trainer's Instagram: meme captions, a story
   poll to settle the final rank names, a before/after retest format.

Phases run 1 → 2 → 3 in order; 4 and 5 may overlap with 3.

## Non-goals

- No backend. The test is fully client-side.
- No accounts, no stored user data beyond localStorage.
- No naming the product after third-party anime IP.
- No hand-coded character illustration SVGs.
- No replacement of EmailJS in this pass.

## Departures from the plan (as implemented)

- The test asks 10 questions, not 7–9: six rep/duration inputs (push-ups,
  sit-ups, pull-ups, dips, burpees, plank), three skill ladders (handstand,
  muscle-ups, statics), and the run. Fewer questions would have required
  merging movements that the level cards score separately.
- Results below the Level 1 minimums get "E-Rank · Civilian" instead of a
  bare "no rank" message — still no camp level, but a shareable (and
  roastable) card.
- Ranks are cumulative: the awarded rank is the highest level whose
  requirements are met along with every level below it. Meeting Level 4
  numbers while failing a Level 1 minimum does not award A-Rank.
- The working rank names (D Recruit, C Disciple, B Warrior, A Demigod,
  S Olympian) are implemented as defaults in `src/data/levels.json`; the
  story-poll can rename them with a one-line change.
- Quiz interactivity uses Preact islands; the rest of the site is static
  Astro with small vanilla scripts (gallery filter and lightbox replace
  Isotope and Magnific, CSS scroll-snap replaces Slick).
- Open Graph images are generated locally by `npm run og` (sharp) and
  committed, so CI needs no font setup. They are per-rank; a shared link
  unfurls with its rank's card.

## Open questions

- Final rank names for C–S (candidate: Disciple, Warrior, Demigod,
  Olympian). An Instagram story poll can settle this.
- Exact card wording: "Hero Rank D" vs "D-Class".
- The test's URL: `/rank`, `/test`, or `/exam`.
- Final umbrella terminology for the training style ("hybrid athleticism"
  or something else).
- Optional name/handle on the result card (undecided). Proposal: one
  optional field shown after the result, never before question 1; printed
  on the card and share image, stored in localStorage only, never in the
  shared URL, and used to prefill the apply form. No email capture at the
  result screen either way.

## Acceptance criteria

- The Astro build deploys to camphermes.com via GitHub Actions with the
  CNAME intact, and every current section (hero, about, levels, gallery,
  trainer, contact) survives the migration.
- Level requirements exist in exactly one data file; the level cards and
  the test both render from it.
- No jQuery, Slick, Isotope, or Magnific in the shipped bundle.
- The test deduces a rank D–S from user inputs using the same thresholds
  shown on the level cards, and shows Level X as locked.
- The result card shows rank, rank name, power level, type, radar, and
  quest line, and can be shared as an image and as a URL that reproduces
  the card.
- Retaking the test with better inputs raises the power level under the
  same formula.
- The first two screens of the homepage are the camp essentials and the
  test call to action; a visitor can reach question 1 of the test in one
  tap from the first viewport.
- The result screen fits one phone viewport, and a raw screenshot of it
  contains rank, rank name, power level, radar, and the Camp Hermes mark.
- Reloading the test page after finishing shows the saved result with a
  retake option; a finished retake shows the delta against the previous
  result; a shared URL always renders its own card regardless of the
  viewer's saved result.

## Verification steps

- `npm run build` succeeds; preview the build locally and click through
  every section and page.
- Run Lighthouse against the deployed site before and after Phase 1 and
  compare.
- Unit tests for the scoring engine cover: each rank boundary, inputs
  below D (still awards no rank / "Mortal-tier" messaging), inputs above S,
  ties between stat axes, and power level monotonicity (better inputs never
  lower the number).
- Manually verify a shared result URL renders the same card in a fresh
  browser profile, and the shared PNG matches the on-screen card.
- Check the deployed site on a phone: the quiz is one-hand usable and the
  gallery images load lazily.
