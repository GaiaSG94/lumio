import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumio — Une leçon. Une vidéo.",
  description: "Colle ton cours, Lumio en fait une vidéo animée avec voix off et quiz.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
