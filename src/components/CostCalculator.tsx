'use client'

import { useState } from 'react'
import { calcOrder, COMPANY_CONFIG } from '@/types/database'

function formatKRW(n: number) {
  return n.toLocaleString('ko-KR') + '원'
}

export function CostCalculator() {
  const [easytaskCount, setEasytaskCount] = useState('')
  const [realcontactCount, setRealcontactCount] = useState('')

  const et = calcOrder(Number(easytaskCount) || 0, 'easytask')
  const rc = calcOrder(Number(realcontactCount) || 0, 'realcontact')
  const grandTotal = et.total + rc.total
  const grandAdvance = et.advance + rc.advance
  const grandBalance = et.balance + rc.balance

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">비용 계산기</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* 이지태스크 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-800">이지태스크</span>
            <span className="text-xs text-blue-500">건당 5,500원 · 선금 50%</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              min="0"
              placeholder="조사 건수"
              value={easytaskCount}
              onChange={(e) => setEasytaskCount(e.target.value)}
              className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-sm text-blue-600 whitespace-nowrap">건</span>
          </div>
          {Number(easytaskCount) > 0 && (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>총액</span>
                <span className="font-semibold text-gray-900">{formatKRW(et.total)}</span>
              </div>
              <div className="flex justify-between text-blue-700">
                <span>선금 (50%)</span>
                <span className="font-semibold">{formatKRW(et.advance)}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>잔금 (50%)</span>
                <span className="font-semibold">{formatKRW(et.balance)}</span>
              </div>
            </div>
          )}
        </div>

        {/* 리얼컨택 */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-purple-800">리얼컨택서비스</span>
            <span className="text-xs text-purple-500">건당 13,000원 · 선금 80%</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              min="0"
              placeholder="조사 건수"
              value={realcontactCount}
              onChange={(e) => setRealcontactCount(e.target.value)}
              className="w-full rounded-md border border-purple-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <span className="text-sm text-purple-600 whitespace-nowrap">건</span>
          </div>
          {Number(realcontactCount) > 0 && (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>총액</span>
                <span className="font-semibold text-gray-900">{formatKRW(rc.total)}</span>
              </div>
              <div className="flex justify-between text-purple-700">
                <span>선금 (80%)</span>
                <span className="font-semibold">{formatKRW(rc.advance)}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>잔금 (20%)</span>
                <span className="font-semibold">{formatKRW(rc.balance)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 합계 */}
      {(Number(easytaskCount) > 0 || Number(realcontactCount) > 0) && (
        <div className="border-t border-gray-100 pt-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg py-3">
              <div className="text-xs text-gray-500 mb-1">총 합계</div>
              <div className="text-base font-bold text-gray-900">{formatKRW(grandTotal)}</div>
            </div>
            <div className="bg-blue-50 rounded-lg py-3">
              <div className="text-xs text-blue-500 mb-1">선금 합계</div>
              <div className="text-base font-bold text-blue-700">{formatKRW(grandAdvance)}</div>
            </div>
            <div className="bg-orange-50 rounded-lg py-3">
              <div className="text-xs text-orange-500 mb-1">잔금 합계</div>
              <div className="text-base font-bold text-orange-700">{formatKRW(grandBalance)}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
