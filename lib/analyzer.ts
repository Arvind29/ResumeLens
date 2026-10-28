export type RequirementKind = "Required" | "Preferred" | "Responsibility";

export type RequirementFinding = {
  text: string;
  kind: RequirementKind;
  matched: boolean;
  evidence: string;
  coverage: number;
  evidenceStrength: "Strong" | "Partial" | "None";
  resumeEvidence: string;
  evidenceTerms: string[];
};

export type SkillGroup = {
  name: string;
  matched: string[];
  missing: string[];
};

export type ScoreItem = {
  label: string;
  score: number;
  weight: number;
  detail: string;
};

export type QualityFinding = {
  title: string;
  category: "Content" | "Structure" | "Impact" | "Targeting";
  level: "good" | "review" | "priority";
  detail: string;
};

export type BulletFinding = {
  text: string;
  hasMetric: boolean;
  hasActionVerb: boolean;
  note: string;
};

export type ResumeAnalysis = {
  overall: number;
  confidenceLabel: string;
  scoreItems: ScoreItem[];
  requirements: RequirementFinding[];
  skills: SkillGroup[];
  matchedKeywords: string[];
  missingKeywords: string[];
  quality: QualityFinding[];
  bullets: BulletFinding[];
  recommendations: string[];
  resumeWordCount: number;
  jobWordCount: number;
  requirementsCoverage: number;
  skillCoverage: number;
  bulletCount: number;
  metricBulletCount: number;
  sectionCount: number;
};

const STOP = new Set((
  "a an and are as at be been being but by can could did do does for from had has have having he her here him his how i if in into is it its may me might more most must my near no not of on or our she should so than that the their them then there these they this those through to was we were what when where which who will with would you your".split(" ")
));

