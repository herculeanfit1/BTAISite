# UI/UX Design Document (uxdesign.md)

## 1. Design Principles

- **Approachable & Trustworthy**: Clean layouts, human-centered imagery
- **Accessible**: WCAG AA compliant (color contrast, keyboard nav)
- **Responsive & Mobile‑First**: Fluid grids, thumb‑friendly navigation
- **Modern Interactions**: Dark mode support, micro‑interactions for feedback

## 2. Brand Style Guide Summary

- **Color Palette**: `primary: #5A8CA0`, `secondary: #C4C4C4`, `accent: #47C2E2`, `dark: #1E1E1E`
- **Typography**: Roboto (Headings: Bold, H1 36px; Body: Regular, 16px)
- **Iconography**: Outline icons with 2px stroke, rounded corners, brand colors
- **Imagery**: Custom illustrations depicting humans + AI, abstract network motifs

## 3. Key Components & Patterns

| Component       | Description                                     | Variants/States           |
| --------------- | ----------------------------------------------- | ------------------------- |
| **NavBar**      | Logo + menu; dark mode toggle; mobile hamburger | default, scrolled, mobile |
| **Hero**        | Headline, sub‑text, CTA button, illustration    | light/dark bg             |
| **ServiceCard** | Icon + title + description; hover elevation     | default, hover            |
| **Button**      | Primary (rounded) + secondary (outline)         | hover, active, disabled   |
| **FormField**   | Input with label; focus ring; error state       | default, focused, error   |
| **Footer**      | Links, social icons, copyright                  | light/dark                |

## 4. Layout & Wireframes

1. **Home Page**
   - Hero at top
   - Services grid (3‑cols on desktop, 1‑col on mobile)
   - Case study teaser
   - CTA banner
   - Footer
2. **About Page**
   - Team grid
   - Mission statement
   - Trust badges/testimonials
3. **Services Page**
   - Sectioned by service type
   - Each with icon + description + Learn More link
4. **Blog Listing**
   - Two‑column grid of post cards
   - Sidebar: categories/tags on desktop only
5. **Contact Page**
   - Intro text + instructions
   - BookingEmbed component
   - Fallback contact form (name, email, message)

## 5. Interaction & Micro‑interactions

- **Link Hover**: Color fade (`transition-colors duration-200`)
- **Button Press**: `active:scale-95` and shadow change
- **Form Focus**: ring around input (`focus:ring-primary`)
- **Dark Mode Toggle**: Smooth icon swap + background transition
- **Scroll Animations**: Fade‑in for sections on view (optional)

## 6. Accessibility Considerations

- All images with `alt` text
- Keyboard‑focusable elements with visible outline
- Sufficient color contrast (AA)
- Semantic HTML (ARIA roles if necessary)

## 7. Design Assets & Resources

- **Logo SVG**: `/public/logo.svg`
- **Illustrations**: `/public/illustrations/` (hero, feature set)
- **Icons**: `/components/icons/` (React components)
- **Fonts**: Roboto via Google Fonts import in `globals.css`
