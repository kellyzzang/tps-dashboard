import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 실제 조사 시트 기준 TPS 상품 목록 (2026-06 확정)
const TPS_PRODUCTS = [
  // KT
  { telecom: 'KT',   name: '슬림 100',                            product_type: '인터넷'   },
  { telecom: 'KT',   name: '슬림 100 + 라이트 243채널',           product_type: '인터넷+TV' },
  { telecom: 'KT',   name: '베이직 500',                          product_type: '인터넷'   },
  { telecom: 'KT',   name: '베이직 500 + 라이트 243채널',         product_type: '인터넷+TV' },
  // LG U+
  { telecom: 'LGU+', name: '광랜안심 100',                        product_type: '인터넷'   },
  { telecom: 'LGU+', name: '광랜안심 100 + 기본형 223채널',       product_type: '인터넷+TV' },
  { telecom: 'LGU+', name: '기가슬림안심 500',                    product_type: '인터넷'   },
  { telecom: 'LGU+', name: '기가슬림안심 500 + 기본형 223채널',   product_type: '인터넷+TV' },
  // SK 브로드밴드
  { telecom: 'SKB',  name: '광랜 100 + 스탠다드 237채널',         product_type: '인터넷+TV', has_usim_bundle: true, usim_product: '5GX 레귤러' },
  { telecom: 'SKB',  name: '광랜 100 + 이코노미 183채널',         product_type: '인터넷+TV' },
  { telecom: 'SKB',  name: '기가라이트 500',                      product_type: '인터넷'   },
  { telecom: 'SKB',  name: '기가라이트 500 + 스탠다드 237채널',   product_type: '인터넷+TV', has_usim_bundle: true, usim_product: '5GX 레귤러' },
  { telecom: 'SKB',  name: '기가라이트 500 + 이코노미 183채널',   product_type: '인터넷+TV' },
  { telecom: 'SKB',  name: '기가 1000',                           product_type: '인터넷'   },
] as const

export async function POST() {
  try {
    // 기존 TPS 상품 비활성화
    await supabaseAdmin
      .from('products')
      .update({ is_active: false })
      .eq('category', 'tps')

    const records = TPS_PRODUCTS.map(p => ({
      category: 'tps' as const,
      name: p.name,
      telecom: p.telecom,
      product_type: p.product_type,
      commission: 0,
      our_subsidy: 0,
      bad_debt: 0,
      score: 50,
      is_active: true,
      has_usim_bundle: 'has_usim_bundle' in p ? p.has_usim_bundle : false,
      usim_product: 'usim_product' in p ? p.usim_product : null,
    }))

    const { error } = await supabaseAdmin.from('products').insert(records)
    if (error) throw error

    return NextResponse.json({
      success: true,
      inserted: records.length,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '알 수 없는 오류'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
