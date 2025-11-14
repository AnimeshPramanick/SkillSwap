# SkillSwap UI Design System Reference

## 🎨 Color System

### Primary Palette
```
Blue       #3B82F6  ███ Primary brand color
Blue Dark  #2563EB  ███ Hover/Active state
Blue DK    #1D4ED8  ███ Pressed state
```

### Secondary Palette
```
Cyan       #06B6D4  ███ Accent color
Cyan Dark  #0891B2  ███ Hover state
```

### Status Colors
```
Success    #10B981  ███ Positive actions
Warning    #F59E0B  ███ Warnings/Info
Danger     #EF4444  ███ Errors/Delete
```

### Neutral Grays
```
Light      #FFFFFF  ███ Background
Gray 50    #F8F9FA  ███ Light backgrounds
Gray 100   #F1F5F9  ███ Section backgrounds
Gray 200   #E2E8F0  ███ Borders (light)
Gray 700   #343A40  ███ Text (dark)
Gray 900   #212529  ███ Text (darkest)
```

### Dark Mode Palette
```
Very Dark  #0a0e27  ███ Main background
Dark       #1f2937  ███ Cards background
Light      #f3f4f6  ███ Primary text
Lighter    #d1d5db  ███ Secondary text
```

---

## 📏 Typography System

### Headings
```
H1: 48px, weight 700, spacing tight (1.2)
H2: 32px, weight 700, spacing normal (1.3)
H3: 24px, weight 600, spacing normal (1.4)
```

### Body Text
```
Body:  16px, weight 400, spacing relaxed (1.6)
Label: 14px, weight 500, spacing normal (1.4)
Small: 12px, weight 400, spacing relaxed (1.5)
```

### Font Family
```
Primary: Inter, -apple-system, BlinkMacSystemFont
Fallback: system-ui, sans-serif
```

---

## 📐 Spacing System

```
xs   = 8px    (very compact)
sm   = 12px   (compact)
md   = 16px   (standard)
lg   = 24px   (spacious)
xl   = 32px   (very spacious)
xxl  = 48px   (section spacing)
xxxl = 64px   (page padding)
```

---

## 🎲 Border Radius

```
sm = 8px    (small elements)
md = 12px   (cards, buttons)
lg = 16px   (large sections)
```

---

## 🌟 Shadow System

### Depth Levels
```
sm   = 0 2px 6px rgba(0,0,0,0.04)
md   = 0 4px 12px rgba(0,0,0,0.08)
lg   = 0 10px 30px rgba(0,0,0,0.12)
card = 0 10px 30px rgba(0,0,0,0.08)
lg+  = 0 20px 50px rgba(0,0,0,0.12)
```

### Dark Mode Shadows
```
md (dark) = 0 4px 12px rgba(0,0,0,0.3)
lg (dark) = 0 10px 30px rgba(0,0,0,0.4)
```

---

## ✨ Gradient System

### Primary Gradient
```css
background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
```

### Accent Gradients (Dashboard Stats)
```
Blue    → #3B82F6 to #2563EB
Cyan    → #06B6D4 to #0891B2
Green   → #10B981 to #059669
Amber   → #F59E0B to #D97706
```

### Hero Gradient (Landing)
```css
background: linear-gradient(to br, #fff via-blue-50 to-cyan-50);
```

### Header Gradient
```css
background: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%);
```

---

## ⏱️ Animation Timing

### Durations
```
Fast      = 150ms  (quick interactions)
Normal    = 300ms  (standard animations)
Slow      = 500ms  (page transitions)
```

### Easing Functions
```
Smooth    = cubic-bezier(0.25, 0.8, 0.25, 1)
Standard  = cubic-bezier(0.25, 0.46, 0.45, 0.94)
Linear    = ease
```

### Common Animations
```
Hover Lift      = translateY(-4px to -8px)
Scale           = scale(1.05 to 1.1)
Fade            = opacity 0 to 1
Slide           = translateX/Y with easing
```

---

## 📦 Component Reference

### Buttons

**Primary Button**
```
Background: #3B82F6
Text: White
Padding: 12px 24px
Radius: 8px
Hover: #2563EB + lift effect
Active: scale 0.98
```

**Secondary Button**
```
Background: #F8F9FA (light) / #374151 (dark)
Text: #343A40 / #f3f4f6
Border: 1px solid #e2e8f0
Hover: Background #F1F5F9
```

**Outline Button**
```
Background: transparent
Border: 1px solid #3B82F6
Text: #3B82F6
Hover: Background rgba(59,130,246,0.1)
```

### Cards

