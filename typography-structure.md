# Typography Design Tokens Structure — Web Appearances

**Figma file:** [Web Appearances](https://www.figma.com/design/HXpmNTzVqJhYs57bt2UJ11/%F0%9F%8C%88-Web-Appearances?node-id=7689-29051)  
**Node:** Typography (7689:29051)

This document summarizes the **typography** variable structure: font families, sizes, weights, line heights, letter spacing, and composite text styles.

---

## 1. Naming convention

- **Primitives:** `wel/sem/{category}/{role}[/{scale}]`  
  - `fontFamilies`, `fontSizes`, `fontWeights`, `lineHeights`, `letterSpacing`  
  - Optional scale: `xs`, `sm`, `md`, `lg`, `xl`, `2xl` (where applicable)
- **Composite styles:** Named text styles (e.g. `display-01`, `title-02`, `body-default-02`) that reference the primitives.

---

## 2. Font families (primitives)

| Token | Value | Used by |
|-------|--------|---------|
| `wel/sem/fontFamilies/display` | Montserrat | Display |
| `wel/sem/fontFamilies/title` | Roboto | Title |
| `wel/sem/fontFamilies/subtitle` | Unna | Subtitle |
| `wel/sem/fontFamilies/body` | Roboto | Body |
| `wel/sem/fontFamilies/caption` | Roboto | Caption |
| `wel/sem/fontFamilies/detail` | Roboto | Detail |
| `wel/sem/fontFamilies/label` | Roboto | Label |
| `wel/sem/fontFamilies/input` | Roboto | Input |

---

## 3. Typography scale by role

### 3.1 Display (Montserrat, Bold 700)

Hero and large headings. Letter spacing: **wide** (1) for larger sizes, **condensed** (0.5) for smaller.

| Composite | Size token | Size (px) | Line height | Letter spacing |
|-----------|------------|-----------|-------------|----------------|
| `display-01` | `wel/sem/fontSizes/display/2xl` | 62 | 76 | wide (1) |
| `display-02` | `wel/sem/fontSizes/display/xl` | 50 | 64 | wide (1) |
| `display-03` | `wel/sem/fontSizes/display/lg` | 40 | 52 | wide (1) |
| `display-04` | `wel/sem/fontSizes/display/md` | 32 | 40 | condensed (0.5) |
| `display-05` | `wel/sem/fontSizes/display/sm` | 26 | 32 | condensed (0.5) |
| `display-06` | `wel/sem/fontSizes/display/xs` | 20 | 24 | condensed (0.5) |

**Primitives:**
- `wel/sem/fontWeights/display` → Bold (700)
- `wel/sem/lineHeights/display/2xl` → 76  
- `wel/sem/lineHeights/display/xl` → 64  
- `wel/sem/lineHeights/display/lg` → 52  
- `wel/sem/lineHeights/display/md` → 40  
- `wel/sem/lineHeights/display/sm` → 32  
- `wel/sem/lineHeights/display/xs` → 24  
- `wel/sem/letterSpacing/display/wide` → 1  
- `wel/sem/letterSpacing/display/condensed` → 0.5  

---

### 3.2 Title (Roboto, Medium 500)

Section and card titles.

| Composite | Size token | Size (px) | Line height | Letter spacing |
|-----------|------------|-----------|-------------|----------------|
| `title-01` | `wel/sem/fontSizes/title/lg` | 22 | 28 | 0 |
| `title-02` | `wel/sem/fontSizes/title/md` | 20 | 24 | 0 |
| `title-03` | `wel/sem/fontSizes/title/sm` | 18 | 24 | 0 |

**Primitives:**
- `wel/sem/fontWeights/title` → Medium (500)
- `wel/sem/letterSpacing/title` → 0  

---

### 3.3 Subtitle (Unna, Italic 400)

Decorative subtitles.

| Composite | Size token | Size (px) | Line height | Letter spacing |
|-----------|------------|-----------|-------------|----------------|
| `sub-01` | `wel/sem/fontSizes/subtitle/lg` | 26 | 32 | 0 |
| `sub-02` | `wel/sem/fontSizes/subtitle/md` | 20 | 24 | 0 |

**Primitives:**
- `wel/sem/fontWeights/subtitle/default` → Italic (400)
- `wel/sem/fontFamilies/subtitle` → Unna
- `wel/sem/letterSpacing/subtitle` → 0  

---

### 3.4 Body (Roboto)

Default and strong body text in two sizes.

| Composite | Size | Size (px) | Line height | Weight |
|-----------|------|-----------|-------------|--------|
| `body-default-01` | md | 16 | 24 | Regular (400) |
| `body-strong-01` | md | 16 | 24 | Medium (500) |
| `body-default-02` | sm | 14 | 20 | Regular (400) |
| `body-strong-02` | sm | 14 | 20 | Medium (500) |

**Primitives:**
- `wel/sem/fontSizes/body/md` → 16 | `wel/sem/lineHeights/body/md` → 24
- `wel/sem/fontSizes/body/sm` → 14 | `wel/sem/lineHeights/body/sm` → 20
- `wel/sem/fontWeights/body/default` → Regular (400)
- `wel/sem/fontWeights/body/strong` → Medium (500)
- `wel/sem/letterSpacing/body` → 0  

---

### 3.5 Caption (Roboto)

Small supporting text.

| Composite | Size (px) | Line height | Weight |
|-----------|-----------|-------------|--------|
| `caption-default` | 12 | 16 | Regular (400) |
| `caption-strong` | 12 | 16 | Medium (500) |

**Primitives:**
- `wel/sem/fontSizes/caption` → 12
- `wel/sem/lineHeights/caption` → 16
- `wel/sem/fontWeights/caption/default` → Regular (400)
- `wel/sem/fontWeights/caption/strong` → Medium (500)
- `wel/sem/letterSpacing/caption` → 0  

---

### 3.6 Detail (Roboto, Regular 400)

Single utility style for fine print.

| Composite | Size (px) | Line height | Letter spacing |
|-----------|-----------|-------------|----------------|
| `detail` | 12 | 16 | 0 |

**Primitives:**
- `wel/sem/fontSizes/detail` → 12
- `wel/sem/lineHeights/detail` → 16
- `wel/sem/fontWeights/detail` → Regular (400)
- `wel/sem/letterSpacing/detail` → 0  

---

### 3.7 Label (Roboto)

UI labels in three sizes, default and strong.

| Composite | Size | Size (px) | Line height | Weight |
|-----------|------|-----------|-------------|--------|
| `label-default-01` | lg | 16 | 24 | Regular (400) |
| `label-strong-01` | lg | 16 | 24 | Medium (500) |
| `label-default-02` | md | 14 | 20 | Regular (400) |
| `label-strong-02` | md | 14 | 20 | Medium (500) |
| `label-default-03` | sm | 12 | 16 | Regular (400) |
| `label-strong-03` | sm | 12 | 16 | Medium (500) |

**Primitives:**
- `wel/sem/fontSizes/label/lg` → 16 | `wel/sem/lineHeights/label/lg` → 24
- `wel/sem/fontSizes/label/md` → 14 | `wel/sem/lineHeights/label/md` → 20
- `wel/sem/fontSizes/label/sm` → 12 | `wel/sem/lineHeights/label/sm` → 16
- `wel/sem/fontWeights/label/default` → Regular (400)
- `wel/sem/fontWeights/label/strong` → Medium (500)
- `wel/sem/letterSpacing/label` → 0  

---

### 3.8 Input (Roboto, Regular 400)

Form and search input text.

| Composite | Size | Size (px) | Line height | Letter spacing |
|-----------|------|-----------|-------------|----------------|
| `input-01` | lg | 48 | 68 | 0 |
| `input-02` | md | 16 | 24 | 0 |
| `input-03` | sm | 14 | 20 | 0 |

**Primitives:**
- `wel/sem/fontSizes/input/lg` → 48 | `wel/sem/lineHeights/input/lg` → 68
- `wel/sem/fontSizes/input/md` → 16 | `wel/sem/lineHeights/input/md` → 24
- `wel/sem/fontSizes/input/sm` → 14 | `wel/sem/lineHeights/input/sm` → 20
- `wel/sem/fontWeights/input` → Regular (400)
- `wel/sem/letterSpacing/input` → 0  

---

## 4. Quick reference — all composite styles

| Style name | Family | Size (px) | Weight | Line height |
|------------|--------|-----------|--------|-------------|
| display-01 | Montserrat | 62 | 700 | 76 |
| display-02 | Montserrat | 50 | 700 | 64 |
| display-03 | Montserrat | 40 | 700 | 52 |
| display-04 | Montserrat | 32 | 700 | 40 |
| display-05 | Montserrat | 26 | 700 | 32 |
| display-06 | Montserrat | 20 | 700 | 24 |
| title-01 | Roboto | 22 | 500 | 28 |
| title-02 | Roboto | 20 | 500 | 24 |
| title-03 | Roboto | 18 | 500 | 24 |
| sub-01 | Unna | 26 | 400 (Italic) | 32 |
| sub-02 | Unna | 20 | 400 (Italic) | 24 |
| body-default-01 | Roboto | 16 | 400 | 24 |
| body-strong-01 | Roboto | 16 | 500 | 24 |
| body-default-02 | Roboto | 14 | 400 | 20 |
| body-strong-02 | Roboto | 14 | 500 | 20 |
| caption-default | Roboto | 12 | 400 | 16 |
| caption-strong | Roboto | 12 | 500 | 16 |
| detail | Roboto | 12 | 400 | 16 |
| label-default-01 | Roboto | 16 | 400 | 24 |
| label-strong-01 | Roboto | 16 | 500 | 24 |
| label-default-02 | Roboto | 14 | 400 | 20 |
| label-strong-02 | Roboto | 14 | 500 | 20 |
| label-default-03 | Roboto | 12 | 400 | 16 |
| label-strong-03 | Roboto | 12 | 500 | 16 |
| input-01 | Roboto | 48 | 400 | 68 |
| input-02 | Roboto | 16 | 400 | 24 |
| input-03 | Roboto | 14 | 400 | 20 |

---

## 5. Token hierarchy (typography only)

```
wel/sem/
├── fontFamilies/
│   ├── display   → Montserrat
│   ├── title    → Roboto
│   ├── subtitle → Unna
│   ├── body     → Roboto
│   ├── caption  → Roboto
│   ├── detail   → Roboto
│   ├── label    → Roboto
│   └── input    → Roboto
│
├── fontSizes/
│   ├── display/   (2xl: 62, xl: 50, lg: 40, md: 32, sm: 26, xs: 20)
│   ├── title/     (lg: 22, md: 20, sm: 18)
│   ├── subtitle/  (lg: 26, md: 20)
│   ├── body/      (md: 16, sm: 14)
│   ├── caption    (12)
│   ├── detail     (12)
│   ├── label/     (lg: 16, md: 14, sm: 12)
│   └── input/     (lg: 48, md: 16, sm: 14)
│
├── fontWeights/
│   ├── display        → Bold (700)
│   ├── title          → Medium (500)
│   ├── subtitle/default → Italic (400)
│   ├── body/default   → Regular (400)
│   ├── body/strong    → Medium (500)
│   ├── caption/default → Regular (400)
│   ├── caption/strong → Medium (500)
│   ├── detail         → Regular (400)
│   ├── label/default  → Regular (400)
│   ├── label/strong   → Medium (500)
│   └── input          → Regular (400)
│
├── lineHeights/
│   ├── display/   (2xl: 76, xl: 64, lg: 52, md: 40, sm: 32, xs: 24)
│   ├── title/     (lg: 28, md: 24, sm: 24)
│   ├── subtitle/  (lg: 32, md: 24)
│   ├── body/      (md: 24, sm: 20)
│   ├── caption    (16)
│   ├── detail     (16)
│   ├── label/     (lg: 24, md: 20, sm: 16)
│   └── input/     (lg: 68, md: 24, sm: 20)
│
└── letterSpacing/
    ├── display/wide      → 1
    ├── display/condensed → 0.5
    ├── title             → 0
    ├── subtitle          → 0
    ├── body               → 0
    ├── caption            → 0
    ├── detail             → 0
    ├── label              → 0
    └── input              → 0
```

---

## 6. Implementation notes

- **Composite styles:** Prefer using composite names (`display-01`, `title-02`, etc.) in design-to-code so behaviour stays aligned with Figma.
- **Primitives:** For code that can’t use composite styles, map each composite to its primitives (family, size, weight, line height, letter spacing) using the tables above.
- **Display:** Large sizes use **wide** letter spacing (1), smaller sizes use **condensed** (0.5).
- **Subtitle:** Only role using **Unna** and **Italic**; ensure the font is loaded if you use `sub-01` / `sub-02`.
- **Input-01:** 48px is intended for large input fields (e.g. search); use `input-02` or `input-03` for standard forms.

---

*Generated from Figma variable definitions — Web Appearances typography node.*
