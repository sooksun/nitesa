'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Role } from '@prisma/client'
import { Search, Menu, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role: Role
  }
  role: Role
}

const getNavItems = (role: Role) => {
  const baseItems: Array<{ href: string; label: string; roles: Role[] }> = [
    { href: '/admin/dashboard', label: 'หน้าหลัก', roles: [Role.ADMIN] },
    { href: '/supervisor/dashboard', label: 'หน้าหลัก', roles: [Role.SUPERVISOR] },
    { href: '/school/dashboard', label: 'หน้าหลัก', roles: [Role.SCHOOL] },
    { href: '/executive/dashboard', label: 'หน้าหลัก', roles: [Role.EXECUTIVE] },
    { href: '/admin/schools', label: 'ข้อมูลพื้นฐาน', roles: [Role.ADMIN] },
    { href: '/supervisions', label: 'การนิเทศ', roles: [Role.ADMIN, Role.SUPERVISOR, Role.SCHOOL] },
    { href: '/reports/district', label: 'รายงาน', roles: [Role.ADMIN, Role.EXECUTIVE] },
  ]

  return baseItems.filter((item) => item.roles.includes(role))
}

export function Header({ user, role }: HeaderProps) {
  const pathname = usePathname()
  const navItems = getNavItems(role)

  return (
    <header>
      <nav className="main-nav">
        <div className="relative min-h-[120px] flex items-center">
          {/* Left side - Logo - Chid ซ้ายสุด */}
          <div className="absolute left-0 z-20 pl-4">
            <img
              src="/images/cropped-12.png"
              alt="Logo"
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* Left - Navigation Menu */}
          <div className="relative min-h-[120px] flex items-center" style={{ paddingLeft: '510px' }}>
            <div className="main-nav__menu" style={{ zIndex: 99999 }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn('main-nav__link', isActive && 'main-nav__link--active')}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side - Slogan Image - Bottom Right */}
          <div className="absolute right-0 bottom-0 z-20 pr-4" style={{ paddingBottom: '6px' }}>
            <img
              src="/images/vv.png"
              alt="Slogan"
              className="h-40 w-auto object-contain"
            />
          </div>

          {/* Actions - Top Right */}
          <div className="absolute right-0 top-0 z-20 flex items-start gap-2 pr-4" style={{ paddingTop: '44px' }}>
            <button className="icon-button" aria-label="ค้นหา" style={{ marginTop: '0' }}>
              <Search className="h-5 w-5" />
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-black hover:bg-pink-100 hover:text-pink-600"
              style={{ marginTop: '20px' }}
              aria-label="ออกจากระบบ"
            >
              <LogOut className="h-4 w-4 mr-2" />
              ออกจากระบบ
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="icon-button" aria-label="เมนูผู้ใช้">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || undefined} alt={user.name || ''} />
                    <AvatarFallback className="bg-white/20 text-white">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="cursor-pointer"
                >
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </header>
  )
}

