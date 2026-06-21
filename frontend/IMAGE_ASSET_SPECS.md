# VB Consultants Image Asset Specifications

This document is the source of truth for final image generation and replacement for the VB Consultants frontend.

Brand rules:

- Public brand: `VB Consultants`
- Tagline: `Tax, Compliance & Business Support`
- Registered/legal name appears only in footer/legal text: `Veedanath Business Consultants`
- Do not put readable text inside generated photos. Use HTML text in the UI.
- Do not crop faces, hands, phones, documents, payment screens, Form 16, notices, or project report folders.
- Avoid fake UI text inside images. If UI cards are needed, keep them abstract and unreadable, or build them in HTML/CSS.

## Naming Convention

- Store final photo assets in `/public/images/vbc/`.
- Use lowercase kebab-case names.
- Include the subject and intended use in the file name.
- Keep extension as `.png` for generated illustrations/photo composites that need crisp UI details, or `.jpg`/`.webp` for final optimized photos if the build pipeline is updated later.
- Replace files in place when possible so `data/images.ts` does not need repeated edits.

## Current Asset Requirement Table

| Asset key | Where used | Current component/file | Required desktop size | Required mobile size | Aspect ratio | CSS object-fit used | Recommended object-position | Safe area notes | Text inside image? | Final recommended file name |
|---|---|---|---:|---:|---:|---|---|---|---|---|
| `logoMark` | Header logo icon, footer logo icon, schema logo | `components/Header.tsx`, `components/Footer.tsx`, `lib/schema.ts`, `data/images.ts` | 1254x1254 PNG | same source displayed at 44px | 1:1 | `object-contain` | center | Use the exact selected mark from `logomain.png`. Do not crop, stretch, recolor or trace unless a clean selected vector is supplied. | No | `/images/vbc/logo-mark.png` |
| `logoHorizontal` | Optional larger brand placements, admin/media use, future PDFs | `data/images.ts` | 2172x724 PNG | same source, display only where wide enough | 3:1 | `object-contain` when used | center | Use the exact selected horizontal logo from `vb-consultants-logo-wide.png`. Do not use the old simplified placeholder. | Logo text only | `/images/vbc/logo-horizontal.png` |
| `favicon` | Browser tab, metadata icon | `public/favicon.svg`, `app/layout.tsx`, `app/manifest.ts` | SVG wrapper around selected mark | same | 1:1 | browser icon | center | Embed/use the selected mark only. No tagline. | No | `/favicon.svg` |
| `appleTouchIcon` | iOS home-screen icon | `public/apple-touch-icon.png`, `app/layout.tsx`, `app/manifest.ts` | 180x180 PNG | 180x180 PNG | 1:1 | browser icon | center | Export from selected `logomain.png`; keep white background. | No | `/apple-touch-icon.png` |
| `heroPremium` | Homepage hero right-side image, Open Graph default image source | `components/HeroSection.tsx`, `app/page.tsx`, `app/layout.tsx`, `lib/seo.ts`, `data/images.ts` | 1920x1200 | same asset displayed around 328x205 at 360px width | 16:10 | `object-cover` | `62% center` | Put people/phone in right-center. Keep important faces and phone inside middle 70% width and 80% height. Leave soft empty space on left. | No | `/images/vbc/vbc-hero-senior-couple-simple-digital-tax.png` |
| `salaryItr` | Popular service card, salary ITR homepage section, salary/ITR service pages, salary blog placeholders | `app/page.tsx`, `components/ServicePageTemplate.tsx`, `data/blogPosts.ts`, `data/images.ts` | 1600x1200 | same asset displayed around 328x246 on mobile cards | 4:3 | `object-cover` | center | Show family/salaried person with Form 16, PAN-like generic papers, phone. Keep faces, hands, documents centered. | No | `/images/vbc/salary-itr-form-16-family.png` |
| `gstConsultation` | Popular service card, GST pages, business pages, about/contact image, why-choose section | `app/page.tsx`, `components/ServicePageTemplate.tsx`, `components/ContactSection.tsx`, `app/[slug]/page.tsx`, `data/images.ts` | 1600x1200 | same asset displayed around 328x246 | 4:3 | `object-cover` | center | Show small business owner and advisor reviewing invoices/GST records. Keep laptop, documents, hands, faces in central 70%. | No | `/images/vbc/gst-business-compliance-consultation.png` |
| `mobileUpload` | Popular service card, upload documents homepage section, upload page, support service pages | `app/page.tsx`, `app/upload-documents/page.tsx`, `components/ServicePageTemplate.tsx`, `data/images.ts` | 1600x1200 | same asset displayed around 328x246 | 4:3 | `object-cover` | center | Show phone document upload action, documents, hand, and clear phone silhouette centered. Avoid readable fake UI labels. | No | `/images/vbc/mobile-document-upload-india.png` |
| `paymentTracking` | Popular service card, payment/status homepage section, track-status page | `app/page.tsx`, `app/track-status/page.tsx`, `data/images.ts` | 1600x1200 | same asset displayed around 328x246 | 4:3 | `object-cover` | center | Show payment/status idea with phone/laptop and abstract checkmarks. Keep phone and status cards central. | No readable text | `/images/vbc/secure-payment-status-tracking.png` |
| `taxNotice` | Popular service card, tax notice service/local pages | `app/page.tsx`, `components/ServicePageTemplate.tsx`, `data/images.ts` | 1600x1200 | same asset displayed around 328x246 | 4:3 | `object-cover` | center | Show worried but calm person reviewing a notice with professional guidance. Keep notice/document visible but without readable fake text. | No | `/images/vbc/tax-notice-help-consultation.png` |
| `loanProject` | Popular service card, loan/project/subsidy service pages | `app/page.tsx`, `components/ServicePageTemplate.tsx`, `data/images.ts` | 1600x1200 | same asset displayed around 328x246 | 4:3 | `object-cover` | center | Show business owner reviewing a project report/loan paperwork. Keep project folder, hands, and faces centered. | No | `/images/vbc/loan-project-report-business-support.png` |
| `blogIncomeTaxThumb` | Blog listing cards and blog hero for ITR/tax guides | `components/BlogCard.tsx`, `app/blog/[slug]/page.tsx`, `data/blogPosts.ts` | 1200x675 | same asset displayed around 328x184 | 16:9 | `object-cover` | center | Wide composition. Keep subject inside center 80%; no important items near edges. | No | `/images/vbc/blog-income-tax-guide.png` |
| `blogSalaryItrThumb` | Blog cards for Form 16/salary ITR guides | `components/BlogCard.tsx`, `app/blog/[slug]/page.tsx`, `data/blogPosts.ts` | 1200x675 | same asset displayed around 328x184 | 16:9 | `object-cover` | center | Wide Form 16/document scene. Keep document stack and phone centered. | No | `/images/vbc/blog-salary-itr-form-16-guide.png` |
| `blogGstThumb` | Blog cards for GST registration guides | `components/BlogCard.tsx`, `app/blog/[slug]/page.tsx`, `data/blogPosts.ts` | 1200x675 | same asset displayed around 328x184 | 16:9 | `object-cover` | center | Wide small-business/GST records scene. Keep people and invoice records central. | No | `/images/vbc/blog-gst-small-business-guide.png` |
| `blogBusinessThumb` | Blog cards for small-business paperwork guides | `components/BlogCard.tsx`, `app/blog/[slug]/page.tsx`, `data/blogPosts.ts` | 1200x675 | same asset displayed around 328x184 | 16:9 | `object-cover` | center | Wide business desk scene: bookkeeping, payroll, loan paperwork hints. | No | `/images/vbc/blog-business-paperwork-guide.png` |
| `testimonialAvatar1` | Placeholder testimonial avatar | `components/TestimonialCards.tsx`, `data/testimonials.ts` | 512x512 | displayed 48x48 | 1:1 | `object-cover` | center top | Face centered with margin around head. Avoid tight crop. | No | `/images/vbc/testimonial-avatar-1.png` |
| `testimonialAvatar2` | Placeholder testimonial avatar | `components/TestimonialCards.tsx`, `data/testimonials.ts` | 512x512 | displayed 48x48 | 1:1 | `object-cover` | center top | Face centered with margin around head. Avoid tight crop. | No | `/images/vbc/testimonial-avatar-2.png` |
| `trustSecure` | Trust badge icon | `components/TrustBadges.tsx`, `data/images.ts` | SVG 256x256 | displayed 36x36 | 1:1 | intrinsic SVG | center | Simple line/fill icon. Must read at 24px. | No | `/images/vbc/trust-secure.svg` |
| `trustRazorpay` | Trust badge icon | `components/TrustBadges.tsx`, `data/images.ts` | SVG 256x256 | displayed 36x36 | 1:1 | intrinsic SVG | center | Use generic secure-payment symbol if Razorpay brand approval is not available. | No | `/images/vbc/trust-payment.svg` |
| `trustWhatsapp` | Trust badge icon | `components/TrustBadges.tsx`, `data/images.ts` | SVG 256x256 | displayed 36x36 | 1:1 | intrinsic SVG | center | Use WhatsApp-style chat icon only if brand-safe. | No | `/images/vbc/trust-whatsapp.svg` |
| `trustPrivacy` | Trust badge icon | `components/TrustBadges.tsx`, `data/images.ts` | SVG 256x256 | displayed 36x36 | 1:1 | intrinsic SVG | center | Privacy/document-lock symbol. | No | `/images/vbc/trust-privacy.svg` |
| `ogDefault` | Social sharing preview fallback | `app/layout.tsx`, `lib/seo.ts` | 1200x630 | 1200x630 | 1.91:1 | metadata image | center | Generate a dedicated OG image later. Keep brand mark and headline in graphic only if exported manually, not AI text. | If designed manually, yes | `/images/vbc/og-default-vb-consultants.png` |

