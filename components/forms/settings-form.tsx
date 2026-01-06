'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface SettingsFormProps {
  supervisionTypes: string[]
  indicatorCriteria: {
    EXCELLENT: { min?: number; max?: number; label: string }
    GOOD: { min?: number; max?: number; label: string }
    FAIR: { min?: number; max?: number; label: string }
    NEEDS_WORK: { min?: number; max?: number; label: string }
  }
}

export function SettingsForm({ supervisionTypes: initialTypes, indicatorCriteria: initialCriteria }: SettingsFormProps) {
  const [supervisionTypes, setSupervisionTypes] = useState(initialTypes)
  const [indicatorCriteria, setIndicatorCriteria] = useState(initialCriteria)
  const [loading, setLoading] = useState(false)

  const addSupervisionType = () => {
    setSupervisionTypes([...supervisionTypes, ''])
  }

  const removeSupervisionType = (index: number) => {
    setSupervisionTypes(supervisionTypes.filter((_, i) => i !== index))
  }

  const updateSupervisionType = (index: number, value: string) => {
    const updated = [...supervisionTypes]
    updated[index] = value
    setSupervisionTypes(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supervisionTypes,
          indicatorCriteria,
        }),
      })

      if (response.ok) {
        showToast.success('บันทึกการตั้งค่าเรียบร้อย')
      } else {
        showToast.error('เกิดข้อผิดพลาดในการบันทึก')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      showToast.error('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ประเภทการนิเทศ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {supervisionTypes.map((type, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={type}
                onChange={(e) => updateSupervisionType(index, e.target.value)}
                placeholder="ประเภทการนิเทศ"
              />
              {supervisionTypes.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSupervisionType(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addSupervisionType}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มประเภท
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>เกณฑ์การประเมินตัวชี้วัด</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(indicatorCriteria).map(([key, criteria]) => (
            <div key={key} className="border rounded-lg p-4 space-y-2">
              <Label className="font-semibold">{criteria.label}</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>คะแนนต่ำสุด</Label>
                  <Input
                    type="number"
                    value={criteria.min || ''}
                    onChange={(e) => {
                      setIndicatorCriteria({
                        ...indicatorCriteria,
                        [key]: {
                          ...criteria,
                          min: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }}
                    placeholder="ต่ำสุด"
                  />
                </div>
                <div>
                  <Label>คะแนนสูงสุด</Label>
                  <Input
                    type="number"
                    value={criteria.max || ''}
                    onChange={(e) => {
                      setIndicatorCriteria({
                        ...indicatorCriteria,
                        [key]: {
                          ...criteria,
                          max: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }}
                    placeholder="สูงสุด"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Button>
      </div>
    </form>
  )
}

