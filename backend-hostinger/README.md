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

For an existing Phase 1 database, import this upgrade file instead of reinstalling:

```text
migrations/phase2_cms_upgrade.sql
```

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
- `app_secret`

Use a long random `app_secret`.

## 4. Create admin user

Run from CLI if available:

```bash
php scripts/create_admin.php admin@example.com StrongPassword "Admin User"
```

If CLI is not available, create a temporary local PHP hash:

```bash
php -r "echo password_hash('StrongPassword', PASSWORD_DEFAULT), PHP_EOL;"
```

Then insert the admin record manually in phpMyAdmin:

```sql
INSERT INTO admin_users (email, password_hash, full_name)
VALUES ('admin@example.com', 'PASTE_HASH_HERE', 'Admin User');
```

Login at:

```text
https://api.vbcbharat.com/admin/login.php
```

## 5. Configure SMTP

Use Hostinger SMTP details in `config.php`.

Test from CLI:

```bash
php scripts/test_mail.php admin@example.com
```

Check the `email_logs` table if the email does not arrive.

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
- Download documents securely after login
- Update request status
- Add admin notes
- Open WhatsApp links
- Export leads CSV
- Edit site settings, homepage copy, service page content, pricing and local SEO pages
- Upload and browse media library images
- Create, edit, publish and delete CMS blog posts
- Prepare Razorpay, UPI, SMTP, analytics, WhatsApp Business API, AI chatbot and email follow-up settings

Manual payment screenshots appear in the database with status `Payment verification pending`. Admin can update status from the API or database; a richer manual payment screen can be expanded later.

## 9. Website content CMS

New Phase 2 admin pages:

- `admin/settings.php` - business name, logo, favicon, contact details, footer copy
- `admin/homepage.php` - hero copy, CTAs, trust badges, featured services, FAQs, testimonials, final CTA
- `admin/services_content.php` - page titles, subtitles, hero image, sections, pricing note, FAQs, SEO
- `admin/pricing.php` - service pricing text and active/inactive state
- `admin/media.php` - public website images for logos, hero images, blog thumbnails and sections
- `admin/blog.php` - simple blog CMS
- `admin/local_seo.php` - city/local SEO page content
- `admin/integrations.php` - placeholders for Razorpay, UPI, SMTP, analytics, WhatsApp API, AI chatbot and follow-up settings

The frontend fetches homepage, pricing and service overrides from `/api/content/...` when `NEXT_PUBLIC_API_BASE_URL` is configured. If the backend is unavailable, local frontend defaults are used.

## 10. Upload safety

Uploads are stored in `backend-hostinger/uploads`.

The folder includes `.htaccess`:

```apache
Options -Indexes
Require all denied
```

Files are renamed using random names. Original filenames are stored in the database.

Website media library files are stored separately in `backend-hostinger/media` and are meant to be publicly viewable. The media folder blocks directory listing and executable files with `.htaccess`.
