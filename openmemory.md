# OpenMemory Guide - LuxEstate (Jitka Jedličková Integration)

## Overview
**Project:** LuxEstate - Luxury Real Estate Platform  
**Integration:** Jitka Jedličková as the primary real estate expert (2025)  
**Goal:** Present Jitka Jedličková as the HEART of LuxEstate - the primary real estate expert specializing in South Moravian Region since 2012.

## Architecture

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS 3.4 + Glassmorphism effects
- **Animations:** Framer Motion 10.18
- **Icons:** Lucide React
- **Images:** Next.js Image optimization
- **Colors:** Indigo (#6366f1) accent theme

### Key Design Patterns
1. **Glassmorphism Cards:** `glass rounded-3xl p-8 border border-white/10`
2. **Indigo Gradient Accents:** `bg-gradient-to-r from-indigo-600 to-purple-600`
3. **Dark Theme:** `bg-gray-900 to-navy` gradients
4. **Hover Effects:** Scale transforms + shadow transitions
5. **Framer Motion:** Page transitions and component animations

## User Defined Namespaces
- `expert-jitka` - Jitka Jedličková expert integration
- `components-expert` - Expert-related components
- `seo-person` - Person schema.org markup

## Components

### ExpertHero.tsx
**Location:** `src/components/ExpertHero.tsx`  
**Purpose:** Hero section for homepage featuring Jitka Jedličková  
**Features:**
- Large photo with glassmorphism frame
- H1: "Za LuxEstate stojí Jitka Jedličková – tvá expertka od 2012"
- Bio snippet with quote styling
- Contact info overlay (email: jitka@realityproradost.cz, phone: +420 XXX XXX XXX)
- Stats counter (13+ years, 500+ clients, 100% personal approach)
- CTA buttons to expert page and personal website

**Key Styling:**
- Photo hover: `scale-105` + grayscale removal
- Glassmorphism: `backdrop-blur-md bg-white/5 border border-white/10`
- Indigo glow: `shadow-indigo-500/20` on hover

### Jitka Jedličková Page
**Location:** `src/app/expert/jitka-jedlickova/page.tsx`  
**Purpose:** Complete expert profile page with SEO optimization  
**SEO Metadata:**
- Title: "Jitka Jedličková – Realitní makléřka JMK | LuxEstate"
- Description: "Specialistka od 2012 s osobním přístupem. Kontakt pro prodej/koupě/spolupráci."
- Schema.org Person markup included

**Content Structure:**
1. Hero section (reuses ExpertHero)
2. Main bio with 3 pillars (Listening, Trust, Comprehensive service)
3. Services grid (Sales, Purchase, Developer projects, Investment)
4. Testimonials with ratings
5. Contact card with sticky positioning
6. CTA: "Napiš Jitce – tvá cesta k vysněnému domovu začíná tady"

### LuxEstimateWithExpert.tsx
**Location:** `src/components/LuxEstimateWithExpert.tsx`  
**Purpose:** Enhanced LuxEstimate component with expert verification  
**Extension of:** Original `LuxEstimate.tsx`  
**Added Features:**
- "Zkontrolováno Jitkou Jedličkovou" badge
- Mini photo + verification badges
- CTA: "Diskutuj odhad s Jitkou"
- Quick contact information
- Expert stats overlay (500+ properties, 98% satisfaction, 13+ years)

**Integration:** Wraps existing LuxEstimate, adds expert section below

### Footer.tsx
**Location:** `src/components/Footer.tsx`  
**Purpose:** Updated footer with "Odborný garant: Jitka Jedličková" section  
**Features:**
- Expert section spanning 2 columns
- Photo with "Od 2012" badge
- Short bio emphasizing partnership with REALITY PRORADOST s.r.o.
- Contact links (email, phone)
- CTA: "Spolupracuj s Jitkou – pro developery i makléře"
- Quick links and legal information
- Schema.org microdata in bottom bar

## Patterns

### Jitka Integration Pattern
1. **Consistent Contact Info:**
   - Email: `jitka@realityproradost.cz`
   - Phone: `+420 XXX XXX XXX`
   - Website: `https://www.jitkajedlickova.cz`

2. **Visual Identity:**
   - Indigo color scheme (#6366f1)
   - Glassmorphism containers
   - Professional black & white photos with indigo overlays
   - "Od 2012" badges

3. **Messaging:**
   - "Srdce LuxEstate" (Heart of LuxEstate)
   - "Specialistka na Jihomoravský kraj od 2012"
   - "Osobní, empatický přístup"
   - Partner: "REALITY PRORADOST s.r.o."

### SEO Implementation
1. **Schema.org Person Markup:** Included in expert page
2. **Keyword Optimization:** "realitní makléřka Brno", "nemovitosti Jihomoravský kraj"
3. **OpenGraph Tags:** Profile type with expert photo
4. **Structured Data:** For better search engine understanding

### Animation Patterns
1. **Fade-in Sequences:** Staggered animations for content sections
2. **Hover Effects:** Photo zoom, button scale, shadow transitions
3. **Micro-interactions:** Button pulses, icon movements
4. **Scroll Indicators:** Animated scroll prompts

## Implementation Notes

### File Structure
```
src/
├── components/
│   ├── ExpertHero.tsx              # Homepage hero
│   ├── LuxEstimateWithExpert.tsx   # Enhanced estimate
│   └── Footer.tsx                  # Updated footer
└── app/
    └── expert/
        └── jitka-jedlickova/
            └── page.tsx            # Expert profile page
```

### Dependencies Used
- Existing: `framer-motion`, `lucide-react`, `next/image`
- Utility: `@/lib/cn` for class merging
- No new dependencies required

### Responsive Design
All components are fully responsive:
- Mobile: Single column layouts
- Tablet: Adjusted grids
- Desktop: Multi-column with optimal spacing

## Future Considerations

### Potential Enhancements
1. **Booking System:** Calendar integration for consultations
2. **Testimonial Carousel:** Interactive slider for client reviews
3. **Case Studies:** Detailed property transaction examples
4. **Video Introduction:** Embedded video profile
5. **Social Proof:** Integration with professional networks

### Maintenance
1. **Photo Updates:** Keep expert photos current
2. **Contact Info:** Regular verification of email/phone
3. **Testimonials:** Periodic addition of new client feedback
4. **SEO Monitoring:** Track search performance for expert keywords

---

*Last Updated: 2025-12-06*  
*Integration Status: Complete ✅*  
*Expert Focus: Jitka Jedličková as primary LuxEstate agent*
