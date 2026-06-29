# Hostinger Backend Setup

This folder contains the PHP 8+ and MySQL backend for VB Consultants. It is for Hostinger only, not Vercel.

## 1. Upload files

Upload the contents of `backend-hostinger` to your Hostinger site or subdomain, for example:

```text
public_html/api-site/
```

Point your API subdomain to this folder, for example:

```text
https://api.vbcbharat.com
```

The `.htaccess` file routes `/api/...` requests to `api/index.php`.

## 2. Create MySQL database

In Hostinger hPanel:

1. Create a MySQL database.
2. Create a database user.
3. Import `install.sql` using phpMyAdmin.

Fresh reset process for VB Consultants:

1. Create a new MySQL database and user.
2. Import `backend-hostinger/install.sql`.
3. Upload `backend-hostinger` to the API subdomain folder.
4. Copy `config.example.php` to `config.php`.
5. Set DB credentials, `APP_URL`/`app_url`, `FRONTEND_URL`/`frontend_url`, `ALLOWED_ORIGIN`/`allowed_origin`, `INSTALLER_SECRET`, SMTP, WhatsApp and Razorpay values.
6. Open `https://api.vbcbharat.com/admin/setup.php`.
7. Create the first `super_admin`.
8. Login at `https://api.vbcbharat.com/admin/login.php`.
9. Open `https://api.vbcbharat.com/admin/system-check.php`.
10. Before admin setup, test `https://api.vbcbharat.com/api/health`, `POST /api/guest-request`, `POST /api/signup` and `GET /api/content/pricing`.
11. After admin setup, test `/api/me`, secure document upload and the admin email test.

Fresh DB reset removes old users, leads, uploaded document records, admin content and payment records unless you export them first.
For this fresh deployment, import only `install.sql`. It creates the complete schema and seed content. Do not run old migrations on the new database.

## 3. Configure backend

Copy:

```bash
cp config.example.php config.php
```

Edit `config.php`:

- MySQL host, database, user, password
- `APP_URL=https://api.vbcbharat.com`
- `FRONTEND_URL=https://www.vbcbharat.com`
- `ALLOWED_ORIGIN=https://www.vbcbharat.com`
- `PUBLIC_PHONE=+91 73278 54329`
- `OFFICE_ADDRESS=Bhubaneswar, Odisha`
- `MIN_PASSWORD_LENGTH=4`
- SMTP host, username, password, port
- Razorpay key id
- Razorpay key secret
- Razorpay webhook secret
- WhatsApp number
- Admin email
- Allowed frontend origin
- UPI ID
- `MANUAL_PAYMENT_ENABLED` and `MANUAL_UPI_ID`
- Media base URL, for example `https://api.vbcbharat.com/media`
- Frontend URL, for example `https://www.vbcbharat.com`
- Optional frontend revalidation URL and secret
- `FRONTEND_REVALIDATE_URL=https://www.vbcbharat.com/api/revalidate`
- `FRONTEND_REVALIDATE_SECRET` matching Vercel `REVALIDATE_SECRET`
- `app_secret`
- `INSTALLER_SECRET`

Use a long random `app_secret` and a separate long random `INSTALLER_SECRET`.

## 4. Create first admin user

Preferred Hostinger-friendly browser setup:

1. Import `install.sql`.
2. Add `INSTALLER_SECRET` in `config.php`.
3. Open:

```text
https://api.vbcbharat.com/admin/setup.php
```

4. Enter admin name, email, password and installer secret.
5. The first admin is created as `super_admin`.
6. Login at:

```text
https://api.vbcbharat.com/admin/login.php
```

7. For security, delete `admin/setup.php` after setup or block it from File Manager.

The setup page refuses to run after a super admin exists. If `INSTALLER_SECRET` is missing, it refuses to run. Public signup, guest requests, uploads and content APIs do not depend on admin setup.

CLI setup is still available if SSH works:

```bash
php scripts/create_admin.php admin@example.com StrongPassword "Admin User" super_admin
```

Avoid manual password hash inserts unless you are recovering a broken install.

## 5. Configure Hostinger SMTP

Create the real mailbox in Hostinger Email first. This deployment is configured for:

```text
consult@api.vbcbharat.com
```

This address works only when Hostinger has an actual mailbox for the `api.vbcbharat.com` subdomain and its DNS/email routing is active. If the mailbox was created on the root domain instead, use that exact root-domain address consistently.

Mail setting priority is deterministic:

1. A non-empty value in live `config.php`.
2. A non-empty value explicitly saved in the database.
3. The safe value from `config.example.php`.

The admin Email Settings and System Check pages show the active source and warn when saved database values differ from live `config.php`.

Recommended `config.php` values:

```php
'SMTP_ENABLED' => true,
'SMTP_HOST' => 'smtp.hostinger.com',
'SMTP_PORT' => 465,
'SMTP_ENCRYPTION' => 'ssl',
'SMTP_USERNAME' => 'consult@api.vbcbharat.com',
'SMTP_PASSWORD' => 'your_mailbox_password',
'SMTP_FROM_EMAIL' => 'consult@api.vbcbharat.com',
'SMTP_FROM_NAME' => 'VB Consultants',
'SMTP_REPLY_TO' => 'consult@api.vbcbharat.com',
'ADMIN_EMAIL' => 'consult@api.vbcbharat.com',
'PUBLIC_EMAIL' => 'consult@api.vbcbharat.com',
'MAIL_DEBUG' => false,
```

Fallback if SSL 465 fails:

```php
'port' => 587,
'encryption' => 'tls',
```

You can also edit SMTP settings from:

```text
https://api.vbcbharat.com/admin/email-settings.php
```

Send an admin test from:

```text
https://api.vbcbharat.com/admin/test-email.php
```

Test from CLI:

```bash
php scripts/test_mail.php consult@api.vbcbharat.com
```

The CLI prints config loaded, enabled status, host, port, encryption, from email, username, recipient and a safe error message if sending fails.

If email does not arrive:

- Check `email_logs`.
- Check mailbox password.
- Check spam folder.
- Check Hostinger MX/SPF/DKIM records.
- Make sure `from_email` usually matches `smtp_username`.
- Make sure SMTP is enabled in admin email settings.

Email failure never rolls back signup, lead, request, upload, or payment actions. Every attempt is recorded in `email_logs` with a safe error message.

## 5a. Persistent customer login

Customer login uses a random 30-day session token. Only its SHA-256 hash is stored in `user_sessions`. Use these production values:

```php
'SESSION_COOKIE_NAME' => 'vbc_session',
'SESSION_COOKIE_DOMAIN' => '.vbcbharat.com',
'SESSION_DAYS' => 30,
'SESSION_SAMESITE' => 'Lax',
'SESSION_SECURE' => true,
```

The cookie is HttpOnly and Secure. The API accepts credentials only from `https://www.vbcbharat.com`; frontend API calls use `credentials: "include"`. Active sessions slide forward when they are near expiry. Password resets revoke existing sessions.

For an existing database, import `migrations/fix_smtp_and_sessions.sql` once. A fresh database already gets these fields from `install.sql`.

## 5b. Google Ads attribution and Google Business Profile

For an existing database, import:

```text
migrations/google_ads_tracking_and_leads.sql
```

Fresh installs already include these fields in `install.sql`.

Set these optional `config.php` values when available:

```php
'GOOGLE_BUSINESS_PROFILE_URL' => '',
'GOOGLE_MAPS_URL' => '',
'GOOGLE_REVIEW_URL' => '',
'TRACK_UTM' => true,
'TRACK_GCLID' => true,
```

The frontend captures UTM, GCLID, GBRAID, WBRAID, MSCLKID, landing page and referrer. The backend stores them on quick leads, service requests, uploaded documents and `lead_events` where available. Admin leads and requests show source, campaign, term and landing page.

