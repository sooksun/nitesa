'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTimeToBE } from '@/lib/date-utils'

interface Activity {
  id: string
  action: string
  entity?: string
  timestamp: Date
  user: {
    name: string
  }
}

interface RecentActivitiesProps {
  activities: Activity[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>กิจกรรมล่าสุด</CardTitle>
        <CardDescription>กิจกรรมที่เกิดขึ้นในระบบ</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">ยังไม่มีกิจกรรม</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.user.name} - {activity.entity || 'ทั่วไป'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDateTimeToBE(activity.timestamp)}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

