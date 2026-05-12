"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Plus,
  Trash2,
  Search,
  Filter,
  Percent,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Loader2,
  Edit,
} from "@/components/icons";
import { Select } from "../../../components/ui/select";
import { DataTable } from "../../../components/tables/data-table";
import { Switch } from "../../../components/ui/switch";
import { PageLayout } from "../../../components/layouts/page-layout";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import { ConfirmationModal } from "../../../components/modals/confirmation-modal";
import { ActionButtons } from "../../../components/ui/ActionButtons";
import { commissionData } from "../../../data/commission-data";
import { apiEndpoints } from "../../../api/apiEndpoints";
import { useFetch } from "../../../hooks/useFetch";
import { useDelete } from "../../../hooks/useDelete";
import { formatDecimalNumberInput, formatNumberInput, handleValidationError } from "../../../utils/helperFunction";
import { toast } from "sonner";
import { usePost } from "../../../hooks/usePost";
import { cn } from "../../../lib/utils";
import { se } from "date-fns/locale/se";

export default function CommissionPage() {
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [roles, setRoles] = useState([])

  const [selectedRole, setSelectedRole] = useState("")
  const [selectedPackage, setSelectedPackage] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedPipeline, setSelectedPipeline] = useState("");


  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCategory, setShowCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, row: null });
  const [columnVisibility, setColumnVisibility] = useState({});
  const [pageSize, setPageSize] = useState(100);
  const [pageIndex, setPageIndex] = useState(1);
  const [search, setSearch] = useState("");
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    row: null,
    nextStatus: false
  });


  useFetch(
    `${apiEndpoints.fetchRole}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data ) {
          const temp = data?.data?.map((role) => ({
            label: role.name,
            value: role._id,
            ...role,
          }));
          setRoles(temp);
        }
      },
      onError: (error) => {
        console.log("error in getting active roles", error);
        toast.error(handleValidationError(error) || "Failed to fetch Order");
      },
    },
    true,
  );
  const { refetch: fetchPackages } = useFetch(
    `${apiEndpoints.fetchPackages}/${selectedRole}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const temp = data?.data?.map((pac) => ({
            label: pac.name,
            value: pac._id,
            ...pac,
          }));
          setPackages(temp);
        }
      },
      onError: (error) => {
        console.log("error in getting active packages", error);
        toast.error(handleValidationError(error) || "Failed to fetch Order");
      },
    },
    false,
  );
  useEffect(() => {
    if (selectedRole) {
      fetchPackages()
    }
  }, [selectedRole])

  useFetch(
    `${apiEndpoints.fetchServices}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const temp = data?.data?.map((service) => ({
            label: service.label,
            value: service._id,
            ...service,
          }));
          setServices(temp);
        }
      },
      onError: (error) => {
        console.log(error, "error in getting services data");
        toast.error(handleValidationError(error) || "Failed to fetch Order");
      },
    },
    true,
  );

  const { refetch: fetchPipeline } = useFetch(
    `${apiEndpoints.fetchPipelineByServiceId}?serviceId=${selectedService}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const temp = data?.data?.map((pipeline) => ({
            label: pipeline.label,
            value: pipeline.code,
            ...pipeline,
          }));
          setPipeline(temp);
        }
      },
      onError: (error) => {
        console.log(error, "error in getting pipeline data");
        toast.error(handleValidationError(error) || "Failed to fetch pipeline data");
      },
    },
    false,
  );

  useEffect(() => {
    if (selectedService) {
      fetchPipeline()
    }
    setSelectedPipeline("")
    setRows([])
  }, [selectedService])

  useEffect(() => {
    setSelectedService("")
    setSelectedPipeline("")
  }, [selectedPackage])


  const { refetch: fetchSubCategory } = useFetch(
    `${services.find((s) => s.value === selectedService)?.name === "bbps" ? apiEndpoints.fetchBbpsCategory : apiEndpoints.fetchRechargeCategory}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
         
          const temp = data?.data?.map((cat) => ({
            label: cat.name,
            value: cat._id,
            ...cat,
          }));
          setCategories(temp);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.log(error, "error in getting subcategory data");
        toast.error(
          handleValidationError(error) || "Failed to fetch subcategory",
        );
        setIsLoading(false);
      },
    },
    false,
  );

  const { refetch: fetchCommissionDetails } = useFetch(
    `${apiEndpoints.commisionDetails}?packageId=${selectedPackage}&serviceId=${selectedService}&pipeline=${selectedPipeline}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const temp = data?.data?.map((service, index) => ({
            ...service,
            id: index + 1,
            status: service.status ?? true,
            isEditing: false,
          }));
          setRows(temp);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.log(error, "error in getting commission Details data");
        toast.error(
          handleValidationError(error) || "Failed to fetch commission details",
        );
        setIsLoading(false);
      },
    },
    false,
  );



  useEffect(() => {
    if (selectedPackage && selectedService && selectedPipeline) {
      setIsLoading(true);
      fetchCommissionDetails();
    }
  }, [selectedPackage, selectedPipeline, selectedService])

  const { remove: deleteCommission } = useDelete(
    apiEndpoints.deleteCommisionPlan,
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message || "Commission deleted successfully");
          fetchCommissionDetails();
          setDeleteModal({ isOpen: false, row: null });
        }
      },
      onError: (error) => {
        console.log("error in deleting commission", error);
        toast.error(
          handleValidationError(error) || "Failed to delete commission",
        );
      },
    },
  );

  useEffect(() => {
    const tempSelectedService = services.find((s) => s.value === selectedService);
    console.log(tempSelectedService, "aersrsesrr")
    if (tempSelectedService?.hasCategory || tempSelectedService?.label === "Recharge" || tempSelectedService?.name === "bbps") {
      setIsLoading(true);
      fetchSubCategory();
      setSelectedCategory("");

    } else {
      setSelectedCategory("");
      setCategories([]);
      setRows([]);
      setIsLoading(false);
    }
  }, [selectedService, services]);



  const handleRowChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };
  console.log(selectedPipeline, "selectedPipeline outside ")
  const handleSaveRow = (row) => {
    console.log(selectedPipeline, "selectedPipeline inside")
    if (row.from === "" || row.to === "" || row.commission === "" || row.type === "" || selectedPackage === "" || selectedService === "" || selectedPipeline === "") {
      return toast.error("Please fill all fields before saving this slab");
    }
    const tempSelectedService = services.find((s) => s.value === selectedService);
    let operatorId = null
    let categoryId = null
    if (tempSelectedService && tempSelectedService.name === "recharge") {
      if (!row.operatorId || row.operatorId === "") {
        return toast.error("Please select operator before saving this slab");
      }
      else {
        operatorId = row.operatorId
      }
    }
    if (tempSelectedService && tempSelectedService.name === "bbps") {
      if (!row.categoryId || row.categoryId === "") {
        return toast.error("Please select category before saving this slab");
      }
      else {
        categoryId = row.categoryId
      }
    }
    console.log(row.from, row.to, "row")

    if (Number(row.from) >= Number(row.to)) {
      return toast.error("From amount should be less than To amount")
    }
    if (row.type === "percent") {
      if (Number(row.commission) > 100) {
        return toast.error("Commission should be less than 100%")
      }
      else if (Number(row.commission) < 0) {
        return toast.error("Commission cannot be negative")
      }
    }

    addCommissionDetails({
      packageId: selectedPackage,
      serviceId: selectedService,
      pipeline: selectedPipeline,
      operatorId,
      categoryId,
      plan: [
        {
          from: Number(row.from),
          to: Number(row.to),
          type: row.type,
          commission: Number(row.commission)
        },
      ]

    })

  }

  const handleToggleEdit = (row) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id ? {
          ...r,
          isEditing: !r.isEditing,
          isSavedLocally: r.isEditing ? true : r.isSavedLocally
        } : r
      )
    );
  };

  const handleDelete = (row) => {
    setDeleteModal({ isOpen: true, row });
  };

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
    setIsLoading(true);
  };

  const confirmDelete = () => {
    if (deleteModal.row?.commissionId && deleteModal.row?.planId) {
      deleteCommission({
        commissionId: deleteModal.row.commissionId,
        planId: deleteModal.row.planId,
      });
    }
  };

  const handleStatusToggle = (row) => {
    setStatusModal({
      isOpen: true,
      row: row,
      nextStatus: !row.status
    })
  };

  const confirmStatusChange = () => {
    const { row, nextStatus } = statusModal;
    setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: nextStatus } : r));
    toast.success(`Status updated to ${nextStatus ? 'Active' : 'Inactive'}`);
    setStatusModal({ isOpen: false, row: null, nextStatus: false });
  };



  const handleAddRow = () => {
    // All unselected
    if (!selectedRole && !selectedService && !selectedPackage && !selectedPipeline) {
      return toast.error("Please select a Role, Service, Package and Pipeline first");
    }

    // Only role selected
    if (selectedRole && !selectedService && !selectedPackage && !selectedPipeline) {
      return toast.error("Please select a Service, Package and Pipeline first");
    }

    // Role + Package selected (Service + Pipeline missing)
    if (selectedRole && selectedPackage && !selectedService && !selectedPipeline) {
      return toast.error("Please select a Service and Pipeline first");
    }

    // Service selected but Pipeline missing
    if (selectedService && !selectedPipeline) {
      return toast.error("Please select a Pipeline first");
    }

    // Final safety check
    if (!selectedRole || !selectedService || !selectedPackage || !selectedPipeline) {
      return toast.error("Please complete all selections");
    }


    const tempSeletedService = services.find((s) => s.value === selectedService);
    const obj = tempSeletedService?.name === "recharge" ? {
      operatorId: "",
      operatorName: "",
      from: "",
      to: "",
      commission: "",
      type: "flat",
      status: true,
      isEditing: true,
    } : tempSeletedService?.name === "bbps" ? {
      categoryId: "",
      categoryName: "",
      from: "",
      to: "",
      commission: "",
      type: "flat",
      status: true,
      isEditing: true,
    } : {

      from: "",
      to: "",
      commission: "",
      type: "flat",
      status: true,
      isEditing: true,
    }
    setRows((prev) => {
      const newId = Math.max(...prev.map((r) => r.id), 0) + 1;
      return [
        ...prev,
        { ...obj, id: newId }
      ];
    });
  };

  const { post: addCommissionDetails } = usePost(apiEndpoints?.createCommision, {
    onSuccess: (data) => {
      if (data.success) {
        setIsSubmitting(false);
        toast.success(data.message || "Commission Added successfully");
        fetchCommissionDetails();
      }
    },

    onError: (error) => {
      console.log("error in adding commission details", error);
      toast.error(
        handleValidationError(error) || "Failed to add commission details",
      );
      setIsSubmitting(false);
    },
  });



  const columns = useMemo(
    () => [
      ...(services.find((s) => s.value === selectedService)?.name === "recharge" ? [
        {
          accessorKey: "operator",
          header: () => <div className="text-center w-full">OPERATOR</div>,
          cell: ({ row }) => {
            const isActive = row.original.isEditing || row.original.isSavedLocally || !!row.original._id;
            return (
              <div className="flex justify-center w-full">
                <Select
                  value={row.original.operatorId}
                  onChange={(val) => {
                    const cat = categories.find((c) => c.value === val);
                    handleRowChange(row.original.id, "operatorId", val);
                    handleRowChange(row.original.id, "operatorName", cat?.label || "");
                  }}
                  options={categories}
                  placeholder="Select Operator"
                  className={cn(
                    "h-9 text-[12px] min-w-[150px] transition-all duration-300 text-center",
                    (row.original.operatorId && isActive) ? "opacity-100 disabled:opacity-100" : "opacity-60 disabled:opacity-60"
                  )}
                  disabled={!row.original.isEditing}
                />
              </div>
            );
          },
        },
      ] : services.find((s) => s.value === selectedService)?.name === "bbps" ? [
        {
          accessorKey: "categoryName",
          header: () => <div className="text-center w-full">CATEGORY</div>,
          cell: ({ row }) => {
            const isActive = row.original.isEditing || row.original.isSavedLocally || !!row.original._id;
            return (
              <div className="flex justify-center w-full">
                <Select
                  value={row.original.categoryId}
                  onChange={(val) => {
                    const cat = categories.find((c) => c.value === val);
                    handleRowChange(row.original.id, "categoryId", val);
                    handleRowChange(row.original.id, "categoryName", cat?.label || "");
                  }}
                  options={categories}
                  placeholder="Select Category"
                  className={cn(
                    "h-9 text-[12px] min-w-[150px] transition-all duration-300 text-center",
                    (row.original.categoryId && isActive) ? "opacity-100 disabled:opacity-100" : "opacity-60 disabled:opacity-60"
                  )}
                  disabled={!row.original.isEditing}
                />
              </div>
            );
          },
        },
      ] : []),

      {
        accessorKey: "from",
        header: () => <div className="text-center w-full">FROM AMOUNT</div>,
        cell: ({ row }) => {
          const isActive = row.original.isEditing || row.original.isSavedLocally || !!row.original._id;
          return (
            <div className="flex justify-center w-full">
              <div className="w-[140px]">
                <Input
                  value={row.original.from}
                  onChange={(e) =>
                    handleRowChange(row.original.id, "from", formatNumberInput(e.target.value, 7))
                  }
                  placeholder="0.00"
                  className={cn(
                    "h-9 border-slate-200 bg-slate-50/50 focus:bg-white transition-all rounded-xl text-[12px] font-semibold min-w-[60px] text-center",
                    (row.original.from && isActive) ? "opacity-100 disabled:opacity-100" : "opacity-60 disabled:opacity-60"
                  )}
                  disabled={!row.original.isEditing}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "to",
        header: () => <div className="text-center w-full">TO AMOUNT</div>,
        cell: ({ row }) => {
          const isActive = row.original.isEditing || row.original.isSavedLocally || !!row.original._id;
          return (
            <div className="flex justify-center w-full">
              <div className="w-[140px]">
                <Input
                  value={row.original.to}
                  onChange={(e) =>
                    handleRowChange(row.original.id, "to", formatNumberInput(e.target.value, 7))
                  }
                  placeholder="1000.00"
                  className={cn(
                    "h-9 border-slate-200 bg-slate-50/50 focus:bg-white transition-all rounded-xl text-[12px] font-semibold min-w-[60px] text-center",
                    (row.original.to && isActive) ? "opacity-100 disabled:opacity-100" : "opacity-60 disabled:opacity-60"
                  )}
                  disabled={!row.original.isEditing}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "commission",
        header: () => <div className="text-center w-full">AMOUNT</div>,
        cell: ({ row }) => {
          const isActive = row.original.isEditing || row.original.isSavedLocally || !!row.original._id;
          return (
            <div className="flex justify-center w-full">
              <div className="w-[140px]">
                <Input
                  value={row.original.commission}
                  onChange={(e) =>
                    handleRowChange(row.original.id, "commission", formatDecimalNumberInput(e.target.value, 5))
                  }
                  placeholder="Value"
                  className={cn(
                    "h-9 border-slate-200 bg-slate-50/50 focus:bg-white transition-all rounded-xl text-[12px] font-bold text-slate-900 max-w-[120px] mx-auto text-center",
                    (row.original.commission && isActive) ? "opacity-100 disabled:opacity-100" : "opacity-60 disabled:opacity-60"
                  )}
                  disabled={!row.original.isEditing}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: () => <div className="text-center w-full">TYPE</div>,
        cell: ({ row }) => {
          const isActive = row.original.isEditing || row.original.isSavedLocally || !!row.original._id;
          return (
            <div className="flex justify-center w-full">
              <div className="w-[140px]">
                <Select
                  value={row.original.type}
                  onChange={(val) => handleRowChange(row.original.id, "type", val)}
                  options={[
                    { label: "Flat (₹)", value: "flat" },
                    { label: "Percent (%)", value: "percent" },
                  ]}
                  className={cn(
                    "h-9 text-[12px] transition-all duration-300 text-center",
                    (row.original.type && isActive) ? "opacity-100 disabled:opacity-100" : "opacity-60 disabled:opacity-60"
                  )}
                  searchable={false}
                  disabled={!row.original.isEditing}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: () => <div className="text-center w-full">STATUS</div>,
        cell: ({ row }) => {
          const isActive = row.original.isEditing || row.original.isSavedLocally || !!row.original._id;
          return (
            <div className="flex items-center justify-center">
              <Switch
                checked={row.original.status}
                onCheckedChange={() => handleStatusToggle(row.original)}
                className={cn(
                  "data-[state=checked]:bg-emerald-500 transition-all duration-300",
                  (row.original.status !== undefined && isActive) ? "opacity-100 disabled:opacity-100" : "opacity-60 disabled:opacity-60"
                )}
                disabled={!row.original.isEditing}
              />
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-center w-full">ACTION</div>,
        cell: ({ row }) => {
          const isNew = !row.original._id;
          const hasStartedFilling =
            row.original.from ||
            row.original.to ||
            row.original.commission ||
            row.original.categoryId;

          const isDeleteDisabled = isNew && !hasStartedFilling;

          return (
            <ActionButtons
              onEdit={() => {
                if (row.original.isEditing) {
                  handleSaveRow(row.original);
                } else {
                  handleToggleEdit(row.original);
                }
              }}
              editIcon={row.original.isEditing ? CheckCircle2 : Edit}
              editTitle={row.original.isEditing ? "Save" : "Edit Row"}
              onDelete={() => handleDelete(row.original)}
              isDeleteDisabled={isDeleteDisabled}
              deleteTitle={isDeleteDisabled ? "Fill slab to enable delete" : "Remove Slab"}
            />
          );
        },
      },
    ],
    [categories, selectedService, services, selectedPipeline, selectedPackage],
  );

  return (
    <PageLayout
      title="Commission And Charges"
      subtitle="Manage and configure your commission rates and charges."

    >

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white rounded-[1.5rem] overflow-hidden">
          <CardHeader className="p-5 md:p-6 pb-2 md:pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800 uppercase tracking-wide">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-500 border border-orange-100">
                <Filter className="w-4 h-4" />
              </div>
              Configuration Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 md:p-6 pt-0 md:pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide ml-1">
                  Role
                </label>
                <Select
                  placeholder="Select Role"
                  value={selectedRole}
                  onChange={setSelectedRole}
                  options={roles}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide ml-1">
                  Package
                </label>
                <Select
                  placeholder="Select Package"
                  value={selectedPackage}
                  onChange={setSelectedPackage}
                  options={packages}
                  disabled={!selectedRole}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide ml-1">
                  Service
                </label>
                <Select
                  placeholder="Select Service"
                  value={selectedService}
                  onChange={setSelectedService}
                  options={services}
                  disabled={!selectedPackage}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide ml-1">
                  Pipeline
                </label>
                <Select
                  placeholder="Select Pipeline"
                  value={selectedPipeline}
                  onChange={setSelectedPipeline}
                  options={pipeline}
                  disabled={!selectedService}
                />


              </div>
            </div>
          </CardContent>
        </Card>
        <div className="p-0">
          <DataTable
            columns={columns}
            data={rows}
            isLoading={isLoading}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            onSearch={(val) => setSearch(val)}
            onPaginationChange={false}
            hidePagination={true}
            searchLeft={true}
          >
            <Button
              onClick={handleAddRow}
              variant="outline"
              className="border-slate-200 hover:bg-slate-50 text-slate-700 px-6 h-10 rounded-xl font-bold flex items-center gap-2 text-[12px] transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Slab
            </Button>
          </DataTable>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, row: null })}
        onConfirm={confirmDelete}
        title="Delete Commission Slab"
        description="Are you sure you want to delete this commission slab? This action cannot be undone."
        confirmText="Delete Slab"
        cancelText="Cancel"
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, row: null, nextStatus: false })}
        onConfirm={confirmStatusChange}
        title="Change Status"
        description={`Are you sure you want to change the status to ${statusModal.nextStatus ? 'Active' : 'Inactive'}?`}
        confirmText="Confirm Change"
        cancelText="Cancel"
        isDestructive={false}
      />
    </PageLayout>
  );
}
