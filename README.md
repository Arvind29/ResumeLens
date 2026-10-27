# ResumeLens

A responsive resume-to-job-description comparison tool built with Next.js, React, and TypeScript.

## Features

- Upload PDF, DOCX, or TXT resumes, or paste resume text.
- Compare resume language against a pasted job description.
- Review matched keywords and potential keyword gaps.
- Receive practical resume-improvement suggestions.
- Export a plain-text analysis report.
- Responsive desktop and mobile layout.
- Resume parsing and keyword matching are handled in the browser.

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

## Important limitations

The match percentage is a simple keyword-overlap estimate. It is not an official ATS score, candidate-quality assessment, or prediction of hiring outcomes. Scanned PDFs requiring OCR are not supported. Keyword gaps are suggestions to review, not terms to add unless they accurately reflect the candidate's experience.

The application does not send resume or job-description text to a server for matching. File text extraction uses client-side libraries.
