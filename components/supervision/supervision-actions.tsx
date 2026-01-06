'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SupervisionStatus } from '@prisma/client'
import { showToast, toastMessages } from '@/lib/toast'
import { useConfirm } from '@/hooks/use-confirm'

interface SupervisionActionsProps {
  supervisionId: string
  status: SupervisionStatus
  canEdit: boolean
  canDelete: boolean
  canApprove: boolean
}

export function SupervisionActions({
  supervisionId,
  status,
  canEdit,
  canDelete,
  canApprove,
}: SupervisionActionsProps) {
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
      const response = await fetch(`/api/supervisions/${supervisionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast.success(toastMessages.delete.success)
        setTimeout(() => {
          router.push('/supervisions')
        }, 1000)
      } else {
        const error = await response.json()
        showToast.error(error.message || toastMessages.delete.error)
      }
    } catch (error) {
      console.error('Error deleting supervision:', error)
      showToast.error(toastMessages.delete.error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/supervisions/${supervisionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      })

      if (response.ok) {
        showToast.success('อนุมัติการนิเทศสำเร็จ')
        setTimeout(() => {
          router.refresh()
        }, 1000)
      } else {
        const error = await response.json()
        showToast.error(error.message || 'เกิดข้อผิดพลาดในการอนุมัติ')
      }
    } catch (error) {
      console.error('Error approving supervision:', error)
      showToast.error('เกิดข้อผิดพลาดในการอนุมัติ')
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
          {canEdit && (
            <DropdownMenuItem onClick={() => router.push(`/supervisions/${supervisionId}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              แก้ไข
            </DropdownMenuItem>
          )}
          {canApprove && status !== 'APPROVED' && (
            <DropdownMenuItem onClick={handleApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              อนุมัติ
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem onClick={handleDelete} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              ลบ
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog />
    </>
  )
}

