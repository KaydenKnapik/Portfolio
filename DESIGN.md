# Design System: Kayden Knapik Portfolio

"Elevated Engineering HUD," a precision dark theme for robotics/RL work, with restrained motion that reinforces the engineering feel rather than decorating it.

No em dashes or en dashes anywhere on the site (copy, labels, code comments). Use a period, comma, colon, or a plain hyphen instead.

## Files

- `style.css`: single shared stylesheet for every page (home + all project detail pages)
- `main.js`: shared motion layer. Every feature is wrapped in its own try/catch (see Motion principles below), and the mascot eye tracking runs on plain `requestAnimationFrame` with zero GSAP dependency so it survives even a CDN failure.
- `media/<project>/`: all project photos and videos, organized per project (`bdx-r/`, `booster-t1-walk/`, `booster-t1-kick/`, `stompy/`, `hack2026/`, `robstride/`). Every project's assets live in exactly one of these, don't drop new media at repo root.
- `wallpaper-web.jpg`: the homepage hero background (site-wide, not project-specific, stays at root alongside `me.jpeg`).
- `raw-footage/`: local-only, gitignored. Original uncompressed camera/screen-recording files before trimming and compression. Never reference these from HTML, and never remove `.gitignore`'s exclusion of this folder, several of these files exceed GitHub's per-file size limit.
- Every page follows the same `<head>` include order: Font Awesome, Google Fonts (Inter + Space Grotesk + JetBrains Mono), `style.css`. Same pre-`</body>` include order: `gsap.min.js`, `ScrollTrigger.min.js`, `main.js`

## Adding new video assets

Source footage from a phone or screen recording is never web-ready. Before it goes in `media/`:
1. Preview first: extract a low-res frame or contact sheet and look at it before committing to using a clip, filenames lie.
2. Trim to the actual highlight (a loop should be 5 to 15 seconds, not the full raw take).
3. Compress: `ffmpeg -ss <start> -t <duration> -i <in> -vf "scale='min(720,iw)':-2" -an -c:v libx264 -crf 28 -preset veryfast -movflags +faststart <out>.mp4`. No audio track needed for decorative loops. Target under ~2MB per clip.
4. Move the original into `raw-footage/` (gitignored), only the compressed derivative goes in `media/`.
5. Any video used as a card thumbnail or inline loop is `autoplay muted loop playsinline`, never `controls`. Nothing on this site should require a click to play.

## Tokens (`:root` in style.css)

| Token | Value | Use |
|---|---|---|
| `--bg` / `--bg-alt` | `#0B0D0F` / `#0E1114` | page background |
| `--surface` / `--surface-hover` | `#12161A` / `#161B20` | cards, panels |
| `--text` / `--text-muted` / `--text-dim` | `#E8EAED` / `#9AA1AC` / `#5C6470` | primary / secondary / tertiary copy |
| `--accent` | `#2FE6A0` (mint green) | the one accent color, used for links, highlights, glow |
| `--accent-2` | `#FF6B4A` | rarely used secondary accent |
| `--font-sans` | Inter | body copy |
| `--font-display` | Space Grotesk (falls back to Inter) | hero h1, section titles, project headers, contact h2. Pulled from Linear's and SpaceX's actual type scales (see Known references below): bigger and tighter-tracked than a default sans, that's what reads as premium instead of templated. |
| `--font-mono` | JetBrains Mono | labels, eyebrows, stats, tech tags, anything "HUD/terminal" |
| `--ease` | `cubic-bezier(0.16, 1, 0.3, 1)` | the one easing curve for CSS transitions site-wide |

Don't introduce a second accent color or a second font family. The palette is intentionally narrow, that restraint is what makes it read as "engineering" rather than "marketing site."

## Motion principles

Rules baked into `main.js` and `style.css`. Keep new motion consistent with these:

1. **`prefers-reduced-motion` is respected everywhere.** `main.js` checks it up front and skips all GSAP/JS motion (scroll reveal, tilt, spotlight, magnetic button, parallax, mascot eye tracking) when set. CSS has a matching global override that collapses transition/animation durations to near zero. Any new animation must go through one of these two gates, not around them.
2. **Every feature in `main.js` is isolated in its own try/catch (the `run(label, fn)` helper).** One feature throwing (a missing element, a CDN hiccup) must never silently kill every feature registered after it in the file. This is a hard lesson from a real bug: an early version let one script error cascade and kill the mascot, the tilt, and the magnetic button all at once, with no visible error to anyone without devtools open. Never add a new feature outside of `run(...)`.
3. **One accent-colored spotlight/glow effect, reused, not reinvented.** The hero cursor-spotlight and the project-card hover-spotlight are the same technique (`--spot-x`/`--spot-y` CSS vars plus `radial-gradient(... var(--accent-glow) ...)`). Reuse that pattern for new hover surfaces instead of inventing a new glow style.
4. **Scroll reveals are subtle, not slidey.** `revealGroup()` in `main.js` does a small y-offset (16 to 24px) fade-in via ScrollTrigger, `toggleActions: 'play none none reverse'`. Stagger is capped (`staggerLimit`) so long lists (photo grids, skill tags) don't feel laggy at the tail end.
5. **Tilt/magnetic effects are limited to one focal element per view.** Project cards get a 3D tilt (max 6 degrees) because they're the primary interactive unit of the work section. The magnetic pull is intentionally only on the hero's primary CTA, don't add it to more buttons, it stops reading as intentional once there's more than one.
6. **Parallax is decorative background only.** The whole-page dot-grid drifting on scroll (`background-position` on `body`, about 48px total travel) is the only page-wide parallax. Never parallax text or interactive controls.
7. **Real photography over fake screenshots or clip art.** The hero's dominant visual is an actual BDX-R photo, not an illustration. When adding a new showcase moment, reach for real photos/video of the actual hardware before reaching for an icon or illustration. (A scroll-scrubbed video-frame sequence was tried and removed, real footage of a supervised lab test read as home-video jitter rather than a clean effect. If real solo walking footage becomes available, that technique is worth revisiting, not the raw spotter footage.)
8. **Durations**: micro-interactions 150 to 400ms, scroll reveals 300 to 600ms, `power2.out`/`power1.out` easing. Nothing over about 600ms.

