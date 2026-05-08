"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, Filter } from "@/components/icons"
import { useState, useEffect } from "react"
import { SidebarPageTransition } from "../../../components/ui/sidebar-page-transition"
import { useAnalytics } from "../../../hooks/use-analytics"

const COLORS = ['hsl(var(--primary))', '#8884d8', '#82ca9d', '#ffc658'];

export default function AnalyticsPage() {
  const { monthly: monthlyData, device: deviceData, isLoading } = useAnalytics()
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return (
    <SidebarPageTransition className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your platform&apos;s performance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
          <Card className="md:col-span-4 h-[450px] animate-pulse bg-slate-100" />
          <Card className="md:col-span-3 h-[450px] animate-pulse bg-slate-100" />
          <Card className="lg:col-span-7 h-[400px] animate-pulse bg-slate-100" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="md:col-span-4 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Revenue vs User Growth</CardTitle>
              <CardDescription>Comparative analysis of monthly revenue and user acquisition.</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[350px] w-full" style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="users" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Device Distribution</CardTitle>
              <CardDescription>User breakdown by device type.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full flex items-center justify-center" style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                {deviceData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-7 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Traffic Trends</CardTitle>
              <CardDescription>Daily traffic analysis over the last week.</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[300px] w-full" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </SidebarPageTransition>
  )
}
