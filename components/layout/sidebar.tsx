'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Role } from '@prisma/client'
import {
  LayoutDashboard,
  School,
  FileText,
  Users,
  Settings,
  BarChart3,
  ClipboardList,
  Calendar,
  TrendingUp,
  BookOpen,
  Upload,
} from 'lucide-react'

interface SidebarProps {
  role: Role
}

const adminNavItems = [
  { href: '/admin/dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { href: '/admin/schools', label: 'จัดการโรงเรียน', icon: School },
  { href: '/admin/users', label: 'จัดการผู้ใช้งาน', icon: Users },
  { href: '/admin/policies', label: 'จัดการนโยบาย', icon: BookOpen },
  { href: '/admin/import', label: 'นำเข้าข้อมูล', icon: Upload },
  { href: '/supervisions', label: 'การนิเทศทั้งหมด', icon: FileText },
  { href: '/reports/district', label: 'รายงาน', icon: BarChart3 },
  { href: '/admin/settings', label: 'ตั้งค่าระบบ', icon: Settings },
]

const supervisorNavItems = [
  { href: '/supervisor/dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { href: '/supervisor/schools', label: 'โรงเรียนที่รับผิดชอบ', icon: School },
  { href: '/supervisions/new', label: 'สร้างการนิเทศ', icon: FileText },
  { href: '/supervisions', label: 'การนิเทศของฉัน', icon: ClipboardList },
  { href: '/reports/my-schools', label: 'รายงาน', icon: BarChart3 },
]

const schoolNavItems = [
  { href: '/school/dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { href: '/school/supervisions', label: 'ผลการนิเทศ', icon: FileText },
  { href: '/school/timeline', label: 'ไทม์ไลน์', icon: Calendar },
  { href: '/school/improvements', label: 'แผนพัฒนา', icon: TrendingUp },
]

const executiveNavItems = [
  { href: '/executive/dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { href: '/executive/analytics', label: 'การวิเคราะห์', icon: BarChart3 },
  { href: '/executive/reports', label: 'รายงาน', icon: FileText },
  { href: '/executive/approval', label: 'อนุมัติรายงาน', icon: Settings },
]

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  let navItems: typeof adminNavItems = []
  if (role === Role.ADMIN) {
    navItems = adminNavItems
  } else if (role === Role.SUPERVISOR) {
    navItems = supervisorNavItems
  } else if (role === Role.SCHOOL) {
    navItems = schoolNavItems
  } else if (role === Role.EXECUTIVE) {
    navItems = executiveNavItems
  }

  return (
    <aside className="w-64 border-r bg-muted/40 p-4 min-h-[600px]">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