const SKILLS: Array<{ name: string; aliases: string[] }> = [
  { name: "Python", aliases: ["python", "py"] },
  { name: "Java", aliases: ["java"] },
  { name: "JavaScript", aliases: ["javascript", "js"] },
  { name: "TypeScript", aliases: ["typescript", "ts"] },
  { name: "SQL", aliases: ["sql", "structured query language"] },
  { name: "C++", aliases: ["c++", "cpp"] },
  { name: "C#", aliases: ["c#", "c sharp"] },
  { name: "Go", aliases: ["golang", "go language"] },
  { name: "Rust", aliases: ["rust language"] },
  { name: "PowerShell", aliases: ["powershell", "pwsh"] },
  { name: "Bash", aliases: ["bash", "shell scripting", "shell script"] },
  { name: "Linux", aliases: ["linux", "ubuntu", "rhel", "red hat"] },
  { name: "Git", aliases: ["git", "github", "gitlab", "version control"] },
  { name: "REST APIs", aliases: ["rest api", "restful api", "rest apis", "http api"] },
  { name: "GraphQL", aliases: ["graphql"] },
  { name: "Docker", aliases: ["docker", "containers"] },
  { name: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { name: "AWS", aliases: ["aws", "amazon web services"] },
  { name: "Microsoft Azure", aliases: ["azure", "microsoft azure"] },
  { name: "Google Cloud", aliases: ["gcp", "google cloud platform", "google cloud"] },
  { name: "Terraform", aliases: ["terraform", "infrastructure as code", "iac"] },
  { name: "CI/CD", aliases: ["ci/cd", "continuous integration", "continuous delivery", "continuous deployment"] },
  { name: "SQL Server", aliases: ["sql server", "microsoft sql server", "mssql"] },
  { name: "PostgreSQL", aliases: ["postgresql", "postgres"] },
  { name: "MongoDB", aliases: ["mongodb", "mongo db"] },
  { name: "Redis", aliases: ["redis"] },
  { name: "React", aliases: ["react", "react.js", "reactjs"] },
  { name: "Next.js", aliases: ["next.js", "nextjs"] },
  { name: "Node.js", aliases: ["node.js", "nodejs"] },
  { name: "FastAPI", aliases: ["fastapi", "fast api"] },
  { name: "Django", aliases: ["django"] },
  { name: "Machine Learning", aliases: ["machine learning", " ml ", "ml model", "model training"] },
  { name: "Generative AI", aliases: ["generative ai", "genai", "gen ai", "large language model", "llm", "llms"] },
  { name: "Prompt Engineering", aliases: ["prompt engineering", "prompt design"] },
  { name: "RAG", aliases: ["retrieval augmented generation", "rag pipeline", " rag "] },
  { name: "Data Analysis", aliases: ["data analysis", "data analytics", "exploratory data analysis"] },
  { name: "Pandas", aliases: ["pandas"] },
  { name: "TensorFlow", aliases: ["tensorflow"] },
  { name: "PyTorch", aliases: ["pytorch"] },
  { name: "Cybersecurity", aliases: ["cybersecurity", "cyber security", "information security", "infosec"] },
  { name: "SIEM", aliases: ["siem", "security information and event management"] },
  { name: "SOAR", aliases: ["soar", "security orchestration automation and response"] },
  { name: "Incident Response", aliases: ["incident response", "incident handling", "security incident"] },
  { name: "Threat Hunting", aliases: ["threat hunting", "threat hunt"] },
  { name: "Threat Intelligence", aliases: ["threat intelligence", "threat intel"] },
  { name: "Endpoint Security", aliases: ["endpoint detection", "edr", "endpoint security", "xdr"] },
  { name: "Splunk", aliases: ["splunk"] },
  { name: "Microsoft Sentinel", aliases: ["microsoft sentinel", "azure sentinel"] },
  { name: "CrowdStrike", aliases: ["crowdstrike", "falcon platform"] },
  { name: "Palo Alto", aliases: ["palo alto", "cortex xsoar", "xsoar"] },
  { name: "Swimlane", aliases: ["swimlane", "turbine soar"] },
  { name: "MITRE ATT&CK", aliases: ["mitre att&ck", "mitre attack"] },
  { name: "OAuth", aliases: ["oauth", "oauth2"] },
  { name: "SAML", aliases: ["saml", "security assertion markup language"] },
  { name: "Active Directory", aliases: ["active directory", "azure ad", "entra id"] },
  { name: "Networking", aliases: ["networking", "tcp/ip", "dns", "routing", "firewall"] },
  { name: "Agile", aliases: ["agile", "scrum", "kanban"] },
  { name: "Project Management", aliases: ["project management", "project planning", "program management"] },
  { name: "Stakeholder Management", aliases: ["stakeholder management", "cross-functional", "cross functional"] },
  { name: "Communication", aliases: ["written communication", "verbal communication", "communication skills", "presentation skills"] },
  { name: "Excel", aliases: ["excel", "microsoft excel", "spreadsheets"] },
  { name: "Power BI", aliases: ["power bi", "powerbi"] },
  { name: "Tableau", aliases: ["tableau"] },
  { name: "Figma", aliases: ["figma"] },
  { name: "HTML/CSS", aliases: ["html", "css", "html5", "css3"] },
];

const ACTION_VERBS = [
  "built", "created", "designed", "developed", "delivered", "deployed", "automated",
  "improved", "reduced", "increased", "launched", "implemented", "led", "managed",
  "optimized", "streamlined", "configured", "integrated", "migrated", "resolved",
  "investigated", "analyzed", "secured", "engineered", "architected", "established",
  "introduced", "transformed", "maintained", "scaled", "saved", "cut", "grew",
  "generated", "enabled", "orchestrated", "monitored", "mentored", "trained"
];

const SECTION_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "Summary", pattern: /\b(summary|profile|professional summary|objective)\b/i },
  { label: "Experience", pattern: /\b(experience|employment|work history|career history|professional experience)\b/i },
  { label: "Education", pattern: /\b(education|academic|degree|university|college)\b/i },
  { label: "Skills", pattern: /\b(skills|technical skills|technologies|technology stack|competencies|expertise)\b/i },
  { label: "Projects", pattern: /\b(projects|selected projects|portfolio)\b/i },
  { label: "Certifications", pattern: /\b(certifications|certificates|licenses|credentials)\b/i },
  { label: "Publications", pattern: /\b(publications|research|patents)\b/i },
];

