"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { tableConfig } from "../../config/tables.config.js";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { cn } from "../../lib/utils";
import { TableSkeleton } from "../../components/ui/table-skeleton";
import SearchInput from "../ui/SearchInput";
import { TableActions } from "../shared/table-actions";

export function DataTable({
  columns,
  data,
  columnVisibility,
  setColumnVisibility,
  isLoading,
  loadingMessage = "Loading Data...",
  onPaginationChange,
  totalRecords,
  pageSize = 10,
  searchKey,
  onSearch,
  exportData,
  exportColumns,
  fileName = "Export",
  title,
  description,
  children,
  hidePagination = false,
  searchLeft = false,
}) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: pageSize,
  });



  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState({});

  const visibilityState =
    columnVisibility !== undefined
      ? columnVisibility
      : internalColumnVisibility;
  const onVisibilityChange =
    setColumnVisibility !== undefined
      ? setColumnVisibility
      : setInternalColumnVisibility;

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalRecords / pageSize),
    manualPagination: true,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: onVisibilityChange,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility: visibilityState,
      pagination,
    },
  });

  React.useEffect(() => {
    if (onPaginationChange) {
      onPaginationChange({
        pageIndex: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      });
    }
  }, [pagination.pageIndex, pagination.pageSize]);


  return (
    <div className="flex flex-col w-full bg-white rounded-[1.5rem] border shadow-xs border-slate-100 overflow-hidden transition-all duration-300">
      {/* Unified Filter & Action Header */}
      <div className="flex flex-col p-5 border-b border-slate-100 bg-slate-50/20 relative z-20 gap-6">
        {/* Title Section (Row 1) */}
        {title && (
          <div className="flex flex-col gap-1.5 px-1 pt-1">
            <div className="flex items-center gap-3">
              {title}
            </div>
            {description && (
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Controls Section (Row 2) */}
        <div className={cn(
          "flex flex-col lg:flex-row items-center justify-between gap-5 px-1",
          searchLeft && "lg:flex-row" // Handled by order of children
        )}>
          <div className={cn(
            "flex flex-wrap items-center gap-3 w-full lg:w-auto",
            searchLeft ? "order-2 justify-end" : "order-1 justify-start"
          )}>
            {exportData && (
              <TableActions
                data={exportData}
                columns={exportColumns || columns}
                fileName={fileName}
                columnVisibility={visibilityState}
                setColumnVisibility={onVisibilityChange}
              />
            )}
            {children}
          </div>

          <div className={cn(
            "flex items-center gap-4 w-full lg:w-auto",
            searchLeft ? "order-1 justify-start" : "order-2 justify-end"
          )}>
            {onSearch && (
              <SearchInput onSearch={onSearch} placeholder="Search..." />
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "rounded-xl border bg-card/50 backdrop-blur-sm overflow-x-auto relative transition-all duration-300 mx-2 my-3",
          isLoading && "min-h-[350px]",
        )}
      >
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rowCount={5} columnCount={columns.length} />
          </div>
        ) : (
          <Table>
            <TableHeader className={tableConfig.styles.header}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-slate-200/70">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={cn("border-r border-slate-200/50 last:border-none relative text-center whitespace-nowrap", header.column.columnDef.headerClassName)}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-slate-50/60 transition-colors duration-150 border-b border-slate-100/80 last:border-none"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id} id={cell.id}
                        className={cn(tableConfig.styles.cell, "border-r border-slate-100/80 last:border-none relative text-center whitespace-nowrap", cell.column.columnDef.className)}
                      >
                        {flexRender(cell.column.columnDef.cell, {
                          ...cell.getContext(),
                          index: index,
                        })}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      {!hidePagination &&  totalRecords !== 0 &&(
        <div className="flex items-center justify-between py-4 px-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-transparent hover:text-slate-900 text-slate-400"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(
              (page) => {
                if (
                  table.getPageCount() > 7 &&
                  page > 2 &&
                  page < table.getPageCount() - 1 &&
                  Math.abs(page - (table.getState().pagination.pageIndex + 1)) > 1
                ) {
                  if (page === 3 || page === table.getPageCount() - 2) {
                    return (
                      <span key={page} className="text-slate-400 text-xs">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(page - 1)}
                    className={`h-8 w-8 p-0 rounded-lg text-xs font-bold border-slate-200 transition-all duration-200 ${table.getState().pagination.pageIndex + 1 === page
                      ? "bg-slate-100 text-slate-900 border-none font-bold"
                      : "bg-white text-slate-500 hover:bg-slate-50"
                      }`}
                  >
                    {page}
                  </Button>
                );
              },
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-transparent hover:text-slate-900 text-slate-400"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
