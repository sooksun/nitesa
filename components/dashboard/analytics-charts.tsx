'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IndicatorRadarChart } from '@/components/charts/indicator-radar-chart'
import { SupervisionStatusChart } from '@/components/charts/supervision-status-chart'
import { PolicyUsageChart } from '@/components/charts/policy-usage-chart'
import { NetworkGroupChart } from '@/components/charts/network-group-chart'
import { DistrictSupervisionChart } from '@/components/charts/district-supervision-chart'
import { SupervisorPerformanceChart } from '@/components/charts/supervisor-performance-chart'
import { PolicyByTypeChart } from '@/components/charts/policy-by-type-chart'
import { AcademicYearTrendChart } from '@/components/charts/academic-year-trend-chart'
import { IndicatorLevelDonutChart } from '@/components/charts/indicator-level-donut-chart'
import { SchoolIndicatorComparisonChart } from '@/components/charts/school-indicator-comparison-chart'

export function AnalyticsCharts() {
  const [indicatorRadarData, setIndicatorRadarData] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [policyUsageData, setPolicyUsageData] = useState<any[]>([])
  const [networkGroupData, setNetworkGroupData] = useState<any[]>([])
  const [districtData, setDistrictData] = useState<any[]>([])
  const [supervisorData, setSupervisorData] = useState<any[]>([])
  const [academicYearData, setAcademicYearData] = useState<any[]>([])
  const [indicatorLevelData, setIndicatorLevelData] = useState<any[]>([])
  const [schoolComparisonData, setSchoolComparisonData] = useState<any[]>([])
  const [policyByTypeData, setPolicyByTypeData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          radarRes,
          statusRes,
          policyUsageRes,
          networkGroupRes,
          districtRes,
          supervisorRes,
          academicYearRes,
          policyByTypeRes,
          schoolIndicatorsRes,
        ] = await Promise.all([
          fetch('/api/analytics/indicators/radar'),
          fetch('/api/analytics/supervision/status'),
          fetch('/api/analytics/policy/usage'),
          fetch('/api/analytics/network-groups'),
          fetch('/api/analytics/districts'),
          fetch('/api/analytics/supervisors'),
          fetch('/api/analytics/academic-years'),
          fetch('/api/analytics/policy-by-type'),
          fetch('/api/analytics/school-indicators'),
        ])

        const [
          radarData,
          statusData,
          policyUsageData,
          networkGroupData,
          districtData,
          supervisorData,
          academicYearData,
          policyByTypeData,
          schoolIndicatorsData,
        ] = await Promise.all([
          radarRes.json(),
          statusRes.json(),
          policyUsageRes.json(),
          networkGroupRes.json(),
          districtRes.json(),
          supervisorRes.json(),
          academicYearRes.json(),
          policyByTypeRes.json(),
          schoolIndicatorsRes.json(),
        ])

        setIndicatorRadarData(radarData.indicators || [])
        setStatusData(statusData.statuses || [])
        setPolicyUsageData(policyUsageData.policies || [])
        setNetworkGroupData(networkGroupData.groups || [])
        setDistrictData(districtData.districts || [])
        setSupervisorData(supervisorData.supervisors || [])
        setAcademicYearData(academicYearData.years || [])

        // Calculate indicator level distribution
        const levelCounts: Record<string, number> = {
          EXCELLENT: 0,
          GOOD: 0,
          FAIR: 0,
          NEEDS_WORK: 0,
        }
        radarData.indicators?.forEach((ind: any) => {
          levelCounts.EXCELLENT += ind.EXCELLENT || 0
          levelCounts.GOOD += ind.GOOD || 0
          levelCounts.FAIR += ind.FAIR || 0
          levelCounts.NEEDS_WORK += ind.NEEDS_WORK || 0
        })
        setIndicatorLevelData(
          Object.entries(levelCounts).map(([level, count]) => ({ level, count }))
        )

        setPolicyByTypeData(policyByTypeData.data || [])
        setSchoolComparisonData(schoolIndicatorsData.schools || [])
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            กำลังโหลดข้อมูล...
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section 1: ภาพรวมตัวชี้วัด */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>การกระจายตัวชี้วัด</CardTitle>
            <CardDescription>แสดงผลตัวชี้วัดแต่ละประเภทในรูปแบบ Spider Chart</CardDescription>
          </CardHeader>
          <CardContent>
            {indicatorRadarData.length > 0 ? (
              <IndicatorRadarChart data={indicatorRadarData} />
            ) : (
              <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สัดส่วนตัวชี้วัด</CardTitle>
            <CardDescription>แสดงสัดส่วนตัวชี้วัดทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            {indicatorLevelData.length > 0 ? (
              <IndicatorLevelDonutChart data={indicatorLevelData} />
            ) : (
              <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 2: ภาพรวมการนิเทศ */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>สถานะการนิเทศ</CardTitle>
            <CardDescription>แสดงสัดส่วนของสถานะต่างๆ</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <SupervisionStatusChart data={statusData} />
            ) : (
              <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การใช้นโยบาย</CardTitle>
            <CardDescription>แสดงสัดส่วนการใช้นโยบาย</CardDescription>
          </CardHeader>
          <CardContent>
            {policyUsageData.length > 0 ? (
              <PolicyUsageChart data={policyUsageData} />
            ) : (
              <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>แนวโน้มตามปีการศึกษา</CardTitle>
            <CardDescription>แสดงแนวโน้มการนิเทศตามปีการศึกษา</CardDescription>
          </CardHeader>
          <CardContent>
            {academicYearData.length > 0 ? (
              <AcademicYearTrendChart data={academicYearData} />
            ) : (
              <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 3: การวิเคราะห์เชิงเปรียบเทียบ */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>การนิเทศแยกตามกลุ่มเครือข่าย</CardTitle>
            <CardDescription>เปรียบเทียบการนิเทศระหว่างกลุ่มเครือข่าย</CardDescription>
          </CardHeader>
          <CardContent>
            {networkGroupData.length > 0 ? (
              <NetworkGroupChart data={networkGroupData} />
            ) : (
              <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การนิเทศแยกตามอำเภอ</CardTitle>
            <CardDescription>เปรียบเทียบการนิเทศระหว่างอำเภอ</CardDescription>
          </CardHeader>
          <CardContent>
            {districtData.length > 0 ? (
              <DistrictSupervisionChart data={districtData} />
            ) : (
              <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ประสิทธิภาพผู้นิเทศ</CardTitle>
            <CardDescription>เปรียบเทียบประสิทธิภาพผู้นิเทศ</CardDescription>
          </CardHeader>
          <CardContent>
            {supervisorData.length > 0 ? (
              <SupervisorPerformanceChart data={supervisorData} />
            ) : (
              <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 4: การวิเคราะห์เชิงลึก */}
      <div className="grid gap-4 md:grid-cols-2">
        {policyByTypeData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>การใช้นโยบายตามประเภท</CardTitle>
              <CardDescription>วิเคราะห์การใช้นโยบายตามประเภทการนิเทศ</CardDescription>
            </CardHeader>
            <CardContent>
              <PolicyByTypeChart data={policyByTypeData} />
            </CardContent>
          </Card>
        )}

        {schoolComparisonData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>เปรียบเทียบตัวชี้วัดระหว่างโรงเรียน</CardTitle>
              <CardDescription>เปรียบเทียบผลการประเมินระหว่างโรงเรียน</CardDescription>
            </CardHeader>
            <CardContent>
              <SchoolIndicatorComparisonChart data={schoolComparisonData} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

