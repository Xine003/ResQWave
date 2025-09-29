import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ArchiveRestore, Info, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { createColumns, type CommunityGroup } from "./components/Column"
import { CommunityGroupInfoSheet } from "./components/CommunityGroupInfoSheet"
import { CommunityGroupDrawer } from "./components/CreateCommunityGroupSheet"
import { DataTable } from "./components/DataTable"
import type { CommunityGroupDetails } from "./types"

// active groups are now managed in state (initially empty)

// Archived groups are also managed in state (start empty)

const makeArchivedColumns = (
  onMoreInfo: (g: CommunityGroup) => void,
  onRestore?: (g: CommunityGroup) => void,
  onDeletePermanent?: (g: CommunityGroup) => void
) => [
  ...createColumns({ onMoreInfo }).slice(0, -1), 
  {
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
  },
]

export function CommunityGroups() {
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active")
   const [drawerOpen, setDrawerOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [selectedInfoData, setSelectedInfoData] = useState<CommunityGroupDetails | undefined>(undefined)
  const [activeGroups, setActiveGroups] = useState<CommunityGroup[]>([])
  const [archivedGroups, setArchivedGroups] = useState<CommunityGroup[]>([])
  const [infoById, setInfoById] = useState<Record<string, CommunityGroupDetails>>({})
  const [searchVisible, setSearchVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingGroup, setEditingGroup] = useState<CommunityGroup | null>(null)
  const [editData, setEditData] = useState<CommunityGroupDetails | undefined>(undefined)

  const generateCommunityId = () => `CG-${Date.now()}`

  const handleMoreInfo = useCallback((group: CommunityGroup) => {
    const detailed = infoById[group.id]
    if (detailed) {
      setSelectedInfoData(detailed)
    } else {
      // Fallback mapping if detailed info is not available
      setSelectedInfoData({
        name: group.name,
        terminalId: group.id.replace("CG-", "RSQW-"),
        communityId: group.id,
        individuals: 0,
        families: 0,
        kids: 0,
        seniors: 0,
        pwds: 0,
        pregnantWomen: 0,
        notableInfo: [],
        focalPerson: {
          name: group.focalPerson,
          contactNumber: group.contactNumber,
          email: "",
          houseAddress: group.address,
          coordinates: "",
        },
        alternativeFocalPerson: {
          altName: "",
          altContactNumber: "",
          altEmail: "",
        },
      })
    }
    setInfoOpen(true)
  }, [infoById])

  const handleArchive = useCallback((group: CommunityGroup) => {
    setActiveGroups((prev) => prev.filter((g) => g.id !== group.id))
    setArchivedGroups((prev) => [group, ...prev])
  }, [])

  const handleRestore = useCallback((group: CommunityGroup) => {
    setArchivedGroups((prev) => prev.filter((g) => g.id !== group.id))
    setActiveGroups((prev) => [group, ...prev])
  }, [])

  const handleDeletePermanent = useCallback((group: CommunityGroup) => {
    setArchivedGroups((prev) => prev.filter((g) => g.id !== group.id))
    setInfoById((prev) => {
      const { [group.id]: _omit, ...rest } = prev
      return rest
    })
  }, [])

  const handleEdit = useCallback((group: CommunityGroup) => {
    setEditingGroup(group)
    
    // Get the detailed info for this group, or create default data
    const detailed = infoById[group.id] || {
      name: group.name,
      terminalId: group.id.replace("CG-", "RSQW-"),
      communityId: group.id,
      individuals: 0,
      families: 0,
      kids: 0,
      seniors: 0,
      pwds: 0,
      pregnantWomen: 0,
      notableInfo: [],
      focalPerson: {
        name: group.focalPerson,
        contactNumber: group.contactNumber,
        email: "",
        houseAddress: group.address,
        coordinates: "",
      },
      alternativeFocalPerson: {
        name: "",
        contactNumber: "",
        email: "",
      },
    }
    
    setEditData(detailed)
    setDrawerOpen(true)
  }, [infoById])

  const activeColumns = useMemo(() => createColumns({ onMoreInfo: handleMoreInfo, onEdit: handleEdit, onArchive: handleArchive }), [handleMoreInfo, handleEdit, handleArchive])
  const archivedColumns = useMemo(() => makeArchivedColumns(handleMoreInfo, handleRestore, handleDeletePermanent), [handleMoreInfo, handleRestore, handleDeletePermanent])

  // Filter function for search
  const filterGroups = (groups: CommunityGroup[]) => {
    if (!searchQuery.trim()) return groups
    
    return groups.filter((group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.focalPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.contactNumber.includes(searchQuery) ||
      group.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const filteredActiveGroups = filterGroups(activeGroups)
  const filteredArchivedGroups = filterGroups(archivedGroups)

  const tableData = activeTab === "active" ? filteredActiveGroups : filteredArchivedGroups
  const tableColumns = activeTab === "active" ? activeColumns : archivedColumns

  // Reopen the drawer automatically if we return from the map flow
  useEffect(() => {
    const maybeReopen = () => {
      try {
        const flag = sessionStorage.getItem("cg_reopen_sheet")
        if (flag === "1") {
          setDrawerOpen(true)
          // Do not clear here; let the drawer clear when saving/closing intentionally
          
          // Also restore edit state if it was persisted
          const snapshot = sessionStorage.getItem("cg_form_snapshot")
          if (snapshot) {
            try {
              const snap = JSON.parse(snapshot)
              if (snap?.isEditing && snap?.editData) {
                setEditingGroup(snap.editData?.communityId ? {
                  id: snap.editData.communityId,
                  name: snap.editData.name || "",
                  status: "OFFLINE" as const,
                  focalPerson: snap.editData.focalPerson?.name || "",
                  contactNumber: snap.editData.focalPerson?.contactNumber || "",
                  address: snap.editData.address || snap.editData.focalPerson?.houseAddress || "",
                  registeredAt: new Date().toLocaleDateString(),
                } : null)
                setEditData(snap.editData)
              }
            } catch {
              // Ignore malformed data
            }
          }
        }
      } catch {}
    }
    maybeReopen()
    window.addEventListener("focus", maybeReopen)
    return () => window.removeEventListener("focus", maybeReopen)
  }, [])

  return (
    <div className="bg-[#171717] text-white p-4 sm:p-6 flex flex-col h-[calc(100vh-73px)]">
      <div className="w-full max-w-9xl mx-auto flex-1 flex flex-col min-h-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <h1 className="text-2xl font-semibold text-white">Community Groups</h1>
            <div className="flex items-center gap-1 bg-[#262626] rounded-[5px] p-1">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-4 py-2 rounded-[5px] text-sm font-medium transition-colors ${
                  activeTab === "active" ? "bg-[#404040] text-white" : "bg-transparent text-[#a1a1a1] hover:text-white"
                }`}
              >
                Active Groups
                <span className="ml-2 px-2 py-0.5 bg-[#707070] rounded text-xs">{activeGroups.length}</span>
              </button>
              <button
                onClick={() => setActiveTab("archived")}
                className={`px-4 py-2 rounded-[5px] text-sm font-medium transition-colors ${
                  activeTab === "archived"
                    ? "bg-[#404040] text-white"
                    : "bg-transparent text-[#a1a1a1] hover:text-white"
                }`}
              >
                Archived Groups
                <span className="ml-2 px-2 py-0.5 bg-[#707070] rounded text-xs">{archivedGroups.length}</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {searchVisible && (
              <Input
                type="text"
                placeholder="Search community groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-[#262626] border-[#404040] text-white placeholder:text-[#a1a1a1] focus:border-[#4285f4]"
                autoFocus
              />
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`text-[#a1a1a1] hover:text-white hover:bg-[#262626] ${searchVisible ? 'bg-[#262626] text-white' : ''}`}
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
            <Button onClick={() => {
              setEditingGroup(null)
              setEditData(undefined)
              setDrawerOpen(true)
            }} className="bg-[#4285f4] hover:bg-[#3367d6] text-white px-4 py-2 rounded-[5px] flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Community Group
            </Button>
            <CommunityGroupDrawer
              open={drawerOpen}
              onOpenChange={(open) => {
                setDrawerOpen(open)
                if (!open) {
                  // Clear edit state when closing
                  setEditingGroup(null)
                  setEditData(undefined)
                }
              }}
              editData={editData}
              isEditing={!!editingGroup}
              onSave={(infoData) => {
                if (editingGroup) {
                  // Update existing group
                  const updatedRow: CommunityGroup = {
                    ...editingGroup,
                    name: infoData.name,
                    focalPerson: infoData.focalPerson.name,
                    contactNumber: infoData.focalPerson.contactNumber,
                    address: infoData.address || infoData.focalPerson.houseAddress,
                  }
                  
                  // Update in the appropriate list (active or archived)
                  setActiveGroups((prev) => 
                    prev.map((group) => group.id === editingGroup.id ? updatedRow : group)
                  )
                  setArchivedGroups((prev) => 
                    prev.map((group) => group.id === editingGroup.id ? updatedRow : group)
                  )
                  
                  // Update detailed info
                  const fullInfo = { ...infoData, communityId: editingGroup.id }
                  setInfoById((prev) => ({ ...prev, [editingGroup.id]: fullInfo }))
                  setSelectedInfoData(fullInfo)
                  setInfoOpen(true)
                  
                  // Clear edit state
                  setEditingGroup(null)
                  setEditData(undefined)
                } else {
                  // Add new group (existing logic)
                  const newId = generateCommunityId()
                  const row: CommunityGroup = {
                    id: newId,
                    name: infoData.name,
                    status: "OFFLINE",
                    focalPerson: infoData.focalPerson.name,
                    contactNumber: infoData.focalPerson.contactNumber,
                    address: infoData.address || infoData.focalPerson.houseAddress,
                    registeredAt: new Date().toLocaleDateString(),
                  }
                  setActiveGroups((prev) => [row, ...prev])
                  const fullInfo = { ...infoData, communityId: newId }
                  setInfoById((prev) => ({ ...prev, [newId]: fullInfo }))
                  setSelectedInfoData(fullInfo)
                  setInfoOpen(true)
                }
              }}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <DataTable
            columns={tableColumns}
            data={tableData}
            onRowClick={(row) => handleMoreInfo(row as CommunityGroup)}
          />
        </div>
      </div>

      {/* Info Sheet */}
      <CommunityGroupInfoSheet
        open={infoOpen}
        onOpenChange={setInfoOpen}
        communityData={selectedInfoData}
      />
    </div>
  )
}
