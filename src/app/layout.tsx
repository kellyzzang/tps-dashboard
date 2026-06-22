import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "렌트리 TPS 대시보드",
  description: "타사 지원금 조사 비용 관리 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
