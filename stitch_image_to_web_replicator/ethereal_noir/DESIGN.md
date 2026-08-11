---
name: Ethereal Noir
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d4c0d7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#9d8ba0'
  outline-variant: '#514255'
  surface-tint: '#ecb2ff'
  primary: '#ecb2ff'
  on-primary: '#520071'
  primary-container: '#bd00ff'
  on-primary-container: '#ffffff'
  inverse-primary: '#9900cf'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#c8c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#777676'
  on-tertiary-container: '#ffffff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f8d8ff'
  primary-fixed-dim: '#ecb2ff'
  on-primary-fixed: '#320047'
  on-primary-fixed-variant: '#74009f'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 84px
    fontWeight: '700'
    lineHeight: 92px
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.15em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  grid-margin: 4rem
  grid-gutter: 1.5rem
  section-padding: 8rem
  stack-sm: 0.5rem
  stack-md: 1.5rem
  stack-lg: 3rem
---

## Brand & Style

This design system embodies a **Futuristic High-Fashion** aesthetic, blending the avant-garde with digital precision. It is designed for luxury creative platforms, elite modeling agencies, or high-end tech lifestyle brands that want to evoke a sense of mystery, exclusivity, and innovation.

The visual language is rooted in **Glassmorphism** and **Minimalism**, utilizing deep obsidian backgrounds to allow neon accents to vibrate. The mood is ethereal yet grounded by structural grids, creating a digital "runway" experience. The interface should feel like a breathing, glowing entity—sophisticated, dark, and unapologetically bold.

## Colors

The palette is anchored by a deep **Obsidian (#080808)** base to provide maximum contrast for atmospheric elements. 

- **Primary:** A "Neon Electric Purple" used for interactive focal points, glowing gradients, and critical calls to action.
- **Secondary:** "Stark White" is reserved for high-readability typography and thin structural lines.
- **Atmospheric Tones:** Translucent layers of dark grey and deep violet are used to create the "ethereal" depth seen in the reference image.
- **Gradients:** Use radial gradients transitioning from `#BD00FF` to `#000000` with 0% opacity for localized "glow" effects behind key imagery or buttons.

## Typography

The typography system focuses on wide, geometric forms that feel architectural. 

- **Display & Headlines:** Using **Sora** for its futuristic, wide-set proportions. Large-scale headings should often use "optical kerning" to feel like a logo. The first letter of paragraphs can be oversized or emphasized with a unique weight to mimic editorial layouts.
- **Body:** **Hanken Grotesk** provides a clean, contemporary feel with high legibility against dark backgrounds.
- **Labels/UI:** **Space Grotesk** is used for navigation, small buttons, and technical data, providing a subtle "tech" undertone without being overly "coder-core."

## Layout & Spacing

The layout philosophy follows a **Fixed 12-Column Grid** with extreme vertical breathing room. 

- **Asymmetry:** Content should be placed with intentional asymmetry. For example, text blocks should frequently align to a different column start than the primary imagery to create a sense of movement.
- **Safe Zones:** Use wide lateral margins (64px+) to keep the focus on the center "stage."
- **Thin Rules:** Use 1px vertical borders (color: white, opacity: 10%) to subtly define grid columns, as seen in the reference image. These lines act as guideposts for the eye in an otherwise ethereal space.

## Elevation & Depth

Hierarchy is established through **Luminosity** rather than traditional shadows.

- **Background Blurs:** UI containers (like navigation bars or cards) should use `backdrop-filter: blur(20px)` with a slightly transparent dark fill.
- **Glows:** Instead of drop shadows, use "Outer Glows" for primary buttons and active states. The glow should match the primary neon purple but at a low opacity (20-30%).
- **Layering:** Background images should feel like they are "behind a veil," while active text and interactive elements sit "on top of the glass."

## Shapes

The shape language is defined by **Extreme Pill Shapes** and **Circular Motifs**.

- **Containers:** Small buttons and interactive pills use maximum radius to create a fluid, organic feel that contrasts against the sharp, wide-set typography.
- **Imagery:** Photos should be contained in either sharp rectangles or extreme-radius "stadium" shapes to maintain a high-fashion editorial look.
- **Iconography:** Use ultra-thin (1pt) stroke icons to maintain the "fine-line" aesthetic.

## Components

### Buttons & Interaction
- **Primary:** Pill-shaped, white text on a translucent dark background with a 1px white border. On hover, the background fills with the neon purple primary color and emits a soft glow.
- **Ghost/Text:** Purely typographic with a small animated underline or dot indicating focus.

### Input Fields
- Ultra-minimalist. A single 1px line or a pill-shaped container with `backdrop-filter: blur(10px)`. Text should be centered within the field for a bespoke feel.

### Cards & Modules
- No heavy borders. Use a subtle gradient stroke (white to transparent) to define edges. Content inside modules should have generous internal padding (min 32px).

### Navigation
- A floating "pill" at the top of the screen. Items should be spaced widely. Use a "Frosted Glass" effect to ensure legibility as the user scrolls over vibrant background imagery.