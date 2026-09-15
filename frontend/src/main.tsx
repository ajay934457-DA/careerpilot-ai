import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Upload,
  Search,
  BriefcaseBusiness,
  FileText,
  Sparkles,
  Settings2,
  Bell,
  ChevronRight,
  CheckCircle2,
  CircleAlert,
  Pause,
  Play,
  MapPin,
  Building2,
  Clock3,
  Target,
  TrendingUp,
  ShieldCheck,
  Zap,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";

import "./style.css";

import {
  register,
  login,
  getJobs,
  uploadResume,
  analyzeResume,
  getMatches,
  getLatestResume,
  createApplication,
  getApplications,
  getAutoApplySettings,
  updateAutoApplySettings,
  getAutoApplyQueue,
} from "./api";

type Job = {
  id: number;
  company: string;
  role: string;
  work_mode: string;
  location: string;
  description: string;
  required_skills: string[];
  posted_days_ago: number;
  match_score?: number;
  score?: number;
};

type Analysis = {
  overall_score: number;
  breakdown?: {
    skills_relevance?: number;
    resume_structure?: number;
    experience_quality?: number;
    education_certifications?: number;
    ats_compatibility?: number;
    achievement_quality?: number;
  };
  skills_detected?: string[];
  strengths?: string[];
  gaps?: string[];
};

function App() {
  const [page, setPage] = useState("Dashboard");
  const [authenticated, setAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [matches, setMatches] = useState<Job[]>([]);

  const [resumeId, setResumeId] = useState<number | null>(null);
  const [resumeName, setResumeName] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const [auto, setAuto] = useState(false);
  const [q, setQ] = useState("");
  const [min, setMin] = useState(80);

  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingResume, setLoadingResume] = useState(false);

  const loadPreviousResume = async () => {
    try {
      const result = await getLatestResume();

      if (!result.resume) {
        return;
      }

      const resume = result.resume;

      setResumeId(resume.resume_id);
      setResumeName(resume.filename || "");

     if (resume.analysis) {
  setAnalysis(resume.analysis);
}

if (resume.analyzed) {
  const matchResult = await getMatches(resume.resume_id);

  setMatches(
    Array.isArray(matchResult)
      ? matchResult
      : []
  );
}
    } catch (error) {
      console.error("Could not load previous resume:", error);
    }
  };
  const loadJobs = async () => {
    try {
      setLoadingJobs(true);
      const data = await getJobs();
      setJobs(Array.isArray(data) ? data : data.jobs || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
  if (authenticated) {
    loadPreviousResume();
  }
}, [authenticated]);

  const handleAuth = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setAuthLoading(true);

      if (authMode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
        await login(email, password);
      }

      setAuthenticated(true);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthenticated(false);
    setResumeId(null);
    setAnalysis(null);
    setMatches([]);
    setPage("Dashboard");
  };

  if (!authenticated) {
    return (
      <AuthScreen
        mode={authMode}
        setMode={setAuthMode}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loading={authLoading}
        error={error}
        onSubmit={handleAuth}
      />
    );
  }

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <b>CP</b>
          <span>
            <strong>CareerPilot</strong>
            <small>AI Career Platform</small>
          </span>
        </div>

        {[
          "Dashboard",
          "Resume Analysis",
          "Job Matches",
          "Applications",
          "Auto-Apply",
        ].map((x) => (
          <button
            key={x}
            className={page === x ? "sel" : ""}
            onClick={() => setPage(x)}
          >
            <span>
              {x === "Dashboard" ? (
                <TrendingUp />
              ) : x === "Resume Analysis" ? (
                <FileText />
              ) : x === "Job Matches" ? (
                <Target />
              ) : x === "Applications" ? (
                <BriefcaseBusiness />
              ) : (
                <Zap />
              )}
            </span>
            {x}
          </button>
        ))}

        <div className="privacy">
          <ShieldCheck />
          <b>Your data stays yours</b>
          <small>
            Transparent AI decisions and user-controlled automation.
          </small>
        </div>

        <div className="profile">
          <i>{email ? email.substring(0, 2).toUpperCase() : "AK"}</i>
          <span>
            <b>My Profile</b>
            <small>Candidate</small>
          </span>
          <Settings2 />
        </div>

        <button onClick={logout}>
          <LogOut />
          Logout
        </button>
      </aside>

      <main>
        <header>
          <div>
            <small>CAREER COMMAND CENTER</small>
            <h1>{page}</h1>
            <p>Find stronger opportunities with explainable AI.</p>
          </div>

          <div>
            <button className="bell">
              <Bell />
            </button>

            <button
              className="primary"
              onClick={() => setPage("Resume Analysis")}
            >
              <Upload />
              Upload Resume
            </button>
          </div>
        </header>

        {page === "Dashboard" && (
          <Dashboard
            setPage={setPage}
            auto={auto}
            setAuto={setAuto}
            analysis={analysis}
            matches={matches}
            min={min}
            setMin={setMin}
          />
        )}

        {page === "Resume Analysis" && (
          <Resume
            resumeId={resumeId}
            resumeName={resumeName}
            analysis={analysis}
            loading={loadingResume}
            setResumeId={setResumeId}
            setResumeName={setResumeName}
            setAnalysis={setAnalysis}
            setMatches={setMatches}
            setLoading={setLoadingResume}
          />
        )}

        {page === "Job Matches" && (
          <Matches
            jobs={matches.length ? matches : jobs}
            q={q}
            setQ={setQ}
            min={min}
            setMin={setMin}
            resumeId={resumeId}
          />
        )}

        {page === "Applications" && <Apps />}

        {page === "Auto-Apply" && (
          <Auto
            auto={auto}
            setAuto={setAuto}
            min={min}
            setMin={setMin}
          />
        )}
      </main>
    </div>
  );
}

