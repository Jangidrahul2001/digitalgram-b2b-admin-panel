// "use client"
// import { SidebarPageTransition } from "../../../../components/ui/sidebar-page-transition"
// import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
// import { Select } from "../../../../components/ui/select"
// import { useManageServices } from "../../../../hooks/use-manage-services"

// export default function ManageServicesPage() {
//   const { services, selectedService, setSelectedService, isLoading } = useManageServices()

//   // Safe options mapping
//   const serviceOptions = Array.isArray(services)
//     ? services.map(s => ({
//       label: s.label || "Unknown",
//       value: s.value || ""
//     }))
//     : []

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center p-12">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
//       </div>
//     )
//   }

//   return (
//     <SidebarPageTransition className="w-full max-w-none mx-auto py-8 px-6 lg:px-8 space-y-8">

//       {/* Header Section */}
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage Services</h1>
//         <p className="text-slate-500 mt-2">Configure and manage service availability.</p>
//       </div>

//       {/* Main Content Card */}
//       <Card className="border-none shadow-sm bg-white border-slate-200">
//         <CardHeader className="pb-4 border-b border-slate-100">
//           <CardTitle className="text-lg font-semibold text-slate-800">Service Configuration</CardTitle>
//         </CardHeader>
//         <CardContent className="p-6">
//           <div className="max-w-xl space-y-6">

//             <div className="space-y-4">
//               <label className="text-sm font-medium text-slate-700">Select Service to Edit</label>
//               <Select
//                 placeholder="Select a service..."
//                 value={selectedService}
//                 onChange={setSelectedService}
//                 options={serviceOptions}
//                 className="w-full"
//               />
//             </div>

//             {selectedService && (
//               <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
//                 <p className="text-sm text-slate-600">
//                   You have selected: <span className="font-semibold text-slate-900">{serviceOptions.find(o => o.value === selectedService)?.label}</span>
//                 </p>
//                 {/* Additional controls can go here */}
//               </div>
//             )}

//           </div>
//         </CardContent>
//       </Card>

//     </SidebarPageTransition>
//   )
// }
