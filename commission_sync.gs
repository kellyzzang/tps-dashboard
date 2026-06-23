// 수수료 시트 → JSON API
// 배포 방법: 확장 > Apps Script > 배포 > 새 배포 > 웹앱 > "모든 사용자" > 배포
// 발급된 URL을 .env.local 의 COMMISSION_GAS_ENDPOINT 에 입력

const SHEET_ID = '1cloDc-TLK1jm4ff9DcS_ade6bRwWhzM17V8F8fMLOrs'
const SHEET_GID = 353877023

function doGet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID)
    const sheet = ss.getSheets().find(s => s.getSheetId() === SHEET_GID)

    if (!sheet) {
      return jsonResponse({ error: '시트를 찾을 수 없습니다' })
    }

    const values = sheet.getDataRange().getValues()
    const headers = values[0]

    const COL = {
      brand: 0,
      item_type: 2,
      key: 8,
      channel: 10,
      current: 12,
      change: 18,
      max: 19,
      min: 20,
    }

    // 날짜 컬럼 추출 (인덱스 22+)
    const dateCols = []
    for (let i = 22; i < headers.length; i++) {
      const h = String(headers[i]).trim()
      if (h.match(/^\d{4}\.\s*\d{1,2}\.\s*\d{1,2}$/)) {
        dateCols.push({ idx: i, label: h })
      }
    }

    const items = []
    const seen = new Set()

    for (let r = 1; r < values.length; r++) {
      const row = values[r]
      const key = String(row[COL.key] || '').trim()
      const channel = String(row[COL.channel] || '').trim()
      const current = row[COL.current]

      if (!key || !channel) continue
      if (channel === '접수불가') continue
      if (!['백메가', '드림네트웍스'].includes(channel)) continue
      if (typeof current !== 'number' || current <= 0) continue

      const uniqKey = `${key}::${channel}`
      if (seen.has(uniqKey)) continue
      seen.add(uniqKey)

      const history = {}
      for (const dc of dateCols) {
        const val = row[dc.idx]
        if (typeof val === 'number' && val > 0) {
          history[dc.label] = val
        }
      }

      items.push({
        commission_key: key,
        channel: channel,
        brand: String(row[COL.brand] || '').trim(),
        item_type: String(row[COL.item_type] || '').trim(),
        current_commission: current,
        daily_change: String(row[COL.change] || '-').trim(),
        max_commission: typeof row[COL.max] === 'number' ? row[COL.max] : 0,
        min_commission: typeof row[COL.min] === 'number' ? row[COL.min] : 0,
        history: history,
      })
    }

    return jsonResponse({ items, synced_at: new Date().toISOString() })
  } catch (e) {
    return jsonResponse({ error: String(e) })
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}
