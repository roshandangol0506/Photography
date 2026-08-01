# Photography Website — Complete Frontend UI Redesign

You are working on an existing full-stack photography portfolio + CMS application.

I want you to completely redesign the **PUBLIC FRONTEND WEBSITE UI** so it feels like a premium, award-winning, high-end photographer's website.

The current website is functional, but the visual design needs to be dramatically improved.

## PRIMARY OBJECTIVE

Transform the existing public photography website into a:

- Highly premium
- Highly visual
- Editorial
- Cinematic
- Artistic
- Sophisticated
- Modern
- Elegant
- Immersive
- Animated
- Responsive
- Professional photographer portfolio

The final result should feel like a website designed by a high-end digital agency for an internationally recognized photographer.

Do NOT make it look like a normal SaaS website, generic portfolio template, dashboard, or standard Tailwind landing page.

Photography must be the primary visual focus.

The website should make visitors stop scrolling and explore the photographer's work.

---

# VERY IMPORTANT — FIRST ANALYZE THE ENTIRE PROJECT

Before changing anything:

1. Read the entire frontend codebase.
2. Understand the existing routing.
3. Understand every public page.
4. Understand every public component.
5. Understand the API hooks and how public data is fetched.
6. Understand the ThemeProvider.
7. Understand SiteSettings.
8. Understand how theme colors are dynamically injected.
9. Understand how photos, collections, categories, awards, testimonials, About content, hero images, etc. are controlled from the admin dashboard.
10. Understand the existing animation system.
11. Understand the existing image optimization/progressive loading system.
12. Understand the existing PhotoViewer/lightbox.
13. Understand mobile and responsive behavior.
14. Understand the existing SEO behavior.
15. Identify reusable components before creating new ones.

Do not start modifying files immediately.

First create a short internal implementation/design plan based on the existing architecture.

Do not rewrite the backend.

---

# SCREENSHOTS / DESIGN REFERENCES

I will provide screenshots/reference images.

Use the screenshots as **visual inspiration and structural reference**, not something to blindly copy.

Analyze:

- Layout
- Typography
- Spacing
- Image proportions
- Navigation
- Section composition
- Whitespace
- Visual hierarchy
- Animations
- Hover interactions
- Transitions
- Image treatment
- Decorative elements
- Color usage
- Typography scale
- Editorial composition
- Mobile behavior

Then create a design language that combines the strongest ideas from the references with your own professional UX/UI decisions.

DO NOT simply reproduce the screenshot.

The goal is:

**Reference screenshot → understand design language → create a better, cohesive photography experience.**

---

# CRITICAL CONSTRAINT — FRONTEND ONLY

This is extremely important.

## DO NOT CHANGE:

- Backend
- Express routes
- Controllers
- Services
- MongoDB models
- Database schemas
- API endpoints
- Authentication
- Authorization
- Admin dashboard logic
- Admin API logic
- Photo upload logic
- Image processing
- Storage logic
- Database queries
- Existing business logic

Do not modify backend files unless absolutely required for compilation, and if something appears necessary, stop and explain why before doing it.

The task is fundamentally a **frontend UI/UX redesign**.

---

# DO NOT BREAK EXISTING FUNCTIONALITY

The existing frontend functionality must continue working.

Preserve:

- React Query
- Existing API hooks
- Axios configuration
- Authentication
- Visitor tracking
- Likes
- Comments
- Photo viewing
- Photo navigation
- Photo sharing/deep links
- Infinite gallery loading
- Search
- Categories
- Collections
- Awards
- Testimonials
- Contact form
- Theme switching
- Dynamic theme colors
- Admin-controlled content
- SiteSettings
- Hero settings
- Animation toggle
- Dark mode
- SEO behavior
- Responsive behavior

Do not replace working functionality simply because you are redesigning the UI.

---

# EXISTING ADMIN CMS — DESIGN AROUND IT

The admin dashboard already allows the photographer/admin to manage the website content.

The public frontend must dynamically consume that content.

