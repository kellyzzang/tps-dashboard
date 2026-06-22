'use client'

import { useState, useTransition } from 'react'
import { supabase } from '@/lib/supabase'
import { MonthlySurvey, SurveyOrder, COMPANY_LABELS, COMPANY_CONFIG, calcOrder } from '@/types/database'
import { useRouter } from 'next/navigation'

interface SurveyWithOrders extends MonthlySurvey {
  survey_orders: SurveyOrder[]
}

function formatKRW(n: number) {
  return n.toLocaleString('ko-KR') + '원'
}

function monthLabel(year: number, month: number) {
  return `${year}년 ${month}월`
}

// ── 새 조사 생성 모달 ────────────────────────────────────────────────────────
function NewSurveyModal({ onClose, onCreated }: { onClose: () => void; onCreated: (s: SurveyWithOrders) => void }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [etCount, setEtCount] = useState('')
  const [rcCount, setRcCount] = useState('')
  const [etSheet, setEtSheet] = useState('')
  const [rcSheet, setRcSheet] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const { data: survey, error: surveyErr } = await supabase
        .from('monthly_surveys')
        .insert({ year, month, status: 'planning' })
        .select()
        .single()
      if (surveyErr) throw surveyErr

      const orders = [
        {
          monthly_survey_id: survey.id,
          company: 'easytask' as const,
          count: Number(etCount) || 0,
          unit_price: COMPANY_CONFIG.easytask.unitPrice,
          advance_rate: COMPANY_CONFIG.easytask.advanceRate,
          google_sheet_url: etSheet || null,
        },
        {
          monthly_survey_id: survey.id,
          company: 'realcontact' as const,
          count: Number(rcCount) || 0,
          unit_price: COMPANY_CONFIG.realcontact.unitPrice,
          advance_rate: COMPANY_CONFIG.realcontact.advanceRate,
          google_sheet_url: rcSheet || null,
        },
      ]

      const { data: createdOrders, error: orderErr } = await supabase
        .from('survey_orders')
        .insert(orders)
        .select()
      if (orderErr) throw orderErr

      onCreated({ ...survey, survey_orders: createdOrders ?? [] })
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">새 월별 조사 시작</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          {/* 연/월 선택 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">연도</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">월</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>
            </div>
          </div>

          {/* 이지태스크 */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">이지태스크</span>
              <span className="text-xs text-blue-400">건당 5,500원 · 선금 50%</span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                placeholder="건수"
                value={etCount}
                onChange={(e) => setEtCount(e.target.value)}
                className="w-28 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {Number(etCount) > 0 && (
                <span className="flex items-center text-xs text-blue-600">
                  총 {formatKRW(Number(etCount) * COMPANY_CONFIG.easytask.unitPrice)}
                </span>
              )}
            </div>
            <input
              type="url"
              placeholder="Google Sheets URL (선택)"
              value={etSheet}
              onChange={(e) => setEtSheet(e.target.value)}
              className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* 리얼컨택 */}
          <div className="bg-purple-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-800">리얼컨택서비스</span>
              <span className="text-xs text-purple-400">건당 13,000원 · 선금 80%</span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                placeholder="건수"
                value={rcCount}
                onChange={(e) => setRcCount(e.target.value)}
                className="w-28 rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              {Number(rcCount) > 0 && (
                <span className="flex items-center text-xs text-purple-600">
                  총 {formatKRW(Number(rcCount) * COMPANY_CONFIG.realcontact.unitPrice)}
                </span>
              )}
            </div>
            <input
              type="url"
              placeholder="Google Sheets URL (선택)"
              value={rcSheet}
              onChange={(e) => setRcSheet(e.target.value)}
              className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            취소
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '생성 중...' : '조사 시작'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 건수/시트 편집 인라인 ────────────────────────────────────────────────────
function OrderRow({
  order,
  onUpdate,
}: {
  order: SurveyOrder
  onUpdate: (updated: SurveyOrder) => void
}) {
  const [editingCount, setEditingCount] = useState(false)
  const [countVal, setCountVal] = useState(String(order.count))
  const [editingSheet, setEditingSheet] = useState(false)
  const [sheetVal, setSheetVal] = useState(order.google_sheet_url || '')
  const [saving, setSaving] = useState(false)

  const calc = calcOrder(order.count, order.company)
  const color = order.company === 'easytask' ? 'blue' : 'purple'

  async function saveCount() {
    setSaving(true)
    const newCount = Number(countVal) || 0
    const { data, error } = await supabase
      .from('survey_orders')
      .update({ count: newCount })
      .eq('id', order.id)
      .select()
      .single()
    setSaving(false)
    setEditingCount(false)
    if (!error && data) onUpdate(data)
  }

  async function saveSheet() {
    setSaving(true)
    const { data, error } = await supabase
      .from('survey_orders')
      .update({ google_sheet_url: sheetVal || null })
      .eq('id', order.id)
      .select()
      .single()
    setSaving(false)
    setEditingSheet(false)
    if (!error && data) onUpdate(data)
  }

  async function togglePayment(field: 'advance_paid' | 'balance_paid') {
    const newVal = !order[field]
    const { data, error } = await supabase
      .from('survey_orders')
      .update({ [field]: newVal })
      .eq('id', order.id)
      .select()
      .single()
    if (!error && data) onUpdate(data)
  }

  const bgClass = color === 'blue' ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'
  const labelClass = color === 'blue' ? 'text-blue-800' : 'text-purple-800'

  return (
    <div className={`rounded-xl border p-4 ${bgClass}`}>
      {/* 헤더: 회사명 + 건수 */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-semibold ${labelClass}`}>
          {COMPANY_LABELS[order.company]}
        </span>
        <div className="flex items-center gap-2">
          {editingCount ? (
            <>
              <input
                type="number"
                min="0"
                value={countVal}
                onChange={(e) => setCountVal(e.target.value)}
                className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') saveCount(); if (e.key === 'Escape') setEditingCount(false) }}
              />
              <button onClick={saveCount} disabled={saving} className="text-xs text-blue-600 font-medium">저장</button>
              <button onClick={() => setEditingCount(false)} className="text-xs text-gray-400">취소</button>
            </>
          ) : (
            <button
              onClick={() => { setCountVal(String(order.count)); setEditingCount(true) }}
              className="text-sm text-gray-700 hover:text-gray-900 underline decoration-dotted"
            >
              {order.count}건
            </button>
          )}
        </div>
      </div>

      {/* 금액 정보 */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="text-center">
          <div className="text-gray-500 mb-0.5">총액</div>
          <div className="font-bold text-gray-900">{formatKRW(calc.total)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 mb-0.5">선금</div>
          <div className="font-bold text-gray-700">{formatKRW(calc.advance)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 mb-0.5">잔금</div>
          <div className="font-bold text-gray-700">{formatKRW(calc.balance)}</div>
        </div>
      </div>

      {/* 선금/잔금 지급 토글 */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => togglePayment('advance_paid')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            order.advance_paid
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
          }`}
        >
          {order.advance_paid ? '✓ 선금 지급완료' : '선금 미지급'}
        </button>
        <button
          onClick={() => togglePayment('balance_paid')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            order.balance_paid
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
          }`}
        >
          {order.balance_paid ? '✓ 잔금 지급완료' : '잔금 미지급'}
        </button>
      </div>

      {/* Google Sheets 링크 */}
      <div className="flex items-center gap-2">
        {editingSheet ? (
          <>
            <input
              type="url"
              value={sheetVal}
              onChange={(e) => setSheetVal(e.target.value)}
              placeholder="Google Sheets URL"
              className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') saveSheet(); if (e.key === 'Escape') setEditingSheet(false) }}
            />
            <button onClick={saveSheet} disabled={saving} className="text-xs text-blue-600 font-medium">저장</button>
            <button onClick={() => setEditingSheet(false)} className="text-xs text-gray-400">취소</button>
          </>
        ) : order.google_sheet_url ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <a
              href={order.google_sheet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-xs text-blue-600 hover:underline truncate"
            >
              📊 조사 시트 열기
            </a>
            <button onClick={() => { setSheetVal(order.google_sheet_url || ''); setEditingSheet(true) }} className="text-xs text-gray-400 hover:text-gray-600">수정</button>
          </div>
        ) : (
          <button
            onClick={() => setEditingSheet(true)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            + Google Sheets URL 추가
          </button>
        )}
      </div>
    </div>
  )
}

// ── 메인 섹션 ────────────────────────────────────────────────────────────────
export function SurveySection({ initialSurveys }: { initialSurveys: SurveyWithOrders[] }) {
  const [surveys, setSurveys] = useState<SurveyWithOrders[]>(initialSurveys)
  const [showModal, setShowModal] = useState(false)

  function handleCreated(newSurvey: SurveyWithOrders) {
    setSurveys((prev) => [newSurvey, ...prev])
  }

  function handleOrderUpdate(surveyId: string, updatedOrder: SurveyOrder) {
    setSurveys((prev) =>
      prev.map((s) =>
        s.id === surveyId
          ? { ...s, survey_orders: s.survey_orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)) }
          : s
      )
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">월별 조사 관리</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <span>+</span> 새 조사 시작
        </button>
      </div>

      {surveys.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-sm">아직 등록된 조사가 없습니다.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            첫 번째 조사를 시작해보세요 →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {surveys.map((survey) => {
            const etOrder = survey.survey_orders.find((o) => o.company === 'easytask')
            const rcOrder = survey.survey_orders.find((o) => o.company === 'realcontact')

            const allPaid =
              etOrder?.advance_paid && etOrder?.balance_paid &&
              rcOrder?.advance_paid && rcOrder?.balance_paid
            const somePending =
              !etOrder?.advance_paid || !etOrder?.balance_paid ||
              !rcOrder?.advance_paid || !rcOrder?.balance_paid

            return (
              <div key={survey.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* 카드 헤더 */}
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{monthLabel(survey.year, survey.month)}</h3>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      allPaid
                        ? 'bg-green-100 text-green-700'
                        : somePending
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {allPaid ? '정산 완료' : '정산 진행중'}
                  </span>
                </div>

                {/* 업체 카드들 */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {etOrder && (
                    <OrderRow
                      order={etOrder}
                      onUpdate={(u) => handleOrderUpdate(survey.id, u)}
                    />
                  )}
                  {rcOrder && (
                    <OrderRow
                      order={rcOrder}
                      onUpdate={(u) => handleOrderUpdate(survey.id, u)}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <NewSurveyModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </section>
  )
}
