- Aesthetic: "warm editorial monochrome" — warm off-white/cream background, warm
  near-black ink, never pure #fff/#000. Calm, archival, content-forward. The
  CONTENT (covers, art, photography, gallery images) supplies all color; the
  shell stays neutral. Personality comes from typography + negative space, not
  color.

- Color usage: components MUST reference semantic tokens only (background,
  foreground, muted, border, primary, accent, ring) — never raw color-ramp
  values, never hardcoded hex/oklch. The palette is monochrome for now; `accent`
  is the reserved hook for a future Kurdish-identity color and must stay a single
  swappable token. `muted` is for secondary text/labels only, never primary body
  copy. Maintain WCAG AA minimum (AAA for body text).

- Typography: use the defined type-scale tokens wired to the configured fonts;
  don't introduce ad-hoc font sizes.

- Bilingual / RTL (CRITICAL): the site is two scripts — ckb (Sorani, Arabic,
  RTL) and ku (Kurmanji, Latin, LTR). Always use logical properties (ms-/me-/ps-/
  pe-/text-start/text-end), never physical left/right. Never apply letter-spacing/
  tracking to Arabic script — it breaks cursive words; tracked treatments are
  Latin-only. Arabic needs more line-height than Latin at the same size. Every
  component must be verified in BOTH directions, and directional icons
  (chevrons/arrows) must flip with dir.

- Borders are a design element (hairline rules, boxed labels): use the border
  token, keep them thin/low-contrast. with border radious please. 
