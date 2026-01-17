import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YAML2DAG - YAML to Mermaid DAG Converter",
  description: "Convert YAML configurations into DAG (Directed Acyclic Graph) visualization using Mermaid",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
