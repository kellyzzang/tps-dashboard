'use client'

import { useState, useMemo } from 'react'
import { CommissionHistory } from '@/types/database'

function formatKRW(n: number) {
  return n.toLocaleString('ko-KR') + '원'
}

function formatMان(n: number) {
  return (n / 10000).toFixed(0) + '만'
}

function DailyChange({ change }: { change: string }) {
  if (!change || change === '-') return <span className="text-xs text-gray-300">-</span>
  const up = change.startsWith('▲')
  const down = change.startsWith('▼')
  if (!up && !down) return <span className="text-xs text-gray-300">-</span>
  const amount = Number(change.replace(/[▲▼\s]/g, ''))
  return (
    <span className={`text-xs font-medium ${up ? 'text-red-500' : 'text-blue-500'}`}>
      {up ? '▲' : '▼'}{amount.toLocaleString()}
    </span>
  )
}

const BRAND_STYLE: Record<string, string> = {
  LGU: 'bg-pink-100 text-pink-700',
  SKT: 'bg-orange-100 text-orange-700',
  SKB: 'bg-blue-100 text-blue-700',
  SK: 'bg-blue-100 text-blue-700',
  KT_I: 'bg-red-100 text-red-700',
  KT_SKY: 'bg-red-100 text-red-700',
  LG_HELLOVISION_I: 'bg-purple-100 text-purple-700',
  BTV: 'bg-orange-100 text-orange-700',
}

function getLastDates(history: Record<string, number>, n = 5) {
  return Object.entries(history)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-n)
    .map(([label, value]) => ({ label, value }))
}

export function CommissionsClient({ initialData }: { initialData: CommissionHistory[] }) {
  const [data] = useState<CommissionHistory[]>(initialData)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const [filterBrand, setFilterBrand] = useState('전체')
  const [filterChannel, setFilterChannel] = useState('전체')
  const [filterType, setFilterType] = useState('전체')

  const brands = useMemo(() => ['전체', ...Array.from(new Set(data.map(d => d.brand))).sort()], [data])
  const channels = useMemo(() => ['전체', ...Array.from(new Set(data.map(d => d.channel)))], [data])
  const itemTypes = useMemo(() => ['전체', ...Array.from(new Set(data.map(d => d.item_type))).sort()], [data])

  const filtered = useMemo(() => data.filter(d => {
    if (filterBrand !== '전체' && d.brand !== filterBrand) return false
    if (filterChannel !== '전체' && d.channel !== filterChannel) return false
    if (filterType !== '전체' && d.item_type !== filterType) return false
    return true
  }), [data, filterBrand, filterChannel, filterType])

  const lastSync = data.length > 0
    ? new Date(data[0].updated_at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null

  async function handleSync() {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res = await fetch('/api/sync/commission', { method: 'POST' })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setSyncMsg(`✓ ${json.total}개 항목 동기화 완료 · 상품 ${json.updated_products}개 수수료 업데이트`)
      window.location.reload()
    } catch (e) {
      setSyncMsg(`오류: ${e instanceof Error ? e.message : '알 수 없는 오류'}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 툴바 */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}
            className="text-xs rounded-lg border border-gray-200 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
            {brands.map(b => <option key={b} value={b}>{b === '전체' ? '전체 브랜드' : b}</option>)}
          </select>
          <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)}
            className="text-xs rounded-lg border border-gray-200 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
            {channels.map(c => <option key={c} value={c}>{c === '전체' ? '전체 접수처' : c}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="text-xs rounded-lg border border-gray-200 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
            {itemTypes.map(t => <option key={t} value={t}>{t === '전체' ? '전체 구분' : t}</option>)}
          </select>
          <span className="text-xs text-gray-400">{filtered.length}개</span>
        </div>
        <div className="flex items-center gap-3">
          {lastSync && <span className="text-xs text-gray-400">동기화: {lastSync}</span>}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {syncing ? '동기화 중...' : '↻ 수수료 동기화'}
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className={`px-4 py-2 rounded-lg text-xs ${syncMsg.startsWith('✓') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          {syncMsg}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <p className="text-sm text-gray-400 mb-3">
            {data.length === 0 ? '수수료 데이터가 없습니다' : '조건에 맞는 항목이 없습니다'}
          </p>
          {data.length === 0 && (
            <button onClick={handleSync} className="text-xs text-blue-600 hover:underline">
              지금 동기화하기
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500">
                  <th className="text-left py-2.5 px-4 font-medium whitespace-nowrap">브랜드</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">구분</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">키값</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">접수처</th>
                  <th className="text-right py-2.5 px-3 font-medium whitespace-nowrap">현재 수수료</th>
                  <th className="text-center py-2.5 px-3 font-medium whitespace-nowrap">전일대비</th>
                  <th className="text-right py-2.5 px-3 font-medium whitespace-nowrap">최대</th>
                  <th className="text-right py-2.5 px-3 font-medium whitespace-nowrap">최소</th>
                  <th className="text-left py-2.5 px-4 font-medium whitespace-nowrap">최근 추이 (5일)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const lastDates = getLastDates(item.history, 5)
                  const commClass =
                    item.current_commission >= 700000 ? 'text-green-700 font-bold' :
                    item.current_commission >= 400000 ? 'text-blue-700 font-semibold' :
                    'text-gray-700 font-semibold'

                  return (
                    <tr key={`${item.commission_key}-${item.channel}`}
                        className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 px-4">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${BRAND_STYLE[item.brand] ?? 'bg-gray-100 text-gray-600'}`}>
                          {item.brand}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-gray-600 whitespace-nowrap">{item.item_type}</td>
                      <td className="py-2.5 px-3 text-xs font-mono text-gray-700">{item.commission_key}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          item.channel === '백메가' ? 'bg-sky-50 text-sky-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                          {item.channel}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right ${commClass}`}>
                        {formatKRW(item.current_commission)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <DailyChange change={item.daily_change} />
                      </td>
                      <td className="py-2.5 px-3 text-right text-xs text-gray-400">
                        {formatMان(item.max_commission)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-xs text-gray-400">
                        {formatMان(item.min_commission)}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          {lastDates.map(({ label, value }, idx) => {
                            const prev = idx > 0 ? lastDates[idx - 1].value : value
                            const isLatest = idx === lastDates.length - 1
                            const trendColor = value > prev ? 'text-red-400' : value < prev ? 'text-blue-400' : 'text-gray-300'
                            return (
                              <span
                                key={label}
                                title={`${label}: ${formatKRW(value)}`}
                                className={`text-xs ${isLatest ? `font-semibold ${trendColor}` : 'text-gray-300'}`}
                              >
                                {formatMان(value)}
                              </span>
                            )
                          })}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
