
// import { useState, useEffect } from "react"
// import { fetchManageableServices } from "../api/settings-service"

// export function useManageServices() {
//   const [selectedService, setSelectedService] = useState("")
//   const [services, setServices] = useState([])
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     const loadServices = async () => {
//       try {
//         const data = await fetchManageableServices()
//         setServices(data)
//       } catch (error) {
//         console.error("Failed to fetch services:", error)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     loadServices()
//   }, [])

//   return {
//     services,
//     isLoading,
//     selectedService,
//     setSelectedService
//   }
// }
