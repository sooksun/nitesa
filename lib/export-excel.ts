import * as XLSX from 'xlsx'

export interface SupervisionExcelData {
  schoolCode: string
  schoolName: string
  date: string
  type: string
  status: string
  summary: string
  indicators: string
  score: number
}

export function generateSupervisionExcel(data: SupervisionExcelData[]): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'รายงานการนิเทศ')

  // Set column widths
  const colWidths = [
    { wch: 12 }, // schoolCode
    { wch: 30 }, // schoolName
    { wch: 12 }, // date
    { wch: 20 }, // type
    { wch: 15 }, // status
    { wch: 50 }, // summary
    { wch: 30 }, // indicators
    { wch: 10 },  // score
  ]
  worksheet['!cols'] = colWidths

  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }))
}

export function generateSchoolPerformanceExcel(data: any[]): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ผลการดำเนินงานโรงเรียน')

  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }))
}

