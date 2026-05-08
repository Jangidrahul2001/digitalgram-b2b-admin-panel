"use client";
import React, { useState, useEffect } from "react";
import { DataTable } from "../../../components/tables/data-table";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  ChevronDown,
  Pencil,
  Package as PackageIcon,
  X,
  Plus
} from "@/components/icons";
import { Trash2 } from "lucide-react";
import { SidebarPageTransition } from "../../../components/ui/sidebar-page-transition";
import { Select } from "../../../components/ui/select";
import { toast } from "sonner";
import { ConfirmationModal } from "../../../components/modals/confirmation-modal";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../../../components/ui/skeleton";
import { ActionButtons } from "../../../components/ui/ActionButtons";
import { apiEndpoints } from "../../../api/apiEndpoints";
import { useFetch } from "../../../hooks/useFetch";
import { usePut } from "../../../hooks/usePut";
import { usePost } from "../../../hooks/usePost";
import { usePatch } from "../../../hooks/usePatch";
import { useDelete } from "../../../hooks/useDelete";
import { formatAlphaNumeric, handleValidationError } from "../../../utils/helperFunction";
import { cn } from "../../../lib/utils";
import { PageLayout } from "../../../components/layouts/page-layout";

const StatusToggle = ({ row, onToggle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isActive = row.original.isActive === true || row.original.status === "Active";

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "group relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none",
          isActive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "bg-slate-200"
        )}
      >
        <motion.span
          animate={{ x: isActive ? 16 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0"
        />
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          onToggle(row.original);
          setIsModalOpen(false);
        }}
        title={isActive ? "Deactivate Package?" : "Activate Package?"}
        description="Are you sure you want to change the status of this package? It may affect users assigned to it."
        confirmText={isActive ? "Deactivate" : "Activate"}
        isDestructive={isActive}
      />
    </>
  );
};

