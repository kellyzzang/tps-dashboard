import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface CommissionItem {
  commission_key: string
  channel: string
  brand: string
  item_type: string
  current_commission: number
  daily_change: string
  max_commission: number
  min_commission: number
  history: Record<string, number>
}

export async function POST() {
  const gasEndpoint = process.env.COMMISSION_GAS_ENDPOINT
  if (!gasEndpoint) {
    return NextResponse.json(
      { error: 'COMMISSION_GAS_ENDPOINT 환경변수가 설정되지 않았습니다' },
      { status: 500 }
    )
  }

  try {
    const gasRes = await fetch(gasEndpoint, { cache: 'no-store' })
    if (!gasRes.ok) throw new Error(`GAS 요청 실패: ${gasRes.status}`)

    const { items, synced_at, error: gasError } = await gasRes.json()
    if (gasError) throw new Error(`GAS 오류: ${gasError}`)
    if (!Array.isArray(items)) throw new Error('잘못된 응답 형식')

    const records = (items as CommissionItem[]).map(item => ({
      ...item,
      updated_at: synced_at,
    }))

    const { error: upsertError } = await supabaseAdmin
      .from('commission_history')
      .upsert(records, { onConflict: 'commission_key,channel' })
    if (upsertError) throw upsertError

    // commission_key가 설정된 상품의 수수료 자동 업데이트
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, commission_key, commission_channel')
      .not('commission_key', 'is', null)
      .eq('is_active', true)

    let updatedProducts = 0
    for (const product of products ?? []) {
      const match = (items as CommissionItem[]).find(
        item =>
          item.commission_key === product.commission_key &&
          item.channel === (product.commission_channel || '백메가')
      )
      if (match) {
        await supabaseAdmin
          .from('products')
          .update({ commission: match.current_commission })
          .eq('id', product.id)
        updatedProducts++
      }
    }

    return NextResponse.json({
      success: true,
      total: items.length,
      updated_products: updatedProducts,
      synced_at,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
