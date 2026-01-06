'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  baseUrl?: string
  pageParam?: string // Custom page parameter name (e.g., 'ministerPage', 'obecPage')
}

export function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  baseUrl,
  pageParam = 'page',
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Don't show pagination if total items is less than or equal to itemsPerPage
  if (totalItems <= itemsPerPage) {
    return null
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete(pageParam)
    } else {
      params.set(pageParam, page.toString())
    }
    const queryString = params.toString()
    const url = baseUrl
      ? `${baseUrl}${queryString ? `?${queryString}` : ''}`
      : `${window.location.pathname}${queryString ? `?${queryString}` : ''}`
    router.push(url)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than maxVisible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        ก่อนหน้า
      </Button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            )
          }

          const pageNumber = page as number
          return (
            <Button
              key={pageNumber}
              variant={currentPage === pageNumber ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(pageNumber)}
              className="min-w-[40px]"
            >
              {pageNumber}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ถัดไป
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="ml-4 text-sm text-muted-foreground">
        หน้า {currentPage} จาก {totalPages} ({totalItems} รายการ)
      </div>
    </div>
  )
}

