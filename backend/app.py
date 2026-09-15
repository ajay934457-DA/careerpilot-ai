import json

from flask import Flask, jsonify

import config
from database import init_db, get_db
from skills_data import SEED_JOBS


def seed_jobs_if_empty():
    db = get_db()
    count = db.execute("SELECT COUNT(*) AS c FROM jobs").fetchone()["c"]
    if count == 0:
        for j in SEED_JOBS:
            db.execute(
                """INSERT INTO jobs
                   (company, role, work_mode, location, description, required_skills, posted_days_ago)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    j["company"], j["role"], j["work_mode"], j["location"],
                    j["description"], json.dumps(j["required_skills"]), j["posted_days_ago"],
                ),
            )
        db.commit()
    db.close()


def create_app():
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = config.MAX_CONTENT_LENGTH

    init_db()
    seed_jobs_if_empty()

    from routes.auth_routes import bp as auth_bp
    from routes.resume_routes import bp as resume_bp
    from routes.job_routes import bp as job_bp
    from routes.application_routes import bp as application_bp
    from routes.auto_apply_routes import bp as auto_apply_bp 

    app.register_blueprint(auth_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(job_bp)
    app.register_blueprint(application_bp)
    app.register_blueprint(auto_apply_bp)
    
    @app.after_request
    def add_cors_headers(resp):
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        return resp

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
