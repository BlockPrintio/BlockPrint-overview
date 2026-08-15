# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The record serves four audiences at once, confirmed by the user. Design cannot
optimise for one at the others' expense.

- **Catalyst voters, mid-decision.** Arrive during a voting window, often from a
  proposal link, and need to judge credibility quickly: who is behind this, what
  have they delivered before, is the ask proportionate. First visit, short stay,
  high stakes.
- **Funders and reviewers auditing delivery.** Return repeatedly over months to
  check that money asked for matches work done. They need figures they can trace
  to a source and compare against a previous reading.
- **The Cardano community at large.** Developers and community members working
  out what BlockPrint builds, who works on it, and whether it is worth joining or
  building on.
- **BlockPrint itself.** The record is the organisation's own public
  accountability artifact, published because a treasury-funded org should
  publish, independent of whether anyone is reading on a given day.

The two demanding cases are the first-time credibility judgment and the repeat
verification pass. A surface that satisfies only one of those is incomplete.

## Product Purpose

A public governance record for BlockPrint, a Cardano developer community based in
Lagos, Nigeria. It states what the organisation has asked the Cardano treasury
for, what it has delivered against those asks, and who did the work.

Success is that a reader can answer "did they do what they said they would" from
the site alone, and can trace every figure back to where it came from. Success is
not engagement, conversion, or the site looking impressive.

## Positioning

The record publishes unfavourable figures with the same weight as favourable
ones. At the time of writing that means ₳0 distributed and 0 of 10 milestones
delivered, stated plainly on the front sheet rather than replaced with
projections, ambitions, or activity metrics that would read better.

That is the mechanism a neighbouring project page cannot truthfully copy: most
governance surfaces show what has been won. This one shows the open ask and the
empty delivery column, and updates on its own when the record changes.

## Operating Context

- Read alongside the proposals themselves on projectcatalyst.io, which the record
  links out to rather than restating.
- Consulted during Catalyst voting windows, when traffic is concentrated and
  readers are comparing several proposals in a sitting.
- Consulted again after funding, when milestone sign-off becomes the thing being
  checked.
- Data is refreshed automatically via GitHub Actions; figures move without a
  human editing copy, so no wording may depend on a number staying where it is.

## Capabilities and Constraints

**Surfaces.** Six routes: the overview sheet (`/`), proposals
(`/catalyst-proposals`) and a per-proposal detail sheet
(`/catalyst-proposals/[id]`), contributors (`/contributors`), projects
(`/projects`), and repositories (`/org-stats`).

**Data sources.** Project Catalyst proposal and milestone data; GitHub
contributor, repository and package data read live; Discord community stats; DRep
vote records. Fund 15 proposal figures are held locally in `org-gov-app/data/fund15.ts`
as the single source for every surface that states them.

**Fund 15, as filed.** Two proposals: `1500001` (Cardano treasury explorer,
₳150,000, 5 milestones) and `1500002` (CS-Code web IDE scaffolder, ₳80,000, 5
milestones). ₳230,000 requested, ₳0 distributed, 0 of 10 milestones delivered.
Neither has been voted on.

**Stack constraint.** Next.js pages router, React, TypeScript, CSS Modules. Not
an app-router project; no CSS framework.

**Binding constraints** — all four confirmed by the user as rules, not habits:

1. **Unfavourable figures are stated plainly.** Zeros are never rounded up,
   softened, hidden behind projections, or replaced with a more flattering
   metric. A governance record that does this is worth nothing.
2. **Single light theme.** No dark mode. This is a decision, not an omission: the
   artifact the design is drawn from is a light one. One theme that cannot drift
   out of sync with a second.
3. **Readable without JavaScript or WebGL.** The record must be legible when
   client JS fails, is disabled, or WebGL is unavailable. Enhancements degrade to
   something complete, never to an empty box.
4. **Every figure names its source.** Numbers appear with where they came from and
   when they were read — "as filed", "read live from GitHub", "record read
   <date>" — never as a bare claim. Where nothing was actually fetched, the
   surface says so rather than stamping a date on an empty payload.

## Brand Commitments

- **Name:** BlockPrint. The organisation is named after the blueprint artifact,
  which is why the visual world is drawn from drafting material rather than from
  a chosen aesthetic.
- **Domain:** blockprint.team
- **Accounts:** github.com/BlockPrintio, x.com/blockprint0, and a public Discord.
- **Assets:** `org-gov-app/public/blockprint-logo.png`.
- **Voice:** declarative and unhedged. States what is recorded, not how the
  reader should feel about it. Existing copy is the reference — "Neither has been
  funded yet, so nothing has been drawn down."
- **Licence:** MIT.

## Evidence on Hand

**Real:** the Fund 15 proposal figures and project IDs; live GitHub repository,
contributor and package data; Discord community stats; DRep vote records; the
named contributor list (9 people) in `org-gov-app/data/manual-contributors.json`;
public proposal URLs on projectcatalyst.io.

**Absent, and not to be fabricated:** no testimonials, no case studies, no press,
no delivery track record from previous funds, no user counts, no benchmarks, and
no funding outcome. There is no prior-fund history to point at. Any surface that
would be stronger with a track record must go without one rather than invent
adjacent proof.

## Product Principles

1. **The record states what is, including when what is looks bad.** The zeros are
   the most credible thing on the site. Anything that softens them costs more
   than it gains.
2. **A figure without a source is a claim.** Every number carries where it came
   from and when it was read, or it does not appear.
3. **Serve the first-time judgment and the repeat audit with the same surface.**
   Scannable enough to decide from cold, precise enough to check against last
   month.
4. **Degrade to complete, never to empty.** Every enhancement — the drawing, live
   data, client interactivity — has a full-fidelity state when it cannot run.
5. **Copy cannot depend on a number staying still.** Data refreshes on its own;
   any sentence that would become false when a figure moves is a defect.

## Accessibility & Inclusion

**WCAG 2.2 AA**, confirmed as the target. The token layer already computes and
documents measured contrast ratios against each ground rather than eyeballing
them, and the ink ramp clears AA on every surface it is used on; several tiers
clear AAA. Future colour and interaction work is held to AA as a floor.

Colour is never the only channel: every status is paired with a word in the
markup.
