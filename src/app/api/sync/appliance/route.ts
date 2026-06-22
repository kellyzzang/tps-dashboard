import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const REDASH_API_KEY = '9AxFRTvOed4SjpMA7g9rwDi8mCmr5g1txTLr5v7I'
const REDASH_QUERY_URL = 'https://redash.turn.rentre.kr/api/queries/36/results'

export async function POST() {
  try {
    // 1. Redash에서 가전 데이터 가져오기
    const redashRes = await fetch(REDASH_QUERY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${REDASH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parameters: { row_limit: 5000 }, max_age: 3600 }),
    })

    if (!redashRes.ok) throw new Error(`Redash error: ${redashRes.status}`)
    const redashData = await redashRes.json()
    const rows: Record<string, unknown>[] = redashData?.query_result?.data?.rows ?? []

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Redash에서 데이터를 가져오지 못했습니다.' }, { status: 502 })
    }

    // 2. 더블체크 파트너스(렌트리) 데이터 있는 행만 필터
    const validRows = rows.filter(r =>
      r['더블체크 파트너스_지원금'] !== null &&
      r['더블체크 파트너스_예상매출'] !== null &&
      r['브랜드'] && r['제품명']
    )

    // 3. products 테이블 upsert할 데이터 매핑
    const products = validRows.map(r => ({
      category: 'appliance' as const,
      name: String(r['제품명'] ?? ''),
      brand: r['브랜드'] ? String(r['브랜드']) : null,
      appliance_category: r['카테고리'] ? String(r['카테고리']) : null,
      model_number: r['모델명'] ? String(r['모델명']) : null,
      management_type: r['관리방식'] ? String(r['관리방식']) : null,
      monthly_fee: Number(r['예상월렌탈료(어드민)'] ?? 0),
      commission: Number(r['더블체크 파트너스_예상매출'] ?? 0),
      our_subsidy: Number(r['더블체크 파트너스_지원금'] ?? 0),
      bad_debt: Number(r['더블체크 파트너스_예상대손'] ?? 0),
      score: 50,
      is_active: true,
    }))

    // 4. 기존 가전 상품 비활성화 후 upsert
    await supabaseAdmin
      .from('products')
      .update({ is_active: false })
      .eq('category', 'appliance')

    // 5. 배치로 insert (100개씩)
    let inserted = 0
    for (let i = 0; i < products.length; i += 100) {
      const batch = products.slice(i, i + 100)
      const { error } = await supabaseAdmin.from('products').insert(batch)
      if (error) throw error
      inserted += batch.length
    }

    return NextResponse.json({
      success: true,
      total: rows.length,
      filtered: validRows.length,
      inserted,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
