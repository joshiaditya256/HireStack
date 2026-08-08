# HireStack

> A full-stack professional job portal built using a microservices architecture with Spring Boot, Spring Cloud Gateway, React.js, MySQL, JWT authentication, RBAC, and Docker.

## 📌 Overview

HireStack is a full-stack professional job portal designed to connect job seekers and recruiters through a scalable and modular microservices-based architecture.

The platform provides authentication, user profiles, job posting and application management, and a social feed where users can create posts, like, and comment.

The backend is divided into independent services, allowing each business domain to be developed, deployed, and scaled independently.

The system is unified through a **Spring Cloud API Gateway** and secured using **Spring Security, JWT authentication, Role-Based Access Control (RBAC), and BCrypt password hashing**.

---

## ✨ Features

### 🔐 Authentication & Authorization

- User registration and login
- JWT-based authentication
- Spring Security integration
- Role-Based Access Control (RBAC)
- Secure password hashing using BCrypt
- Protected REST APIs
- Identity forwarding between microservices
- Role-based access to protected resources

### 👤 Profile Management

- Create and manage user profiles
- Update professional information
- Profile data management
- Image/profile media support through Cloudinary

### 💼 Job Management

- Create job postings
- Browse available jobs
- View job details
- Apply for jobs
- Manage job applications
- Recruiter-oriented job management
- Role-based authorization for job operations

### 📰 Social Feed

- Create posts
- View posts
- Like posts
- Comment on posts
- Manage social interactions
- User-oriented professional networking features

### 🖼️ Image Storage

- Cloudinary integration
- Cloud-based image storage
- Profile and post image management

### 📊 Activity Logging

- Dedicated ASP.NET Core logger service
- Centralized application activity logging
- Independent logger microservice
- Logging communication between backend services

### 🌐 API Gateway

- Spring Cloud Gateway
- Single entry point for backend APIs
- Request routing to individual microservices
- Centralized authentication/security handling
- Simplified client-to-service communication

### 🐳 Containerization

- Docker-based development environment
- Containerized infrastructure
- MySQL container support
- Microservice-oriented deployment architecture

---
