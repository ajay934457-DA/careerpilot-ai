SKILLS_TAXONOMY = [
    "Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Go", "Rust",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis",
    "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "FastAPI",
    "Spring Boot", "REST APIs", "GraphQL", "HTML", "CSS", "Tailwind CSS", "Redux",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "CI/CD", "Git", "Linux", "Bash",
    "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "scikit-learn",
    "NLP", "Computer Vision", "Pandas", "NumPy", "Data Analysis", "Data Visualization",
    "Tableau", "Power BI", "Excel",
    "Embedded Systems", "Raspberry Pi", "Arduino", "IoT", "RTOS", "Microcontrollers",
    "Sensor Integration", "Networking",
    "Cybersecurity", "Penetration Testing", "Cryptography",
    "System Design", "Microservices", "Agile", "Scrum", "Unit Testing", "TDD",
    "Selenium", "Jest", "Pytest",
    "Firebase", "Supabase", "Kafka", "RabbitMQ", "OAuth", "JWT",
    "Accessibility Testing", "Figma", "UI/UX Design",
    "Product Management", "Technical Writing", "Leadership", "Communication",
    "Problem Solving", "HIPAA-compliant systems",
]

SEED_JOBS = [
    {
        "company": "Nimbus Systems",
        "role": "Machine Learning Engineer",
        "work_mode": "Remote",
        "location": "Remote (India)",
        "description": (
            "We're looking for a machine learning engineer to build and deploy NLP "
            "models for document understanding. You'll work with Python, PyTorch, "
            "and scikit-learn, and containerize services with Kubernetes for "
            "production deployment."
        ),
        "required_skills": ["Python", "PyTorch", "scikit-learn", "Kubernetes"],
        "posted_days_ago": 2,
    },
    {
        "company": "Lattice Robotics",
        "role": "Embedded Software Engineer",
        "work_mode": "Hybrid",
        "location": "Bengaluru, Hybrid",
        "description": (
            "Join our robotics team building firmware for sensor-driven hardware. "
            "Strong C experience, embedded systems knowledge, and hands-on work "
            "with Raspberry Pi or similar boards is expected, along with "
            "familiarity with RTOS environments."
        ),
        "required_skills": ["C", "Embedded Systems", "Raspberry Pi", "RTOS"],
        "posted_days_ago": 5,
    },
    {
        "company": "Fieldstone Analytics",
        "role": "Data Analyst",
        "work_mode": "Remote",
        "location": "Remote",
        "description": (
            "Analyze customer datasets using Python, Pandas, and SQL to support "
            "product decisions. Experience building dashboards in Tableau is a "
            "plus for communicating findings to stakeholders."
        ),
        "required_skills": ["Python", "Pandas", "SQL", "Tableau"],
        "posted_days_ago": 1,
    },
    {
        "company": "Northwind Labs",
        "role": "DevOps Engineer",
        "work_mode": "On-site",
        "location": "Chennai, On-site",
        "description": (
            "Own our deployment pipeline across Linux servers, Docker containers, "
            "and cloud infrastructure. Experience with Terraform and AWS for "
            "infrastructure-as-code is required."
        ),
        "required_skills": ["Linux", "Docker", "Terraform", "AWS"],
        "posted_days_ago": 9,
    },
    {
        "company": "Harbor & Co",
        "role": "Frontend Engineer",
        "work_mode": "Remote",
        "location": "Remote",
        "description": (
            "Build accessible, well-tested user interfaces in React and "
            "JavaScript. We care about accessibility testing and are migrating "
            "parts of our stack to GraphQL."
        ),
        "required_skills": ["React", "JavaScript", "Accessibility Testing", "GraphQL"],
        "posted_days_ago": 6,
    },
    {
        "company": "Kestrel Health",
        "role": "Full-Stack Developer",
        "work_mode": "Hybrid",
        "location": "Hyderabad, Hybrid",
        "description": (
            "Build full-stack features across a Node.js and React codebase backed "
            "by PostgreSQL, for a healthcare platform that must meet "
            "HIPAA-compliant systems requirements."
        ),
        "required_skills": ["Node.js", "React", "PostgreSQL", "HIPAA-compliant systems"],
        "posted_days_ago": 3,
    },
]
