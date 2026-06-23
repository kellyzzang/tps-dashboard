import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type SeedRow = {
  year: number
  month: number
  category: 'tps' | 'appliance'
  telecom?: string
  brand?: string
  product_name: string
  competitor_name: string
  easytask_diff: number | null
  realcontact_diff: number | null
}

// 값 = 렌트리 지원금 - 경쟁사 지원금 (양수=렌트리 우위, 음수=경쟁사 우위)
const SEED_DATA: SeedRow[] = [
  // ── 4월 인터넷 (18행) ─────────────────────────────────────────────────────
  { year:2026,month:4,category:'tps',telecom:'KT',    product_name:'슬림 100 + 라이트 243채널',          competitor_name:'미소',     easytask_diff:50000,   realcontact_diff:290000  },
  { year:2026,month:4,category:'tps',telecom:'KT',    product_name:'베이직 500 + 라이트 243채널',         competitor_name:'미소',     easytask_diff:40000,   realcontact_diff:20000   },
  { year:2026,month:4,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 기본형 223채널',    competitor_name:'미소',     easytask_diff:350000,  realcontact_diff:80000   },
  { year:2026,month:4,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'미소',     easytask_diff:260000,  realcontact_diff:120000  },
  { year:2026,month:4,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 스탠다드 237채널',   competitor_name:'미소',     easytask_diff:null,    realcontact_diff:151500  },
  { year:2026,month:4,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 스탠다드 237채널',         competitor_name:'미소',     easytask_diff:null,    realcontact_diff:231500  },

  { year:2026,month:4,category:'tps',telecom:'KT',    product_name:'슬림 100 + 라이트 243채널',          competitor_name:'백메가',   easytask_diff:180000,  realcontact_diff:180000  },
  { year:2026,month:4,category:'tps',telecom:'KT',    product_name:'베이직 500 + 라이트 243채널',         competitor_name:'백메가',   easytask_diff:170000,  realcontact_diff:350000  },
  { year:2026,month:4,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 기본형 223채널',    competitor_name:'백메가',   easytask_diff:260000,  realcontact_diff:230000  },
  { year:2026,month:4,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'백메가',   easytask_diff:250000,  realcontact_diff:120000  },
  { year:2026,month:4,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 스탠다드 237채널',   competitor_name:'백메가',   easytask_diff:null,    realcontact_diff:340000  },
  { year:2026,month:4,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 스탠다드 237채널',         competitor_name:'백메가',   easytask_diff:null,    realcontact_diff:130000  },

  { year:2026,month:4,category:'tps',telecom:'KT',    product_name:'슬림 100 + 라이트 243채널',          competitor_name:'아정당',   easytask_diff:null,    realcontact_diff:-40000  },
  { year:2026,month:4,category:'tps',telecom:'KT',    product_name:'베이직 500 + 라이트 243채널',         competitor_name:'아정당',   easytask_diff:null,    realcontact_diff:400000  },
  { year:2026,month:4,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 기본형 223채널',    competitor_name:'아정당',   easytask_diff:null,    realcontact_diff:300000  },
  { year:2026,month:4,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'아정당',   easytask_diff:null,    realcontact_diff:310000  },
  { year:2026,month:4,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 스탠다드 237채널',   competitor_name:'아정당',   easytask_diff:null,    realcontact_diff:90000   },
  { year:2026,month:4,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 스탠다드 237채널',         competitor_name:'아정당',   easytask_diff:null,    realcontact_diff:300000  },

  // ── 5월 인터넷 (96행) ─────────────────────────────────────────────────────
  // 모요
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'모요',     easytask_diff:30000,   realcontact_diff:50000   },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500 + 라이트 243채널',         competitor_name:'모요',     easytask_diff:50000,   realcontact_diff:-10000  },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'슬림 100 + 라이트 243채널',          competitor_name:'모요',     easytask_diff:470000,  realcontact_diff:100000  },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'에센스 1000',                         competitor_name:'모요',     easytask_diff:190000,  realcontact_diff:10000   },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 기본형 223채널',        competitor_name:'모요',     easytask_diff:null,    realcontact_diff:100000  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'모요',     easytask_diff:210000,  realcontact_diff:240000  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 기본형 223채널',    competitor_name:'모요',     easytask_diff:90000,   realcontact_diff:-10000  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가안심 1000',                       competitor_name:'모요',     easytask_diff:null,    realcontact_diff:-120000 },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 스탠다드 237채널',         competitor_name:'모요',     easytask_diff:60000,   realcontact_diff:110000  },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가 1000',                           competitor_name:'모요',     easytask_diff:90000,   realcontact_diff:120000  },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'모요',     easytask_diff:130000,  realcontact_diff:100000  },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 스탠다드 237채널',   competitor_name:'모요',     easytask_diff:110000,  realcontact_diff:110000  },
  // 미소
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'미소',     easytask_diff:-10000,  realcontact_diff:70000   },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500 + 라이트 243채널',         competitor_name:'미소',     easytask_diff:20000,   realcontact_diff:100000  },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'슬림 100 + 라이트 243채널',          competitor_name:'미소',     easytask_diff:100000,  realcontact_diff:60000   },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'에센스 1000',                         competitor_name:'미소',     easytask_diff:-260000, realcontact_diff:10000   },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 기본형 223채널',        competitor_name:'미소',     easytask_diff:-50000,  realcontact_diff:100000  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'미소',     easytask_diff:-20000,  realcontact_diff:110000  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 기본형 223채널',    competitor_name:'미소',     easytask_diff:-10000,  realcontact_diff:230000  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가안심 1000',                       competitor_name:'미소',     easytask_diff:20000,   realcontact_diff:100000  },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 스탠다드 237채널',         competitor_name:'미소',     easytask_diff:20000,   realcontact_diff:20000   },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가 1000',                           competitor_name:'미소',     easytask_diff:20000,   realcontact_diff:10000   },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'미소',     easytask_diff:70000,   realcontact_diff:70000   },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 스탠다드 237채널',   competitor_name:'미소',     easytask_diff:50000,   realcontact_diff:40000   },
  // 백메가
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'백메가',   easytask_diff:30000,   realcontact_diff:-20000  },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500 + 라이트 243채널',         competitor_name:'백메가',   easytask_diff:100000,  realcontact_diff:50000   },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'슬림 100 + 라이트 243채널',          competitor_name:'백메가',   easytask_diff:-130000, realcontact_diff:100000  },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'에센스 1000',                         competitor_name:'백메가',   easytask_diff:-30000,  realcontact_diff:-30000  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 기본형 223채널',        competitor_name:'백메가',   easytask_diff:100000,  realcontact_diff:30000   },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'백메가',   easytask_diff:0,       realcontact_diff:110000  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 기본형 223채널',    competitor_name:'백메가',   easytask_diff:30000,   realcontact_diff:120000  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가안심 1000',                       competitor_name:'백메가',   easytask_diff:100000,  realcontact_diff:-20000  },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 스탠다드 237채널',         competitor_name:'백메가',   easytask_diff:130000,  realcontact_diff:80000   },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가 1000',                           competitor_name:'백메가',   easytask_diff:20000,   realcontact_diff:20000   },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'백메가',   easytask_diff:50000,   realcontact_diff:30000   },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 스탠다드 237채널',   competitor_name:'백메가',   easytask_diff:80000,   realcontact_diff:110000  },
  // 뽐뿌
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'뽐뿌',     easytask_diff:70000,   realcontact_diff:70000   },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500 + 라이트 243채널',         competitor_name:'뽐뿌',     easytask_diff:40000,   realcontact_diff:-420000 },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'슬림 100 + 라이트 243채널',          competitor_name:'뽐뿌',     easytask_diff:-110000, realcontact_diff:-90000  },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'에센스 1000',                         competitor_name:'뽐뿌',     easytask_diff:-10000,  realcontact_diff:10000   },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 기본형 223채널',        competitor_name:'뽐뿌',     easytask_diff:-100000, realcontact_diff:100000  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'뽐뿌',     easytask_diff:60000,   realcontact_diff:-76300  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 기본형 223채널',    competitor_name:'뽐뿌',     easytask_diff:120000,  realcontact_diff:-50000  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가안심 1000',                       competitor_name:'뽐뿌',     easytask_diff:-106300, realcontact_diff:-70000  },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 스탠다드 237채널',         competitor_name:'뽐뿌',     easytask_diff:480000,  realcontact_diff:60000   },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가 1000',                           competitor_name:'뽐뿌',     easytask_diff:100000,  realcontact_diff:100000  },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'뽐뿌',     easytask_diff:10000,   realcontact_diff:-20000  },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 스탠다드 237채널',   competitor_name:'뽐뿌',     easytask_diff:110000,  realcontact_diff:110000  },
  // 숨고
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'숨고',     easytask_diff:-46000,  realcontact_diff:-70000  },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500 + 라이트 243채널',         competitor_name:'숨고',     easytask_diff:-56200,  realcontact_diff:-160000 },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'슬림 100 + 라이트 243채널',          competitor_name:'숨고',     easytask_diff:-30000,  realcontact_diff:-150000 },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'에센스 1000',                         competitor_name:'숨고',     easytask_diff:-170000, realcontact_diff:-80000  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 기본형 223채널',        competitor_name:'숨고',     easytask_diff:-146100, realcontact_diff:-150000 },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'숨고',     easytask_diff:-60000,  realcontact_diff:-46300  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 기본형 223채널',    competitor_name:'숨고',     easytask_diff:-40000,  realcontact_diff:-90000  },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가안심 1000',                       competitor_name:'숨고',     easytask_diff:-96300,  realcontact_diff:-70000  },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 스탠다드 237채널',         competitor_name:'숨고',     easytask_diff:210000,  realcontact_diff:130000  },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가 1000',                           competitor_name:'숨고',     easytask_diff:-330000, realcontact_diff:-30000  },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'숨고',     easytask_diff:-90000,  realcontact_diff:-40000  },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 스탠다드 237채널',   competitor_name:'숨고',     easytask_diff:-190000, realcontact_diff:-10000  },
  // 아정당
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'아정당',   easytask_diff:-240000, realcontact_diff:20000   },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500 + 라이트 243채널',         competitor_name:'아정당',   easytask_diff:100000,  realcontact_diff:100000  },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'슬림 100 + 라이트 243채널',          competitor_name:'아정당',   easytask_diff:null,    realcontact_diff:50000   },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'에센스 1000',                         competitor_name:'아정당',   easytask_diff:null,    realcontact_diff:0       },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 기본형 223채널',        competitor_name:'아정당',   easytask_diff:-50000,  realcontact_diff:50000   },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'아정당',   easytask_diff:-130000, realcontact_diff:-130000 },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 기본형 223채널',    competitor_name:'아정당',   easytask_diff:140000,  realcontact_diff:70000   },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가안심 1000',                       competitor_name:'아정당',   easytask_diff:50000,   realcontact_diff:50000   },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 스탠다드 237채널',         competitor_name:'아정당',   easytask_diff:-30000,  realcontact_diff:-50000  },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가 1000',                           competitor_name:'아정당',   easytask_diff:-50000,  realcontact_diff:50000   },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'아정당',   easytask_diff:60000,   realcontact_diff:60000   },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 스탠다드 237채널',   competitor_name:'아정당',   easytask_diff:40000,   realcontact_diff:-10000  },
  // 인터넷끝판왕
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'인터넷끝판왕', easytask_diff:-80000,  realcontact_diff:70000 },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500 + 라이트 243채널',         competitor_name:'인터넷끝판왕', easytask_diff:-130000, realcontact_diff:0     },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'슬림 100 + 라이트 243채널',          competitor_name:'인터넷끝판왕', easytask_diff:70000,   realcontact_diff:70000 },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'에센스 1000',                         competitor_name:'인터넷끝판왕', easytask_diff:-10000,  realcontact_diff:40000 },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 기본형 223채널',        competitor_name:'인터넷끝판왕', easytask_diff:40000,   realcontact_diff:40000 },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'인터넷끝판왕', easytask_diff:70000,   realcontact_diff:90000 },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 기본형 223채널',    competitor_name:'인터넷끝판왕', easytask_diff:60000,   realcontact_diff:90000 },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가안심 1000',                       competitor_name:'인터넷끝판왕', easytask_diff:60000,   realcontact_diff:30000 },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 스탠다드 237채널',         competitor_name:'인터넷끝판왕', easytask_diff:130000,  realcontact_diff:10000 },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가 1000',                           competitor_name:'인터넷끝판왕', easytask_diff:120000,  realcontact_diff:100000},
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'인터넷끝판왕', easytask_diff:80000,   realcontact_diff:110000},
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 스탠다드 237채널',   competitor_name:'인터넷끝판왕', easytask_diff:60000,   realcontact_diff:-20000},
  // 인터넷비교원
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'인터넷비교원', easytask_diff:50000,   realcontact_diff:10000 },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'베이직 500 + 라이트 243채널',         competitor_name:'인터넷비교원', easytask_diff:-70000,  realcontact_diff:-70000},
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'슬림 100 + 라이트 243채널',          competitor_name:'인터넷비교원', easytask_diff:20000,   realcontact_diff:40000 },
  { year:2026,month:5,category:'tps',telecom:'KT',    product_name:'에센스 1000',                         competitor_name:'인터넷비교원', easytask_diff:-30000,  realcontact_diff:0     },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 기본형 223채널',        competitor_name:'인터넷비교원', easytask_diff:47800,   realcontact_diff:10000 },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'인터넷비교원', easytask_diff:80000,   realcontact_diff:110000},
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 기본형 223채널',    competitor_name:'인터넷비교원', easytask_diff:30000,   realcontact_diff:0     },
  { year:2026,month:5,category:'tps',telecom:'LGU+',  product_name:'기가안심 1000',                       competitor_name:'인터넷비교원', easytask_diff:30000,   realcontact_diff:0     },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 스탠다드 237채널',         competitor_name:'인터넷비교원', easytask_diff:150000,  realcontact_diff:180000},
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가 1000',                           competitor_name:'인터넷비교원', easytask_diff:40000,   realcontact_diff:70000 },
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'인터넷비교원', easytask_diff:100000,  realcontact_diff:100000},
  { year:2026,month:5,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 스탠다드 237채널',   competitor_name:'인터넷비교원', easytask_diff:60000,   realcontact_diff:40000 },

  // ── 5월 가전 (48행) ───────────────────────────────────────────────────────
  // 미소
  { year:2026,month:5,category:'appliance',brand:'LG',         product_name:'퓨리케어 오브제컬렉션 냉온정 얼음정수기',    competitor_name:'미소', easytask_diff:-220000, realcontact_diff:40000  },
  { year:2026,month:5,category:'appliance',brand:'LG',         product_name:'퓨리케어 오브제컬렉션 냉온정 정수기(맞춤출수)', competitor_name:'미소', easytask_diff:-80000,  realcontact_diff:100000 },
  { year:2026,month:5,category:'appliance',brand:'SK인텔릭스', product_name:'원코크 플러스 얼음물 정수기',               competitor_name:'미소', easytask_diff:-130000, realcontact_diff:0      },
  { year:2026,month:5,category:'appliance',brand:'SK인텔릭스', product_name:'초소형 플러스 직수 냉온정 정수기',           competitor_name:'미소', easytask_diff:-60000,  realcontact_diff:0      },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'스퀘어핏 공기청정기 15평형',                competitor_name:'미소', easytask_diff:-10000,  realcontact_diff:60000  },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'노블2 공기청정기 20평형',                   competitor_name:'미소', easytask_diff:-90000,  realcontact_diff:-90000 },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'더매너 비데 플러스',                        competitor_name:'미소', easytask_diff:-80000,  realcontact_diff:80000  },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'아이콘 미니 냉온정 얼음정수기',              competitor_name:'미소', easytask_diff:160000,  realcontact_diff:-110000},
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'아이콘 프로 정수기',                        competitor_name:'미소', easytask_diff:40000,   realcontact_diff:-90000 },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'아이콘2 냉온정 정수기',                     competitor_name:'미소', easytask_diff:40000,   realcontact_diff:-80000 },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'아이콘3 냉온정 정수기',                     competitor_name:'미소', easytask_diff:-70000,  realcontact_diff:-20000 },
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 공기청정기 28평형',                 competitor_name:'미소', easytask_diff:-10000,  realcontact_diff:-10000 },
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 트리플케어8 비데',                  competitor_name:'미소', easytask_diff:null,    realcontact_diff:20000  },
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'스팀100 끓인물 정수기',                     competitor_name:'미소', easytask_diff:null,    realcontact_diff:-40000 },
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 미니100 초소형 냉온정 정수기',      competitor_name:'미소', easytask_diff:100000,  realcontact_diff:-50000 },
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'제로 100 슬림 플러스 냉온정 얼음정수기',    competitor_name:'미소', easytask_diff:-90000,  realcontact_diff:-90000 },
  // 뽐뿌
  { year:2026,month:5,category:'appliance',brand:'LG',         product_name:'퓨리케어 오브제컬렉션 냉온정 얼음정수기',    competitor_name:'뽐뿌', easytask_diff:-150000, realcontact_diff:-150000},
  { year:2026,month:5,category:'appliance',brand:'LG',         product_name:'퓨리케어 오브제컬렉션 냉온정 정수기(맞춤출수)', competitor_name:'뽐뿌', easytask_diff:0,       realcontact_diff:0      },
  { year:2026,month:5,category:'appliance',brand:'SK인텔릭스', product_name:'원코크 플러스 얼음물 정수기',               competitor_name:'뽐뿌', easytask_diff:-130000, realcontact_diff:-150000},
  { year:2026,month:5,category:'appliance',brand:'SK인텔릭스', product_name:'초소형 플러스 직수 냉온정 정수기',           competitor_name:'뽐뿌', easytask_diff:-120000, realcontact_diff:-120000},
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'스퀘어핏 공기청정기 15평형',                competitor_name:'뽐뿌', easytask_diff:-60000,  realcontact_diff:-60000 },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'노블2 공기청정기 20평형',                   competitor_name:'뽐뿌', easytask_diff:-130000, realcontact_diff:-110000},
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'더매너 비데 플러스',                        competitor_name:'뽐뿌', easytask_diff:0,       realcontact_diff:-40000 },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'아이콘 미니 냉온정 얼음정수기',              competitor_name:'뽐뿌', easytask_diff:-110000, realcontact_diff:-110000},
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'아이콘 프로 정수기',                        competitor_name:'뽐뿌', easytask_diff:null,    realcontact_diff:-70000 },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'아이콘2 냉온정 정수기',                     competitor_name:'뽐뿌', easytask_diff:null,    realcontact_diff:-60000 },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'아이콘3 냉온정 정수기',                     competitor_name:'뽐뿌', easytask_diff:-60000,  realcontact_diff:-60000 },
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 공기청정기 28평형',                 competitor_name:'뽐뿌', easytask_diff:-50000,  realcontact_diff:-60000 },
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 트리플케어8 비데',                  competitor_name:'뽐뿌', easytask_diff:null,    realcontact_diff:-20000 },
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'스팀100 끓인물 정수기',                     competitor_name:'뽐뿌', easytask_diff:null,    realcontact_diff:-100000},
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 미니100 초소형 냉온정 정수기',      competitor_name:'뽐뿌', easytask_diff:-120000, realcontact_diff:-90000 },
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'제로 100 슬림 플러스 냉온정 얼음정수기',    competitor_name:'뽐뿌', easytask_diff:-150000, realcontact_diff:-120000},
  // 아정당
  { year:2026,month:5,category:'appliance',brand:'LG',         product_name:'퓨리케어 오브제컬렉션 냉온정 얼음정수기',    competitor_name:'아정당', easytask_diff:10000,  realcontact_diff:10000  },
  { year:2026,month:5,category:'appliance',brand:'LG',         product_name:'퓨리케어 오브제컬렉션 냉온정 정수기(맞춤출수)', competitor_name:'아정당', easytask_diff:90000,  realcontact_diff:-60000 },
  { year:2026,month:5,category:'appliance',brand:'SK인텔릭스', product_name:'원코크 플러스 얼음물 정수기',               competitor_name:'아정당', easytask_diff:40000,  realcontact_diff:90000  },
  { year:2026,month:5,category:'appliance',brand:'SK인텔릭스', product_name:'초소형 플러스 직수 냉온정 정수기',           competitor_name:'아정당', easytask_diff:70000,  realcontact_diff:320000 },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'스퀘어핏 공기청정기 15평형',                competitor_name:'아정당', easytask_diff:60000,  realcontact_diff:60000  },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'노블2 공기청정기 20평형',                   competitor_name:'아정당', easytask_diff:40000,  realcontact_diff:0      },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'더매너 비데 플러스',                        competitor_name:'아정당', easytask_diff:100000, realcontact_diff:70000  },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'아이콘 미니 냉온정 얼음정수기',              competitor_name:'아정당', easytask_diff:110000, realcontact_diff:60000  },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'아이콘 프로 정수기',                        competitor_name:'아정당', easytask_diff:40000,  realcontact_diff:40000  },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'아이콘2 냉온정 정수기',                     competitor_name:'아정당', easytask_diff:50000,  realcontact_diff:50000  },
  { year:2026,month:5,category:'appliance',brand:'코웨이',      product_name:'아이콘3 냉온정 정수기',                     competitor_name:'아정당', easytask_diff:40000,  realcontact_diff:40000  },
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 공기청정기 28평형',                 competitor_name:'아정당', easytask_diff:20000,  realcontact_diff:20000  },
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 트리플케어8 비데',                  competitor_name:'아정당', easytask_diff:100000, realcontact_diff:40000  },
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'스팀100 끓인물 정수기',                     competitor_name:'아정당', easytask_diff:120000, realcontact_diff:100000 },
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 미니100 초소형 냉온정 정수기',      competitor_name:'아정당', easytask_diff:null,   realcontact_diff:120000 },
  { year:2026,month:5,category:'appliance',brand:'쿠쿠',        product_name:'제로 100 슬림 플러스 냉온정 얼음정수기',    competitor_name:'아정당', easytask_diff:null,   realcontact_diff:120000 },

  // ── 6월 인터넷 (96행) ─────────────────────────────────────────────────────
  // 모요
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'모요',     easytask_diff:40000,   realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500 + 베이직 238채널',         competitor_name:'모요',     easytask_diff:30000,   realcontact_diff:90000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100',                            competitor_name:'모요',     easytask_diff:30000,   realcontact_diff:80000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100 + 베이직 238채널',           competitor_name:'모요',     easytask_diff:120000,  realcontact_diff:180000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100',                        competitor_name:'모요',     easytask_diff:250000,  realcontact_diff:210000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 실속형 217채널',        competitor_name:'모요',     easytask_diff:250000,  realcontact_diff:350000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'모요',     easytask_diff:250000,  realcontact_diff:200000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 실속형 217채널',    competitor_name:'모요',     easytask_diff:240000,  realcontact_diff:40000  },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100',                            competitor_name:'모요',     easytask_diff:70000,   realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 이코노미 183채널',          competitor_name:'모요',     easytask_diff:80000,   realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'모요',     easytask_diff:120000,  realcontact_diff:120000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 이코노미 183채널',    competitor_name:'모요',     easytask_diff:80000,   realcontact_diff:100000 },
  // 미소
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'미소',     easytask_diff:40000,   realcontact_diff:80000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500 + 베이직 238채널',         competitor_name:'미소',     easytask_diff:50000,   realcontact_diff:90000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100',                            competitor_name:'미소',     easytask_diff:80000,   realcontact_diff:40000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100 + 베이직 238채널',           competitor_name:'미소',     easytask_diff:180000,  realcontact_diff:80000  },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100',                        competitor_name:'미소',     easytask_diff:60000,   realcontact_diff:60000  },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 실속형 217채널',        competitor_name:'미소',     easytask_diff:60000,   realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'미소',     easytask_diff:80000,   realcontact_diff:120000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 실속형 217채널',    competitor_name:'미소',     easytask_diff:80000,   realcontact_diff:120000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100',                            competitor_name:'미소',     easytask_diff:90000,   realcontact_diff:50000  },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 이코노미 183채널',          competitor_name:'미소',     easytask_diff:50000,   realcontact_diff:40000  },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'미소',     easytask_diff:60000,   realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 이코노미 183채널',    competitor_name:'미소',     easytask_diff:40000,   realcontact_diff:80000  },
  // 백메가
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'백메가',   easytask_diff:40000,   realcontact_diff:120000 },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500 + 베이직 238채널',         competitor_name:'백메가',   easytask_diff:30000,   realcontact_diff:90000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100',                            competitor_name:'백메가',   easytask_diff:80000,   realcontact_diff:110000 },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100 + 베이직 238채널',           competitor_name:'백메가',   easytask_diff:180000,  realcontact_diff:180000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100',                        competitor_name:'백메가',   easytask_diff:100000,  realcontact_diff:40000  },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 실속형 217채널',        competitor_name:'백메가',   easytask_diff:100000,  realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'백메가',   easytask_diff:10000,   realcontact_diff:120000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 실속형 217채널',    competitor_name:'백메가',   easytask_diff:-10000,  realcontact_diff:120000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100',                            competitor_name:'백메가',   easytask_diff:60000,   realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 이코노미 183채널',          competitor_name:'백메가',   easytask_diff:20000,   realcontact_diff:-20000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'백메가',   easytask_diff:-10000,  realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 이코노미 183채널',    competitor_name:'백메가',   easytask_diff:40000,   realcontact_diff:0      },
  // 뽐뿌
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'뽐뿌',     easytask_diff:80000,   realcontact_diff:-70000 },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500 + 베이직 238채널',         competitor_name:'뽐뿌',     easytask_diff:-30000,  realcontact_diff:-40000 },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100',                            competitor_name:'뽐뿌',     easytask_diff:10000,   realcontact_diff:10000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100 + 베이직 238채널',           competitor_name:'뽐뿌',     easytask_diff:10000,   realcontact_diff:-110000},
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100',                        competitor_name:'뽐뿌',     easytask_diff:-30000,  realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 실속형 217채널',        competitor_name:'뽐뿌',     easytask_diff:-130000, realcontact_diff:-100000},
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'뽐뿌',     easytask_diff:20000,   realcontact_diff:20000  },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 실속형 217채널',    competitor_name:'뽐뿌',     easytask_diff:90000,   realcontact_diff:-70000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100',                            competitor_name:'뽐뿌',     easytask_diff:100000,  realcontact_diff:-30000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 이코노미 183채널',          competitor_name:'뽐뿌',     easytask_diff:60000,   realcontact_diff:-20000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'뽐뿌',     easytask_diff:100000,  realcontact_diff:30000  },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 이코노미 183채널',    competitor_name:'뽐뿌',     easytask_diff:80000,   realcontact_diff:0      },
  // 숨고
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'숨고',     easytask_diff:-20000,  realcontact_diff:-60000 },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500 + 베이직 238채널',         competitor_name:'숨고',     easytask_diff:-30000,  realcontact_diff:-100000},
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100',                            competitor_name:'숨고',     easytask_diff:10000,   realcontact_diff:50000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100 + 베이직 238채널',           competitor_name:'숨고',     easytask_diff:-10000,  realcontact_diff:60000  },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100',                        competitor_name:'숨고',     easytask_diff:-40000,  realcontact_diff:0      },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 실속형 217채널',        competitor_name:'숨고',     easytask_diff:-130000, realcontact_diff:-10000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'숨고',     easytask_diff:-100000, realcontact_diff:-50000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 실속형 217채널',    competitor_name:'숨고',     easytask_diff:-130000, realcontact_diff:-50000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100',                            competitor_name:'숨고',     easytask_diff:-80000,  realcontact_diff:0      },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 이코노미 183채널',          competitor_name:'숨고',     easytask_diff:-50000,  realcontact_diff:-60000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'숨고',     easytask_diff:-110000, realcontact_diff:-90000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 이코노미 183채널',    competitor_name:'숨고',     easytask_diff:-110000, realcontact_diff:-20000 },
  // 아정당
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'아정당',   easytask_diff:30000,   realcontact_diff:0      },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500 + 베이직 238채널',         competitor_name:'아정당',   easytask_diff:40000,   realcontact_diff:40000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100',                            competitor_name:'아정당',   easytask_diff:40000,   realcontact_diff:80000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100 + 베이직 238채널',           competitor_name:'아정당',   easytask_diff:220000,  realcontact_diff:70000  },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100',                        competitor_name:'아정당',   easytask_diff:0,       realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 실속형 217채널',        competitor_name:'아정당',   easytask_diff:145000,  realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'아정당',   easytask_diff:70000,   realcontact_diff:70000  },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 실속형 217채널',    competitor_name:'아정당',   easytask_diff:70000,   realcontact_diff:70000  },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100',                            competitor_name:'아정당',   easytask_diff:40000,   realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 이코노미 183채널',          competitor_name:'아정당',   easytask_diff:0,       realcontact_diff:0      },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'아정당',   easytask_diff:50000,   realcontact_diff:90000  },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 이코노미 183채널',    competitor_name:'아정당',   easytask_diff:30000,   realcontact_diff:80000  },
  // 인터넷끝판왕
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'인터넷끝판왕', easytask_diff:90000,  realcontact_diff:20000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500 + 베이직 238채널',         competitor_name:'인터넷끝판왕', easytask_diff:-10000, realcontact_diff:40000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100',                            competitor_name:'인터넷끝판왕', easytask_diff:80000,  realcontact_diff:70000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100 + 베이직 238채널',           competitor_name:'인터넷끝판왕', easytask_diff:120000, realcontact_diff:120000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100',                        competitor_name:'인터넷끝판왕', easytask_diff:70000,  realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 실속형 217채널',        competitor_name:'인터넷끝판왕', easytask_diff:100000, realcontact_diff:40000  },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'인터넷끝판왕', easytask_diff:150000, realcontact_diff:150000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 실속형 217채널',    competitor_name:'인터넷끝판왕', easytask_diff:90000,  realcontact_diff:110000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100',                            competitor_name:'인터넷끝판왕', easytask_diff:60000,  realcontact_diff:60000  },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 이코노미 183채널',          competitor_name:'인터넷끝판왕', easytask_diff:160000, realcontact_diff:160000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'인터넷끝판왕', easytask_diff:70000,  realcontact_diff:70000  },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 이코노미 183채널',    competitor_name:'인터넷끝판왕', easytask_diff:100000, realcontact_diff:50000  },
  // 인터넷비교원
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500',                          competitor_name:'인터넷비교원', easytask_diff:10000,  realcontact_diff:80000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'베이직 500 + 베이직 238채널',         competitor_name:'인터넷비교원', easytask_diff:-90000, realcontact_diff:150000 },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100',                            competitor_name:'인터넷비교원', easytask_diff:80000,  realcontact_diff:30000  },
  { year:2026,month:6,category:'tps',telecom:'KT',    product_name:'슬림 100 + 베이직 238채널',           competitor_name:'인터넷비교원', easytask_diff:90000,  realcontact_diff:70000  },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100',                        competitor_name:'인터넷비교원', easytask_diff:100000, realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'광랜안심 100 + 실속형 217채널',        competitor_name:'인터넷비교원', easytask_diff:40000,  realcontact_diff:100000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500',                    competitor_name:'인터넷비교원', easytask_diff:120000, realcontact_diff:120000 },
  { year:2026,month:6,category:'tps',telecom:'LGU+',  product_name:'기가슬림안심 500 + 실속형 217채널',    competitor_name:'인터넷비교원', easytask_diff:40000,  realcontact_diff:190000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100',                            competitor_name:'인터넷비교원', easytask_diff:100000, realcontact_diff:60000  },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'광랜 100 + 이코노미 183채널',          competitor_name:'인터넷비교원', easytask_diff:80000,  realcontact_diff:180000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500',                      competitor_name:'인터넷비교원', easytask_diff:90000,  realcontact_diff:140000 },
  { year:2026,month:6,category:'tps',telecom:'SKB',   product_name:'기가라이트 500 + 이코노미 183채널',    competitor_name:'인터넷비교원', easytask_diff:150000, realcontact_diff:220000 },

  // ── 6월 가전 (48행) ───────────────────────────────────────────────────────
  // 미소
  { year:2026,month:6,category:'appliance',brand:'LG',         product_name:'퓨리케어 오브제컬렉션 냉온정 얼음정수기',    competitor_name:'미소', easytask_diff:-100000, realcontact_diff:-90000 },
  { year:2026,month:6,category:'appliance',brand:'LG',         product_name:'퓨리케어 오브제컬렉션 냉온정 정수기(맞춤출수)', competitor_name:'미소', easytask_diff:-50000,  realcontact_diff:-10000 },
  { year:2026,month:6,category:'appliance',brand:'SK인텔릭스', product_name:'원코크 플러스 얼음물 정수기',               competitor_name:'미소', easytask_diff:10000,   realcontact_diff:-30000 },
  { year:2026,month:6,category:'appliance',brand:'SK인텔릭스', product_name:'초소형 플러스 직수 냉온정 정수기',           competitor_name:'미소', easytask_diff:50000,   realcontact_diff:0      },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'노블2 공기청정기 16평형',                   competitor_name:'미소', easytask_diff:-50000,  realcontact_diff:-50000 },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'노블2 공기청정기 20평형',                   competitor_name:'미소', easytask_diff:-70000,  realcontact_diff:-70000 },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'더블케어 비데 2',                          competitor_name:'미소', easytask_diff:-60000,  realcontact_diff:-40000 },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'아이콘 미니 냉온정 얼음정수기',              competitor_name:'미소', easytask_diff:-50000,  realcontact_diff:10000  },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'아이콘 프로 정수기',                        competitor_name:'미소', easytask_diff:-10000,  realcontact_diff:90000  },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'아이콘2 냉온정 정수기',                     competitor_name:'미소', easytask_diff:-10000,  realcontact_diff:0      },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'아이콘3 냉온정 정수기',                     competitor_name:'미소', easytask_diff:170000,  realcontact_diff:10000  },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 공기청정기 28평형',                 competitor_name:'미소', easytask_diff:30000,   realcontact_diff:90000  },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 트리플케어8 비데',                  competitor_name:'미소', easytask_diff:40000,   realcontact_diff:110000 },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'스팀100 끓인물 정수기',                     competitor_name:'미소', easytask_diff:40000,   realcontact_diff:30000  },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 미니100 초소형 냉온정 정수기',      competitor_name:'미소', easytask_diff:100000,  realcontact_diff:50000  },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'제로 100 슬림 플러스 냉온정 얼음정수기',    competitor_name:'미소', easytask_diff:100000,  realcontact_diff:-30000 },
  // 뽐뿌
  { year:2026,month:6,category:'appliance',brand:'LG',         product_name:'퓨리케어 오브제컬렉션 냉온정 얼음정수기',    competitor_name:'뽐뿌', easytask_diff:-130000, realcontact_diff:-130000},
  { year:2026,month:6,category:'appliance',brand:'LG',         product_name:'퓨리케어 오브제컬렉션 냉온정 정수기(맞춤출수)', competitor_name:'뽐뿌', easytask_diff:10000,   realcontact_diff:10000  },
  { year:2026,month:6,category:'appliance',brand:'SK인텔릭스', product_name:'원코크 플러스 얼음물 정수기',               competitor_name:'뽐뿌', easytask_diff:-140000, realcontact_diff:-150000},
  { year:2026,month:6,category:'appliance',brand:'SK인텔릭스', product_name:'초소형 플러스 직수 냉온정 정수기',           competitor_name:'뽐뿌', easytask_diff:-90000,  realcontact_diff:-100000},
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'노블2 공기청정기 16평형',                   competitor_name:'뽐뿌', easytask_diff:-50000,  realcontact_diff:-80000 },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'노블2 공기청정기 20평형',                   competitor_name:'뽐뿌', easytask_diff:-70000,  realcontact_diff:-90000 },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'더블케어 비데 2',                          competitor_name:'뽐뿌', easytask_diff:-90000,  realcontact_diff:40000  },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'아이콘 미니 냉온정 얼음정수기',              competitor_name:'뽐뿌', easytask_diff:-70000,  realcontact_diff:-80000 },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'아이콘 프로 정수기',                        competitor_name:'뽐뿌', easytask_diff:-50000,  realcontact_diff:-50000 },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'아이콘2 냉온정 정수기',                     competitor_name:'뽐뿌', easytask_diff:-50000,  realcontact_diff:-50000 },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'아이콘3 냉온정 정수기',                     competitor_name:'뽐뿌', easytask_diff:90000,   realcontact_diff:-60000 },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 공기청정기 28평형',                 competitor_name:'뽐뿌', easytask_diff:170000,  realcontact_diff:120000 },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 트리플케어8 비데',                  competitor_name:'뽐뿌', easytask_diff:-30000,  realcontact_diff:160000 },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'스팀100 끓인물 정수기',                     competitor_name:'뽐뿌', easytask_diff:-80000,  realcontact_diff:0      },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 미니100 초소형 냉온정 정수기',      competitor_name:'뽐뿌', easytask_diff:-70000,  realcontact_diff:-70000 },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'제로 100 슬림 플러스 냉온정 얼음정수기',    competitor_name:'뽐뿌', easytask_diff:-80000,  realcontact_diff:-50000 },
  // 아정당
  { year:2026,month:6,category:'appliance',brand:'LG',         product_name:'퓨리케어 오브제컬렉션 냉온정 얼음정수기',    competitor_name:'아정당', easytask_diff:30000,  realcontact_diff:30000  },
  { year:2026,month:6,category:'appliance',brand:'LG',         product_name:'퓨리케어 오브제컬렉션 냉온정 정수기(맞춤출수)', competitor_name:'아정당', easytask_diff:30000,  realcontact_diff:50000  },
  { year:2026,month:6,category:'appliance',brand:'SK인텔릭스', product_name:'원코크 플러스 얼음물 정수기',               competitor_name:'아정당', easytask_diff:110000, realcontact_diff:110000 },
  { year:2026,month:6,category:'appliance',brand:'SK인텔릭스', product_name:'초소형 플러스 직수 냉온정 정수기',           competitor_name:'아정당', easytask_diff:130000, realcontact_diff:130000 },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'노블2 공기청정기 16평형',                   competitor_name:'아정당', easytask_diff:100000, realcontact_diff:100000 },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'노블2 공기청정기 20평형',                   competitor_name:'아정당', easytask_diff:100000, realcontact_diff:100000 },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'더블케어 비데 2',                          competitor_name:'아정당', easytask_diff:100000, realcontact_diff:100000 },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'아이콘 미니 냉온정 얼음정수기',              competitor_name:'아정당', easytask_diff:80000,  realcontact_diff:80000  },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'아이콘 프로 정수기',                        competitor_name:'아정당', easytask_diff:90000,  realcontact_diff:90000  },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'아이콘2 냉온정 정수기',                     competitor_name:'아정당', easytask_diff:90000,  realcontact_diff:90000  },
  { year:2026,month:6,category:'appliance',brand:'코웨이',      product_name:'아이콘3 냉온정 정수기',                     competitor_name:'아정당', easytask_diff:140000, realcontact_diff:140000 },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 공기청정기 28평형',                 competitor_name:'아정당', easytask_diff:110000, realcontact_diff:110000 },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 트리플케어8 비데',                  competitor_name:'아정당', easytask_diff:120000, realcontact_diff:120000 },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'스팀100 끓인물 정수기',                     competitor_name:'아정당', easytask_diff:120000, realcontact_diff:120000 },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'인스퓨어 미니100 초소형 냉온정 정수기',      competitor_name:'아정당', easytask_diff:170000, realcontact_diff:130000 },
  { year:2026,month:6,category:'appliance',brand:'쿠쿠',        product_name:'제로 100 슬림 플러스 냉온정 얼음정수기',    competitor_name:'아정당', easytask_diff:180000, realcontact_diff:130000 },
]

