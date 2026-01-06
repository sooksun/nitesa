'use client'

/** @jsxRuntime classic */
/** @jsx React.createElement */

import React from 'react'
import { toast, ToastOptions } from 'react-toastify'

// Toast utility functions with Thai messages
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, options)
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, options)
  },

  info: (message: string, options?: ToastOptions) => {
    toast.info(message, options)
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, options)
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

