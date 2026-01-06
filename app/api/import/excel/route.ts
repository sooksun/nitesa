import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { parseExcelFile, importSchools, importNetworkGroups, importPolicies, getNetworkGroupMap } from '@/lib/import-excel'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'schools', 'networkGroups', 'policies'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!type || !['schools', 'networkGroups', 'policies'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: schools, networkGroups, or policies' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''

    if (!allowedTypes.includes(file.type) && !['xls', 'xlsx'].includes(fileExtension)) {
      return NextResponse.json({ error: 'Invalid file type. Must be Excel file (.xls, .xlsx)' }, { status: 400 })
    }

    // Read file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parse Excel file
    let data: any[]
    try {
      data = parseExcelFile(buffer)
    } catch (error: any) {
      return NextResponse.json({ error: `Failed to parse Excel file: ${error.message}` }, { status: 400 })
    }

    if (data.length === 0) {
      return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 })
    }

    // Import data based on type
    let result
    switch (type) {
      case 'schools':
        const networkGroupMap = await getNetworkGroupMap()
        result = await importSchools(data, networkGroupMap)
        break
      case 'networkGroups':
        result = await importNetworkGroups(data)
        break
      case 'policies':
        result = await importPolicies(data)
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      result,
      message: `Imported ${result.success} records successfully. ${result.failed} records failed.`,
    })
  } catch (error: any) {
    console.error('Error importing Excel:', error)
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 })
  }
}

