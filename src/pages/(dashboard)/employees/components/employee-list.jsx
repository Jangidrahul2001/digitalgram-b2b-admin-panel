import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DataTable } from "../../../../components/tables/data-table";
import { Trash2, Eye } from "@/components/icons";
import { useFetch } from "../../../../hooks/useFetch";
import { useDelete } from "../../../../hooks/useDelete";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { handleValidationError } from "../../../../utils/helperFunction";
import { toast } from "sonner";
import { EditEmployeeForm } from "./edit-employee-form";
import { ConfirmationModal } from "../../../../components/modals/confirmation-modal";
import ClickToCopy from "../../../../components/ui/ClickToCopy";
import { ActionButtons } from "../../../../components/ui/ActionButtons";

export function EmployeeList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const { refetch: fetchEmployee } = useFetch(
    `${apiEndpoints.employeeList}?page=${pageIndex}&limit=${pageSize}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setEmployees(data?.data);
          setTotalRecords(data?.pagination?.total);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  const { remove: deleteEmployee } = useDelete(
    `${apiEndpoints.deleteEmployee}/${selectedEmployeeId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message || "Employee deleted successfully");
          setSelectedEmployeeId("");
          setDeleteModalOpen(false);
          fetchEmployee();
        }
      },
      onError: (error) => {
        toast.error(
          handleValidationError(error) || "Failed to delete employee",
        );
      },
    },
  );

  useEffect(() => {
    fetchEmployee();
  }, [pageIndex, pageSize, searchQuery]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const handleEditClick = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setSelectedEmployeeId(null);
    fetchEmployee();
  };

  const handleDeleteClick = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteEmployee({ id: selectedEmployeeId });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "SR.NO.",
        center: true,
        cell: ({ row, index }) => (
          <div className="flex items-center justify-center">
            <span className="font-semibold text-slate-500 text-[13px]">
              {(pageIndex - 1) * pageSize + index + 1}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "userName",
        header: "Employee Code",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <ClickToCopy text={row.getValue("userName")}>
              <span className="text-slate-900 font-bold text-[13px] font-mono tracking-wider cursor-pointer hover:text-slate-900 transition-colors">
                {row.getValue("userName")}
              </span>
            </ClickToCopy>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        center: true,
        cell: ({ row }) => (
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-slate-900 font-bold text-[14px]">
              {row.getValue("name")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <ClickToCopy text={row.getValue("email")}>
              <span className="text-[12px] text-slate-600 font-medium lowercase cursor-pointer hover:text-slate-900 transition-colors">
                {row.getValue("email")}
              </span>
            </ClickToCopy>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="text-[12px] text-slate-600 font-bold">
              +91 {row.getValue("phone")}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        center: true,
        cell: ({ row }) => (
          <ActionButtons
            onView={() => handleEditClick(row.original._id)}
            onDelete={() => handleDeleteClick(row.original._id)}
          />
        ),
      },
    ],
    [pageIndex, pageSize],
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-slate-900 rounded-full" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Employees List</h2>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={employees}
          isLoading={isLoading}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPaginationChange={({ pageIndex, pageSize }) => {
            handlePageChange(pageIndex, pageSize);
            setIsLoading(true);
          }}
          onSearch={(val) => setSearchQuery(val)}
          exportData={employees}
          fileName="Employee_Staff_Report"
        />
      </div>

      <EditEmployeeForm
        employeeId={selectedEmployeeId}
        isOpen={editModalOpen}
        onClose={handleCloseEdit}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </>
  );
}
