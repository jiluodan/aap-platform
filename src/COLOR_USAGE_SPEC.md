# Color Usage Specification

> Source: KPMG Color Usage Standard (Theme2023)
> Generated: 2026-08-07
> Scope: Audit Application Platform UI

---

## 1. Primary Colors (主色)

These are the core brand colors for the application interface.

| Name          | R    | G    | B    | HEX      | Usage                          |
|---------------|------|------|------|----------|--------------------------------|
| KPMG Blue     | 0    | 51   | 141  | `#00338D` | Primary brand, headers, sidebar bg, key actions |
| Cobalt Blue   | 30   | 73   | 226  | `#1E49E2` | Primary-400 level, links, emphasis |
| Dark Blue     | 12   | 35   | 60   | `#0C233C` | Darkest tone, deep backgrounds  |
| Light Blue    | 172  | 234  | 255  | `#ACEAFF` | Light accents, highlights       |
| Pacific Blue  | 0    | 184  | 245  | `#00B8F5` | Accent color, CTAs, hover states |
| Purple        | 114  | 19   | 234  | `#7213EA` | Special accent, badges         |
| Pink          | 253  | 52   | 156  | `#FD349C` | Alert/danger accent            |

## 2. Accent Colors (图表/信息图专用)

Reserved for infographics, charts, and data visualization components only.

| Name          | R    | G    | B    | HEX      |
|---------------|------|------|------|----------|
| Blue          | 118  | 210  | 255  | `#76D2FF` |
| Dark Purple   | 81   | 13   | 188  | `#510DBC` |
| Light Purple  | 180  | 151  | 255  | `#B497FF` |
| Dark Pink     | 171  | 19   | 130  | `#AB1382` |
| Light Pink    | 255  | 163  | 218  | `#FFA3DA` |
| Dark Green    | 9    | 142  | 126  | `#098E7E` |
| Green         | 0    | 192  | 174  | `#00C0AE` |
| Light Green   | 99   | 235  | 218  | `#63EBDA` |

## 3. Neutrals (灰度系)

For text, borders, backgrounds, and structural elements.

| Name   | R    | G    | B    | HEX      | Usage                       |
|--------|------|------|------|----------|-----------------------------|
| Grey 1 | 51   | 51   | 51   | `#333333` | Primary text               |
| Grey 2 | 102  | 102  | 102  | `#666666` | Secondary text             |
| Grey 3 | 153  | 153  | 153  | `#999999` | Muted text, placeholders   |
| Grey 4 | 178  | 178  | 178  | `#B2B2B2` | Disabled, light borders     |
| Grey 5 | 229  | 229  | 229  | `#E5E5E5` | Dividers, subtle borders    |
| White  | 255  | 255  | 255  | `#FFFFFF` | Card backgrounds, surface   |

## 4. Gradients (渐变)

Only TWO approved gradients. Do NOT create new gradients.

### Gradient A: Purple/Cobalt
```
linear-gradient(90deg, #7213EA 0%, #1E49E2 100%)
```
- Midpoint at 50%
- Use for premium cards, header accents

### Gradient B: Pacific/Light Blue
```
linear-gradient(90deg, #00B8F5 0%, #ACEAFF 100%)
```
- Midpoint at 50%
- Use for info cards, success states

### Rules:
- Angle: **0° (horizontal)** only
- Type: **linear gradient only**, never radial
- Color stops: 0% and 100% at ends, 50% midpoint
- **Do not create new gradients**

## 5. Traffic Light Palette (状态指示灯)

| Status | R    | G    | B    | HEX      | Usage           |
|--------|------|------|------|----------|-----------------|
| Red    | 237  | 33   | 36   | `#ED2124` | Error, danger, critical |
| Yellow | 241  | 198  | 77   | `#F1C64D` | Warning, caution      |
| Green  | 38   | 153  | 36   | `#269924` | Success, complete      |

## 6. Chart Color Order (图表配色优先级)

When using multiple colors in charts:
1. **Prioritize blues** — but they don't all need to be used at once
2. **Mix light, mid, and dark tones within data sets**
3. Recommended order:
   - Row 1: KPMG Blue (#00338D), Blue (#76D2FF), Cobalt Blue (#1E49E2), Dark Purple (#510DBC), Light Purple (#B497FF)
   - Row 2: Green (#00C0AE), Dark Pink (#AB1382), Pink (#FD349C), Light Pink (#FFA3DA), Grey tones

## 7. CSS Variable Mapping (项目变量映射)

```css
/* === Primary === */
--primary-700:  #00338D;  /* KPMG Blue */
--primary-400:  #1E49E2;  /* Cobalt Blue */
--primary-dark: #0C233C;  /* Dark Blue */

/* === Accent === */
--accent-500:   #00B8F5;  /* Pacific Blue */
--accent-300:   #76D2FF;  /* Blue (accent) */
--accent-light: #ACEAFF;  /* Light Blue */

/* === Purple/Pink === */
--purple:       #7213EA;  /* Purple */
--pink:         #FD349C;  /* Pink */
--magenta:      #AB1382;  /* Dark Pink */

/* === Green/Teal === */
--success:      #00C0AE;  /* Green (accent) */
--teal-400:     #098E7E;  /* Dark Green */

/* === Neutrals (Text) === */
--text-primary: #333333;  /* Grey 1 */
--text-secondary:#666666; /* Grey 2 */
--text-muted:   #999999;  /* Grey 3 */
--border:       #E5E5E5;  /* Grey 5 */
--border-light: #B2B2B2;  /* Grey 4 */

/* === Traffic Light === */
--danger:       #ED2124;  /* Red */
--warning:      #F1C64D;  /* Yellow */
--success-lite: #269924;  /* Traffic Green */

/* === Backgrounds === */
--bg-body:      #F0F0F0;  /* Page background (from theme) */
--bg-card:      #FFFFFF;  /* White */
--bg-sidebar:   #00338D;  /* KPMG Blue */
```

---

## 8. Usage Guidelines

1. **Primary colors** for UI chrome: navbars, sidebars, buttons, links
2. **Accent colors** for data viz: charts, progress indicators, status badges
3. **Neutrals** for content: body text, borders, dividers, card surfaces
4. **Gradients** only the two defined above — no custom gradients
5. **Traffic lights** strictly for status indication (error/warning/success)
6. **Dark Blue (#0C233C)** is the darkest acceptable color — avoid pure black (#000000)