function AuthScreen({
  mode,
  setMode,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  onSubmit,
}: any) {
  return (
    <div className="app">
      <main
        style={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="card" style={{ width: 420, padding: 35 }}>
          <div className="brand" style={{ marginBottom: 30 }}>
            <b>CP</b>
            <span>
              <strong>CareerPilot</strong>
              <small>AI Career Platform</small>
            </span>
          </div>

          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>

          <p>
            {mode === "login"
              ? "Login to continue your career journey."
              : "Create an account to start using CareerPilot."}
          </p>

          {error && (
            <div className="notice">
              <CircleAlert />
              <span>{error}</span>
            </div>
          )}

          <div className="form">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </label>

            <button
              className="primary"
              onClick={onSubmit}
              disabled={loading}
              style={{ justifyContent: "center" }}
            >
              {mode === "login" ? <LogIn /> : <UserPlus />}
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Register"}
            </button>
          </div>

          <p style={{ marginTop: 20 }}>
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </p>

          <button
            className="secondary"
            onClick={() =>
              setMode(mode === "login" ? "register" : "login")
            }
          >
            {mode === "login" ? "Create Account" : "Back to Login"}
          </button>
        </div>
      </main>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  note,
}: {
  icon: any;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="stat">
      <div className="ico">{icon}</div>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <em>{note}</em>
      </div>
    </div>
  );
}

function Dashboard({
  setPage,
  auto,
  setAuto,
  analysis,
  matches,
  min,
  setMin,
}: any) {
  const [applicationCount, setApplicationCount] = useState(0);
  const [savingAuto, setSavingAuto] = useState(false);
  const [autoMessage, setAutoMessage] = useState("");

  const score = analysis?.overall_score ?? 0;

  const topMatch =
    matches.length > 0
      ? Math.max(
          ...matches.map(
            (j: Job) => j.match_score ?? j.score ?? 0
          )
        )
      : 0;

  // Load real application count
  useEffect(() => {
    async function loadApplicationCount() {
      try {
        const applications = await getApplications();

        setApplicationCount(
          Array.isArray(applications)
            ? applications.length
            : 0
        );
      } catch (error) {
        console.error(
          "Failed to load application count:",
          error
        );
      }
    }

    loadApplicationCount();
  }, []);

  // Load real Auto-Apply status from backend
  useEffect(() => {
    async function loadAutoApplyStatus() {
      try {
        const settings = await getAutoApplySettings();

        setAuto(settings.enabled);
        setMin(settings.min_match_score);
      } catch (error) {
        console.error(
          "Failed to load Auto-Apply status:",
          error
        );
      }
    }

    loadAutoApplyStatus();
  }, [setAuto, setMin]);

  // Dashboard Auto-Apply toggle
  async function handleAutoToggle() {
    const newValue = !auto;

    try {
      setSavingAuto(true);
      setAutoMessage("");

      const result = await updateAutoApplySettings({
        enabled: newValue,
        min_match_score: min,
      });

      // Use actual backend response
      setAuto(result.enabled);
      setMin(result.min_match_score);

      setAutoMessage(
        result.enabled
          ? "Auto-Apply enabled."
          : "Auto-Apply paused."
      );
    } catch (error: any) {
      console.error(
        "Failed to update Auto-Apply:",
        error
      );

      setAutoMessage(
        error.message ||
          "Failed to update Auto-Apply."
      );
    } finally {
      setSavingAuto(false);
    }
  }

  return (
    <section>

      {/* Hero */}

      <div className="hero">

        <div>

          <label>
            <Sparkles /> AI career copilot
          </label>

          <h2>
            Turn your resume into your next opportunity.
          </h2>

          <p>
            Analyze your profile, discover high-fit jobs
            across companies, and control every application
            from one workspace.
          </p>

          <button
            className="primary"
            onClick={() =>
              setPage("Resume Analysis")
            }
          >
            <Upload />
            Analyze Resume
          </button>{" "}

          <button
            className="secondary"
            onClick={() =>
              setPage("Job Matches")
            }
          >
            <Search />
            Explore Jobs
          </button>

        </div>

        <div className="score">

          <b>
            {score || "--"}
          </b>

          <span>
            Resume Score
          </span>

          <small>
            {score
              ? "Latest analysis"
              : "Upload resume first"}
          </small>

        </div>

      </div>


      {/* Stats */}

      <div className="stats">

        <Stat
          icon={<Target />}
          label="Top Match"
          value={
            topMatch
              ? `${topMatch}%`
              : "--"
          }
          note="Best job match"
        />

        <Stat
          icon={<FileText />}
          label="Resume Score"
          value={
            score
              ? `${score}/100`
              : "--"
          }
          note="AI analysis"
        />

        <Stat
          icon={<BriefcaseBusiness />}
          label="Applications"
          value={
            applicationCount > 0
              ? String(applicationCount)
              : "--"
          }
          note={
            applicationCount > 0
              ? "Total applications"
              : "No applications"
          }
        />

        <Stat
          icon={<Zap />}
          label="Auto-Apply"
          value={
            auto
              ? "ON"
              : "OFF"
          }
          note="Backend controlled"
        />

      </div>


      {/* Main cards */}

      <div className="grid">

        {/* Resume insights */}

        <div className="card">

          <h3>
            Resume insights
          </h3>

          <p>
            {analysis
              ? "Your resume has been analyzed. Open Resume Analysis to see detailed strengths and improvement areas."
              : "Upload your resume to receive your real AI-powered resume score and insights."}
          </p>

          {analysis && (
            <div className="bar">
              <i
                style={{
                  width: `${score}%`,
                }}
              />
            </div>
          )}

          <button
            className="link"
            onClick={() =>
              setPage("Resume Analysis")
            }
          >
            View full analysis
            <ChevronRight />
          </button>

        </div>


        {/* Smart Auto Apply */}

        <div className="card">

          <h3>
            Smart Auto-Apply
          </h3>

          <p>
            Apply only to jobs that meet your rules
            using authorized application paths.
          </p>

          <div className="tags">

            <span>
              Min match {min}%
            </span>

            <span>
              5/day
            </span>

            <span>
              Remote + Hybrid
            </span>

          </div>

          {autoMessage && (
            <p style={{ marginTop: "10px" }}>
              {autoMessage}
            </p>
          )}

          <button
            className={
              auto
                ? "toggle on"
                : "toggle"
            }
            onClick={handleAutoToggle}
            disabled={savingAuto}
          >

            {auto
              ? <Pause />
              : <Play />}

            {savingAuto
              ? "Saving..."
              : auto
              ? "Pause"
              : "Enable"}

          </button>

          <button
            className="secondary"
            style={{
              marginTop: "10px",
            }}
            onClick={() =>
              setPage("Auto-Apply")
            }
          >
            Manage Auto-Apply
          </button>

        </div>

      </div>

    </section>
  );
}

function Resume({
  resumeId,
  resumeName,
  analysis,
  loading,
  setResumeId,
  setResumeName,
  setAnalysis,
  setMatches,
  setLoading,
}: any) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");

 const chooseFile = () => {
  if (inputRef.current) {
    inputRef.current.value = "";
    inputRef.current.click();
  }
};

  const handleFile = async (file: File) => {
    setMessage("");
    setLoading(true);

    try {
      const result = await uploadResume(file);

      setResumeId(result.resume_id);
      setResumeName(result.filename || file.name);

      const analysisResult = await analyzeResume(result.resume_id);

      setAnalysis(analysisResult);

      const matchResult = await getMatches(result.resume_id);

      setMatches(Array.isArray(matchResult) ? matchResult : []);

      setMessage("Resume uploaded and analyzed successfully.");
    } catch (err: any) {
      setMessage(err.message || "Resume processing failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="card center">
        {!resumeId ? (
          <>
            <div className="upload">
              <Upload />
            </div>

            <h2>Upload your resume</h2>

            <p>
              PDF or DOCX up to 10 MB. Your resume will be analyzed by the
              backend.
            </p>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  handleFile(file);
                }
              }}
            />

            <button
              className="primary"
              onClick={chooseFile}
              disabled={loading}
            >
              <Upload />
              {loading ? "Analyzing..." : "Choose Resume"}
            </button>

            {message && (
              <p style={{ marginTop: 15 }}>
                {message}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="complete">
              <CheckCircle2 /> Analysis complete
            </div>

            <p>
              <b>Resume:</b> {resumeName}
            </p>

<input
  ref={inputRef}
  type="file"
  accept=".pdf,.docx"
  style={{ display: "none" }}
  onChange={(e) => {
    const file = e.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  }}
/>

<button
  className="primary"
  onClick={chooseFile}
  disabled={loading}
>
  <Upload />
  {loading ? "Analyzing..." : "Replace Resume"}
</button>
            {analysis && (
              <>
                <div className="resumeTop">
                  <div>
                    <h2>Resume health</h2>

                    <p>
                      Your resume has been analyzed using the backend scoring
                      system.
                    </p>
                  </div>

                  <b>
                    {analysis.overall_score}
                    <small>/100</small>
                  </b>
                </div>

                {analysis.breakdown && (
                  <>
                    <ScoreRow
                      name="Skills relevance"
                      value={analysis.breakdown.skills_relevance}
                    />

                    <ScoreRow
                      name="Resume structure"
                      value={analysis.breakdown.resume_structure}
                    />

                    <ScoreRow
                      name="Experience quality"
                      value={analysis.breakdown.experience_quality}
                    />

                    <ScoreRow
                      name="Education"
                      value={analysis.breakdown.education_certifications}
                    />

                    <ScoreRow
                      name="ATS compatibility"
                      value={analysis.breakdown.ats_compatibility}
                    />

                    <ScoreRow
                      name="Achievement quality"
                      value={analysis.breakdown.achievement_quality}
                    />
                  </>
                )}
              </>
            )}

            {message && <p>{message}</p>}
          </>
        )}
      </div>

      {analysis && (
        <div className="grid">
          <div className="card">
            <h3>Detected skills</h3>

            <div className="tags">
              {(analysis.skills_detected || []).map((skill: string) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Strengths</h3>

           {(analysis.strengths || []).map((x: string) => (
              <p key={x}>✓ {x}</p>
            ))}

            <h3 style={{ marginTop: 25 }}>Improve next</h3>

           {(analysis.gaps || []).map((x: string) => (
  <p key={x}>⚠ {x}</p>
))}
          </div>
        </div>
      )}
    </section>
  );
}

function ScoreRow({ name, value }: { name: string; value?: number }) {
  const score = value ?? 0;

  return (
    <div className="scoreRow">
      <span>
        {name} <b>{score}</b>
      </span>

      <div className="bar">
        <i style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function Matches({
  jobs,
  q,
  setQ,
  min,
  setMin,
  resumeId,
}: any) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filtered = jobs.filter((j: Job) => {
    const score = j.match_score ?? j.score ?? 0;

    const text =
      `${j.role} ${j.company} ${j.location}`.toLowerCase();

    return score >= min && text.includes(q.toLowerCase());
  });

  if (selectedJob) {
    return (
      <section>
        <div className="card">
          <button
            className="secondary"
            onClick={() => setSelectedJob(null)}
          >
            ← Back to Jobs
          </button>

          <div style={{ marginTop: "24px" }}>
            <h2>{selectedJob.role}</h2>

            <p>
              <strong>{selectedJob.company}</strong>
            </p>

            <p>📍 {selectedJob.location}</p>

            <p>💼 {selectedJob.work_mode}</p>
          </div>

          <div className="card" style={{ marginTop: "20px" }}>
            <h3>Match Score</h3>

            <h1>
              {selectedJob.match_score ?? selectedJob.score ?? 0}%
            </h1>
          </div>

          <div className="card" style={{ marginTop: "20px" }}>
            <h3>Required Skills</h3>

            <div className="tags">
              {(selectedJob.required_skills || []).map(
                (skill: string) => (
                  <span key={skill}>{skill}</span>
                )
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: "20px" }}>
            <h3>Job Description</h3>

            <p>{selectedJob.description}</p>
          </div>

          <button
            className="primary"
            style={{ marginTop: "20px" }}
            onClick={async () => {
              if (!resumeId) {
                alert("Please upload and analyze your resume first.");
                return;
              }

              try {
                 const result = await createApplication(
                   resumeId,
                   selectedJob.id ?? selectedJob.job_id
                 );

                alert(
                  `Application saved!\nStatus: ${result.status}`
                );
              } catch (error: any) {
                alert(error.message);
              }
            }}
          >
            Apply Now
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="toolbar">
        <div className="search">
          <Search />

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search jobs or companies..."
          />
        </div>

        <label>
          Minimum match <b>{min}%</b>

          <input
            type="range"
            min="0"
            max="100"
            value={min}
            onChange={(e) => setMin(+e.target.value)}
          />
        </label>
      </div>

      <div className="jobs">
        {filtered.length === 0 ? (
          <div className="card center">
            <Target />
            <h2>No matching jobs</h2>
            <p>
              Upload and analyze a resume to generate personalized matches.
            </p>
          </div>
        ) : (
          filtered.map((j: Job) => {
            const score = j.match_score ?? j.score ?? 0;

            return (
              <div className="job card" key={j.id}>
                <div className="jobtop">
                  <i>{j.company?.[0] || "C"}</i>
                  <b>{score}%</b>
                </div>

                <h3>{j.role}</h3>

                <p>
                  <Building2 /> {j.company}
                </p>

                <small>
                  <MapPin /> {j.location} ·{" "}
                  <Clock3 /> {j.work_mode}
                </small>

                <div className="tags">
                  {(j.required_skills || []).map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>

                <footer>
                  <strong>
                    {j.posted_days_ago === 0
                      ? "Posted today"
                      : `Posted ${j.posted_days_ago} days ago`}
                  </strong>

                  <button
                    className="primary"
                    onClick={() => setSelectedJob(j)}
                  >
                    Select
                  </button>
                </footer>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
function Apps() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        setError("");

        const data = await getApplications();

        setApplications(
          Array.isArray(data) ? data : []
        );
      } catch (err: any) {
        setError(
          err.message || "Failed to load applications"
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  const total = applications.length;

  const applied = applications.filter(
    (app) =>
      app.status === "Applied" ||
      app.status === "Confirmed"
  ).length;

  const processing = applications.filter(
    (app) =>
      app.status === "Processing" ||
      app.status === "In Progress"
  ).length;

  const actionNeeded = applications.filter(
    (app) =>
      app.status === "Requires User Action"
  ).length;

  return (
    <section>
      <div className="stats">
        <Stat
          icon={<BriefcaseBusiness />}
          label="Total"
          value={String(total)}
          note="Applications"
        />

        <Stat
          icon={<CheckCircle2 />}
          label="Applied"
          value={String(applied)}
          note="Confirmed"
        />

        <Stat
          icon={<Clock3 />}
          label="Processing"
          value={String(processing)}
          note="In progress"
        />

        <Stat
          icon={<CircleAlert />}
          label="Action needed"
          value={String(actionNeeded)}
          note="User input"
        />
      </div>

      <div className="card">
        <h3>Application tracker</h3>

        {loading && (
          <p>Loading applications...</p>
        )}

        {error && (
          <p>{error}</p>
        )}

        {!loading &&
          !error &&
          applications.length === 0 && (
            <p>
              No applications found.
            </p>
          )}

        {!loading &&
          !error &&
          applications.length > 0 && (
            <div className="jobs">
              {applications.map((app) => (
                <div
                  className="job card"
                  key={app.id}
                >
                  <div className="jobtop">
                    <i>
                      {app.company?.[0] || "C"}
                    </i>

                    <b>
                      {app.match_score}%
                    </b>
                  </div>

                  <h3>{app.role}</h3>

                  <p>
                    <Building2 />{" "}
                    {app.company}
                  </p>

                  <small>
                    <MapPin />{" "}
                    {app.location} ·{" "}
                    <Clock3 />{" "}
                    {app.work_mode}
                  </small>

                  <div
                    className="tags"
                    style={{
                      marginTop: "12px",
                    }}
                  >
                    {(app.matched_skills || []).map(
                      (skill: string) => (
                        <span key={skill}>
                          ✓ {skill}
                        </span>
                      )
                    )}
                  </div>

                  {app.missing_skills?.length > 0 && (
                    <div
                      className="tags"
                      style={{
                        marginTop: "8px",
                      }}
                    >
                      {app.missing_skills.map(
                        (skill: string) => (
                          <span key={skill}>
                            Missing: {skill}
                          </span>
                        )
                      )}
                    </div>
                  )}

                  <p
                    style={{
                      marginTop: "14px",
                    }}
                  >
                    <strong>Status:</strong>{" "}
                    {app.status}
                  </p>

                  <p>
                    {app.reason}
                  </p>

                  <small>
                    Applied:{" "}
                    {new Date(
                      app.created_at
                    ).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          )}
      </div>
    </section>
  );
}

function Auto({
  auto,
  setAuto,
  min,
  setMin,
}: any) {
  const [dailyLimit, setDailyLimit] = useState(5);
  const [workMode, setWorkMode] = useState("Remote + Hybrid");
  const [experience, setExperience] = useState("Entry level");

  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /*
   * Load settings from backend when Auto-Apply page opens
   */
  useEffect(() => {
    async function loadAutoApply() {
      try {
        setLoading(true);
        setError("");

        const settings = await getAutoApplySettings();

        setAuto(settings.enabled);
        setMin(settings.min_match_score);
        setDailyLimit(settings.daily_limit);

        const queueData = await getAutoApplyQueue();

        setQueue(queueData);
      } catch (err: any) {
        setError(
          err.message || "Failed to load Auto-Apply settings"
        );
      } finally {
        setLoading(false);
      }
    }

    loadAutoApply();
  }, [setAuto, setMin]);


  /*
   * Save settings to backend
   */
  async function saveSettings(
    changes: {
      enabled?: boolean;
      min_match_score?: number;
      daily_limit?: number;
    }
  ) {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const result = await updateAutoApplySettings({
        enabled: changes.enabled ?? auto,
        min_match_score:
          changes.min_match_score ?? min,
        daily_limit:
          changes.daily_limit ?? dailyLimit,
      });

      /*
       * Update UI using the actual backend response
       */
      setAuto(result.enabled);
      setMin(result.min_match_score);
      setDailyLimit(result.daily_limit);

      setMessage("Auto-Apply settings saved.");

      /*
       * Refresh queue
       */
      const queueData = await getAutoApplyQueue();

      setQueue(queueData);
    } catch (err: any) {
      setError(
        err.message || "Failed to save Auto-Apply settings"
      );
    } finally {
      setSaving(false);
    }
  }


  /*
   * Enable / Disable Auto-Apply
   */
  async function handleToggle() {
    const newValue = !auto;

    setAuto(newValue);

    await saveSettings({
      enabled: newValue,
    });
  }


  /*
   * Minimum match changed
   */
  async function handleMinChange(
    value: number
  ) {
    setMin(value);

    await saveSettings({
      min_match_score: value,
    });
  }


  /*
   * Daily limit changed
   */
  async function handleDailyLimitChange(
    value: number
  ) {
    setDailyLimit(value);

    await saveSettings({
      daily_limit: value,
    });
  }


  return (
    <section>

      {/* Main Auto-Apply Card */}

      <div className="card">

        <div className="autoHead">

          <div className="zap">
            <Zap />
          </div>

          <div>
            <h2>Smart Auto-Apply</h2>

            <p>
              Automate eligible applications while keeping
              you in control.
            </p>
          </div>

          <button
            className={
              auto
                ? "toggle on"
                : "toggle"
            }
            onClick={handleToggle}
            disabled={saving}
          >
            {auto ? (
              <Pause />
            ) : (
              <Play />
            )}

            {auto
              ? "Enabled"
              : "Disabled"}
          </button>

        </div>


        {/* Safety message */}

        <div className="notice">

          <ShieldCheck />

          <span>
            <b>Safety first</b>{" "}
            Only authorized application methods are
            allowed. No CAPTCHA bypass, fake information,
            fabricated answers, or false submission claims.
          </span>

        </div>


        {/* Backend status messages */}

        {loading && (
          <p>
            Loading Auto-Apply settings...
          </p>
        )}

        {saving && (
          <p>
            Saving settings...
          </p>
        )}

        {message && (
          <p>
            {message}
          </p>
        )}

        {error && (
          <p>
            {error}
          </p>
        )}


        {/* Settings */}

        <div className="form">

          {/* Minimum Match */}

          <label>

            Minimum match{" "}

            <b>
              {min}%
            </b>

            <input
              type="range"
              min="50"
              max="95"
              value={min}
              onChange={(e) =>
                handleMinChange(
                  Number(e.target.value)
                )
              }
            />

          </label>


          {/* Daily Limit */}

          <label>

            Daily limit

            <select
              value={dailyLimit}
              onChange={(e) =>
                handleDailyLimitChange(
                  Number(e.target.value)
                )
              }
            >

              <option value={5}>
                5 applications
              </option>

              <option value={10}>
                10 applications
              </option>

              <option value={20}>
                20 applications
              </option>

            </select>

          </label>


          {/* Work Mode */}

          <label>

            Work mode

            <select
              value={workMode}
              onChange={(e) =>
                setWorkMode(e.target.value)
              }
            >

              <option value="Remote + Hybrid">
                Remote + Hybrid
              </option>

              <option value="Any">
                Any
              </option>

            </select>

          </label>


          {/* Experience */}

          <label>

            Experience

            <select
              value={experience}
              onChange={(e) =>
                setExperience(e.target.value)
              }
            >

              <option value="Entry level">
                Entry level
              </option>

              <option value="0–2 years">
                0–2 years
              </option>

            </select>

          </label>

        </div>

      </div>


      {/* Application Queue */}

      <div className="card">

        <h3>
          Application queue
        </h3>

        <div className="queue">

          <span>
            Backend controlled queue
          </span>

          <b>
            Ready
          </b>

          <em>
            {auto
              ? "Enabled"
              : "Disabled"}
          </em>

        </div>


        {/* Queue Items */}

        {queue.length > 0 && (

          <div
            className="jobs"
            style={{
              marginTop: "16px",
            }}
          >

            {queue.map((item) => (

              <div
                className="job card"
                key={item.id}
              >

                <div className="jobtop">

                  <i>
                    {item.company?.[0] || "C"}
                  </i>

                  <b>
                    {item.match_score}%
                  </b>

                </div>

                <h3>
                  {item.role}
                </h3>

                <p>
                  <Building2 />{" "}
                  {item.company}
                </p>

                <small>
                  <MapPin />{" "}
                  {item.location} ·{" "}
                  <Clock3 />{" "}
                  {item.work_mode}
                </small>

                <p
                  style={{
                    marginTop: "12px",
                  }}
                >
                  <strong>
                    Status:
                  </strong>{" "}
                  {item.status}
                </p>

              </div>

            ))}

          </div>

        )}

        {queue.length === 0 && !loading && (

          <p
            style={{
              marginTop: "12px",
            }}
          >
            No applications in the queue yet.
          </p>

        )}

      </div>

    </section>
  );
}
createRoot(document.getElementById("root")!).render(<App />);