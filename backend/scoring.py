import re

from skills_data import SKILLS_TAXONOMY

SECTION_PATTERNS = {
    "summary": r"\b(summary|objective|profile)\b",
    "experience": r"\b(experience|work experience|employment)\b",
    "education": r"\b(education|academic)\b",
    "skills": r"\b(skills|technical skills|technologies)\b",
    "projects": r"\bprojects\b",
    "certifications": r"\b(certifications?|licenses)\b",
}

DEGREE_KEYWORDS = [
    "bachelor", "b.tech", "btech", "b.e", "master", "m.tech", "mtech",
    "m.s", "phd", "b.sc", "m.sc", "associate degree",
]

ACTION_VERBS = {
    "led", "built", "developed", "designed", "implemented", "created", "managed",
    "improved", "increased", "reduced", "launched", "optimized", "automated",
    "architected", "deployed", "migrated", "analyzed", "coordinated", "mentored",
    "wrote", "trained", "delivered",
}


def detect_sections(text_lower):
    return {name: bool(re.search(pattern, text_lower)) for name, pattern in SECTION_PATTERNS.items()}


def extract_skills(text_lower):
    found = []
    for skill in SKILLS_TAXONOMY:
        pattern = r"(?<![\w.+#-])" + re.escape(skill.lower()) + r"(?![\w.+#-])"
        if re.search(pattern, text_lower):
            found.append(skill)
    return sorted(set(found))


def split_bullets(text):
    lines = [line.strip(" \t•-*\u2022").strip() for line in text.split("\n")]
    return [line for line in lines if len(line) > 8]


def score_resume(raw_text):
    text_lower = raw_text.lower()
    sections = detect_sections(text_lower)
    skills_found = extract_skills(text_lower)
    bullets = split_bullets(raw_text)

    # --- Skills relevance: scaled against a reasonable target count of skills ---
    skills_relevance = min(100, round(len(skills_found) / 12 * 100))

    # --- Resume structure: key sections weighted higher than optional ones ---
    key_sections = ["experience", "education", "skills"]
    optional_sections = ["summary", "projects", "certifications"]
    present_key = sum(1 for s in key_sections if sections.get(s))
    present_optional = sum(1 for s in optional_sections if sections.get(s))
    structure = round((present_key / len(key_sections)) * 70 + (present_optional / len(optional_sections)) * 30)

    # --- Experience quality: action-verb bullets + detectable date ranges ---
    verb_bullets = sum(1 for b in bullets if b.split(" ")[0].lower().strip(".,") in ACTION_VERBS)
    date_ranges = len(re.findall(r"(19|20)\d{2}\s*(-|\u2013|to)\s*((19|20)\d{2}|present)", text_lower))
    bullet_ratio = verb_bullets / max(len(bullets), 1)
    experience_quality = min(100, round(bullet_ratio * 70 + min(date_ranges, 4) / 4 * 30))

    # --- Achievement quality: bullets containing a number (quantified results) ---
    quantified = [b for b in bullets if re.search(r"\d", b)]
    achievement_quality = min(100, round((len(quantified) / max(len(bullets), 1)) * 100))

    # --- Education & certifications ---
    has_degree = any(k in text_lower for k in DEGREE_KEYWORDS)
    has_cert = sections.get("certifications", False) or "certified" in text_lower
    education = min(100, (60 if has_degree else 20) + (40 if has_cert else 0))

    # --- ATS / keyword compatibility: extractable text depth + standard sections ---
    length_score = min(100, round(len(raw_text) / 1800 * 100))
    ats_compatibility = min(100, round(length_score * 0.5 + (present_key / len(key_sections)) * 100 * 0.5))

    weights = {
        "skills_relevance": 0.22,
        "structure": 0.16,
        "experience_quality": 0.20,
        "education": 0.14,
        "ats_compatibility": 0.14,
        "achievement_quality": 0.14,
    }
    metrics = {
        "skills_relevance": skills_relevance,
        "structure": structure,
        "experience_quality": experience_quality,
        "education": education,
        "ats_compatibility": ats_compatibility,
        "achievement_quality": achievement_quality,
    }
    overall = round(sum(metrics[k] * w for k, w in weights.items()))

    strengths = []
    gaps = []

    if len(quantified) >= 3:
        strengths.append(f"{len(quantified)} bullet points include a quantified result, not just a duty.")
    if skills_relevance >= 70:
        strengths.append(f"{len(skills_found)} recognized skills were found across the resume.")
    if structure >= 80:
        strengths.append("All core sections (experience, education, skills) are present and easy to find.")
    if ats_compatibility >= 75:
        strengths.append("Text extracts cleanly \u2014 no signs of a layout that would confuse an ATS parser.")
    if not strengths:
        strengths.append("Resume text was extracted successfully and is ready for scoring.")

    if not sections.get("summary"):
        gaps.append("No summary or objective section \u2014 recruiters usually look here first.")
    if not has_cert:
        gaps.append("No certifications section detected.")
    if achievement_quality < 40:
        gaps.append("Most bullet points describe duties rather than measurable outcomes.")
    if date_ranges == 0:
        gaps.append("No clear date ranges found for work experience.")
    if not gaps:
        gaps.append("No major gaps detected \u2014 fine-tuning for specific roles could still help.")

    return {
        "overall_score": overall,
        "breakdown": {
            "skills_relevance": skills_relevance,
            "resume_structure": structure,
            "experience_quality": experience_quality,
            "education_certifications": education,
            "ats_compatibility": ats_compatibility,
            "achievement_quality": achievement_quality,
        },
        "skills_detected": skills_found,
        "strengths": strengths[:4],
        "gaps": gaps[:4],
    }
