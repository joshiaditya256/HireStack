-- HireStack MySQL schema.
--
-- `jobConnect` is the ONE authoritative schema for this project. It was originally
-- created out-of-band via a one-time Prisma Migrate run (see BUILD_GUIDE.md history);
-- this file has since been regenerated from that live schema (`mysqldump --no-data`)
-- so a fresh `docker compose up -d` on an empty volume produces an identical, working
-- schema without the Prisma detour. There is no second schema anymore -- the previously
-- auto-created, unused `hirestack` database has been dropped; MYSQL_DATABASE in
-- docker-compose.yml now points at `jobConnect` directly, so this script also creates the
-- database itself and grants the `aditya` app user access to it on first container boot.

CREATE DATABASE IF NOT EXISTS jobConnect;
USE jobConnect; 

CREATE TABLE users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  hash_password VARCHAR(255) NOT NULL,
  name VARCHAR(255) DEFAULT NULL,
  role VARCHAR(255) NOT NULL,
  company_id BIGINT DEFAULT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  otp VARCHAR(10) DEFAULT NULL,
  otp_expires_at DATETIME(3) DEFAULT NULL,
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  otp_attempts INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_key (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE companies (
  company_id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website VARCHAR(255) DEFAULT NULL,
  logo_url VARCHAR(500) DEFAULT NULL,
  industry VARCHAR(100) DEFAULT NULL,
  size VARCHAR(50) DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE profiles (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  headline VARCHAR(255) DEFAULT NULL,
  bio TEXT,
  skills TEXT,
  experience TEXT,
  education TEXT,
  location VARCHAR(255) DEFAULT NULL,
  avatar_url VARCHAR(255) DEFAULT NULL,
  banner_url VARCHAR(255) DEFAULT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY profiles_user_id_key (user_id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE jobs (
  job_id BIGINT NOT NULL AUTO_INCREMENT,
  recruiter_id BIGINT NOT NULL,
  company_id BIGINT NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  responsibilities TEXT,
  employment_type VARCHAR(50) NOT NULL,
  experience_level VARCHAR(50) NOT NULL,
  salary_min DECIMAL(10,2) DEFAULT NULL,
  salary_max DECIMAL(10,2) DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  is_remote TINYINT(1) NOT NULL DEFAULT 0,
  skills_required JSON DEFAULT NULL,
  status ENUM('ACTIVE','CLOSED','DRAFT') DEFAULT NULL,
  expires_at DATETIME(3) DEFAULT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (job_id),
  KEY jobs_recruiter_id_idx (recruiter_id),
  KEY jobs_company_id_idx (company_id),
  KEY jobs_status_idx (status),
  CONSTRAINT jobs_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies (company_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT jobs_recruiter_id_fkey FOREIGN KEY (recruiter_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE applications (
  application_id BIGINT NOT NULL AUTO_INCREMENT,
  job_id BIGINT NOT NULL,
  candidate_id BIGINT NOT NULL,
  resume_url VARCHAR(500) DEFAULT NULL,
  cover_letter TEXT,
  status ENUM('ACCEPTED','PENDING','REJECTED','REVIEWED','SHORTLISTED') NOT NULL,
  applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (application_id),
  UNIQUE KEY applications_job_id_candidate_id_key (job_id, candidate_id),
  KEY applications_status_idx (status),
  KEY applications_candidate_id_fkey (candidate_id),
  CONSTRAINT applications_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES jobs (job_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE posts (
  post_id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (post_id),
  KEY posts_user_id_idx (user_id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE post_likes (
  like_id BIGINT NOT NULL AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (like_id),
  UNIQUE KEY post_likes_post_id_user_id_key (post_id, user_id),
  KEY post_likes_post_id_idx (post_id),
  KEY post_likes_user_id_fkey (user_id),
  CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE comments (
  comment_id BIGINT NOT NULL AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (comment_id),
  KEY comments_post_id_idx (post_id),
  KEY comments_user_id_idx (user_id),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Owned by profile-service (ddl-auto=update); included here for a complete fresh-install
-- schema, but profile-service will also happily create this table itself if it's missing.
CREATE TABLE feedbacks (
  feedback_id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  message TEXT NOT NULL,
  status ENUM('PENDING','SOLVED') NOT NULL,
  created_at DATETIME(6) DEFAULT NULL,
  updated_at DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (feedback_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Written by every service via api-gateway's ActivityLoggingFilter, read by
-- services/logger-service (.NET). See services/logger-service/README.md.
CREATE TABLE logs (
  log_id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT DEFAULT NULL,
  service VARCHAR(100) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INT NOT NULL,
  duration_ms INT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  KEY idx_service (service),
  KEY idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MYSQL_DATABASE in docker-compose.yml already grants the MYSQL_USER full access to that
-- one database on first boot -- this GRANT is a defensive no-op that keeps working even if
-- someone runs this script by hand or changes MYSQL_DATABASE later.
GRANT ALL PRIVILEGES ON jobConnect.* TO 'aditya'@'%';
FLUSH PRIVILEGES;
