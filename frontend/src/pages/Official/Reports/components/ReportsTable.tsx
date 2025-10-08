import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    type ColumnDef,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface CompletedReport {
  emergencyId: string;
  communityName: string;
  alertType: string;
  dispatcher: string;
  dateTimeOccurred: string;
  accomplishedOn: string;
  address: string;
}

interface PendingReport {
  emergencyId: string;
  communityName: string;
  alertType: string;
  dispatcher: string;
  dateTimeOccurred: string;
  address: string;
}

interface ReportsTableProps {
  type: "completed" | "pending";
  data: CompletedReport[] | PendingReport[];
}

type ReportData = CompletedReport | PendingReport;

export function ReportsTable({ type, data }: ReportsTableProps) {
  const isCompleted = type === "completed";
  const [rowSelection, setRowSelection] = useState({});

  // Define columns based on table type
  const columns: ColumnDef<ReportData>[] = [
    {
      id: "select",
      header: () => <Checkbox />,
      cell: () => <Checkbox />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "emergencyId",
      header: "Emergency ID",
      cell: ({ row }) => (
        <div className="font-medium text-foreground">{row.getValue("emergencyId")}</div>
      ),
    },
    {
      accessorKey: "communityName",
      header: "Community Name",
      cell: ({ row }) => (
        <div className="text-foreground">{row.getValue("communityName")}</div>
      ),
    },
    {
      accessorKey: "alertType",
      header: "Alert Type",
      cell: ({ row }) => (
        <Badge 
          variant="secondary" 
          className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/30"
        >
          {row.getValue("alertType")}
        </Badge>
      ),
    },
    {
      accessorKey: "dispatcher",
      header: "Dispatcher",
      cell: ({ row }) => (
        <div className="text-foreground">{row.getValue("dispatcher")}</div>
      ),
    },
    {
      accessorKey: "dateTimeOccurred",
      header: "Date & Time Occurred",
      cell: ({ row }) => (
        <div className="text-foreground">{row.getValue("dateTimeOccurred")}</div>
      ),
    },
    ...(isCompleted ? [{
      accessorKey: "accomplishedOn",
      header: "Accomplished on",
      cell: ({ row }: { row: any }) => (
        <div className="text-foreground">{(row.original as CompletedReport).accomplishedOn}</div>
      ),
    }] : []),
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="text-foreground">{row.getValue("address")}</div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: () => (
        isCompleted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem className="text-popover-foreground hover:bg-accent">View details</DropdownMenuItem>
              <DropdownMenuItem className="text-popover-foreground hover:bg-accent">Download report</DropdownMenuItem>
              <DropdownMenuItem className="text-popover-foreground hover:bg-accent">Edit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Create Report
          </Button>
        )
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data: data as ReportData[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-[#191818] rounded-[5px] border border-[#262626] overflow-hidden flex-1">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-white border-b border-[#404040] hover:bg-white">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-black font-medium">
                    {header.isPlaceholder ? null : (
                      typeof header.column.columnDef.header === 'function' 
                        ? header.column.columnDef.header(header.getContext())
                        : header.column.columnDef.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-[#262626] hover:bg-[#1f1f1f] data-[state=selected]:bg-[#1f1f1f]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-[8.7px]">
                      {typeof cell.column.columnDef.cell === 'function' 
                        ? cell.column.columnDef.cell(cell.getContext())
                        : cell.getValue()
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-[#a1a1a1]">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-[#a1a1a1]">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-[#a1a1a1]">Rows per page:</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px] bg-[#262626] border-[#404040] text-white">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top" className="bg-[#262626] border-[#404040] text-white">
                {[8, 16, 24, 32, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              className="h-8 px-2 lg:px-3 bg-transparent border-[#404040] text-[#a1a1a1] hover:bg-[#262626] hover:text-white"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Previous</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            
            {Array.from({ length: Math.min(3, table.getPageCount()) }, (_, i) => {
              const pageNumber = i + 1
              const isCurrentPage = table.getState().pagination.pageIndex + 1 === pageNumber
              return (
                <Button
                  key={pageNumber}
                  variant={isCurrentPage ? "default" : "outline"}
                  className={
                    isCurrentPage
                      ? "h-8 w-8 bg-[#4285f4] text-white hover:bg-[#3367d6]"
                      : "h-8 w-8 bg-transparent border-[#404040] text-[#a1a1a1] hover:bg-[#262626] hover:text-white"
                  }
                  onClick={() => table.setPageIndex(pageNumber - 1)}
                >
                  {pageNumber}
                </Button>
              )
            })}
            
            <Button
              variant="outline"
              className="h-8 px-2 lg:px-3 bg-transparent border-[#404040] text-[#a1a1a1] hover:bg-[#262626] hover:text-white"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Next</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}