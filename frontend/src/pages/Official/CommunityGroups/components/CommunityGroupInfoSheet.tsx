import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ExpandIcon } from "lucide-react"
import type { CommunityGroupInfoSheetProps } from "../types"

export function CommunityGroupInfoSheet({
  open,
  onOpenChange,
  communityData,
}: CommunityGroupInfoSheetProps) {
  // No data yet: don't render static fallback
  if (!communityData) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[500px] bg-[#171717] border-[#2a2a2a] text-white p-0 overflow-y-auto rounded-[5px]"
      >
        <SheetHeader className="px-6 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white text-lg font-medium">More Information</SheetTitle>
          </div>
        </SheetHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Neighborhood ID */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">Neighborhood ID</span>
            <span className="text-white text-sm">{communityData.communityId}</span>
          </div>

          {/* Terminal ID */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">Terminal ID</span>
            <span className="text-white text-sm">{communityData.terminalId}</span>
          </div>

          {/* Terminal Address */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">Terminal Address</span>
            <span className="text-white text-sm">{communityData.address || "Block 1, Lot 17, Paraiso Rd, 1400"}</span>
          </div>

          {/* Coordinates */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">Coordinates</span>
            <span className="text-white text-sm">
              {communityData.coordinates ? 
                `${communityData.coordinates[1]}, ${communityData.coordinates[0]}` : 
                "14.774083, 121.042443"
              }
            </span>
          </div>

          {/* Neighborhood Information Section */}
          <div className="bg-white text-black px-4 py-2 rounded font-medium text-sm">
            Neighborhood Information
          </div>

          {/* No. of Households */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">No. of Households</span>
            <span className="text-white text-sm">{communityData.families || "10"}</span>
          </div>

          {/* No. of Residents */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">No. of Residents</span>
            <span className="text-white text-sm">{communityData.individuals || "10"}</span>
          </div>

          {/* Floodwater Subsidence Duration */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">Floodwater Subsidence Duration</span>
            <span className="text-white text-sm">~ 1 hr</span>
          </div>

          {/* Flood-related hazards */}
          <div className="bg-[#262626] border border-[#404040] rounded p-4">
            <h3 className="text-white text-sm font-medium mb-3">Flood-related hazards</h3>
            <ul className="space-y-1 text-white text-sm">
              <li>• Strong water current</li>
              <li>• Risk of landslide or erosion</li>
              <li>• Roads become impassable</li>
            </ul>
          </div>

          {/* Other notable information */}
          <div className="bg-[#262626] border border-[#404040] rounded p-4">
            <h3 className="text-white text-sm font-medium mb-3">Other notable information</h3>
            <ul className="space-y-1 text-white text-sm">
              <li>• 3 roads (St. Jhude, St. Perez, St. Lilia) are blocked</li>
            </ul>
          </div>

          {/* Focal Persons Section */}
          <div className="bg-white text-black px-4 py-2 rounded font-medium text-sm">
            Focal Persons
          </div>

          {/* Main Focal Person Photo */}
          <div className="relative">
            <img 
              src={communityData.focalPerson.photo || "/api/placeholder/400/200"}
              alt="Focal Person" 
              className="w-full h-48 object-cover rounded"
            />
            <button 
              className="absolute bottom-2 right-2 bg-white p-1 rounded"
              title="Expand focal person image"
            >
              <ExpandIcon className="w-4 h-4 text-black" />
            </button>
          </div>

          {/* Main Focal Person Details */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-medium">NAME</span>
            <span className="text-white text-sm">{communityData.focalPerson.name}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-medium">CONTACT NO.</span>
            <span className="text-white text-sm">{communityData.focalPerson.contactNumber}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-medium">EMAIL</span>
            <span className="text-white text-sm">{communityData.focalPerson.email}</span>
          </div>

          {/* Alternative Focal Person Photo */}
          <div className="relative">
            <img 
              src="/api/placeholder/400/200"
              alt="Alternative Focal Person" 
              className="w-full h-48 object-cover rounded"
            />
            <button 
              className="absolute bottom-2 right-2 bg-white p-1 rounded"
              title="Expand alternative focal person image"
            >
              <ExpandIcon className="w-4 h-4 text-black" />
            </button>
          </div>

          {/* Alternative Focal Person Details */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-medium">ALTERNATIVE FOCAL PERSON</span>
            <span className="text-white text-sm">{communityData.alternativeFocalPerson?.altName || "Rodel Sustiguer"}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-medium">CONTACT NO.</span>
            <span className="text-white text-sm">{communityData.alternativeFocalPerson?.altContactNumber || "0905 563 2034"}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-medium">EMAIL</span>
            <span className="text-white text-sm">{communityData.alternativeFocalPerson?.altEmail || "sustiguer.rodel@gmail.com"}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
