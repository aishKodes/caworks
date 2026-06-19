CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tax_help_id VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(160) NOT NULL,
  phone VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE quick_leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NULL,
  phone VARCHAR(30) NOT NULL,
  service VARCHAR(120) NULL,
  message TEXT NULL,
  source_page VARCHAR(160) NULL,
  utm_source VARCHAR(160) NULL,
  utm_campaign VARCHAR(160) NULL,
  status VARCHAR(60) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE service_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_code VARCHAR(24) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  service_type VARCHAR(120) NOT NULL,
  status VARCHAR(80) DEFAULT 'Request received',
  city VARCHAR(120) NULL,
  details TEXT NULL,
  quoted_amount DECIMAL(10,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  request_id INT NULL,
  document_type VARCHAR(120) NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size INT NOT NULL,
  path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  request_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(40) NOT NULL,
  status VARCHAR(80) DEFAULT 'Payment pending',
  razorpay_order_id VARCHAR(120) NULL,
  razorpay_payment_id VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE manual_payment_screenshots (
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

CREATE TABLE status_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  status VARCHAR(80) NOT NULL,
  note TEXT NULL,
  visible_to_user TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admin_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  admin_id INT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE whatsapp_messages (
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

CREATE TABLE email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient VARCHAR(180) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(40) NOT NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE audit_logs (
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

CREATE INDEX idx_quick_leads_phone ON quick_leads(phone);
CREATE INDEX idx_requests_user_status ON service_requests(user_id, status);
CREATE INDEX idx_requests_code ON service_requests(request_code);
CREATE INDEX idx_documents_request ON documents(request_id);
CREATE INDEX idx_payments_request ON payments(request_id);

CREATE TABLE site_settings (
  setting_key VARCHAR(120) PRIMARY KEY,
  setting_value MEDIUMTEXT NULL,
  setting_type VARCHAR(40) DEFAULT 'text',
  group_name VARCHAR(80) DEFAULT 'site',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE homepage_sections (
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

CREATE TABLE service_page_content (
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

CREATE TABLE pricing_items (
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

CREATE TABLE media_library (
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

CREATE TABLE blog_posts_cms (
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

CREATE TABLE local_seo_pages (
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

CREATE TABLE integration_settings (
  setting_key VARCHAR(140) PRIMARY KEY,
  setting_value MEDIUMTEXT NULL,
  setting_group VARCHAR(80) DEFAULT 'general',
  is_secret TINYINT(1) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE email_templates (
  template_key VARCHAR(120) PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  body MEDIUMTEXT NOT NULL,
  active TINYINT(1) DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE scheduled_reminders (
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

INSERT INTO site_settings (setting_key, setting_value, setting_type, group_name) VALUES
('business_name', 'VB Consultants', 'text', 'site'),
('registered_business_name', 'Veedanath Business Consultants', 'text', 'site'),
('logo', '/images/vbc-logo.svg', 'text', 'site'),
('favicon', '/favicon.svg', 'text', 'site'),
('tagline', 'Tax, GST, loans and business paperwork made simple.', 'text', 'site'),
('phone', '+91 90000 00000', 'text', 'site'),
('whatsapp_number', '919000000000', 'text', 'site'),
('support_email', 'support@vbcbharat.com', 'text', 'site'),
('address', 'Office address placeholder, Bhubaneswar, Odisha 751001', 'text', 'site'),
('footer_text', 'Online support for ITR filing, GST, loan paperwork, bookkeeping, notices and business compliance.', 'text', 'site'),
('social_links', '{}', 'json', 'site')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

INSERT INTO homepage_sections (section_key, title, subtitle, image_path, cta_primary_label, cta_primary_url, cta_secondary_label, cta_secondary_url, content_json, is_visible, sort_order) VALUES
('homepage', 'Tax, GST and business paperwork made simple for Indian families and businesses.', 'File ITR, get GST help, upload documents, pay securely and track your request — all from your phone.', '/images/hero-premium-consulting.jpg', 'Start ITR Filing', '/start', 'Request Call Back', '/quick-contact', '{"finalCtaTitle":"Need help today?","finalCtaDescription":"Start ITR filing, upload documents, or enter your phone number. We will guide you in simple steps.","sectionVisibility":{"popularServices":true,"pricing":true,"testimonials":true,"faqs":true}}', 1, 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO pricing_items (service_name, amount_text, note, features_json, visible_order, active) VALUES
('Salary ITR / ITR-1', '₹199 onwards', 'For simple salary, pension, Form 16 and basic interest income cases.', '["Form 16 support","Eligible deductions checked","Official portal-based process","Status updates"]', 1, 1),
('Salary ITR with review', '₹499 onwards', 'For salary cases with deductions, refund check, rent, home loan or extra records.', '["Documents checked","Clear fee before work","Payment options","Completion update"]', 2, 1),
('Capital gains / ITR-2', 'Custom', 'For share, mutual fund, property or other capital gains records.', '["Broker report check","Capital gains summary","More details if needed","Custom quote"]', 3, 1),
('GST / Business help', 'Monthly/custom', 'For GST returns, bookkeeping, business ITR, TDS and small business compliance.', '["Monthly support","Invoice data help","Payment tracking","WhatsApp updates"]', 4, 1),
('Loan project report', 'Custom', 'For business loan paperwork, project reports and scheme document guidance.', '["Document checklist","Business details review","Report preparation","Clear next steps"]', 5, 1);

INSERT INTO integration_settings (setting_key, setting_value, setting_group, is_secret) VALUES
('razorpay_key_id', '', 'razorpay', 0),
('razorpay_key_secret', '', 'razorpay', 1),
('manual_upi_id', 'payments@exampleupi', 'payments', 0),
('smtp_host', 'smtp.hostinger.com', 'smtp', 0),
('smtp_username', '', 'smtp', 0),
('smtp_password', '', 'smtp', 1),
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

INSERT INTO email_templates (template_key, subject, body, active) VALUES
('lead_followup_1', 'We received your request', 'Hello {name}, we received your request. You can upload documents or reply on WhatsApp for help.', 1),
('documents_pending', 'Documents pending', 'Hello {name}, please upload pending documents for Request ID {request_id}.', 1),
('payment_pending', 'Payment pending', 'Hello {name}, please complete payment for Request ID {request_id} after fee confirmation.', 1)
ON DUPLICATE KEY UPDATE subject=VALUES(subject);
