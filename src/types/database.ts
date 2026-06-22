export type Category = 'tps' | 'usim' | 'appliance'
export type Company = 'easytask' | 'realcontact'
export type SurveyStatus = 'planning' | 'in_progress' | 'completed'
export type Telecom = 'SKB' | 'LGU+' | 'KT'
export type ProductType = '인터넷' | '인터넷+TV' | '유심+인터넷' | '유심+인터넷+TV'
export type ApplianceCategory = '정수기' | '공기청정기' | '비데' | '에어컨' | '음식물처리기' | '기타'

export interface Product {
  id: string
  category: Category
  name: string
  brand: string | null
  our_subsidy: number
  commission: number
  bad_debt: number
  score: number
  is_active: boolean
  // TPS / 유심
  telecom: Telecom | null
  product_type: ProductType | null
  has_usim_bundle: boolean
  usim_product: string | null
  // 가전
  model_number: string | null
  appliance_category: ApplianceCategory | null
  monthly_fee: number
  management_type: string | null
  // 선정 이력
  selection_count: number
  last_selected_year: number | null
  last_selected_month: number | null
  created_at: string
  updated_at: string
}

export interface MonthlySurvey {
  id: string
  year: number
  month: number
  status: SurveyStatus
  created_at: string
  updated_at: string
}

export interface SurveyOrder {
  id: string
  monthly_survey_id: string
  company: Company
  count: number
  unit_price: number
  advance_rate: number
  advance_paid: boolean
  balance_paid: boolean
  google_sheet_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SurveyItem {
  id: string
  monthly_survey_id: string
  product_id: string | null
  category: Category
  name: string
  brand: string | null
  our_subsidy_snapshot: number
  score_snapshot: number
  created_at: string
}

export interface SurveyResult {
  id: string
  survey_item_id: string
  company: Company
  competitor_subsidy: number
  notes: string | null
  created_at: string
  updated_at: string
}

// ── 상수 ──────────────────────────────────────────────────────────────────────

export const COMPANY_LABELS: Record<Company, string> = {
  easytask: '이지태스크',
  realcontact: '리얼컨택서비스',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  tps: 'TPS (인터넷)',
  usim: '유심',
  appliance: '가전',
}

export const TELECOM_LABELS: Record<Telecom, string> = {
  SKB: 'SK 브로드밴드',
  'LGU+': 'LG U+',
  KT: 'KT',
}

export const APPLIANCE_CATEGORIES: ApplianceCategory[] = [
  '정수기', '공기청정기', '비데', '에어컨', '음식물처리기', '기타',
]

export const COMPANY_CONFIG: Record<Company, { unitPrice: number; advanceRate: number }> = {
  easytask: { unitPrice: 5500, advanceRate: 0.5 },
  realcontact: { unitPrice: 13000, advanceRate: 0.8 },
}

export function calcOrder(count: number, company: Company) {
  const { unitPrice, advanceRate } = COMPANY_CONFIG[company]
  const total = count * unitPrice
  const advance = Math.round(total * advanceRate)
  const balance = total - advance
  return { total, advance, balance }
}

export function calcRoom(product: Pick<Product, 'commission' | 'our_subsidy' | 'bad_debt'>) {
  return product.commission - product.our_subsidy - product.bad_debt
}
