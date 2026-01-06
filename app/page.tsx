import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Role } from '@prisma/client'

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // Redirect based on role
  const role = session.user.role
  if (role === Role.ADMIN) {
    redirect('/admin/dashboard')
  } else if (role === Role.SUPERVISOR) {
    redirect('/supervisor/dashboard')
  } else if (role === Role.SCHOOL) {
    redirect('/school/dashboard')
  } else if (role === Role.EXECUTIVE) {
    redirect('/executive/dashboard')
  }

  return null
}
