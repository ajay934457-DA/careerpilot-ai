const API_BASE_URL = "http://127.0.0.1:5000/api";

export async function register(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data;
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  localStorage.setItem("token", data.token);

  return data;
}

export async function getJobs() {
  const response = await fetch(`${API_BASE_URL}/jobs`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load jobs");
  }

  return data;
}

export async function uploadResume(file: File) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first");
  }

  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/resumes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Resume upload failed");
  }

  return data;
}

export async function analyzeResume(resumeId: number) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first");
  }

  const response = await fetch(
    `${API_BASE_URL}/resumes/${resumeId}/analyze`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Resume analysis failed");
  }

  return data;
}

export async function getMatches(resumeId: number) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first");
  }

  const response = await fetch(
    `${API_BASE_URL}/resumes/${resumeId}/matches`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load job matches");
  }

  return data;
}

export async function createApplication(
  resumeId: number,
  jobId: number
) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first");
  }

  const response = await fetch(
    `${API_BASE_URL}/applications`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resume_id: resumeId,
        job_id: jobId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to create application"
    );
  }

  return data;
}

export async function getApplications() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first");
  }

  const response = await fetch(
    `${API_BASE_URL}/applications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to load applications"
    );
  }

  return data;
}

export async function getLatestResume() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first");
  }

  const response = await fetch(
    `${API_BASE_URL}/resumes/latest`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to load previous resume"
    );
  }

  return data;
}


/* =========================================================
   AUTO-APPLY API
   ========================================================= */

export interface AutoApplySettings {
  enabled: boolean;
  target_roles: string[];
  min_match_score: number;
  daily_limit: number;
  blocked_companies: string[];
}

export interface AutoApplyQueueItem {
  id: number;
  job_id: number;
  resume_id: number;
  company: string;
  role: string;
  work_mode: string;
  location: string;
  match_score: number;
  status: string;
  created_at: string;
}


/* Get Auto-Apply settings */

export async function getAutoApplySettings(): Promise<AutoApplySettings> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first");
  }

  const response = await fetch(
    `${API_BASE_URL}/auto-apply/settings`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to load Auto-Apply settings"
    );
  }

  return data;
}


/* Update Auto-Apply settings */

export async function updateAutoApplySettings(
  settings: Partial<AutoApplySettings>
): Promise<AutoApplySettings> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first");
  }

  const response = await fetch(
    `${API_BASE_URL}/auto-apply/settings`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to update Auto-Apply settings"
    );
  }

  return data;
}


/* Get Auto-Apply application queue */

export async function getAutoApplyQueue(): Promise<
  AutoApplyQueueItem[]
> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login first");
  }

  const response = await fetch(
    `${API_BASE_URL}/auto-apply/queue`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to load Auto-Apply queue"
    );
  }

  return Array.isArray(data) ? data : [];
}