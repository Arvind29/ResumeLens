import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const workerSource = resolve(
  process.cwd(),
  "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
);
const publicDirectory = resolve(process.cwd(), "public");
const workerDestination = resolve(publicDirectory, "pdf.worker.mjs");

mkdirSync(publicDirectory, { recursive: true });
copyFileSync(workerSource, workerDestination);
console.log("Copied matching PDF.js worker to public/pdf.worker.mjs");
