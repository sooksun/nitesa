'use client'

import React from 'react'
import { toast, ToastOptions } from 'react-toastify'

// Toast utility functions with Thai messages
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      icon: '✅',
      ...options,
    })
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      icon: '❌',
      ...options,
    })
  },

  info: (message: string, options?: ToastOptions) => {
    toast.info(message, {
      icon: 'ℹ️',
      ...options,
    })
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      icon: '⚠️',
      ...options,
    })
  },

  // Confirm dialog using toast with promise
  confirm: (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const ConfirmToast = ({ closeToast }: { closeToast: () => void }) => {
        const handleConfirm = () => {
          resolve(true)
          closeToast()
        }
        const handleCancel = () => {
          resolve(false)
          closeToast()
        }
        return (
          <div className="flex flex-col gap-3">
            <p className="font-medium">{message}</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
              >
                ตกลง
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )
      }

      toast(
        ({ closeToast }: { closeToast: () => void }) => (
          <ConfirmToast closeToast={closeToast} />
        ),
        {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
        }
      )
    })
  },
}

// Predefined messages
export const toastMessages = {
  create: {
    success: 'บันทึกข้อมูลสำเร็จ',
    error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
  },
  update: {
    success: 'อัปเดตข้อมูลสำเร็จ',
    error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
  },
  delete: {
    success: 'ลบข้อมูลสำเร็จ',
    error: 'เกิดข้อผิดพลาดในการลบข้อมูล',
    confirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?',
  },
  upload: {
    success: 'อัปโหลดไฟล์สำเร็จ',
    error: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์',
  },
  save: {
    success: 'บันทึกสำเร็จ',
    error: 'เกิดข้อผิดพลาดในการบันทึก',
  },
}

