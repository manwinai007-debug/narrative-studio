import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Narrative Studio — เสียงเล่าเรื่องระดับมืออาชีพ",
  description: "Web app for audio narrative creators — script writing, voice generation, content pipeline management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="bg-gray-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
