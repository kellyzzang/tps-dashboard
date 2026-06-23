import { supabase } from '@/lib/supabase'
import { ProductsClient } from '@/components/ProductsClient'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('score', { ascending: false })

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div>
          <h1 className="text-base font-bold text-gray-900">상품 관리</h1>
          <p className="text-xs text-gray-400 mt-0.5">TPS · 유심 · 가전 조사 대상 상품 등록 및 점수 관리</p>
        </div>
      </header>
      <main className="px-4 sm:px-6 py-6">
        <ProductsClient initialProducts={products ?? []} />
      </main>
    </div>
  )
}
