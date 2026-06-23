'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Product, SurveyItem, MonthlySurvey, CommissionHistory } from '@/types/database'

type Tab = 'tps' | 'usim' | 'appliance'

const TELECOM_STYLE: Record<string, string> = {
  KT: 'bg-red-100 text-red-700',
  'LGU+': 'bg-pink-100 text-pink-700',
  SKB: 'bg-blue-100 text-blue-700',
}

// 추천 이유: 최대 1개 (우선순위 순)
function getRecommendReason(p: Product, survey: MonthlySurvey): string | null {
  if (!p.last_selected_year) return '미조사'
  const months =
    (survey.year - p.last_selected_year) * 12 +
    (survey.month - (p.last_selected_month ?? 1))
  if (months > 3) return `${months}개월 미조사`
  return null
}

// 카테고리별 추천 ID 계산
// 기준: (1) 미조사 (2) >3개월 미조사 (3) 점수 상위 50%
function computeRecommendedIds(products: Product[], survey: MonthlySurvey): Set<string> {
  const recommended = new Set<string>()

  // 기준 1, 2: 시간 기반
  for (const p of products) {
    if (getRecommendReason(p, p.last_selected_year ? survey : survey)) {
      if (!p.last_selected_year) {
        recommended.add(p.id)
        continue
      }
      const months =
        (survey.year - p.last_selected_year) * 12 +
        (survey.month - (p.last_selected_month ?? 1))
      if (months > 3) recommended.add(p.id)
    }
  }

  // 기준 3: 카테고리별 점수 상위 50%
  const cats: Tab[] = ['tps', 'usim', 'appliance']
  for (const cat of cats) {
    const catProducts = products
      .filter(p => p.category === cat)
      .sort((a, b) =>
        cat === 'appliance'
          ? b.selection_count - a.selection_count
          : b.score - a.score
      )
    const topN = Math.max(1, Math.ceil(catProducts.length / 2))
    catProducts.slice(0, topN).forEach(p => recommended.add(p.id))
  }

  return recommended
}

function lastSelectedMonths(p: Product, survey: MonthlySurvey): number | null {
  if (!p.last_selected_year) return null
  return (
    (survey.year - p.last_selected_year) * 12 +
    (survey.month - (p.last_selected_month ?? 1))
  )
}

function CommissionBadge({ product, commissionData }: { product: Product; commissionData: Record<string, CommissionHistory> }) {
  if (!product.commission_key) return null
  const key = `${product.commission_key}::${product.commission_channel || '백메가'}`
  const c = commissionData[key]
  if (!c) return null

  const change = c.daily_change
  const up = change.startsWith('▲')
  const down = change.startsWith('▼')

  return (
    <span className="shrink-0 flex items-center gap-0.5 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
      {(c.current_commission / 10000).toFixed(0)}만
      {up && <span className="text-red-400 text-[10px]">▲</span>}
      {down && <span className="text-blue-400 text-[10px]">▼</span>}
    </span>
  )
}

