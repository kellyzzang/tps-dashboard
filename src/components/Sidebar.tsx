'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  {
    href: '/',
    label: '현황',
    sub: '비교 분석',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/surveys',
    label: '조사 관리',
    sub: '발주 · 정산',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: '/commissions',
    label: '수수료 현황',
    sub: '날짜별 추이',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    href: '/products',
    label: '상품 관리',
    sub: '조사 대상 상품 DB',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-52 shrink-0 bg-gray-900 sticky top-0 h-screen flex flex-col overflow-y-auto">
      <div className="px-5 pt-6 pb-5 border-b border-gray-800">
        <div className="text-white font-bold text-sm leading-tight">렌트리 가전/TPS</div>
        <div className="text-gray-500 text-xs mt-1">타사 지원금 조사 대시보드</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              }`}
            >
              <span className={active ? 'text-white' : 'text-gray-500'}>{item.icon}</span>
              <div>
                <div className="text-sm font-medium leading-tight">{item.label}</div>
                <div className={`text-[10px] mt-0.5 ${active ? 'text-blue-200' : 'text-gray-600'}`}>
                  {item.sub}
                </div>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="px-5 pb-5 pt-3 border-t border-gray-800">
        <div className="text-xs text-gray-600">비즈옵스팀 · rentre.kr</div>
      </div>
    </aside>
  )
}
