# Frontend

Next.js App Router frontend for Vedanath Business Consultants.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://www.example.com
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_WHATSAPP_NUMBER=919000000000
NEXT_PUBLIC_BRAND_NAME=Vedanath Business Consultants
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

The frontend works without backend configuration by showing a graceful error and keeping WhatsApp visible.
