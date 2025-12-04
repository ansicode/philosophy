# GitHub Copilot Instructions for phi.github.io

## Project Overview

This is a static GitHub Pages website documenting the **history of philosophy**. It's a pure frontend project with no build process, server, or database. The site is published to `https://ansicode.github.io/phi.github.io` via GitHub Pages.

## Architecture & Key Components

### Pages Structure
- **`index.html`** - Landing page with hero section, four era cards (Ancient, Medieval, Modern, Contemporary), featured philosophers grid, and about section
- **`eras/*.html`** - Era detail pages (`ancient.html`, `medieval.html`, `modern.html`, `contemporary.html`) that expand on each period with key schools and philosophers
- **`css/style.css`** - Single stylesheet handling responsive design (breakpoints at 768px, 480px) with gradient purple theme (#667eea→#764ba2) and blue accents (#3498db)
- **`js/main.js`** - Client-side interactivity: mobile hamburger menu toggle, smooth scroll anchor navigation, active nav link highlighting on scroll, Intersection Observer for card fade-in animations

### GitHub Pages Setup
- **`_config.yml`** - Jekyll config (minimal, mostly disabling Jekyll processing)
- **`.nojekyll`** - Empty file that prevents Jekyll processing entirely, enabling raw HTML serving
- Repository is served as `phi.github.io` subdirectory site (not user site), so GitHub Pages publishes the `main` branch directly

## Development Patterns & Conventions

### Adding Content
1. **New Philosopher**: Edit philosopher card in `index.html` with avatar letter, name, era, and description
2. **New Era Page**: Copy template from `eras/ancient.html` → create new file in `eras/` → add nav link in `index.html`
3. **Modify Colors**: Edit CSS gradients in `css/style.css` (lines ~120, ~285) - purple gradient for hero/philosopher-avatar, blue for buttons

### HTML Patterns
- All era pages share the same navbar structure (links back to index.html with hash anchors)
- Philosophers use single-letter avatars in colored circles within the gradient background
- Era cards use `border-left: 4px solid #667eea` to add visual hierarchy

### CSS Responsive Design
- **Desktop**: Era cards and philosopher grid use CSS Grid with `repeat(auto-fit, minmax(280px, 1fr))` for fluid layout
- **Tablet (768px)**: Menu hides, hamburger appears; grid becomes single column
- **Mobile (480px)**: Title hidden; menu becomes fixed overlay; hero text smaller
- No CSS variables or preprocessor - all plain CSS3

### JavaScript Interactions
- Hamburger menu state tracked with `.active` class toggle (three spans with transform animations)
- Intersection Observer watches cards, fires `fadeInUp` animation when 10% visible
- Smooth scroll via `element.scrollIntoView({behavior: 'smooth'})` for anchor links
- Active nav link updated via `pageYOffset` comparison against section offsets

## Common Tasks & Commands

### Local Testing
```bash
# Python 3
python -m http.server 8000
# Visit http://localhost:8000

# Node.js
npx http-server
# Visit http://localhost:8080
```

### Publishing to GitHub Pages
```bash
git add .
git commit -m "Update content"
git push origin main
```
(Automatic deployment; site live in ~30 seconds)

### Validation
- No build step required - validate by opening files in browser
- Check mobile view: DevTools toggle device toolbar or resize window to 768px/480px breakpoints

## File Organization Notes

- Keep era pages consistent in structure (h2 + overview paragraph, schools-grid, key-figures list)
- All pages link back to `index.html` to maintain navigation integrity
- CSS includes inline styles in era pages for `.era-detail` section - prefer editing `css/style.css` for global changes
- Main JS file (`main.js`) has ~70 lines; keep it focused on navigation and scroll effects

## External Dependencies
None - pure HTML5, CSS3, vanilla JavaScript. No frameworks, build tools, or CDNs.

## Design System Quick Reference
- **Hero Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Primary Button**: `#3498db` background, white text, hover adds shadow and lift
- **Secondary Button**: Transparent bg, `#3498db` border, inverts on hover
- **Text Colors**: Dark `#2c3e50`, medium `#666`, light `#7f8c8d`
- **Card Shadow**: `0 4px 6px rgba(0, 0, 0, 0.1)`, hover lifts to `0 12px 20px rgba(0, 0, 0, 0.15)`
