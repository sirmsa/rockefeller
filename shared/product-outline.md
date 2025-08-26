# 🚀 Multi-User Trading Bot with Next.js Dashboard

This project provides a **multi-user trading bot** with a **Next.js dashboard** for monitoring and control.  
API keys are stored securely on the backend, and users authenticate to access their accounts.  
Designed for a **small group of trusted users**.

---

## 🔹 Architecture Overview

+---------------------+
|  Next.js Dashboard  |
|      (Frontend)     |
+----------+----------+
           |
           | HTTPS / Auth API
           v
+----------+----------+
| Node.js Backend +   |
|      Bot Logic      |
+----------+----------+
           |
           v
+----------+----------+
|      Database       |
| - Encrypted API     |
| - Trade logs        |
| - Bot state         |
| - User credentials  |
+----------+----------+
           |
           v
+----------+----------+
|   Exchange API       |
|   (Binance, etc.)    |
+---------------------+

---

## 🔹 Components

- **Next.js Dashboard**:  
  - User authentication (login/register)  
  - API key management  
  - Monitoring balances, trades, bot state  
  - Triggering bot actions or changing strategy parameters  

- **Node.js Backend + Bot**:  
  - Long-running process executing trades  
  - Uses stored API keys (decrypted at runtime)  
  - Updates DB with trades, positions, and logs  
  - Handles user-specific sessions  

- **Database**:  
  - Stores **encrypted API keys**  
  - Maintains trade history and bot state  
  - Stores user credentials (hashed)  
  - SQLite for small deployments or Postgres for more scalable setup  

---

## 🔹 API Key Security

- **Encryption at rest** using a master key stored in environment variables or Docker secrets  
- **Trade-only keys recommended** (disable withdrawals)  
- Keys **never exposed to frontend**  
- Backend decrypts keys at runtime only for the bot process  

---

## 🔹 User Authentication

- Full login system with **hashed passwords** (bcrypt or similar)  
- Optional **2FA** for additional security  
- Each user can only access their own API keys and trade data  

---

## 🔹 Technology Stack

- **Frontend:** Next.js (React)  
- **Backend / Bot:** Node.js  
- **Database:** SQLite (small deployment) or Postgres (multi-user/scalable)  
- **Exchange API:** Binance Node.js SDK  
- **Optional AI Integration:** OpenAI Node.js SDK  
- **Deployment:** Docker + docker-compose (frontend, backend, DB)  

---

## 🔹 Deployment Overview

1. **Dockerized Services:**
   - `dashboard` → Next.js frontend
   - `bot` → Node.js trading agent
   - `db` → database for state, logs, and encrypted keys

2. **Security Measures:**
   - HTTPS via reverse proxy (nginx/Traefik)  
   - Environment variables or Docker secrets for master encryption key  
   - Restricted API key permissions  

3. **Startup:**
```bash
docker-compose build
docker-compose up -d
```
