'use client'

import { useState, useCallback, useRef } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function useConfirm() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('คุณแน่ใจหรือไม่ว่าต้องการดำเนินการนี้?')
  const [title, setTitle] = useState('ยืนยันการดำเนินการ')
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((msg?: string, dialogTitle?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (msg) setMessage(msg)
      if (dialogTitle) setTitle(dialogTitle)
      resolveRef.current = resolve
      setOpen(true)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(true)
      resolveRef.current = null
    }
    setOpen(false)
  }, [])

  const handleCancel = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(false)
      resolveRef.current = null
    }
    setOpen(false)
  }, [])

  const ConfirmDialog = () => (
    <AlertDialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleCancel()
      }
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            ตกลง
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { confirm, ConfirmDialog }
}

