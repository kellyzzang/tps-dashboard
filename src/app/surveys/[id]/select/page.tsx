import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProductSelectionClient } from '@/components/ProductSelectionClient'
import { Product, SurveyItem, MonthlySurvey, CommissionHistory } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function SurveySelectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [surveyRes, productsRes, itemsRes, commissionRes] = await Promise.all([
    supabase.from('monthly_surveys').select('*').eq('id', id).single(),
    supabase.from('products').select('*').eq('is_active', true),
    supabase.from('survey_items').select('*').eq('monthly_survey_id', id),
    supabase.from('commission_history').select('*'),
  ])

  if (!surveyRes.data) notFound()

  const survey = surveyRes.data as MonthlySurvey
  const products = (productsRes.data ?? []) as Product[]
  const existingItems = (itemsRes.data ?? []) as SurveyItem[]

  const commissionData: Record<string, CommissionHistory> = {}
  for (const c of (commissionRes.data ?? []) as CommissionHistory[]) {
    commissionData[`${c.commission_key}::${c.channel}`] = c
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 shrink-0">
            ← 돌아가기
          </Link>
          <div className="w-px h-4 bg-gray-200 shrink-0" />
          <div>
            <h1 className="text-base font-bold text-gray-900">
              {survey.year}년 {survey.month}월 조사 상품 선정
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              체크된 상품이 이번 달 타사 조사 대상입니다
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <ProductSelectionClient
          survey={survey}
          products={products}
          existingItems={existingItems}
          commissionData={commissionData}
        />
      </main>
    </div>
  )
}
