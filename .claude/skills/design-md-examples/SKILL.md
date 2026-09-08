---
name: design-md-examples
description: Curated collection of DESIGN.md files reverse-engineered from real developer-focused websites (Claude, Vercel, Linear, Apple, Stripe, Spotify, Tesla, and 65+ others). Use when defining or upgrading a project's own DESIGN.md, picking a visual direction ("make it feel like Linear", "premium Apple-style"), or wanting a concrete example of how a design token document should be structured (colors, typography, spacing, components, do's and don'ts).
---

# DESIGN.md Examples

Source: https://github.com/VoltAgent/awesome-design-md — a curated collection of DESIGN.md analyses of real developer-focused sites.

## When to use

- The user wants their site to look/feel like a specific brand ("make it feel like Claude's site", "more Linear, less generic SaaS") — read that company's `design-md/<company>/DESIGN.md` for the exact tokens and reasoning, don't guess from memory.
- Writing or upgrading a project's own `DESIGN.md` — use these as a structural template: YAML frontmatter (colors, typography, rounded, spacing, components as token refs), then Overview / Colors / Typography / Layout / Elevation / Shapes / Components / Do's and Don'ts / Responsive Behavior / Iteration Guide / Known Gaps sections.
- Explaining *why* a design choice reads as premium vs generic (e.g. why cream+coral+serif reads as "editorial" rather than "AI-purple-gradient SaaS default").

## How to use

1. `ls design-md/` to see the ~74 available companies.
2. Read the specific `design-md/<company>/DESIGN.md` for full token tables and rationale.
3. Never lift a competitor's exact palette wholesale for an unrelated project — extract the *pattern* (how tokens are organized, how restraint creates a signature look) and apply it to the current project's own brand/content, not the source company's brand.
4. Cross-reference with the `design-taste-frontend` skill for anti-slop implementation discipline, and `web-design-guidelines` for a compliance pass on the result.