## Component patterns

- **Cards** (`.project-card`, `.skill-group`, `.stat`): `var(--surface)` background, `var(--border)` 1px border, `var(--radius-md)` corners. Hover state is border turning `var(--accent)` plus a soft accent glow shadow, never a color/background swap.
- **Buttons** (`.btn`, `.btn-solid`, `.btn-sm`): outlined by default, fills solid mint on hover. `.btn-solid` is filled by default, reserve it for the single primary CTA per page.
- **Eyebrows/labels** (`.eyebrow`, `.section-eyebrow`, `.tech-stack`, `.mono-label`): always JetBrains Mono, uppercase, letter-spacing around 0.1 to 0.14em, accent-colored. Keep these rare (at most one per two or three sections) so they don't read as a templated pattern.
- **Stat values** (`.stat-value`): JetBrains Mono, animate in via the scramble/decode effect in `main.js` (digits cycle briefly before settling). This is the one "counter" pattern, don't build a second count-up mechanism elsewhere.
- **Hero** (`.hero`): full-bleed photo background (`wallpaper-web.jpg`, inline `style="background-image"` since it's page-specific), not a boxed card. A layered scrim (radial accent glow plus a bottom-heavy dark gradient) sits over it for text contrast. Content is bottom-anchored and centered. This is the second hero approach tried, first was an asymmetric split with the photo confined to a small framed card, which undersold a genuinely good photo. When the hero photo is strong, let it fill the section; don't cage it.
- **Stat band** (`.stat-strip`): a single-row metrics band, not a bordered comparison-table grid. Icon (Font Awesome) plus a large mono number plus a muted label, thin vertical hairline dividers only (no boxed cells), hover lifts the stat and glows the number in the accent color. Collapses to a plain 2x2 grid with no dividers under 768px rather than fighting with awkward divider placement.
- **Featured project card** (`.project-card.featured`): the flagship project (BDX-R) spans 2 grid columns with a taller thumbnail so the project grid isn't 4 visually-equal cards. Reach for this pattern (one deliberately larger card) instead of an equal grid whenever one item in a set is genuinely the headline item.
- **Hero mascot** (`.hero-mascot`): the small line-art robot head overlaid in the corner of the hero photo frame. Eyes track the cursor anywhere on the page via `main.js`, plain `requestAnimationFrame`, no GSAP dependency, gated by reduced motion. It's a one-off personality touch, don't duplicate it elsewhere on the page.

## Known references

Concrete patterns pulled from `.claude/skills/design-md-examples/design-md/` during the redesign, not invented from scratch:

- **Linear** (`design-md/linear.app/DESIGN.md`): display type scale (80/56/40/28px with tight negative tracking, -3.0px down to -0.6px), one accent used only functionally (never decoratively), charcoal cards with hairline borders. Our `--font-display` sizing and letter-spacing values are directly modeled on this, scaled down for a personal site rather than a funded product's marketing page.
- **SpaceX** (`design-md/spacex/DESIGN.md`): full-bleed real hardware photography as the hero's dominant visual instead of illustration or a headshot, austere restraint (the imagery does the work, not decoration), uppercase micro-label eyebrows. This is why the hero's dominant visual is now the BDX-R photo rather than a circular profile picture.

Pull from more of these (74 available) whenever a section needs a concrete "make it feel like X" answer instead of a guess.

## Installed skills

`.claude/skills/` includes, beyond the design/UI skills already there:

- `design-taste-frontend`: anti-slop frontend discipline (brief inference, motion/color/layout guardrails, the em-dash ban, a pre-flight checklist). Load it before any visual redesign pass.
- `image-to-code`: generate-then-implement workflow for turning a reference image into real frontend code.
- `web-design-guidelines`: fetches Vercel's Web Interface Guidelines and reviews code against them.
- `design-md-examples`: about 74 reverse-engineered DESIGN.md files from real companies (Claude, Vercel, Linear, Apple, and others), useful as structural templates or for "make it feel like X" direction.

## Adding a new project page

Copy an existing `project*.html` structure (nav, back button, `.project-header`, media, `.content` with `h2`/`p` blocks, tech tags, CTA buttons), keep the same script include order at the bottom, and don't hand-roll new CSS classes before checking `style.css` for an existing one that fits.
