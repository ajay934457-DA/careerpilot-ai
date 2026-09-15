import json
import time

from flask import Blueprint, jsonify, request, g

from database import get_db
from auth import token_required


bp = Blueprint(
    "auto_apply",
    __name__,
    url_prefix="/api/auto-apply"
)


def get_or_create_settings(db, user_id):
    row = db.execute(
        """
        SELECT *
        FROM auto_apply_settings
        WHERE user_id = ?
        """,
        (user_id,)
    ).fetchone()

    if row:
        return row

    db.execute(
        """
        INSERT INTO auto_apply_settings
        (
            user_id,
            enabled,
            target_roles,
            min_match_score,
            daily_limit,
            blocked_companies
        )
        VALUES (?, 0, '[]', 75, 5, '[]')
        """,
        (user_id,)
    )

    db.commit()

    return db.execute(
        """
        SELECT *
        FROM auto_apply_settings
        WHERE user_id = ?
        """,
        (user_id,)
    ).fetchone()


@bp.get("/settings")
@token_required
def get_settings():

    db = get_db()

    row = get_or_create_settings(
        db,
        g.user_id
    )

    result = {
        "enabled": bool(row["enabled"]),
        "target_roles": json.loads(row["target_roles"]),
        "min_match_score": row["min_match_score"],
        "daily_limit": row["daily_limit"],
        "blocked_companies": json.loads(row["blocked_companies"]),
    }

    db.close()

    return jsonify(result)


@bp.put("/settings")
@token_required
def update_settings():

    data = request.get_json(silent=True) or {}

    enabled = bool(
        data.get("enabled", False)
    )

    min_match_score = int(
        data.get("min_match_score", 75)
    )

    daily_limit = int(
        data.get("daily_limit", 5)
    )

    target_roles = data.get(
        "target_roles",
        []
    )

    blocked_companies = data.get(
        "blocked_companies",
        []
    )

    if min_match_score < 50:
        min_match_score = 50

    if min_match_score > 95:
        min_match_score = 95

    if daily_limit not in [5, 10, 20]:
        daily_limit = 5

    if not isinstance(target_roles, list):
        target_roles = []

    if not isinstance(blocked_companies, list):
        blocked_companies = []

    db = get_db()

    get_or_create_settings(
        db,
        g.user_id
    )

    db.execute(
        """
        UPDATE auto_apply_settings
        SET
            enabled = ?,
            target_roles = ?,
            min_match_score = ?,
            daily_limit = ?,
            blocked_companies = ?
        WHERE user_id = ?
        """,
        (
            1 if enabled else 0,
            json.dumps(target_roles),
            min_match_score,
            daily_limit,
            json.dumps(blocked_companies),
            g.user_id,
        )
    )

    db.commit()

    row = db.execute(
        """
        SELECT *
        FROM auto_apply_settings
        WHERE user_id = ?
        """,
        (g.user_id,)
    ).fetchone()

    result = {
        "enabled": bool(row["enabled"]),
        "target_roles": json.loads(row["target_roles"]),
        "min_match_score": row["min_match_score"],
        "daily_limit": row["daily_limit"],
        "blocked_companies": json.loads(row["blocked_companies"]),
        "updated_at": time.strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        ),
    }

    db.close()

    return jsonify(result)


@bp.get("/queue")
@token_required
def get_queue():

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

    queue = []

    for row in rows:

        queue.append({
            "id": row["id"],
            "job_id": row["job_id"],
            "resume_id": row["resume_id"],
            "company": row["company"],
            "role": row["role"],
            "work_mode": row["work_mode"],
            "location": row["location"],
            "match_score": row["match_score"],
            "status": row["status"],
            "created_at": row["created_at"],
        })

    return jsonify(queue)