export function ProductSelectionClient({
  survey,
  products,
  existingItems,
  commissionData = {},
}: {
  survey: MonthlySurvey
  products: Product[]
  existingItems: SurveyItem[]
  commissionData?: Record<string, CommissionHistory>
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('tps')

  const recommendedIds = useMemo(
    () => computeRecommendedIds(products, survey),
    [products, survey]
  )

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (existingItems.length > 0) {
      return new Set(existingItems.map(i => i.product_id).filter(Boolean) as string[])
    }
    return new Set(recommendedIds)
  })

  const tpsProducts = products.filter(p => p.category === 'tps').sort((a, b) => b.score - a.score)
  const usimProducts = products.filter(p => p.category === 'usim').sort((a, b) => b.score - a.score)
  const applianceProducts = products
    .filter(p => p.category === 'appliance')
    .sort((a, b) => b.selection_count - a.selection_count)

  const tabProducts: Record<Tab, Product[]> = {
    tps: tpsProducts,
    usim: usimProducts,
    appliance: applianceProducts,
  }

  const currentList = tabProducts[activeTab]
  const allCurrentSelected = currentList.length > 0 && currentList.every(p => selectedIds.has(p.id))
  const currentRecommended = currentList.filter(p => recommendedIds.has(p.id)).length

  function toggle(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    const ids = currentList.map(p => p.id)
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allCurrentSelected) {
        ids.forEach(id => next.delete(id))
      } else {
        ids.forEach(id => next.add(id))
      }
      return next
    })
  }

  function resetToRecommended() {
    setSelectedIds(new Set(recommendedIds))
  }

  async function handleSave() {
    setSaving(true)
    const items = products
      .filter(p => selectedIds.has(p.id))
      .map(p => ({
        product_id: p.id,
        category: p.category,
        name: p.name,
        brand: p.brand,
        our_subsidy_snapshot: p.our_subsidy,
        score_snapshot: p.score,
      }))

    try {
      const res = await fetch(`/api/surveys/${survey.id}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      router.push('/')
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : '저장 오류')
    } finally {
      setSaving(false)
    }
  }

  const selectedByTab = {
    tps: tpsProducts.filter(p => selectedIds.has(p.id)).length,
    usim: usimProducts.filter(p => selectedIds.has(p.id)).length,
    appliance: applianceProducts.filter(p => selectedIds.has(p.id)).length,
  }

  const tabConfig: { key: Tab; label: string; count: number; selected: number; recommended: number }[] = [
    { key: 'tps',       label: 'TPS (인터넷)', count: tpsProducts.length,       selected: selectedByTab.tps,       recommended: tpsProducts.filter(p => recommendedIds.has(p.id)).length },
    { key: 'usim',      label: '유심',         count: usimProducts.length,      selected: selectedByTab.usim,      recommended: usimProducts.filter(p => recommendedIds.has(p.id)).length },
    { key: 'appliance', label: '가전',         count: applianceProducts.length, selected: selectedByTab.appliance, recommended: applianceProducts.filter(p => recommendedIds.has(p.id)).length },
  ]

  return (
    <div className="space-y-4">
      {/* 추천 기준 안내 */}
      {existingItems.length === 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 flex items-start gap-3">
          <span className="text-blue-500 text-base mt-0.5">💡</span>
          <div className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">자동 추천 기준:</span>{' '}
            미조사 상품, 3개월 이상 미조사 상품, 카테고리별 점수 상위 50%를 자동으로 선택했습니다.
            직접 수정할 수 있습니다.
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* 탭 */}
        <div className="flex border-b border-gray-200">
          {tabConfig.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.selected}/{tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* 툴바 */}
        <div className="px-5 py-2.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            추천 {currentRecommended}개 ·{' '}
            {activeTab !== 'appliance' ? '점수 높은 순' : '선정 횟수 순'}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={resetToRecommended}
              className="text-xs text-gray-400 hover:text-blue-600 hover:underline"
            >
              추천 초기화
            </button>
            <button
              onClick={toggleAll}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              {allCurrentSelected ? '전체 해제' : '전체 선택'}
            </button>
          </div>
        </div>

        {/* 상품 목록 */}
        <div className="divide-y divide-gray-50">
          {currentList.length === 0 ? (
            <p className="text-sm text-gray-400 py-12 text-center">등록된 상품이 없습니다.</p>
          ) : (
            currentList.map(p => {
              const checked = selectedIds.has(p.id)
              const isRecommended = recommendedIds.has(p.id)
              const reason = getRecommendReason(p, survey)
              const months = lastSelectedMonths(p, survey)
              const isUrgent = !p.last_selected_year || (months !== null && months > 3)

              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    checked ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(p.id)}
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                  />

                  {/* TPS / 유심 */}
                  {(p.category === 'tps' || p.category === 'usim') && (
                    <>
                      <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-medium ${TELECOM_STYLE[p.telecom ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.telecom}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm text-gray-900">{p.name}</span>
                        {p.usim_product && (
                          <span className="ml-2 text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                            유심결합
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {p.product_type}
                      </span>
                      <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded ${
                        p.score >= 70 ? 'bg-green-100 text-green-700' :
                        p.score >= 40 ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {p.score}점
                      </span>
                      <CommissionBadge product={p} commissionData={commissionData} />
                    </>
                  )}

                  {/* 가전 */}
                  {p.category === 'appliance' && (
                    <>
                      <span className="shrink-0 text-xs px-1.5 py-0.5 rounded font-medium bg-green-100 text-green-700">
                        {p.appliance_category}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-gray-500 mr-1">{p.brand}</span>
                        <span className="font-medium text-sm text-gray-900">{p.name}</span>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">{p.selection_count}회 선정</span>
                    </>
                  )}

                  {/* 추천 배지 or 마지막 선정 */}
                  {isRecommended && reason ? (
                    <span className="shrink-0 text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                      {reason}
                    </span>
                  ) : isRecommended ? (
                    <span className="shrink-0 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      점수 상위
                    </span>
                  ) : (
                    <span className={`shrink-0 text-xs ${isUrgent ? 'text-orange-500 font-medium' : 'text-gray-400'}`}>
                      {!p.last_selected_year
                        ? '미조사'
                        : months !== null && months <= 0
                        ? '이번달'
                        : `${months}개월 전`}
                    </span>
                  )}
                </label>
              )
            })
          )}
        </div>
      </div>

      {/* 확정 버튼 (sticky) */}
      <div className="sticky bottom-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg px-5 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{selectedIds.size}개</span> 선정됨
            <span className="text-gray-400 ml-3 text-xs">
              TPS {selectedByTab.tps} · 유심 {selectedByTab.usim} · 가전 {selectedByTab.appliance}
            </span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || selectedIds.size === 0}
            className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? '저장 중...' : '조사 리스트 확정'}
          </button>
        </div>
      </div>
    </div>
  )
}
