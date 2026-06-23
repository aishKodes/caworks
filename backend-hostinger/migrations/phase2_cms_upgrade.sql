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
  subtitle TEXT NULL,
  hero_image VARCHAR(500) NULL,
  sections_json MEDIUMTEXT NULL,
  pricing_text TEXT NULL,
  faqs_json MEDIUMTEXT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description TEXT NULL,
  is_active TINYINT(1) DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pricing_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_name VARCHAR(180) NOT NULL,
  amount_text VARCHAR(80) NOT NULL,
  note TEXT NULL,
  features_json MEDIUMTEXT NULL,
  visible_order INT DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
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
  usage_key VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blog_posts_cms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(180) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  summary TEXT NULL,
  featured_image VARCHAR(500) NULL,
  content MEDIUMTEXT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description TEXT NULL,
  published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS local_seo_pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(120) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  body_content MEDIUMTEXT NULL,
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,
  image_path VARCHAR(500) NULL,
  active TINYINT(1) DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS integration_settings (
  setting_key VARCHAR(140) PRIMARY KEY,
  setting_value MEDIUMTEXT NULL,
  setting_group VARCHAR(80) DEFAULT 'general',
  is_secret TINYINT(1) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO site_settings (setting_key, setting_value, setting_type, group_name) VALUES
('business_name', 'VB Consultants', 'text', 'site'),
('registered_business_name', 'Veedanath Business Consultants', 'text', 'site'),
('logo', '/images/vbc/logo-horizontal.png', 'text', 'site'),
('favicon', '/favicon.svg', 'text', 'site'),
('tagline', 'Tax, GST, loans and business paperwork made simple.', 'text', 'site'),
('phone', '+91 73278 54329', 'text', 'site'),
('whatsapp_number', '919000000000', 'text', 'site'),
('support_email', 'consult@vbcbharat.com', 'text', 'site'),
('address', '', 'text', 'site'),
('footer_text', 'Online support for ITR filing, GST, loan paperwork, bookkeeping, notices and business compliance.', 'text', 'site'),
('social_links', '{}', 'json', 'site')
ON DUPLICATE KEY UPDATE group_name=VALUES(group_name);

INSERT INTO homepage_sections (section_key, title, subtitle, image_path, cta_primary_label, cta_primary_url, cta_secondary_label, cta_secondary_url, content_json, is_visible, sort_order) VALUES
('homepage', 'Tax, GST and business paperwork made simple for Indian families and businesses.', 'File ITR, get GST help, upload documents, pay securely and track your request — all from your phone.', '/images/hero-premium-consulting.jpg', 'Start ITR Filing', '/start', 'Request Call Back', '/quick-contact', '{"finalCtaTitle":"Need help today?","finalCtaDescription":"Start ITR filing, upload documents, or enter your phone number. We will guide you in simple steps.","sectionVisibility":{"popularServices":true,"pricing":true,"testimonials":true,"faqs":true}}', 1, 1)
ON DUPLICATE KEY UPDATE section_key=VALUES(section_key);

INSERT INTO pricing_items (service_name, amount_text, note, features_json, visible_order, active) VALUES
('Salary ITR / ITR-1', '₹199 onwards', 'For simple salary, pension, Form 16 and basic interest income cases.', '["Form 16 support","Eligible deductions checked","Official portal-based process","Status updates"]', 1, 1),
('Salary ITR with review', '₹499 onwards', 'For salary cases with deductions, refund check, rent, home loan or extra records.', '["Documents checked","Clear fee before work","Payment options","Completion update"]', 2, 1)
ON DUPLICATE KEY UPDATE amount_text=VALUES(amount_text);

INSERT INTO integration_settings (setting_key, setting_value, setting_group, is_secret) VALUES
('whatsapp_api_phone_number_id', '', 'whatsapp', 0),
('whatsapp_api_access_token', '', 'whatsapp', 1),
('whatsapp_api_templates_json', '{}', 'whatsapp', 0),
('ai_chatbot_enabled', '0', 'chatbot', 0),
('ai_chatbot_api_key', '', 'chatbot', 1),
('floating_lead_widget_enabled', '1', 'lead_widget', 0),
('email_followup_enabled', '0', 'email_followup', 0)
ON DUPLICATE KEY UPDATE setting_group=VALUES(setting_group);
