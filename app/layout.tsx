import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getCurrentUser } from "@/lib/auth";
import { LayoutShell } from "@/components/layout-shell";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TLU Tài Liệu - Chia sẻ & Tra cứu Tài liệu Học tập Sinh viên Thủy Lợi",
  description:
    "Cổng thông tin chia sẻ đề thi, slide giảng dạy, giáo trình, bài tập lớn và đồ án miễn phí cho cộng đồng sinh viên Trường Đại học Thủy lợi.",
  keywords: [
    "TLU",
    "Tài liệu Thủy lợi",
    "Đại học Thủy lợi",
    "Đề thi TLU",
    "Slide giảng dạy TLU",
    "Đồ án TLU",
  ],
  icons: {
    icon: "/Logo-DH-Thuy-Loi.webp",
    shortcut: "/Logo-DH-Thuy-Loi.webp",
    apple: "/Logo-DH-Thuy-Loi.webp",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { profile } = await getCurrentUser();

  return (
    <html lang="vi" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Tài liệu TLU" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-500 selection:text-white`}
      >
        <LayoutShell profile={profile}>{children}</LayoutShell>
        <Analytics />
      </body>
    </html>
  );
}
