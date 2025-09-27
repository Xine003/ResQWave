import { Button } from "@/components/ui/button"
import { useState } from "react"
import { columns, type CommunityGroup } from "./components/columns"
import { DataTable } from "./components/data-table"

const communityGroups: CommunityGroup[] = [
  {
    id: "CG-008",
    name: "Riverside Community",
    status: "ONLINE",
    focalPerson: "Juan Dela Cruz",
    contactNumber: "0928 456 7891",
    address: "Block 5, Lot 14, Riverside Rd, 1423",
    registeredAt: "August 30, 2025",
  },
  {
    id: "CG-007",
    name: "Maligaya Homes",
    status: "OFFLINE",
    focalPerson: "Kristine Lopez",
    contactNumber: "0908 765 4321",
    address: "Block 3, Lot 8, Maligaya Rd, 1411",
    registeredAt: "August 30, 2025",
  },
  {
    id: "CG-006",
    name: "San Jose Compound",
    status: "OFFLINE",
    focalPerson: "Roberto Reyes",
    contactNumber: "0945 123 9876",
    address: "Block 7, Lot 22, Sto. Niño Rd, 1420",
    registeredAt: "September 1, 2025",
  },
  {
    id: "CG-005",
    name: "Paraiso Homes",
    status: "OFFLINE",
    focalPerson: "Angela Cruz",
    contactNumber: "0967 123 0987",
    address: "Block 2, Lot 19, San Jose Rd, 1409",
    registeredAt: "September 3, 2025",
  },
  {
    id: "CG-004",
    name: "Harmony Residences",
    status: "ONLINE",
    focalPerson: "Michael Tan",
    contactNumber: "0918 345 6729",
    address: "Block 18, Lot 22, Maligaya Rd, 1425",
    registeredAt: "September 5, 2025",
  },
  {
    id: "CG-003",
    name: "Sampaguita Heights",
    status: "ONLINE",
    focalPerson: "Jessa Villanueva",
    contactNumber: "0956 123 0984",
    address: "Block 6, Lot 12, Sampaguita Rd, 1417",
    registeredAt: "September 7, 2025",
  },
  {
    id: "CG-002",
    name: "Tatalon Court",
    status: "OFFLINE",
    focalPerson: "Carlo Mendoza",
    contactNumber: "0978 234 5610",
    address: "Block 4, Lot 9, Riverside Rd, 1421",
    registeredAt: "September 8, 2025",
  },
  {
    id: "CG-001",
    name: "Banaba Extension",
    status: "OFFLINE",
    focalPerson: "Liza Ramos",
    contactNumber: "0998 765 4312",
    address: "Block 9, Lot 7, Bagong Silang Rd, 1413",
    registeredAt: "September 10, 2025",
  },
]

export function CommunityGroups() {
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active")

  return (
  <div className="bg-[#171717] text-white p-4 sm:p-6 flex flex-col" style={{height: 'calc(100vh - 73px)'}}>
      <div className="w-full max-w-9xl mx-auto flex-1 flex flex-col min-h-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <h1 className="text-2xl font-semibold text-white">Community Groups</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-4 py-2 rounded-[5px] text-sm font-medium transition-colors ${
                  activeTab === "active" ? "bg-[#404040] text-white" : "bg-transparent text-[#a1a1a1] hover:text-white"
                }`}
              >
                Active Groups
                <span className="ml-2 px-2 py-0.5 bg-[#262626] rounded text-xs">9</span>
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
                <span className="ml-2 px-2 py-0.5 bg-[#262626] rounded text-xs">1</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-[#a1a1a1] hover:text-white hover:bg-[#262626]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Button>
            <Button className="bg-[#4285f4] hover:bg-[#3367d6] text-white px-4 py-2 rounded-[5px] flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Community Group
            </Button>
          </div>
        </div>

  <div className="flex-1 min-h-0 overflow-auto">
          <DataTable columns={columns} data={communityGroups} />
        </div>
      </div>
    </div>
  )
}
