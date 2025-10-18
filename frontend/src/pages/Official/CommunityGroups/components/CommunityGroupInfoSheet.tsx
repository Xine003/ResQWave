import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ExpandIcon, Plus, ZoomOut } from "lucide-react";
import { useState } from "react";
import type { CommunityGroupInfoSheetProps } from "../types";

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


  function openViewer(url: string) {
    setViewerUrl(url)
    setViewerZoom(1)
    setViewerOpen(true)
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
          <div className="bg-[#0b0b0b] rounded-[6px] flex justify-center mt-1">
            <div className="relative w-full max-w-full h-60 rounded-[8px] overflow-hidden bg-[#111]">
              {communityData.focalPerson.photo ? (
                <>
                  {/* Blurred backdrop */}
                  <img
                    src={communityData.focalPerson.photo}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover filter blur-[18px] brightness-50 scale-[1.2]"
                  />
                  {/* Foreground image */}
                  <img
                    src={communityData.focalPerson.photo}
                    alt="Focal Person"
                    className="relative w-auto h-full max-w-[60%] m-auto block object-contain"
                  />
                  {/* Expand button */}
                  <button
                    type="button"
                    onClick={() => openViewer(communityData.focalPerson.photo!)}
                    aria-label="Expand focal person image"
                    className="absolute right-3 bottom-3 w-9 h-9 rounded-[5px] bg-white text-black flex items-center justify-center shadow hover:bg-gray-100 active:scale-[0.98]"
                  >
                    <ExpandIcon className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                    <span className="text-[#a1a1a1] text-2xl font-semibold">
                      {communityData.focalPerson.name?.charAt(0) || 'F'}
                    </span>
                  </div>
                </div>
              )}
            </div>
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
          <div className="bg-[#0b0b0b] rounded-[6px] flex justify-center mt-1">
            <div className="relative w-full max-w-full h-60 rounded-[8px] overflow-hidden bg-[#111]">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                  <span className="text-[#a1a1a1] text-2xl font-semibold">
                    {communityData.alternativeFocalPerson?.altName?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>
            </div>
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

      {/* Fullscreen Image Viewer */}
      {viewerOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={resetZoomAndClose}
        >
          <div 
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={resetZoomAndClose}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
              aria-label="Close viewer"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Zoom controls */}
            <div className="absolute -top-12 left-0 flex items-center space-x-2 z-10">
              <button
                type="button"
                onClick={zoomOut}
                disabled={viewerZoom <= 0.5}
                className="text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-6 h-6" />
              </button>
              <span className="text-white text-sm min-w-[3rem] text-center">
                {Math.round(viewerZoom * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                disabled={viewerZoom >= 3}
                className="text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Zoom in"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Image */}
            {viewerUrl && (
              <img
                src={viewerUrl}
                alt="Expanded view"
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${viewerZoom})` }}
              />
            )}
          </div>
        </div>
      )}
    </Sheet>
  )
}

export default CommunityGroupInfoSheet