function normalize(value: string): string {
  return " " + value.toLowerCase().replace(/[\u2010-\u2015]/g, "-").replace(/[^a-z0-9+#./%$@-]+/g, " ").replace(/\s+/g, " ").trim() + " ";
}

function words(value: string): string[] {
  return value.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").split(/\s+/)
    .filter((word) => word.length > 2 && !STOP.has(word) && !/^\d+$/.test(word));
}

function wordSet(value: string): Set<string> {
  return new Set(words(value));
}

function phrasePresent(text: string, phrase: string): boolean {
  const normalizedText = normalize(text);
  const normalizedPhrase = normalize(phrase);
  if (normalizedText.includes(normalizedPhrase)) return true;

  const termSet = wordSet(text);
  const phraseTerms = words(phrase);
  if (phraseTerms.length < 2) return phraseTerms.length === 1 && termSet.has(phraseTerms[0]);
  const overlap = phraseTerms.filter((term) => termSet.has(term)).length / phraseTerms.length;
  return overlap >= 0.67 && phraseTerms.length >= 2;
}

function uniqueSkills(text: string): string[] {
  const result: string[] = [];
  const normalized = normalize(text);
  for (const skill of SKILLS) {
    if (skill.aliases.some((alias) => normalized.includes(normalize(alias)))) result.push(skill.name);
  }
  return result;
}

function splitRequirements(job: string): Array<{ text: string; kind: RequirementKind }> {
  const lines = job.split(/\n|(?<=[.!?;])\s+/)
    .map((line) => line.replace(/^[\s•*\-–—▪◦\d.)]+/, "").trim())
    .filter((line) => line.length >= 14 && line.length <= 260);
  const unique = Array.from(new Set(lines));
  const candidates = unique.slice(0, 120).map((text) => {
    const lower = text.toLowerCase();
    let kind: RequirementKind = "Responsibility";
    if (/\b(required|required qualifications|must have|must|required to|essential|mandatory|minimum|proficient|proficiency|expertise in|strong knowledge|need to have)\b/i.test(lower)) {
      kind = "Required";
    } else if (/\b(preferred|nice to have|desirable|bonus|ideally|a plus|preferred qualifications|would be an advantage)\b/i.test(lower)) {
      kind = "Preferred";
    }
    return { text, kind };
  });
  const prioritized = candidates.filter((r) => r.kind !== "Responsibility").concat(candidates.filter((r) => r.kind === "Responsibility"));
  return prioritized.slice(0, 12);
}

function sectionLabels(resume: string): string[] {
  return SECTION_PATTERNS.filter((section) => section.pattern.test(resume)).map((section) => section.label);
}

function bulletLines(resume: string): string[] {
  const lines = resume.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const bullets = lines.filter((line) => /^[•●▪◦*–—-]\s+/.test(line)).map((line) => line.replace(/^[•●▪◦*–—-]\s+/, ""));
  if (bullets.length >= 2) return bullets.slice(0, 40);
  const sentences = resume.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter((sentence) => sentence.length >= 35 && sentence.length <= 320);
  return sentences.slice(0, 30);
}

function hasMetric(line: string): boolean {
  return /\b\d+([.,]\d+)?\s?(%|percent|x|k|m|million|billion|days|hours|weeks|months|years|users|customers|incidents|alerts|tickets|systems|teams|projects)\b/i.test(line)
    || /[$₹€£]\s?\d|\b\d{1,3}(,\d{3})+\b/.test(line);
}

function hasActionVerb(line: string): boolean {
  const lower = line.toLowerCase();
  return ACTION_VERBS.some((verb) => new RegExp("\\b" + verb + "\\b", "i").test(lower));
}

function evidenceLines(resume: string): string[] {
  const fragments = resume
    .replace(/\u00ad/g, "")
    .split(/\n+/)
    .flatMap((rawLine) => {
      const line = rawLine.replace(/^[\s•●▪◦*–—-]+/, "").replace(/\s+/g, " ").trim();
      if (!line) return [];
      if (line.length <= 280) return [line];
      return line.split(/(?<=[.!?;])\s+/).filter((part) => part.length >= 25 && part.length <= 280);
    })
    .filter((line) => {
      const count = words(line).length;
      return count >= 3 && count <= 70 && line.length >= 18;
    });
  const sentences = resume
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => words(line).length >= 4 && words(line).length <= 55 && line.length >= 24 && line.length <= 280);
  return Array.from(new Set([...fragments, ...sentences])).slice(0, 240);
}

