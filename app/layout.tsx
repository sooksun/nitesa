import type { Metadata } from 'next'
import { Kanit } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/providers/toast-provider'

const kanit = Kanit({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'thai'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ระบบนิเทศการศึกษา',
  description: 'ระบบจัดการข้อมูลการนิเทศการศึกษาขั้นพื้นฐาน',
  icons: {
    icon: '/images/cropped-Logo-1-e1742291098816-32x32.png',
    shortcut: '/images/cropped-Logo-1-e1742291098816-32x32.png',
    apple: '/images/cropped-Logo-1-e1742291098816-32x32.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`${kanit.variable} font-body antialiased`}>
        <div className="black-ribbon">
          <img src="/images/black-ribbon.png" alt="Black Ribbon" />
        </div>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
