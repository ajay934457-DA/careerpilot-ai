# 🚀 CareerPilot AI

### AI-Powered Resume Screening & Intelligent Job Matching System

[![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask-black?logo=flask)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![REST API](https://img.shields.io/badge/API-REST-green)]()
[![JWT](https://img.shields.io/badge/Auth-JWT-purple)]()
[![GitHub](https://img.shields.io/badge/Source-GitHub-black?logo=github)](https://github.com/)

---

## 📌 Overview

**CareerPilot AI** is an AI-powered resume screening and intelligent job matching platform designed to help candidates understand their resume quality, discover suitable job opportunities, and manage applications from a single workspace.

The system analyzes uploaded resumes, extracts relevant skills and keywords, calculates a resume score, compares candidate profiles with available jobs, and generates job-match scores based on skills and textual relevance.

The platform is designed with a scalable architecture that can be extended with resume authenticity verification, technical project verification, recruiter screening, and HR verification workflows.

---

## 🎯 Problem Statement

Traditional job searching requires candidates to:

- Manually review multiple job descriptions
- Compare their skills with job requirements
- Identify resume weaknesses
- Track applications separately
- Determine whether their resume is suitable for a specific role

Recruiters also need to manually screen large numbers of resumes.

**CareerPilot AI** aims to reduce this effort by providing automated resume analysis and intelligent job matching.

---

# ✨ Features

## 👤 Candidate Features

### 🔐 Authentication
- User registration
- Secure login
- JWT-based authentication
- Protected API endpoints

### 📄 Resume Management
- Upload resume
- PDF resume text extraction
- Store resume history
- Retrieve latest resume

### 🤖 Resume Analysis
- Resume text analysis
- Resume scoring
- Skills detection
- Strength identification
- Skill-gap identification
- ATS compatibility evaluation
- Resume structure evaluation
- Education evaluation
- Experience quality evaluation
- Achievement quality evaluation

### 🎯 Intelligent Job Matching

The system compares the candidate resume with available jobs using:

- Required skill matching
- Resume keyword analysis
- Job-role relevance
- Text similarity
- Combined match scoring

Each job receives a **Match Score (%)**.

### 💼 Job Applications

Candidates can:

- View recommended jobs
- Apply for suitable jobs
- Track applications
- View application status
- View matched skills
- View missing skills

### ⚡ Smart Auto-Apply

Auto-Apply settings allow candidates to configure:

- Enable / disable Auto-Apply
- Minimum match score
- Daily application limit
- Target roles
- Blocked companies
- Application queue

---

# 🧠 AI / Matching Architecture

CareerPilot AI currently uses a lightweight Python-based matching engine that combines multiple signals.

```text
                    ┌─────────────────────┐
                    │   Candidate Resume  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Resume Parser     │
                    │      PDF Text       │
                    │     Extraction      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Resume Analysis     │
                    │                     │
                    │ • Skills            │
                    │ • Keywords          │
                    │ • Structure         │
                    │ • Education         │
                    │ • Experience        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Matching Engine     │
                    │                     │
                    │ Skill Match  60%    │
                    │ Text Match   25%    │
                    │ Role Match   15%    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Job Match Score   │
                    │       0 - 100       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Job Recommendations │
                    │ & Applications       │
                    └─────────────────────┘

🏗️ System Architecture

┌─────────────────────────────────────────────────────────────┐
│                     CAREERPILOT AI                          │
└─────────────────────────────────────────────────────────────┘

                         USER
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                           │
│                                                             │
│  Dashboard │ Resume Analysis │ Job Matches │ Applications  │
│  Auto-Apply │ Authentication                                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ REST API + JWT
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Flask Backend                            │
│                                                             │
│  Auth Routes                                                │
│  Resume Routes                                              │
│  Job Routes                                                 │
│  Application Routes                                         │
│  Auto-Apply Routes                                          │
└───────────────┬───────────────────────┬─────────────────────┘
                │                       │
                ▼                       ▼
┌───────────────────────┐     ┌──────────────────────────────┐
│ Resume Processing     │     │ Intelligent Matching Engine  │
│                       │     │                              │
│ PDF Text Extraction   │     │ Skill Matching               │
│ Resume Analysis       │     │ Keyword Matching             │
│ Skill Detection       │     │ Text Similarity              │
└───────────┬───────────┘     │ Role Relevance               │
            │                 └──────────────┬───────────────┘
            │                                │
            └────────────────┬───────────────┘
                             ▼
                  ┌────────────────────────┐
                  │       SQLite DB        │
                  │                        │
                  │ Users                  │
                  │ Resumes                │
                  │ Resume Scores          │
                  │ Jobs                   │
                  │ Applications           │
                  │ Auto-Apply Settings    │
                  └────────────────────────┘