function findRequirementEvidence(resume: string, requirement: string): {
  coverage: number;
  evidenceStrength: "Strong" | "Partial" | "None";
  resumeEvidence: string;
  evidenceTerms: string[];
} {
  const reqTerms = Array.from(new Set(words(requirement)));
  const candidates = evidenceLines(resume);
  if (!reqTerms.length || !candidates.length) {
    return { coverage: 0, evidenceStrength: "None", resumeEvidence: "", evidenceTerms: [] };
  }

  const candidateTermSets = candidates.map((line) => new Set(words(line)));
  const documentFrequency = new Map<string, number>();
  for (const term of reqTerms) {
    documentFrequency.set(term, candidateTermSets.filter((terms) => terms.has(term)).length);
  }
  const weights = new Map<string, number>();
  for (const term of reqTerms) {
    const df = documentFrequency.get(term) ?? 0;
    // Terms that appear in fewer resume excerpts carry more discriminative weight.
    weights.set(term, 1 + Math.log((candidateTermSets.length + 1) / (df + 1)));
  }
  const totalWeight = reqTerms.reduce((sum, term) => sum + (weights.get(term) ?? 1), 0);

  let bestLine = "";
  let bestTerms: string[] = [];
  let bestScore = 0;
  let exactPhrase = false;
  for (let i = 0; i < candidates.length; i++) {
    const line = candidates[i];
    const terms = candidateTermSets[i];
    const overlap = reqTerms.filter((term) => terms.has(term));
    const weighted = overlap.reduce((sum, term) => sum + (weights.get(term) ?? 1), 0);
    const score = totalWeight ? weighted / totalWeight : 0;
    const exact = normalize(line).includes(normalize(requirement));
    const adjusted = exact ? 1 : score;
    if (adjusted > bestScore) {
      bestScore = adjusted;
      bestLine = line;
      bestTerms = overlap;
      exactPhrase = exact;
    }
  }

  const coverage = Math.max(0, Math.min(100, Math.round(bestScore * 100)));
  const evidenceStrength: "Strong" | "Partial" | "None" =
    exactPhrase || coverage >= 55 ? "Strong" : coverage >= 28 ? "Partial" : "None";
  return {
    coverage,
    evidenceStrength,
    resumeEvidence: bestLine.length > 240 ? bestLine.slice(0, 237) + "…" : bestLine,
    evidenceTerms: bestTerms.slice(0, 8),
  };
}

function meaningfulRequirementCoverage(requirements: RequirementFinding[]): number {
  if (!requirements.length) return 0;
  let total = 0;
  let max = 0;
  for (const requirement of requirements) {
    const weight = requirement.kind === "Required" ? 3 : requirement.kind === "Preferred" ? 1.5 : 1;
    total += requirement.coverage * weight;
    max += weight;
  }
  return Math.round((total / max) * 100);
}

