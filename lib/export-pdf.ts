import { jsPDF } from 'jspdf'

export async function generateSupervisionPDF(supervision: any): Promise<Blob> {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(20)
  doc.text('รายงานผลการนิเทศ', 105, 20, { align: 'center' })

  // School info
  doc.setFontSize(12)
  doc.text(`โรงเรียน: ${supervision.school.name}`, 20, 40)
  doc.text(`รหัส: ${supervision.school.code}`, 20, 50)
  doc.text(`วันที่นิเทศ: ${new Date(supervision.date).toLocaleDateString('th-TH')}`, 20, 60)
  doc.text(`ผู้นิเทศ: ${supervision.user.name}`, 20, 70)

  // Summary
  doc.setFontSize(14)
  doc.text('สรุปผลการนิเทศ', 20, 85)
  doc.setFontSize(10)
  const summaryLines = doc.splitTextToSize(supervision.summary, 170)
  doc.text(summaryLines, 20, 95)

  // Indicators
  let yPos = 120
  doc.setFontSize(14)
  doc.text('ตัวชี้วัด', 20, yPos)
  yPos += 10

  supervision.indicators.forEach((indicator: any, index: number) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    doc.setFontSize(10)
    doc.text(`${index + 1}. ${indicator.name} - ${indicator.level}`, 30, yPos)
    yPos += 10
  })

  // Suggestions
  yPos += 10
  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }
  doc.setFontSize(14)
  doc.text('ข้อเสนอแนะ', 20, yPos)
  yPos += 10
  doc.setFontSize(10)
  const suggestionLines = doc.splitTextToSize(supervision.suggestions, 170)
  doc.text(suggestionLines, 20, yPos)

  return doc.output('blob')
}

