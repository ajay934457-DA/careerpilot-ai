import json

from flask import Blueprint, jsonify, request

from database import get_db

bp = Blueprint("jobs", __name__, url_prefix="/api/jobs")


@bp.get("")
def list_jobs():
    work_mode = request.args.get("work_mode")
    db = get_db()
    if work_mode and work_mode != "All":
        rows = db.execute("SELECT * FROM jobs WHERE work_mode = ?", (work_mode,)).fetchall()
    else:
        rows = db.execute("SELECT * FROM jobs").fetchall()
    db.close()

    jobs = [{
        "id": r["id"],
        "company": r["company"],
        "role": r["role"],
        "work_mode": r["work_mode"],
        "location": r["location"],
        "description": r["description"],
        "required_skills": json.loads(r["required_skills"]),
        "posted_days_ago": r["posted_days_ago"],
    } for r in rows]

    return jsonify(jobs)
