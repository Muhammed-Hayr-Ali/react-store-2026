# MarketNa - Coming Soon Page

## 📍 Location
- **English**: `/app/[locale]/(store)/coming-soon/page.tsx`
- **Arabic**: Same component with i18n translations

## 🎨 Features

### Visual Elements
- ✅ Animated clock icon with pulse effect
- ✅ Gradient background
- ✅ Responsive design (mobile-first)
- ✅ Bilingual support (English & Arabic)
- ✅ Feature preview cards with icons
- ✅ Email subscription form
- ✅ Contact button
- ✅ Professional footer

### Interactive Elements
- ✅ Email validation
- ✅ Form submission with loading state
- ✅ Toast notifications (success/error)
- ✅ Hover effects on cards
- ✅ External contact link

### Translations
Located in `/messages/en.json` and `/messages/ar.json`:
```json
{
  "ComingSoon": {
    "title": "We're Building Something Amazing",
    "description": "...",
    "features": { ... },
    "notify": { ... },
    "contact": "Contact Us",
    "footer": "..."
  }
}
```

## 🔧 Customization

### 1. Update Contact Email
Edit the `href` in the Contact Button:
```tsx
<a href="mailto:your-email@marketna.com">
```

### 2. Add Social Media Links
Uncomment and update the social links section:
```tsx
<div className="flex justify-center gap-4">
  <a href="https://twitter.com/marketna">🐦</a>
  <a href="https://instagram.com/marketna">📸</a>
  <a href="https://facebook.com/marketna">📘</a>
  <a href="https://linkedin.com/company/marketna">💼</a>
</div>
```

### 3. Add Countdown Timer
Integrate a countdown library:
```bash
npm install react-countdown
```

### 4. Connect Newsletter API
Update `NewsletterSignup` component:
```tsx
const response = await fetch('/api/newsletter', {
  method: 'POST',
  body: JSON.stringify({ email }),
});
```

## 📁 Related Files

| File | Purpose |
|------|---------|
| `app/[locale]/(store)/page.tsx` | Main page redirect |
| `app/[locale]/(store)/coming-soon/page.tsx` | Coming soon component |
| `components/features/landing/newsletter-signup.tsx` | Email form |
| `messages/en.json` | English translations |
| `messages/ar.json` | Arabic translations |

## 🚀 Usage

When ready to launch, update `app/[locale]/(store)/page.tsx`:

```tsx
// Before (Coming Soon)
import ComingSoonPage from "./coming-soon/page";
export default function Page() {
  return <ComingSoonPage />;
}

// After (Launch)
import { Hero } from "@/components/features/landing/hero";
import FeaturedProductsServer from "@/components/features/featured-products/featured-products-server";
// ... other imports

export default function Page() {
  return (
    <main>
      <Hero />
      <FeaturedProductsServer />
      {/* ... other components */}
    </main>
  );
}
```

## 🎯 SEO Metadata

The page includes dynamic metadata:
```tsx
export function generateMetadata() {
  return createMetadata({
    title: "MarketNa - Coming Soon",
    description: "We're building something amazing. Stay tuned!",
  });
}
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (default)
- **Tablet**: ≥ 640px (`md:`)
- **Desktop**: ≥ 1024px (`lg:`)

## ♿ Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Focus states on buttons
- ✅ Alt text on images (if any)

## 🎨 Color Scheme

Uses Tailwind CSS theme colors:
- `primary`: Main brand color
- `secondary`: Accent color
- `background`: Page background
- `card`: Card backgrounds
- `muted-foreground`: Secondary text

## 📊 Analytics Integration

Add analytics tracking:
```tsx
useEffect(() => {
  // Track page view
  analytics.page("Coming Soon");
}, []);
```

## 🔐 Security Notes

- Email validation on client and server
- Rate limiting on newsletter signup (implement on API)
- No sensitive data exposed

---

**Last Updated**: 2026-03-15
**Version**: 1.0
