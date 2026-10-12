CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    user_id VARCHAR(32) NOT NULL,
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(32) NOT NULL,

    last_update_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_update_by VARCHAR(32) NOT NULL,

    effective_start_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_end_date DATETIME NULL,

    password_changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    must_change_password TINYINT(1) NOT NULL DEFAULT 0,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_user_id (user_id),
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_phone (phone_number),

    KEY idx_users_effective_dates (
        user_id,
        effective_start_date,
        effective_end_date
    )
) ENGINE=InnoDB;

CREATE TABLE user_id_sequence (
    sequence_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sequence_id)
) ENGINE=InnoDB;

SELECT
    user_id,
    email,
    last_update_date,
    CASE
        WHEN UTC_TIMESTAMP() >=
             DATE_ADD(last_update_date, INTERVAL 1 MONTH)
        THEN 1
        ELSE 0
    END AS password_expired
FROM users;

CREATE TABLE user_password_versions (
    version_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_pk BIGINT UNSIGNED NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(32) NOT NULL,
    last_update_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_update_by VARCHAR(32) NOT NULL,

    effective_start_date DATETIME NOT NULL,
    effective_end_date DATETIME NULL,

    active_user_pk BIGINT UNSIGNED
        GENERATED ALWAYS AS (
            CASE
                WHEN effective_end_date IS NULL THEN user_pk
                ELSE NULL
            END
        ) STORED,

    PRIMARY KEY (version_id),
    UNIQUE KEY uq_one_active_password_version (active_user_pk),
    KEY idx_password_history (user_pk, effective_start_date),

    CONSTRAINT fk_password_history_user
        FOREIGN KEY (user_pk)
        REFERENCES users(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

DESCRIBE users;
DESCRIBE user_id_sequence;
DESCRIBE user_password_versions;

select * from users;

SELECT
    version_id,
    user_pk,
    created_date,
    effective_start_date,
    effective_end_date
FROM user_password_versions
WHERE user_pk = (
    SELECT id
    FROM users
    WHERE email = 'j@m.n'
)
ORDER BY version_id DESC;


SELECT
    version_id,
    user_pk,
    user_id
FROM user_password_versions
ORDER BY version_id;

UPDATE user_password_versions AS p
JOIN users AS u
    ON u.id = p.user_pk
SET p.user_id = u.user_id
WHERE p.user_id IS NULL
  AND p.version_id > 0;
  
SELECT COUNT(*) AS missing_user_ids
FROM user_password_versions
WHERE user_id IS NULL;

ALTER TABLE user_password_versions
MODIFY COLUMN user_id VARCHAR(32) NOT NULL;

-- 1. Add the new column as nullable temporarily.
-- Existing history records will be preserved.
ALTER TABLE user_password_versions
ADD COLUMN user_id VARCHAR(32) NULL AFTER user_pk;

-- 2. Populate the new column for all existing history records.
UPDATE user_password_versions AS p
JOIN users AS u
  ON u.id = p.user_pk
SET p.user_id = u.user_id;

-- 3. Check that every history record received its public user ID.
SELECT version_id, user_pk, user_id
FROM user_password_versions
WHERE user_id IS NULL;

-- 4. If the previous query returns zero rows, enforce NOT NULL.
ALTER TABLE user_password_versions
MODIFY COLUMN user_id VARCHAR(32) NOT NULL;

-- 5. Add a non-unique index for querying password history.
CREATE INDEX idx_password_versions_user_id
ON user_password_versions (user_id, effective_start_date);

DESCRIBE user_password_versions;

select * from users;

DESCRIBE user_password_versions;

SHOW INDEX FROM user_password_versions;

SELECT
    user_pk,
    user_id,
    COUNT(*) AS total_versions,
    SUM(effective_end_date IS NULL) AS active_versions
FROM user_password_versions
GROUP BY user_pk, user_id
ORDER BY user_pk;

SELECT *
FROM user_password_versions
WHERE user_id = '121020261145322'
ORDER BY version_id;