## 6. Configure Razorpay

In Razorpay dashboard:

1. Copy live key id to Vercel as `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
2. Copy live key id and secret into `backend-hostinger/config.php`.
3. Add webhook URL:

```text
https://api.vbcbharat.com/api/razorpay-webhook
```

4. Copy webhook secret into `config.php`.

The backend verifies Razorpay payment signature and webhook signature.

## 7. Connect frontend to backend

In Vercel, set:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.vbcbharat.com
NEXT_PUBLIC_SITE_URL=https://www.vbcbharat.com
NEXT_PUBLIC_BRAND_NAME=VB Consultants
NEXT_PUBLIC_REGISTERED_BUSINESS_NAME=Veedanath Business Consultants
NEXT_PUBLIC_PUBLIC_PHONE=+917327854329
NEXT_PUBLIC_OFFICE_ADDRESS=Bhubaneswar, Odisha
NEXT_PUBLIC_WHATSAPP_NUMBER=917327854329
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
REVALIDATE_SECRET=your_revalidate_secret
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_GA4_MEASUREMENT_ID=
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=
NEXT_PUBLIC_GOOGLE_ADS_INSURANCE_LEAD_LABEL=
NEXT_PUBLIC_GOOGLE_ADS_FORM_SUBMIT_LABEL=
NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_CLICK_LABEL=
NEXT_PUBLIC_GOOGLE_ADS_PHONE_CLICK_LABEL=
NEXT_PUBLIC_GOOGLE_ADS_DOCUMENT_UPLOAD_LABEL=
NEXT_PUBLIC_GOOGLE_BUSINESS_PROFILE_URL=
NEXT_PUBLIC_GOOGLE_MAPS_URL=
NEXT_PUBLIC_GOOGLE_REVIEW_URL=
```

In backend `config.php`, set:

```php
'ALLOWED_ORIGIN' => 'https://www.vbcbharat.com',
```

The public customer flow is guest-first:

1. `POST /api/guest-request` creates or reuses a customer, creates a request and returns a secure upload URL.
2. The raw upload token is returned only to the customer. Only its SHA-256 hash is stored.
3. `/api/upload-documents` accepts either a logged-in customer session or a valid request code and upload token.
4. Optional signup accepts a password or PIN with at least four characters and creates a 30-day session.
5. SMTP, WhatsApp queue or other optional integration failures are logged and do not cancel the public request.

## 8. Admin workflow

Admin can:

- View dashboard stats
- View quick phone leads
- View users
- View service requests
- View document and payment screens
- Download documents securely after login
- Update request status
- Add admin notes
- Assign staff
- Verify or reject manual payment screenshots
- Open WhatsApp links
- Export leads CSV
- Manage staff roles and reset staff passwords
- Edit site settings, homepage copy, service page content, pricing and local SEO pages
- Upload and browse media library images
- Create, edit, publish and delete CMS blog posts
- Edit FAQs and testimonials
- View audit logs
- Prepare Razorpay, UPI, SMTP, analytics, WhatsApp Business API, AI chatbot and email follow-up settings

After a fresh install, use `admin/system-check.php` to confirm:

- database connection
- required tables, including `user_sessions`
- cookie name/domain for persistent login
- CORS credentials origin
- private upload directory writability
- media directory writability
- SMTP settings and recent email errors

CLI schema check is also available when SSH works:

```bash
php scripts/check_schema.php
```

Manual payment screenshots appear with status `Payment verification pending`. Admins with payment permission can verify or reject them from `admin/payments.php` or the request detail screen.

Staff roles:

- `super_admin`: all permissions
- `admin`: most permissions except destructive document deletion
- `staff`: leads, requests, notes, status and document viewing/downloads
- `content_editor`: website text, media, blog, service pages and SEO
- `accountant`: requests, documents and payment verification
- `viewer`: read-only dashboard/data access

