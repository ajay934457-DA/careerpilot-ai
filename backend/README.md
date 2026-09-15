# Contour backend

A working Flask API for the resume analyzer / job matcher / application
tracker pipeline: upload a resume, get an explainable score, get ranked job
matches, and run applications through an auto-apply decision engine.

This has been run end-to-end in development (register → upload → analyze →
match → apply → track) — it isn't just written, it's been exercised.

## What's real vs. what's a placeholder

**Real and working:**
- PDF/DOCX text extraction (`pdfplumber`, `python-docx`)
- Rule-based, explainable scoring across 6 metrics (skills relevance,
  structure, experience quality, education/certifications, ATS
  compatibility, achievement quality) — see `scoring.py` for exactly how
  each number is computed
- Skill extraction against a ~90-term taxonomy (`skills_data.py`)
- Job matching combining skill overlap with TF-IDF text similarity
  (`matching.py`, via scikit-learn)
- Auth (register/login, JWT), SQLite persistence, full CRUD for the
  application tracker
- The auto-apply **decision** engine: given your rules (min match score,
  daily limit, blocked companies), it decides `applied` / `requires_action`
  / `skipped` and logs a reason for each

**Intentionally not implemented:**
- Real job listings — `jobs` are seeded sample data (`skills_data.py`).
  Swapping in a real source means adding a provider module that populates
  the `jobs` table (e.g. a public job API) — the matching/tracking code
  doesn't care where a job came from.
- Actual submission of applications to external sites. The `applied`
  status here means "the decision engine approved it" — it does **not**
  mean a form was filled out on LinkedIn/Indeed/a company's careers page.
  Building that requires a provider-specific integration through each
  platform's own official application API, respecting that platform's
  terms of service. Generic browser automation that fills out third-party
  forms without authorization is a real ToS/legal risk, so it's out of
  scope here by design — the same principle the demo site's "Trust &
  safety" section describes.
- The NLP here is deterministic (regex + keyword taxonomy + TF-IDF), not
  an LLM. It's explainable and fast, but it will miss skills phrased in
  unusual ways and won't understand nuance the way a language model would.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate        # venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

The server starts on `http://127.0.0.1:5000` and creates `contour.db`
(SQLite) plus an `uploads/` folder on first run — no external database to
configure. Six sample jobs are seeded automatically.

For anything beyond local development, set a real `SECRET_KEY` env var
before running (the default is a dev-only placeholder).

## API reference

All endpoints below `/api/resumes`, `/api/applications`, and
`/api/settings/auto-apply` require `Authorization: Bearer <token>`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | `{email, password}` → `{token, user}` |
| POST | `/api/auth/login` | `{email, password}` → `{token, user}` |
| POST | `/api/resumes` | multipart `file` (.pdf/.docx) → `{resume_id, filename, text_preview}` |
| POST | `/api/resumes/<id>/analyze` | → score breakdown, strengths, gaps, detected skills |
| GET | `/api/resumes/<id>/matches` | → jobs ranked by match score (analyze first) |
| GET | `/api/jobs?work_mode=Remote` | → seeded job listings, optionally filtered |
| GET | `/api/settings/auto-apply` | → current auto-apply rules |
| PUT | `/api/settings/auto-apply` | `{enabled, min_match_score, daily_limit, blocked_companies, target_roles}` |
| POST | `/api/applications` | `{resume_id, job_id}` → runs the decision engine, returns the resulting status + reason |
| GET | `/api/applications` | → the full tracker list, newest first |

## Project layout

```
app.py                 Flask app factory, blueprint registration, CORS, job seeding
config.py               Env-configurable settings
database.py              SQLite schema + connection helper
auth.py                  JWT issuing/verification, @token_required decorator
resume_parser.py         PDF/DOCX → plain text
scoring.py                The explainable scoring engine
matching.py                Skill overlap + TF-IDF job matching
skills_data.py              Skills taxonomy + seeded jobs
routes/
  auth_routes.py            /api/auth/*
  resume_routes.py           /api/resumes/*
  job_routes.py                /api/jobs
  application_routes.py          /api/applications, /api/settings/auto-apply
```

## Connecting the frontend

The animated landing page built earlier uses mock JS data. To wire it to
this backend for real: run this server, then replace the hardcoded job
array and hero score animation with `fetch()` calls to the endpoints
above — CORS is already open (`Access-Control-Allow-Origin: *`) for local
development. Tighten that before deploying anywhere public.
