---
name: BlockPrint Governance
description: A public treasury record drawn as a working drafting sheet
colors:
  print-ink: "oklch(0.3325 0.0715 249.18)"
  revision-red: "oklch(0.4840 0.1348 34.65)"
  vellum: "oklch(0.968 0.006 85)"
  drawing-field: "oklch(0.947 0.008 85)"
  sheet: "oklch(0.992 0.003 85)"
  recessed-well: "oklch(0.928 0.009 85)"
  graphite: "oklch(0.235 0.014 85)"
  graphite-muted: "oklch(0.425 0.017 85)"
  graphite-subtle: "oklch(0.505 0.015 85)"
  rule: "oklch(0.878 0.010 85)"
  rule-subtle: "oklch(0.920 0.008 85)"
  rule-strong: "oklch(0.615 0.016 85)"
  danger: "oklch(0.5054 0.1905 27.52)"
  warning: "oklch(0.5553 0.1455 49.00)"
  success: "oklch(0.5273 0.1371 150.07)"
  info: "oklch(0.4882 0.2172 264.38)"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 1.95rem + 2.45vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 118"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.125rem, 1.80rem + 1.45vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 118"
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.25rem, 1.16rem + 0.40vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 112"
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.18vw, 1.0625rem)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "clamp(0.75rem, 0.73rem + 0.10vw, 0.8125rem)"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0.09em"
rounded:
  none: "0"
  sm: "2px"
  full: "9999px"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  8: "2rem"
  10: "2.5rem"
  11: "2.75rem"
  12: "3rem"
  16: "4rem"
  20: "5rem"
  24: "6rem"
components:
  button-action:
    backgroundColor: "{colors.revision-red}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 {spacing.5}"
    height: "{spacing.11}"
  button-action-hover:
    backgroundColor: "oklch(0.4240 0.1348 34.65)"
    textColor: "#ffffff"
  control-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 {spacing.4}"
    height: "{spacing.11}"
  control-ghost-hover:
    backgroundColor: "{colors.drawing-field}"
    textColor: "{colors.graphite}"
  input-search:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "{spacing.4} {spacing.5}"
    height: "{spacing.11}"
  card:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.none}"
    padding: "{spacing.5}"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 {spacing.4}"
  nav-item-active:
    backgroundColor: "transparent"
    textColor: "{colors.print-ink}"
  index-row:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    rounded: "{rounded.none}"
    padding: "{spacing.5} {spacing.4}"
  index-row-hover:
    backgroundColor: "oklch(0.955 0.0114 249.18)"
    textColor: "{colors.graphite}"
---

# Design System: BlockPrint Governance

## Overview

**Creative North Star: "The Working Drawing"**

This is a drafting sheet that is still in use. Not an archived print, not a
finished elevation filed away in a drawer — a drawing on the table, with an open
item marked in the margin, a delivery column still empty, and figures that move
on their own when the record moves. The organisation is named after the blueprint
artifact, so the world is not a chosen aesthetic sitting on top of the product;
it is the product's own name rendered literally.

Every visual decision traces back to something a real sheet does. The faint
printed grid on the background is substrate, not decoration: it is what makes
measured values look measured. The heavy rule under a page title is a frame line
dividing the title block from the drawing field, which is a real division. The
milestone track is a dimension line with its actual anatomy intact — witness
ticks at every measured point, a run between them, a terminator at the far end,
and the measurement set as a callout beneath. Mono type is doing semantic work
rather than styling work: it marks "this is a recorded value", which is the whole
subject of the site.

The density is high and the ornament is near zero. Nothing floats, nothing glows,
nothing is rounded past 2px, and the one loud colour appears once per screen at
most. What carries the design is line weight, tonal ground, measured space, and
the width axis of a single typeface. The confirmed anti-references are the
dashboard and the pitch deck: no card grids asserting that four unrelated numbers
matter equally, no donut charts, no gradient, no glass, no hero gradient text, no
metric tile with an upward arrow. A governance record that looks like a startup
dashboard is asking to be trusted for the wrong reasons.

