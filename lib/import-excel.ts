import * as XLSX from 'xlsx'
import { prisma } from '@/lib/db'
import { PolicyType } from '@prisma/client'

export interface ImportResult {
  success: number
  failed: number
  errors: Array<{ row: number; message: string }>
}

/**
 * Parse Excel file and return worksheet data
 */
export function parseExcelFile(buffer: Buffer, sheetName?: string): any[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = sheetName
    ? workbook.Sheets[sheetName]
    : workbook.Sheets[workbook.SheetNames[0]]

  if (!sheet) {
    throw new Error(`Sheet "${sheetName || workbook.SheetNames[0]}" not found`)
  }

  return XLSX.utils.sheet_to_json(sheet, {
    raw: false,
    defval: '',
  })
}

/**
 * Import Schools from Excel
 * Expected columns: code, name, province, district, subDistrict, address, phone, email, principalName, studentCount, teacherCount, networkGroupCode
 */
export async function importSchools(
  data: any[],
  networkGroupMap: Map<string, string>
): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: [],
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNumber = i + 2 // +2 because Excel starts at row 1 and we have header

    try {
      // Validate required fields
      if (!row.code || !row.name || !row.district) {
        result.failed++
        result.errors.push({
          row: rowNumber,
          message: 'Missing required fields: code, name, or district',
        })
        continue
      }

      // Check if code already exists
      const existing = await prisma.school.findUnique({
        where: { code: String(row.code).trim() },
      })

      if (existing) {
        result.failed++
        result.errors.push({
          row: rowNumber,
          message: `School code ${row.code} already exists`,
        })
        continue
      }

      // Get networkGroupId if networkGroupCode is provided
      let networkGroupId: string | null = null
      if (row.networkGroupCode) {
        const ngId = networkGroupMap.get(String(row.networkGroupCode).trim())
        if (ngId) {
          networkGroupId = ngId
        } else {
          result.failed++
          result.errors.push({
            row: rowNumber,
            message: `Network group code ${row.networkGroupCode} not found`,
          })
          continue
        }
      }

      // Parse numeric fields
      const studentCount = row.studentCount
        ? parseInt(String(row.studentCount), 10) || null
        : null
      const teacherCount = row.teacherCount
        ? parseInt(String(row.teacherCount), 10) || null
        : null

      // Create school
      await prisma.school.create({
        data: {
          code: String(row.code).trim(),
          name: String(row.name).trim(),
          province: row.province ? String(row.province).trim() : null,
          district: String(row.district).trim(),
          subDistrict: row.subDistrict ? String(row.subDistrict).trim() : null,
          address: row.address ? String(row.address).trim() : null,
          phone: row.phone ? String(row.phone).trim() : null,
          email: row.email ? String(row.email).trim() : null,
          principalName: row.principalName ? String(row.principalName).trim() : null,
          studentCount,
          teacherCount,
          networkGroupId,
        },
      })

      result.success++
    } catch (error: any) {
      result.failed++
      result.errors.push({
        row: rowNumber,
        message: error.message || 'Unknown error',
      })
    }
  }

  return result
}

/**
 * Import NetworkGroups from Excel
 * Expected columns: code, name, description
 */
export async function importNetworkGroups(data: any[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: [],
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNumber = i + 2

    try {
      // Validate required fields
      if (!row.code || !row.name) {
        result.failed++
        result.errors.push({
          row: rowNumber,
          message: 'Missing required fields: code or name',
        })
        continue
      }

      // Check if code already exists
      const existing = await prisma.networkGroup.findUnique({
        where: { code: String(row.code).trim() },
      })

      if (existing) {
        result.failed++
        result.errors.push({
          row: rowNumber,
          message: `Network group code ${row.code} already exists`,
        })
        continue
      }

      // Create network group
      await prisma.networkGroup.create({
        data: {
          code: String(row.code).trim(),
          name: String(row.name).trim(),
          description: row.description ? String(row.description).trim() : null,
        },
      })

      result.success++
    } catch (error: any) {
      result.failed++
      result.errors.push({
        row: rowNumber,
        message: error.message || 'Unknown error',
      })
    }
  }

  return result
}

