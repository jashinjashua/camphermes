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

1. Sharpen the visual system: dark athletic palette, bolder display type,
   consistent spacing tokens.
2. Scroll-reveal animations, view transitions between pages, hover and
   press states on level cards.
3. Rebrand the "Levels" section with the D–S rank letters so the site and
   the test speak one language.
4. Movement pictogram SVG set, used on the cards now and in the test later.

### Phase 3 — The Hero Rank Test

1. Quiz flow as an Astro island (Svelte or Preact): one movement per
   screen, big sliders and steppers, progress bar, 7–9 questions, under
   3 minutes. Duolingo pacing, shonen tone in the microcopy.
2. Scoring engine as pure, unit-tested functions reading `levels.json`:
   - Rank = highest level whose minimums are met.
   - Power level = weighted sum of inputs normalized against S-Rank
     thresholds.
   - Five stat axes (Push / Pull / Core / Skill / Endurance) → radar and
     dominant-stat type.
   - Quest line = the specific gaps to the next rank.
3. Result screen: animated status-window reveal, radar draws itself, quest
   line, "Apply for a Level N camp" call to action.
4. Sharing: canvas-rendered PNG of the status card plus the Web Share API;
   the result is also encoded in the URL so links reproduce the card;
   per-rank Open Graph images.
5. Result saved to localStorage; the homepage shows "Your rank: C — Retest"
   to returning visitors.

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

## Open questions

- Final rank names for C–S (candidate: Disciple, Warrior, Demigod,
  Olympian). An Instagram story poll can settle this.
- Exact card wording: "Hero Rank D" vs "D-Class".
- The test's URL: `/rank`, `/test`, or `/exam`.
- Final umbrella terminology for the training style ("hybrid athleticism"
  or something else).

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
