import { supabase } from '@/lib/supabase'
import { CostCalculator } from '@/components/CostCalculator'
import { SurveySection } from '@/components/SurveySection'

export const dynamic = 'force-dynamic'

export default async function SurveysPage() {
  const { data: surveys } = await supabase
    .from('monthly_surveys')
    .select('*, survey_orders(*), survey_items(id, category)')
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(12)

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div>
          <h1 className="text-base font-bold text-gray-900">조사 관리</h1>
          <p className="text-xs text-gray-400 mt-0.5">월별 조사 생성 · 발주 · 정산</p>
        </div>
      </header>
      <main className="px-4 sm:px-6 py-6 space-y-6">
        <CostCalculator />
        <SurveySection initialSurveys={surveys ?? []} />
      </main>
    </div>
  )
}
