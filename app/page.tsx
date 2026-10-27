"use client";

import { useMemo, useState, type ChangeEvent } from "react";

type Analysis = {
  score: number;
  matched: string[];
  missing: string[];
  resumeTerms: number;
  jobTerms: number;
};

const STOP_WORDS = new Set(
  (
    "about above after again against all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just more most my myself no nor not of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours".split(" ")
  )
);

function tokenize(input: string): string[] {
  return Array.from(
    new Set(
      input
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, " ")
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 2 &&
            !STOP_WORDS.has(word) &&
            !/^\d+$/.test(word)
        )
    )
  );
}

function analyze(resume: string, jobDescription: string): Analysis {
  const resumeTerms = tokenize(resume);
  const jobTerms = tokenize(jobDescription);
  const resumeSet = new Set(resumeTerms);
  const matched = jobTerms.filter((term) => resumeSet.has(term));
  const missing = jobTerms.filter((term) => !resumeSet.has(term));
  const score = jobTerms.length
    ? Math.round((matched.length / jobTerms.length) * 100)
    : 0;

  return {
    score,
    matched,
    missing,
    resumeTerms: resumeTerms.length,
    jobTerms: jobTerms.length,
  };
}

export default function Home() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);

  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("");
    setResult(null);

    if (file.size > 8 * 1024 * 1024) {
      setStatus("File exceeds the 8 MB limit.");
      event.target.value = "";
      return;
    }

    setBusy(true);
    try {
      let text = "";
      const extension = file.name.toLowerCase().split(".").pop();

      if (extension === "txt") {
        text = await file.text();
      } else if (extension === "docx") {
        const mammoth = await import("mammoth");
        text = (
          await mammoth.extractRawText({
            arrayBuffer: await file.arrayBuffer(),
          })
        ).value;
      } else if (extension === "pdf") {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        const bytes = new Uint8Array(await file.arrayBuffer());
        // Avoid the unsupported isEvalSupported option from mismatched PDF.js typings.
        const pdf = await pdfjs.getDocument({
          data: bytes,
          useSystemFonts: true,
        }).promise;

        const pages: string[] = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          pages.push(
            content.items
              .map((item) => ("str" in item ? item.str : ""))
              .join(" ")
          );
        }
        text = pages.join("\n\n");
      } else {
        setStatus("Choose a PDF, DOCX, or TXT file.");
        return;
      }

      if (text.trim().length < 30) {
        setStatus(
          "Little or no text was extracted. Scanned PDFs are not supported; paste your resume text instead."
        );
        return;
      }

      setResume(text);
      setFileName(file.name);
      setStatus("Resume text extracted. Review it before analysis.");
    } catch {
      setStatus(
        "Could not read this file. Try another document or paste the resume text."
      );
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  const recommendations = useMemo(() => {
    if (!result) return [];
    const items: string[] = [];
    if (result.missing.length > 0) {
      items.push(
        "Review the potential keyword gaps and add terms only when they accurately describe your skills or experience."
      );
    }
    items.push(
      "Use clear experience bullets that describe your action, the work performed, and measurable outcomes where evidence is available."
    );
    items.push(
      "Keep section headings conventional and ensure your contact details, experience, education, and skills are easy to locate."
    );
    items.push(
      "Prioritize the experience most relevant to this role. Tailor the summary without copying the job description verbatim."
    );
    return items;
  }, [result]);

  function runAnalysis() {
    if (resume.trim().length < 30 || jobDescription.trim().length < 30) {
      setStatus(
        "Enter both resume text and a job description (at least 30 characters each)."
      );
      return;
    }
    setStatus("");
    setResult(analyze(resume, jobDescription));
  }

  function exportReport() {
    if (!result) return;
    const report = [
      "RESUMELENS — RESUME MATCH REPORT",
      `Estimated keyword overlap: ${result.score}%`,
      "This is a simple keyword-overlap estimate, not an official ATS score.",
      `Unique resume terms: ${result.resumeTerms}`,
      `Unique job-description terms: ${result.jobTerms}`,
      "",
      "MATCHED KEYWORDS",
      result.matched.join(", ") || "None detected",
      "",
      "POTENTIAL KEYWORD GAPS",
      result.missing.join(", ") || "None detected",
      "",
      "RECOMMENDATIONS",
      ...recommendations.map((item, index) => `${index + 1}. ${item}`),
    ].join("\n");

    const url = URL.createObjectURL(
      new Blob([report], { type: "text/plain;charset=utf-8" })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "resumelens-report.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function clearResume() {
    setResume("");
    setFileName("");
    setResult(null);
    setStatus("");
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#" aria-label="ResumeLens home">
          <span className="brand-mark">R</span>
          <span>ResumeLens</span>
        </a>
        <nav>
          <a href="#how">How it works</a>
          <a href="#privacy">Privacy</a>
        </nav>
        <span className="top-label">CAREER TOOLKIT</span>
      </header>

      <section className="hero">
        <div className="eyebrow">
          <span className="pulse" /> RESUME MATCH ANALYSIS
        </div>
        <h1>
          Make your next move
          <br />
          <span>with more clarity.</span>
        </h1>
        <p className="hero-copy">
          Compare your resume with a job description, find potential keyword
          gaps, and get practical ways to strengthen your application.
        </p>
        <div className="hero-points">
          <span>✓ Browser-based matching</span>
          <span>✓ No account required</span>
          <span>✓ Exportable report</span>
        </div>
      </section>

      <section className="workspace" aria-label="Resume analysis workspace">
        <div className="section-heading">
          <div>
            <span className="step">01</span>
            <h2>Add your resume and target role</h2>
          </div>
          <span className="muted">PDF · DOCX · TXT · Paste text</span>
        </div>

        <div className="input-grid">
          <div className="panel">
            <label className="field-label" htmlFor="resume">
              RESUME CONTENT
            </label>
            <label className="upload-box" htmlFor="resume-file">
              <span className="upload-icon">↑</span>
              <span className="upload-text">
                <strong>
                  {busy ? "Reading file…" : fileName || "Upload a resume"}
                </strong>
                <small>Maximum 8 MB. PDF, DOCX, or TXT.</small>
              </span>
              <span className="upload-action">Browse</span>
            </label>
            <input
              id="resume-file"
              className="file-input"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={readFile}
              disabled={busy}
            />
            <textarea
              id="resume"
              value={resume}
              onChange={(event) => {
                setResume(event.target.value);
                setFileName("");
                setResult(null);
              }}
              placeholder="Or paste your resume text here…"
              rows={11}
            />
            <div className="field-footer">
              <span>
                {resume.trim()
                  ? `${resume.trim().split(/\s+/).length} words`
                  : "Your resume text"}
              </span>
              <button className="text-button" onClick={clearResume}>
                Clear
              </button>
            </div>
          </div>

          <div className="panel">
            <label className="field-label" htmlFor="job-description">
              JOB DESCRIPTION
            </label>
            <div className="jd-hint">
              <span className="doc-icon">≡</span>
              <span>
                <strong>Target role requirements</strong>
                <small>
                  Include responsibilities, skills, and qualifications.
                </small>
              </span>
            </div>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(event) => {
                setJobDescription(event.target.value);
                setResult(null);
              }}
              placeholder="Paste the full job description here…"
              rows={11}
            />
            <div className="field-footer">
              <span>
                {jobDescription.trim()
                  ? `${jobDescription.trim().split(/\s+/).length} words`
                  : "Job requirements"}
              </span>
              <button
                className="text-button"
                onClick={() => {
                  setJobDescription("");
                  setResult(null);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {status && (
          <p className="status" role="status">
            {status}
          </p>
        )}

        <div className="analyze-row">
          <p>
            Matching runs in your browser. The resume and job text are not
            uploaded for this analysis.
          </p>
          <button className="primary-button" onClick={runAnalysis}>
            Analyze match <span>→</span>
          </button>
        </div>
      </section>

      {result && (
        <section className="results" aria-live="polite">
          <div className="results-title">
            <div>
              <span className="step">02</span>
              <h2>Your match overview</h2>
            </div>
            <button className="secondary-button" onClick={exportReport}>
              ↓ Export report
            </button>
          </div>

          <div className="score-layout">
            <div className="score-card">
              <span className="muted">KEYWORD OVERLAP</span>
              <div className="score-number">
                {result.score}
                <small>%</small>
              </div>
              <div
                className="meter"
                role="progressbar"
                aria-label="Keyword overlap"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={result.score}
              >
                <span style={{ width: `${result.score}%` }} />
              </div>
              <p>
                Heuristic estimate only. Employers use different screening
                systems, criteria, and context.
              </p>
            </div>
            <div className="stat-card">
              <span className="muted">MATCHED TERMS</span>
              <strong>{result.matched.length}</strong>
              <p>Unique terms found in both texts</p>
            </div>
            <div className="stat-card">
              <span className="muted">POTENTIAL GAPS</span>
              <strong>{result.missing.length}</strong>
              <p>Terms in the job text not found in the resume</p>
            </div>
          </div>

          <div className="keyword-grid">
            <div className="keyword-card">
              <h3>
                <span className="dot green" /> Matched keywords
              </h3>
              <div className="chips">
                {result.matched.length ? (
                  result.matched.map((word) => (
                    <span className="chip matched" key={word}>
                      {word}
                    </span>
                  ))
                ) : (
                  <p className="empty">No shared keywords detected yet.</p>
                )}
              </div>
            </div>
            <div className="keyword-card">
              <h3>
                <span className="dot amber" /> Potential keyword gaps
              </h3>
              <div className="chips">
                {result.missing.length ? (
                  result.missing.slice(0, 60).map((word) => (
                    <span className="chip missing" key={word}>
                      {word}
                    </span>
                  ))
                ) : (
                  <p className="empty">No keyword gaps detected.</p>
                )}
              </div>
              {result.missing.length > 60 && (
                <p className="muted">Showing the first 60 terms.</p>
              )}
            </div>
          </div>

          <div className="recommendations">
            <h3>Recommended next steps</h3>
            {recommendations.map((item, index) => (
              <div className="tip" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="how" id="how">
        <div className="section-heading">
          <div>
            <span className="step">03</span>
            <h2>How it works</h2>
          </div>
        </div>
        <div className="how-grid">
          <article>
            <span>01</span>
            <h3>Provide both texts</h3>
            <p>Upload or paste your resume and add the target job description.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Compare keywords</h3>
            <p>
              A browser-based comparison highlights shared terms and possible
              gaps.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Refine with care</h3>
            <p>
              Use the findings as a checklist, not as a promise of hiring
              outcomes.
            </p>
          </article>
        </div>
      </section>

      <footer id="privacy">
        <div className="brand footer-brand">
          <span className="brand-mark">R</span>
          <span>ResumeLens</span>
        </div>
        <p>Designed to support clearer, more targeted applications.</p>
        <p className="privacy-note">
          <strong>Privacy:</strong> Text matching runs locally in your browser.
          The app does not save uploaded files. Text extraction uses client-side
          libraries.
        </p>
        <small>
          ResumeLens provides guidance, not hiring decisions or an official ATS
          score.
        </small>
      </footer>
    </main>
  );
}