The admin can control things such as:

- Site title
- Tagline
- Logo
- Primary color
- Secondary color
- Accent color
- Hero images
- Hero autoplay speed
- Hero transition style
- About title
- About description
- About image
- Experience years
- Social links
- Contact details
- Footer text
- Animation enable/disable
- Dark mode default
- Photos
- Featured photos
- Trending photos
- Home photos
- Side-scroll photos
- Categories
- Collections
- Awards
- Testimonials

Therefore:

**Never hardcode content that should come from the existing APIs/SiteSettings.**

The new UI should be a beautiful presentation layer over the existing data.

---

# PUBLIC ROUTES

The current public site contains:

- `/`
- `/gallery`
- `/about`

Redesign these pages completely.

If the existing architecture allows additional public routes without affecting backend logic, you may introduce useful presentation pages such as:

- Collection detail
- Category detail
- Individual photo experience

But do not create unnecessary routes if the existing API/router architecture already provides the required experience.

---

# DESIGN DIRECTION

Think:

**Luxury photography magazine + cinematic portfolio + modern editorial website + art gallery.**

Avoid:

- Generic cards everywhere
- Excessive rounded rectangles
- SaaS-style dashboards
- Excessive shadows
- Generic gradients
- Huge amounts of text
- Standard 3-column landing page layouts
- Repetitive cards
- Cookie-cutter Tailwind designs
- Overuse of glassmorphism
- Excessive UI borders

Instead use:

- Strong typography
- Dramatic whitespace
- Large photography
- Asymmetrical layouts
- Editorial grids
- Full-screen imagery
- Layered compositions
- Overlapping elements
- Vertical rhythm
- Image cropping
- Elegant typography
- Subtle borders
- Fine decorative lines
- Small metadata
- Large display typography
- Cinematic transitions
- Scroll-driven storytelling

---

# TYPOGRAPHY

The existing project currently lacks a strong typographic identity.

Create a deliberate typography system.

Use a sophisticated combination such as:

- Elegant editorial serif/display font for major headings
- Clean modern sans-serif for UI/body
- Small uppercase tracking for metadata and labels

Do not use typography randomly.

Establish a clear hierarchy:

Display
→ Section heading
→ Subheading
→ Body
→ Metadata
→ Micro labels

Typography should feel intentional and editorial.

If external Google Fonts are appropriate, use them responsibly. Avoid adding excessive fonts.

---

# COLOR SYSTEM

The existing application already supports dynamic theme colors.

Respect the existing theme system.

Do NOT hardcode the primary website colors throughout components.

Use the existing theme variables/tokens so that changing the theme from the admin Appearance page continues to affect the public website.

Create visual contrast using:

- Theme colors
- Background
- Foreground
- Muted tones
- Image overlays
- Opacity
- Borders
- Typography

The admin's selected theme should still visually work with the redesigned UI.

The design must not depend on one hardcoded color palette.

---

# HOME PAGE

Completely redesign the home page.

The home page should feel like a cinematic visual journey rather than a collection of standard sections.

Current content includes:

1. Hero
2. Featured Photos
3. About
4. Categories
5. Recent Works
6. Awards
7. Side-scroll photography
8. Testimonials
9. Contact
10. Footer

You may restructure the visual presentation/order if it creates a significantly better experience, but preserve the underlying content and API logic.

---

# HERO SECTION

Make the hero extremely impressive.

Possible direction:

- Full viewport
- Cinematic photography
- Dynamic background image
- Elegant typography
- Photographer name/title
- Minimal navigation
- Subtle image transitions
- Layered metadata
- Scroll indicator
- Decorative typography
- Small index/counter
- Elegant CTA

Consider:

- Slow cinematic image transitions
- Parallax
- Subtle scale movement
- Text reveal
- Mask animations
- Clip-path reveals
- Image displacement-style effects if lightweight
- Editorial overlays

Do NOT over-animate everything.

The hero should feel expensive and cinematic.

