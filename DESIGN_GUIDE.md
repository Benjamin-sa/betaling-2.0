# 🎨 Design & UX Guide

**Scouts Webshop - Professional E-commerce Design System**

---

## 📐 Design Principles

### Core Philosophy

- **Professional First**: Every element should look trustworthy and polished
- **Mobile-First**: Design for mobile, enhance for desktop
- **User-Friendly**: Intuitive interactions with clear feedback
- **Performance**: Beautiful but fast-loading
- **Accessibility**: Usable by everyone

### Visual Hierarchy

1. **Primary Actions**: Bright gradients, large buttons, clear CTAs
2. **Secondary Actions**: Subtle backgrounds, smaller buttons
3. **Information**: Clean typography, appropriate spacing
4. **Supporting Elements**: Muted colors, minimal visual weight

---

## 🎨 Color Palette

### Primary Colors

```css
/* Primary Green (Scout Theme) */
--primary: #10b981 /* emerald-500 */
--primary-dark: #059669 /* emerald-600 */
--primary-light: #6ee7b7 /* emerald-300 */

/* Secondary Green */
--secondary: #16a34a /* green-600 */
--secondary-dark: #15803d /* green-700 */
```

### Functional Colors

```css
/* Success */
--success: #10b981 /* emerald-500 */
--success-bg: #d1fae5 /* emerald-100 */

/* Warning */
--warning: #f59e0b /* amber-500 */
--warning-bg: #fef3c7 /* amber-100 */

/* Error */
--error: #ef4444 /* red-500 */
--error-bg: #fee2e2 /* red-100 */

/* Info */
--info: #3b82f6 /* blue-500 */
--info-bg: #dbeafe /* blue-100 */
```

### Neutral Colors

```css
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-600: #4b5563
--gray-900: #111827
```

---

## 🔤 Typography

### Font Hierarchy

```css
/* Headers */
h1: text-3xl lg:text-4xl font-bold
h2: text-2xl lg:text-3xl font-bold
h3: text-xl lg:text-2xl font-bold
h4: text-lg font-semibold

/* Body Text */
body: text-base leading-relaxed
small: text-sm
xs: text-xs
```

### Font Weights

- **font-bold**: Headlines, important CTAs
- **font-semibold**: Subheadings, section titles
- **font-medium**: Labels, secondary buttons
- **font-normal**: Body text, descriptions

---

## 🎯 Component Design Patterns

### Buttons

#### Primary Button (CTAs)

```vue
<button
  class="bg-gradient-to-r from-primary to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
>
  Primary Action
</button>
```

#### Secondary Button

```vue
<button
  class="bg-white text-primary border-2 border-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-200"
>
  Secondary Action
</button>
```

#### Icon Button

```vue
<button
  class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
>
  <svg class="w-5 h-5 text-gray-600">...</svg>
</button>
```

### Cards

#### Product Card

- **Border**: `rounded-lg shadow-lg`
- **Hover**: `hover:-translate-y-1 hover:shadow-xl`
- **Background**: `bg-white`
- **Padding**: `p-6`

#### Information Card

- **Background**: `bg-gradient-to-br from-gray-50 to-gray-100`
- **Border**: `border border-gray-200 rounded-2xl`
- **Padding**: `p-6`

### Forms

#### Input Fields

```vue
<input class="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200">
```

#### Select Dropdowns

```vue
<select class="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white appearance-none cursor-pointer">
```

---

## 🛒 Shopping Cart Design System

### Floating Cart Widget

- **Position**: `fixed bottom-6 right-6 z-50`
- **Size**: `w-16 h-16` (mobile), `w-20 h-20` (desktop)
- **Background**: Gradient from primary to green-600
- **Shadow**: `shadow-2xl hover:shadow-3xl`
- **Animation**: Bounce when items added, scale on hover

### Cart Drawer

- **Width**: `w-full sm:w-96 lg:w-[28rem]`
- **Animation**: Slide from right with backdrop blur
- **Background**: White with gradient header
- **Scroll**: Vertical scroll for items, fixed header/footer

### Cart Items

- **Background**: `bg-gray-50 hover:bg-gray-100`
- **Border**: `rounded-xl`
- **Spacing**: `space-y-3` between items
- **Image**: `w-16 h-16 rounded-lg`

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Large desktops */
```

### Mobile UX Guidelines

- **Touch Targets**: Minimum 44px (11 Tailwind units)
- **Text Size**: Minimum 16px to prevent zoom
- **Spacing**: Generous padding for easy tapping
- **Navigation**: Thumb-friendly bottom placement

### Desktop Enhancements

- **Hover States**: Subtle animations and color changes
- **Larger Images**: More visual real estate
- **Grid Layouts**: Multi-column product displays
- **Advanced Interactions**: Tooltips, detailed hover cards

---

## ✨ Animation Guidelines

### Transition Timings

```css
/* Quick interactions */
duration-200: 200ms /* hover states, button presses */

