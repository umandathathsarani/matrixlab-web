# 🧮 MatrixLab — Cloud Computations

> **SE3090 — Software Engineering Frameworks**  
> **Lab Practical 11:** DevOps and Cloud Hosting Platforms  
> **Continuous Deployment Pipeline with Netlify & Render**

---

## 📌 Project Overview
**MatrixLab** is an interactive linear algebra computation engine built for real-time mathematical operations (Determinant, Transpose, Inversion, Trace, Squaring, and Characteristic Eigenvalues). 

This project demonstrates the **Build → Test → Deploy → Monitor** DevOps lifecycle, separating presentation (Static CDN Host) from configuration via platform-level environment variables (`VITE_API_URL`).

---

## ☁️ Architecture & Cloud Infrastructure

```text
  [ User Browser ]
         │
         ▼  (HTTPS / Edge CDN)
┌──────────────────────────────────────────────┐
│  Frontend Tier: Netlify                      │
│  - React 19 + Vite SPA                       │
│  - Config: VITE_API_URL                      │
└──────────────────────┬───────────────────────┘
                       │ REST API (JSON)
                       ▼
┌──────────────────────────────────────────────┐
│  Backend Tier: Render Web Service            │
│  - Containerized REST API                    │
│  - Config: ConnectionStrings__Default, JWT   │
└──────────────────────┬───────────────────────┘
                       │ Managed TLS (SSL Mode=Require)
                       ▼
┌──────────────────────────────────────────────┐
│  Database Tier: Neon Cloud PostgreSQL        │
│  - Serverless PostgreSQL Instance            │
└──────────────────────────────────────────────┘
```

---

## ⚙️ Environment Variables

In accordance with Twelve-Factor App principles and Lecture 11 guidelines (*"never put secrets in code"*), configuration varies across environments via platform environment variables:

| Tier | Variable Name | Purpose | Example Value |
| :--- | :--- | :--- | :--- |
| **Frontend** | `VITE_API_URL` | Base endpoint for backend services | `https://matrixlab-api.onrender.com` |
| **Backend** | `ConnectionStrings__Default` | Managed PostgreSQL connection string | `Host=ep-xyz.neon.tech;Database=...;SSL Mode=Require` |
| **Backend** | `Jwt__Key` | Secret token signing key | *(Platform secret)* |

---

## 🚀 Local Development & Build

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Production Build
```bash
npm run build
```
Build output is emitted to the `dist/` directory, optimized for static edge distribution.

---

## 📦 Deployment Specification (Netlify)
- **Base directory:** `/` (or repo root)
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment variables:** Configured under *Site configuration* → *Environment variables*.