The photography should remain the hero.

---

# NAVIGATION

Create a premium navigation system.

Desktop:

- Minimal
- Elegant
- Spacious
- Strong typography
- Sophisticated scroll behavior
- Smooth transition between transparent and solid states

Mobile:

- Beautiful fullscreen or large overlay menu
- Smooth menu animation
- Large typography
- Clear navigation
- Elegant close interaction

The existing navbar already contains sophisticated animated behavior. Preserve the underlying functionality while improving its visual design where appropriate.

---

# FEATURED PHOTOGRAPHY

Do not present featured photography as ordinary cards.

Create a visually interesting editorial composition.

Possible approaches:

- Large primary image
- Smaller supporting images
- Overlapping photography
- Editorial captions
- Image numbering
- Vertical metadata
- Interactive image transition
- Scroll-based reveal
- Horizontal movement
- Large typography alongside imagery

The user should feel that they are viewing curated artwork.

---

# ABOUT SECTION

Make the About section feel like an editorial photographer profile.

Use:

- Large typography
- Photographer portrait
- Years of experience
- Short biography
- Strong CTA
- Editorial layout
- Decorative numbering
- Vertical labels
- Subtle image movement

Use the existing SiteSettings data.

Do not hardcode biography information.

---

# CATEGORIES

Transform categories into an artistic navigation experience.

Instead of basic cards:

- Large photography
- Category title
- Number/index
- Hover image transformation
- Image reveal
- Elegant typography
- Masked transitions
- Cursor interactions where appropriate

Example visual concept:

01 — Weddings
02 — Portraits
03 — Landscape
04 — Editorial

But use actual categories from the API.

---

# COLLECTIONS

Collections should feel like curated exhibitions.

Consider:

- Exhibition-style layouts
- Large cover image
- Collection title
- Photo count
- Description if available
- Hover movement
- Image transitions
- Editorial metadata

Avoid standard card grids.

---

# RECENT WORKS / GALLERY

Photography galleries need to prioritize the image.

Use a sophisticated masonry/editorial layout.

Possible layouts:

- Variable image sizes
- Masonry
- Asymmetrical grid
- Full-width feature image
- Alternating compositions
- Horizontal galleries

Maintain:

- Infinite scrolling
- Search
- Filtering
- Categories
- Collections
- Existing API functionality

The gallery should feel like an art exhibition.

---

# PHOTO INTERACTIONS

Photography should respond beautifully to interaction.

Implement tasteful:

- Image zoom
- Scale
- Mask reveals
- Caption reveals
- Metadata reveals
- Cursor effects
- Hover transitions
- Image parallax
- Magnetic buttons where appropriate

Do not make every element bounce or move.

Motion should communicate hierarchy and create atmosphere.

---

# PHOTO VIEWER / LIGHTBOX

Redesign the existing photo viewer to feel premium.

Preserve all current functionality:

- Fullscreen
- Previous/next
- Keyboard controls
- Escape
- Swipe
- Zoom
- Details drawer
- Comments
- Related photos
- URL-based photo state

Improve:

- Transition
- Typography
- Controls
- Metadata layout
- Image presentation
- Drawer design
- Mobile experience

It should feel like a professional photography gallery viewer.

---

# AWARDS

Make awards feel prestigious.

Instead of basic cards, consider:

- Timeline
- Editorial list
- Large year typography
- Award organization
- Award title
- Image
- Animated line
- Scroll reveal

Use actual award data.

---

# TESTIMONIALS

Create an elegant editorial testimonial section.

Avoid generic testimonial cards.

Possible design:

- Large quotation
- Client name
- Role
- Rating
- Avatar
- Large background typography
- Smooth carousel
- Progress indicator

Use the existing testimonial API.

---

# SIDE-SCROLL PHOTOGRAPHY

The existing project already has a continuously scrolling photography strip.

Turn this into a visually striking cinematic marquee.

Consider:

- Large images
- Variable image heights
- Editorial labels
- Camera/lens metadata
- Slow movement
- Pause on hover
- Subtle parallax

Respect the existing animation setting.

---

# CONTACT SECTION

Create a premium contact experience.

Instead of a normal form card:

- Strong statement
- Large typography
- Email
- Phone
- Location
- Social links
- Contact form
- Decorative elements

It should feel like the end of an editorial story.

CTA example concept:

"Let's create something worth remembering."

But do not hardcode identity-specific content unless appropriate.

---

# FOOTER

Create a sophisticated minimal footer.

Include existing:

- Site title/logo
- Footer text
- Social links
- Navigation
- Contact information
- Copyright

Use generous whitespace.

---

# GALLERY PAGE

Redesign the gallery page independently from the home page.

It should feel like entering an actual photography archive/exhibition.

Include:

- Large page introduction
- Category filtering
- Collection filtering if available
- Search
- Masonry/editorial grid
- Infinite loading
- Elegant image transitions
- Photo metadata
- Premium lightbox

Filters should not look like standard dashboard pills.

---

# ABOUT PAGE

Create a complete standalone photographer About experience.

It should be more immersive than the About section on Home.

Potential structure:

1. Intro
2. Photographer portrait
3. Biography
4. Experience
5. Philosophy / approach
6. Selected work
7. Awards
8. CTA
9. Contact

Only use data that exists or can safely be derived from the existing APIs/settings.

Do not invent factual biography information.

---

# ANIMATION SYSTEM

This is one of the most important parts.

The site should feel alive.

Use Framer Motion extensively but intelligently.

Implement:

### Page transitions

Smooth transitions between:

- Home
- Gallery
- About
- Collection/category views
- Photo viewer

### Scroll reveals

Use elegant:

- Fade
- Slide
- Clip reveal
- Scale
- Mask reveal
- Stagger

### Image animations

Use:

- Slow scale
- Parallax
- Reveal masks
- Crossfade
- Position shifts

### Text animations

Use:

- Character/word reveal
- Line reveal
- Fade + movement
- Staggered typography

But avoid excessive character-by-character animation.

### Hover

Use sophisticated micro-interactions.

Examples:

- Image zoom
- Caption movement
- Underline animation
- Arrow movement
- Image overlay
- Cursor interaction

---

# SCROLL-DRIVEN DESIGN

Where appropriate, use scroll position to create:

- Parallax photography
- Text movement
- Image scale
- Horizontal gallery movement
- Section transitions
- Sticky editorial compositions

But be careful with performance.

Do not create dozens of expensive scroll listeners.

Prefer Framer Motion's scroll utilities where practical.

---

# CURSOR EXPERIENCE

For desktop, consider adding a custom photography-oriented cursor.

Examples:

- Small circular cursor
- "VIEW"
- "OPEN"
- "DRAG"
- "EXPLORE"

The cursor should react to interactive photography.

Disable or simplify it on touch devices.

Do not let custom cursor behavior interfere with accessibility.

---

# DECORATIVE DESIGN ELEMENTS

Add tasteful visual details such as:

- Section numbers
- Thin lines
- Vertical labels
- Image counters
- Small uppercase metadata
- Animated separators
- Subtle grain/noise texture
- Editorial borders
- Floating captions
- Scroll indicators
- Progress indicators
- Image coordinates
- Camera metadata

Do NOT overdecorate the page.

Everything should reinforce the photography/editorial aesthetic.

---

# IMAGE QUALITY

Photography is the primary asset.

Continue using the existing optimized image pipeline.

Do not bypass:

- ProgressiveImage
- blurDataURL
- srcset
- responsive sizes
- lazy loading

Maintain good performance.

Use:

- `loading="lazy"` where appropriate
- `priority/eager` only for critical hero images
- responsive image sizes
- proper aspect ratios
- GPU-friendly transforms

Do not load unnecessarily large images.

---

# RESPONSIVE DESIGN

The website must be exceptional on:

- Large desktop
- Laptop
- Tablet
- Mobile

