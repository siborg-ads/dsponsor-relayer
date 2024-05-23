import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DSponsor | Unlock smarter monetization for your content.",
  description:
    "DSponsor is a platform that enables creators to monetize their content and engage with their audience in a smarter way."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
