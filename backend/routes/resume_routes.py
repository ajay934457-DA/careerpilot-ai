import os
import time
import json

from flask import Blueprint, request, jsonify, g
from werkzeug.utils import secure_filename

import config
from database import get_db
from auth import token_required
from resume_parser import extract_text
from scoring import score_resume

bp = Blueprint("resumes", __name__, url_prefix="/api/resumes")


def _allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in config.ALLOWED_EXTENSIONS


def _job_row_to_dict(row):
    return {
        "id": row["id"],
        "company": row["company"],
        "role": row["role"],
        "work_mode": row["work_mode"],
        "location": row["location"],
        "description": row["description"],
        "required_skills": json.loads(row["required_skills"]),
        "posted_days_ago": row["posted_days_ago"],
    }


@bp.post("")
@token_required
def upload_resume():
    if "file" not in request.files:
        return jsonify({"error": "No file part named 'file' in the request"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    if not _allowed(file.filename):
        return jsonify({"error": "Only .pdf and .docx files are supported"}), 400

    os.makedirs(config.UPLOAD_DIR, exist_ok=True)
    filename = secure_filename(file.filename)
    stored_name = f"{int(time.time() * 1000)}_{filename}"
    path = os.path.join(config.UPLOAD_DIR, stored_name)
    file.save(path)

    try:
        raw_text = extract_text(path)
    except Exception as exc:  # noqa: BLE001 - surface a clean error to the client
        return jsonify({"error": f"Could not read this file: {exc}"}), 422

    if not raw_text.strip():
        return jsonify({
            "error": "No extractable text found. If this is a scanned image, text won't be detected."
        }), 422

    db = get_db()
    cur = db.execute(
        "INSERT INTO resumes (user_id, filename, raw_text, uploaded_at) VALUES (?, ?, ?, ?)",
        (g.user_id, filename, raw_text, time.strftime("%Y-%m-%dT%H:%M:%SZ")),
    )
    db.commit()
    resume_id = cur.lastrowid
    db.close()

    return jsonify({
        "resume_id": resume_id,
        "filename": filename,
        "text_preview": raw_text[:400],
    }), 201

@bp.get("/latest")
@token_required
def get_latest_resume():
    db = get_db()

    row = db.execute(
        """
        SELECT id, filename, raw_text, uploaded_at
        FROM resumes
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (g.user_id,),
    ).fetchone()

    if not row:
        db.close()
        return jsonify({"resume": None}), 200

    score = db.execute(
        """
        SELECT *
        FROM resume_scores
        WHERE resume_id = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (row["id"],),
    ).fetchone()

    resume = {
        "resume_id": row["id"],
        "filename": row["filename"],
        "uploaded_at": row["uploaded_at"],
        "analyzed": score is not None,
    }

    if score:
        resume["analysis"] = {
            "overall_score": score["overall_score"],
            "breakdown": {
                "skills_relevance": score["skills_relevance"],
                "resume_structure": score["structure"],
                "experience_quality": score["experience_quality"],
                "education_certifications": score["education"],
                "ats_compatibility": score["ats_compatibility"],
                "achievement_quality": score["achievement_quality"],
            },
            "skills_detected": json.loads(score["skills_detected"]),
            "strengths": json.loads(score["strengths"]),
            "gaps": json.loads(score["gaps"]),
        }

    db.close()

    return jsonify({"resume": resume}), 200

@bp.post("/<int:resume_id>/analyze")
@token_required
def analyze_resume(resume_id):
    db = get_db()
    row = db.execute(
        "SELECT * FROM resumes WHERE id = ? AND user_id = ?", (resume_id, g.user_id)
    ).fetchone()
    if not row:
        db.close()
        return jsonify({"error": "Resume not found"}), 404

    result = score_resume(row["raw_text"])

    db.execute(
        """INSERT INTO resume_scores
           (resume_id, overall_score, skills_relevance, structure, experience_quality,
            education, ats_compatibility, achievement_quality, skills_detected,
            strengths, gaps, analyzed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            resume_id,
            result["overall_score"],
            result["breakdown"]["skills_relevance"],
            result["breakdown"]["resume_structure"],
            result["breakdown"]["experience_quality"],
            result["breakdown"]["education_certifications"],
            result["breakdown"]["ats_compatibility"],
            result["breakdown"]["achievement_quality"],
            json.dumps(result["skills_detected"]),
            json.dumps(result["strengths"]),
            json.dumps(result["gaps"]),
            time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        ),
    )
    db.commit()
    db.close()
    return jsonify(result)


@bp.get("/<int:resume_id>/matches")
@token_required
def resume_matches(resume_id):
    db = get_db()
    resume = db.execute(
        "SELECT * FROM resumes WHERE id = ? AND user_id = ?", (resume_id, g.user_id)
    ).fetchone()
    if not resume:
        db.close()
        return jsonify({"error": "Resume not found"}), 404

    score_row = db.execute(
        "SELECT skills_detected FROM resume_scores WHERE resume_id = ? ORDER BY id DESC LIMIT 1",
        (resume_id,),
    ).fetchone()
    job_rows = db.execute("SELECT * FROM jobs").fetchall()
    db.close()

    if not score_row:
        return jsonify({"error": "Analyze this resume before requesting matches"}), 400

    resume_skills = json.loads(score_row["skills_detected"])
    jobs = [_job_row_to_dict(r) for r in job_rows]

    from matching import rank_jobs_for_resume
    ranked = rank_jobs_for_resume(resume["raw_text"], resume_skills, jobs)

    by_id = {j["id"]: j for j in jobs}
    output = []
    for r in ranked:
        job = by_id[r["job_id"]]
        output.append({
    **r,
    "company": job["company"],
    "role": job["role"],
    "work_mode": job["work_mode"],
    "location": job["location"],
    "posted_days_ago": job["posted_days_ago"],
    "required_skills": job["required_skills"],
})
    return jsonify(output)
