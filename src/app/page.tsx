import { supabase } from '@/lib/supabase'
import { MonthlySurvey, SurveyOrder, SurveyComparison } from '@/types/database'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  planning: '계획 중',
  in_progress: '진행 중',
  completed: '완료',
}
const STATUS_COLOR: Record<string, string> = {
  planning: 'bg-gray-100 text-gray-500',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
}

const TELECOM_COLOR: Record<string, string> = {
  'KT':   'bg-red-50 text-red-600',
  'LGU+': 'bg-pink-50 text-pink-600',
  'SKB':  'bg-sky-50 text-sky-600',
}

const BRAND_COLOR: Record<string, string> = {
  'LG':         'bg-red-50 text-red-600',
  'SK인텔릭스': 'bg-orange-50 text-orange-600',
  '코웨이':     'bg-blue-50 text-blue-600',
  '쿠쿠':       'bg-emerald-50 text-emerald-600',
}

function fmtDiff(v: number) {
  const abs = Math.abs(v)
  const man = Math.round(abs / 10000)
  return `${v >= 0 ? '+' : '-'}${man}만`
}

type ProductStat = {
  product_name: string
  telecom: string | null
  brand: string | null
  category: string
  totalPoints: number   // sum of all non-null diffs
  pointCount: number    // number of non-null diffs
  avgDiff: number       // totalPoints / pointCount
  aheadCount: number    // competitor rows where avg(easytask, realcontact) > 0
  behindCount: number   // competitor rows where avg < 0
  worstCompetitor: string
  worstDiff: number
  competitorCount: number
}

function calcStats(rows: SurveyComparison[]): ProductStat[] {
  const byProduct = new Map<string, SurveyComparison[]>()
  for (const r of rows) {
    const key = `${r.category}::${r.telecom ?? ''}::${r.brand ?? ''}::${r.product_name}`
    if (!byProduct.has(key)) byProduct.set(key, [])
    byProduct.get(key)!.push(r)
  }

  return Array.from(byProduct.entries()).map(([, items]) => {
    const first = items[0]
    let totalPoints = 0, pointCount = 0
    let aheadCount = 0, behindCount = 0
    let worstDiff = Infinity, worstCompetitor = '-'

    for (const item of items) {
      const diffs: number[] = []
      if (item.easytask_diff !== null) diffs.push(item.easytask_diff)
      if (item.realcontact_diff !== null) diffs.push(item.realcontact_diff)
      if (diffs.length === 0) continue

      const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length
      totalPoints += diffs.reduce((a, b) => a + b, 0)
      pointCount += diffs.length

      if (avg >= 0) aheadCount++
      else behindCount++

      if (avg < worstDiff) {
        worstDiff = avg
        worstCompetitor = item.competitor_name
      }
    }

    return {
      product_name: first.product_name,
      telecom: first.telecom,
      brand: first.brand,
      category: first.category,
      totalPoints,
      pointCount,
      avgDiff: pointCount > 0 ? Math.round(totalPoints / pointCount) : 0,
      aheadCount,
      behindCount,
      worstCompetitor,
      worstDiff: worstDiff === Infinity ? 0 : Math.round(worstDiff),
      competitorCount: items.length,
    }
  })
}

function diffRowColor(avgDiff: number, behindCount: number, total: number): string {
  if (behindCount === 0) return 'bg-green-50/50 border-l-2 border-l-green-400'
  if (behindCount === total) return 'bg-red-50/50 border-l-2 border-l-red-400'
  if (avgDiff >= 0) return 'bg-blue-50/30 border-l-2 border-l-blue-300'
  return 'bg-orange-50/40 border-l-2 border-l-orange-300'
}

type SurveyWithOrders = MonthlySurvey & { survey_orders: SurveyOrder[] }

