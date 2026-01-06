import { Header } from './header'
import { Sidebar } from './sidebar'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Footer } from './footer'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="app-shell">
      <Header user={session.user} role={session.user.role} />
      <main className="page-content">
        <div className="page-container">
          <div className="card-surface">
            <div className="flex gap-6">
              <Sidebar role={session.user.role} />
              <div className="flex-1">{children}</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

