CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tax_help_id VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(160) NOT NULL,
  phone VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  active TINYINT(1) DEFAULT 1,
  internal_note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  last_used_at DATETIME NULL,
  user_agent VARCHAR(255) NULL,
  ip_hash CHAR(64) NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_sessions_user (user_id, expires_at, revoked_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS auth_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  purpose VARCHAR(80) DEFAULT 'session',
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quick_leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NULL,
  phone VARCHAR(30) NOT NULL,
  service VARCHAR(120) NULL,
  message TEXT NULL,
  source_page VARCHAR(160) NULL,
  utm_source VARCHAR(160) NULL,
  utm_campaign VARCHAR(160) NULL,
  status VARCHAR(60) DEFAULT 'New',
  admin_note TEXT NULL,
  assigned_admin_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS service_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_code VARCHAR(24) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  service_type VARCHAR(120) NOT NULL,
  status VARCHAR(80) DEFAULT 'Request received',
  city VARCHAR(120) NULL,
  details TEXT NULL,
  quoted_amount DECIMAL(10,2) NULL,
  assigned_admin_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  request_id INT NULL,
  document_type VARCHAR(120) NULL,
  document_label VARCHAR(180) NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size INT NOT NULL,
  path VARCHAR(500) NOT NULL,
  status VARCHAR(80) DEFAULT 'Received',
  admin_note TEXT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS uploaded_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  request_id INT NULL,
  document_type VARCHAR(120) NULL,
  document_label VARCHAR(180) NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size INT NOT NULL,
  path VARCHAR(500) NOT NULL,
  status VARCHAR(80) DEFAULT 'Received',
  admin_note TEXT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  request_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(40) NOT NULL,
  status VARCHAR(80) DEFAULT 'Payment pending',
  razorpay_order_id VARCHAR(120) NULL,
  razorpay_payment_id VARCHAR(120) NULL,
  admin_note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payment_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  status VARCHAR(80) NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS manual_payment_screenshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  path VARCHAR(500) NOT NULL,
  status VARCHAR(80) DEFAULT 'Payment verification pending',
  admin_note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP NULL,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS status_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  status VARCHAR(80) NOT NULL,
  note TEXT NULL,
  visible_to_user TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS request_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  status VARCHAR(80) NOT NULL,
  note TEXT NULL,
  visible_to_user TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  role VARCHAR(60) DEFAULT 'admin',
  active TINYINT(1) DEFAULT 1,
  force_password_change TINYINT(1) DEFAULT 0,
  last_login_at TIMESTAMP NULL,
  last_seen_at TIMESTAMP NULL,
  login_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_roles (
  role_key VARCHAR(60) PRIMARY KEY,
  label VARCHAR(120) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_permissions (
  permission_key VARCHAR(120) PRIMARY KEY,
  label VARCHAR(180) NOT NULL,
  description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_role_permissions (
  role_key VARCHAR(60) NOT NULL,
  permission_key VARCHAR(120) NOT NULL,
  PRIMARY KEY (role_key, permission_key),
  FOREIGN KEY (permission_key) REFERENCES admin_permissions(permission_key) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_user_permissions (
  admin_id INT NOT NULL,
  permission_key VARCHAR(120) NOT NULL,
  PRIMARY KEY (admin_id, permission_key),
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_key) REFERENCES admin_permissions(permission_key) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  admin_id INT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS request_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  admin_id INT NULL,
  note TEXT NOT NULL,
  visible_to_user TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  request_id INT NULL,
  phone VARCHAR(30) NOT NULL,
  template_key VARCHAR(80) NOT NULL,
  message_text TEXT NOT NULL,
  status VARCHAR(40) DEFAULT 'queued',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(120) DEFAULT 'general',
  recipient VARCHAR(180) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(40) NOT NULL,
  provider VARCHAR(80) DEFAULT 'smtp',
  error_message TEXT NULL,
  related_user_id INT NULL,
  related_request_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NULL,
  user_id INT NULL,
  action VARCHAR(160) NOT NULL,
  details TEXT NULL,
  ip_address VARCHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS api_errors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id VARCHAR(40) NOT NULL,
  method VARCHAR(12) NULL,
  path VARCHAR(255) NULL,
  message TEXT NULL,
  trace MEDIUMTEXT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_api_errors_request (request_id),
  INDEX idx_api_errors_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_quick_leads_phone ON quick_leads(phone);
CREATE INDEX idx_requests_user_status ON service_requests(user_id, status);
CREATE INDEX idx_requests_code ON service_requests(request_code);
CREATE INDEX idx_documents_request ON documents(request_id);
CREATE INDEX idx_payments_request ON payments(request_id);

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(120) PRIMARY KEY,
  setting_value MEDIUMTEXT NULL,
  setting_type VARCHAR(40) DEFAULT 'text',
  group_name VARCHAR(80) DEFAULT 'site',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS homepage_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_key VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(255) NULL,
  subtitle TEXT NULL,
  image_path VARCHAR(500) NULL,
  cta_primary_label VARCHAR(120) NULL,
  cta_primary_url VARCHAR(255) NULL,
  cta_secondary_label VARCHAR(120) NULL,
  cta_secondary_url VARCHAR(255) NULL,
  content_json MEDIUMTEXT NULL,
  is_visible TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS service_page_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(120) NULL,
  short_description TEXT NULL,
  subtitle TEXT NULL,
  hero_image VARCHAR(500) NULL,
  icon VARCHAR(180) NULL,
  og_image VARCHAR(500) NULL,
  sections_json MEDIUMTEXT NULL,
  pricing_text TEXT NULL,
  faqs_json MEDIUMTEXT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description TEXT NULL,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  show_in_menu TINYINT(1) DEFAULT 1,
  show_on_homepage TINYINT(1) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  service_name VARCHAR(255) NOT NULL,
  category VARCHAR(120) NULL,
  short_description TEXT NULL,
  hero_title VARCHAR(255) NULL,
  hero_subtitle TEXT NULL,
  hero_image VARCHAR(500) NULL,
  pricing_text TEXT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description TEXT NULL,
  active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  show_in_menu TINYINT(1) DEFAULT 1,
  show_on_homepage TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS service_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NULL,
  service_slug VARCHAR(160) NOT NULL,
  section_key VARCHAR(120) NOT NULL,
  title VARCHAR(255) NULL,
  content MEDIUMTEXT NULL,
  sort_order INT DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS service_faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NULL,
  service_slug VARCHAR(160) NOT NULL,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS service_document_requirements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_slug VARCHAR(160) NOT NULL,
  document_key VARCHAR(120) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NULL,
  required TINYINT(1) DEFAULT 0,
  allow_multiple TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_service_document_requirement (service_slug, document_key),
  INDEX idx_service_document_requirements_service (service_slug, active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pricing_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_name VARCHAR(180) NOT NULL,
  amount_text VARCHAR(80) NOT NULL,
  starting_price DECIMAL(10,2) NULL,
  billing_type VARCHAR(60) NULL,
  note TEXT NULL,
  features_json MEDIUMTEXT NULL,
  visible_order INT DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
  show_on_homepage TINYINT(1) DEFAULT 1,
  cta_link VARCHAR(255) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_pricing_service (service_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS media_library (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size INT NOT NULL,
  path VARCHAR(500) NOT NULL,
  public_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) NULL,
  title VARCHAR(255) NULL,
  caption TEXT NULL,
  usage_key VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blog_posts_cms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(180) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(120) NULL,
  summary TEXT NULL,
  featured_image VARCHAR(500) NULL,
  content MEDIUMTEXT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description TEXT NULL,
  tags VARCHAR(500) NULL,
  author_name VARCHAR(160) DEFAULT 'VB Consultants',
  published_at DATETIME NULL,
  published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(180) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(120) NULL,
  excerpt TEXT NULL,
  featured_image VARCHAR(500) NULL,
  content MEDIUMTEXT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description TEXT NULL,
  status VARCHAR(40) DEFAULT 'draft',
  author_name VARCHAR(160) DEFAULT 'VB Consultants',
  published_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blog_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  slug VARCHAR(160) NOT NULL UNIQUE,
  active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blog_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  slug VARCHAR(160) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES blog_posts_cms(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_key VARCHAR(120) DEFAULT 'global',
  service_slug VARCHAR(160) NULL,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  context VARCHAR(180) NULL,
  quote TEXT NOT NULL,
  avatar_image VARCHAR(500) NULL,
  rating TINYINT NULL,
  sort_order INT DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS local_seo_pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(120) NOT NULL,
  state VARCHAR(120) DEFAULT 'Odisha',
  slug VARCHAR(180) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  hero_title VARCHAR(255) NULL,
  body_content MEDIUMTEXT NULL,
  related_services_json MEDIUMTEXT NULL,
  faqs_json MEDIUMTEXT NULL,
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,
  image_path VARCHAR(500) NULL,
  active TINYINT(1) DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS local_pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(120) NOT NULL,
  state VARCHAR(120) DEFAULT 'Odisha',
  slug VARCHAR(180) NOT NULL UNIQUE,
  page_title VARCHAR(255) NOT NULL,
  hero_title VARCHAR(255) NULL,
  body_content MEDIUMTEXT NULL,
  related_services_json MEDIUMTEXT NULL,
  faqs_json MEDIUMTEXT NULL,
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,
  image_path VARCHAR(500) NULL,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS integration_settings (
  setting_key VARCHAR(140) PRIMARY KEY,
  setting_value MEDIUMTEXT NULL,
  setting_group VARCHAR(80) DEFAULT 'general',
  is_secret TINYINT(1) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(140) PRIMARY KEY,
  setting_value MEDIUMTEXT NULL,
  setting_group VARCHAR(80) DEFAULT 'app',
  is_secret TINYINT(1) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS revalidation_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paths_json MEDIUMTEXT NULL,
  status VARCHAR(40) DEFAULT 'queued',
  response_text TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS email_templates (
  template_key VARCHAR(120) PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  body MEDIUMTEXT NOT NULL,
  active TINYINT(1) DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS scheduled_reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  request_id INT NULL,
  channel VARCHAR(40) DEFAULT 'email',
  template_key VARCHAR(120) NULL,
  run_at DATETIME NOT NULL,
  status VARCHAR(40) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS followup_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reminder_id INT NULL,
  user_id INT NULL,
  request_id INT NULL,
  channel VARCHAR(40) NOT NULL,
  recipient VARCHAR(180) NULL,
  template_key VARCHAR(120) NULL,
  status VARCHAR(40) DEFAULT 'queued',
  response_text TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,
  FOREIGN KEY (reminder_id) REFERENCES scheduled_reminders(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO admin_roles (role_key, label, description) VALUES
('super_admin', 'Super Admin', 'Full control over admin, content, payments and settings'),
('admin', 'Admin', 'Manage most operational and content sections'),
('staff', 'Staff', 'Manage leads, requests, notes, status and documents'),
('content_editor', 'Content Editor', 'Manage website copy, media, services, blog and SEO'),
('accountant', 'Accountant', 'Manage requests, documents and payments'),
('viewer', 'Viewer', 'Read-only access to dashboard data')
ON DUPLICATE KEY UPDATE label=VALUES(label), description=VALUES(description);

INSERT INTO admin_permissions (permission_key, label, description) VALUES
('view_dashboard', 'View dashboard', 'Open the admin dashboard'),
('manage_users', 'Manage users', 'View and update customer users'),
('manage_staff', 'Manage staff', 'Create and update admin staff'),
('view_leads', 'View leads', 'View quick phone leads'),
('manage_leads', 'Manage leads', 'Update lead status and notes'),
('view_requests', 'View requests', 'View service requests'),
('manage_requests', 'Manage requests', 'Update request status, notes and assignment'),
('view_documents', 'View documents', 'See document records'),
('download_documents', 'Download documents', 'Download private customer documents'),
('delete_documents', 'Delete documents', 'Delete uploaded customer documents'),
('view_payments', 'View payments', 'View payments and screenshots'),
('verify_payments', 'Verify payments', 'Verify or reject manual payments'),
('manage_pricing', 'Manage pricing', 'Edit pricing items'),
('manage_site_settings', 'Manage site settings', 'Edit brand, contact, SEO and footer settings'),
('manage_homepage', 'Manage homepage', 'Edit homepage content and testimonials'),
('manage_services', 'Manage services', 'Edit service pages and FAQs'),
('manage_blog', 'Manage blog', 'Create and publish blog posts'),
('manage_media', 'Manage media', 'Upload and manage public media'),
('manage_seo', 'Manage SEO', 'Edit SEO and local pages'),
('manage_integrations', 'Manage integrations', 'Edit Razorpay, SMTP, WhatsApp and automation settings'),
('export_data', 'Export data', 'Export leads and reports'),
('view_audit_logs', 'View audit logs', 'View admin audit history')
ON DUPLICATE KEY UPDATE label=VALUES(label), description=VALUES(description);

INSERT INTO admin_role_permissions (role_key, permission_key)
SELECT 'super_admin', permission_key FROM admin_permissions
ON DUPLICATE KEY UPDATE permission_key=VALUES(permission_key);

INSERT INTO admin_role_permissions (role_key, permission_key) VALUES
('admin','view_dashboard'),('admin','manage_users'),('admin','manage_staff'),('admin','view_leads'),('admin','manage_leads'),('admin','view_requests'),('admin','manage_requests'),('admin','view_documents'),('admin','download_documents'),('admin','view_payments'),('admin','verify_payments'),('admin','manage_pricing'),('admin','manage_site_settings'),('admin','manage_homepage'),('admin','manage_services'),('admin','manage_blog'),('admin','manage_media'),('admin','manage_seo'),('admin','manage_integrations'),('admin','export_data'),('admin','view_audit_logs'),
('staff','view_dashboard'),('staff','view_leads'),('staff','manage_leads'),('staff','view_requests'),('staff','manage_requests'),('staff','view_documents'),('staff','download_documents'),('staff','view_payments'),
('content_editor','view_dashboard'),('content_editor','manage_site_settings'),('content_editor','manage_homepage'),('content_editor','manage_services'),('content_editor','manage_blog'),('content_editor','manage_media'),('content_editor','manage_seo'),('content_editor','manage_pricing'),
('accountant','view_dashboard'),('accountant','view_requests'),('accountant','manage_requests'),('accountant','view_documents'),('accountant','download_documents'),('accountant','view_payments'),('accountant','verify_payments'),
('viewer','view_dashboard'),('viewer','view_leads'),('viewer','view_requests'),('viewer','view_documents'),('viewer','view_payments')
ON DUPLICATE KEY UPDATE permission_key=VALUES(permission_key);

INSERT INTO site_settings (setting_key, setting_value, setting_type, group_name) VALUES
('business_name', 'VB Consultants', 'text', 'site'),
('registered_business_name', 'Veedanath Business Consultants', 'text', 'site'),
('logo_mark', '/images/vbc/logo-mark.png', 'text', 'site'),
('logo_horizontal', '/images/vbc/logo-horizontal.png', 'text', 'site'),
('favicon', '/favicon.svg', 'text', 'site'),
('apple_touch_icon', '/apple-touch-icon.png', 'text', 'site'),
('default_og_image', '/images/vbc/og-default-vb-consultants.png', 'text', 'site'),
('tagline', 'Tax, Compliance & Business Support', 'text', 'site'),
('phone', '+91 90000 00000', 'text', 'site'),
('whatsapp_number', '919000000000', 'text', 'site'),
('support_email', 'consult@vbcbharat.com', 'text', 'site'),
('address', 'Office address placeholder, Bhubaneswar, Odisha 751001', 'text', 'site'),
('google_maps_link', '', 'text', 'site'),
('business_hours', 'Monday to Saturday, 10:00 AM to 6:00 PM', 'text', 'site'),
('footer_text', 'Online support for ITR filing, GST, loan paperwork, bookkeeping, notices and business compliance.', 'text', 'site'),
('social_links', '{}', 'json', 'site'),
('default_seo_title', 'VB Consultants | Online Tax, GST and Business Paperwork Help', 'text', 'seo'),
('default_seo_description', 'VB Consultants offers simple online ITR filing, GST, tax notice, loan project report and business compliance support for Indian individuals and small businesses.', 'text', 'seo'),
('setup_completed', '0', 'boolean', 'system')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

INSERT INTO homepage_sections (section_key, title, subtitle, image_path, cta_primary_label, cta_primary_url, cta_secondary_label, cta_secondary_url, content_json, is_visible, sort_order) VALUES
('homepage', 'Tax, GST and business paperwork made simple for Indian families and businesses.', 'File ITR, get GST help, upload documents, pay securely and track your request — all from your phone.', '/images/hero-premium-consulting.jpg', 'Start ITR Filing', '/start', 'Request Call Back', '/quick-contact', '{"finalCtaTitle":"Need help today?","finalCtaDescription":"Start ITR filing, upload documents, or enter your phone number. We will guide you in simple steps.","sectionVisibility":{"popularServices":true,"pricing":true,"testimonials":true,"faqs":true}}', 1, 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO pricing_items (service_name, amount_text, starting_price, billing_type, note, features_json, visible_order, active, show_on_homepage, cta_link) VALUES
('Salary ITR', '₹199 onwards', 199.00, 'one_time', 'For simple salary, pension, Form 16 and basic interest income cases.', '["Form 16 support","Eligible deductions checked","Simple upload","Status updates"]', 1, 1, 1, '/salary-itr-filing'),
('Salary ITR with review', '₹499 onwards', 499.00, 'one_time', 'For salary cases with deductions, refund review, rent, home loan or extra records.', '["Documents checked","Clear fee before work","Payment options","Completion update"]', 2, 1, 1, '/salary-itr-filing'),
('ITR-2 / Capital Gains', 'Custom', NULL, 'custom', 'For shares, mutual funds, property sale or other capital gains records.', '["Broker report check","Capital gains summary","Missing details list","Custom quote"]', 3, 1, 1, '/itr-2-capital-gains-filing'),
('Freelancer / Business ITR', 'Custom', NULL, 'custom', 'For freelancers, consultants, proprietors and small business income records.', '["Income records","Expense records","Bank statement review","Custom quote"]', 4, 1, 0, '/freelancer-business-itr'),
('GST Filing', 'Custom / monthly', NULL, 'monthly', 'For monthly or quarterly GST return support based on invoice volume.', '["Sales data","Purchase data","Payment tracking","Monthly support"]', 5, 1, 1, '/gst-return-filing'),
('GST Registration', 'Custom', NULL, 'custom', 'For new GST registration document checklist and application support.', '["Business details","Address proof","Bank details","Document checklist"]', 6, 1, 0, '/gst-registration'),
('Bookkeeping', 'Custom / monthly', NULL, 'monthly', 'For invoices, expenses, bank records and monthly business summaries.', '["Invoice records","Expense records","Bank records","Monthly summary"]', 7, 1, 0, '/bookkeeping'),
('TDS Return Filing', 'Custom', NULL, 'custom', 'For salary, contractor, rent or professional payment TDS return support.', '["TAN records","Deductee details","Challan check","Return support"]', 8, 1, 0, '/tds-return-filing'),
('Payroll Compliance', 'Custom', NULL, 'custom', 'For salary records, employee inputs, TDS and payroll paperwork.', '["Employee details","Salary records","Monthly inputs","Status tracking"]', 9, 1, 0, '/payroll-compliance'),
('Tax Notice Help', 'Custom', NULL, 'custom', 'For income tax notice, mismatch, demand or defective return support.', '["Notice check","Deadline review","Record comparison","Next steps"]', 10, 1, 1, '/tax-notice-help'),
('Business Registration', 'Custom', NULL, 'custom', 'For proprietorship, firm, GST, MSME and basic setup paperwork.', '["Business type","Document list","Setup guidance","Related services"]', 11, 1, 0, '/business-registration'),
('MSME / Udyam Registration', 'Custom', NULL, 'custom', 'For Udyam registration support for small businesses and service providers.', '["Business details","Activity inputs","Certificate tracking","Loan readiness"]', 12, 1, 0, '/msme-udyam-registration'),
('Loan Project Report', 'Custom', NULL, 'custom', 'For business loan project report, cost estimate and lender paperwork support.', '["Project inputs","Cost details","Report structure","Document tracking"]', 13, 1, 1, '/loan-project-report'),
('Subsidy Scheme Guidance', 'Custom', NULL, 'custom', 'For subsidy or scheme document checklist and application paperwork guidance.', '["Scheme documents","Eligibility records","Project estimate","Next steps"]', 14, 1, 0, '/subsidy-scheme-guidance')
ON DUPLICATE KEY UPDATE amount_text=VALUES(amount_text), starting_price=VALUES(starting_price), billing_type=VALUES(billing_type), note=VALUES(note), features_json=VALUES(features_json), visible_order=VALUES(visible_order), active=VALUES(active), show_on_homepage=VALUES(show_on_homepage), cta_link=VALUES(cta_link);

INSERT INTO service_page_content (slug, title, category, short_description, subtitle, hero_image, sections_json, pricing_text, faqs_json, seo_title, seo_description, is_active, sort_order, show_in_menu, show_on_homepage) VALUES
('salary-itr-filing','Salary ITR Filing','Individuals','Upload Form 16 and basic details from your phone.','Simple support for salaried people and pensioners who need ITR filing help.','/images/vbc/salary-itr-form-16-family.png','{"who":["Salaried people","Pensioners","People with Form 16"],"documents":["Form 16","PAN","Aadhaar","Bank details","Investment proofs if any"],"process":["Enter phone number","Upload documents","Fee is confirmed","Work is completed and status is updated"]}','₹199 onwards. Final fee depends on documents, income type and complexity.','[{"question":"Can I start with only Form 16?","answer":"Yes. Upload Form 16 first. We will tell you if more records are needed."}]','Salary ITR Filing Online | VB Consultants','Simple online Salary ITR filing support with secure upload, clear pricing and status tracking.',1,1,1,1),
('itr-1-filing','ITR-1 Filing','Individuals','Simple ITR-1 support for eligible resident individuals.','For salary, pension, one house property and basic interest income cases where ITR-1 applies.','/images/vbc/salary-itr-form-16-family.png','{"who":["Resident individuals","Salary or pension income","Basic interest income"],"documents":["Form 16","PAN","Aadhaar","Bank details"],"process":["Share details","Eligibility is checked","Upload missing documents","Track completion"]}','₹199 onwards for simple salary cases.','[{"question":"Who cannot use ITR-1?","answer":"ITR-1 may not apply for business income, many capital gains cases, NRI status or director cases."}]','ITR-1 Filing Help Online | VB Consultants','Simple ITR-1 filing help for eligible Indian salary and pension income cases.',1,2,1,0),
('itr-2-capital-gains-filing','ITR-2 / Capital Gains Filing','Individuals','Support for shares, mutual funds, property sale and other capital gains records.','Upload broker reports and related documents. We will review what details are needed.','/images/vbc/salary-itr-form-16-family.png','{"who":["People with share or mutual fund sales","Property sale cases","More detailed income cases"],"documents":["Capital gains statement","AIS/Form 26AS","Broker report","Bank details"],"process":["Upload reports","Details are checked","Custom fee is confirmed","Status is updated"]}','Custom fee after document review.','[]','ITR-2 Capital Gains Filing Support | VB Consultants','ITR-2 and capital gains filing support for shares, mutual funds, property and other detailed income cases.',1,3,1,0),
('freelancer-business-itr','Freelancer / Business ITR','Individuals','ITR support for freelancers, consultants and proprietors.','Share income, expenses and bank records. We will guide the checklist.','/images/vbc/gst-business-compliance-consultation.png','{"who":["Freelancers","Consultants","Small business owners"],"documents":["Income records","Expense records","Bank statement","Previous ITR if available"],"process":["Share business details","Upload records","Fee is confirmed","Request is tracked"]}','Custom fee after document review.','[]','Freelancer and Business ITR Support | VB Consultants','Simple tax filing support for freelancers, consultants and small business income records.',1,4,1,0),
('tax-notice-help','Tax Notice Help','Individuals','Help understanding tax notices and required reply documents.','Upload the notice. We will check the issue and contact you with next steps.','/images/vbc/tax-notice-help-consultation.png','{"who":["People who received income tax notices","Mismatch or demand cases","Defective return cases"],"documents":["Notice copy","Filed ITR","AIS/Form 26AS","Supporting records"],"process":["Upload notice","Issue is checked","Documents requested","Reply support starts after fee confirmation"]}','Custom fee based on notice type and complexity.','[]','Tax Notice Help Online | VB Consultants','Tax notice help for mismatch, demand, defective return and document reply support.',1,5,1,1),
('gst-registration','GST Registration','Business','GST registration document checklist and support.','Share business details and documents. We will guide the registration process.','/images/vbc/gst-business-compliance-consultation.png','{"who":["New businesses","Online sellers","Service providers"],"documents":["PAN","Aadhaar","Address proof","Bank details","Business proof"],"process":["Share business type","Upload documents","Application details prepared","Status updated"]}','Custom fee after business details are checked.','[]','GST Registration Help | VB Consultants','GST registration support with document checklist, upload and status tracking.',1,6,1,0),
('gst-return-filing','GST Return Filing','Business','GST filing support for monthly or quarterly returns.','Upload sales and purchase data. Track request and payment status.','/images/vbc/gst-business-compliance-consultation.png','{"who":["GST registered businesses","Small traders","Service providers"],"documents":["Sales data","Purchase data","Bank statement","Previous return if available"],"process":["Upload data","Records are checked","Payment and filing status updated","Summary shared"]}','Custom / monthly based on invoice volume.','[]','GST Return Filing Help | VB Consultants','GST return filing help for Indian small businesses with upload and tracking support.',1,7,1,1),
('bookkeeping','Bookkeeping','Business','Organize invoices, expenses and bank records.','Monthly bookkeeping support for clearer GST, ITR and business paperwork.','/images/vbc/gst-business-compliance-consultation.png','{"who":["Small businesses","Freelancers","GST businesses"],"documents":["Invoices","Expense records","Bank statement"],"process":["Upload records","Missing items listed","Monthly summary prepared","Status updated"]}','Custom / monthly based on volume.','[]','Bookkeeping Support for Small Business | VB Consultants','Bookkeeping support for invoices, expenses, bank records and monthly summaries.',1,8,1,0),
('tds-return-filing','TDS Return Filing','Business','TDS return paperwork support for salary and vendor deductions.','Share challans, TAN and deductee details. We will guide the filing checklist.','/images/vbc/gst-business-compliance-consultation.png','{"who":["Employers","Businesses deducting TDS","Contractor payment cases"],"documents":["TAN","Challans","Deductee details","Payment records"],"process":["Upload records","Data is checked","Return support starts","Status updated"]}','Custom fee after records are checked.','[]','TDS Return Filing Support | VB Consultants','TDS return filing support for salary, contractor, rent and professional payment records.',1,9,1,0),
('payroll-compliance','Payroll Compliance','Business','Payroll records, TDS inputs and employee paperwork support.','Keep salary records and employee details organized with a simple monthly process.','/images/vbc/gst-business-compliance-consultation.png','{"who":["Small employers","Growing teams","Businesses with salary records"],"documents":["Employee details","Salary records","TDS inputs"],"process":["Share monthly inputs","Records checked","Status updated","Reports shared"]}','Custom / monthly based on team size.','[]','Payroll Compliance Support | VB Consultants','Payroll paperwork and compliance support for Indian small businesses.',1,10,1,0),
('business-registration','Business Registration','Business','Business setup paperwork guidance.','Understand documents and next steps for starting or formalizing a business.','/images/vbc/loan-project-report-business-support.png','{"who":["New business owners","Small firms","Service providers"],"documents":["PAN","Aadhaar","Address proof","Business details"],"process":["Share business idea","Checklist is prepared","Documents uploaded","Next steps shared"]}','Custom fee based on registration type.','[]','Business Registration Support | VB Consultants','Business registration paperwork support for proprietorship, firm, GST, MSME and related setup needs.',1,11,1,0),
('company-llp-compliance','Company / LLP Compliance','Business','Track annual and routine company or LLP paperwork.','Organize records, payment status and compliance tasks from one request flow.','/images/vbc/loan-project-report-business-support.png','{"who":["Companies","LLPs","Directors and partners"],"documents":["Incorporation records","Financial records","Previous filings"],"process":["Upload records","Checklist shared","Fee confirmed","Status tracked"]}','Custom fee based on work needed.','[]','Company LLP Compliance Support | VB Consultants','Company and LLP compliance paperwork support with document tracking and simple updates.',1,12,1,0),
('msme-udyam-registration','MSME / Udyam Registration','Business','Udyam registration support for small businesses.','Upload business details and identity records. Track next steps online.','/images/vbc/loan-project-report-business-support.png','{"who":["Small businesses","Service providers","Manufacturers"],"documents":["Aadhaar","PAN","Business details","Bank details"],"process":["Share details","Documents checked","Registration support starts","Certificate status updated"]}','Custom fee after details are checked.','[]','MSME Udyam Registration Support | VB Consultants','MSME and Udyam registration paperwork support for Indian small businesses.',1,13,1,0),
('loan-project-report','Loan Project Report','Loans','Project report and loan paperwork support.','Share business details, estimates and bank records for a structured project report workflow.','/images/vbc/loan-project-report-business-support.png','{"who":["Small business loan applicants","New project owners","Subsidy applicants"],"documents":["Business details","Cost estimate","Bank statement","Quotation"],"process":["Share project details","Documents checked","Report prepared","Status updated"]}','Custom fee based on report scope.','[]','Loan Project Report Support | VB Consultants','Loan project report and business loan paperwork support for Indian small businesses.',1,14,1,1),
('business-loan-paperwork','Business Loan Paperwork','Loans','Prepare and organize documents for business loan applications.','Get a clear list of missing documents before you apply or reply to lender requests.','/images/vbc/loan-project-report-business-support.png','{"who":["Loan applicants","Small businesses","Existing business owners"],"documents":["Bank statement","Business details","Existing loan details","Identity proof"],"process":["Share loan need","Checklist prepared","Documents organized","Status updated"]}','Custom fee after document review.','[]','Business Loan Paperwork Support | VB Consultants','Business loan document checklist and paperwork support for Indian small businesses.',1,15,1,0),
('subsidy-scheme-guidance','Subsidy Scheme Guidance','Loans','Guidance for subsidy paperwork and document lists.','Understand required records, project estimates and application document needs.','/images/vbc/loan-project-report-business-support.png','{"who":["Businesses checking schemes","Loan applicants","Project owners"],"documents":["Scheme details","Business records","Project estimate","Identity/address proof"],"process":["Share scheme name","Eligibility records checked","Checklist prepared","Status tracked"]}','Custom fee based on scheme and paperwork.','[]','Subsidy Scheme Paperwork Guidance | VB Consultants','Subsidy scheme document guidance and paperwork support for Indian small businesses.',1,16,1,0),
('digital-signature-certificate-support','Digital Signature Certificate Support','Business','DSC document checklist and support.','Useful for GST, company, tender and other business portal work.','/images/vbc/gst-business-compliance-consultation.png','{"who":["Business owners","Directors","Tender applicants"],"documents":["PAN","Aadhaar","Photo","Mobile/email details"],"process":["Share requirement","Checklist prepared","Documents collected","Next steps shared"]}','Custom fee.','[]','Digital Signature Certificate Support | VB Consultants','Digital Signature Certificate document checklist and support for business use.',1,17,1,0),
('pan-tan-assistance','PAN / TAN Assistance','Business','PAN and TAN paperwork guidance.','Get help organizing basic details and documents for PAN or TAN related work.','/images/vbc/gst-business-compliance-consultation.png','{"who":["Businesses","Employers","New entities"],"documents":["Identity proof","Address proof","Business details"],"process":["Share need","Checklist prepared","Documents checked","Status updated"]}','Custom fee.','[]','PAN TAN Assistance | VB Consultants','PAN and TAN paperwork assistance for individuals and businesses.',1,18,1,0),
('accounting-cleanup-support','Accounting Cleanup Support','Business','Organize old invoices, statements and summaries.','Useful when records are incomplete before GST, ITR or loan paperwork.','/images/vbc/gst-business-compliance-consultation.png','{"who":["Small businesses","Freelancers","GST users"],"documents":["Invoices","Bank statements","Old summaries"],"process":["Upload records","Missing list prepared","Cleanup plan shared","Status tracked"]}','Custom / monthly based on volume.','[]','Accounting Cleanup Support | VB Consultants','Accounting cleanup support for old invoices, bank records and business summaries.',1,19,1,0),
('annual-compliance-support','Annual Compliance Support','Business','Yearly paperwork tracking for businesses.','Keep pending documents and compliance tasks organized.','/images/vbc/loan-project-report-business-support.png','{"who":["Companies","LLPs","Small businesses"],"documents":["Financial records","Previous filings","Business records"],"process":["Checklist shared","Documents uploaded","Work tracked","Updates shared"]}','Custom fee based on work.','[]','Annual Compliance Support | VB Consultants','Annual compliance paperwork support for companies, LLPs and small businesses.',1,20,1,0),
('professional-tax-labour-compliance','Professional Tax / Labour Compliance Support','Business','State-level employee and business compliance paperwork support.','Organize employee and business details for applicable compliance needs.','/images/vbc/gst-business-compliance-consultation.png','{"who":["Employers","Small businesses","Growing teams"],"documents":["Employee details","Salary records","Business details"],"process":["Share details","Checklist prepared","Records checked","Status updated"]}','Custom fee.','[]','Professional Tax Labour Compliance Support | VB Consultants','Professional tax and labour compliance paperwork support for small businesses.',1,21,1,0),
('import-export-documentation-help','Import / Export Documentation Help','Business','Document checklist support for import-export needs.','Share business details and required document needs for guidance.','/images/vbc/loan-project-report-business-support.png','{"who":["Importers","Exporters","New businesses"],"documents":["Business proof","PAN","Bank details","Address proof"],"process":["Share requirement","Checklist prepared","Documents checked","Next steps shared"]}','Custom fee.','[]','Import Export Documentation Help | VB Consultants','Import-export document checklist and related paperwork support.',1,22,1,0),
('general-tax-support','General Tax Support','Individuals','Not sure what you need? Start with your phone number.','Choose Not sure and we will guide you with simple next steps.','/images/vbc/mobile-document-upload-india.png','{"who":["Anyone unsure about tax paperwork","Families","Small business owners"],"documents":["Relevant records if available"],"process":["Enter phone","Explain need","Checklist shared","Next steps tracked"]}','Fee confirmed before work starts.','[]','General Tax Support | VB Consultants','General tax support and paperwork guidance for Indian individuals and small businesses.',1,23,1,0)
ON DUPLICATE KEY UPDATE title=VALUES(title), category=VALUES(category), short_description=VALUES(short_description), subtitle=VALUES(subtitle), hero_image=VALUES(hero_image), sections_json=VALUES(sections_json), pricing_text=VALUES(pricing_text), faqs_json=VALUES(faqs_json), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), is_active=VALUES(is_active), sort_order=VALUES(sort_order), show_in_menu=VALUES(show_in_menu), show_on_homepage=VALUES(show_on_homepage);

INSERT INTO services (slug, service_name, category, short_description, hero_title, hero_subtitle, hero_image, pricing_text, seo_title, seo_description, active, sort_order, show_in_menu, show_on_homepage)
SELECT slug, title, category, short_description, title, subtitle, hero_image, pricing_text, seo_title, seo_description, is_active, sort_order, show_in_menu, show_on_homepage
FROM service_page_content
ON DUPLICATE KEY UPDATE service_name=VALUES(service_name), category=VALUES(category), short_description=VALUES(short_description), hero_title=VALUES(hero_title), hero_subtitle=VALUES(hero_subtitle), hero_image=VALUES(hero_image), pricing_text=VALUES(pricing_text), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), active=VALUES(active), sort_order=VALUES(sort_order), show_in_menu=VALUES(show_in_menu), show_on_homepage=VALUES(show_on_homepage);

INSERT INTO service_document_requirements (service_slug, document_key, title, description, required, allow_multiple, sort_order, active) VALUES
('salary-itr-filing','form_16','Form 16','Upload Form 16 from your employer.',1,0,1,1),
('salary-itr-filing','pan','PAN','PAN card copy or clear PAN details.',0,0,2,1),
('salary-itr-filing','aadhaar','Aadhaar','Aadhaar copy if available.',0,0,3,1),
('salary-itr-filing','ais_26as','AIS / Form 26AS','Upload AIS or Form 26AS if you have it.',0,1,4,1),
('salary-itr-filing','bank_details','Bank details','Cancelled cheque, passbook page or bank details.',0,1,5,1),
('salary-itr-filing','investment_proofs','Investment proofs','Insurance, rent, home loan or deduction proofs if any.',0,1,6,1),
('salary-itr-filing','previous_itr','Previous year ITR','Previous ITR acknowledgement if available.',0,1,7,1),
('salary-itr-filing','other_documents','Other documents','Upload any other relevant records.',0,1,99,1),
('itr-1-filing','form_16','Form 16','Upload Form 16 from your employer.',1,0,1,1),
('itr-1-filing','pan','PAN','PAN card copy or clear PAN details.',0,0,2,1),
('itr-1-filing','aadhaar','Aadhaar','Aadhaar copy if available.',0,0,3,1),
('itr-1-filing','ais_26as','AIS / Form 26AS','Upload AIS or Form 26AS if you have it.',0,1,4,1),
('itr-1-filing','bank_details','Bank details','Cancelled cheque, passbook page or bank details.',0,1,5,1),
('itr-1-filing','investment_proofs','Investment proofs','Insurance, rent, home loan or deduction proofs if any.',0,1,6,1),
('itr-1-filing','previous_itr','Previous year ITR','Previous ITR acknowledgement if available.',0,1,7,1),
('itr-1-filing','other_documents','Other documents','Upload any other relevant records.',0,1,99,1),
('itr-2-capital-gains-filing','capital_gains_statement','Capital gains statement','Broker or mutual fund capital gains statement.',1,1,1,1),
('itr-2-capital-gains-filing','pan','PAN','PAN card copy or PAN details.',0,0,2,1),
('itr-2-capital-gains-filing','aadhaar','Aadhaar','Aadhaar copy if available.',0,0,3,1),
('itr-2-capital-gains-filing','ais_26as','AIS / Form 26AS','Official tax statement if available.',0,1,4,1),
('itr-2-capital-gains-filing','broker_report','Broker report','Share, mutual fund or securities report.',0,1,5,1),
('itr-2-capital-gains-filing','bank_details','Bank details','Bank proof or statement if relevant.',0,1,6,1),
('itr-2-capital-gains-filing','previous_itr','Previous year ITR','Previous ITR acknowledgement if available.',0,1,7,1),
('itr-2-capital-gains-filing','other_documents','Other documents','Upload any other related document.',0,1,99,1),
('freelancer-business-itr','income_details','Income details','Invoices, receipts, payment summary or income sheet.',1,1,1,1),
('freelancer-business-itr','expense_records','Expense records','Bills, expense sheet or business purchase records.',0,1,2,1),
('freelancer-business-itr','bank_statement','Bank statement','Bank statement for business or professional receipts.',0,1,3,1),
('freelancer-business-itr','gst_returns','GST returns','GST return records if applicable.',0,1,4,1),
('freelancer-business-itr','previous_itr','Previous year ITR','Previous ITR acknowledgement if available.',0,1,5,1),
('freelancer-business-itr','other_documents','Other documents','Upload any other related document.',0,1,99,1),
('gst-registration','business_address_proof','Business address proof','Rent agreement, electricity bill, tax receipt or ownership proof.',1,1,1,1),
('gst-registration','business_details','Business details','Business name, activity, owner details and place of business.',1,1,2,1),
('gst-registration','pan','PAN','PAN of owner or business as applicable.',0,0,3,1),
('gst-registration','aadhaar','Aadhaar','Aadhaar of proprietor or authorized person.',0,0,4,1),
('gst-registration','bank_details','Bank details','Cancelled cheque or bank account proof.',0,1,5,1),
('gst-registration','other_documents','Other documents','Upload any other business proof.',0,1,99,1),
('gst-return-filing','sales_data','Sales data','Sales invoices, sales sheet or outward supply data.',1,1,1,1),
('gst-return-filing','purchase_data','Purchase data','Purchase invoices, purchase sheet or inward supply data.',1,1,2,1),
('gst-return-filing','gst_login_note','GST login support note','Do not upload passwords here. Our team will contact you for safe next steps.',0,0,3,1),
('gst-return-filing','bank_statement','Bank statement','Bank statement if needed for checking records.',0,1,4,1),
('gst-return-filing','previous_return','Previous return','Previous GST return if available.',0,1,5,1),
('gst-return-filing','other_documents','Other documents','Upload any other related GST record.',0,1,99,1),
('bookkeeping','sales_invoices','Sales invoices','Sales invoices or sales data.',1,1,1,1),
('bookkeeping','purchase_bills','Purchase bills','Purchase bills and expense records.',1,1,2,1),
('bookkeeping','bank_statement','Bank statement','Bank statement for the period.',0,1,3,1),
('bookkeeping','other_documents','Other documents','Upload any other business records.',0,1,99,1),
('tds-return-filing','tan_details','TAN details','TAN and deductor details.',1,0,1,1),
('tds-return-filing','deductee_details','Deductee details','Deductee PAN and payment summary.',1,1,2,1),
('tds-return-filing','challans','TDS challans','TDS challan copies.',0,1,3,1),
('tds-return-filing','other_documents','Other documents','Upload any other TDS records.',0,1,99,1),
('tax-notice-help','notice_copy','Notice copy','Upload the income tax notice PDF, image or screenshot.',1,1,1,1),
('tax-notice-help','pan','PAN','PAN card copy or PAN details.',0,0,2,1),
('tax-notice-help','related_itr','Related ITR','ITR acknowledgement or computation if available.',0,1,3,1),
('tax-notice-help','supporting_records','Supporting records','AIS, Form 26AS, bank or income records.',0,1,4,1),
('tax-notice-help','other_documents','Other documents','Upload any other related document.',0,1,99,1),
('business-registration','business_details','Business details','Business name, activity, owner details and address.',1,1,1,1),
('business-registration','identity_address_proof','Identity and address proof','PAN, Aadhaar and address proof if available.',0,1,2,1),
('business-registration','bank_details','Bank details','Bank proof if available.',0,1,3,1),
('business-registration','other_documents','Other documents','Upload any other registration document.',0,1,99,1),
('loan-project-report','business_details','Business details','Business activity, owner details and project summary.',1,1,1,1),
('loan-project-report','project_estimate','Project estimate / quotation','Quotation, cost estimate or project inputs.',1,1,2,1),
('loan-project-report','bank_statement','Bank statement','Bank statement if available.',0,1,3,1),
('loan-project-report','existing_loan','Existing loan details','Existing loan details if any.',0,1,4,1),
('loan-project-report','identity_address_proof','Identity / address proof','Identity and address proof if available.',0,1,5,1),
('loan-project-report','other_documents','Other documents','Upload any other project or loan record.',0,1,99,1),
('business-loan-paperwork','business_details','Business details','Business activity, owner details and project summary.',1,1,1,1),
('business-loan-paperwork','project_estimate','Project estimate / quotation','Quotation, cost estimate or project inputs.',1,1,2,1),
('business-loan-paperwork','bank_statement','Bank statement','Bank statement if available.',0,1,3,1),
('business-loan-paperwork','existing_loan','Existing loan details','Existing loan details if any.',0,1,4,1),
('business-loan-paperwork','identity_address_proof','Identity / address proof','Identity and address proof if available.',0,1,5,1),
('business-loan-paperwork','other_documents','Other documents','Upload any other project or loan record.',0,1,99,1),
('subsidy-scheme-guidance','business_details','Business details','Business activity, owner details and project summary.',1,1,1,1),
('subsidy-scheme-guidance','project_estimate','Project estimate / quotation','Quotation, cost estimate or scheme inputs.',1,1,2,1),
('subsidy-scheme-guidance','scheme_details','Scheme details','Scheme name, link or notice if available.',0,1,3,1),
('subsidy-scheme-guidance','identity_address_proof','Identity / address proof','Identity and address proof if available.',0,1,4,1),
('subsidy-scheme-guidance','other_documents','Other documents','Upload any other subsidy-related record.',0,1,99,1),
('msme-udyam-registration','business_details','Business details','Business name, activity and address details.',1,1,1,1),
('msme-udyam-registration','aadhaar','Aadhaar','Aadhaar of proprietor or authorized person.',0,0,2,1),
('msme-udyam-registration','pan','PAN','PAN details if available.',0,0,3,1),
('msme-udyam-registration','bank_details','Bank details','Bank details if available.',0,1,4,1),
('msme-udyam-registration','other_documents','Other documents','Upload any other relevant record.',0,1,99,1),
('not-sure','relevant_documents','Any relevant document','Upload what you have. Add a message so we understand your need.',0,1,1,1)
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), required=VALUES(required), allow_multiple=VALUES(allow_multiple), sort_order=VALUES(sort_order), active=VALUES(active);

INSERT INTO faqs (page_key, service_slug, question, answer, sort_order, active) VALUES
('homepage', '', 'Can I start with only my phone number?', 'Yes. Enter your phone number and the team can call or message you with the next step.', 1, 1),
('homepage', '', 'Can I send documents on WhatsApp?', 'Yes. You can upload documents on the website or ask for WhatsApp support if you need help.', 2, 1),
('homepage', '', 'Is the Salary ITR price fixed?', 'Salary ITR starts from ₹199 onwards. Final fee depends on documents, income type and complexity.', 3, 1),
('homepage', '', 'Do you promise a refund?', 'No. Refund depends on official records and eligibility. We do not make false refund promises.', 4, 1),
('service', 'salary-itr-filing', 'What documents are needed for Salary ITR?', 'Form 16, PAN, Aadhaar, bank details, AIS/Form 26AS if available and investment proofs if any.', 1, 1),
('service', 'gst-return-filing', 'What data is needed for GST filing?', 'Sales data, purchase data, bank statement and previous return details if available.', 1, 1),
('service', 'tax-notice-help', 'Can you help with an income tax notice?', 'Yes. Upload the notice first. The team will check the issue and ask for required records.', 1, 1)
ON DUPLICATE KEY UPDATE answer=VALUES(answer), active=VALUES(active);

INSERT INTO testimonials (name, context, quote, avatar_image, rating, sort_order, active) VALUES
('Salary employee', 'ITR filing support', 'I could start with just my phone number and Form 16. The steps were simple.', '', 5, 1, 1),
('Small business owner', 'GST and records', 'The document checklist helped me understand what was missing before filing.', '', 5, 2, 1),
('Family user', 'Notice help', 'The team explained the notice in simple words and asked only for relevant records.', '', 5, 3, 1)
ON DUPLICATE KEY UPDATE quote=VALUES(quote), active=VALUES(active);

INSERT INTO blog_categories (name, slug, active) VALUES
('Tax Guides', 'tax-guides', 1),
('GST Guides', 'gst-guides', 1),
('Business Paperwork', 'business-paperwork', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), active=VALUES(active);

INSERT INTO blog_posts_cms (slug, title, category, summary, featured_image, content, seo_title, seo_description, tags, author_name, published, published_at) VALUES
('documents-required-for-salary-itr-filing', 'Documents required for Salary ITR filing', 'Tax Guides', 'A simple checklist for salaried people using Form 16.', '/images/vbc/salary-itr-form-16-family.png', '<p>Keep Form 16, PAN, Aadhaar, AIS or Form 26AS, bank details and deduction proofs if available.</p>', 'Documents Required for Salary ITR Filing | VB Consultants', 'Simple document checklist for salary ITR filing in India.', 'itr,form 16,salary', 'VB Consultants', 0, NULL),
('gst-registration-for-small-business', 'GST registration for small business', 'GST Guides', 'A simple guide to GST registration documents and next steps.', '/images/vbc/gst-business-compliance-consultation.png', '<p>Keep PAN, Aadhaar, business address proof, bank details and business activity details ready.</p>', 'GST Registration for Small Business | VB Consultants', 'Simple GST registration document guide for Indian small businesses.', 'gst,business', 'VB Consultants', 0, NULL)
ON DUPLICATE KEY UPDATE title=VALUES(title), category=VALUES(category), summary=VALUES(summary), featured_image=VALUES(featured_image), content=VALUES(content), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), tags=VALUES(tags);

INSERT INTO blog_posts (slug, title, category, excerpt, featured_image, content, seo_title, seo_description, status, author_name, published_at)
SELECT slug, title, category, summary, featured_image, content, seo_title, seo_description, IF(published=1, 'published', 'draft'), author_name, published_at
FROM blog_posts_cms
ON DUPLICATE KEY UPDATE title=VALUES(title), category=VALUES(category), excerpt=VALUES(excerpt), featured_image=VALUES(featured_image), content=VALUES(content), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), status=VALUES(status);

INSERT INTO local_seo_pages (city, state, slug, title, hero_title, body_content, related_services_json, faqs_json, meta_title, meta_description, image_path, active) VALUES
('Bhubaneswar', 'Odisha', 'itr-filing-bhubaneswar', 'ITR Filing Support in Bhubaneswar', 'ITR filing support in Bhubaneswar', '<p>VB Consultants helps salaried people and families in Bhubaneswar start ITR filing online with secure upload and status tracking.</p>', '["salary-itr-filing","itr-1-filing","tax-notice-help"]', '[]', 'ITR Filing Support in Bhubaneswar | VB Consultants', 'Simple online ITR filing support for Bhubaneswar residents.', '/images/vbc/salary-itr-form-16-family.png', 1),
('Odisha', 'Odisha', 'online-tax-services-odisha', 'Online Tax Services in Odisha', 'Online tax and business paperwork support in Odisha', '<p>Start ITR, GST, notice, loan and business paperwork support from your phone. Upload documents and track status online.</p>', '["salary-itr-filing","gst-return-filing","loan-project-report"]', '[]', 'Online Tax Services Odisha | VB Consultants', 'Online ITR, GST and business paperwork support for users in Odisha.', '/images/vbc/mobile-document-upload-india.png', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title), hero_title=VALUES(hero_title), body_content=VALUES(body_content), meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), active=VALUES(active);

INSERT INTO local_pages (city, state, slug, page_title, hero_title, body_content, related_services_json, faqs_json, meta_title, meta_description, image_path, active)
SELECT city, state, slug, title, hero_title, body_content, related_services_json, faqs_json, meta_title, meta_description, image_path, active
FROM local_seo_pages
ON DUPLICATE KEY UPDATE page_title=VALUES(page_title), hero_title=VALUES(hero_title), body_content=VALUES(body_content), meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), active=VALUES(active);

INSERT INTO integration_settings (setting_key, setting_value, setting_group, is_secret) VALUES
('razorpay_key_id', '', 'razorpay', 0),
('razorpay_key_secret', '', 'razorpay', 1),
('manual_upi_id', 'payments@exampleupi', 'payments', 0),
('smtp_enabled', 'true', 'smtp', 0),
('smtp_host', 'smtp.hostinger.com', 'smtp', 0),
('smtp_port', '465', 'smtp', 0),
('smtp_encryption', 'ssl', 'smtp', 0),
('smtp_username', 'consult@vbcbharat.com', 'smtp', 0),
('smtp_password', '', 'smtp', 1),
('smtp_from_email', 'consult@vbcbharat.com', 'smtp', 0),
('smtp_from_name', 'VB Consultants', 'smtp', 0),
('smtp_reply_to', 'consult@vbcbharat.com', 'smtp', 0),
('admin_email', 'consult@vbcbharat.com', 'smtp', 0),
('mail_debug', 'false', 'smtp', 0),
('google_analytics_id', '', 'analytics', 0),
('google_ads_conversion_id', '', 'analytics', 0),
('meta_pixel_id', '', 'analytics', 0),
('whatsapp_api_phone_number_id', '', 'whatsapp', 0),
('whatsapp_api_access_token', '', 'whatsapp', 1),
('whatsapp_api_templates_json', '{}', 'whatsapp', 0),
('ai_chatbot_enabled', '0', 'chatbot', 0),
('ai_chatbot_provider', '', 'chatbot', 0),
('ai_chatbot_api_key', '', 'chatbot', 1),
('floating_lead_widget_enabled', '1', 'lead_widget', 0),
('email_followup_enabled', '0', 'email_followup', 0)
ON DUPLICATE KEY UPDATE setting_group=VALUES(setting_group);

INSERT INTO app_settings (setting_key, setting_value, setting_group, is_secret) VALUES
('brand_name', 'VB Consultants', 'brand', 0),
('registered_business_name', 'Veedanath Business Consultants', 'brand', 0),
('frontend_url', 'https://www.vbcbharat.com', 'urls', 0),
('api_url', 'https://api.vbcbharat.com', 'urls', 0),
('session_cookie_name', 'vbc_session', 'auth', 0),
('session_cookie_domain', '.vbcbharat.com', 'auth', 0),
('session_days', '30', 'auth', 0),
('revalidate_seconds', '300', 'frontend', 0)
ON DUPLICATE KEY UPDATE setting_group=VALUES(setting_group);

INSERT INTO email_templates (template_key, subject, body, active) VALUES
('quick_lead_admin', 'New quick lead', 'A new quick lead was submitted.\n\nName: {name}\nPhone: {phone}\nService: {service_name}\nMessage: {message}', 1),
('signup_user', 'Your Tax Help ID', 'Hello {name}, your Tax Help ID is {tax_id}. You can upload documents and track your request on our website.', 1),
('signup_admin', 'New signup', 'A new user signed up.\n\nName: {name}\nTax Help ID: {tax_id}', 1),
('service_request_admin', 'New service request', 'A new service request was created.\n\nRequest ID: {request_id}\nService: {service_name}', 1),
('service_request_user', 'Request received', 'Hello {name}, your request {request_id} has been received. We will check the details and update you.', 1),
('document_upload_admin', 'New documents uploaded', 'Documents were uploaded for {service_name}.\n\nRequest ID: {request_id}', 1),
('document_upload_user', 'Documents received', 'Hello {name}, your documents have been received for {service_name}. We will check them and update your request.', 1),
('manual_payment_pending_admin', 'Manual payment screenshot pending verification', 'A manual payment screenshot was uploaded.\n\nRequest ID: {request_id}', 1),
('payment_received_admin', 'Payment received', 'Payment has been received for Request ID {request_id}.', 1),
('payment_received_user', 'Payment received', 'Hello {name}, payment is received for Request ID {request_id}. Work will proceed as per the request status.', 1),
('contact_admin', 'Contact form submission', 'A contact form was submitted.\n\nName: {name}\nPhone: {phone}\nService: {service_name}\nMessage: {message}', 1),
('quick_lead_received', 'We received your request', 'Hello {name}, we received your request. Our team will contact you on phone or WhatsApp.', 1),
('signup_confirmation', 'Your Tax Help ID', 'Hello {name}, your Tax Help ID is {tax_id}. You can upload documents and track your request on our website.', 1),
('request_received', 'Request received', 'Hello {name}, your request {request_id} has been received. We will check the details and update you.', 1),
('documents_pending', 'Documents pending', 'Hello {name}, please upload pending documents for Request ID {request_id}.', 1),
('payment_pending', 'Payment pending', 'Hello {name}, please complete payment for Request ID {request_id} after fee confirmation.', 1),
('payment_received', 'Payment received', 'Hello {name}, payment is received for Request ID {request_id}. Work will proceed as per the request status.', 1),
('status_completed', 'Request completed', 'Hello {name}, your request {request_id} is completed. Please login to check status and details.', 1)
ON DUPLICATE KEY UPDATE subject=VALUES(subject);
