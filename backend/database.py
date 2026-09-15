import sqlite3
import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    uploaded_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS resume_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_id INTEGER NOT NULL,
    overall_score INTEGER NOT NULL,
    skills_relevance INTEGER NOT NULL,
    structure INTEGER NOT NULL,
    experience_quality INTEGER NOT NULL,
    education INTEGER NOT NULL,
    ats_compatibility INTEGER NOT NULL,
    achievement_quality INTEGER NOT NULL,
    skills_detected TEXT NOT NULL,
    strengths TEXT NOT NULL,
    gaps TEXT NOT NULL,
    analyzed_at TEXT NOT NULL,
    FOREIGN KEY(resume_id) REFERENCES resumes(id)
);

CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    work_mode TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT NOT NULL,
    posted_days_ago INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    resume_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    match_score INTEGER NOT NULL,
    matched_skills TEXT NOT NULL,
    missing_skills TEXT NOT NULL,
    status TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(resume_id) REFERENCES resumes(id),
    FOREIGN KEY(job_id) REFERENCES jobs(id)
);

CREATE TABLE IF NOT EXISTS auto_apply_settings (
    user_id INTEGER PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 0,
    target_roles TEXT NOT NULL DEFAULT '[]',
    min_match_score INTEGER NOT NULL DEFAULT 75,
    daily_limit INTEGER NOT NULL DEFAULT 5,
    blocked_companies TEXT NOT NULL DEFAULT '[]',
    FOREIGN KEY(user_id) REFERENCES users(id)
);
"""


def get_db():
    conn = sqlite3.connect(config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()
