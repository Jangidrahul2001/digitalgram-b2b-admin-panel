"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { apiClient, ENDPOINTS } from "../lib/api-config"
import { toast } from "sonner"

const UsersContext = createContext()

export function UsersProvider({ children }) {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsers = async () => {
    // setIsLoading(true) // Don't trigger loading state on refresh to avoid flicker?
    // Or do, depends on UI. Let's keep it subtle or just set loading on initial.
    // Actually, tables usually show loading state.
    // For now, I won't set isLoading(true) on subsequent fetches to prevent full ui reset,
    // but maybe I should.
    try {
      const response = await apiClient(ENDPOINTS.GET_ALL_USERS);
      const data = Array.isArray(response) ? response : (response.data || []);

      // Map response to ensure consistent structure if needed
      const mappedUsers = data.map(u => ({
        ...u,
        id: u.id || u._id,
        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || "Unknown",
        status: u.status || (u.isActive ? "active" : "inactive"),
        role: u.role || u.roleName || "User",
        package: u.package || u.pkgName || "None"
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const addUser = async (userData) => {
    // This function is kept for compatibility but AddUserPage uses API directly.
    // Calling this will trigger a refresh.
    await fetchUsers();
  }

  const deleteUser = async (id) => {
    // Optimistic update
    setUsers((prev) => prev.filter((user) => user.id !== id))
    // Todo: Call API
  }

  const toggleStatus = async (id) => {
    const user = users.find((u) => u.id === id)
    if (!user) return

    const newStatus = user.status === "active" ? "inactive" : "active"

    // Optimistic update
    setUsers((prev) => prev.map((u) =>
      u.id === id ? { ...u, status: newStatus } : u
    ))

    try {
      await apiClient(ENDPOINTS.UPDATE_USER_STATUS(id), {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      })
      toast.success(`User ${newStatus === "active" ? "activated" : "deactivated"}`)
    } catch (error) {
      console.error("Status update failed:", error)
    toast.error( "Something went wrong");
      // Revert
      setUsers((prev) => prev.map((u) =>
        u.id === id ? { ...u, status: user.status } : u
      ))
    }
  }

  const updateUser = async (id, updates) => {
    // Optimistic
    setUsers((prev) => prev.map((user) =>
      user.id === id ? { ...user, ...updates } : user
    ))
    // Todo: Call API
  }

  const refreshUsers = fetchUsers;

  return (
    <UsersContext.Provider value={{ users, addUser, deleteUser, toggleStatus, updateUser, refreshUsers, isLoading }}>
      {children}
    </UsersContext.Provider>
  )
}

export function useUsers() {
  const context = useContext(UsersContext)
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider")
  }
  return context
}
