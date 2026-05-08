import { AlertCircle, Check, Layers } from "lucide-react";
import { BentoCard } from "../../../../components/ui/bento-card";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { ManageServicesModal } from "../../../../components/modals/manage-services-modal";
import { useFetch } from "../../../../hooks/useFetch";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePatch } from "../../../../hooks/usePatch";
import { handleValidationError } from "../../../../utils/helperFunction";
import { LoadingScreen } from "../../../../components/ui/loading-screen";

export default function ServicesTab({
  userId,
  user,
  fetchParticularUser,
  onChangeTab
}) {
  const [servicesWithPipeline, setServicesWithPipeline] = useState([]);
  const [toggled, setToggled] = useState(user?.assignedServices || []);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);
  const [updatingService, setUpdatingService] = useState(false);
  useEffect(() => {
    if (!user) {
      fetchParticularUser();
    }
    if (user?.assignedServices) {
      setToggled(user.assignedServices);
    }
  }, [user]);


  // Fetch services with pipeline data
  const { refetch: refetchServicesWithPipeline } = useFetch(
    `${apiEndpoints?.fetchServicesWithPipeline}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          console.log(data.data, "servicesWithPipeline");
          setServicesWithPipeline(data.data);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching services:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    true,
  );

  const { patch: assignServices } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Services assigned successfully");
        fetchParticularUser();
        setUpdatingService(false);
        // if (onChangeTab) onChangeTab("package");
      }
    },
    onError: (error) => {
      setUpdatingService(false);
      console.error("Error assigning services:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const handleAssignServices = (selectedServices) => {   
    setUpdatingService(true);
    assignServices(`${apiEndpoints?.assignServices}/${userId}`, {
      services: selectedServices,
    });
  };

  // Helper function to get service details by ID
  const getServiceById = (serviceId) => {
    return servicesWithPipeline.find(service => service._id === serviceId);
  };

  // Helper function to get pipeline details by code
  const getPipelineByCode = (service, pipelineCode) => {
    return service?.pipeline?.find(pipeline => pipeline.code === pipelineCode);
  };

  // Helper function to render assigned services
  const renderAssignedServices = () => {
    if (!toggled || toggled.length === 0) {
      return (
        <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
          <Layers className="w-8 h-8 text-slate-200 mb-3" />
          <p className="text-slate-400 text-sm font-medium">No services assigned yet.</p>
          <Button
            variant="link"
            onClick={() => setIsAssignModalOpen(true)}
            className="text-slate-900 font-bold text-xs uppercase tracking-wider mt-1"
          >
            Assign Services Now
          </Button>
        </div>
      );
    }

    return toggled.map((assignedService) => {
      const service = getServiceById(assignedService.serviceId);

      if (!service) return null;

      return (
        <div
          key={assignedService.serviceId}
          className="flex flex-col gap-3 p-4 px-5 rounded-2xl border border-slate-200 bg-slate-100 shadow-sm transition-all duration-300"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[12px] font-bold uppercase tracking-tight text-slate-800">
              {service.label || service.name}
            </span>
            <div className="w-4.5 h-4.5 rounded-full flex items-center justify-center bg-slate-900">
              <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
            </div>
          </div>

          {assignedService.pipelineCodes && assignedService.pipelineCodes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/50">
              {assignedService.pipelineCodes.map(pipelineCode => {
                const pipeline = getPipelineByCode(service, pipelineCode);
                return (
                  <span
                    key={pipelineCode}
                    className="text-[10px] px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold uppercase tracking-tight shadow-sm"
                  >
                    {pipeline?.label || pipelineCode}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  if (isLoading) return <LoadingScreen variant="page" message="Fetching Services" />;

  return (
    <>
      <BentoCard className="p-0">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-800 uppercase tracking-tight">Manage Services</CardTitle>
            <CardDescription className="text-slate-500 text-[13px] font-medium">
              Enable or disable specific services for this user.
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsAssignModalOpen(true)}
            variant="outline"
            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold text-[12px] h-9 px-4 gap-2 transition-all active:scale-95"
            disabled={updatingService}
          >
            <Layers className="w-4 h-4" />
            {updatingService ? "Updating..." : "Assign Services"}
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-10">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2.5">
              <div className="w-1 h-3.5 bg-slate-400 rounded-full" />
              User Access & Services
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {renderAssignedServices()}
            </div>
          </div>

         
        </CardContent>
      </BentoCard>

      <ManageServicesModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        selectedServices={toggled}
        onAssign={handleAssignServices}
      />
    </>
  );
}