export default async function HomePage() {
  const [{ data: rawSurveys }, { data: rawComparisons }] = await Promise.all([
    supabase
      .from('monthly_surveys')
      .select('*, survey_orders(*)')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(12),
    supabase
      .from('survey_comparisons')
      .select('*')
      .order('product_name'),
  ])

  const surveys = (rawSurveys ?? []) as SurveyWithOrders[]
  const allComparisons = (rawComparisons ?? []) as SurveyComparison[]

  // 가장 최근 월 파악 (survey_comparisons에 데이터 있는 최신 monthly_survey)
  const surveysWithData = surveys.filter(s =>
    allComparisons.some(c => c.monthly_survey_id === s.id)
  )
  const latestSurvey = surveysWithData[0]
  const latestComparisons = latestSurvey
    ? allComparisons.filter(c => c.monthly_survey_id === latestSurvey.id)
    : []

  const tpsStats = calcStats(latestComparisons.filter(c => c.category === 'tps'))
    .sort((a, b) => {
      const tc = (a.telecom ?? '').localeCompare(b.telecom ?? '')
      return tc !== 0 ? tc : a.product_name.localeCompare(b.product_name)
    })
  const applianceStats = calcStats(latestComparisons.filter(c => c.category === 'appliance'))
    .sort((a, b) => {
      const bc = (a.brand ?? '').localeCompare(b.brand ?? '')
      return bc !== 0 ? bc : a.product_name.localeCompare(b.product_name)
    })

  // 요약
  const now = new Date()
  const thisSurvey = surveys.find(s => s.year === now.getFullYear() && s.month === now.getMonth() + 1)
  const tpsAheadAll  = tpsStats.filter(s => s.behindCount === 0).length
  const tpsBehindAny = tpsStats.filter(s => s.behindCount > 0).length

  // 발주 비용: 조사 데이터 기반 (이지태스크 5,500원/건, 리얼컨택 13,000원/건)
  const easytaskCount    = allComparisons.filter(c => c.easytask_diff !== null).length
  const realcontactCount = allComparisons.filter(c => c.realcontact_diff !== null).length
  const easytaskCost     = easytaskCount * 5500
  const realcontactCost  = realcontactCount * 13000

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">현황</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {latestSurvey ? `${latestSurvey.year}년 ${latestSurvey.month}월 경쟁사 지원금 비교` : '경쟁사 지원금 비교 분석'}
            </p>
          </div>
          <Link href="/surveys" className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + 조사 관리
          </Link>
        </div>
      </header>

      <main className="px-6 py-5 space-y-6 max-w-screen-xl">
        {/* 요약 카드 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <div className="text-xs text-gray-400 mb-1">이번달 조사</div>
            {thisSurvey ? (
              <>
                <div className="text-lg font-bold text-gray-900">{thisSurvey.year}년 {thisSurvey.month}월</div>
                <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[thisSurvey.status]}`}>
                  {STATUS_LABEL[thisSurvey.status]}
                </span>
              </>
            ) : (
              <div className="text-sm text-gray-400 mt-1">조사 없음</div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <div className="text-xs text-gray-400 mb-1">인터넷 — 완전 우위 상품</div>
            <div className="text-lg font-bold text-green-600">{tpsAheadAll}<span className="text-sm text-gray-400 font-normal">/{tpsStats.length}개</span></div>
            <div className="text-xs text-gray-400 mt-1">모든 경쟁사 대비 우위</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <div className="text-xs text-gray-400 mb-1">인터넷 — 주의 필요 상품</div>
            <div className="text-lg font-bold text-red-500">{tpsBehindAny}<span className="text-sm text-gray-400 font-normal">/{tpsStats.length}개</span></div>
            <div className="text-xs text-gray-400 mt-1">1개 이상 경쟁사 우위</div>
          </div>
          {/* 누적 발주 비용 — 업체별 */}
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <div className="text-xs text-gray-400 mb-2">누적 발주 비용</div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">이지태스크</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{(easytaskCost / 10000).toLocaleString('ko-KR')}만</span>
                  <span className="text-xs text-gray-400 ml-1">{easytaskCount}건</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">리얼컨택</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{(realcontactCost / 10000).toLocaleString('ko-KR')}만</span>
                  <span className="text-xs text-gray-400 ml-1">{realcontactCount}건</span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">합계</span>
                <span className="text-sm font-bold text-blue-600">
                  {((easytaskCost + realcontactCost) / 10000).toLocaleString('ko-KR')}만원
                </span>
              </div>
            </div>
          </div>
        </div>

        {latestComparisons.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <p className="text-sm text-gray-400 mb-2">비교 데이터가 없습니다</p>
            <p className="text-xs text-gray-300 mb-4">
              <code className="bg-gray-100 px-1.5 py-0.5 rounded">/api/seed/survey-data</code> 를 GET 호출하여 데이터를 삽입하세요
            </p>
            <Link href="/surveys" className="text-xs text-blue-600 hover:underline">조사 관리로 이동 →</Link>
          </div>
        )}

        {/* 인터넷 비교 테이블 */}
        {tpsStats.length > 0 && (
          <ComparisonTable
            title="인터넷 경쟁사 비교"
            subtitle={`${latestSurvey?.year}년 ${latestSurvey?.month}월 · ${tpsStats[0]?.competitorCount ?? 0}개 경쟁사 기준`}
            stats={tpsStats}
            labelKey="telecom"
            labelColorMap={TELECOM_COLOR}
          />
        )}

        {/* 가전 비교 테이블 */}
        {applianceStats.length > 0 && (
          <ComparisonTable
            title="가전 경쟁사 비교"
            subtitle={`${latestSurvey?.year}년 ${latestSurvey?.month}월 · 미소·뽐뿌·아정당 기준`}
            stats={applianceStats}
            labelKey="brand"
            labelColorMap={BRAND_COLOR}
          />
        )}

        {/* 최근 조사 현황 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">최근 조사 현황</h2>
            <Link href="/surveys" className="text-xs text-blue-600 hover:underline">전체 보기 →</Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {surveys.slice(0, 8).map(survey => {
              const totalOrders = survey.survey_orders.reduce((s, o) => s + o.count * o.unit_price, 0)
              const hasData = allComparisons.some(c => c.monthly_survey_id === survey.id)
              return (
                <Link
                  key={survey.id}
                  href={`/surveys/${survey.id}/select`}
                  className="bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-900">{survey.year}년 {survey.month}월</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[survey.status]}`}>
                      {STATUS_LABEL[survey.status]}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 space-y-0.5">
                    {hasData && <div className="text-blue-500">📊 비교 데이터 있음</div>}
                    {totalOrders > 0 && <div>발주 {(totalOrders / 10000).toFixed(0)}만원</div>}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

function ComparisonTable({
  title, subtitle, stats, labelKey, labelColorMap,
}: {
  title: string
  subtitle: string
  stats: ProductStat[]
  labelKey: 'telecom' | 'brand'
  labelColorMap: Record<string, string>
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/60 border-b border-gray-100 text-xs text-gray-500">
              <th className="text-left py-2.5 px-4 font-medium w-20">구분</th>
              <th className="text-left py-2.5 px-3 font-medium">상품명</th>
              <th className="text-center py-2.5 px-3 font-medium w-28">유리 / 전체</th>
              <th className="text-right py-2.5 px-3 font-medium w-28">평균 격차</th>
              <th className="text-left py-2.5 px-3 font-medium w-48">최약 경쟁사</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => {
              const label = labelKey === 'telecom' ? s.telecom : s.brand
              const labelColor = labelColorMap[label ?? ''] ?? 'bg-gray-100 text-gray-500'
              const rowColor = diffRowColor(s.avgDiff, s.behindCount, s.competitorCount)
              const total = s.aheadCount + s.behindCount

              return (
                <tr key={i} className={`border-b border-gray-50 ${rowColor}`}>
                  <td className="py-2.5 px-4">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${labelColor}`}>
                      {label}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-gray-800 text-xs leading-snug">{s.product_name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`text-xs font-semibold ${s.behindCount === 0 ? 'text-green-600' : s.behindCount === total ? 'text-red-600' : 'text-gray-600'}`}>
                      {s.aheadCount}/{total}
                    </span>
                    <span className="text-xs text-gray-300 ml-1">업체</span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      s.avgDiff > 0 ? 'bg-green-50 text-green-700' :
                      s.avgDiff < 0 ? 'bg-red-50 text-red-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {fmtDiff(s.avgDiff)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {s.worstDiff < 0 ? (
                      <span className="text-xs">
                        <span className="font-medium text-gray-700">{s.worstCompetitor}</span>
                        <span className="text-red-500 ml-1.5">{fmtDiff(s.worstDiff)}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-green-500">모두 우위</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
