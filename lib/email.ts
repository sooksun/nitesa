import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env.SMTP_HOST) {
    console.log('Email not configured. Would send:', { to, subject })
    return
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendSupervisionNotification({
  to,
  schoolName,
  supervisionId,
  date,
}: {
  to: string
  schoolName: string
  supervisionId: string
  date: Date
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const template = `
    <h2>แจ้งผลการนิเทศโรงเรียน ${schoolName}</h2>
    <p>วันที่: ${date.toLocaleDateString('th-TH')}</p>
    <p>ผลการนิเทศได้รับการอนุมัติแล้ว</p>
    <a href="${baseUrl}/supervisions/${supervisionId}">ดูรายละเอียด</a>
  `

  await sendEmail({
    to,
    subject: 'แจ้งผลการนิเทศโรงเรียน',
    html: template,
  })
}

