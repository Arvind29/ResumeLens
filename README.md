# ResumeLens

ResumeLens is a responsive, browser-based resume intelligence workspace built with Next.js, React and TypeScript.

## Analysis features

- Upload PDF, DOCX, or TXT resumes, or paste resume and job-description text.
- Weighted role-alignment estimate across requirements, recognized skills, terminology overlap, document structure, and achievement evidence.
- Skill coverage map with recognized aliases and potential gaps.
- Requirement-to-resume phrase coverage, including likely required, preferred and responsibility statements.
- Resume quality checks for contact details, conventional sections, achievement signals, action verbs, length and role alignment.
- Bullet-level diagnostics highlighting action-oriented language and measurable outcome signals.
- Prioritized recommendations and downloadable JSON analysis report.
- Responsive desktop and mobile workspace.
- PDF.js worker copied from the installed package during development/build so that browser extraction uses a matching worker version.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
npm start
```

## Analysis and privacy limits

All text extraction and heuristic analysis run in the browser; the application does not store uploaded documents or send resume text to an AI API. PDF and DOCX parsing use client-side libraries. Scanned PDFs that require OCR are not supported.

The alignment score is a transparent heuristic, not an official ATS score, prediction of hiring outcomes, or assessment of candidate worth. Requirement importance and phrase matching are inferred from text and may miss synonyms, context, formatting and nuanced qualifications. Potential gaps are not proof that a candidate lacks a skill. Review findings and add only accurate, supportable experience. Visual layout, document accessibility and actual ATS behavior are not fully evaluated.
