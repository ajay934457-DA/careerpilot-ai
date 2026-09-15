import re


SKILL_ALIASES = {
    "react.js": "react",
    "reactjs": "react",
    "react js": "react",

    "node": "node.js",
    "nodejs": "node.js",
    "node js": "node.js",

    "postgres": "postgresql",
    "postgres sql": "postgresql",

    "mongo": "mongodb",
    "mongo db": "mongodb",

    "scikit learn": "scikit-learn",
    "sklearn": "scikit-learn",

    "js": "javascript",
    "ts": "typescript",

    "ml": "machine learning",
    "dl": "deep learning",

    "cv": "computer vision",

    "powerbi": "power bi",
    "tailwind": "tailwind css",

    "rest api": "rest apis",
}


def normalize_skill(skill):
    skill = skill.strip().lower()
    return SKILL_ALIASES.get(skill, skill)


def normalize_skills(skills):
    return set(normalize_skill(skill) for skill in skills)


def tokenize(text):
    return set(
        word
        for word in re.findall(r"[a-zA-Z0-9+#.]+", text.lower())
        if len(word) > 2
    )


def text_similarity(resume_text, job_description):
    """
    Lightweight text similarity.
    Does not require NumPy, SciPy or scikit-learn.
    """

    resume_words = tokenize(resume_text)
    job_words = tokenize(job_description)

    if not resume_words or not job_words:
        return 0.0

    common_words = resume_words & job_words

    return len(common_words) / len(job_words)


def match_resume_to_job(resume_text, resume_skills, job):

    # ---------------------------------------------------------
    # 1. Normalize skills
    # ---------------------------------------------------------

    required_original = job["required_skills"]

    required = normalize_skills(required_original)
    have = normalize_skills(resume_skills)

    matched_lower = required & have
    missing_lower = required - have

    # ---------------------------------------------------------
    # 2. Skill score
    # ---------------------------------------------------------

    skill_ratio = len(matched_lower) / max(len(required), 1)
    skill_score = skill_ratio * 100

    # ---------------------------------------------------------
    # 3. Text similarity
    # ---------------------------------------------------------

    similarity = text_similarity(
        resume_text,
        job["description"]
    )

    text_score = min(100, similarity * 100)

    # ---------------------------------------------------------
    # 4. Role relevance
    # ---------------------------------------------------------

    role_words = tokenize(job["role"])
    resume_words = tokenize(resume_text)

    role_matches = len(role_words & resume_words)

    role_score = (
        role_matches / max(len(role_words), 1)
    ) * 100

    # ---------------------------------------------------------
    # 5. Final score
    #
    # Skills      = 60%
    # Text        = 25%
    # Role        = 15%
    # ---------------------------------------------------------

    combined = (
        skill_score * 0.60
        + text_score * 0.25
        + role_score * 0.15
    )

    match_score = min(100, round(combined))

    # ---------------------------------------------------------
    # 6. Display matched / missing skills
    # ---------------------------------------------------------

    matched_display = [
        skill
        for skill in required_original
        if normalize_skill(skill) in matched_lower
    ]

    missing_display = [
        skill
        for skill in required_original
        if normalize_skill(skill) in missing_lower
    ]

    # ---------------------------------------------------------
    # 7. Explanation
    # ---------------------------------------------------------

    if matched_display:

        reason = (
            f"{len(matched_display)} of "
            f"{len(required_original)} required skills matched. "
            f"Overall job relevance is {match_score}%."
        )

    elif text_score >= 15:

        reason = (
            "No exact required skills matched, but your resume "
            f"has related content. Overall relevance is {match_score}%."
        )

    else:

        reason = (
            "Few required skills and relevant keywords were "
            "found in the resume."
        )

    return {
        "job_id": job["id"],
        "match_score": match_score,
        "matched_skills": matched_display,
        "missing_skills": missing_display,
        "reason": reason,
    }


def rank_jobs_for_resume(resume_text, resume_skills, jobs):

    results = [
        match_resume_to_job(
            resume_text,
            resume_skills,
            job
        )
        for job in jobs
    ]

    results.sort(
        key=lambda r: r["match_score"],
        reverse=True
    )

    return results