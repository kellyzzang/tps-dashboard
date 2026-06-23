import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params
    const { items } = await req.json() as {
      items: {
        product_id: string
        category: string
        name: string
        brand: string | null
        our_subsidy_snapshot: number
        score_snapshot: number
      }[]
    }

    // 기존 아이템 중 새로 추가된 product_id 파악 (selection_count 증가 대상)
    const { data: existing } = await supabaseAdmin
      .from('survey_items')
      .select('product_id')
      .eq('monthly_survey_id', surveyId)

    const existingIds = new Set((existing ?? []).map(e => e.product_id).filter(Boolean))
    const newProductIds = items
      .map(i => i.product_id)
      .filter(id => id && !existingIds.has(id))

    // 기존 아이템 삭제 후 새로 삽입
    await supabaseAdmin.from('survey_items').delete().eq('monthly_survey_id', surveyId)

    if (items.length > 0) {
      const { error } = await supabaseAdmin.from('survey_items').insert(
        items.map(i => ({
          monthly_survey_id: surveyId,
          product_id: i.product_id || null,
          category: i.category,
          name: i.name,
          brand: i.brand || null,
          our_subsidy_snapshot: i.our_subsidy_snapshot,
          score_snapshot: i.score_snapshot,
        }))
      )
      if (error) throw error
    }

    // 조사 연/월 조회
    const { data: survey } = await supabaseAdmin
      .from('monthly_surveys')
      .select('year, month')
      .eq('id', surveyId)
      .single()

    if (survey) {
      // 신규 선정 상품: selection_count 증가 + last_selected 업데이트
      if (newProductIds.length > 0) {
        const { data: prods } = await supabaseAdmin
          .from('products')
          .select('id, selection_count')
          .in('id', newProductIds)

        for (const p of prods ?? []) {
          await supabaseAdmin
            .from('products')
            .update({
              selection_count: (p.selection_count ?? 0) + 1,
              last_selected_year: survey.year,
              last_selected_month: survey.month,
            })
            .eq('id', p.id)
        }
      }

      // 기존 선정 상품: last_selected만 업데이트
      const keepIds = items
        .map(i => i.product_id)
        .filter(id => id && existingIds.has(id))
      if (keepIds.length > 0) {
        await supabaseAdmin
          .from('products')
          .update({ last_selected_year: survey.year, last_selected_month: survey.month })
          .in('id', keepIds)
      }
    }

    return NextResponse.json({ success: true, count: items.length })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: surveyId } = await params
  const { data, error } = await supabaseAdmin
    .from('survey_items')
    .select('*')
    .eq('monthly_survey_id', surveyId)
    .order('category')
    .order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
