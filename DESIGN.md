# DESIGN.md — Mario's Tint Shop

## Theme
Single dark-first industrial theme ("Neon Garage"): jet black sections (#111111
`ink`, #1A1A1A `coal`) alternating with pure white (`paper`), one electric-blue
accent (#00A8FF `accent`, #0086D6 `accentDk` hover). Muted text: `smoke`
(#A3A3A3 on dark), `char`/`ash` on light. Hairlines: `line` (#2A2A2A dark),
`sand` (#EEEEEE light).

## Color strategy
Committed: black surfaces carry the brand; electric blue is the single accent
(CTAs, icons, highlights). Never introduce a second accent hue.

## Typography
- Display: "Special Gothic Expanded One" — `.headline` class: weight 400,
  uppercase, letter-spacing 0, line-height 1.12. H2 clamp(1.4rem,2.8vw,2.2rem).
- Script eyebrow: "Sedgwick Ave" — `.kicker` class (1.1rem). Used as the ONE
  deliberate kicker system sitewide.
- Body: Inter Variable (Fontsource). 15px leading-relaxed default.
- Seal/badge micro-type: Gabarito 400.

## Shape system
All-sharp: border-radius 0 everywhere. The ONLY exceptions: the round WhatsApp
FAB, round social chips, and the scalloped satisfaction seal. Buttons use the
`.sticker` clip-path (peeled top-right / bottom-left corners with fold
triangles) — buttons ONLY.

## Motion
Tokens in global.css: --ease-out cubic-bezier(0.23,1,0.32,1), --ease-out-soft
(0.16,1,0.3,1), --ease-in-out (0.76,0,0.24,1). Patterns: `.reveal` scroll
reveal (translateY+blur, staggered ~85ms via --reveal-i), `.pressable`
(scale .97 active, 160ms), `.lift` card hover, `.marquee` ticker, kenburns.
All gated behind prefers-reduced-motion. UI interactions 150-250ms ease-out.

## Recurring elements
- Section grammar: kicker (script, accent) + uppercase headline + body.
- Full-bleed marquee bands (hero ticker, About light-blue band #5FC2FF).
- Hex/wave background patterns (`hex-bg`, `wave-bg`) on light sections.
- Stats band straddling white/black seam via split linear-gradient.
- WhatsApp deep links as primary conversion (wa.me/16154107170).

## Voice
English, direct, installer-expert. Real data only (3M/XPEL/SunTek/STEK brands,
real reviews, real hours). No invented pricing.
