-- VB Consultants backend/admin/CMS upgrade migration.
-- Import this on an existing Hostinger database after taking a backup.
-- It is additive: no customer, document, payment or request data is deleted.

DELIMITER $$
DROP PROCEDURE IF EXISTS vbc_add_column $$
CREATE PROCEDURE vbc_add_column(IN p_table VARCHAR(64), IN p_column VARCHAR(64), IN p_definition TEXT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = p_column
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END $$
DELIMITER ;

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

CALL vbc_add_column('users', 'active', 'TINYINT(1) DEFAULT 1');
CALL vbc_add_column('users', 'internal_note', 'TEXT NULL');
CALL vbc_add_column('quick_leads', 'admin_note', 'TEXT NULL');
CALL vbc_add_column('quick_leads', 'assigned_admin_id', 'INT NULL');
CALL vbc_add_column('service_requests', 'assigned_admin_id', 'INT NULL');
CALL vbc_add_column('documents', 'document_label', 'VARCHAR(180) NULL');
CALL vbc_add_column('documents', 'status', 'VARCHAR(80) DEFAULT ''Received''');
CALL vbc_add_column('documents', 'admin_note', 'TEXT NULL');
CALL vbc_add_column('documents', 'uploaded_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
CALL vbc_add_column('payments', 'admin_note', 'TEXT NULL');
CALL vbc_add_column('email_logs', 'event_type', 'VARCHAR(120) DEFAULT ''general''');
CALL vbc_add_column('email_logs', 'provider', 'VARCHAR(80) DEFAULT ''smtp''');
CALL vbc_add_column('email_logs', 'related_user_id', 'INT NULL');
CALL vbc_add_column('email_logs', 'related_request_id', 'INT NULL');
CALL vbc_add_column('admin_users', 'role', 'VARCHAR(60) DEFAULT ''admin''');
CALL vbc_add_column('admin_users', 'active', 'TINYINT(1) DEFAULT 1');
CALL vbc_add_column('admin_users', 'force_password_change', 'TINYINT(1) DEFAULT 0');
CALL vbc_add_column('admin_users', 'last_login_at', 'TIMESTAMP NULL');
CALL vbc_add_column('admin_users', 'last_seen_at', 'TIMESTAMP NULL');
CALL vbc_add_column('admin_users', 'login_count', 'INT DEFAULT 0');
CALL vbc_add_column('admin_users', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL vbc_add_column('service_page_content', 'category', 'VARCHAR(120) NULL');
CALL vbc_add_column('service_page_content', 'short_description', 'TEXT NULL');
CALL vbc_add_column('service_page_content', 'icon', 'VARCHAR(180) NULL');
CALL vbc_add_column('service_page_content', 'og_image', 'VARCHAR(500) NULL');
CALL vbc_add_column('service_page_content', 'sort_order', 'INT DEFAULT 0');
CALL vbc_add_column('service_page_content', 'show_in_menu', 'TINYINT(1) DEFAULT 1');
CALL vbc_add_column('service_page_content', 'show_on_homepage', 'TINYINT(1) DEFAULT 0');
CALL vbc_add_column('pricing_items', 'starting_price', 'DECIMAL(10,2) NULL');
CALL vbc_add_column('pricing_items', 'billing_type', 'VARCHAR(60) NULL');
CALL vbc_add_column('pricing_items', 'show_on_homepage', 'TINYINT(1) DEFAULT 1');
CALL vbc_add_column('pricing_items', 'cta_link', 'VARCHAR(255) NULL');
CALL vbc_add_column('media_library', 'title', 'VARCHAR(255) NULL');
CALL vbc_add_column('media_library', 'caption', 'TEXT NULL');
CALL vbc_add_column('blog_posts_cms', 'category', 'VARCHAR(120) NULL');
CALL vbc_add_column('blog_posts_cms', 'tags', 'VARCHAR(500) NULL');
CALL vbc_add_column('blog_posts_cms', 'author_name', 'VARCHAR(160) DEFAULT ''VB Consultants''');
CALL vbc_add_column('blog_posts_cms', 'published_at', 'DATETIME NULL');
CALL vbc_add_column('local_seo_pages', 'state', 'VARCHAR(120) DEFAULT ''Odisha''');
CALL vbc_add_column('local_seo_pages', 'hero_title', 'VARCHAR(255) NULL');
CALL vbc_add_column('local_seo_pages', 'related_services_json', 'MEDIUMTEXT NULL');
CALL vbc_add_column('local_seo_pages', 'faqs_json', 'MEDIUMTEXT NULL');

CREATE TABLE IF NOT EXISTS admin_permissions (
  permission_key VARCHAR(120) PRIMARY KEY,
  label VARCHAR(180) NOT NULL,
  description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_role_permissions (
  role_key VARCHAR(60) NOT NULL,
  permission_key VARCHAR(120) NOT NULL,
  PRIMARY KEY (role_key, permission_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_user_permissions (
  admin_id INT NOT NULL,
  permission_key VARCHAR(120) NOT NULL,
  PRIMARY KEY (admin_id, permission_key)
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
  PRIMARY KEY (post_id, tag_id)
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
  sent_at TIMESTAMP NULL
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

UPDATE admin_users
SET role='super_admin', active=1
WHERE id=(SELECT id FROM (SELECT id FROM admin_users ORDER BY id ASC LIMIT 1) first_admin)
  AND NOT EXISTS (SELECT 1 FROM (SELECT id FROM admin_users WHERE role='super_admin' LIMIT 1) existing_super);

INSERT INTO site_settings (setting_key, setting_value, setting_type, group_name) VALUES
('business_name', 'VB Consultants', 'text', 'site'),
('registered_business_name', 'Veedanath Business Consultants', 'text', 'site'),
('tagline', 'Tax, Compliance & Business Support', 'text', 'site'),
('logo_mark', '/images/vbc/logo-mark.png', 'text', 'site'),
('logo_horizontal', '/images/vbc/logo-horizontal.png', 'text', 'site'),
('favicon', '/favicon.svg', 'text', 'site'),
('apple_touch_icon', '/apple-touch-icon.png', 'text', 'site'),
('default_og_image', '/images/vbc/og-default-vb-consultants.png', 'text', 'site'),
('phone', '+91 73278 54329', 'text', 'site'),
('whatsapp_number', '919000000000', 'text', 'site'),
('support_email', 'consult@vbcbharat.com', 'text', 'site'),
('address', '', 'text', 'site'),
('business_hours', 'Monday to Saturday, 10:00 AM to 6:00 PM', 'text', 'site'),
('default_seo_title', 'VB Consultants | Online Tax, GST and Business Paperwork Help', 'text', 'seo'),
('default_seo_description', 'VB Consultants offers simple online ITR filing, GST, tax notice, loan project report and business compliance support for Indian individuals and small businesses.', 'text', 'seo')
ON DUPLICATE KEY UPDATE group_name=VALUES(group_name);

INSERT INTO integration_settings (setting_key, setting_value, setting_group, is_secret) VALUES
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
('mail_debug', 'false', 'smtp', 0)
ON DUPLICATE KEY UPDATE setting_group=VALUES(setting_group), is_secret=VALUES(is_secret);

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
('itr-2-capital-gains-filing','broker_report','Broker report','Share, mutual fund or securities report.',0,1,2,1),
('itr-2-capital-gains-filing','ais_26as','AIS / Form 26AS','Official tax statement if available.',0,1,3,1),
('itr-2-capital-gains-filing','bank_details','Bank details','Bank proof or statement if relevant.',0,1,4,1),
('itr-2-capital-gains-filing','previous_itr','Previous year ITR','Previous ITR acknowledgement if available.',0,1,5,1),
('itr-2-capital-gains-filing','other_documents','Other documents','Upload any other related document.',0,1,99,1),
('freelancer-business-itr','income_details','Income details','Invoices, receipts, payment summary or income sheet.',1,1,1,1),
('freelancer-business-itr','expense_records','Expense records','Bills, expense sheet or business purchase records.',0,1,2,1),
('freelancer-business-itr','bank_statement','Bank statement','Bank statement for business or professional receipts.',0,1,3,1),
('freelancer-business-itr','gst_returns','GST returns','GST return records if applicable.',0,1,4,1),
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
ON DUPLICATE KEY UPDATE subject=VALUES(subject), body=VALUES(body), active=VALUES(active);

DROP PROCEDURE IF EXISTS vbc_add_column;
