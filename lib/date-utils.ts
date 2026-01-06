/**
 * Utility functions for date conversion between AD (ค.ศ.) and BE (พ.ศ.)
 * BE = AD + 543
 */

/**
 * Convert AD year to BE year
 */
export function adToBe(year: number): number {
  return year + 543
}

/**
 * Convert BE year to AD year
 */
export function beToAd(year: number): number {
  return year - 543
}

/**
 * Convert Date object to BE date string (dd/MM/yyyy format)
 */
export function formatDateToBE(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = adToBe(d.getFullYear())
  return `${day}/${month}/${year}`
}

/**
 * Convert Date object to BE date string with Thai month name
 */
export function formatDateToBEWithMonth(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = d.getDate()
  const month = d.getMonth()
  const year = adToBe(d.getFullYear())
  
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]
  
  return `${day} ${thaiMonths[month]} ${year}`
}

/**
 * Convert BE date string (dd/MM/yyyy) to AD Date object
 */
export function parseBEDate(dateString: string): Date {
  const [day, month, year] = dateString.split('/').map(Number)
  const adYear = beToAd(year)
  return new Date(adYear, month - 1, day)
}

/**
 * Convert AD date string (YYYY-MM-DD) to BE date string (dd/MM/yyyy)
 */
export function adDateStringToBE(adDateString: string): string {
  const [year, month, day] = adDateString.split('-').map(Number)
  const beYear = adToBe(year)
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${beYear}`
}

/**
 * Convert BE date string (dd/MM/yyyy) to AD date string (YYYY-MM-DD)
 */
export function beDateStringToAD(beDateString: string): string {
  const [day, month, year] = beDateString.split('/').map(Number)
  const adYear = beToAd(year)
  return `${adYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

/**
 * Get current date in BE format (dd/MM/yyyy)
 */
export function getCurrentBEDate(): string {
  return formatDateToBE(new Date())
}

/**
 * Get current date in AD format (YYYY-MM-DD) for date input
 */
export function getCurrentADDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Convert Date object to BE datetime string (dd/MM/yyyy HH:mm format)
 */
export function formatDateTimeToBE(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = adToBe(d.getFullYear())
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Convert Date object to BE date string (dd/MM/yyyy format) - short version
 */
export function formatDateToBEShort(date: Date | string): string {
  return formatDateToBE(date)
}

