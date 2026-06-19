# Vedanath Business Consultants Platform

Production-ready starter platform for Indian tax, GST, loan paperwork and business compliance help.

## Structure

- `frontend` - Next.js App Router frontend for Vercel.
- `backend-hostinger` - PHP 8+, MySQL, PDO backend for Hostinger.
- `backend-hostinger/admin` - PHP admin dashboard.
- `backend-hostinger/uploads` - private upload folder protected by `.htaccess`.

## Frontend

```bash
cd frontend
npm install
npm run build
```

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_WHATSAPP_NUMBER=919000000000
NEXT_PUBLIC_BRAND_NAME=Vedanath Business Consultants
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

Deploy `frontend` to Vercel. Set the same environment variables in Vercel.

## Backend

See `backend-hostinger/README.md`.

For an existing Phase 1 database, import `backend-hostinger/migrations/phase2_cms_upgrade.sql` before using the new CMS admin pages.
