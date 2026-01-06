import * as XLSX from 'xlsx'
import { writeFileSync } from 'fs'
import { join } from 'path'

/**
 * Generate Excel templates for import
 */
function generateSchoolTemplate() {
  const workbook = XLSX.utils.book_new()

  // School template
  const schoolData = [
    {
      code: 'SCH001',
      name: 'โรงเรียนบ้านหนองแสง',
      province: 'จังหวัดสกลนคร',
      district: 'อำเภอเมือง',
      subDistrict: 'ตำบลหนองแสง',
      address: '123 ถนนหนองแสง',
      phone: '02-123-4567',
      email: 'school1@example.com',
      principalName: 'นายทดสอบ ระบบ',
      studentCount: 500,
      teacherCount: 25,
      networkGroupCode: 'NG001',
    },
    {
      code: 'SCH002',
      name: 'โรงเรียนบ้านทดสอบ',
      province: 'จังหวัดสกลนคร',
      district: 'อำเภอเมือง',
      subDistrict: 'ตำบลทดสอบ',
      address: '456 ถนนทดสอบ',
      phone: '02-234-5678',
      email: 'school2@example.com',
      principalName: 'นางทดสอบ ระบบ',
      studentCount: 300,
      teacherCount: 15,
      networkGroupCode: 'NG002',
    },
  ]

  const schoolSheet = XLSX.utils.json_to_sheet(schoolData)
  XLSX.utils.book_append_sheet(workbook, schoolSheet, 'Schools')

  // Write to file
  const filePath = join(process.cwd(), 'public', 'templates', 'school-import-template.xlsx')
  XLSX.writeFile(workbook, filePath)
  console.log('✅ Generated school template:', filePath)
}

function generateNetworkGroupTemplate() {
  const workbook = XLSX.utils.book_new()

  const networkGroupData = [
    {
      code: 'NG001',
      name: 'กลุ่มเครือข่ายที่ 1',
      description: 'กลุ่มเครือข่ายโรงเรียนในเขตอำเภอเมือง',
    },
    {
      code: 'NG002',
      name: 'กลุ่มเครือข่ายที่ 2',
      description: 'กลุ่มเครือข่ายโรงเรียนในเขตอำเภอทดสอบ',
    },
  ]

  const sheet = XLSX.utils.json_to_sheet(networkGroupData)
  XLSX.utils.book_append_sheet(workbook, sheet, 'NetworkGroups')

  const filePath = join(process.cwd(), 'public', 'templates', 'network-group-import-template.xlsx')
  XLSX.writeFile(workbook, filePath)
  console.log('✅ Generated network group template:', filePath)
}

function generatePolicyTemplate() {
  const workbook = XLSX.utils.book_new()

  const policyData = [
    {
      type: 'MINISTER',
      code: 'POL001',
      title: 'นโยบายรัฐมนตรีว่าการกระทรวงศึกษาธิการ',
      description: 'รายละเอียดนโยบายรัฐมนตรี',
      isActive: true,
    },
    {
      type: 'OBEC',
      code: 'POL002',
      title: 'นโยบายสพฐ.',
      description: 'รายละเอียดนโยบายสพฐ.',
      isActive: true,
    },
    {
      type: 'AREA',
      code: 'POL003',
      title: 'นโยบายเขตพื้นที่การศึกษา',
      description: 'รายละเอียดนโยบายเขตพื้นที่',
      isActive: true,
    },
  ]

  const sheet = XLSX.utils.json_to_sheet(policyData)
  XLSX.utils.book_append_sheet(workbook, sheet, 'Policies')

  const filePath = join(process.cwd(), 'public', 'templates', 'policy-import-template.xlsx')
  XLSX.writeFile(workbook, filePath)
  console.log('✅ Generated policy template:', filePath)
}

// Run all generators
function generateAllTemplates() {
  const { mkdirSync, existsSync } = require('fs')
  const templatesDir = join(process.cwd(), 'public', 'templates')
  
  if (!existsSync(templatesDir)) {
    mkdirSync(templatesDir, { recursive: true })
  }

  generateSchoolTemplate()
  generateNetworkGroupTemplate()
  generatePolicyTemplate()
  
  console.log('\n✅ All Excel templates generated successfully!')
}

// Run if called directly
if (require.main === module) {
  generateAllTemplates()
}

export { generateAllTemplates, generateSchoolTemplate, generateNetworkGroupTemplate, generatePolicyTemplate }