## 9. Website content CMS

New Phase 2 admin pages:

- `admin/setup.php` - one-time first admin setup
- `admin/staff.php` - staff users, roles, activation and password reset
- `admin/settings.php` - business name, logo, favicon, contact details, footer copy
- `admin/site-settings.php` - alias for site settings
- `admin/homepage.php` - hero copy, CTAs, trust badges, featured services, FAQs, testimonials, final CTA
- `admin/services_content.php` - page titles, subtitles, hero image, sections, pricing note, FAQs, SEO
- `admin/services.php` and `admin/service-edit.php` - aliases for service CMS
- `admin/service-documents.php` - editable service-specific document upload checklists
- `admin/pricing.php` - service pricing text and active/inactive state
- `admin/media.php` - public website images for logos, hero images, blog thumbnails and sections
- `admin/blog.php` - simple blog CMS
- `admin/local_seo.php` - city/local SEO page content
- `admin/local-pages.php` - alias for local SEO pages
- `admin/faqs.php` - global, page and service FAQs
- `admin/testimonials.php` - editable testimonial cards
- `admin/email-settings.php` - SMTP settings, safe diagnostics and recent email logs
- `admin/test-email.php` - send a logged SMTP test email
- `admin/email_templates.php` - follow-up email template editor
- `admin/documents.php` - private document review and download
- `admin/payments.php` - Razorpay/manual payment review
- `admin/audit_logs.php` - important admin action history
- `admin/integrations.php` - placeholders for Razorpay, UPI, SMTP, analytics, WhatsApp API, AI chatbot and follow-up settings

Public content API endpoints:

- `GET /api/content/site-settings`
- `GET /api/content/homepage`
- `GET /api/content/services`
- `GET /api/content/services/{slug}`
- `GET /api/content/pricing`
- `GET /api/content/blog`
- `GET /api/content/blog/{slug}`
- `GET /api/content/faqs`
- `GET /api/content/testimonials`
- `GET /api/content/local-pages`
- `GET /api/content/local-pages/{slug}`
- `GET /api/content/service-document-requirements?service=salary-itr-filing`

Public content APIs return only active or published content. They do not expose private documents, admin notes or config secrets. The frontend can fall back to static local content if the backend is unavailable.

Public CMS responses use 300-second cache headers for marketing/SEO content. Vercel should show admin edits within about 0-300 seconds through ISR. If `frontend_revalidate_url` and `frontend_revalidate_secret` are configured, admin save actions call the Next.js revalidation endpoint so affected pages can update sooner.

## 10. Document checklist CMS and upload metadata

The fresh `install.sql` creates `documents`, `uploaded_documents`, request upload-token fields and `service_document_requirements`. Admins can edit service-specific required/optional upload slots from:

```text
https://api.vbcbharat.com/admin/service-documents.php
```

The frontend upload form sends every selected file with paired `document_types[]` and `document_labels[]`, so multiple files in one slot and files across many slots are all saved separately.

## 11. Upload safety

Uploads are stored in `backend-hostinger/uploads`.

The folder includes `.htaccess`:

```apache
Options -Indexes
Require all denied
```

Files are renamed using random names. Original filenames are stored in the database.

Website media library files are stored separately in `backend-hostinger/media` and are meant to be publicly viewable. The media folder blocks directory listing and executable files with `.htaccess`.

## 12. Security checklist

- Keep `config.php` outside public editing and never commit real secrets.
- Delete or disable `admin/setup.php` after first admin setup.
- Keep `uploads/.htaccess` in place. Customer documents must not be directly public.
- Public media belongs in `media/`; private customer documents belong in `uploads/`.
- Use strong admin and staff passwords.
- Give staff the least role they need.
- Review `admin/audit_logs.php` for downloads, payment verification, staff changes and content updates.
- Set backend `allowed_origin` to `https://www.vbcbharat.com`.
- Use HTTPS for `api.vbcbharat.com`.
