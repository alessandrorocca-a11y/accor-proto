# Design Tokens Structure — Web Appearances

**Figma file:** [Web Appearances](https://www.figma.com/design/HXpmNTzVqJhYs57bt2UJ11/%F0%9F%8C%88-Web-Appearances?node-id=6318-14733)  
**Node:** Semantic tokens (6318:14733)

This document summarizes the design variables (tokens) structure used in the file. Tokens follow a **semantic naming** pattern with the prefixes `wel/sem/` (semantic) and `wel/web/bSem/` (web brand semantic, mode-specific).

---

## 1. Naming convention

| Prefix | Scope | Description |
|--------|--------|-------------|
| `wel/sem/` | Global semantic | Semantic tokens (colors, typography, spacing, etc.) |
| `wel/web/bSem/` | Web brand semantic | Mode-specific tokens (e.g. light/dark) for web |

Token paths are **slash-separated** and grouped by category (e.g. `color`, `fontSizes`, `fontFamilies`).

---

## 2. Border

| Token | Value | Description |
|-------|--------|-------------|
| `wel/sem/borderWidth/default` | 1 | Default border width |

---

## 3. Color tokens

### 3.1 Semantic color (general)

| Token | Value | Notes |
|-------|--------|--------|
| `wel/sem/color/surface` | `#070518` | Base surface (dark) |
| `wel/sem/color/on-surface-hi` | `#f7f9fb` | High-emphasis content on surface |
| `wel/sem/color/outline-primary-low` | `#8e8bc1` | Low-emphasis primary outline |

### 3.2 Eco (green) palette

| Token | Value |
|-------|--------|
| `wel/sem/color/hover/eco` | `#175a00` |
| `wel/sem/color/pressed/eco` | `#124d00` |
| `wel/sem/color/on-eco` | `#ffffff` |
| `wel/sem/color/eco-container-low` | `#072d00` |
| `wel/sem/color/eco-container-hi` | `#124d00` |
| `wel/sem/color/on-eco-container-low` | `#ccffb3` |
| `wel/sem/color/on-eco-container-hi` | `#ccffb3` |
| `wel/sem/color/outline-eco` | `#237b00` |

### 3.3 Family (brand) palette

| Token | Value |
|-------|--------|
| `wel/sem/color/family` | `#f6f2ff` |
| `wel/sem/color/on-family` | `#050033` |
| `wel/sem/color/on-family-container-low` | `#e8edff` |
| `wel/sem/color/on-family-container-hi` | `#e8edff` |

### 3.4 Web brand semantic (mode-specific)

| Token | Value | Mode |
|-------|--------|------|
| `wel/web/bSem/color/light/family-container-low` | `#f9f9ff` | Light |
| `wel/web/bSem/color/light/family-container-hi` | `#e8edff` | Light |
| `wel/web/bSem/color/light/outline-family` | `#050033` | Light |
| `wel/web/bSem/color/dark/outline-family` | `#f6f2ff` | Dark |
| `wel/web/bSem/color/dark/gradient-black-hi` | `#070518e5` | Dark |

### 3.5 Link & focus

| Token | Value |
|-------|--------|
| `wel/sem/color/link` | `#92b6ff` |
| `wel/sem/color/hover/link` | `#2a71db` |
| `wel/sem/color/pressed/link` | `#003779` |
| `wel/sem/color/focus` | `#2a71db` |

### 3.6 Overlay & shadow

| Token | Value | Description |
|-------|--------|-------------|
| `wel/sem/color/watermark` | `#0705180d` | Watermark (alpha) |
| `wel/sem/color/overlay-low` | `#0705184d` | Low overlay |
| `wel/sem/color/overlay-mid` | `#0705188a` | Mid overlay |
| `wel/sem/color/overlay-hi` | `#070518b2` | High overlay |
| `wel/sem/color/overlay-max` | `#070518e5` | Max overlay |
| `wel/sem/color/shadow-default` | `#0705180d` | Default shadow |
| `wel/sem/color/shadow-strong` | `#07051833` | Strong shadow |

### 3.7 Gradients

| Token | Value |
|-------|--------|
| `wel/sem/color/gradient-primary-hi-start` | `#ffffff` |
| `wel/sem/color/gradient-primary-hi-end` | `#e3dfff` |
| `wel/sem/color/gradient-primary-low-start` | `#ffd4ea` |
| `wel/sem/color/gradient-primary-low-end` | `#d6d3ff` |
| `wel/sem/color/gradient-secondary-start` | `#fff0f4` |
| `wel/sem/color/gradient-secondary-end` | `#e9e5ff` |
| `wel/sem/color/gradient-white-min` | `#ffffff00` |
| `wel/sem/color/gradient-white-max` | `#ffffff` |
| `wel/sem/color/gradient-black-min` | `#07051800` |
| `wel/sem/color/gradient-black-mid` | `#0705188a` |
| `wel/sem/color/gradient-black-max` | `#070518` |

---

## 4. Typography tokens

Typography is split into **primitives** (family, size, weight, line height, letter spacing) and **composite** font styles that reference them.

### 4.1 Caption

| Token | Value |
|-------|--------|
| `wel/sem/fontFamilies/caption` | Roboto |
| `wel/sem/fontSizes/caption` | 12 |
| `wel/sem/fontWeights/caption/default` | Regular (400) |
| `wel/sem/lineHeights/caption` | 16 |
| `wel/sem/letterSpacing/caption` | 0 |
| **Composite** | `caption-default` |

### 4.2 Body

| Token | Value |
|-------|--------|
| `wel/sem/fontFamilies/body` | Roboto |
| `wel/sem/fontSizes/body/sm` | 14 |
| `wel/sem/fontWeights/body/default` | Regular (400) |
| `wel/sem/lineHeights/body/sm` | 20 |
| **Composite** | `body-default-02` (letterSpacing: 0) |

### 4.3 Title

| Token | Value |
|-------|--------|
| `wel/sem/fontFamilies/title` | Roboto |
| `wel/sem/fontSizes/title/lg` | 22 |
| `wel/sem/fontWeights/title` | Medium (500) |
| `wel/sem/lineHeights/title/lg` | 28 |
| `wel/sem/letterSpacing/title` | 0 |
| **Composite** | `title-01` |

### 4.4 Display

| Token | Value |
|-------|--------|
| `wel/sem/fontFamilies/display` | Montserrat |
| `wel/sem/fontSizes/display/xl` | 50 |
| `wel/sem/fontWeights/display` | Bold (700) |
| `wel/sem/lineHeights/display/xl` | 64 |
| `wel/sem/letterSpacing/display/wide` | 1 |
| **Composite** | `display-02` |

### 4.5 Typography scale summary

| Style | Family | Size | Weight | Line height | Composite name |
|-------|--------|------|--------|-------------|----------------|
| Caption | Roboto | 12 | 400 | 16 | caption-default |
| Body (sm) | Roboto | 14 | 400 | 20 | body-default-02 |
| Title (lg) | Roboto | 22 | 500 | 28 | title-01 |
| Display (xl) | Montserrat | 50 | 700 | 64 | display-02 |

---

## 5. Token hierarchy (summary)

```
wel/
├── sem/                          # Semantic tokens
│   ├── borderWidth/
│   │   └── default
│   ├── color/
│   │   ├── surface, on-surface-hi, outline-primary-low
│   │   ├── eco, on-eco, eco-container-*, outline-eco, hover/eco, pressed/eco
│   │   ├── family, on-family, on-family-container-*
│   │   ├── link, hover/link, pressed/link, focus
│   │   ├── watermark, overlay-*, shadow-*
│   │   └── gradient-*
│   ├── fontFamilies/   (caption, body, title, display)
│   ├── fontSizes/      (caption, body/sm, title/lg, display/xl)
│   ├── fontWeights/    (caption/default, body/default, title, display)
│   ├── lineHeights/    (caption, body/sm, title/lg, display/xl)
│   └── letterSpacing/  (caption, title, display/wide)
│
└── web/
    └── bSem/                     # Web brand semantic (mode-aware)
        └── color/
            ├── light/  (family-container-*, outline-family)
            └── dark/   (outline-family, gradient-black-hi)
```

---

## 6. Implementation notes

- **Colors:** Prefer semantic tokens (`wel/sem/color/...`) over raw hex in code; map them to CSS variables or your design-token pipeline.
- **Mode:** Use `wel/web/bSem/color/light/...` and `wel/web/bSem/color/dark/...` for theme-specific values (e.g. light/dark mode).
- **Typography:** Use composite font styles (e.g. `caption-default`, `title-01`) where the design tool supports them; otherwise combine the primitive tokens (family, size, weight, line height, letter spacing) in your typography scale.
- **Gradients:** Gradient tokens are defined as start/end (and min/mid/max where applicable); implement as linear or radial gradients using these stops.

---

*Generated from Figma variable definitions — Web Appearances file.*
