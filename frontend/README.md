# Frontend

Next.js App Router frontend for VB Consultants.

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
NEXT_PUBLIC_SITE_URL=https://www.vbcbharat.com
NEXT_PUBLIC_API_BASE_URL=https://api.vbcbharat.com
NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX
NEXT_PUBLIC_BRAND_NAME=VB Consultants
NEXT_PUBLIC_REGISTERED_BUSINESS_NAME=Veedanath Business Consultants
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

The frontend works without backend configuration by showing a graceful error and keeping WhatsApp visible.

## Vercel deployment settings

This repository is a monorepo. Deploy only the Next.js app inside this folder.

- Root Directory: `frontend`
- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave blank / default

Do not deploy `backend-hostinger` to Vercel. The PHP backend and admin panel are for Hostinger only.
