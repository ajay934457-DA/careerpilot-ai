import pdfplumber


def extract_text(filepath):

    ext = filepath.rsplit(".", 1)[-1].lower()

    if ext == "pdf":
        return _extract_pdf(filepath)

    raise ValueError(f"Unsupported file type: {ext}")


def _extract_pdf(filepath):

    parts = []

    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            parts.append(page.extract_text() or "")

    return "\n".join(parts)