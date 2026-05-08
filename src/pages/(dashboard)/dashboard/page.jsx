import React, { useState, useMemo } from "react";

import {
  Activity,
  Wallet,
  ArrowUpRight,
  FileText,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Download,
  Clock,
  Calendar as CalendarIcon,
} from "@/components/icons";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { PageLayout } from "../../../components/layouts/page-layout";
import { BentoCard } from "../../../components/ui/bento-card";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Select } from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";
import { useDashboard } from "../../../hooks/use-dashboard";
import { DateRangePicker } from "../../../components/ui/date-range-picker";
import { DataTable } from "../../../components/tables/data-table";
import { cn } from "../../../lib/utils";

//---------------------------------------------------------

export default function DashboardPage() {
  const {
    isMounted,
    loading,
    selectedOption,
    setSelectedOption,
    selectedUser,
    setSelectedUser,
    fundRequestsPeriod,
    setFundRequestsPeriod,
    selectOptions,
    userOptions,
    transactionFeed,
    businessVolume,
    successFailedData,
    channelData,
    reportsPreview,
    fundRequests
  } = useDashboard();

  const [search, setSearch] = useState("");
  const [date, setDate] = useState({ from: null, to: null });

  // ------------------------------------------------------------
  // Table Columns
  // ------------------------------------------------------------
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "TRANSACTION ID",
        cell: ({ row }) => (
          <span className="mono-badge">#{row.getValue("id")}</span>
        ),
      },
      {
        accessorKey: "service",
        header: "SERVICE TYPE",
        cell: ({ row }) => {
          const service = row.getValue("service");
          return (
            <div className="flex items-center justify-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center border border-white",
                service === "Money Transfer" ? "bg-indigo-50 text-indigo-600" :
                  service === "AEPS Withdrawal" ? "bg-blue-50 text-blue-600" :
                    service === "Bill Payment" ? "bg-orange-50 text-orange-600" :
                      "bg-emerald-50 text-emerald-600"
              )}>
                {service === "Money Transfer" ? <ArrowUpRight className="w-4.5 h-4.5" /> : <Activity className="w-4.5 h-4.5" />}
              </div>
              <span className="font-bold text-slate-900 uppercase tracking-tight text-[12px]">{service}</span>
            </div>
          );
        }
      },
      {
        accessorKey: "user",
        header: "CLIENT / RETAILER",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-50">
              {row.getValue("user").charAt(0)}
            </div>
            <span className="text-[13px] font-bold text-slate-800 tracking-tight transition-colors group-hover:text-slate-950">
              {row.getValue("user")}
            </span>
          </div>
        )
      },
      {
        accessorKey: "date",
        header: "LOGGED AT",
        cell: ({ row }) => {
          const [datePart, timePart] = row.getValue("date").split(",");
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-bold text-slate-900 tracking-tight">{datePart}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{timePart}</span>
            </div>
          );
        }
      },
      {
        accessorKey: "amount",
        header: "AMOUNT",
        cell: ({ row }) => (
          <span className="font-black text-slate-950 text-[14px] tracking-tighter">
            {row.getValue("amount")}
          </span>
        )
      },
      {
        accessorKey: "status",
        header: "STATUS",
        cell: ({ row }) => {
          const status = row.getValue("status");
          return (
            <div className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              status === "Success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-rose-50 text-rose-700 border-rose-200"
            )}>
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                status === "Success" ? "bg-emerald-500" :
                  status === "Pending" ? "bg-amber-500" :
                    "bg-rose-500"
              )} />
              {status}
            </div>
          );
        }
      }
    ],
    []
  );

  if (!isMounted) return null;

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Administrative Intelligence & Financial Overview"
      className="max-w-[1600px] mx-auto overflow-x-hidden"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-[160px]">
            <Select
              placeholder="Select Service"
              options={selectOptions}
              value={selectedOption}
              onChange={setSelectedOption}
              className="h-9 md:h-10 border-slate-200 focus:border-slate-900 transition-all text-[12px] rounded-xl shadow-xs font-semibold"
            />
          </div>

          <div className="w-[160px]">
            <Select
              placeholder="Select User"
              options={userOptions}
              value={selectedUser}
              onChange={setSelectedUser}
              className="h-9 md:h-10 border-slate-200 focus:border-slate-900 transition-all text-[12px] rounded-xl shadow-xs font-semibold"
            />
          </div>

          <DateRangePicker
            date={date}
            setDate={setDate}
            triggerClassName="h-9 md:h-10 min-w-[150px] border-slate-200 rounded-xl shadow-xs text-slate-600 font-medium"
            align="right"
          />
        </div>
      }
    >

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* 2. Success vs Failed Transactions (Graphical View) */}
        {loading ? (
          <BentoCard className="lg:col-span-1 p-6 flex flex-col min-h-[350px]">
            <div className="flex justify-between mb-4">
              <Skeleton className="w-32 h-6" />
              <Skeleton className="w-20 h-4" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Skeleton className="w-40 h-40 rounded-full" />
            </div>
          </BentoCard>
        ) : (
          <BentoCard hasHover={false} className="lg:col-span-1 p-6 flex flex-col min-h-[350px] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-lg">Transaction Status</h3>
              <span className="text-xs font-medium text-slate-400">Past 30 Days</span>
            </div>
            <div className="flex-1 w-full h-full relative min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={successFailedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {successFailedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-slate-600 font-medium ml-1">{value}</span>}
                  />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                <div className="text-center">
                  <p className="text-slate-400 text-xs font-medium font-bold uppercase tracking-widest">Total</p>
                  <p className="text-slate-950 text-2xl font-black tracking-tighter">1,240</p>
                </div>
              </div>
            </div>
          </BentoCard>
        )}

        {/* New Graph: Transactions by Channel */}
        {loading ? (
          <BentoCard className="lg:col-span-1 p-6 flex flex-col min-h-[350px]">
            <div className="flex justify-between mb-4">
              <Skeleton className="w-32 h-6" />
              <Skeleton className="w-20 h-4" />
            </div>
            <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-4">
              <Skeleton className="w-12 h-32 rounded-t-lg" />
              <Skeleton className="w-12 h-24 rounded-t-lg" />
              <Skeleton className="w-12 h-40 rounded-t-lg" />
            </div>
          </BentoCard>
        ) : (
          <BentoCard hasHover={false} className="lg:col-span-1 p-6 flex flex-col min-h-[350px] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-lg">Channel Wise</h3>
              <span className="text-xs font-medium text-slate-400">Monthly Performance</span>
            </div>
            <div className="flex-1 w-full h-full min-h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                  />
                  <RechartsTooltip
                    cursor={{ fill: 'rgba(15, 23, 42, 0.02)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 700, fontSize: '13px' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={42}>
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>
        )}

        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {loading ? (
              Array(2).fill(0).map((_, i) => (
                <BentoCard key={i} className="p-6 flex flex-col justify-center gap-4 h-[130px]">
                  <Skeleton className="w-24 h-4" />
                  <div className="flex gap-3 items-end">
                    <Skeleton className="w-32 h-8" />
                    <Skeleton className="w-12 h-5 rounded-md" />
                  </div>
                </BentoCard>
              ))
            ) : (
              businessVolume.map((biz, idx) => (
                <BentoCard hasHover={false} key={idx} className="p-6 flex flex-col justify-center gap-2 border-l-4 border-l-slate-950 ">
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{biz.label}</p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-3xl font-black text-slate-950 tracking-tighter">{biz.value}</h3>
                    <span className={cn("text-[10px] font-black mb-1.5 px-2 py-0.5 rounded-full uppercase tracking-wider", biz.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                      {biz.trend}
                    </span>
                  </div>
                </BentoCard>
              ))
            )}
          </div>

          <Card className="border border-slate-100 shadow-xs flex-1 bg-white/40 backdrop-blur-md overflow-hidden rounded-2xl">
            {!loading && (
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-black text-slate-950 flex items-center justify-between uppercase tracking-tighter">
                  <span>Reports Overview</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
                    <MoreHorizontal className="w-4 h-4 text-slate-500" />
                  </Button>
                </CardTitle>
              </CardHeader>
            )}
            <CardContent className={cn("grid grid-cols-1 sm:grid-cols-3 gap-6", loading ? "p-6" : "pt-0")}>
              {loading || !reportsPreview ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-32 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-full h-16 rounded-lg" />
                  </div>
                ))
              ) : (
                <>
                  {/* Daily Report */}
                  <div className="group relative bg-white border border-slate-100 hover:border-slate-300 rounded-2xl p-5 transition-all shadow-sm flex flex-col h-[190px] overflow-hidden">
                    <div className="flex justify-between items-start z-10 relative">
                      <div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Daily Log</span>
                        <h4 className="font-bold text-slate-900 tracking-tight">Financial Summary</h4>
                      </div>
                      <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                    </div>

                    <div className="flex-1 w-[130%] -ml-[15%] relative z-0 mt-2 opacity-60 group-hover:opacity-90 transition-opacity">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={reportsPreview.daily}>
                          <defs>
                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="uv" stroke="#6366f1" strokeWidth={3} fill="url(#colorPv)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="z-10 mt-auto flex items-center justify-between relative">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sync Instant</span>
                      <Button size="icon" className="h-8 w-8 rounded-full bg-slate-950 hover:bg-black text-white shadow-lg">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Monthly Report */}
                  <div className="group relative bg-white border border-slate-100 hover:border-slate-300 rounded-2xl p-5 transition-all shadow-sm flex flex-col h-[190px] overflow-hidden">
                    <div className="flex justify-between items-start z-10 relative">
                      <div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Cycle Wise</span>
                        <h4 className="font-bold text-slate-900 tracking-tight">Performance Audit</h4>
                      </div>
                      <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                        <Activity className="w-4.5 h-4.5" />
                      </div>
                    </div>

                    <div className="flex-1 w-[130%] -ml-[15%] relative z-0 mt-2 opacity-60 group-hover:opacity-90 transition-opacity">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={reportsPreview.monthly}>
                          <defs>
                            <linearGradient id="colorM" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="uv" stroke="#10b981" strokeWidth={3} fill="url(#colorM)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="z-10 mt-auto flex items-center justify-between relative">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Growth 12%</span>
                      <Button size="icon" className="h-8 w-8 rounded-full bg-slate-950 hover:bg-black text-white shadow-lg">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Service Report */}
                  <div className="group relative bg-white border border-slate-100 hover:border-slate-300 rounded-2xl p-5 transition-all shadow-sm flex flex-col h-[190px] overflow-hidden">
                    <div className="flex justify-between items-start z-10 relative">
                      <div>
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Channel Log</span>
                        <h4 className="font-bold text-slate-900 tracking-tight">Service Breakdown</h4>
                      </div>
                      <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm border border-orange-100">
                        <CalendarIcon className="w-4.5 h-4.5" />
                      </div>
                    </div>

                    <div className="flex-1 relative z-0 mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportsPreview.service}>
                          <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} barSize={18} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="z-10 mt-auto flex items-center justify-between relative">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Pro Analytics</span>
                      <Button size="icon" className="h-8 w-8 rounded-full bg-slate-950 hover:bg-black text-white shadow-lg">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 1. Fund Requests Overview */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border border-slate-100 shadow-sm bg-white/60 backdrop-blur-md overflow-hidden rounded-2xl">
          <CardHeader className="pb-2 border-b border-slate-50/50">
            <CardTitle className="text-lg font-black text-slate-950 flex items-center justify-between uppercase tracking-tighter">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-950 rounded-xl text-white ">
                  <Wallet className="w-5 h-5" />
                </div>
                <span>Fund Requests Overview</span>
              </div>
              <div className="w-[140px]">
                <Select
                  options={[
                    { label: "Today", value: "today" },
                    { label: "This Week", value: "week" },
                    { label: "This Month", value: "month" }
                  ]}
                  value={fundRequestsPeriod}
                  onChange={setFundRequestsPeriod}
                  placeholder="Select Period"
                  className="bg-slate-50 border-slate-200 h-9 text-[11px] font-bold uppercase tracking-wider"
                  searchable={false}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-stretch gap-8 p-6">
            {loading || !fundRequests.length ? (
              <div className="w-full flex items-center justify-center h-[240px]">
                <Skeleton className="w-[240px] h-[240px] rounded-full" />
              </div>
            ) : (
              <>
                <div className="w-full md:w-[32%] h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fundRequests} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barSize={44}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 800 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      />
                      <RechartsTooltip
                        cursor={{ fill: 'rgba(15, 23, 42, 0.02)', radius: 8 }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#0f172a', fontWeight: 800, fontSize: '13px' }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {fundRequests.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {fundRequests.map((item, idx) => {
                    const totalRequests = fundRequests.reduce((acc, curr) => acc + curr.count, 0);
                    const percentage = Math.round((item.count / totalRequests) * 100);

                    return (
                      <div key={idx} className="relative group overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white p-6  hover:border-slate-300 shadow-sm">
                        <div className="relative z-10 flex flex-col justify-between h-full">
                          <div className="flex justify-between items-start mb-8">
                            <div className={cn(
                              "p-3.5 rounded-2xl shadow-sm border",
                              item.name === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                item.name === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  'bg-red-50 text-red-600 border-red-100'
                            )}>
                              {item.name === 'Approved' ? <CheckCircle2 className="w-5.5 h-5.5" /> :
                                item.name === 'Pending' ? <Clock className="w-5.5 h-5.5" /> :
                                  <XCircle className="w-5.5 h-5.5" />}
                            </div>
                            <span className="text-[11px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 uppercase tracking-widest">{percentage}% Share</span>
                          </div>

                          <div>
                            <p className="text-[11px] font-black text-slate-400 mb-1 uppercase tracking-widest">{item.name} Total</p>
                            <h3 className="text-3xl font-black text-slate-950 tracking-tighter">₹ {(item.value / 1000).toFixed(1)}k</h3>
                            <p className="text-[11px] font-bold text-slate-400 mt-2 bg-slate-50/50 inline-block px-2 py-0.5 rounded-md border border-slate-50">
                              {item.count} Processed Transactions
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Standardized DataTable Integration for Live Feed */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-1">
          <div className="w-1.5 h-7 bg-slate-950 rounded-full shadow-sm" />
          <h2 className="text-xl font-bold text-slate-950 tracking-tight uppercase">
            Latest Live Transactions
          </h2>
        </div>

        <DataTable
          columns={columns}
          data={transactionFeed}
          isLoading={loading}
          columnVisibility={{}}
          setColumnVisibility={() => { }}
          pageSize={10}
          totalRecords={transactionFeed.length}
          exportData={transactionFeed}
          fileName="Dashboard_Transaction_Ledger"
          onSearch={(val) => setSearch(val)}
          search={search}
        />
      </div>
    </PageLayout>
  );
}
