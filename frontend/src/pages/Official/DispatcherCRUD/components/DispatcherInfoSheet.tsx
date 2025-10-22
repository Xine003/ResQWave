import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ExpandIcon, Minus, Plus, ZoomOut } from "lucide-react"
import { useState } from "react"
import type { DispatcherInfoSheetProps } from "../types"

export function DispatcherInfoSheet({ 
  open, 
  onOpenChange, 
  dispatcherData 
}: DispatcherInfoSheetProps) {
  // Safety check - don't render if no data
  if (!dispatcherData) {
    return null
  }
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

  if (!dispatcherData) return null

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
          {/* Photo Section */}
          <div className="space-y-4">
            {/* Image card with blurred background and expand button */}
            <div className="bg-[#0b0b0b] rounded-[6px] flex justify-center mt-1">
              <div className="relative w-full max-w-full h-60 rounded-[8px] overflow-hidden bg-[#111]">
                {dispatcherData.photo && dispatcherData.photo.trim() !== '' ? (
                  <>
                    {/* Blurred backdrop as image */}
                    <img
                      src={dispatcherData.photo}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover filter blur-[18px] brightness-50 scale-[1.2]"
                      onError={(e) => {
                        console.error('Error loading photo backdrop:', e)
                        // Hide the image on error
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    {/* Foreground image */}
                    <img
                      src={dispatcherData.photo}
                      alt="Dispatcher"
                      className="relative w-auto h-full max-w-[60%] m-auto block object-contain"
                      onError={(e) => {
                        console.error('Error loading photo:', e)
                        // Replace with fallback on error
                        e.currentTarget.style.display = 'none'
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class="relative w-full h-full flex items-center justify-center">
                              <div class="w-24 h-24 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                                <span class="text-[#a1a1a1] text-2xl font-semibold">
                                  ${dispatcherData.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                          `
                        }
                      }}
                    />
                    {/* Expand button */}
                    <button
                      type="button"
                      onClick={() => openViewer(dispatcherData.photo!)}
                      aria-label="Expand image"
                      className="absolute right-3 bottom-3 w-9 h-9 rounded-[5px] bg-white text-black flex items-center justify-center shadow hover:bg-gray-100 active:scale-[0.98]"
                    >
                      <ExpandIcon className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                      <span className="text-[#a1a1a1] text-2xl font-semibold">
                        {dispatcherData?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 text-[#666] text-sm">
                      No photo
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-[#2a2a2a]"></div>

          {/* Information Fields */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white text-[10px] pl-3 font-bold">ID</span>
              <span className="text-white text-[10px]">{dispatcherData.id}</span>
            </div>
            <div className="border-t border-[#2a2a2a]"></div>
            <div className="flex justify-between items-center">
              <span className="text-white text-[10px] pl-3 font-bold">FULL NAME</span>
              <span className="text-white text-[10px]">{dispatcherData.name}</span>
            </div>
            <div className="border-t border-[#2a2a2a]"></div>
            <div className="flex justify-between items-center">
              <span className="text-white text-[10px] pl-3 font-bold">CONTACT NUMBER</span>
              <span className="text-white text-[10px]">{dispatcherData.contactNumber}</span>
            </div>
            <div className="border-t border-[#2a2a2a]"></div>
            <div className="flex justify-between items-center">
              <span className="text-white text-[10px] pl-3 font-bold">EMAIL</span>
              <span className="text-white text-[10px]">{dispatcherData.email}</span>
            </div>
            <div className="border-t border-[#2a2a2a]"></div>
            <div className="flex justify-between items-center">
              <span className="text-white text-[10px] pl-3 font-bold">CREATED DATE</span>
              <span className="text-white text-[10px]">{dispatcherData.createdAt}</span>
            </div>
            {dispatcherData.createdBy && (
              <>
                <div className="border-t border-[#2a2a2a]"></div>
                <div className="flex justify-between items-center">
                  <span className="text-white text-[10px] pl-3 font-bold">CREATED BY</span>
                  <span className="text-white text-[10px]">{dispatcherData.createdBy}</span>
                </div>
              </>
            )}
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