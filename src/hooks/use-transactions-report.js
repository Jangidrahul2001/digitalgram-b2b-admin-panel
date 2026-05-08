import { useState, useEffect } from "react"
import { transactionReportData } from "../data/transaction-report-data"

export function useTransactionsReport() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState(transactionReportData)
  const [columnVisibility, setColumnVisibility] = useState({})
  
  // Filter states
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [txnType, setTxnType] = useState("")
  const [selectedUser, setSelectedUser] = useState("")

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleSearch = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, fetch data here based on filters.
      // For now, we keep it as is or could filter dummyData.
      // setData([...filteredData])
    }, 1000);
  }

  const handleReset = () => {
    setFromDate("")
    setToDate("")
    setTxnType("")
    setSelectedUser("")
  }

  return {
    isLoading,
    data,
    columnVisibility,
    setColumnVisibility,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    txnType,
    setTxnType,
    selectedUser,
    setSelectedUser,
    handleSearch,
    handleReset
  }
}
