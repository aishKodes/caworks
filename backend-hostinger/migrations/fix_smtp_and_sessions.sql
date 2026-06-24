-- VB Consultants: SMTP source consistency and persistent customer sessions.
-- Safe for an existing installation: real non-empty settings are preserved.

CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  last_used_at DATETIME NULL,
  last_seen_at DATETIME NULL,
  user_agent VARCHAR(255) NULL,
  user_agent_hash CHAR(64) NULL,
  ip_hash CHAR(64) NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_sessions_user (user_id, expires_at, revoked_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

CALL vbc_add_column_if_missing('users', 'last_login_at', 'DATETIME NULL AFTER `internal_note`');
CALL vbc_add_column_if_missing('user_sessions', 'last_seen_at', 'DATETIME NULL AFTER `last_used_at`');
CALL vbc_add_column_if_missing('user_sessions', 'user_agent_hash', 'CHAR(64) NULL AFTER `user_agent`');

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_logs_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS api_errors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id VARCHAR(40) NOT NULL,
  method VARCHAR(12) NULL,
  path VARCHAR(255) NULL,
  http_status SMALLINT NULL,
  message TEXT NULL,
  trace MEDIUMTEXT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_api_errors_request (request_id),
  INDEX idx_api_errors_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CALL vbc_add_column_if_missing('api_errors', 'http_status', 'SMALLINT NULL AFTER `path`');
DROP PROCEDURE IF EXISTS vbc_add_column_if_missing;

INSERT INTO site_settings (setting_key, setting_value, setting_type, group_name) VALUES
('support_email', 'consult@api.vbcbharat.com', 'text', 'site'),
('public_email', 'consult@api.vbcbharat.com', 'text', 'site')
ON DUPLICATE KEY UPDATE setting_value = IF(
  setting_value IS NULL OR TRIM(setting_value) = '' OR setting_value = 'consult@vbcbharat.com',
  VALUES(setting_value),
  setting_value
);

INSERT INTO integration_settings (setting_key, setting_value, setting_group, is_secret) VALUES
('smtp_enabled', 'true', 'smtp', 0),
('smtp_host', 'smtp.hostinger.com', 'smtp', 0),
('smtp_port', '465', 'smtp', 0),
('smtp_encryption', 'ssl', 'smtp', 0),
('smtp_username', 'consult@api.vbcbharat.com', 'smtp', 0),
('smtp_from_email', 'consult@api.vbcbharat.com', 'smtp', 0),
('smtp_from_name', 'VB Consultants', 'smtp', 0),
('smtp_reply_to', 'consult@api.vbcbharat.com', 'smtp', 0),
('admin_email', 'consult@api.vbcbharat.com', 'smtp', 0),
('public_email', 'consult@api.vbcbharat.com', 'smtp', 0),
('mail_debug', 'false', 'smtp', 0)
ON DUPLICATE KEY UPDATE
  setting_group = VALUES(setting_group),
  setting_value = IF(
    setting_value IS NULL OR TRIM(setting_value) = '' OR setting_value = 'consult@vbcbharat.com',
    VALUES(setting_value),
    setting_value
  );

INSERT INTO app_settings (setting_key, setting_value, setting_group, is_secret) VALUES
('session_cookie_name', 'vbc_session', 'auth', 0),
('session_cookie_domain', '.vbcbharat.com', 'auth', 0),
('session_days', '30', 'auth', 0),
('session_samesite', 'Lax', 'auth', 0),
('session_secure', 'true', 'auth', 0)
ON DUPLICATE KEY UPDATE setting_group = VALUES(setting_group);
