import React, { useState, useMemo, useEffect } from "react";
import { BentoCard } from "../../../../components/ui/bento-card";
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Select } from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { DataTable } from "../../../../components/tables/data-table";
import { Filter } from "../../../../components/icons";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { useFetch } from "../../../../hooks/useFetch";
import { usePatch } from "../../../../hooks/usePatch";
import { handleValidationError } from "../../../../utils/helperFunction";
import { toast } from "sonner";
import StatusBadge from "../../../../components/ui/StatusBadge";



const PackageTab = ({ userId, user, fetchParticularUser }) => {

  console.log(user, "user in package tab")
  const [selectedPackage, setSelectedPackage] = useState("");
  const [packageList, setPackageList] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [commissionData, setCommissionData] = useState(user.commission || []);





  useEffect(() => {
    setCommissionData(user.commission || [])
  }, [user.commission])

  // Fetch packages for dropdown
  const { refetch: fetchPackages } = useFetch(
    `${apiEndpoints.fetchPackages}/${user?.roleId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const temp = data.data.map((pkg) => ({
            ...pkg,
            label: pkg.name,
            value: pkg._id,
          }));
          setPackageList(temp);
        }
      },
      onError: (error) => {
        toast.error(
          handleValidationError(error) || "Failed to fetch package list",
        );
      },
    },
    true,
  );




  // Update package
  const { patch: updatePackage } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Package Updated Successfully!");
        setIsUpdating(false);
        fetchParticularUser();
      }
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Failed to update package");
      setIsUpdating(false);
    },
  });

  const handleUpdatePackage = () => {
    if (!selectedPackage) {
      toast.error("Please select a package");
      return;
    }
    setIsUpdating(true);
    updatePackage(`${apiEndpoints.assignPackage}/${userId}`, {
      packageId: selectedPackage,
    });
  };



  // Define columns for the data table
  const columns = useMemo(
    () => [
      {
        accessorKey: "service",
        header: "Service",
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-slate-900">
              {row.original.service}
            </div>

          </div>
        ),
      },
      {
        accessorKey: "from",
        header: "From",
        cell: ({ row }) => (
          <span className="text-slate-600">₹ {row.original.from}</span>
        ),
      },
      {
        accessorKey: "to",
        header: "To",
        cell: ({ row }) => (
          <span className="text-slate-600">₹ {row.original.to}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
            {row.original.category || row.original.service}
          </span>
        ),
      },
      {
        accessorKey: "commission",
        header: "Commission / charge",
        cell: ({ row }) => (
          <span className="text-slate-900 font-medium">
            {row.original.commissionAmount}
          </span>
        ),
      },
      {
        accessorKey: "commission",
        header: "type",
        cell: ({ row }) => (
          <span className="text-slate-900 font-medium">
            {row.original.commissionType}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <BentoCard className="p-0 h-fit">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-base">Assigned Package</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-500 text-xs uppercase font-semibold">
              Current Package
            </Label>
            <div className="h-9 md:h-10 flex items-center bg-slate-100 p-3 rounded-lg text-slate-700 font-medium capitalize border border-slate-200">
              {user?.packageName || "No Package Assigned"}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-500 text-xs uppercase font-semibold">
              Status
            </Label>
            <div>
              <StatusBadge status="Active" />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <Select
              label="Change Package"
              placeholder="Select Package"
              options={packageList}
              value={selectedPackage}
              onChange={setSelectedPackage}
            />
            <Button
              onClick={handleUpdatePackage}
              disabled={isUpdating || !selectedPackage}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Assign / Update Package"}
            </Button>
          </div>
        </CardContent>
      </BentoCard>

      <BentoCard className="lg:col-span-2 p-0 h-fit">
        <div className="p-0">
          <DataTable
            columns={columns}
            data={commissionData}
            totalRecords={commissionData.length}
            pageSize={100}
            loadingMessage="Loading commission data..."
            fileName={`User_Commission_${userId}`}
            title={
              <div className="flex items-center gap-1">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-500 border border-orange-100">
                  <Filter className="w-4 h-4" />
                </div>
                <h5 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                  Commission Structure
                </h5>
              </div>
            }
          />
        </div>
      </BentoCard>
    </div>
  );
};

export default PackageTab;