**Standard Card**
```
Background: white (light) / #1f2937 (dark)
Border-radius: 12px
Padding: 24px
Box-shadow: 0 4px 12px rgba(0,0,0,0.08)
Hover: translateY(-2px) + enhanced shadow
```

**Stat Card**
```
Background: white
Border-top: 4px colored (blue/cyan/green/amber)
Padding: 24px
Icon-bg: Gradient (colored)
Number: 32px, bold, blue
Description: 14px, gray
```

### Badges

**Success Badge**
```
Background: #E8F5E9
Text: #2E7D32
Padding: 6px 12px
Radius: 6px
Font: 12px, bold 600
```

**Warning Badge**
```
Background: #FFF3E0
Text: #E65100
Padding: 6px 12px
Radius: 6px
Font: 12px, bold 600
```

### Tags

**Skill Tag**
```
Background: #EFF6FF (light) / #1e3a8a (dark)
Text: #0B3D91 (light) / #93c5fd (dark)
Padding: 8px 12px
Radius: 8px
Font: 14px, bold 500
```

---

## 🎯 Layout System

### Container
```
Max-width: 1280px
Padding: 0 24px
Centered: auto margins
```

### Grid
```
Dashboard Stats: 1-4 columns (responsive)
Quick Actions: 1-4 columns (responsive)
Features: 1-2-4 columns (responsive)
Gap: 24px
```

### Sections
```
Padding: 64px (top/bottom)
Padding-mobile: 48px
```

---

## 🌙 Dark Mode

### CSS Variable Overrides
```css
html.dark {
  --color-neutral-0: #0a0e27;
  --color-neutral-50: #1f2937;
  --color-neutral-900: #f3f4f6;
  --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
}
```

### Component Adjustments
- All text colors inverted
- Shadows increased opacity
- Borders adapted for visibility
- Gradients maintained/adjusted

---

## 🚀 Design Tokens CSS Variables

```css
/* Colors */
--color-primary-500: #3B82F6;
--color-primary-700: #1D4ED8;
--color-neutral-0: #FFFFFF;
--color-success: #28a745;

/* Spacing */
--space-xs: 8px;
--space-md: 16px;
--space-lg: 24px;

/* Typography */
--font-primary: Inter, system-ui;
--text-h1: 48px bold;
--text-body: 16px 400;

/* Shadows */
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 10px 30px rgba(0,0,0,0.12);

/* Animations */
--transition-fast: all 150ms ease;
--transition-base: all 300ms cubic-bezier(0.25,0.8,0.25,1);
```

---

## 📱 Responsive Breakpoints

```
xs  = 375px   (mobile)
sm  = 640px   (tablet)
md  = 768px   (small desktop)
lg  = 1024px  (desktop)
xl  = 1280px  (large desktop)
2xl = 1536px  (extra large)
```

---

## ♿ Accessibility

### Color Contrast
- Text: WCAG AAA (7:1 minimum)
- Links: WCAG AA (4.5:1 minimum)
- Focus: 2px outline, 2px offset

### Touch Targets
- Minimum: 44x44px
- Buttons: 48x48px preferred
- Links: Adequate padding around text

### Keyboard Navigation
- All interactive elements focusable
- Tab order logical
- Escape key closes modals
- Enter/Space activates buttons

---

## 📝 Usage Guidelines

### When to Use Colors
- **Blue:** Primary actions, links, trusted info
- **Cyan:** Accents, secondary actions
- **Green:** Success, positive outcomes
- **Amber:** Warnings, need attention
- **Red:** Errors, dangerous actions

### When to Use Shadows
- **sm:** Input fields, hover states
- **md:** Cards, buttons
- **lg:** Modals, overlays
- **card:** Product cards, feature boxes

### When to Use Gradients
- **Primary:** Main brand elements
- **Accent:** Stat cards, special items
- **Hero:** Large background sections

---

## 🎬 Animation Guidelines

- Use for feedback (button clicks)
- Enhance interactions (hover effects)
- Guide attention (entrance animations)
- Keep under 300ms for snappy feel
- Disable with `prefers-reduced-motion`

---

## ✅ Implementation Checklist

When building new features:

- [ ] Use design tokens (not hardcoded colors)
- [ ] Apply 300ms transitions
- [ ] Test dark mode support
- [ ] Verify responsive design
- [ ] Check accessibility (focus states)
- [ ] Use proper shadow depth
- [ ] Apply typography scale correctly
- [ ] Maintain spacing consistency

---

**Design System Version:** 1.0  
**Last Updated:** November 13, 2025  
**Status:** Active & Maintained
