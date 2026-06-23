import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

export const metadata: Metadata = {
  title: '렌트리 가전/TPS 타사 지원금 조사 대시보드',
  description: '타사 지원금 조사 비용 관리 대시보드',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full bg-gray-50 text-gray-900 antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
