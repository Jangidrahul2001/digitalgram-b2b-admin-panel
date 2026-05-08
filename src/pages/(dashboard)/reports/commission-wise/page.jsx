import React from "react"
import { Select } from "../../../../components/ui/select"
import { DataTable } from "../../../../components/tables/data-table"
import { PageLayout } from "../../../../components/layouts/page-layout"
import { DateRangePicker } from "../../../../components/ui/date-range-picker"
import ClickToCopy from "../../../../components/ui/ClickToCopy"
import ExpandableMessage from "../../../../components/ui/ExpandableMessage"
import { formatDate } from "../../../../utils/helperFunction"


const userOptions = [
  { label: "All Users", value: "all" },
  { label: "Rahul Jangid", value: "rahul" },
  { label: "Amit Sharma", value: "amit" },
]

// Commission Dummy Data
const dummyData = Array.from({ length: 8 }).map((_, i) => ({
  id: `${i + 1}`,
  date: `2024-03-${22 - i}`,
  userId: `USR00${201 + i}`,
  txnId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  description: i % 2 === 0 ? "Commission for DMT XXXX1234" : "Recharge Cashback Earned",
  amount: (Math.random() * 1500 + 50).toFixed(2),
  charges: "0.00",
  gst: (Math.random() * 2).toFixed(2),
  tds: (Math.random() * 1).toFixed(2),
}))

const serviceOptions = [
  { label: "All Services", value: "all" },
  { label: "Recharge", value: "recharge" },
  { label: "DMT", value: "dmt" },
  { label: "BBPS", value: "bbps" },
  { label: "AEPS", value: "aeps" },
]

export default function CommissionWiseReportPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [date, setDate] = React.useState({
    from: null,
    to: null,
  })
  const [selectedUser, setSelectedUser] = React.useState("")
  const [selectedService, setSelectedService] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [pageIndex, setPageIndex] = React.useState(1)
  const [pageSize] = React.useState(10)

  const columns = React.useMemo(() => [
    {
      accessorKey: "index",
      header: "ID",
      center: true,
      cell: ({ row, index }) => (
        <div className="flex justify-center">
          <span className="font-semibold text-slate-500 text-[13px]">
            {(pageIndex - 1) * pageSize + index + 1}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "DATE", center: true,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span className="text-slate-600 font-medium whitespace-nowrap text-[13px]">{formatDate(row.getValue("date"))}</span>
        </div>
      )
    },
    {
      accessorKey: "userId",
      header: "USER ID", center: true,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <ClickToCopy text={row.getValue("userId")}>
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-[11px] font-extrabold text-slate-900 whitespace-nowrap border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
              {row.getValue("userId")}
            </span>
          </ClickToCopy>
        </div>
      )
    },
    {
      accessorKey: "txnId",
      header: "TRANSACTION ID", center: true,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <ClickToCopy text={row.getValue("txnId")}>
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-tight whitespace-nowrap border border-slate-200/60">
              {row.getValue("txnId")}
            </span>
          </ClickToCopy>
        </div>
      )
    },

    {
      accessorKey: "amount",
      header: "AMOUNT", center: true,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span className="text-slate-900 font-black text-[13px]">₹ {row.getValue("amount")}</span>
        </div>
      )
    },
    {
      accessorKey: "charges",
      header: "CHARGES", center: true,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span className="text-rose-600 font-bold text-[13px]">₹ {row.getValue("charges")}</span>
        </div>
      )
    },
    {
      accessorKey: "gst",
      header: "GST", center: true,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span className="text-slate-500 font-medium text-[12px]">₹ {row.getValue("gst")}</span>
        </div>
      )
    },
    {
      accessorKey: "tds",
      header: "TDS", center: true,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span className="text-slate-500 font-medium text-[12px]">₹ {row.getValue("tds")}</span>
        </div>
      )
    },
    {
      accessorKey: "description",
      header: "DESCRIPTION", center: true,
      cell: ({ row }) => <ExpandableMessage text={row.getValue("description")} />
    },
  ], [pageIndex, pageSize]);

  const handleSearch = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 800)
  }

  const handleReset = () => {
    setDate({ from: null, to: null })
    setSelectedUser("")
    setSelectedService("all")
  }

  const filterActions = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-[160px]">
        <Select
          placeholder="Service"
          options={serviceOptions}
          value={selectedService}
          onChange={setSelectedService}
          className="h-9 md:h-10 border-slate-200 rounded-xl text-xs font-bold"
        />
      </div>

      <div className="w-[160px]">
        <Select
          placeholder="Users"
          options={userOptions}
          value={selectedUser}
          onChange={setSelectedUser}
          className="h-9 md:h-10 border-slate-200 rounded-xl text-xs font-bold"
        />
      </div>

      <DateRangePicker
        date={date}
        setDate={setDate}
        onApply={handleSearch}
        onReset={handleReset}
        triggerClassName="h-9 md:h-10 min-w-[150px] border-slate-200 rounded-xl shadow-xs text-slate-600 font-medium"
        align="right"
      />
    </div>
  );

  return (
    <PageLayout
      title="Commission Wise Report"
      subtitle="Track earnings and commissions across services.
"
      showBackButton={false}
      actions={filterActions}
    >
      <div className="flex flex-col gap-6 font-sans">
        {/* Results Section */}
        <div className="p-0">
          <DataTable
            columns={columns}
            data={dummyData}
            isLoading={isLoading}
            onSearch={setSearch}
            searchValue={search}
            exportData={dummyData}
            exportColumns={columns}
            fileName="Commission_Report"
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
          />
        </div>
      </div>
    </PageLayout>
  )
}
