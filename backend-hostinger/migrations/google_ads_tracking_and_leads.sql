-- VB Consultants / VBC Bharat: Google Ads attribution, lead events and GBP settings.
-- Safe for existing installs. Does not delete or overwrite real lead data.

DROP PROCEDURE IF EXISTS vbc_add_column_if_missing;
DELIMITER //
CREATE PROCEDURE vbc_add_column_if_missing(
  IN table_name_value VARCHAR(64),
  IN column_name_value VARCHAR(64),
  IN column_definition_value TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = table_name_value
      AND COLUMN_NAME = column_name_value
  ) THEN
    SET @alter_sql = CONCAT(
      'ALTER TABLE `', REPLACE(table_name_value, '`', '``'),
      '` ADD COLUMN `', REPLACE(column_name_value, '`', '``'),
      '` ', column_definition_value
    );
    PREPARE alter_statement FROM @alter_sql;
    EXECUTE alter_statement;
    DEALLOCATE PREPARE alter_statement;
  END IF;
END //
DELIMITER ;

CALL vbc_add_column_if_missing('quick_leads', 'utm_medium', 'VARCHAR(160) NULL AFTER `utm_source`');
CALL vbc_add_column_if_missing('quick_leads', 'utm_term', 'VARCHAR(160) NULL AFTER `utm_campaign`');
CALL vbc_add_column_if_missing('quick_leads', 'utm_content', 'VARCHAR(160) NULL AFTER `utm_term`');
CALL vbc_add_column_if_missing('quick_leads', 'gclid', 'VARCHAR(180) NULL AFTER `utm_content`');
CALL vbc_add_column_if_missing('quick_leads', 'gbraid', 'VARCHAR(180) NULL AFTER `gclid`');
CALL vbc_add_column_if_missing('quick_leads', 'wbraid', 'VARCHAR(180) NULL AFTER `gbraid`');
CALL vbc_add_column_if_missing('quick_leads', 'msclkid', 'VARCHAR(180) NULL AFTER `wbraid`');
CALL vbc_add_column_if_missing('quick_leads', 'landing_page', 'VARCHAR(500) NULL AFTER `msclkid`');
CALL vbc_add_column_if_missing('quick_leads', 'referrer', 'VARCHAR(500) NULL AFTER `landing_page`');
CALL vbc_add_column_if_missing('quick_leads', 'lead_source', 'VARCHAR(80) NULL AFTER `referrer`');
CALL vbc_add_column_if_missing('quick_leads', 'user_agent_hash', 'CHAR(64) NULL AFTER `lead_source`');
CALL vbc_add_column_if_missing('quick_leads', 'ip_hash', 'CHAR(64) NULL AFTER `user_agent_hash`');

CALL vbc_add_column_if_missing('service_requests', 'claim_type', 'VARCHAR(120) NULL AFTER `city`');
CALL vbc_add_column_if_missing('service_requests', 'utm_source', 'VARCHAR(160) NULL AFTER `details`');
CALL vbc_add_column_if_missing('service_requests', 'utm_medium', 'VARCHAR(160) NULL AFTER `utm_source`');
CALL vbc_add_column_if_missing('service_requests', 'utm_campaign', 'VARCHAR(160) NULL AFTER `utm_medium`');
CALL vbc_add_column_if_missing('service_requests', 'utm_term', 'VARCHAR(160) NULL AFTER `utm_campaign`');
CALL vbc_add_column_if_missing('service_requests', 'utm_content', 'VARCHAR(160) NULL AFTER `utm_term`');
CALL vbc_add_column_if_missing('service_requests', 'gclid', 'VARCHAR(180) NULL AFTER `utm_content`');
CALL vbc_add_column_if_missing('service_requests', 'gbraid', 'VARCHAR(180) NULL AFTER `gclid`');
CALL vbc_add_column_if_missing('service_requests', 'wbraid', 'VARCHAR(180) NULL AFTER `gbraid`');
CALL vbc_add_column_if_missing('service_requests', 'msclkid', 'VARCHAR(180) NULL AFTER `wbraid`');
CALL vbc_add_column_if_missing('service_requests', 'landing_page', 'VARCHAR(500) NULL AFTER `msclkid`');
CALL vbc_add_column_if_missing('service_requests', 'referrer', 'VARCHAR(500) NULL AFTER `landing_page`');
CALL vbc_add_column_if_missing('service_requests', 'lead_source', 'VARCHAR(80) NULL AFTER `referrer`');
CALL vbc_add_column_if_missing('service_requests', 'user_agent_hash', 'CHAR(64) NULL AFTER `lead_source`');
CALL vbc_add_column_if_missing('service_requests', 'ip_hash', 'CHAR(64) NULL AFTER `user_agent_hash`');

