import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ArchiveRestore, Info, Trash2 } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { createColumns, type Dispatcher } from "./components/Column"
import { CreateDispatcherSheet } from "./components/CreateDispatcherSheet"
import { DataTable } from "./components/DataTable"
import { DispatcherInfoSheet } from "./components/DispatcherInfoSheet"
import { predefinedDispatcherDetails, predefinedDispatchers } from "./data/predefinedDispatchers"
import type { DispatcherDetails } from "./types"

// Create archived columns for the archived tab
const makeArchivedColumns = (
  onMoreInfo: (d: Dispatcher) => void,
  onRestore?: (d: Dispatcher) => void,
  onDeletePermanent?: (d: Dispatcher) => void
) => 
  createColumns({ 
    onMoreInfo, 
    onEdit: undefined, // No edit for archived items
    onArchive: undefined // No archive for already archived items
  }).map(column => {
    if (column.id === "actions") {
      return {
        id: "actions",
        enableHiding: false,
        cell: ({ row }: any) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-[#a1a1a1] hover:text-white hover:bg-[#262626]">
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
            align="start" side="left" sideOffset={2}
            className="bg-[#171717] border border-[#2a2a2a] text-white hover:text-white w-50 h-35 p-3 rounded-[5px] shadow-lg flex flex-col space-y-1"
          >
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onMoreInfo(row.original) }}
              className="hover:bg-[#404040] focus:bg-[#404040] rounded-[5px] cursor-pointer hover:text-white focus:text-white"
            >
              <Info className="mr-2 h-4 w-4 text-white" />
              <span className="text-sm">More Info</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onRestore && onRestore(row.original) }}
              className="hover:bg-[#404040] focus:bg-[#404040] rounded-[5px] cursor-pointer hover:text-white focus:text-white"
            >
              <ArchiveRestore className="mr-2 h-4 w-4 text-white" />
              <span className="text-sm">Restore</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#404040]" />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDeletePermanent && onDeletePermanent(row.original) }}
              className="hover:bg-[#404040] focus:bg-[#FF00001A] text-[#FF0000] rounded-[5px] cursor-pointer hover:text-[#FF0000] focus:text-[#FF0000] text-sm"
            >
              <Trash2 className="mr-2 h-4 w-4 text-[#FF0000]" />
              <span>Delete Permanently</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        ),
      }
    }
    return column
  })