export function analyzeResume(resume: string, job: string): ResumeAnalysis {
  const normalizedResume = normalize(resume);
  const jobTerms = Array.from(new Set(words(job)));
  const resumeTerms = wordSet(resume);
  const exactMatched = jobTerms.filter((term) => resumeTerms.has(term));
  const exactMissing = jobTerms.filter((term) => !resumeTerms.has(term));

  const jobSkills = uniqueSkills(job);
  const resumeSkills = uniqueSkills(resume);
  const skillGroups: SkillGroup[] = [
    { name: "Technical skills", matched: [], missing: [] },
    { name: "Platforms & tools", matched: [], missing: [] },
    { name: "Methods & collaboration", matched: [], missing: [] },
  ];
  const categories: Record<string, string[]> = {
    "Technical skills": ["Python", "Java", "JavaScript", "TypeScript", "SQL", "C++", "C#", "Go", "Rust", "PowerShell", "Bash", "HTML/CSS", "React", "Next.js", "Node.js", "FastAPI", "Django", "Machine Learning", "Generative AI", "Prompt Engineering", "RAG", "Data Analysis", "Pandas", "TensorFlow", "PyTorch", "Networking", "OAuth", "SAML"],
    "Platforms & tools": ["Linux", "Git", "REST APIs", "GraphQL", "Docker", "Kubernetes", "AWS", "Microsoft Azure", "Google Cloud", "Terraform", "CI/CD", "SQL Server", "PostgreSQL", "MongoDB", "Redis", "Splunk", "Microsoft Sentinel", "CrowdStrike", "Palo Alto", "Swimlane", "MITRE ATT&CK", "Active Directory", "Excel", "Power BI", "Tableau", "Figma"],
    "Methods & collaboration": ["Cybersecurity", "SIEM", "SOAR", "Incident Response", "Threat Hunting", "Threat Intelligence", "Endpoint Security", "Agile", "Project Management", "Stakeholder Management", "Communication"],
  };

  for (const group of skillGroups) {
    const relevant = jobSkills.filter((skill) => categories[group.name].includes(skill));
    group.matched = relevant.filter((skill) => resumeSkills.includes(skill));
    group.missing = relevant.filter((skill) => !resumeSkills.includes(skill));
  }
  const uniqueJobSkills = jobSkills;
  const matchedJobSkills = uniqueJobSkills.filter((skill) => resumeSkills.includes(skill));
  const skillCoverage = uniqueJobSkills.length
    ? Math.round((matchedJobSkills.length / uniqueJobSkills.length) * 100)
    : Math.round((exactMatched.length / Math.max(1, jobTerms.length)) * 100);

  const requirements = splitRequirements(job).map((requirement) => {
    const found = findRequirementEvidence(resume, requirement.text);
    const matched = found.evidenceStrength === "Strong";
    return {
      text: requirement.text,
      kind: requirement.kind,
      matched,
      evidence: found.evidenceStrength === "Strong"
        ? "Strong textual overlap with a specific resume excerpt"
        : found.evidenceStrength === "Partial"
          ? "Partial overlap with a specific resume excerpt; confirm equivalence manually"
          : "No strong excerpt-level evidence found; this does not mean the candidate lacks the capability",
      coverage: found.coverage,
      evidenceStrength: found.evidenceStrength,
      resumeEvidence: found.resumeEvidence,
      evidenceTerms: found.evidenceTerms,
    };
  });

  const reqCoverage = requirements.length
    ? meaningfulRequirementCoverage(requirements)
    : skillCoverage;

  const headings = sectionLabels(resume);
  const bulletData = bulletLines(resume).map((line) => {
    const metric = hasMetric(line);
    const action = hasActionVerb(line);
    let note = "Consider adding a clear action and outcome.";
    if (metric && action) note = "Strong signal: action-oriented wording and a measurable result.";
    else if (metric) note = "Contains a measurable detail; make the action or ownership clearer.";
    else if (action) note = "Action-oriented; add scale, frequency, time saved, quality, or another result if known.";
    return { text: line, hasMetric: metric, hasActionVerb: action, note };
  });
  const metricBullets = bulletData.filter((bullet) => bullet.hasMetric).length;
  const actionBullets = bulletData.filter((bullet) => bullet.hasActionVerb).length;

  const contactPresent = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(resume);
  const phonePresent = /(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}\b/.test(resume);
  const wordCount = resume.trim().split(/\s+/).filter(Boolean).length;
  const verbatimOverlap = exactMatched.length;
  const keywordCoverage = jobTerms.length ? Math.round((verbatimOverlap / jobTerms.length) * 100) : 0;
  const achievementCoverage = bulletData.length
    ? Math.round((metricBullets / bulletData.length) * 100 * 0.7 + (actionBullets / bulletData.length) * 30)
    : 15;
  const structureScore = Math.min(100, Math.round((headings.length / 5) * 100 * 0.7 + (contactPresent ? 15 : 0) + (phonePresent ? 15 : 0)));
  const overall = Math.round(
    reqCoverage * 0.38 +
    skillCoverage * 0.27 +
    keywordCoverage * 0.15 +
    structureScore * 0.10 +
    achievementCoverage * 0.10
  );

  const scoreItems: ScoreItem[] = [
    { label: "Core requirements", score: reqCoverage, weight: 38, detail: requirements.length ? "Requirement phrases weighted by likely importance" : "Fallback estimate from role terminology because no clear requirement phrases were detected" },
    { label: "Skills coverage", score: skillCoverage, weight: 27, detail: uniqueJobSkills.length ? matchedJobSkills.length + " of " + uniqueJobSkills.length + " recognized job skills appear in your resume" : "Recognized skills are limited in the job description; common-term overlap is used instead" },
    { label: "Job-language alignment", score: keywordCoverage, weight: 15, detail: exactMatched.length + " of " + jobTerms.length + " distinct non-stopword terms overlap" },
    { label: "Resume structure", score: structureScore, weight: 10, detail: headings.length + " common sections detected; contact details are checked when present" },
    { label: "Achievement evidence", score: achievementCoverage, weight: 10, detail: metricBullets + " of " + bulletData.length + " detected bullet/sentence examples contain metrics" },
  ];

  const quality: QualityFinding[] = [];
  quality.push({
    title: "Contact details",
    category: "Structure",
    level: contactPresent && phonePresent ? "good" : contactPresent || phonePresent ? "review" : "priority",
    detail: contactPresent && phonePresent ? "Email and phone number patterns detected." : contactPresent ? "An email was detected, but a phone number pattern was not." : phonePresent ? "A phone number was detected, but an email pattern was not." : "No clear email or phone pattern found. Verify that contact details are included.",
  });
  quality.push({
    title: "Standard section headings",
    category: "Structure",
    level: headings.length >= 4 ? "good" : headings.length >= 2 ? "review" : "priority",
    detail: headings.length ? "Detected: " + headings.join(", ") + "." : "Could not identify common resume section headings.",
  });
  quality.push({
    title: "Evidence of measurable impact",
    category: "Impact",
    level: metricBullets >= 3 ? "good" : metricBullets > 0 ? "review" : "priority",
    detail: metricBullets + " detected bullet/sentence examples include numbers, percentages, scale, time, or money. The parser checks text, not visual formatting.",
  });
  quality.push({
    title: "Action-oriented experience",
    category: "Impact",
    level: bulletData.length > 0 && actionBullets / bulletData.length >= 0.65 ? "good" : actionBullets > 0 ? "review" : "priority",
    detail: actionBullets + " of " + bulletData.length + " detected bullet/sentence examples contain a recognized action verb.",
  });
  quality.push({
    title: "Resume length",
    category: "Content",
    level: wordCount >= 350 && wordCount <= 1100 ? "good" : wordCount >= 150 && wordCount <= 1500 ? "review" : "priority",
    detail: wordCount + " words extracted. Length varies by seniority and market; use this as a prompt to review, not a hard rule.",
  });
  quality.push({
    title: "Relevant skills are visible",
    category: "Targeting",
    level: skillCoverage >= 75 ? "good" : skillCoverage >= 40 ? "review" : "priority",
    detail: uniqueJobSkills.length ? matchedJobSkills.length + " of " + uniqueJobSkills.length + " job-description skills detected in resume text." : "Few known skill names detected; inspect requirement coverage manually.",
  });
  quality.push({
    title: "Requirement evidence gaps",
    category: "Targeting",
    level: reqCoverage >= 75 ? "good" : reqCoverage >= 45 ? "review" : "priority",
    detail: requirements.filter((item) => !item.matched).length + " of " + requirements.length + " extracted job-description statements lack a clear text match. These are not proof that you lack the capability.",
  });

  const recommendations: string[] = [];
  const missingRequired = requirements.filter((item) => item.kind === "Required" && !item.matched);
  const missingSkills = skillGroups.flatMap((group) => group.missing.map((skill) => skill));
  if (missingRequired.length) recommendations.push("Address the highest-priority requirements first. For each relevant requirement, add accurate evidence from work, projects, or training; do not claim experience you do not have.");
  if (missingSkills.length) recommendations.push("Review these potential skill gaps: " + missingSkills.slice(0, 8).join(", ") + ". Include only skills you can substantiate, and place the most relevant ones near the top.");
  if (metricBullets < 3) recommendations.push("Strengthen experience bullets with verified outcomes where possible: time saved, error reduction, volume handled, availability, cost, adoption, or service quality.");
  if (headings.length < 4) recommendations.push("Use recognizable headings such as Summary, Experience, Skills, Education, Projects, and Certifications when they fit your background.");
  if (!contactPresent || !phonePresent) recommendations.push("Check that professional contact details are included and selectable as text in the final document.");
  if (keywordCoverage < 50) recommendations.push("Mirror the job description's accurate terminology for your relevant experience, while avoiding unsupported keywords or copied sentences.");
  if (recommendations.length < 3) recommendations.push("Customize the top third of the resume to this role and move the most relevant accomplishments ahead of less relevant detail.");
  recommendations.push("Recheck the final PDF for readable text order, consistent dates, clear section hierarchy, and working links. This app cannot reliably evaluate visual layout from extracted text.");

  const matchedKeywords = exactMatched.slice(0, 80);
  const missingKeywords = exactMissing.slice(0, 80);

  return {
    overall: Math.max(0, Math.min(100, overall)),
    confidenceLabel: requirements.length >= 5 && uniqueJobSkills.length >= 5 ? "Richer job description" : "Limited evidence",
    scoreItems,
    requirements,
    skills: skillGroups.filter((group) => group.matched.length || group.missing.length),
    matchedKeywords,
    missingKeywords,
    quality,
    bullets: bulletData.slice(0, 12),
    recommendations: Array.from(new Set(recommendations)).slice(0, 7),
    resumeWordCount: wordCount,
    jobWordCount: job.trim().split(/\s+/).filter(Boolean).length,
    requirementsCoverage: reqCoverage,
    skillCoverage,
    bulletCount: bulletData.length,
    metricBulletCount: metricBullets,
    sectionCount: headings.length,
  };
}
