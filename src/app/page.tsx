import { supabase } from '@/lib/supabase'
import { CostCalculator } from '@/components/CostCalculator'
import { SurveySection } from '@/components/SurveySection'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data: surveys } = await supabase
    .from('monthly_surveys')
    .select(`*, survey_orders (*)`)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(12)

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">렌트리 TPS 대시보드</h1>
            <p className="text-xs text-gray-400 mt-0.5">타사 지원금 조사 비용 관리</p>
          </div>
          <nav className="flex gap-3">
            <a href="/products" className="text-sm text-gray-500 hover:text-blue-600 font-medium">상품 관리</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <CostCalculator />
        <SurveySection initialSurveys={surveys ?? []} />
      </main>
    </div>
  )
}
