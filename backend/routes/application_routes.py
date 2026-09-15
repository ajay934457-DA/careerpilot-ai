import json
import time

from flask import Blueprint, jsonify, request, g

from database import get_db
from auth import token_required
from matching import match_resume_to_job


bp = Blueprint(
    "applications",
    __name__,
    url_prefix="/api/applications"
)


@bp.post("")
@token_required
def create_application():

    data = request.get_json(silent=True) or {}

    resume_id = data.get("resume_id")
    job_id = data.get("job_id")

    if not resume_id or not job_id:
        return jsonify({
            "error": "resume_id and job_id are required"
        }), 400

    db = get_db()

    # Check resume belongs to logged-in user
    resume = db.execute(
        """
        SELECT *
        FROM resumes
        WHERE id = ? AND user_id = ?
        """,
        (resume_id, g.user_id)
    ).fetchone()

    if not resume:
        db.close()
        return jsonify({
            "error": "Resume not found"
        }), 404

    # Get job
    job_row = db.execute(
        "SELECT * FROM jobs WHERE id = ?",
        (job_id,)
    ).fetchone()

    if not job_row:
        db.close()
        return jsonify({
            "error": "Job not found"
        }), 404

    # Prevent duplicate application
    existing = db.execute(
        """
        SELECT *
        FROM applications
        WHERE user_id = ?
          AND job_id = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (g.user_id, job_id)
    ).fetchone()

    if existing:
        db.close()

        return jsonify({
            "error": "You have already applied to this job",
            "application_id": existing["id"],
            "status": existing["status"]
        }), 409

    # Get latest resume analysis
    score_row = db.execute(
        """
        SELECT skills_detected
        FROM resume_scores
        WHERE resume_id = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (resume_id,)
    ).fetchone()

    if not score_row:
        db.close()

        return jsonify({
            "error": "Analyze your resume before applying"
        }), 400

    resume_skills = json.loads(
        score_row["skills_detected"]
    )

    # Convert database job into matching format
    job = {
        "id": job_row["id"],
        "company": job_row["company"],
        "role": job_row["role"],
        "work_mode": job_row["work_mode"],
        "location": job_row["location"],
        "description": job_row["description"],
        "required_skills": json.loads(
            job_row["required_skills"]
        ),
        "posted_days_ago": job_row["posted_days_ago"],
    }

    # Calculate fresh match score
    result = match_resume_to_job(
        resume["raw_text"],
        resume_skills,
        job
    )

    # We are saving the application request,
    # not falsely claiming an external submission.
    status = "Requires User Action"

    reason = (
        "Application saved successfully. "
        "Manual application is required because "
        "no authorized external application integration "
        "is connected yet."
    )

    created_at = time.strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )

    cursor = db.execute(
        """
        INSERT INTO applications
        (
            user_id,
            resume_id,
            job_id,
            match_score,
            matched_skills,
            missing_skills,
            status,
            reason,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            g.user_id,
            resume_id,
            job_id,
            result["match_score"],
            json.dumps(result["matched_skills"]),
            json.dumps(result["missing_skills"]),
            status,
            reason,
            created_at,
        )
    )

    db.commit()

    application_id = cursor.lastrowid

    db.close()

    return jsonify({
        "application_id": application_id,
        "job_id": job_id,
        "resume_id": resume_id,
        "match_score": result["match_score"],
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"],
        "status": status,
        "reason": reason,
        "created_at": created_at,
    }), 201


@bp.get("")
@token_required
def get_applications():

    db = get_db()

    rows = db.execute(
        """
        SELECT
            a.*,
            j.company,
            j.role,
            j.work_mode,
            j.location
        FROM applications a
        JOIN jobs j ON j.id = a.job_id
        WHERE a.user_id = ?
        ORDER BY a.id DESC
        """,
        (g.user_id,)
    ).fetchall()

    db.close()

    applications = []

    for row in rows:

        applications.append({
            "id": row["id"],
            "resume_id": row["resume_id"],
            "job_id": row["job_id"],
            "company": row["company"],
            "role": row["role"],
            "work_mode": row["work_mode"],
            "location": row["location"],
            "match_score": row["match_score"],
            "matched_skills": json.loads(
                row["matched_skills"]
            ),
            "missing_skills": json.loads(
                row["missing_skills"]
            ),
            "status": row["status"],
            "reason": row["reason"],
            "created_at": row["created_at"],
        })

    return jsonify(applications)