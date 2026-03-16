import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Gaffer", template: "%s · Gaffer" },
  description: "FPL intelligence — players, fixtures, difficulty ratings, manager lookup",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="antialiased min-h-screen">
        <Navbar />
        <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
