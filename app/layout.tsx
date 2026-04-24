import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blockify — Block Your Art",
  description:
    "ASCII art studio. Transform text and images into stunning ASCII art. 25+ fonts, 55+ templates, instant export.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
