"use client"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ExpandIcon } from "lucide-react"
import type { CommunityGroupInfoSheetProps } from "../types"

export function CommunityGroupInfoSheet({
  open,
  onOpenChange,
  communityData = {
    name: "Sicat Residence",
    terminalId: "RSQW-001",
    communityId: "COMGROUP-01",
    individuals: 50,
    families: 10,
    kids: 5,
    seniors: 50,
    pwds: 10,
    pregnantWomen: 5,
    notableInfo: ["Prone to landslide and tree falling"],
    focalPerson: {
      name: "Gwyneth Uy",
      photo:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-09-26%20174543-9whXfzMpPpWdgMCm7BU4C2kfRMU7dv.png",
      contactNumber: "0905 3854 2034",
      email: "uy.gwynethfabul@gmail.com",
      houseAddress: "Block 1, Lot 17, Paraiso Rd, 1400",
      coordinates: "14.774083, 121.042443",
    },
    alternativeFocalPerson: {
      name: "Rodel Sustiguer",
      contactNumber: "(+63) 905 3854 2034",
      email: "sustiguer.rodel@gmail.com",
    },
  },
}: CommunityGroupInfoSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[500px] bg-[#171717] border-[#2a2a2a] text-white p-0 overflow-y-auto rounded-[5px]"
      >
        <SheetHeader className="px-6 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white text-lg font-medium">More information</SheetTitle>
          </div>
        </SheetHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Community Name */}
          <div className="bg-white text-black px-4 py-3 rounded-[5px]">
            <h2 className="font-medium text-xs">{communityData.name}</h2>
          </div>

          {/* Terminal and Community IDs */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white text-[10px] font-medium">TERMINAL ID</span>
              <span className="text-white text-[10px]">{communityData.terminalId}</span>
            </div>
            <div className="border-t border-[#2a2a2a]"></div>
            <div className="flex justify-between items-center">
              <span className="text-white text-[10px] font-medium">COMMUNITY ID</span>
              <span className="text-white text-[10px]">{communityData.communityId}</span>
            </div>
          </div>

          <div className="border-t border-[#2a2a2a]"></div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#262626] px-4 py-3 rounded-[5px] text-center">
              <div className="text-white text-sm font-semibold">{communityData.individuals}</div>
              <div className="text-gray-300 text-[10px]">Individuals</div>
            </div>
            <div className="bg-[#262626] px-4 py-3 rounded-[5px] text-center">
              <div className="text-white text-sm font-semibold">{communityData.families}</div>
              <div className="text-gray-300 text-[10px]">Families</div>
            </div>
            <div className="bg-[#262626] px-4 py-3 rounded-[5px] text-center">
              <div className="text-white text-sm font-semibold">{communityData.kids}</div>
              <div className="text-gray-300 text-[10px]">Kids</div>
            </div>
            <div className="bg-[#262626] px-4 py-3 rounded-[5px] text-center">
              <div className="text-white text-sm font-semibold">{communityData.seniors}</div>
              <div className="text-gray-300 text-[10px]">Seniors</div>
            </div>
            <div className="bg-[#262626] px-4 py-3 rounded-[5px] text-center">
              <div className="text-white text-sm font-semibold">{communityData.pwds}</div>
              <div className="text-gray-300 text-[10px]">PWDs</div>
            </div>
            <div className="bg-[#262626] px-4 py-3 rounded-[5px] text-center">
              <div className="text-white text-sm font-semibold">{communityData.pregnantWomen}</div>
              <div className="text-gray-300 text-[10px]">Pregnant Women</div>
            </div>
          </div>

          {/* Notable Information */}
          {communityData.notableInfo.length > 0 && (
            <div className="bg-[#262626] px-4 py-3 rounded-[5px]">
              <ul className="space-y-1">
                {communityData.notableInfo.map((info, index) => (
                  <li key={index} className="text-white text-[10px] flex items-start">
                    <span className="mr-2">•</span>
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-[#2a2a2a]"></div>

          {/* Focal Persons Section */}
          <div className="space-y-4">
            <div className="bg-white text-black px-4 py-3 rounded-[5px]">
              <h3 className="font-medium text-xs">Focal Persons</h3>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <div className="relative bg-gray-800 rounded-[5px] overflow-hidden cursor-pointer group">
                  <img
                    src={communityData.focalPerson.photo || "/placeholder.svg?height=200&width=400"}
                    alt="Focal Person"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-3 right-3 bg-white bg-opacity-20 group-hover:bg-opacity-30 p-2 rounded-[5px] transition-colors">
                    <ExpandIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black border-none">
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img
                    src={communityData.focalPerson.photo || "/placeholder.svg?height=600&width=800"}
                    alt="Focal Person - Full Screen"
                    className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain rounded-[5px]"
                  />
                </div>
              </DialogContent>
            </Dialog>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] font-medium">NAME</span>
                <span className="text-white text-[10px]">{communityData.focalPerson.name}</span>
              </div>
              <div className="border-t border-[#2a2a2a]"></div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] font-medium">CONTACT NO.</span>
                <span className="text-white text-[10px]">{communityData.focalPerson.contactNumber}</span>
              </div>
              <div className="border-t border-[#2a2a2a]"></div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] font-medium">EMAIL</span>
                <span className="text-white text-[10px]">{communityData.focalPerson.email}</span>
              </div>
              <div className="border-t border-[#2a2a2a]"></div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] font-medium">HOUSE ADDRESS</span>
                <span className="text-white text-[10px] text-right">{communityData.focalPerson.houseAddress}</span>
              </div>
              <div className="border-t border-[#2a2a2a]"></div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] font-medium">COORDINATES</span>
                <span className="text-white text-[10px]">{communityData.focalPerson.coordinates}</span>
              </div>

              <div className="border-t border-[#2a2a2a]"></div>

              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] font-medium">ALTERNATIVE FOCAL PERSON</span>
                <span className="text-white text-[10px]">{communityData.alternativeFocalPerson.name}</span>
              </div>
              <div className="border-t border-[#2a2a2a]"></div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] font-medium">CONTACT NO.</span>
                <span className="text-white text-[10px]">{communityData.alternativeFocalPerson.contactNumber}</span>
              </div>
              <div className="border-t border-[#2a2a2a]"></div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] font-medium">EMAIL</span>
                <span className="text-white text-[10px]">{communityData.alternativeFocalPerson.email}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
