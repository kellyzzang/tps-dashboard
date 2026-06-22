import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const REDASH_KEY = process.env.REDASH_KEY_APPLIANCE_COMPETITOR!
const REDASH_URL = `${process.env.REDASH_BASE_URL}/api/queries/38/results`

export async function POST() {
  try {
    const res = await fetch(REDASH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${REDASH_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parameters: { row_limit: 5000 }, max_age: 3600 }),
    })

    const data = await res.json()
    const rows: Record<string, unknown>[] = data?.query_result?.data?.rows ?? []

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Redash 데이터를 가져오지 못했습니다.' }, { status: 502 })
    }

    // 기존 데이터 삭제
    await supabaseAdmin.from('competitor_subsidies').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // 자사 products 목록 가져와서 이름 매칭
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, name, model_number, brand')
      .eq('category', 'appliance')
      .eq('is_active', true)

    const productMap = new Map<string, string>() // model_number → id
    products?.forEach(p => {
      if (p.model_number) productMap.set(p.model_number.toLowerCase(), p.id)
    })

    const records = rows
      .filter(r => r['지원금'] !== null && r['지원금'] !== undefined)
      .map(r => {
        const modelNo = String(r['모델명'] ?? '').toLowerCase()
        const productId = productMap.get(modelNo) ?? null
        return {
          product_id: productId,
          category: r['제품 카테고리'] ? String(r['제품 카테고리']) : null,
          brand: r['브랜드명'] ? String(r['브랜드명']) : null,
          product_name: String(r['제품명'] ?? ''),
          model_number: r['모델명'] ? String(r['모델명']) : null,
          partner_name: r['파트너명'] ? String(r['파트너명']) : (r['파트너사'] ? String(r['파트너사']) : null),
          subsidy: Number(r['지원금'] ?? 0),
          management_type: r['관리방식'] ? String(r['관리방식']) : null,
        }
      })

    // 배치 insert (100개씩)
    let inserted = 0
    for (let i = 0; i < records.length; i += 100) {
      const batch = records.slice(i, i + 100)
      const { error } = await supabaseAdmin.from('competitor_subsidies').insert(batch)
      if (error) throw error
      inserted += batch.length
    }

    return NextResponse.json({
      success: true,
      total: rows.length,
      inserted,
      matched: records.filter(r => r.product_id).length,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