/* Standard transitions */
duration-300: 300ms /* component state changes */

/* Slower animations */
duration-500: 500ms /* page transitions, complex animations */
```

### Animation Types

- **Hover Effects**: `hover:scale-105`, `hover:-translate-y-1`
- **Click Feedback**: `active:scale-95`
- **Loading States**: Subtle pulse or shimmer
- **Page Transitions**: Smooth fade or slide

### Performance Considerations

- Use `transform` instead of changing layout properties
- Prefer `opacity` and `transform` for smooth 60fps animations
- Add `will-change` for complex animations
- Use CSS transforms over JavaScript animations

---

## 🎯 UX Interaction Patterns

### Product Selection Flow

1. **Browse**: Clear product grid with filtering
2. **Select**: Visual feedback when adding to cart
3. **Configure**: Timeslot selection for applicable products
4. **Review**: Cart drawer with edit capabilities
5. **Checkout**: Streamlined payment process

### Feedback Mechanisms

- **Success**: Green checkmarks, positive messaging
- **Errors**: Red indicators, helpful error messages
- **Loading**: Spinners, skeleton screens, progress indicators
- **Empty States**: Helpful illustrations and clear next steps

### Navigation Patterns

- **Progressive Disclosure**: Show relevant information when needed
- **Breadcrumbs**: Clear path indication
- **Back Buttons**: Easy way to return to previous state
- **Search**: Quick access to specific products

---

## 🧩 Component Library Standards

### Naming Conventions

- **Components**: PascalCase (`ProductCard.vue`)
- **Props**: camelCase (`selectedEvent`)
- **Events**: kebab-case (`update:quantity`)
- **CSS Classes**: Tailwind utilities + custom classes when needed

### File Organization

```
components/
├── ui/           # Reusable UI components
├── products/     # Product-specific components
├── events/       # Event-related components
├── shoppingcart/ # Cart system components
└── admin/        # Admin interface components
```

### Prop Standards

- Always define prop types and defaults
- Use descriptive prop names
- Add validation where appropriate
- Document complex props with JSDoc

---

## 🎨 Brand Guidelines

### Scout Theme Integration

- **Primary Colors**: Green shades reflecting scouting
- **Imagery**: Natural, outdoor-friendly aesthetics when possible
- **Tone**: Friendly but professional
- **Icons**: Clean, simple line icons

### Professional E-commerce Standards

- **Trust Indicators**: Secure payment badges, clear pricing
- **Product Presentation**: High-quality images, detailed descriptions
- **Checkout Flow**: Minimal steps, clear progress indication
- **Error Handling**: Helpful, non-blocking error messages

---

## 📏 Spacing & Layout

### Spacing Scale (Tailwind)

```css
px: 1px
0.5: 2px  (0.125rem)
1: 4px    (0.25rem)
2: 8px    (0.5rem)
3: 12px   (0.75rem)
4: 16px   (1rem)
6: 24px   (1.5rem)
8: 32px   (2rem)
12: 48px  (3rem)
16: 64px  (4rem)
```

### Layout Guidelines

- **Containers**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Cards**: `p-6` for content, `p-4` for compact cards
- **Sections**: `py-16` for main sections, `py-8` for subsections
- **Grid Gaps**: `gap-6` for product grids, `gap-4` for form elements

---

## 🔍 Accessibility Guidelines

### WCAG Compliance

- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus States**: Clear focus indicators on all interactive elements
- **Alt Text**: Descriptive alt text for all images
- **Keyboard Navigation**: Full keyboard accessibility

### Screen Reader Support

- **Semantic HTML**: Use proper heading hierarchy and landmarks
- **ARIA Labels**: Add labels for complex interactions
- **Live Regions**: Announce dynamic content changes
- **Skip Links**: Allow navigation bypass for screen readers

### Implementation Examples

```vue
<!-- Accessible Button -->
<button
  class="..."
  :aria-label="isCartOpen ? 'Close cart' : 'Open cart'"
  :aria-expanded="isCartOpen"
>
  Cart ({{ totalItems }})
</button>

<!-- Accessible Form Field -->
<label for="event-select" class="sr-only">Select Event</label>
<select id="event-select" :aria-describedby="hasError ? 'event-error' : null">
  ...
</select>
```
