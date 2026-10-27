import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeLens — Resume Match Analysis",
  description:
    "Compare your resume with a job description, identify keyword gaps, and make your next application more targeted.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}