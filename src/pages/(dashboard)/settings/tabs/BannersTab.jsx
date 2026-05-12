import React, { useState } from 'react'
import { Card, CardContent } from '../../../../components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useFetch } from '../../../../hooks/useFetch'
import { usePatch } from '../../../../hooks/usePatch'
import { useDelete } from '../../../../hooks/useDelete'
import { usePost } from '../../../../hooks/usePost'
import { apiEndpoints } from '../../../../api/apiEndpoints'
import { handleValidationError } from '../../../../utils/helperFunction'
import { ConfirmationModal } from '../../../../components/modals/confirmation-modal'
import { AddBannerModal } from '../../../../components/modals/AddBannerModal'

const BannersTab = () => {
  const [isLoadingBanners, setIsLoadingBanners] = useState(true)
  const [banners, setBanners] = useState([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingBanner, setDeletingBanner] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [isAddingBanner, setIsAddingBanner] = useState(false)

  const handleAddBanner = () => {
    setAddModalOpen(true)
  }

  const { post: addBanner } = usePost(apiEndpoints.addBanner, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Banner added successfully")
        fetchAllBanners()
        setAddModalOpen(false)
        setIsAddingBanner(false)
      }
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Failed to add banner")
      setIsAddingBanner(false)
    }
  })

  const { patch: toggleBannerStatus } = usePatch({
    onSuccess: (data) => {
      if (data?.success ) {
        toast.success(data.message || "Banner status updated successfully")
        setBanners(prev =>
          prev.map(banner =>
            banner._id === data?.data._id
              ? { ...banner, isActive: data?.data.isActive }
              : banner
          )
        )
      }
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Failed to update banner status")
    }
  })

  const { remove: deleteBanner } = useDelete(
    `${apiEndpoints.deleteBanner}/${deletingBanner?._id}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message || "Banner deleted successfully")
          setBanners(prev => prev.filter(banner => banner._id !== deletingBanner._id))
          setDeleteModalOpen(false)
          setDeletingBanner(null)
        }
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to delete banner")
        setDeleteModalOpen(false)
        setDeletingBanner(null)
      }
    }
  )

  const handleToggleBannerStatus = (bannerId) => {
    const banner = banners.find(b => b._id === bannerId)
    if (!banner) return

    toggleBannerStatus(
      `${apiEndpoints.toggleBannerStatus}/${bannerId}`,
      { isActive: !banner.isActive }
    )
  }

  const handleDeleteBanner = (bannerId) => {
    const banner = banners.find(b => b._id === bannerId)
    if (!banner) return

    setDeletingBanner(banner)
    setDeleteModalOpen(true)
  }

  const confirmDeleteBanner = () => {
    if (!deletingBanner) return
    deleteBanner({ bannerId: deletingBanner._id })
  }

  const handleAddBannerSubmit = ({ title, image }) => {
    setIsAddingBanner(true)

    const formData = new FormData()
    formData.append('name', title)
    formData.append('bannerImage', image)

    addBanner(formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  const { refetch: fetchAllBanners } = useFetch(
    `${apiEndpoints.fetchAllBanners}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setBanners(data?.data)
          setIsLoadingBanners(false)
        }
      },
      onError: (error) => {
        toast.error(
          handleValidationError(error) || "Failed to fetch banners"
        )
        setIsLoadingBanners(false)
      },
    },
    true,
  )

  const BannerSkeleton = () => (
    <div className="animate-pulse">
      <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white p-2 pb-0">
        <div className="aspect-[2/1] rounded-lg bg-slate-200"></div>
        <div className="p-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-slate-200 rounded-md"></div>
            <div className="flex-1 h-10 bg-slate-200 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Title outside with Left Bar design */}
      <div className="flex items-center gap-3 px-1 py-2">
        <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
        <h2 className="text-xl font-bold text-slate-800">
          Offer Banners
        </h2>
      </div>

      <Card className="border-none shadow-md bg-white rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <div
              onClick={handleAddBanner}
              className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center min-h-[200px] hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer group"
            >
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-slate-600 transition-colors mb-3 shadow-sm">
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-medium text-slate-500 group-hover:text-slate-700">
                Add New Banner
              </span>
            </div>

            {isLoadingBanners ? (
              Array(5).fill(0).map((_, i) => <BannerSkeleton key={i} />)
            ) : (
              banners.map((banner) => (
                <motion.div
                  key={banner._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="group relative"
                >
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all bg-white p-2 pb-0">
                    <div className="aspect-[21/9] rounded-lg overflow-hidden bg-slate-100 relative">
                      <img
                        src={`${import.meta.env.VITE_API_URL}${banner.imageUrl}`}
                        alt={banner.title || banner.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-[10px] text-white font-bold uppercase tracking-wider">
                        {banner.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleToggleBannerStatus(banner._id)}
                        className={`flex-1 h-10 text-xs font-semibold border-slate-200 ${!banner?.isActive ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" : "text-rose-500 hover:text-rose-600 hover:bg-rose-50"} hover:border-slate-300 transition-colors`}
                      >
                        {!banner?.isActive ? "Activate" : "Deactivate"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteBanner(banner._id)}
                        className="flex-1 h-10 text-xs font-semibold border-slate-200 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-100 gap-2 transition-colors text-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AddBannerModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false)
          setIsAddingBanner(false)
        }}
        onAdd={handleAddBannerSubmit}
        isLoading={isAddingBanner}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeletingBanner(null)
        }}
        onConfirm={confirmDeleteBanner}
        title="Delete Banner"
        description="Are you sure you want to delete this banner? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  )
}

export default BannersTab
