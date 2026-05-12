import { toast } from "sonner";
import { useFetch } from "../../../hooks/useFetch";
import { useEffect, useMemo, useState } from "react";
import { apiEndpoints } from "../../../api/apiEndpoints";
import { formatDate } from "../../../utils/helperFunction";
import { DataTable } from "../../../components/tables/data-table";
import { PageLayout } from "../../../components/layouts/page-layout";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const { refetch: fetchEnquires } = useFetch(
    `${apiEndpoints.fetchEnquires}?page=${pageIndex}&limit=${pageSize}${searchQuery ? `&search=${searchQuery}` : ""}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setEnquiries(data?.data);
          setTotalRecords(data?.pagination?.total);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching enquires:", error);
        toast.error("Lead synchronization failure.");
        setIsLoading(false);
      },
    },
    false
  );

  useEffect(() => {
    fetchEnquires();
  }, [pageIndex, pageSize, searchQuery]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "SN",
        center: true,
        cell: ({ row, index }) => (
          <div className="flex justify-center">
            <span className="font-semibold text-slate-500">
              {(pageIndex - 1) * pageSize + index + 1}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "CLIENT NAME",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="font-bold text-slate-900 tracking-tight uppercase text-[13px]">
              {row.getValue("name")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "CONTACT NO",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="text-slate-600 font-medium font-mono text-[13px]">
              {row.getValue("phone")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "EMAIL",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="text-slate-500 font-medium text-[13px] lowercase tracking-tight">
              {row.getValue("email")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "message",
        header: "ENQUIRY MESSAGE",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <p
              className="text-slate-500 max-w-sm truncate text-[13px] leading-relaxed"
              title={row.getValue("message")}
            >
              {row.getValue("message")}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "CREATED AT",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="text-slate-500 text-[12px] font-medium">
              {formatDate(row.getValue("createdAt"))}
            </span>
          </div>
        ),
      },
    ],
    [pageIndex, pageSize]
  );

  return (
    <PageLayout
      title="Web Enquiries"
      subtitle="Administrative Management of Website Lead Communication"
    >
      <div className="flex flex-col gap-6">
        {/* Screenshot-Matched Header Section */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-1.5 h-7 bg-slate-950 rounded-full" />
          <h2 className="text-xl font-bold text-slate-950 tracking-tight">
            Recent Enquiries
          </h2>
        </div>

        {/* High-Fidelity DataTable with Internal Search/Action props */}
        <DataTable
          columns={columns}
          data={enquiries}
          isLoading={isLoading}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPaginationChange={({ pageIndex, pageSize }) => {
            handlePageChange(pageIndex, pageSize);
            setIsLoading(true);
          }}
          onSearch={(val) => {
            setSearchQuery(val);
            setPageIndex(1);
          }}
          exportData={enquiries}
          fileName="Web_Enquiries_Audit"
        />
      </div>
    </PageLayout>
  );
}
