import { supabase } from '@/lib/supabase'
import { CommissionsClient } from '@/components/CommissionsClient'
import { CommissionHistory } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function CommissionsPage() {
  const { data } = await supabase
    .from('commission_history')
    .select('*')
    .order('brand')
    .order('commission_key')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div>
          <h1 className="text-base font-bold text-gray-900">수수료 현황</h1>
          <p className="text-xs text-gray-400 mt-0.5">날짜별 TPS·유심 수수료 추이</p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6">
        <CommissionsClient initialData={(data ?? []) as CommissionHistory[]} />
      </main>
    </div>
  )
}
