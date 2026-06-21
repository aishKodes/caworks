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

For an existing database, first take a backup, then import:

```text
migrations/backend_admin_cms_upgrade.sql
```

Do not import `install.sql` on an existing live database unless you intend to rebuild it.

## 3. Configure backend

Copy:

```bash
cp config.example.php config.php
```

Edit `config.php`:

- MySQL host, database, user, password
- SMTP host, username, password, port
- Razorpay key id
- Razorpay key secret
- Razorpay webhook secret
- WhatsApp number
- Admin email
- Allowed frontend origin
- UPI ID
- Media base URL, for example `https://api.vbcbharat.com/media`
- Frontend URL, for example `https://www.vbcbharat.com`
- Optional frontend revalidation URL and secret
- `app_secret`
- `INSTALLER_SECRET`

Use a long random `app_secret` and a separate long random `INSTALLER_SECRET`.

## 4. Create first admin user

Preferred Hostinger-friendly browser setup:

1. Import `install.sql` or run the migration.
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

The setup page refuses to run if any admin user already exists. If `INSTALLER_SECRET` is missing, it refuses to run.

CLI setup is still available if SSH works:

```bash
php scripts/create_admin.php admin@example.com StrongPassword "Admin User" super_admin
```

Avoid manual password hash inserts unless you are recovering a broken install.

## 5. Configure Hostinger SMTP

Create a real mailbox in Hostinger Email first. Recommended:

```text
consult@vbcbharat.com
```

Do not use `consult@api.vbcbharat.com` unless you have created a mailbox for the `api.vbcbharat.com` subdomain and DNS/email routing supports that subdomain.

Recommended `config.php` values:

```php
'smtp' => [
    'enabled' => true,
    'host' => 'smtp.hostinger.com',
    'port' => 465,
    'encryption' => 'ssl',
    'username' => 'consult@vbcbharat.com',
    'password' => 'your_mailbox_password',
    'from_email' => 'consult@vbcbharat.com',
    'from_name' => 'VB Consultants',
    'reply_to' => 'consult@vbcbharat.com',
    'debug' => false,
],
'admin_email' => 'consult@vbcbharat.com',
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
php scripts/test_mail.php consult@vbcbharat.com
```

The CLI prints config loaded, enabled status, host, port, encryption, from email, username, recipient and a safe error message if sending fails.

If email does not arrive:

- Check `email_logs`.
- Check mailbox password.
- Check spam folder.
- Check Hostinger MX/SPF/DKIM records.
- Make sure `from_email` usually matches `smtp_username`.
- Make sure SMTP is enabled in admin email settings.

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
```

In backend `config.php`, set:

```php
'allowed_origin' => 'https://www.vbcbharat.com',
```

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

The migration adds:

- `documents.document_label`
- `documents.uploaded_at`
- `service_document_requirements`

Run `migrations/backend_admin_cms_upgrade.sql` on existing databases before relying on the new upload checklist UI. Admins can edit service-specific required/optional upload slots from:

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