## Current Images That Should Be Replaced

These files are placeholders or first-pass generated assets. Replace them in place after generating final images with the exact specs above:

- `/public/images/vbc/vbc-hero-senior-couple-simple-digital-tax.png` should become a clean 1920x1200 hero image with no readable AI text.
- `/public/images/vbc/salary-itr-form-16-family.png` should become a 1600x1200 4:3 service image.
- `/public/images/vbc/gst-business-compliance-consultation.png` should become a 1600x1200 4:3 service image.
- `/public/images/vbc/mobile-document-upload-india.png` should become a 1600x1200 4:3 service image.
- `/public/images/vbc/secure-payment-status-tracking.png` should become a 1600x1200 4:3 service image.
- `/public/images/vbc/tax-notice-help-consultation.png` should become a 1600x1200 4:3 service image.
- `/public/images/vbc/loan-project-report-business-support.png` should become a 1600x1200 4:3 service image.
- Current blog posts reuse service images. Generate the four dedicated 1200x675 blog thumbnails above and update `data/blogPosts.ts`.
- Current testimonial avatars use generic placeholders. Generate the two 512x512 avatar placeholders and update `data/testimonials.ts`.
- The selected horizontal raster logo `/public/images/vbc/vb-consultants-logo-wide.png` is the source for `/public/images/vbc/logo-horizontal.png`.