CALL vbc_add_column_if_missing('uploaded_documents', 'utm_source', 'VARCHAR(160) NULL AFTER `status`');
CALL vbc_add_column_if_missing('uploaded_documents', 'utm_medium', 'VARCHAR(160) NULL AFTER `utm_source`');
CALL vbc_add_column_if_missing('uploaded_documents', 'utm_campaign', 'VARCHAR(160) NULL AFTER `utm_medium`');
CALL vbc_add_column_if_missing('uploaded_documents', 'utm_term', 'VARCHAR(160) NULL AFTER `utm_campaign`');
CALL vbc_add_column_if_missing('uploaded_documents', 'utm_content', 'VARCHAR(160) NULL AFTER `utm_term`');
CALL vbc_add_column_if_missing('uploaded_documents', 'gclid', 'VARCHAR(180) NULL AFTER `utm_content`');
CALL vbc_add_column_if_missing('uploaded_documents', 'gbraid', 'VARCHAR(180) NULL AFTER `gclid`');
CALL vbc_add_column_if_missing('uploaded_documents', 'wbraid', 'VARCHAR(180) NULL AFTER `gbraid`');
CALL vbc_add_column_if_missing('uploaded_documents', 'msclkid', 'VARCHAR(180) NULL AFTER `wbraid`');
CALL vbc_add_column_if_missing('uploaded_documents', 'landing_page', 'VARCHAR(500) NULL AFTER `msclkid`');
CALL vbc_add_column_if_missing('uploaded_documents', 'referrer', 'VARCHAR(500) NULL AFTER `landing_page`');
CALL vbc_add_column_if_missing('uploaded_documents', 'lead_source', 'VARCHAR(80) NULL AFTER `referrer`');
CALL vbc_add_column_if_missing('uploaded_documents', 'user_agent_hash', 'CHAR(64) NULL AFTER `lead_source`');
CALL vbc_add_column_if_missing('uploaded_documents', 'ip_hash', 'CHAR(64) NULL AFTER `user_agent_hash`');

CALL vbc_add_column_if_missing('documents', 'utm_source', 'VARCHAR(160) NULL AFTER `status`');
CALL vbc_add_column_if_missing('documents', 'utm_medium', 'VARCHAR(160) NULL AFTER `utm_source`');
CALL vbc_add_column_if_missing('documents', 'utm_campaign', 'VARCHAR(160) NULL AFTER `utm_medium`');
CALL vbc_add_column_if_missing('documents', 'utm_term', 'VARCHAR(160) NULL AFTER `utm_campaign`');
CALL vbc_add_column_if_missing('documents', 'utm_content', 'VARCHAR(160) NULL AFTER `utm_term`');
CALL vbc_add_column_if_missing('documents', 'gclid', 'VARCHAR(180) NULL AFTER `utm_content`');
CALL vbc_add_column_if_missing('documents', 'gbraid', 'VARCHAR(180) NULL AFTER `gclid`');
CALL vbc_add_column_if_missing('documents', 'wbraid', 'VARCHAR(180) NULL AFTER `gbraid`');
CALL vbc_add_column_if_missing('documents', 'msclkid', 'VARCHAR(180) NULL AFTER `wbraid`');
CALL vbc_add_column_if_missing('documents', 'landing_page', 'VARCHAR(500) NULL AFTER `msclkid`');
CALL vbc_add_column_if_missing('documents', 'referrer', 'VARCHAR(500) NULL AFTER `landing_page`');
CALL vbc_add_column_if_missing('documents', 'lead_source', 'VARCHAR(80) NULL AFTER `referrer`');
CALL vbc_add_column_if_missing('documents', 'user_agent_hash', 'CHAR(64) NULL AFTER `lead_source`');
CALL vbc_add_column_if_missing('documents', 'ip_hash', 'CHAR(64) NULL AFTER `user_agent_hash`');

CREATE TABLE IF NOT EXISTS lead_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(120) NOT NULL,
  service VARCHAR(160) NULL,
  request_code VARCHAR(40) NULL,
  request_id INT NULL,
  user_id INT NULL,
  quick_lead_id INT NULL,
  event_label VARCHAR(180) NULL,
  link_url VARCHAR(500) NULL,
  page_path VARCHAR(500) NULL,
  utm_source VARCHAR(160) NULL,
  utm_medium VARCHAR(160) NULL,
  utm_campaign VARCHAR(160) NULL,
  utm_term VARCHAR(160) NULL,
  utm_content VARCHAR(160) NULL,
  gclid VARCHAR(180) NULL,
  gbraid VARCHAR(180) NULL,
  wbraid VARCHAR(180) NULL,
  msclkid VARCHAR(180) NULL,
  landing_page VARCHAR(500) NULL,
  referrer VARCHAR(500) NULL,
  lead_source VARCHAR(80) NULL,
  user_agent_hash CHAR(64) NULL,
  ip_hash CHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lead_events_request (request_id, request_code),
  INDEX idx_lead_events_source (lead_source, created_at),
  INDEX idx_lead_events_event (event_type, created_at),
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (quick_lead_id) REFERENCES quick_leads(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO site_settings (setting_key, setting_value, setting_type, group_name) VALUES
('google_business_profile_url', '', 'text', 'site'),
('google_maps_url', '', 'text', 'site'),
('google_review_url', '', 'text', 'site')
ON DUPLICATE KEY UPDATE group_name=VALUES(group_name);

INSERT INTO integration_settings (setting_key, setting_value, setting_group, is_secret) VALUES
('google_tag_manager_id', '', 'analytics', 0),
('google_analytics_id', '', 'analytics', 0),
('google_ads_conversion_id', '', 'analytics', 0),
('google_ads_insurance_lead_label', '', 'analytics', 0),
('google_ads_form_submit_label', '', 'analytics', 0),
('google_ads_whatsapp_click_label', '', 'analytics', 0),
('google_ads_phone_click_label', '', 'analytics', 0),
('google_ads_document_upload_label', '', 'analytics', 0),
('google_business_profile_url', '', 'google', 0),
('google_maps_url', '', 'google', 0),
('google_review_url', '', 'google', 0)
ON DUPLICATE KEY UPDATE setting_group=VALUES(setting_group);

DROP PROCEDURE IF EXISTS vbc_add_column_if_missing;
