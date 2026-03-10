# Design tokens — Web Appearances

Design tokens sourced from the [Web Appearances](https://www.figma.com/design/HXpmNTzVqJhYs57bt2UJ11) Figma file. No UI components are included; use these tokens in your own components or styles.

## Contents

| File | Description |
|------|-------------|
| `colors.json` | Semantic and brand color tokens (`wel/sem/color`, `wel/web/bSem/color`) |
| `typography.json` | Font families, sizes, weights, line heights, letter spacing + composite text style references |
| `border.json` | Border width tokens |
| `effect.json` | Shadow blur and offset tokens (for effects) |
| `theme.css` | **CSS custom properties** — import this to use tokens in any stylesheet or JS |

## Using the tokens

### CSS (recommended)

Import the theme once (e.g. in your root layout or main CSS):

```css
@import url('./tokens/theme.css');
/* or */
@import './tokens/theme.css';
```

Then use variables anywhere:

```css
.panel {
  background: var(--wel-sem-color-surface);
  color: var(--wel-sem-color-on-surface-hi);
  border-width: var(--wel-sem-border-width-default);
  border-color: var(--wel-sem-color-outline-primary-low);
}

.hero {
  font: var(--wel-typography-display-01);
  letter-spacing: var(--wel-sem-letter-spacing-display-wide);
}

.body-text {
  font: var(--wel-typography-body-default-01);
}
```

### Naming convention

- **Primitives:** Figma path with slashes becomes hyphens in CSS.  
  Example: `wel/sem/color/surface` → `--wel-sem-color-surface`
- **Composite typography:** Use `--wel-typography-{style}` for a full font shorthand (e.g. `--wel-typography-display-01`, `--wel-typography-title-02`).  
  For finer control, use the primitive vars: `--wel-sem-font-families-*`, `--wel-sem-font-size-*`, etc.

### Mode-specific (light/dark)

Tokens under `wel/web/bSem/color/light/*` and `wel/web/bSem/color/dark/*` are available as:

- `--wel-web-bsem-color-light-*`
- `--wel-web-bsem-color-dark-*`

Switch them via a theme class or `prefers-color-scheme`:

```css
:root { --outline-family: var(--wel-web-bsem-color-light-outline-family); }
[data-theme="dark"] { --outline-family: var(--wel-web-bsem-color-dark-outline-family); }
```

### JSON

Use the `.json` files for:

- Design tools or pipelines that consume token JSON
- Generating other platforms (e.g. Android, iOS) via a token transformer
- Scripts that need the raw token tree

Structure follows the Figma hierarchy (`wel.sem.*`, `wel.web.bSem.*`). Values use a `value` (and optional `type`) field.

## Typography composite styles

| Token | Use case |
|-------|----------|
| `display-01` … `display-06` | Hero and large headings (Montserrat Bold) |
| `title-01` … `title-03` | Section/card titles (Roboto Medium) |
| `sub-01`, `sub-02` | Decorative subtitles (Unna Italic) |
| `body-default-01/02`, `body-strong-01/02` | Body text |
| `caption-default`, `caption-strong` | Small supporting text |
| `detail` | Fine print |
| `label-default-01/02/03`, `label-strong-01/02/03` | UI labels |
| `input-01`, `input-02`, `input-03` | Form/search input text |

## Fonts

Tokens reference **Montserrat**, **Roboto**, and **Unna**. Load them in your app (e.g. Google Fonts) so the CSS variables resolve correctly.