## CSS/Component Adjustments Already Made

- Header/footer logo now uses selected `logo-mark.png` with `object-contain`, not the old simplified SVG placeholder.
- Homepage hero image container now uses `aspect-[16/10]` to match the required 1920x1200 asset.
- Homepage hero copy now has an explicit small-screen width ceiling and word wrapping so text, CTA buttons, and trust copy do not clip on 360px screens.
- Popular service cards now use `aspect-[4/3]` to match 1600x1200 service images.
- Salary ITR, upload, payment/status, GST/business, upload page, track page, about/contact, and service page hero images now use 4:3-safe containers.
- Blog cards and blog detail hero images now use `aspect-video`, matching 1200x675 blog thumbnails.
- Mobile sticky CTA has bottom padding in `app/layout.tsx` so it does not cover final page content.
- The shared `.container-shell` now has a viewport max-width and document-level horizontal overflow clipping to prevent mobile side-scroll from long content or image wrappers.

## Safe Composition Rules

### Photos With People

- Keep all faces inside the center 70% width and center 80% height.
- Leave at least 10% clear space on every edge.
- Do not crop hair, chin, hands, phone, laptop, or documents.
- Avoid placing important objects in the bottom 15% because mobile UI overlays and card labels often live near the bottom.
- Prefer realistic Indian homes/offices, warm daylight, clean desk, premium but not luxury.

### Documents And UI

- Documents can show generic blocks and lines, but not readable tax values, PAN, Aadhaar, GSTIN, or fake official text.
- Do not include AI-generated brand text inside photos.
- Build service titles, prices, badges, and CTAs as HTML/CSS in the frontend.
- Phone/laptop screens should show abstract shapes/checkmarks, not legible fake dashboards.

### Backgrounds

