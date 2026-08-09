# Section Planning Specification: "Pilihan Menu" (Menu Options)

## 1. Overview & Inspiration

We are building a highly interactive, premium section for the homepage called `Pilihan Menu`.

- **Reference**: The layout, typography, and motion behavior are highly inspired by the "800+ Pilihan Menu" section on `https://tiskacatering.com/`.
- **Core Concept**: An auto-advancing, looping vertical tab/accordion system on the left, paired with synchronized GSAP animations on a featured media display (image gallery) on the right.
- **Vibe**: Elegant, smooth, high-end, and performant. 

## 2. Structural Layout & Responsive Behavior

The section utilizes a CSS Grid layout, adapting seamlessly from mobile to desktop.

### A. Left Column: The Interactive Menu List (DOM `order-1`, `col-span-7` on desktop)
- Displays a vertical list of active catering packages (e.g., top 5 to 7 categories).
- **Visuals**: Each list item acts as a clickable tab. It includes an index number (e.g., "01"), the package name, an arrow indicator, and a bottom border separator.
- **Active State Behavior**:
  - The text color brightens (e.g., switching to `text-gold-soft`).
  - An arrow indicator (`→`) slides in and becomes fully opaque.
  - A subtle GSAP-driven "Progress Indicator" runs (e.g., a background highlight or a border filling up over 6 seconds).
  - Once progress reaches 100%, the active state automatically jumps to the next item, looping back to the start when reaching the end.
  - **Interaction**: Manually clicking a tab immediately sets it as active, interrupts the auto-play, and restarts the timer.

### B. Right Column: The Featured Visual Display (DOM `order-2`, `col-span-5` on desktop)
- A beautifully framed, `overflow-hidden` container holding the corresponding images.
- **Visuals**: 
  - Absolute positioned images stacked on top of each other. Only the active image has `opacity: 1`.
  - A dark gradient overlay at the bottom to ensure text readability.
  - Inner content (Bottom-Left): Index, Package Title, Short Description, and a text-link CTA.
- **Animations (The "Wow" Factor)**:
  - **Ken Burns Effect**: The active image undergoes a continuous, extremely slow scale-up (e.g., from `scale(1.04)` to `scale(1.12)`) while it is active.
  - **Crossfade**: Smooth opacity transitions when switching tabs.
  - **Staggered Text Reveal**: The inner title and description animate in with a `fade-up` effect when the tab changes.

## 3. Data Architecture & Types

The content array MUST be decoupled from the UI component. Create a strict TypeScript interface and a constants file (e.g., `data/menu-choices.ts`). 

```typescript
export interface MenuChoice {
  id: string;
  index: string; // e.g., "01", "02"
  title: string; // e.g., "Flavorful Indonesian"
  description: string; // e.g., "Tumpeng, Rujak Pengantin, Nasi Keranjang"
  imagePath: string; // Map to /public/assets/images/products/ai-generated/...
  href: string; // Link to the specific category page
}

```

*Agent Task*: Analyze `C:\Dev\Web\catering\backend\docs\database-seeders.md` to extract the correct titles and descriptions for the top 5-7 packages and map them to the locally stored AI-generated `.png` files.

## 4. Component Architecture (Shadcn/Modular Approach)

Do not build this as one giant file. Break it down into logical, reusable pieces:

1. `MenuSection.tsx`: The main wrapper. Handles the section constraints, the layout grid, and the shared `activeTab` state.
2. `MenuHeader.tsx`: The top part containing the "800+ Pilihan Menu" eyebrow, animated title, and the desktop CTA button.
3. `MenuList.tsx` & `MenuListItem.tsx`: The interactive tab list. Handles the click events and the active state UI.
4. `MenuGallery.tsx`: The visual display on the right. Listens to `activeTab` changes to trigger GSAP image transitions and text reveals.

## 5. Advanced Motion Orchestration (GSAP Specifications)

To achieve the premium feel, use `@gsap/react` (`useGSAP`). We need concurrent timelines:

1. **The Auto-Advance Loop (State Management + GSAP)**:
* Set an interval or a GSAP delayedCall for `6000ms`.
* On complete, trigger `setActiveTab((prev) => (prev + 1) % data.length)`.
* Ensure the timer is killed and reset if the user manually clicks a tab.


2. **The Image Transition & Ken Burns (in `MenuGallery.tsx`)**:
* When `activeTab` changes:
* **Outgoing Image**: Animate `opacity: 0`, and gently scale out.
* **Incoming Image**: Set `opacity: 1`, start `scale: 1.0` and slowly animate to `scale: 1.12` over `6-10 seconds` with `ease: "none"`.




3. **The Content Reveal (in `MenuGallery.tsx`)**:
* When `activeTab` changes, the text overlay (Index, Title, Desc, Link) must stagger in.
* Start them at `y: 20, opacity: 0`.
* Animate to `y: 0, opacity: 1` with a `stagger: 0.1` and a smooth easing like `power3.out`.


4. **ScrollTrigger (Entry Animation)**:
* The entire section elements (Header, Left List, Right Gallery) should fade up slightly when scrolling into the viewport for the first time.



## 6. Raw HTML & Tailwind Reference (Deep Analysis Required)