export default function PackagePage() {
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState("")
  const [packages, setPackages] = useState([]);
  const [packageName, setPackageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});

  // Edit Name State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [newName, setNewName] = useState("");
  const [newSelectedRole, setNewSelectedRole] = useState("")
  const [updatingName, setUpdatingName] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusPackage, setStatusPackage] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [search, setSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [pageSize, setPageSize] = useState(50);
  const [pageIndex, setPageIndex] = useState(1);

  const { refetch: fetchRoles } = useFetch(
    `${apiEndpoints.fetchRole}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const temp = data.data?.map((role) => ({
            label: role.name,
            value: role._id,
            ...role,
          }));
          setRoles(temp);
        }
      },
      onError: (error) => {
        console.error("Error fetching roles:", error);
        toast.error(handleValidationError(error) || "Something went wrong");

      },
    },
    true,
  );

  const { refetch: refetchPackages } = useFetch(
    `${apiEndpoints.fetchPackages}`,
    {
      onSuccess: (data) => {
        setPackages(data.data);
        setFetching(false);
      },
      onError: (error) => {
        console.error("Error fetching packages:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setFetching(false);
      },
    },
    true, // auto fetch on mount
  );

  const { post: createPackage } = usePost(apiEndpoints?.createPackage, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Package created successfully");
        setPackageName("");
        setSelectedRole("");
        setErrors({});
        refetchPackages();
      }
    },

    onError: (error) => {
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const validateCreateForm = () => {
    const newErrors = {};

    if (!selectedRole) {
      newErrors.selectedRole = "Role is required";
    }

    if (!packageName.trim()) {
      newErrors.packageName = "Package name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePackage = async () => {
    if (!validateCreateForm()) {
      return;
    }

    setLoading(true);
    try {
      createPackage({
        name: packageName.trim(),
        role: selectedRole
      });
    } catch (error) {
      toast.error(error.message || "Failed to create package");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  // --- Update Name Handlers ---
  const openEditModal = (pkg) => {
    setEditingPackage(pkg);
    setNewName(pkg.name || "");
    setNewSelectedRole(pkg.roleId || "");
    setEditErrors({});
    setEditModalOpen(true);
  };

  const { put: updatePackage } = usePut(`${apiEndpoints?.updatePackage}`, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Package updated successfully");
        setEditModalOpen(false);
        setEditingPackage(null);
        setEditErrors({});
        refetchPackages();
        setUpdatingName(false);
      }
    },

    onError: (error) => {
      console.error("Error updating package:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const validateEditForm = () => {
    const newErrors = {};

    if (!newSelectedRole) {
      newErrors.newSelectedRole = "Role is required";
    }

    if (!newName.trim()) {
      newErrors.newName = "Package name is required";
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateName = async () => {
    if (!validateEditForm()) {
      return;
    }

    setUpdatingName(true);
    try {
      updatePackage(editingPackage?._id, {
        name: newName.trim(),
        role: newSelectedRole
      });
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    } finally {
      setUpdatingName(false);
    }
  };

  // --- Toggle Status Handlers ---
  const columns = React.useMemo(() => [
    {
      accessorKey: "index",
      header: "SR.NO.",
      cell: ({ row }) => (
        <span className="font-bold text-slate-400 text-xs">{row.index + 1}</span>
      )
    },
    {
      accessorKey: "name",
      header: "PACKAGE NAME",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-700">{row.original.name || row.original.pkgName}</span>
      )
    },
    {
      accessorKey: "roleName",
      header: "ROLE NAME",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-700">{row.original.roleName || "N/A"}</span>
      )
    }, {
      id: "status",
      header: "STATUS",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <StatusToggle row={row} onToggle={(pkg) => handlePackageStatusToggle(pkg)} />
        </div>
      )
    },
    {
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <ActionButtons 
          onEdit={() => openEditModal(row.original)}
          onDelete={() => initiateDelete(row.original)}
        />
      )
    }
  ], []);

  const { patch: updatePackageStatus } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Package status updated successfully");
        refetchPackages();
      }
    },

    onError: (error) => {
      console.error("Error updating package status:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const handlePackageStatusToggle = async (pkg) => {
    setUpdatingStatus(true);
    try {
      const pkgId = pkg.id || pkg._id;
      const isCurrentlyActive = pkg.isActive === true || pkg.status === "Active";
      const newStatus = !isCurrentlyActive;

      updatePackageStatus(`${apiEndpoints?.updatePackageStatus}/${pkgId}`, {
        isActive: newStatus,
        status: newStatus ? "Active" : "Inactive",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // --- Delete Package Handlers ---
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingPackage, setDeletingPackage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const initiateDelete = (pkg) => {
    setDeletingPackage(pkg);
    setDeleteModalOpen(true);
  };

  const { remove: deletePackage } = useDelete(
    `${apiEndpoints?.deletePackage}/${deletingPackage?._id}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success("Package deleted successfully");
          setDeleteModalOpen(false);
          setDeletingPackage(null);
          refetchPackages();
        }
      },

      onError: (error) => {
        console.error("Error deleting package:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
  );

  const handleDeletePackage = async () => {
    if (!deletingPackage) return;

    setIsDeleting(true);
    try {
      deletePackage();
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageLayout
      title="Package Management"
      subtitle="Create and manage user role packages."
    >
      <div className="flex flex-col gap-8">
        {/* Add New Package Card */}
        <div className="bg-white rounded-[1.5rem] border border-slate-200/60 p-6 md:p-8 transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white">
              <PackageIcon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Add New Package</h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Role
                </label>
                <Select
                  options={roles}
                  placeholder="Select Role"
                  value={selectedRole}
                  onChange={(value) => {
                    setSelectedRole(value);
                    if (errors.selectedRole) {
                      setErrors(prev => ({ ...prev, selectedRole: "" }));
                    }
                  }}
                  error={errors.selectedRole}
                />
              </div>
              {/* Package Name Input */}
              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Package Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter package name"
                  value={packageName}
                  onChange={(e) => {
                    setPackageName(formatAlphaNumeric(e.target.value, 50));
                    if (errors.packageName) {
                      setErrors(prev => ({ ...prev, packageName: "" }));
                    }
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleCreatePackage()}
                  error={errors.packageName}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-2">
              <Button
                className="bg-slate-900 hover:bg-slate-800 text-white h-11 px-8 rounded-xl font-semibold active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleCreatePackage}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Package"}
              </Button>
              <Button
                variant="ghost"
                className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 h-11 px-8 rounded-xl font-medium"
                onClick={() => {
                  setPackageName("");
                  setSelectedRole("");
                  setErrors({});
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>

        {/* Packages List Card */}
        <div className="bg-white rounded-[1.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="p-0">
            <DataTable
              columns={columns}
              data={packages}
              isLoading={fetching}
              loadingMessage="Fetching packages..."
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
              pageSize={pageSize}
              totalRecords={packages.length}
              onPaginationChange={({ pageIndex, pageSize }) => {
                handlePageChange(pageIndex, pageSize);
                setFetching(true);
              }}
              onSearch={(val) => setSearch(val)}
              exportData={packages}
              exportColumns={columns}
              fileName="Packages_Export"
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeletePackage}
        title="Delete Package"
        description="Are you sure you want to delete this package? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        isDestructive={true}
      />

      {/* Edit Package Modal */}
      <ConfirmationModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditErrors({});
        }}
        onConfirm={handleUpdateName}
        title="Edit Package"
        description="Update the package details below."
        confirmText={updatingName ? "Updating..." : "Update Package"}
      >
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Role Name
            </label>
            <Select
              value={newSelectedRole}
              options={roles}
              onChange={(value) => {
                setNewSelectedRole(value);
                if (editErrors.newSelectedRole) {
                  setEditErrors(prev => ({ ...prev, newSelectedRole: "" }));
                }
              }}
              placeholder="Select Role"
              error={editErrors.newSelectedRole}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Package Name
            </label>
            <Input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(formatAlphaNumeric(e.target.value, 50));
                if (editErrors.newName) {
                  setEditErrors(prev => ({ ...prev, newName: "" }));
                }
              }}
              placeholder="Enter new package name"
              onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
              error={editErrors.newName}
            />
          </div>
        </div>
      </ConfirmationModal>
    </PageLayout>
  );
}
