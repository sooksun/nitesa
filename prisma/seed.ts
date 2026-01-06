import { PrismaClient, Role, SupervisionStatus, IndicatorLevel, PolicyType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Hash default password
  const defaultPassword = await bcrypt.hash('password123', 10)

  // Create Network Groups
  console.log('Creating network groups...')
  const networkGroup1 = await prisma.networkGroup.upsert({
    where: { code: 'NG001' },
    update: {},
    create: {
      code: 'NG001',
      name: 'กลุ่มเครือข่ายที่ 1',
      description: 'กลุ่มเครือข่ายโรงเรียนในเขตอำเภอเมือง',
    },
  })

  const networkGroup2 = await prisma.networkGroup.upsert({
    where: { code: 'NG002' },
    update: {},
    create: {
      code: 'NG002',
      name: 'กลุ่มเครือข่ายที่ 2',
      description: 'กลุ่มเครือข่ายโรงเรียนในเขตอำเภออื่นๆ',
    },
  })

  // Create Policies
  console.log('Creating policies...')
  const policy1 = await prisma.policy.upsert({
    where: { type_code: { type: PolicyType.NAT_VALUES_LOYALTY, code: 'POL-001' } },
    update: {},
    create: {
      type: PolicyType.NAT_VALUES_LOYALTY,
      code: 'POL-001',
      title: 'นโยบายคุณธรรม จริยธรรม ความเป็นไทย และความภาคภูมิใจในความเป็นไทย',
      description: 'นโยบายส่งเสริมคุณธรรม จริยธรรม ความเป็นไทย และความภาคภูมิใจในความเป็นไทย',
      isActive: true,
    },
  })

  const policy2 = await prisma.policy.upsert({
    where: { type_code: { type: PolicyType.STUDENT_DEVELOPMENT, code: 'POL-002' } },
    update: {},
    create: {
      type: PolicyType.STUDENT_DEVELOPMENT,
      code: 'POL-002',
      title: 'นโยบายการพัฒนาผู้เรียนให้มีคุณภาพตามมาตรฐานการศึกษา',
      description: 'นโยบายการพัฒนาผู้เรียนให้มีคุณภาพตามมาตรฐานการศึกษา',
      isActive: true,
    },
  })

  const policy3 = await prisma.policy.upsert({
    where: { type_code: { type: PolicyType.TEACHER_UPSKILL, code: 'POL-003' } },
    update: {},
    create: {
      type: PolicyType.TEACHER_UPSKILL,
      code: 'POL-003',
      title: 'นโยบายการพัฒนาครูและบุคลากรทางการศึกษา',
      description: 'นโยบายการพัฒนาครูและบุคลากรทางการศึกษา',
      isActive: true,
    },
  })

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nitesa.local' },
    update: {},
    create: {
      email: 'admin@nitesa.local',
      name: 'ผู้ดูแลระบบ',
      role: Role.ADMIN,
      password: defaultPassword,
    },
  })

  // Create Supervisor users
  const supervisor1 = await prisma.user.upsert({
    where: { email: 'supervisor1@nitesa.local' },
    update: {},
    create: {
      email: 'supervisor1@nitesa.local',
      name: 'ศึกษานิเทศก์ 1',
      role: Role.SUPERVISOR,
      password: defaultPassword,
    },
  })

  const supervisor2 = await prisma.user.upsert({
    where: { email: 'supervisor2@nitesa.local' },
    update: {},
    create: {
      email: 'supervisor2@nitesa.local',
      name: 'ศึกษานิเทศก์ 2',
      role: Role.SUPERVISOR,
      password: defaultPassword,
    },
  })

  // Create Executive user
  const executive = await prisma.user.upsert({
    where: { email: 'executive@nitesa.local' },
    update: {},
    create: {
      email: 'executive@nitesa.local',
      name: 'ผู้บริหารระดับสูง',
      role: Role.EXECUTIVE,
      password: defaultPassword,
    },
  })

  // Create Schools
  const school1 = await prisma.school.upsert({
    where: { code: 'SCH001' },
    update: {},
    create: {
      code: 'SCH001',
      name: 'โรงเรียนบ้านหนองแสง',
      district: 'อำเภอเมือง',
      subDistrict: 'ตำบลหนองแสง',
      address: '123 ถนนหนองแสง',
      phone: '02-123-4567',
      email: 'school1@nitesa.local',
      principalName: 'นายทดสอบ ระบบ',
      studentCount: 500,
      teacherCount: 25,
      networkGroupId: networkGroup1.id,
      supervisors: {
        connect: [{ id: supervisor1.id }],
      },
    },
  })

  const school2 = await prisma.school.upsert({
    where: { code: 'SCH002' },
    update: {},
    create: {
      code: 'SCH002',
      name: 'โรงเรียนบ้านดอน',
      district: 'อำเภอเมือง',
      subDistrict: 'ตำบลดอน',
      address: '456 ถนนดอน',
      phone: '02-234-5678',
      email: 'school2@nitesa.local',
      principalName: 'นางทดสอบ ระบบ',
      studentCount: 300,
      teacherCount: 15,
      networkGroupId: networkGroup1.id,
      supervisors: {
        connect: [{ id: supervisor1.id }, { id: supervisor2.id }],
      },
    },
  })

  const school3 = await prisma.school.upsert({
    where: { code: 'SCH003' },
    update: {},
    create: {
      code: 'SCH003',
      name: 'โรงเรียนบ้านนา',
      district: 'อำเภอเมือง',
      subDistrict: 'ตำบลนา',
      address: '789 ถนนนา',
      phone: '02-345-6789',
      email: 'school3@nitesa.local',
      principalName: 'นายทดสอบ ระบบ',
      studentCount: 400,
      teacherCount: 20,
      networkGroupId: networkGroup2.id,
      supervisors: {
        connect: [{ id: supervisor2.id }],
      },
    },
  })

  // Create Sample Supervisions
  const supervision1 = await prisma.supervision.create({
    data: {
      schoolId: school1.id,
      userId: supervisor1.id,
      type: 'นิเทศการสอน',
      date: new Date('2024-01-15'),
      academicYear: '2567',
      ministerPolicyId: policy1.id,
      obecPolicyId: policy2.id,
      areaPolicyId: policy3.id,
      summary: 'การนิเทศการสอนครั้งนี้พบว่า...',
      suggestions: 'ควรพัฒนาการจัดการเรียนการสอน...',
      status: SupervisionStatus.APPROVED,
      indicators: {
        create: [
          {
            name: 'การจัดการเรียนการสอน',
            level: IndicatorLevel.GOOD,
            comment: 'มีการจัดการเรียนการสอนที่ดี',
          },
          {
            name: 'การวัดและประเมินผล',
            level: IndicatorLevel.EXCELLENT,
            comment: 'มีการวัดและประเมินผลที่ชัดเจน',
          },
          {
            name: 'การพัฒนานวัตกรรม',
            level: IndicatorLevel.FAIR,
            comment: 'ควรพัฒนานวัตกรรมเพิ่มเติม',
          },
        ],
      },
    },
  })

  const supervision2 = await prisma.supervision.create({
    data: {
      schoolId: school2.id,
      userId: supervisor1.id,
      type: 'ติดตามโครงการ',
      date: new Date('2024-02-20'),
      summary: 'การติดตามโครงการ...',
      suggestions: 'ควรปรับปรุงการดำเนินโครงการ...',
      status: SupervisionStatus.SUBMITTED,
      indicators: {
        create: [
          {
            name: 'การวางแผนโครงการ',
            level: IndicatorLevel.GOOD,
          },
          {
            name: 'การดำเนินโครงการ',
            level: IndicatorLevel.FAIR,
            comment: 'ควรปรับปรุงการดำเนินโครงการ',
          },
        ],
      },
    },
  })

  // Create Acknowledgement
  await prisma.acknowledgement.create({
    data: {
      supervisionId: supervision1.id,
      acknowledgedBy: school1.principalName || 'ผู้อำนวยการ',
      acknowledgedAt: new Date('2024-01-16'),
      comment: 'ได้รับทราบและจะดำเนินการตามข้อเสนอแนะ',
    },
  })

  // Create School user for school1
  const schoolUser = await prisma.user.upsert({
    where: { email: school1.email || `school1@nitesa.local` },
    update: {},
    create: {
      email: school1.email || `school1@nitesa.local`,
      name: school1.principalName || 'ผู้อำนวยการโรงเรียน',
      role: Role.SCHOOL,
      password: defaultPassword,
    },
  })

  // Create Improvement Plan
  await prisma.improvement.create({
    data: {
      schoolId: school1.id,
      userId: schoolUser.id,
      title: 'แผนพัฒนาการจัดการเรียนการสอน',
      description: 'แผนการพัฒนาตามข้อเสนอแนะจากการนิเทศ...',
      status: 'pending',
    },
  })

  // Create System Settings
  await prisma.systemSetting.upsert({
    where: { key: 'supervision_types' },
    update: {},
    create: {
      key: 'supervision_types',
      value: [
        'นิเทศการสอน',
        'ติดตามโครงการ',
        'นิเทศทั่วไป',
        'นิเทศเฉพาะเรื่อง',
      ],
      description: 'ประเภทการนิเทศ',
    },
  })

  await prisma.systemSetting.upsert({
    where: { key: 'indicator_criteria' },
    update: {},
    create: {
      key: 'indicator_criteria',
      value: {
        EXCELLENT: { min: 90, label: 'ดีเยี่ยม' },
        GOOD: { min: 75, max: 89, label: 'ดี' },
        FAIR: { min: 60, max: 74, label: 'พอใช้' },
        NEEDS_WORK: { max: 59, label: 'ต้องพัฒนา' },
      },
      description: 'เกณฑ์การประเมินตัวชี้วัด',
    },
  })

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

