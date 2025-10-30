import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ColumnDef } from "@tanstack/react-table"
import { Archive, Edit, Info } from "lucide-react"
import type { Dispatcher, DispatcherColumnsOptions } from "../types"

export const createColumns = (opts: DispatcherColumnsOptions): ColumnDef<Dispatcher>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-black data-[state=checked]:bg-[#4285f4] data-[state=checked]:border-[#4285f4] data-[state=unchecked]:border-black"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-white data-[state=checked]:bg-[#4285f4] data-[state=checked]:border-[#4285f4] data-[state=unchecked]:border-white"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="text-[#a1a1a1]">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium text-black hover:text-gray-700 hover:bg-transparent focus:bg-transparent active:bg-transparent"
        >
          Name
          <svg className="ml-2 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-white font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "contactNumber",
    header: "Contact Number",
    cell: ({ row }) => <div className="text-[#a1a1a1]">{row.getValue("contactNumber")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="text-[#a1a1a1]">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium text-black hover:text-gray-700 hover:bg-transparent focus:bg-transparent active:bg-transparent"
        >
          Created At
          <svg className="ml-2 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-[#a1a1a1]">{row.getValue("createdAt")}</div>,
    sortingFn: (rowA, rowB, columnId) => {
      // Parse the formatted date strings back to Date objects for comparison
      try {
        const dateA = new Date(rowA.getValue(columnId))
        const dateB = new Date(rowB.getValue(columnId))
        
        // Handle invalid dates
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0
        if (isNaN(dateA.getTime())) return 1
        if (isNaN(dateB.getTime())) return -1
        
        // Sort by date ascending (oldest to newest)
        return dateA.getTime() - dateB.getTime()
      } catch (error) {
        console.error('Error sorting dates:', error)
        // Fallback to string comparison
        const a = String(rowA.getValue(columnId))
        const b = String(rowB.getValue(columnId))
        return a.localeCompare(b)
      }
    },
    sortDescFirst: false,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-[#a1a1a1] hover:text-white hover:bg-[#262626]"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Open menu</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start" 
            side="left" 
            sideOffset={2}
            className="bg-[#171717] border border-[#2a2a2a] text-white hover:text-white w-50 p-3 rounded-[5px] shadow-lg flex flex-col space-y-1"
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                opts.onMoreInfo(row.original)
              }}
              className="hover:bg-[#404040] focus:bg-[#404040] rounded-[5px] cursor-pointer hover:text-white focus:text-white"
            >
              <Info className="mr-2 h-4 w-4 text-white" />
              <span>More Info</span>
            </DropdownMenuItem>
            
            {/* Show Edit only if onEdit callback is provided (typically for active dispatchers) */}
            {opts.onEdit && (
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  opts.onEdit?.(row.original)
                }}
                className="hover:bg-[#404040] focus:bg-[#404040] rounded-[5px] cursor-pointer hover:text-white focus:text-white"
              >
                <Edit className="mr-2 h-4 w-4 text-white" />
                <span>Edit</span>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator className="bg-[#404040]" />
            
            {/* Show Archive only if onArchive callback is provided (typically for active dispatchers) */}
            {opts.onArchive && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  opts.onArchive?.(row.original)
                }}
                className="hover:bg-[#404040] focus:bg-[#FF00001A] text-[#FF0000] rounded-[5px] cursor-pointer hover:text-[#FF0000] focus:text-[#FF0000] text-sm"
              >
                <Archive className="mr-2 h-4 w-4 text-[#FF0000]" />
                <span>Archive</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export type { Dispatcher }

