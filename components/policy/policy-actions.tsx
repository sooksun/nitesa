'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { showToast, toastMessages } from '@/lib/toast'
import { useState } from 'react'
import { useConfirm } from '@/hooks/use-confirm'

interface PolicyActionsProps {
  policy: {
    id: string
    code: string
    title: string
  }
}

export function PolicyActions({ policy }: PolicyActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { confirm, ConfirmDialog } = useConfirm()

  const handleDelete = async () => {
    const confirmed = await confirm(toastMessages.delete.confirm, 'ยืนยันการลบ')
    if (!confirmed) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/policies/${policy.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast.success(toastMessages.delete.success)
        setTimeout(() => {
          router.refresh()
        }, 1000)
      } else {
        const error = await response.json()
        showToast.error(error.message || toastMessages.delete.error)
      }
    } catch (error) {
      console.error('Error deleting policy:', error)
      showToast.error(toastMessages.delete.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={loading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/policies/${policy.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              แก้ไข
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            ลบ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog />
    </>
  )
}

