import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HRIS Оценка",
  description: "Система за оценка на презентации на HR информационни системи",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body className={`${inter.className} bg-[#f5f6fa] text-gray-900 antialiased`}>
        <Sidebar />
        <main className="md:ml-64 min-h-screen pt-20 md:pt-10 pb-20 md:pb-0 px-4 md:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