**Agent Instruction**: Analyze the exact HTML structure and Tailwind classes provided in the raw block below. Pay close attention to:

* The responsive container padding (`px-6 py-20 md:px-10 md:py-[6vh]`).
* The grid structure (`grid gap-8 md:grid-cols-12`).
* The specific color classes (you may need to map `bg-ink`, `text-gold-soft`, `text-paper` to our project's Tailwind config variables).
* The button structure and the nested `span` elements used for hover/active effects.

```html
<section class="flex flex-col justify-center bg-ink px-6 py-20 md:min-h-svh md:px-10 md:py-[6vh]">
  <div class="mx-auto w-full max-w-[1280px]">
    <div class="mb-7 flex flex-wrap items-end justify-between gap-4 md:mb-9">
      <div>
        <div style="opacity: 1; transform: none;">
          <p class="mb-3 text-[11px] uppercase tracking-[0.34em] text-teal">800+ Pilihan Menu</p>
        </div>
        <h2 class="font-display text-[clamp(30px,3.8vw,54px)] font-light leading-[0.95] tracking-[-0.02em] text-paper">
          <span class="contents">
            <span class="inline-block " style="opacity: 1; filter: blur(0px); transform: none;">Cita&nbsp;</span>
            <span class="inline-block " style="opacity: 1; filter: blur(0px); transform: none;">rasa&nbsp;</span>
          </span>
          <span class="contents">
            <span class="inline-block font-accent italic text-gold-soft" style="opacity: 1; filter: blur(0px); transform: none;">tanpa&nbsp;</span>
            <span class="inline-block font-accent italic text-gold-soft" style="opacity: 1; filter: blur(0px); transform: none;">batas&nbsp;</span>
          </span>
        </h2>
      </div>
      <div class="hidden md:block" style="opacity: 1; transform: none;">
        <a class="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border font-normal uppercase tracking-[0.18em] transition-colors duration-500 hover:text-ink active:scale-[0.98] border-gold/70 text-gold-soft px-8 py-[14px] text-[12.5px] " href="/menu">
          <span aria-hidden="true" class="absolute inset-0 translate-y-full bg-gold transition-transform duration-500 ease-out group-hover:translate-y-0"></span>
          <span class="relative">Lihat Menu Lengkap</span>
          <span aria-hidden="true" class="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
        </a>
      </div>
    </div>
    <div class="grid gap-8 md:grid-cols-12 md:gap-12">
      <div class="md:order-2 md:col-span-5">
        <div style="opacity: 1; transform: none;">
          <div class="relative h-[42vh] min-h-[260px] overflow-hidden rounded-lg md:h-[62vh] md:max-h-[640px]">
            <!-- Example of Active Image -->
            <div class="absolute inset-0 will-change-transform" style="opacity: 1; transform: scale(1.12);">
              <img alt="Sate dan aneka hidangan khas Indonesia" class="object-cover" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="/_next/image?url=...">
            </div>
            <!-- Overlay and Text -->
            <div aria-hidden="true" class="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(14,13,10,0.85))]"></div>
            <div class="absolute inset-x-6 bottom-5 md:inset-x-7 md:bottom-6" style="opacity: 1; transform: none;">
              <p class="text-[11px] uppercase tracking-[0.28em] text-gold-soft">01 — Flavorful Indonesian</p>
              <p class="mt-1 text-[13px] leading-[1.6] text-paper/80">Tumpeng, Rujak Pengantin, Nasi Keranjang</p>
              <a class="group mt-2.5 inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.2em] text-gold-bright" href="/menu#indonesian">
                Jelajahi kategori<span aria-hidden="true" class="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="md:order-1 md:col-span-7">
        <!-- Active Tab Example -->
        <div style="opacity: 1; transform: none;">
          <button type="button" aria-pressed="true" class="group relative block w-full border-b border-line text-left first:border-t">
            <span class="flex items-center gap-4 py-[15px] md:gap-6 md:py-[17px]">
              <span class="shrink-0 font-display text-[12px] tracking-[0.1em] transition-colors duration-500 text-gold-bright">01</span>
              <span class="min-w-0 flex-1 font-display text-[clamp(20px,2.2vw,31px)] font-light leading-[1.15] transition-colors duration-500 text-gold-soft">Flavorful Indonesian</span>
              <span aria-hidden="true" class="shrink-0 text-[16px] text-gold-soft transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] translate-x-0 opacity-100">→</span>
            </span>
          </button>
        </div>
        <!-- Inactive Tab Example -->
        <div style="opacity: 1; transform: none;">
          <button type="button" aria-pressed="false" class="group relative block w-full border-b border-line text-left first:border-t">
            <span class="flex items-center gap-4 py-[15px] md:gap-6 md:py-[17px]">
              <span class="shrink-0 font-display text-[12px] tracking-[0.1em] transition-colors duration-500 text-gold-deep/70">02</span>
              <span class="min-w-0 flex-1 font-display text-[clamp(20px,2.2vw,31px)] font-light leading-[1.15] transition-colors duration-500 text-paper/85 group-hover:text-paper">Delectable Asian</span>
              <span aria-hidden="true" class="shrink-0 text-[16px] text-gold-soft transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] -translate-x-2 opacity-0">→</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

```

```

```