- Use light, uncluttered Indian home/office/business settings.
- Keep contrast soft and professional.
- Avoid red-heavy scenes. Red should remain an accent.
- Avoid busy background text, logos, certificates, or signage.

## Exact Generation Prompts

Use these as source prompts for final image generation. Append the exact size from the table.

### Homepage Hero

Prompt: Professional Indian senior couple using a smartphone and laptop at a clean home desk, warm daylight, calm and trustworthy mood, simple online tax and paperwork support, premium fintech consultancy feel, white and soft grey background with subtle deep red accents, no readable text, no fake UI words, no visible private numbers, faces and phone clearly visible, generous empty space on the left, realistic photography, sharp, clean composition.

Size: 1920x1200.

### Salary ITR / Form 16

Prompt: Indian salaried family or salaried professional reviewing Form 16-style generic documents on a desk with a smartphone, calm confident expression, family-friendly tax filing support, clean white home-office setting, premium and trustworthy, no readable text, no PAN or Aadhaar numbers, faces hands phone and documents fully visible, realistic photography.

Size: 1600x1200.

### GST & Business Compliance

Prompt: Indian small business owner and professional support person reviewing invoices and GST-style generic records at a clean office desk, laptop open with abstract dashboard shapes, warm trustworthy business consultation mood, no readable text, no official IDs, faces hands documents and laptop visible, modern fintech compliance support look.

Size: 1600x1200.

### Mobile Document Upload

Prompt: Close but comfortable Indian hand holding smartphone above tax/business documents, showing a simple abstract upload screen with icons only, PDF/photo upload concept, clean desk, secure document handling mood, no readable UI text, no private information, phone and documents fully visible, premium mobile-first service aesthetic.

Size: 1600x1200.

### Payment And Status Tracking

Prompt: Indian user viewing payment and request status on smartphone and laptop, abstract secure payment and status timeline shapes, deep red accent, clean desk, trustworthy fintech support mood, no readable text, no real payment details, phone screen visible, hands and device not cropped.

Size: 1600x1200.

### Tax Notice Help

Prompt: Indian individual calmly reviewing a generic income tax notice document with a professional support person at a desk, reassuring consultation, neutral light office, document visible but text unreadable, no private information, faces hands and document fully visible, trustworthy compliance support mood.

Size: 1600x1200.

### Loan Project Report

Prompt: Indian small business owner reviewing a project report folder and loan paperwork with a professional support person, charts and documents on desk, business loan paperwork and subsidy guidance feel, no readable text except abstract shapes, faces hands report folder and laptop fully visible, premium clean office style.

Size: 1600x1200.

### Blog Income Tax Guide Thumbnail

Prompt: Wide clean desk scene with generic income tax documents, phone and pen, Indian context, warm daylight, no readable text, no private data, simple professional tax guide mood, large safe center composition.

Size: 1200x675.

### Blog Salary ITR Thumbnail

Prompt: Wide Form 16-style generic document scene with smartphone and family-friendly home desk, no readable text or numbers, Indian salary ITR guide mood, clean premium composition.

Size: 1200x675.

### Blog GST Thumbnail

Prompt: Wide small business desk scene with invoice stacks, laptop with abstract dashboard, GST registration and filing guide mood, no readable text, Indian small business context, premium clean composition.

Size: 1200x675.

### Blog Business Paperwork Thumbnail

Prompt: Wide business paperwork desk scene with bookkeeping sheets, payroll-like generic documents, loan folder, smartphone, no readable text, Indian small business support mood, clean premium composition.

Size: 1200x675.

### Testimonial Avatars

Prompt: Friendly Indian adult professional portrait, neutral background, trustworthy expression, centered face, no text, no logos, simple placeholder client avatar, realistic but generic.

Size: 512x512.

## Implementation Notes For Future Replacement

- Final photo files can replace current files in `/public/images/vbc/` without code changes for homepage/service assets.
- Dedicated blog thumbnail files require updates in `frontend/data/blogPosts.ts`.
- Dedicated testimonial avatar files require updates in `frontend/data/testimonials.ts`.
- If separate mobile hero art direction is desired later, add a small client/server-safe picture wrapper or CSS media source support. Current implementation intentionally uses one 16:10 image for both desktop and mobile.
- If service page heroes are redesigned to a wide banner later, change `components/ServicePageTemplate.tsx` from `aspect-[4/3]` to `aspect-video` and generate 1600x900 assets. Current live frontend is 4:3 by design to protect the existing people/document photos.