export function Dispatchers() {
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active")
  const [infoOpen, setInfoOpen] = useState(false)
  const [selectedInfoData, setSelectedInfoData] = useState<DispatcherDetails | undefined>(undefined)
  const [activeDispatchers, setActiveDispatchers] = useState<Dispatcher[]>(predefinedDispatchers)
  const [archivedDispatchers, setArchivedDispatchers] = useState<Dispatcher[]>([])
  const [infoById, setInfoById] = useState<Record<string, DispatcherDetails>>(predefinedDispatcherDetails)
  const [searchVisible, setSearchVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingDispatcher, setEditingDispatcher] = useState<Dispatcher | null>(null)
  const [editData, setEditData] = useState<DispatcherDetails | undefined>(undefined)

  const handleMoreInfo = useCallback((dispatcher: Dispatcher) => {
    const detailed = infoById[dispatcher.id]
    if (detailed) {
      setSelectedInfoData(detailed)
    } else {
      // Fallback mapping if detailed info is not available
      setSelectedInfoData({
        id: dispatcher.id,
        name: dispatcher.name,
        contactNumber: dispatcher.contactNumber,
        email: dispatcher.email,
        createdAt: dispatcher.createdAt,
      })
    }
    setInfoOpen(true)
  }, [infoById])

  const handleArchive = useCallback((dispatcher: Dispatcher) => {
    setActiveDispatchers((prev) => prev.filter((d) => d.id !== dispatcher.id))
    setArchivedDispatchers((prev) => [dispatcher, ...prev])
  }, [])

  const handleRestore = useCallback((dispatcher: Dispatcher) => {
    setArchivedDispatchers((prev) => prev.filter((d) => d.id !== dispatcher.id))
    setActiveDispatchers((prev) => [dispatcher, ...prev])
  }, [])

  const handleDeletePermanent = useCallback((dispatcher: Dispatcher) => {
    setArchivedDispatchers((prev) => prev.filter((d) => d.id !== dispatcher.id))
    setInfoById((prev) => {
      const { [dispatcher.id]: _omit, ...rest } = prev
      return rest
    })
  }, [])

  const handleEdit = useCallback((dispatcher: Dispatcher) => {
    setEditingDispatcher(dispatcher)
    
    // Get the detailed info for this dispatcher, or create default data
    const detailed = infoById[dispatcher.id] || {
      id: dispatcher.id,
      name: dispatcher.name,
      contactNumber: dispatcher.contactNumber,
      email: dispatcher.email,
      createdAt: dispatcher.createdAt,
    }
    
    setEditData(detailed)
    setDrawerOpen(true)
  }, [infoById])

  const activeColumns = useMemo(() => createColumns({ onMoreInfo: handleMoreInfo, onEdit: handleEdit, onArchive: handleArchive }), [handleMoreInfo, handleEdit, handleArchive])
  const archivedColumns = useMemo(() => makeArchivedColumns(handleMoreInfo, handleRestore, handleDeletePermanent), [handleMoreInfo, handleRestore, handleDeletePermanent])

  // Filter function for search
  const filterDispatchers = (dispatchers: Dispatcher[]) => {
    if (!searchQuery.trim()) return dispatchers
    
    return dispatchers.filter((dispatcher) =>
      dispatcher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispatcher.contactNumber.includes(searchQuery) ||
      dispatcher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispatcher.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const filteredActiveDispatchers = filterDispatchers(activeDispatchers)
  const filteredArchivedDispatchers = filterDispatchers(archivedDispatchers)

  const tableData = activeTab === "active" ? filteredActiveDispatchers : filteredArchivedDispatchers
  const tableColumns = activeTab === "active" ? activeColumns : archivedColumns

  const handleSaveDispatcher = useCallback((dispatcherData: DispatcherDetails) => {
    if (editingDispatcher) {
      // Update existing dispatcher
      const updatedRow: Dispatcher = {
        ...editingDispatcher,
        name: dispatcherData.name,
        contactNumber: dispatcherData.contactNumber,
        email: dispatcherData.email,
      }
      
      // Update in the appropriate list (active or archived)
      setActiveDispatchers((prev) => 
        prev.map((dispatcher) => dispatcher.id === editingDispatcher.id ? updatedRow : dispatcher)
      )
      setArchivedDispatchers((prev) => 
        prev.map((dispatcher) => dispatcher.id === editingDispatcher.id ? updatedRow : dispatcher)
      )
      
      // Update detailed info including photo
      setInfoById((prev) => ({ ...prev, [editingDispatcher.id]: dispatcherData }))
      
      // Clear edit state
      setEditingDispatcher(null)
      setEditData(undefined)
    } else {
      // Add new dispatcher
      const newId = `CG-${Date.now()}`
      const row: Dispatcher = {
        id: newId,
        name: dispatcherData.name,
        contactNumber: dispatcherData.contactNumber,
        email: dispatcherData.email,
        createdAt: new Date().toLocaleDateString(),
      }
      setActiveDispatchers((prev) => [row, ...prev])
      const fullInfo = { ...dispatcherData, id: newId }
      setInfoById((prev) => ({ ...prev, [newId]: fullInfo }))
    }
  }, [editingDispatcher])

  return (
    <div className="bg-[#171717] text-white p-4 sm:p-6 flex flex-col h-[calc(100vh-73px)]">
      <div className="w-full max-w-9xl mx-auto flex-1 flex flex-col min-h-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <h1 className="text-2xl font-semibold text-white">Dispatchers</h1>
            <div className="flex items-center gap-1 bg-[#262626] rounded-[5px] p-1">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-4 py-2 rounded-[5px] text-sm font-medium transition-colors ${
                  activeTab === "active" ? "bg-[#404040] text-white" : "bg-transparent text-[#a1a1a1] hover:text-white"
                }`}
              >
                Active
                <span className="ml-2 px-2 py-0.5 bg-[#707070] rounded text-xs">{activeDispatchers.length}</span>
              </button>
              <button
                onClick={() => setActiveTab("archived")}
                className={`px-4 py-2 rounded-[5px] text-sm font-medium transition-colors ${
                  activeTab === "archived"
                    ? "bg-[#404040] text-white"
                    : "bg-transparent text-[#a1a1a1] hover:text-white"
                }`}
              >
                Archived
                <span className="ml-2 px-2 py-0.5 bg-[#707070] rounded text-xs">{archivedDispatchers.length}</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              searchVisible ? 'w-64 opacity-100' : 'w-0 opacity-0'
            }`}>
              <Input
                type="text"
                placeholder="Search dispatchers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-[#262626] border-[#404040] text-white placeholder:text-[#a1a1a1] focus:border-[#4285f4] transition-all duration-300"
                autoFocus={searchVisible}
              />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`text-[#a1a1a1] hover:text-white hover:bg-[#262626] transition-all duration-200 ${searchVisible ? 'bg-[#262626] text-white' : ''}`}
              onClick={() => {
                setSearchVisible(!searchVisible)
                if (searchVisible) {
                  setSearchQuery("")
                }
              }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Button>
            <Button 
              onClick={() => {
                setEditingDispatcher(null)
                setEditData(undefined)
                setDrawerOpen(true)
              }} 
              className="bg-[#4285f4] hover:bg-[#3367d6] text-white px-4 py-2 rounded-[5px] flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Dispatcher
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <DataTable
            columns={tableColumns}
            data={tableData}
            onRowClick={(row) => handleMoreInfo(row as Dispatcher)}
          />
        </div>
      </div>

      {/* Info Sheet */}
      <DispatcherInfoSheet
        open={infoOpen}
        onOpenChange={setInfoOpen}
        dispatcherData={selectedInfoData}
      />

      {/* Create Dispatcher Sheet */}
      <CreateDispatcherSheet
        open={drawerOpen}
        onOpenChange={(open: boolean) => {
          setDrawerOpen(open)
          if (!open) {
            // Clear edit state when closing
            setEditingDispatcher(null)
            setEditData(undefined)
          }
        }}
        editData={editData}
        isEditing={!!editingDispatcher}
        onSave={handleSaveDispatcher}
      />
    </div>
  )
}
