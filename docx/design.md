---
version: alpha
name: Unlumen Minimal Serif
description: A bright, airy light-mode system pairing editorial serif headlines with restrained sans-serif UI.
colors:
  primary: "#333333"
  secondary: "#6B6B6B"
  tertiary: "#F12E54"
  neutral: "#F7F7F7"
  surface: "#FFFFFF"
  on-surface: "#333333"
  border: "#E5E7EB"
  success: "#11C58A"
  error: "#F12E54"
typography:
  headline-display:
    fontFamily: "Instrument Serif"
    fontSize: 60px
    fontWeight: 400
    lineHeight: 60px
    letterSpacing: 0px
  headline-lg:
    fontFamily: "Instrument Serif"
    fontSize: 48px
    fontWeight: 400
    lineHeight: 52px
    letterSpacing: 0px
  headline-md:
    fontFamily: "Instrument Serif"
    fontSize: 36px
    fontWeight: 400
    lineHeight: 40px
    letterSpacing: 0px
  headline-sm:
    fontFamily: "Instrument Sans"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 32px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: "Instrument Sans"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
    letterSpacing: 0px
  body-md:
    fontFamily: "Instrument Sans"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 28px
    letterSpacing: 0px
  body-sm:
    fontFamily: "Instrument Sans"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0px
  label-lg:
    fontFamily: "Instrument Sans"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0px
  label-md:
    fontFamily: "Instrument Sans"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0px
  label-sm:
    fontFamily: "Instrument Sans"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0px
  nav-link:
    fontFamily: "Instrument Sans"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 6px
  md: 8px
  lg: 10px
  xl: 12px
  full: 9999px
spacing:
  xs: 6px
  sm: 16px
  md: 28px
  lg: 44px
  xl: 64px
  gutter: 24px
  margin: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.lg}"
    padding: 8px 12px
    height: 36px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.lg}"
    padding: 8px 12px
    height: 36px
  button-link:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tertiary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 0px
    height: 0px
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 16px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 12px 14px
    height: 44px
---

# Unlumen Minimal Serif

## Overview
Unlumen feels quiet, refined, and airy, with a distinctly editorial personality. It targets design-conscious users who value clarity, tasteful motion, and a premium-but-unfussy presentation. The page is intentionally sparse, using large whitespace to make the few messages and actions feel deliberate and confident.

## Colors
- **Primary (#333333):** The main ink color for navigation, body text, and UI chrome. It reads as soft charcoal rather than pure black, which keeps the interface elegant and less severe.
- **Secondary (#6B6B6B):** A subdued gray used for supportive text and low-emphasis metadata. It preserves hierarchy without competing with the headline.
- **Tertiary (#F12E54):** A vivid coral-pink accent used for links, emphasis, and small highlights like the dot in the hero headline. This is the system’s energetic signature color.
- **Neutral (#F7F7F7):** A very light gray used as the ambient background tone. It creates a gentle, warm-white canvas instead of stark clinical white.
- **Surface (#FFFFFF):** Pure white is reserved for clean interactive surfaces and crisp contrast when needed.
- **On-surface (#333333):** The default readable text color on white or light neutral surfaces.
- **Border (#E5E7EB):** A pale divider tone for cards and subtle framing when structure is needed.
- **Success (#11C58A):** A small status accent for the online indicator in the header.
- **Error (#F12E54):** Error states should reuse the same coral accent to maintain the brand’s energetic voice.

## Typography
The system pairs **Instrument Serif** for display headings with **Instrument Sans** for everything functional. The serif face gives the hero a crafted, editorial tone, while the sans-serif keeps navigation, labels, and paragraph text clean and modern.

- **headline-display / headline-lg / headline-md:** Use Instrument Serif at large sizes for hero statements and section titles. These should stay regular weight, with tight leading and no tracking so the forms feel elegant and literary.
- **headline-sm:** Use Instrument Sans for smaller subheads where clarity matters more than drama. The slight negative letter-spacing keeps the voice polished without feeling trendy.
- **body-lg / body-md / body-sm:** Use Instrument Sans with comfortable line height, prioritizing readability in long-form supporting copy. Body text should remain light in tone and never overly dense.
- **label-lg / label-md / label-sm:** Use medium-weight Instrument Sans for navigation, buttons, and short UI labels. These should feel precise and understated rather than bold.
- **nav-link:** Navigation text is small, calm, and evenly spaced, with no uppercase treatment visible. The overall typography avoids extra decoration and relies on size and contrast for hierarchy.

## Layout & Spacing
The page uses a highly spacious, centered composition with a strong vertical focal point in the hero. Navigation sits in a single horizontal row near the top edge, while the headline block is centered far below, creating a gallery-like rhythm rather than a dense marketing layout.

Spacing follows a restrained scale: **6px, 16px, 28px, 44px, and 64px**. Use smaller values for inline relationships and icon/text alignment, then step up quickly for section separation and hero breathing room. Cards and surface containers should keep padding compact and consistent, around **16px** to **24px**, so the interface stays light.

## Elevation & Depth
Depth is intentionally minimal. The design relies on flat surfaces, white space, and soft tonal separation instead of pronounced shadows or layered elevation. When structure is needed, use a faint border like **Border (#E5E7EB)** or a very subtle shadow only for the smallest interactive cues.

The hierarchy should come from contrast, typography, and placement rather than heavy surface stacking. This keeps the system calm and modern, and prevents UI chrome from overpowering the content.

## Shapes
The shape language is gently rounded and friendly, with a polished 8px–10px family of radii. Interactive elements should feel soft but not pill-shaped, while larger containers can stay closer to 8px to preserve restraint.

- **rounded.lg / rounded.xl:** Best for buttons and interactive controls.
- **rounded.md:** Best for cards and light containers.
- **rounded.full:** Reserve for circular indicators or avatars only.
- **rounded.none:** Use sparingly for links and structural edges.

## Components
Buttons are compact, calm, and minimally styled.

- **Primary button (`button-primary`):** Dark charcoal fill with white text, medium weight, and a small footprint. Use **36px** height and **8px 12px** padding for header actions and key CTAs.
- **Secondary button (`button-secondary`):** Similar sizing to primary, but visually quieter. Use when an action should read as available without dominating the layout.
- **Link button (`button-link`):** Coral text with no container, no border, and no padding. Use for inline emphasis and text-level navigation.
- Button states should remain subtle; avoid large shadows or aggressive hover treatment. A slight tonal shift or underline is enough.

Cards are simple bordered containers with a light neutral fill and small radius. They should feel like content frames rather than elevated panels. Use **16px** padding by default and keep content spacing disciplined.

Inputs should be clean, white, and lightly bordered, with comfortable internal padding and a controlled height around **44px**. Focus states should be clear but understated, using the accent color or a subtle ring instead of heavy outlines.

Navigation links are minimal text-only items with no uppercase styling. Icons in the header should stay monochrome, with the green dot acting as the only status signal.

## Do's and Don'ts
- Do keep compositions airy with large blocks of whitespace and modest content density.
- Do use Instrument Serif only for major editorial headlines; let Instrument Sans handle the interface.
- Do reserve the coral accent for emphasis, links, and small moments of delight.
- Do favor subtle borders and flat surfaces over layered shadows.
- Don't introduce saturated secondary colors that compete with the accent.
- Don't over-round controls into pills unless they are truly circular indicators.
- Don't use bold weights for body copy or navigation; the system is intentionally light.
- Don't clutter the header or hero with extra actions, badges, or decorative elements.