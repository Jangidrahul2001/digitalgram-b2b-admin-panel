"use client";

import React from "react";
import { Copy, FileSpreadsheet, FileText, Search, Settings2, Check } from "@/components/icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { exportToPDF, exportToExcel, copyToClipboard } from "../../lib/export-utils";

/**
 * A reusable table toolbar with Export buttons and Search.
 * Matches the style of "AEPS Payout Request" screenshot.
 */
export function TableToolbar({
  data = [],
  columns = [],
  fileName = "export",
  searchKey = "search",
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  columnVisibility,
  setColumnVisibility
}) {

  const handleExportPDF = () => {
    // We need to map the raw data to match column headers if possible, or just pass raw data
    // For simplicity in this reusable component, we'll try to find column defs
    const exportCols = columns.filter(c => c.accessorKey && c.header);
    exportToPDF(data, exportCols, fileName);
  };

  const handleExportExcel = () => {
    exportToExcel(data, fileName);
  }

  const handleCopy = () => {
    copyToClipboard(data);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-b border-slate-100">

      {/* Left Actions: Exports & Visiblity */}
      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="bg-slate-500 hover:bg-slate-600 text-white border-none h-8 px-3 rounded-lg text-xs font-semibold shadow-sm flex-shrink-0"
        >
          <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportExcel}
          className="bg-slate-500 hover:bg-slate-600 text-white border-none h-8 px-3 rounded-lg text-xs font-semibold shadow-sm flex-shrink-0"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Excel
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
          className="bg-slate-500 hover:bg-slate-600 text-white border-none h-8 px-3 rounded-lg text-xs font-semibold shadow-sm flex-shrink-0"
        >
          <FileText className="w-3.5 h-3.5 mr-1.5" /> PDF
        </Button>

        {/* Column Visibility Dropdown */}
        {setColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-500 hover:bg-slate-600 text-white border-none h-8 px-3 rounded-lg text-xs font-semibold shadow-sm flex-shrink-0 ml-1"
              >
                Column Visibility <Settings2 className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[180px] bg-white">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((col) => {
                const colId = col.accessorKey || col.id;
                if (!colId || colId === 'actions' || colId === 'select') return null;

                const isChecked = columnVisibility?.[colId] !== false;

                return (
                  <DropdownMenuCheckboxItem
                    key={colId}
                    className="capitalize"
                    checked={isChecked}
                    onCheckedChange={(boxed) => {
                      setColumnVisibility(prev => ({
                        ...prev,
                        [colId]: boxed
                      }))
                    }}
                  >
                    {typeof col.header === 'string' ? col.header : colId}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Right Action: Search */}
      <div className="relative w-full sm:w-[250px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm bg-white border-slate-200 rounded-lg focus:ring-slate-900/10"
        />
      </div>

    </div>
  );
}
