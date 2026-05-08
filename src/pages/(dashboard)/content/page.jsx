"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { PageLayout } from "../../../components/layouts/page-layout"

import { DataTable } from "../../../components/tables/data-table"
import { Plus, FileText, Pencil, Trash } from "@/components/icons"
import { TableActions } from "../../../components/shared/table-actions"

import { useContent } from "../../../hooks/use-content"

const columns = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-medium">
        <FileText className="w-4 h-4 text-muted-foreground" />
        {row.getValue("title")}
      </div>
    )
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status")
      let colorClass = "bg-gray-100 text-gray-800"
      if (status === "Published") colorClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      if (status === "Draft") colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"

      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
          {status}
        </span>
      )
    }
  },
  {
    accessorKey: "date",
    header: "Last Modified",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]

export default function ContentPage() {
  const { data: contentData, isLoading } = useContent()
  const [columnVisibility, setColumnVisibility] = useState({})

  return (
    <PageLayout
      title="Content Management"
      subtitle="Manage articles, media, and platform resources."
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      }
    >
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>All Content</CardTitle>
            <CardDescription>Manage your digital assets and publications.</CardDescription>
          </div>
          <TableActions
            data={contentData}
            columns={columns}
            fileName="Content_Management"
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
          />
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={contentData}
            searchKey="title"
            isLoading={isLoading}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
          />
        </CardContent>
      </Card>
    </PageLayout>
  )
}
