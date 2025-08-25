import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CJ",
  description:
    "Personal portfolio of CJ, a passionate Software Engineer based in Philippines specializing in modern web development.",
  keywords: ["Software Engineer", "Web Developer", "React", "Next.js", "TypeScript", "Portfolio"],
  authors: [{ name: "CJ" }],
  creator: "CJ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} min-h-screen bg-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}