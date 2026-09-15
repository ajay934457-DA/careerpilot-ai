import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me-before-deploying")
DATABASE_PATH = os.environ.get("DATABASE_PATH", os.path.join(BASE_DIR, "contour.db"))
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", os.path.join(BASE_DIR, "uploads"))

TOKEN_EXP_HOURS = 24
ALLOWED_EXTENSIONS = {"pdf", "docx"}
MAX_CONTENT_LENGTH = 8 * 1024 * 1024  # 8 MB
