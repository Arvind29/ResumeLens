"use client";

import { useMemo, useState, type ChangeEvent, type CSSProperties } from "react";
import { analyzeResume, type ResumeAnalysis, type QualityFinding } from "@/lib/analyzer";

type Tab = "overview" | "requirements" | "quality";

function Meter({ value, tone = "teal" }: { value: number; tone?: "teal" | "amber" | "green" }) {
  return <div className={"meter meter-" + tone} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: value + "%" }} /></div>;
}

function LevelTag({ level }: { level: QualityFinding["level"] }) {
  const label = level === "good" ? "Looks good" : level === "review" ? "Review" : "Needs attention";
  return <span className={"level-tag level-" + level}><i />{label}</span>;
}

export default function Home() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("");
    setResult(null);

    if (file.size > 8 * 1024 * 1024) {
      setStatus("This file is over the 8 MB limit. Choose a smaller file.");
      event.target.value = "";
      return;
    }

    setBusy(true);
    try {
      let extracted = "";
      const extension = file.name.toLowerCase().split(".").pop();
      if (extension === "txt") {
        extracted = await file.text();
      } else if (extension === "docx") {
        const mammoth = await import("mammoth");
        extracted = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
      } else if (extension === "pdf") {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
        const bytes = new Uint8Array(await file.arrayBuffer());
        const pdf = await pdfjs.getDocument({ data: bytes, useSystemFonts: true }).promise;
        const pages: string[] = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
        }
        extracted = pages.join("\n\n");
      } else {
        setStatus("Unsupported file type. Choose PDF, DOCX, or TXT.");
        return;
      }

      if (extracted.trim().length < 30) {
        setStatus("Very little text was extracted. This may be a scanned PDF; use a text-based PDF or paste the resume text.");
        return;
      }
      setResume(extracted);
      setFileName(file.name);
      setStatus("Resume extracted successfully. Review the text before running the analysis.");
    } catch (error) {
      console.error("ResumeLens file extraction failed:", error);
      const detail = error instanceof Error ? error.message : "Unknown parser error";
      setStatus("File reading failed: " + detail + ". Try another document or paste the resume text.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  function runAnalysis() {
    if (resume.trim().length < 30 || jobDescription.trim().length < 30) {
      setStatus("Add both resume text and a job description. Each should contain at least 30 characters.");
      return;
    }
    setResult(analyzeResume(resume, jobDescription));
    setActiveTab("overview");
    setStatus("");
    window.setTimeout(() => document.getElementById("analysis-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function downloadReport() {
    if (!result) return;
    const report = {
      product: "ResumeLens",
      generatedAt: new Date().toISOString(),
      note: "Heuristic analysis only. This is not an official ATS score or hiring prediction.",
      summary: {
        overallFitEstimate: result.overall,
        coreRequirementsCoverage: result.requirementsCoverage,
        skillsCoverage: result.skillCoverage,
        wordsInResume: result.resumeWordCount,
        wordsInJobDescription: result.jobWordCount
      },
      scoreBreakdown: result.scoreItems,
      requirementsReview: result.requirements,
      skillCoverage: result.skills,
      resumeQualityChecks: result.quality,
      bulletDiagnostics: result.bullets,
      recommendedNextSteps: result.recommendations
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "resumelens-analysis.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function clearResume() {
    setResume("");
    setFileName("");
    setResult(null);
    setStatus("");
  }

  function clearJob() {
    setJobDescription("");
    setResult(null);
  }

  const scoreSummary = useMemo(() => {
    if (!result) return "";
    if (result.overall >= 80) return "Strong textual alignment";
    if (result.overall >= 60) return "Promising, with targeted gaps";
    if (result.overall >= 40) return "Several areas to investigate";
    return "Reposition the evidence before applying";
  }, [result]);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#" aria-label="ResumeLens home">
          <span className="brand-mark">R</span><span>ResumeLens</span>
          <span className="brand-divider" />
          <span className="brand-sub">CAREER INTELLIGENCE</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#workflow">Method</a>
          <a href="#privacy">Privacy</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-backdrop" />
        <div className="hero-inner">
          <div className="eyebrow"><span className="eyebrow-mark">✳</span> RESUME INTELLIGENCE WORKSPACE</div>
          <h1>Turn your resume into<br /><em>a stronger case.</em></h1>
          <p className="hero-copy">Map your experience to the role, surface evidence gaps, and get a focused improvement plan—before you apply.</p>
          <div className="hero-trust">
            <span><i className="trust-dot" /> Browser-based analysis</span>
            <span><i className="trust-dot" /> No account required</span>
            <span><i className="trust-dot" /> Downloadable evidence report</span>
          </div>
        </div>
      </section>

      <section className="intake-wrap" aria-label="Resume and job description inputs">
        <div className="intake-head">
          <div><div className="micro-label">START HERE / 01</div><h2>Build your role-specific review</h2></div>
          <p>Use the exact job description where possible.</p>
        </div>
        <div className="input-grid">
          <div className="input-panel">
            <div className="input-panel-top">
              <div className="input-symbol resume-symbol"><span>CV</span></div>
              <div><label className="field-label" htmlFor="resume">YOUR RESUME</label><p className="field-description">Experience, projects, skills and outcomes</p></div>
              <span className="input-state">{resume.trim() ? "Added" : "Required"}</span>
            </div>
            <label className="upload-strip" htmlFor="resume-file">
              <span className="upload-glyph">↑</span>
              <span className="upload-copy"><strong>{busy ? "Reading document…" : fileName || "Upload resume file"}</strong><small>PDF, DOCX or TXT · Max 8 MB</small></span>
              <span className="browse-link">Browse files <span>↗</span></span>
            </label>
            <input id="resume-file" className="file-input" type="file" accept=".pdf,.docx,.txt" onChange={readFile} disabled={busy} />
            <textarea id="resume" value={resume} onChange={(event) => { setResume(event.target.value); setFileName(""); setResult(null); }} placeholder="Or paste the full resume text here…" rows={9} />
            <div className="editor-footer"><span>{resume.trim() ? resume.trim().split(/\s+/).length.toLocaleString() + " words detected" : "Text remains in this browser"}</span><button className="quiet-button" onClick={clearResume}>Clear text</button></div>
          </div>
          <div className="input-panel">
            <div className="input-panel-top">
              <div className="input-symbol job-symbol"><span>JD</span></div>
              <div><label className="field-label" htmlFor="job-description">TARGET JOB DESCRIPTION</label><p className="field-description">Responsibilities, must-haves, preferred skills</p></div>
              <span className="input-state">{jobDescription.trim() ? "Added" : "Required"}</span>
            </div>
            <div className="job-guide"><span className="guide-icon">≡</span><span><strong>For best results</strong><small>Include the complete requirements, not just the job title.</small></span></div>
            <textarea id="job-description" value={jobDescription} onChange={(event) => { setJobDescription(event.target.value); setResult(null); }} placeholder="Paste the full job description here…" rows={9} />
            <div className="editor-footer"><span>{jobDescription.trim() ? jobDescription.trim().split(/\s+/).length.toLocaleString() + " words added" : "Use the role's original wording"}</span><button className="quiet-button" onClick={clearJob}>Clear text</button></div>
          </div>
        </div>
        {status && <p className="status-message" role="status"><span>!</span>{status}</p>}
        <div className="analysis-action-row">
          <div className="local-note"><span className="lock-icon">⌑</span><span><strong>Private by default</strong><small>Matching happens locally in your browser. Text is not sent to an AI API.</small></span></div>
          <button className="primary-button" onClick={runAnalysis} disabled={busy}>{busy ? "Reading file…" : "Run resume intelligence"}<span className="button-arrow">↗</span></button>
        </div>
      </section>

      {result && (
        <section className="results-wrap" id="analysis-results" aria-live="polite">
          <div className="results-topline"><div className="micro-label">ANALYSIS COMPLETE / 02</div><button className="export-button" onClick={downloadReport}><span>↓</span> Export JSON report</button></div>
          <div className="results-heading"><div><h2>Your role-fit intelligence</h2><p>Text-derived evidence, structured into an actionable review.</p></div><span className="scope-pill"><i /> {result.confidenceLabel}</span></div>

          <div className="dashboard-grid">
            <div className="fit-card">
              <div className="card-overline">ESTIMATED ROLE ALIGNMENT <span className="info-dot" title="Weighted heuristic, not a hiring probability">i</span></div>
              <div className="fit-main">
                <div className="score-ring" style={{ "--score": result.overall + "%" } as CSSProperties}>
                  <div className="score-ring-inner"><strong>{result.overall}</strong><span>/100</span></div>
                </div>
                <div className="fit-copy"><h3>{scoreSummary}</h3><p>Based on job requirement language, recognized skills, keyword overlap, resume structure, and achievement evidence.</p><span className="fit-foot">Not an official ATS score or hiring prediction.</span></div>
              </div>
              <div className="score-components">
                {result.scoreItems.map((item) => <div className="score-component" key={item.label}><div className="score-component-head"><span>{item.label}</span><strong>{item.score}<small>/100</small></strong></div><Meter value={item.score} tone={item.score >= 70 ? "green" : item.score < 40 ? "amber" : "teal"} /><div className="score-detail"><span>{item.detail}</span><b>{item.weight}% weight</b></div></div>)}
              </div>
            </div>
            <div className="insight-column">
              <div className="metric-card"><div className="metric-top"><span>SKILL COVERAGE</span><span className="metric-icon">⌘</span></div><div className="metric-value">{result.skillCoverage}<small>%</small></div><Meter value={result.skillCoverage} tone={result.skillCoverage >= 70 ? "green" : "teal"} /><p>Recognized skills found in both texts.</p><div className="metric-bottom"><span>{result.skills.reduce((sum, group) => sum + group.matched.length, 0)} matched</span><span>{result.skills.reduce((sum, group) => sum + group.missing.length, 0)} potential gaps</span></div></div>
              <div className="metric-card"><div className="metric-top"><span>REQUIREMENT COVERAGE</span><span className="metric-icon">◎</span></div><div className="metric-value">{result.requirementsCoverage}<small>%</small></div><Meter value={result.requirementsCoverage} tone={result.requirementsCoverage >= 70 ? "green" : "teal"} /><p>Weighted phrase overlap with extracted job statements.</p><div className="metric-bottom"><span>{result.requirements.filter((item) => item.kind === "Required" && !item.matched).length} required gaps</span><span>{result.requirements.length} statements reviewed</span></div></div>
              <div className="metric-card compact-metric"><div className="metric-top"><span>ACHIEVEMENT EVIDENCE</span><span className="metric-icon">↗</span></div><div className="metric-value">{result.metricBulletCount}<small>/{result.bulletCount}</small></div><p>Detected bullets or sentences containing measurable signals.</p><span className="metric-caption">Metrics can be counts, scale, time, cost or percentages.</span></div>
            </div>
          </div>

          <div className="tabbar" role="tablist" aria-label="Analysis views">
            <button role="tab" aria-selected={activeTab === "overview"} className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}><span>01</span> Overview & skills</button>
            <button role="tab" aria-selected={activeTab === "requirements"} className={activeTab === "requirements" ? "active" : ""} onClick={() => setActiveTab("requirements")}><span>02</span> Requirement mapping <b>{result.requirements.length}</b></button>
            <button role="tab" aria-selected={activeTab === "quality"} className={activeTab === "quality" ? "active" : ""} onClick={() => setActiveTab("quality")}><span>03</span> Resume quality checks <b>{result.quality.filter((item) => item.level !== "good").length}</b></button>
          </div>

          {activeTab === "overview" && (
            <div className="tab-content">
              <div className="section-headline"><div><div className="micro-label">ROLE TAXONOMY</div><h3>Skill coverage map</h3><p>Skills are recognized from a curated alias list; unrecognized synonyms may be missed.</p></div><div className="legend"><span><i className="legend-match" /> Present</span><span><i className="legend-gap" /> Not found</span></div></div>
              {result.skills.length ? <div className="skill-groups">{result.skills.map((group) => <div className="skill-group" key={group.name}><div className="skill-group-title"><strong>{group.name}</strong><span>{group.matched.length} / {group.matched.length + group.missing.length}</span></div><div className="skill-chips">{group.matched.map((skill) => <span className="skill-chip chip-present" key={skill}><i>✓</i>{skill}</span>)}{group.missing.map((skill) => <span className="skill-chip chip-gap" key={skill}><i>＋</i>{skill}</span>)}</div></div>)}</div> : <div className="empty-state">No skills from the built-in recognition list were detected. Review the role wording and manual requirements below.</div>}
              <div className="keyword-panels"><div className="keyword-panel"><div className="keyword-panel-title"><span className="keyword-icon icon-present">✓</span><div><h4>Terms in both documents</h4><p>Exact non-stopword overlap</p></div><b>{result.matchedKeywords.length}</b></div><div className="keyword-pills">{result.matchedKeywords.slice(0, 28).map((word) => <span className="keyword-pill" key={word}>{word}</span>)}{!result.matchedKeywords.length && <span className="muted-text">No matching terms found.</span>}</div></div><div className="keyword-panel"><div className="keyword-panel-title"><span className="keyword-icon icon-gap">＋</span><div><h4>Potential terminology gaps</h4><p>Review before editing your resume</p></div><b>{result.missingKeywords.length}</b></div><div className="keyword-pills">{result.missingKeywords.slice(0, 28).map((word) => <span className="keyword-pill gap-pill" key={word}>{word}</span>)}{!result.missingKeywords.length && <span className="muted-text">No gaps detected by exact-term comparison.</span>}</div></div></div>
              <div className="section-headline bullet-headline"><div><div className="micro-label">IMPACT SIGNALS</div><h3>Achievement bullet diagnostics</h3><p>Text-level review of action verbs and measurable impact—without inventing metrics.</p></div><span className="mini-counter">{result.bullets.length} examples</span></div>
              {result.bullets.length ? <div className="bullet-table"><div className="bullet-table-head"><span>RESUME TEXT EXTRACT</span><span>DIAGNOSTIC</span></div>{result.bullets.slice(0, 8).map((bullet, index) => <div className="bullet-row" key={index}><div className="bullet-index">{String(index + 1).padStart(2, "0")}</div><div className="bullet-text">{bullet.text}</div><div className="bullet-tags"><span className={bullet.hasActionVerb ? "signal-positive" : "signal-review"}>{bullet.hasActionVerb ? "Action verb" : "Add action"}</span><span className={bullet.hasMetric ? "signal-positive" : "signal-review"}>{bullet.hasMetric ? "Metric detected" : "Outcome unclear"}</span><small>{bullet.note}</small></div></div>)}</div> : <div className="empty-state">No bullets or substantial sentences were detected. Try a text-based resume with selectable text.</div>}
            </div>
          )}

          {activeTab === "requirements" && (
            <div className="tab-content">
              <div className="section-headline"><div><div className="micro-label">JOB-TO-RESUME TRACEABILITY</div><h3>Requirement evidence matrix</h3><p>These are potential text matches, not proof of qualification or lack of qualification.</p></div><span className="mini-counter">{result.requirements.length} statements</span></div>
              {result.requirements.length ? <div className="requirement-list">{result.requirements.map((item, index) => <article className="requirement-item" key={index}><div className="req-number">{String(index + 1).padStart(2, "0")}</div><div className="req-main"><div className="req-meta"><span className={"requirement-type type-" + item.kind.toLowerCase()}>{item.kind}</span><span className={item.matched ? "req-status status-found" : "req-status status-gap"}>{item.matched ? "Possible evidence found" : "Needs manual review"}</span></div><p>{item.text}</p><div className="req-evidence"><Meter value={item.coverage} tone={item.matched ? "green" : "amber"} /><span>{item.coverage}% phrase coverage</span></div><small>{item.evidence}</small></div></article>)}</div> : <div className="empty-state">No clear requirement statements could be extracted. Try pasting the whole job description with bullets and qualification sections.</div>}
              <div className="method-note"><span>i</span><p><strong>How to read this:</strong> statement importance is inferred from wording such as “required” or “preferred”; phrase coverage is based on matching terms. Review the original statement and your actual experience before deciding what to change.</p></div>
            </div>
          )}

          {activeTab === "quality" && (
            <div className="tab-content">
              <div className="section-headline"><div><div className="micro-label">DOCUMENT READINESS</div><h3>Resume quality diagnostics</h3><p>Structural and content cues detected from extracted text. Visual layout is not assessed.</p></div><span className="mini-counter">{result.quality.filter((item) => item.level !== "good").length} to review</span></div>
              <div className="quality-grid">{result.quality.map((item) => <article className="quality-card" key={item.title}><div className="quality-card-head"><span className={"quality-icon quality-icon-" + item.level}>{item.level === "good" ? "✓" : item.level === "review" ? "↗" : "!"}</span><LevelTag level={item.level} /></div><div className="quality-category">{item.category}</div><h4>{item.title}</h4><p>{item.detail}</p></article>)}</div>
              <div className="section-headline bullet-headline"><div><div className="micro-label">ACTION PLAN</div><h3>Prioritized next steps</h3><p>Suggestions are generated from the gaps detected above.</p></div></div>
              <div className="action-plan">{result.recommendations.map((item, index) => <div className="action-item" key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p><b>{index === 0 ? "HIGH PRIORITY" : index < 4 ? "REVIEW" : "FINAL CHECK"}</b></div>)}</div>
            </div>
          )}

          <div className="report-bottom"><div><span className="report-spark">✳</span><div><strong>Make the evidence work harder.</strong><p>Use the checks as an editing guide, then verify every claim against your real experience.</p></div></div><button className="primary-button small-primary" onClick={downloadReport}>Download analysis <span className="button-arrow">↓</span></button></div>
        </section>
      )}

      <section className="workflow" id="workflow">
        <div className="workflow-head"><div className="micro-label">THE METHOD / 03</div><h2>More than a keyword count.</h2><p>ResumeLens combines several transparent signals into a single review flow.</p></div>
        <div className="workflow-grid"><article><span>01 / ALIGN</span><h3>Map the role</h3><p>Identify job-language overlap, skill terms, and likely required or preferred statements.</p></article><article><span>02 / INSPECT</span><h3>Find the evidence</h3><p>Check structure, contact details, action-oriented bullets, and measurable result signals.</p></article><article><span>03 / IMPROVE</span><h3>Prioritize edits</h3><p>Use a gap-based action plan to make accurate, role-specific revisions.</p></article></div>
      </section>

      <footer className="footer" id="privacy"><div className="footer-top"><a className="brand footer-brand" href="#"><span className="brand-mark">R</span><span>ResumeLens</span></a><span className="footer-label">CAREER INTELLIGENCE / TEXT-BASED REVIEW</span></div><div className="footer-bottom"><p><strong>Privacy:</strong> resume parsing and analysis run in the browser. The app does not store files or send resume text to an AI API.</p><p>Scores and phrase matches are estimates, not hiring decisions or official ATS results. Confirm all findings manually.</p></div></footer>
    </main>
  );
}
