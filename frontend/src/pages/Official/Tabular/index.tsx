import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Search } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { AlertInfoDialog } from "./components/AlertInfoDialog"
import { createColumns } from "./components/Columns"
import { DataTable } from "./components/DataTable"
import { mockLiveReportData } from "./data/mockData"
import type { AlertFilter, LiveReportAlert, TabType } from "./types"
import { applyAllFilters, getTabCounts } from "./utils/filters"

export function Tabular() {
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [searchVisible, setSearchVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [alertTypeFilter, setAlertTypeFilter] = useState("All")
  const [selectedAlert, setSelectedAlert] = useState<LiveReportAlert | null>(null)
  const [alertInfoOpen, setAlertInfoOpen] = useState(false)

  const handleMoreInfo = useCallback((alert: LiveReportAlert) => {
    setSelectedAlert(alert)
    setAlertInfoOpen(true)
  }, [])

  const handleAssign = useCallback((alert: LiveReportAlert) => {
    console.log("Assign alert:", alert)
    // TODO: Implement assign functionality
  }, [])

  const handleDispatch = useCallback((alert: LiveReportAlert) => {
    console.log("Dispatch alert:", alert)
    // TODO: Implement dispatch functionality
  }, [])

  const columns = useMemo(() => createColumns({ 
    onMoreInfo: handleMoreInfo, 
    onAssign: handleAssign,
    onDispatch: handleDispatch 
  }), [handleMoreInfo, handleAssign, handleDispatch])

  const filters: AlertFilter = {
    tab: activeTab,
    search: searchQuery,
    alertType: alertTypeFilter
  }

  const filteredAlerts = applyAllFilters(mockLiveReportData, filters)
  const tabCounts = getTabCounts(mockLiveReportData)

  return (
    <div className="flex flex-col h-full bg-[#171717] text-white p-6">
      {/* Header with Title and Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold text-white">Live Report</h1>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-[#2c2a2a] rounded-[5px] border border-[#383838]">
            <TabButton 
              active={activeTab === "all"} 
              onClick={() => setActiveTab("all")}
              count={tabCounts.all}
            >
              All
            </TabButton>
            <TabButton 
              active={activeTab === "unassigned"} 
              onClick={() => setActiveTab("unassigned")}
              count={tabCounts.unassigned}
            >
              Unassigned
            </TabButton>
            <TabButton 
              active={activeTab === "waitlisted"} 
              onClick={() => setActiveTab("waitlisted")}
              count={tabCounts.waitlisted}
            >
              Waitlisted
            </TabButton>
            <TabButton 
              active={activeTab === "dispatched"} 
              onClick={() => setActiveTab("dispatched")}
              count={tabCounts.dispatched}
            >
              Dispatched
            </TabButton>
          </div>
        </div>
        
        {/* Search and Controls */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            {searchVisible ? (
              <div className="flex items-center">
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-[#262626] border-[#404040] text-white placeholder-[#a1a1a1] focus:border-[#4285f4]"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchVisible(false)
                    setSearchQuery("")
                  }}
                  className="ml-2 rounded-[5px] border-[#414141] bg-[#2c2a2a] text-[#a1a1a1] hover:text-white"
                >
                  ✕
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchVisible(true)}
                className="text-[#a1a1a1] rounded-[5px] border border-[#414141] bg-[#2c2a2a] hover:text-white hover:bg-[#262626]"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Sort Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-[#a1a1a1] rounded-[5px] border border-[#414141] bg-[#2c2a2a] hover:text-white hover:bg-[#262626]"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>

          {/* Alert Type Filter */}
          <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
            <SelectTrigger className="w-48 bg-[#262626] border-[#404040] text-white">
              <SelectValue>
                Alert Type: {alertTypeFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#262626] border-[#404040] text-white">
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="USER-INITIATED">User Initiated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1">
        <DataTable 
          columns={columns} 
          data={filteredAlerts}
          onRowClick={(alert) => handleMoreInfo(alert)}
        />
      </div>

      {/* Alert Info Dialog */}
      <AlertInfoDialog
        alert={selectedAlert}
        open={alertInfoOpen}
        onOpenChange={setAlertInfoOpen}
      />
    </div>
  )
}

// Tab Button Component
interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  count: number
}

function TabButton({ active, onClick, children, count }: TabButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`
        relative px-4 py-2 text-sm font-medium rounded-[5px] transition-colors
        ${active 
          ? "bg-[#414141] text-white" 
          : "text-[#c9c9c9] hover:text-white"
        }
      `}
    >
      {children}
      <span className={`
        ml-2 px-2 py-0.5 text-xs rounded-[5px]
        ${active 
          ? "bg-white/20 text-white" 
          : "bg-[#404040] text-[#a1a1a1]"
        }
      `}>
        {count}
      </span>
    </Button>
  )
}