import { prisma } from './db'
import { sendEmail } from './email'

export async function checkAlertConditions() {
  // Schools with low performance
  const lowPerformingSchools = await prisma.school.findMany({
    where: {
      supervisions: {
        some: {
          indicators: {
            some: {
              level: { in: ['FAIR', 'NEEDS_WORK'] },
            },
          },
        },
      },
    },
    include: {
      supervisions: {
        where: {
          status: 'APPROVED',
        },
        orderBy: {
          date: 'desc',
        },
        take: 1,
        include: {
          indicators: true,
        },
      },
    },
  })

  // Schools not supervised in 6 months
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const unsupervisedSchools = await prisma.school.findMany({
    where: {
      OR: [
        {
          supervisions: {
            none: {},
          },
        },
        {
          supervisions: {
            none: {
              date: { gte: sixMonthsAgo },
            },
          },
        },
      ],
    },
  })

  // Send alerts to admins
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
  })

  if (lowPerformingSchools.length > 0 || unsupervisedSchools.length > 0) {
    const alertHtml = `
      <h2>แจ้งเตือนระบบนิเทศการศึกษา</h2>
      <h3>โรงเรียนที่ต้องติดตาม (${lowPerformingSchools.length} แห่ง)</h3>
      <ul>
        ${lowPerformingSchools.map((s) => `<li>${s.name} (${s.code})</li>`).join('')}
      </ul>
      <h3>โรงเรียนที่ยังไม่ได้รับการนิเทศใน 6 เดือน (${unsupervisedSchools.length} แห่ง)</h3>
      <ul>
        ${unsupervisedSchools.map((s) => `<li>${s.name} (${s.code})</li>`).join('')}
      </ul>
    `

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: 'แจ้งเตือนระบบนิเทศการศึกษา',
        html: alertHtml,
      })
    }
  }

  return {
    lowPerformingSchools: lowPerformingSchools.length,
    unsupervisedSchools: unsupervisedSchools.length,
  }
}

