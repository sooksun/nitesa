import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads')

export async function saveFile(
  file: File,
  folder: 'supervisions' | 'improvements' | 'schools',
  id: string
): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const folderPath = join(UPLOAD_DIR, folder, id)
  if (!existsSync(folderPath)) {
    await mkdir(folderPath, { recursive: true })
  }

  const filename = `${Date.now()}-${file.name}`
  const filePath = join(folderPath, filename)

  await writeFile(filePath, buffer)

  return `/uploads/${folder}/${id}/${filename}`
}

export async function deleteFile(fileUrl: string): Promise<void> {
  const filePath = join(process.cwd(), 'public', fileUrl)
  if (existsSync(filePath)) {
    await unlink(filePath)
  }
}

export function getFileUrl(fileUrl: string): string {
  return fileUrl.startsWith('http') ? fileUrl : fileUrl
}

