import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ExpandIcon, Minus, Plus, ZoomOut } from "lucide-react"
import { useState } from "react"
import type { CommunityGroupInfoSheetProps } from "../types"

export function CommunityGroupInfoSheet({
  open,
  onOpenChange,
  communityData,
}: CommunityGroupInfoSheetProps) {
  // Image viewer state
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)

  // Discrete zoom steps and class mappings (no inline styles)
  const zoomSteps = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3] as const
  type Zoom = (typeof zoomSteps)[number]
  const [viewerZoom, setViewerZoom] = useState<Zoom>(1)
  const zoomClassMap: Record<Zoom, string> = {
    0.5: "scale-[0.5]",
    0.75: "scale-[0.75]",
    1: "scale-100",
    1.25: "scale-[1.25]",
    1.5: "scale-[1.5]",
    1.75: "scale-[1.75]",
    2: "scale-[2]",
    2.5: "scale-[2.5]",
    3: "scale-[3]",
  }

  function openViewer(url: string) {
    setViewerUrl(url)
    setViewerZoom(1)
    setViewerOpen(true)
  }
  function closeViewer() {
    setViewerOpen(false)
    setViewerUrl(null)
  }
  function zoomIn() {
    setViewerZoom((z) => {
      const idx = zoomSteps.findIndex((s) => s === z)
      return zoomSteps[Math.min(zoomSteps.length - 1, idx + 1)]
    })
  }
  function zoomOut() {
    setViewerZoom((z) => {
      const idx = zoomSteps.findIndex((s) => s === z)
      return zoomSteps[Math.max(0, idx - 1)]
    })
  }
  function resetZoomAndClose() {
    setViewerZoom(1)
    setViewerOpen(false)
    setViewerUrl(null)
  }

  // No data yet: don't render static fallback
  if (!communityData) return null

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        // If the sheet tries to close while the viewer is open (e.g., outside click/Escape),
        // close the viewer instead and keep the sheet open.
        if (!next && viewerOpen) {
          setViewerOpen(false)
          return
        }
        onOpenChange(next)
      }}
    >
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
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white text-[10px] pl-3 font-bold">TERMINAL ID</span>
              <span className="text-white text-[10px]">{communityData.terminalId}</span>
            </div>
            <div className="border-t border-[#2a2a2a]"></div>
            <div className="flex justify-between items-center">
              <span className="text-white text-[10px] mt-2 pl-3 font-bold">COMMUNITY ID</span>
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

            {/* Image card with blurred background and expand button */}
            <div className="bg-[#0b0b0b] rounded-[6px] flex justify-center mt-1">
              <div className="relative w-full max-w-full h-60 rounded-[8px] overflow-hidden bg-[#111]">
                {/* Blurred backdrop as image */}
                <img
                  src={communityData.focalPerson.photo || "/placeholder.svg?height=200&width=400"}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover filter blur-[18px] brightness-50 scale-[1.2]"
                />
                {/* Foreground image */}
                <img
                  src={communityData.focalPerson.photo || "/placeholder.svg?height=200&width=400"}
                  alt="Focal Person"
                  className="relative w-auto h-full max-w-[60%] m-auto block object-contain"
                />
                {/* Expand button */}
                <button
                  type="button"
                  onClick={() =>
                    openViewer(
                      communityData.focalPerson.photo || "/placeholder.svg?height=600&width=800"
                    )
                  }
                  aria-label="Expand image"
                  className="absolute right-3 bottom-3 w-9 h-9 rounded-[5px] bg-white text-black flex items-center justify-center shadow hover:bg-gray-100 active:scale-[0.98]"
                >
                  <ExpandIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] pl-3 font-bold">NAME</span>
                <span className="text-white text-[10px]">{communityData.focalPerson.name}</span>
              </div>
              <div className="border-t border-[#2a2a2a]"></div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] pl-3 font-bold">CONTACT NO.</span>
                <span className="text-white text-[10px]">{communityData.focalPerson.contactNumber}</span>
              </div>
              <div className="border-t border-[#2a2a2a]"></div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] pl-3 font-bold">EMAIL</span>
                <span className="text-white text-[10px]">{communityData.focalPerson.email}</span>
              </div>
              <div className="border-t border-[#2a2a2a]"></div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] pl-3 font-bold">HOUSE ADDRESS</span>
                <span className="text-white text-[10px] text-right">{communityData.focalPerson.houseAddress}</span>
              </div>
              <div className="border-t border-[#2a2a2a]"></div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] pl-3 font-bold">COORDINATES</span>
                <span className="text-white text-[10px]">{communityData.focalPerson.coordinates}</span>
              </div>

              <div className="border-t border-[#2a2a2a]"></div>

              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] pl-3 font-bold">ALTERNATIVE FOCAL PERSON</span>
                <span className="text-white text-[10px]">{communityData.alternativeFocalPerson.altName}</span>
              </div>
              <div className="border-t border-[#2a2a2a]"></div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] pl-3 font-bold">CONTACT NO.</span>
                <span className="text-white text-[10px]">{communityData.alternativeFocalPerson.altContactNumber}</span>
              </div>
              <div className="border-t border-[#2a2a2a]"></div>
              <div className="flex justify-between items-center">
                <span className="text-white text-[10px] pl-3 font-bold">EMAIL</span>
                <span className="text-white text-[10px]">{communityData.alternativeFocalPerson.altEmail}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Fullscreen image viewer overlay (keeps sheet open) */}
        {viewerOpen && viewerUrl && (
          <div
            onClick={closeViewer}
            onPointerDown={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="relative w-full h-full max-w-[900px] max-h-[70vh] flex items-center justify-center px-4"
            >
              <img
                src={viewerUrl!}
                alt="viewer"
                className={`w-full h-full object-contain select-none transition-transform duration-150 ${zoomClassMap[viewerZoom]}`}
                draggable={false}
              />

            </div>
            {/* Toolbar: Zoom controls only */}
            <div
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute left-1/2 -translate-x-1/2 bottom-16 flex items-center gap-3"
            >
              <div className="flex shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    zoomOut()
                  }}
                  className="bg-white text-black w-12 h-12 flex items-center justify-center border-r border-gray-200 rounded-l-md hover:bg-gray-50"
                  aria-label="Zoom out"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    resetZoomAndClose()
                  }}
                  className="bg-white text-black min-w-12 h-12 px-4 flex items-center justify-center border-x border-gray-200 hover:bg-gray-50 text-sm font-medium"
                  aria-label="Reset zoom and close"
                >
                <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    zoomIn()
                  }}
                  className="bg-white text-black w-12 h-12 flex items-center justify-center border-l border-gray-200 rounded-r-md hover:bg-gray-50"
                  aria-label="Zoom in"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