**Key Characteristics:**

- Square corners everywhere; 2px only where a control must feel pressable
- Hairline and heavy rules as the primary structural device, not boxes or shadows
- Warm vellum ground with a faint printed grid, never white and never grey
- Two families only: Archivo on its width axis for lettering, IBM Plex Mono for
  every recorded value
- One accent, used once per screen, reserved for what is genuinely outstanding
- Single light theme by decision, not omission
- Depth from tone and fog, never from lighting or elevation
- Every status paired with a word, never carried by colour alone

## Colors

A palette pulled from cyanotype blueprint material: warm vellum paper, graphite
line, deep print ink, and an oxide-red revision annotation. Nothing here is a
trend colour; every value traces to that artifact.

Colour is authored in exactly one place — the seed layer — and derived from there
through relative colour syntax. Component styles read semantic roles only. A
module that reaches past a role to a raw value breaks theming for everything
else.

### Primary

- **Prussian Print Ink** (`oklch(0.3325 0.0715 249.18)` / #143859): Structure,
  links, active navigation state, the ruled dimension run, the milestone chain,
  and the printed grid at 5% alpha. Deep enough to read as pressed into the paper
  rather than laid on top of it. Measures 10.99:1 as text on vellum and 9.78:1 at
  its worst against the recessed well, so it clears AAA on every surface in the
  ramp; a white label on the fill measures 12.07:1.

### Secondary

- **Oxide Revision Red** (`oklch(0.4840 0.1348 34.65)` / #9C3B24): The one loud
  colour. Reserved for the open-item stamp and its action, which is the single
  genuinely outstanding thing on the site. 6.24:1 as text on vellum.

### Neutral

- **Vellum** (`oklch(0.968 0.006 85)` / #f6f4f0): The page ground. Warm, never
  white — the neutral hue is the hue of the paper, not of the ink.
- **Drawing Field** (`oklch(0.947 0.008 85)` / #f0ede8): Recessed regions and
  hovered ghost controls.
- **Sheet** (`oklch(0.992 0.003 85)` / #fdfcfa): Cards, the navigation band, and
  anything laid on top of the page ground.
- **Recessed Well** (`oklch(0.928 0.009 85)` / #eae7e1): Pressed and active
  states, where a control reads as pushed into the sheet.
- **Graphite** (`oklch(0.235 0.014 85)` / #211e17): Body and heading ink.
  15.20:1 on vellum.
- **Graphite Muted** (`oklch(0.425 0.017 85)` / #534e44): Supporting prose and
  secondary labels. 7.55:1.
- **Graphite Subtle** (`oklch(0.505 0.015 85)` / #69645b): Field labels, captions,
  provenance notes. 5.35:1 — the floor of the ink ramp, and still AA at every
  size the system uses it.
- **Rule** (`oklch(0.878 0.010 85)` / #dad6d0): The default hairline between
  cells, rows, and cards.
- **Rule Subtle** (`oklch(0.920 0.008 85)` / #e7e4df): Divisions inside an already
  divided region.
- **Rule Strong** (`oklch(0.615 0.016 85)` / #89847a): The frame rule around a
  ruled field and the witness ticks on a dimension line. 3.39:1 — the one rule
  tier bound by WCAG 1.4.11, and sized to clear it.

### Named Rules

**The One Voice Rule.** Revision red appears at most once per screen. If it shows
up twice it has stopped meaning "look here" and has become decoration. The open
item owns it; a second element wanting emphasis gets weight, rule, or space
instead.

**The Single Author Rule.** Colour is authored only in the seed layer. Every
variant — hover, active, subtle wash, on-colour label — is derived from a seed by
relative colour syntax or `color-mix`, never typed in a second time. A raw hex in
a component file is a defect regardless of how correct it looks.

**The Measured Ratio Rule.** Contrast is computed against the stated ground and
recorded in a comment beside the token, not eyeballed. A colour change that does
not come with recomputed ratios is not finished.

**The Word Beside the Colour Rule.** Every status is paired with a word in the
markup. Colour is a second channel, never the only one — including for the
milestone track, where delivered segments change lightness *and* the number
beneath goes bold.

## Typography

**Display Font:** Archivo (with Helvetica Neue, Arial fallback)
**Body Font:** Archivo (same family; the width axis does the differentiating)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace, SF Mono, Menlo)

**Character:** Archivo is a grotesk drawn for signage and printed matter, and its
variable width axis is the entire reason it was chosen. Set expanded at `wdth`
118, a title reads as drafting lettering; at normal width it would read as any
other grotesk and the sheet metaphor would collapse into a generic sans. IBM Plex
Mono carries every project ID, ADA amount, count, date and field label. The
pairing is engineering-document, not editorial: one voice for lettering, one for
recorded values, and no third face anywhere.

### Hierarchy

- **Display** (600, `clamp(2.5rem, 1.95rem + 2.45vw, 4rem)`, 1.08, `wdth` 118,
  uppercase): The front sheet's title only. One instance on the site. It outranks
  every other page title deliberately, because the overview is sheet 01 and the
  only sheet carrying a drawing.
- **Headline** (600, `clamp(2.125rem, 1.80rem + 1.45vw, 3rem)`, 1.08, `wdth` 118,
  uppercase): Every other page title, set through the shared page header.
- **Title** (600, `clamp(1.25rem, 1.16rem + 0.40vw, 1.5rem)`, 1.3, `wdth` 112,
  uppercase, +0.04em): Section headings, above a 1px rule.
- **Body** (400, `clamp(1rem, 0.96rem + 0.18vw, 1.0625rem)`, 1.55): Prose. Capped
  at 46–54ch wherever it runs beside a figure or in a header.
- **Label** (400, `clamp(0.75rem, 0.73rem + 0.10vw, 0.8125rem)`, +0.09em,
  uppercase, mono): Field labels, eyebrows, provenance notes, table keys, every
  unit and count.

### Named Rules

**The Mono Means Measured Rule.** Mono is semantic. If a string is a recorded
value — an ID, an amount, a count, a date, a status read off the data — it is
mono. If it is prose written by a person, it is not. Mono used decoratively on
prose destroys the one signal that tells a reader which is which.

**The Open Lettering Rule.** Drafting lettering is open, so mono labels carry
+0.09em tracking and uppercase. Display and headline go the other way, to
-0.025em, because large expanded lettering closes up on its own.

**The Tabular Figures Rule.** `font-variant-numeric: tabular-nums` is set on the
body element. Figures update live; a number that jitters as it changes reads as
unreliable even when it is correct.

## Layout

The page is a sheet: a 90rem maximum measure, centred, with `2.5rem 1.5rem 6rem`
gutters that drop to `2rem 1rem 4rem` below 40rem. Exactly one owner for page
gutters and one owner for section rhythm — layout classes set them, component
modules set neither. That separation is deliberate: a layout class and a component
class both writing padding is the specificity collision that silently flips on
build order.

Section rhythm is a single token, `clamp(3rem, 2.4rem + 2.5vw, 4.5rem)`, held on
every page. It is the loudest spacing decision in the system and it is not
overridden anywhere.

The drawing field carries a faint printed grid — two 1px gradients on a 28px step
at 5% ink alpha, measuring 1.08:1 against the paper. Legible as texture, invisible
as content, which is the correct weight for a substrate.

Spacing is a 4px base scale used whole. Content-driven grids
(`repeat(auto-fill, minmax(min(21rem, 100%), 1fr))`) are preferred over fixed
column counts, and `min-width: 0` is set on flex and grid children as a reset
because refusing to shrink below content is the usual cause of mystery horizontal
overflow.

Breakpoints are 64rem (two-column layouts collapse), 60rem, 48rem, and 40rem
(gutters tighten, dense strips go two-up). They are applied where the content
actually breaks rather than at a device-named set.

### Named Rules

**The One Owner Rule.** Page gutters belong to the sheet class; section rhythm
belongs to the section class. A component module that sets either is a defect,
even when it looks right on the page you are on.

**The Rule Carries Information Rule.** A horizontal rule marks a real division —
title block from drawing field, one record row from the next. A rule added for
visual rhythm alone is ornament wearing a structural costume; use space instead.

## Elevation & Depth

**Paper doesn't float.** The system is flat by default. Depth comes from the
four-step tonal surface ramp (vellum → sheet → raised → recessed well) and from
hairline rules, not from lifting things off the page. The 3D milestone chain
follows the same doctrine: it is deliberately unlit — no lights, no emissive, no
bloom, no glow — and its depth comes from fog fading into the paper the way a
drawing recedes, rather than from lighting. It is a printed chain, not a product
shot.

Shadows exist but are reserved for the few things genuinely lifted off the sheet:
overlays and modals. They are tinted with the paper hue rather than black alpha,
because black alpha turns the warm ground grey.

### Shadow Vocabulary

- **shadow-1** (`0 1px 2px -1px oklch(0.30 0.03 85 / 0.10)`): The lightest lift.
  Rarely correct; prefer a rule.
- **shadow-2** (`0 2px 4px -2px oklch(0.30 0.03 85 / 0.10), 0 6px 16px -6px oklch(0.30 0.03 85 / 0.08)`):
  Popovers and menus.
- **shadow-3** (`0 4px 8px -4px oklch(0.30 0.03 85 / 0.12), 0 16px 40px -12px oklch(0.30 0.03 85 / 0.14)`):
  Modal dialogs over the overlay scrim.

### Named Rules

**The Paper Doesn't Float Rule.** A surface at rest casts no shadow. If something
needs to be distinguished from its neighbour, it gets a rule or a tonal step. A
shadow means "this is above the sheet", which is true of a modal and false of a
card.

**The Never Black Alpha Rule.** Every shadow is tinted with the paper hue.
`rgba(0,0,0,x)` on this ground reads as grey scum and pulls the warmth out of the
vellum.

## Shapes

Drawings have square corners. Two radius values exist and no third one is
permitted: `0` for anything that reads as drawn — cards, cells, fields, the
navigation band, every container — and `2px` for controls that must feel
pressable. `9999px` exists solely for contributor avatars, which are photographs
of people and the one place the drafting metaphor correctly yields.

Form language is rectilinear and ruled. Containers are defined by their border and
their ground, never by a corner treatment. The recurring silhouette across the
site is the ruled cell: a rectangle bounded by hairlines, sharing edges with its
neighbours, in a strip or a table rather than floating as a card with a gap on
every side.

### Named Rules

**The Square Corner Rule.** A blueprint with 12px rounded cards is a blueprint
nobody believes. `0` is the default; `2px` is the exception for pressable
controls; there is no third value.

## Components

### Buttons

- **Shape:** Square (0 radius). Minimum target 2.75rem in both axes.
- **Action (primary):** Revision-red fill, white label, mono uppercase at
  +0.09em tracking, `0 1.25rem` padding. Used once per screen, on the open item.
- **Hover / Focus:** Background steps to the derived hover tone; the trailing
  arrow translates 2px. Focus is a 2px ink ring at +2px offset — the offset is
  required, because a ring drawn directly on a coloured fill measures 1:1 against
  itself.
- **Ghost (controls):** Transparent ground, muted ink label, 1px left rule
  separating it from its neighbour in a control strip. Hover fills with drawing
  field; active fills with recessed well.

### Cards / Containers

- **Corner Style:** Square (0).
- **Background:** Sheet on the vellum ground.
- **Shadow Strategy:** None at rest. See Elevation & Depth.
- **Border:** 1px rule on all sides; a heavier `rule-strong` frame where the
  container is a ruled field rather than a card.
- **Internal Padding:** 1.25rem, 1.5rem for larger records.

### Inputs / Fields

- **Style:** No border of its own — the field sits inside a strip framed by a
  single `rule-strong` border, with 1px rules dividing it from adjacent controls.
  Transparent ground, mono at label size, 1rem/1.25rem padding.
- **Focus:** A 2px ink ring drawn *inside* the field (`outline-offset: -2px`) plus
  a pale ink wash on the ground. The inset offset is deliberate: an outset ring
  would overlap the neighbouring controls in the strip.
- **Placeholder:** Subtle graphite, uppercase, tracked, one step smaller — it
  reads as a printed field label rather than as ghost text.

### Navigation

- Sticky band on the sheet ground with a `rule-strong` bottom border, 3.75rem
  minimum height. The organisation mark sits left behind a 1px divider; the
  section index fills the rest.
- Items are mono, uppercase, tracked, muted at rest and print ink when active,
  with `aria-current="page"` on the active item.
- At narrow widths the index **scrolls horizontally rather than collapsing behind
  a menu button**, with the scrollbar hidden. Every destination stays one tap
  away at every width. This is a deliberate rejection of the hamburger.

### Signature: the dimension line (milestone track)

The system's most characteristic component, and the clearest statement of its
thesis. Drafting notation, borrowed intact: one flex segment per milestone, each
carrying its own leading witness tick so the ticks are generated by the data
rather than positioned by hand — a run of 3 and a run of 12 both draw correctly.
A taller terminator closes the far end. Delivered milestones are drawn in print
ink; the number beneath goes bold, so the state is never carried by hue alone.

It owns the one orchestrated motion on the site: the ink run draws itself left to
right, the way a dimension is struck, staggered 90ms per segment so a
five-milestone run reads as a sequence of sign-offs rather than one bar sliding
out. Nothing else on the site animates on load, and reduced motion gets the
finished drawing immediately rather than a broken one.

### Signature: the title block

A ruled strip at the foot of a sheet header, spanning the full width beneath both
columns and closed by the header's heavy frame rule. Four ruled cells carrying
sheet number, subject, status and provenance, all mono. Status is derived from the
record rather than typed in, so a sheet cannot claim a state its own figures
contradict.

## Do's and Don'ts

### Do:

- **Do** derive every colour variant from a seed. Hover, active, subtle wash and
  on-colour label are all computed; a second authored value is a defect.
- **Do** recompute and record contrast ratios in a comment whenever a seed
  changes. The comment is part of the token.
- **Do** set recorded values in IBM Plex Mono and prose in Archivo. The
  distinction is the site's core signal.
- **Do** use `wdth` 118 on display and headline lettering and `wdth` 112 on
  section titles. The width axis is why this typeface was chosen.
- **Do** pair every status with a word in the markup.
- **Do** reserve revision red for the single genuinely outstanding item on a
  screen.
- **Do** let content-driven grids (`auto-fill` + `minmax`) decide column counts.
- **Do** give every enhancement a complete non-JS, non-WebGL state. The chain
  ships an SVG fallback that draws the same object from the same geometry
  constants, not a similar-looking one.
- **Do** derive counts and labels from data (`sheets.length + 1`), never hardcode
  a number that a later edit will desync.

### Don't:

- **Don't** introduce a third radius value, or round anything past 2px except an
  avatar.
- **Don't** add a shadow to a resting surface. Use a rule or a tonal step.
- **Don't** use black alpha in a shadow; tint with the paper hue.
- **Don't** put revision red on a second element in the same screen.
- **Don't** write a raw colour value in a component module.
- **Don't** set page gutters or section rhythm in a component module.
- **Don't** add a dark theme. The single light theme is a decision — a blueprint
  is a light artifact — and a second theme is a second thing to drift.
- **Don't** collapse the navigation into a hamburger at any width.
- **Don't** build a donut chart, a metric tile with a trend arrow, an equal-weight
  three-up card grid, gradient text, or a glass surface. Each was considered and
  rejected as dashboard furniture that would make a governance record look like a
  pitch.
- **Don't** animate anything on load except the dimension line.
- **Don't** use `<strong>` or `<em>` to achieve a visual weight. Mono, tone, and
  the label role carry emphasis; those elements carry meaning.
- **Don't** write copy that becomes false when a figure moves. Data refreshes on
  its own.