/**
 * Import Policies from Excel
 * Expected columns: type, code, title, description, isActive
 */
export async function importPolicies(data: any[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: [],
  }

  const policyTypeMap: Record<string, PolicyType> = {
    // Enum values (with underscore)
    NAT_VALUES_LOYALTY: PolicyType.NAT_VALUES_LOYALTY,
    CIVIC_HISTORY_GEO: PolicyType.CIVIC_HISTORY_GEO,
    EDU_INNOV_TECH: PolicyType.EDU_INNOV_TECH,
    READING_CULTURE: PolicyType.READING_CULTURE,
    STUDENT_DEVELOPMENT: PolicyType.STUDENT_DEVELOPMENT,
    SPECIAL_NEEDS_EDU: PolicyType.SPECIAL_NEEDS_EDU,
    PERSONAL_EXCELLENCE: PolicyType.PERSONAL_EXCELLENCE,
    SCHOOL_SAFETY: PolicyType.SCHOOL_SAFETY,
    EDU_EQUITY_ACCESS: PolicyType.EDU_EQUITY_ACCESS,
    TEACHER_UPSKILL: PolicyType.TEACHER_UPSKILL,
    PERSONALIZED_ASSESSMENT: PolicyType.PERSONALIZED_ASSESSMENT,
    SMART_GOVERNANCE: PolicyType.SMART_GOVERNANCE,
    REDUCE_TEACHER_WORKLOAD: PolicyType.REDUCE_TEACHER_WORKLOAD,
    TEACHER_WELFARE: PolicyType.TEACHER_WELFARE,
    MORAL_QUALITY_LEARNING: PolicyType.MORAL_QUALITY_LEARNING,
    // Enum values (with dash - for Excel import)
    'NAT-VALUES-LOYALTY': PolicyType.NAT_VALUES_LOYALTY,
    'CIVIC-HISTORY-GEO': PolicyType.CIVIC_HISTORY_GEO,
    'EDU-INNOV-TECH': PolicyType.EDU_INNOV_TECH,
    'READING-CULTURE': PolicyType.READING_CULTURE,
    'STUDENT-DEVELOPMENT': PolicyType.STUDENT_DEVELOPMENT,
    'SPECIAL-NEEDS-EDU': PolicyType.SPECIAL_NEEDS_EDU,
    'PERSONAL-EXCELLENCE': PolicyType.PERSONAL_EXCELLENCE,
    'SCHOOL-SAFETY': PolicyType.SCHOOL_SAFETY,
    'EDU-EQUITY-ACCESS': PolicyType.EDU_EQUITY_ACCESS,
    'TEACHER-UPSKILL': PolicyType.TEACHER_UPSKILL,
    'PERSONALIZED-ASSESSMENT': PolicyType.PERSONALIZED_ASSESSMENT,
    'SMART-GOVERNANCE': PolicyType.SMART_GOVERNANCE,
    'REDUCE-TEACHER-WORKLOAD': PolicyType.REDUCE_TEACHER_WORKLOAD,
    'TEACHER-WELFARE': PolicyType.TEACHER_WELFARE,
    'MORAL-QUALITY-LEARNING': PolicyType.MORAL_QUALITY_LEARNING,
    // Thai labels
    'คุณธรรม จริยธรรม ความเป็นไทย และความภาคภูมิใจในความเป็นไทย': PolicyType.NAT_VALUES_LOYALTY,
    'หน้าที่พลเมือง ประวัติศาสตร์ และภูมิศาสตร์': PolicyType.CIVIC_HISTORY_GEO,
    'การศึกษาเพื่อการพัฒนาทักษะในศตวรรษที่ 21 และนวัตกรรมเทคโนโลยี': PolicyType.EDU_INNOV_TECH,
    'การส่งเสริมการอ่านและวัฒนธรรมการอ่าน': PolicyType.READING_CULTURE,
    'การพัฒนาผู้เรียนให้มีคุณภาพตามมาตรฐานการศึกษา': PolicyType.STUDENT_DEVELOPMENT,
    'การจัดการศึกษาสำหรับผู้เรียนที่มีความต้องการพิเศษ': PolicyType.SPECIAL_NEEDS_EDU,
    'การส่งเสริมความเป็นเลิศของผู้เรียน': PolicyType.PERSONAL_EXCELLENCE,
    'ความปลอดภัยในสถานศึกษา': PolicyType.SCHOOL_SAFETY,
    'ความเสมอภาคทางการศึกษาและการเข้าถึงการศึกษา': PolicyType.EDU_EQUITY_ACCESS,
    'การพัฒนาครูและบุคลากรทางการศึกษา': PolicyType.TEACHER_UPSKILL,
    'การประเมินผลการเรียนรู้ที่หลากหลายและเหมาะสมกับผู้เรียน': PolicyType.PERSONALIZED_ASSESSMENT,
    'การบริหารจัดการสถานศึกษาอย่างมีประสิทธิภาพ': PolicyType.SMART_GOVERNANCE,
    'การลดภาระงานครู': PolicyType.REDUCE_TEACHER_WORKLOAD,
    'สวัสดิการครูและบุคลากรทางการศึกษา': PolicyType.TEACHER_WELFARE,
    'คุณภาพการเรียนรู้ที่เน้นคุณธรรม': PolicyType.MORAL_QUALITY_LEARNING,
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNumber = i + 2

    try {
      // Validate required fields
      if (!row.type || !row.code || !row.title) {
        result.failed++
        result.errors.push({
          row: rowNumber,
          message: 'Missing required fields: type, code, or title',
        })
        continue
      }

      // Map policy type - try multiple formats
      const originalType = String(row.type).trim()
      const typeKeyUpper = originalType.toUpperCase()
      const typeKeyWithUnderscore = typeKeyUpper.replace(/-/g, '_')
      const typeKeyWithDash = typeKeyUpper.replace(/_/g, '-')
      
      // Try: original, uppercase, with underscore, with dash
      const policyType = 
        policyTypeMap[originalType] || 
        policyTypeMap[typeKeyUpper] || 
        policyTypeMap[typeKeyWithUnderscore] || 
        policyTypeMap[typeKeyWithDash] ||
        policyTypeMap[typeKeyUpper.replace(/-/g, '_')]

      if (!policyType) {
        result.failed++
        result.errors.push({
          row: rowNumber,
          message: `Invalid policy type: ${row.type}. Must be one of the valid PolicyType enum values`,
        })
        continue
      }

      // Check if code already exists for this type
      const existing = await prisma.policy.findUnique({
        where: {
          type_code: {
            type: policyType,
            code: String(row.code).trim(),
          },
        },
      })

      if (existing) {
        result.failed++
        result.errors.push({
          row: rowNumber,
          message: `Policy code ${row.code} already exists for type ${policyType}`,
        })
        continue
      }

      // Parse isActive (default to true)
      const isActive =
        row.isActive === undefined || row.isActive === ''
          ? true
          : String(row.isActive).toLowerCase() === 'true' ||
            String(row.isActive) === '1' ||
            String(row.isActive).toLowerCase() === 'yes' ||
            String(row.isActive).toLowerCase() === 'ใช่'

      // Create policy
      await prisma.policy.create({
        data: {
          type: policyType,
          code: String(row.code).trim(),
          title: String(row.title).trim(),
          description: row.description ? String(row.description).trim() : null,
          isActive,
        },
      })

      result.success++
    } catch (error: any) {
      result.failed++
      result.errors.push({
        row: rowNumber,
        message: error.message || 'Unknown error',
      })
    }
  }

  return result
}

/**
 * Get all network groups as a map (code -> id)
 */
export async function getNetworkGroupMap(): Promise<Map<string, string>> {
  const networkGroups = await prisma.networkGroup.findMany({
    select: {
      id: true,
      code: true,
    },
  })

  const map = new Map<string, string>()
  networkGroups.forEach((ng) => {
    map.set(ng.code, ng.id)
  })

  return map
}

