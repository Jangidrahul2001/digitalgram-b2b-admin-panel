import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { LoadingScreen } from "../../../../components/ui/loading-screen"
import { Select } from "../../../../components/ui/select"
import { ConfirmationModal } from "../../../../components/modals/confirmation-modal"
import { useFetch } from "../../../../hooks/useFetch"
import { usePatch } from "../../../../hooks/usePatch"
import { apiEndpoints } from "../../../../api/apiEndpoints"
import { handleValidationError } from "../../../../utils/helperFunction"
import { toast } from "sonner"
import { cn } from "../../../../lib/utils"

const StatusToggle = ({ service, onToggle, isUpdating }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOptimisticActive, setIsOptimisticActive] = useState(service.isActive)

  useEffect(() => {
    setIsOptimisticActive(service.isActive)
  }, [service.isActive])

  const handleConfirm = () => {
    setIsOptimisticActive(!isOptimisticActive)
    setIsModalOpen(false)
    onToggle(service._id, !service.isActive)
  }

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
          isOptimisticActive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "bg-slate-200"
        )}
      >
        <motion.span
          animate={{ x: isOptimisticActive ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0"
        />
        <span className="sr-only">Toggle status</span>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={isOptimisticActive ? "Deactivate Service?" : "Activate Service?"}
        description={
          isOptimisticActive
            ? `Are you sure you want to deactivate ${service.label}? This service will be disabled.`
            : `Are you sure you want to activate ${service.label}? This service will be enabled.`
        }
        confirmText={isOptimisticActive ? "Deactivate" : "Activate"}
        isDestructive={isOptimisticActive}
      />
    </>
  )
}

export function ManageServicesTab() {
  const [selectedService, setSelectedService] = useState("")
  const [services, setServices] = useState([])
  const [pipeline, setPipeline] = useState([])
  const [updatingPipelineId, setUpdatingPipelineId] = useState(null)

  const { loading: servicesLoading, refetch: fetchService } = useFetch(
    `${apiEndpoints.fetchServices}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const temp = data.data?.map((s) => ({
            label: s.label,
            value: s._id,
            ...s
          }))
          setServices(temp)
        }
      },
      onError: (error) => {
        toast.error(
          handleValidationError(error) || "Failed to fetch service details",
        );
      },
    },
    true,
  );

  const { loading: pipelineLoading, refetch: fetchPipeline } = useFetch(
    `${apiEndpoints.fetchPipelineByServiceId}?serviceId=${selectedService}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const temp = data.data?.map((pipeline) => ({
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

  const { patch: toggleStatus } = usePatch({
    onSuccess: () => {
      toast.success("Pipeline status updated successfully");
      fetchPipeline();
      setUpdatingPipelineId(null);
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Failed to update pipeline status");
      setUpdatingPipelineId(null);
    }
  });

  React.useEffect(() => {
    if (selectedService) {
      fetchPipeline()
    }
  }, [selectedService, fetchPipeline])

  const handleToggle = async (pipelineId, enabled) => {
    setUpdatingPipelineId(pipelineId);
    await toggleStatus(`${apiEndpoints.updateServiceStatus}/${pipelineId}`);
  }

  if (servicesLoading) {
    return <LoadingScreen message="Loading services..." />
  }

  const PipelineSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-32"></div>
          <div className="h-6 bg-slate-200 rounded w-12"></div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="border-none shadow-md bg-white rounded-xl">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-lg font-semibold text-slate-800">Service Configuration</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="max-w-xl space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-700">Select Service to Edit</label>
            <Select
              placeholder="Select a service..."
              value={selectedService}
              onChange={setSelectedService}
              options={services}
              className="w-full"
            />
          </div>

          {selectedService && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-sm text-slate-600 mb-4">
                Pipeline Services for: <span className="font-semibold text-slate-900">
                  {services.find(o => o.value === selectedService)?.label}
                </span>
              </p>

              {pipelineLoading ? (
                <PipelineSkeleton />
              ) : (
                <div className="space-y-3">
                  {pipeline.map(service => (
                    <div key={service._id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <h4 className="font-medium text-slate-800">{service.label}</h4>
                      </div>
                      {updatingPipelineId === service._id ? (
                        <div className="h-6 w-12 bg-slate-200 rounded animate-pulse"></div>
                      ) : (
                        <StatusToggle
                          service={service}
                          onToggle={handleToggle}
                          isUpdating={updatingPipelineId === service._id}
                        />
                      )}
                    </div>
                  ))}
                  {pipeline.length === 0 && (
                    <p className="text-sm text-slate-500">No pipeline services found.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
