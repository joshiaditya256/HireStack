CREATE DATABASE IF NOT EXISTS hirestack;
USE hirestack;

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  hash_password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role ENUM('ADMIN','RECRUITER','CANDIDATE') NOT NULL DEFAULT 'CANDIDATE',
  company_id BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  otp VARCHAR(10),
  otp_expires_at DATETIME,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  otp_attempts INT NOT NULL DEFAULT 0,
  INDEX idx_company_id (company_id)
);

CREATE TABLE companies (
  company_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website VARCHAR(255),
  logo_url VARCHAR(255),
  industry VARCHAR(255),
  size VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  headline VARCHAR(255),
  bio TEXT,
  skills TEXT,
  experience TEXT,
  education TEXT,
  location VARCHAR(255),
  avatar_url VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE jobs (
  job_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  recruiter_id BIGINT NOT NULL,
  company_id BIGINT NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  responsibilities TEXT,
  employment_type VARCHAR(255) NOT NULL,
  experience_level VARCHAR(255) NOT NULL,
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  location VARCHAR(255),
  is_remote BOOLEAN NOT NULL DEFAULT FALSE,
  skills_required JSON,
  status ENUM('ACTIVE','CLOSED','DRAFT') NOT NULL DEFAULT 'ACTIVE',
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_recruiter_id (recruiter_id),
  INDEX idx_company_id (company_id),
  INDEX idx_status (status),
  FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

CREATE TABLE applications (
  application_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT NOT NULL,
  candidate_id BIGINT NOT NULL,
  resume_url VARCHAR(255),
  cover_letter TEXT,
  status ENUM('PENDING','REVIEWED','SHORTLISTED','REJECTED','ACCEPTED') NOT NULL DEFAULT 'PENDING',
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_job_candidate (job_id, candidate_id),
  INDEX idx_status (status),
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE posts (
  post_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE post_likes (
  like_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_post_user (post_id, user_id),
  INDEX idx_post_id (post_id),
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments (
  comment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE feedbacks (
  feedback_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  message TEXT NOT NULL,
  status ENUM('PENDING','SOLVED') NOT NULL DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE logs (
  log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  service VARCHAR(100) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INT NOT NULL,
  duration_ms INT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_service (service),
  INDEX idx_timestamp (timestamp)
);