export async function GET() {
  const MONTHS = [
    { year: 2026, month: 4 },
    { year: 2026, month: 5 },
    { year: 2026, month: 6 },
  ]

  // 1. monthly_surveys 생성 (없는 경우)
  const surveyIdMap: Record<string, string> = {}
  for (const { year, month } of MONTHS) {
    const key = `${year}-${month}`
    const { data: existing } = await supabase
      .from('monthly_surveys')
      .select('id')
      .eq('year', year)
      .eq('month', month)
      .maybeSingle()

    if (existing) {
      surveyIdMap[key] = existing.id
    } else {
      const { data: created, error } = await supabase
        .from('monthly_surveys')
        .insert({ year, month, status: 'completed' })
        .select('id')
        .single()
      if (error || !created) {
        return NextResponse.json({ error: `월별 조사 생성 실패 ${key}: ${error?.message}` }, { status: 500 })
      }
      surveyIdMap[key] = created.id
    }
  }

  // 2. 기존 비교 데이터 삭제
  const ids = Object.values(surveyIdMap)
  const { error: delError } = await supabase
    .from('survey_comparisons')
    .delete()
    .in('monthly_survey_id', ids)
  if (delError) {
    return NextResponse.json({ error: `삭제 실패: ${delError.message}` }, { status: 500 })
  }

  // 3. 데이터 삽입 (50행씩 배치)
  const rows = SEED_DATA.map(r => ({
    monthly_survey_id: surveyIdMap[`${r.year}-${r.month}`],
    category: r.category,
    telecom: r.telecom ?? null,
    brand: r.brand ?? null,
    product_name: r.product_name,
    competitor_name: r.competitor_name,
    easytask_diff: r.easytask_diff,
    realcontact_diff: r.realcontact_diff,
  })).filter(r => r.monthly_survey_id)

  const BATCH = 50
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await supabase
      .from('survey_comparisons')
      .insert(rows.slice(i, i + BATCH))
    if (error) {
      return NextResponse.json({ error: `삽입 실패 (offset ${i}): ${error.message}` }, { status: 500 })
    }
  }

  return NextResponse.json({
    ok: true,
    inserted: rows.length,
    surveys: surveyIdMap,
  })
}