Do not simply shrink the desktop design.

Create intentional mobile compositions.

Mobile should preserve the premium photography experience.

Pay particular attention to:

- Hero
- Navigation
- Typography
- Gallery
- Photo viewer
- Horizontal sections
- Testimonials
- Contact
- Touch interactions

Remove hover-only interactions on touch devices.

---

# ACCESSIBILITY

Improve accessibility while redesigning.

Implement:

- Semantic HTML
- Proper heading hierarchy
- Keyboard navigation
- Visible focus states
- ARIA labels where required
- Accessible buttons
- Good contrast
- Alt text from photo data where available
- Reduced-motion support

IMPORTANT:

Respect:

`settings.animationsEnabled`

If animations are disabled from the admin Appearance settings, the new animation system must gracefully fall back to a static experience.

Also implement:

`prefers-reduced-motion: reduce`

so users who request reduced motion are not forced into aggressive animations.

The existing project currently has animation gaps here, so improve this as part of the frontend redesign.

---

# PERFORMANCE

This is a visual website, but performance is still critical.

Avoid:

- Huge JavaScript animation libraries
- Unnecessary dependencies
- Excessive DOM nodes
- Constant scroll event handlers
- Layout thrashing
- Huge unoptimized images
- Excessive blur filters
- Excessive box shadows
- Animating expensive CSS properties

Prefer GPU-friendly properties:

- transform
- opacity

Avoid animating:

- width
- height
- top
- left

unless necessary.

---

# COMPONENT ARCHITECTURE

Create reusable frontend components where appropriate.

Examples:

- EditorialSection
- SectionHeading
- MagneticButton
- AnimatedText
- ImageReveal
- ParallaxImage
- PhotoMeta
- PhotoCounter
- EditorialDivider
- ScrollIndicator
- PageTransition
- CursorFollower

Do not create unnecessary abstractions.

Reuse existing components where they are already good.

---

# EXISTING ANIMATION MECHANISMS

The existing frontend already contains:

- Framer Motion
- SectionReveal
- Hero crossfade
- Animated navbar
- FLIP photo transitions
- Infinite marquee
- Embla testimonial carousel
- Progressive image loading
- PhotoViewer animations
- PhotoDrawer spring animation
- Like-button animation
- Image hover transitions

Do not blindly delete these.

First understand them.

Improve or replace them only where the new design requires it.

Preserve functionality.

---

# ADMIN THEME INTEGRATION

This is critical.

The photographer can change:

- Primary
- Secondary
- Accent
- Dark mode
- Animation enabled/disabled
- Hero transition
- Hero autoplay speed

The new public UI must respond to those settings.

Test multiple color combinations.

Do not create a design that only looks good with the current default colors.

---

# DARK MODE

Dark mode should not simply be:

"white background → black background."

Create a deliberate dark photography experience.

Dark mode should feel cinematic.

Photography should remain visually dominant.

---

# LOADING STATES

Improve the current loading experience.

Instead of blank sections popping into existence:

Use elegant:

- Skeletons
- Blur placeholders
- Image placeholders
- Fade-in transitions
- Progressive content reveal

Do not make loading animations distracting.

---

# ERROR / EMPTY STATES

Create polished states for:

- No photos
- No collections
- No categories
- No testimonials
- API error
- Search returns nothing

These should match the overall photography aesthetic.

---

# SEO

Do not break the existing SEO implementation.

Preserve:

- Page titles
- Meta descriptions
- OG image handling
- Existing useSeo hook

Improve page-specific metadata only where it can be done without changing backend logic.

---

# IMPLEMENTATION PROCESS

Follow this process.

## STEP 1 — AUDIT

Read the entire frontend.

Identify:

- Routes
- Pages
- Components
- API hooks
- Theme system
- Animation system
- Shared UI
- Image system

## STEP 2 — DESIGN SYSTEM

Before implementing all pages, establish:

- Typography
- Spacing
- Colors
- Buttons
- Links
- Section headers
- Image treatments
- Motion language
- Decorative elements

## STEP 3 — CREATE A MOCKUP FIRST

Before fully implementing the redesign, create a working mockup/prototype of the new Home page using the existing data/API structure.

The mockup should demonstrate:

- Navbar
- Hero
- Typography
- Featured photography
- About
- Gallery/category treatment
- Animation style
- Decorative language
- Footer

Do not spend time redesigning the admin dashboard.

## STEP 4 — REVIEW THE MOCKUP INTERNALLY

Check:

- Does it actually look like a premium photographer website?
- Is photography dominant?
- Does it feel cohesive?
- Is typography strong?
- Are animations sophisticated?
- Is there enough visual variety?
- Is it too generic?
- Is it too cluttered?
- Does it work on mobile?

Iterate if necessary.

## STEP 5 — IMPLEMENT ALL PUBLIC PAGES

After the design direction is established, implement the full redesign across:

- Home
- Gallery
- About
- Photo Viewer
- Collection/category experiences where applicable

## STEP 6 — RESPONSIVE PASS

Test every page at:

- 1440px+
- 1280px
- 1024px
- 768px
- 390px
- 375px

Fix layout problems.

## STEP 7 — FUNCTIONALITY CHECK

Verify:

- API calls
- Images
- Navigation
- Filters
- Search
- Infinite loading
- Likes
- Comments
- Lightbox
- Photo navigation
- Theme switching
- Admin-driven content
- Animation setting
- Dark mode

## STEP 8 — FINAL POLISH

Add:

- Micro-interactions
- Better spacing
- Better typography
- Better transitions
- Better mobile behavior
- Loading states
- Reduced motion
- Accessibility improvements

---

# IMPORTANT RULES

1. FRONTEND UI ONLY.
2. Do not modify backend architecture.
3. Do not modify database models.
4. Do not modify APIs.
5. Do not break admin functionality.
6. Do not remove existing data functionality.
7. Do not hardcode admin-controlled content.
8. Preserve existing API hooks.
9. Preserve dynamic theme colors.
10. Preserve dark mode.
11. Preserve animation toggle.
12. Preserve image optimization.
13. Preserve SEO.
14. Preserve photo viewer functionality.
15. Preserve responsive behavior.
16. Use existing dependencies where possible.
17. Do not add dependencies unless genuinely necessary.
18. If adding a dependency, explain why.
19. Do not create generic SaaS UI.
20. Prioritize photography over UI chrome.
21. Avoid excessive cards.
22. Avoid excessive rounded containers.
23. Avoid excessive gradients.
24. Avoid excessive animations.
25. Animation should feel cinematic and intentional.
26. Respect reduced-motion preferences.
27. Test desktop and mobile.
28. Keep the code maintainable.
29. Reuse components when appropriate.
30. Do not sacrifice performance for visual effects.

---

# QUALITY BAR

Before considering the redesign complete, ask yourself:

> "Would this website look credible as the portfolio of a world-class professional photographer?"

If the answer is no, continue improving it.

The website should feel closer to:

**luxury editorial magazine + contemporary art gallery + cinematic photography portfolio**

and NOT:

**React template + Tailwind cards + generic portfolio.**

The visual hierarchy should immediately communicate:

**PHOTOGRAPHY FIRST.**

The UI exists to showcase the photographer's work, not compete with it.

---

# FINAL DELIVERABLE

After implementation:

1. Summarize the frontend files changed.
2. Explain the new design system.
3. Explain the animation system.
4. Explain how the redesign uses the existing CMS data.
5. Explain responsive behavior.
6. Explain accessibility/reduced-motion improvements.
7. Run frontend type checking.
8. Run frontend linting.
9. Fix any errors introduced by the redesign.
10. Confirm that backend/API logic was not changed.
11. Mention any new dependencies if added and why.

Do not stop after making the homepage look better.

The goal is a **complete, cohesive, premium redesign of the entire public photography experience.**
