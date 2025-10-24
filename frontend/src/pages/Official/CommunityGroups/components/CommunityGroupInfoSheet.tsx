import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ExpandIcon, Plus, ZoomOut } from "lucide-react";

import { useEffect, useState } from "react";
import type { CommunityGroupInfoSheetProps } from "../types";

export function CommunityGroupInfoSheet({
  open,
  onOpenChange,
  communityData,
}: CommunityGroupInfoSheetProps) {
  // Image viewer state
  useEffect(() => {
    if (open && communityData) {
      console.debug('[InfoSheet] communityData:', communityData);
    }
  }, [open, communityData]);
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  
  // Photo state (just for auth blob conversion)
  const [photos, setPhotos] = useState<{
    mainPhoto?: string
    altPhoto?: string
  }>({})
  const [photosLoading, setPhotosLoading] = useState(false)

  // Discrete zoom steps and class mappings (no inline styles)
  const zoomSteps = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3] as const
  type Zoom = (typeof zoomSteps)[number]
  const [viewerZoom, setViewerZoom] = useState<Zoom>(1)

  // Load photos only if URLs are present and need auth (otherwise just use the URLs directly)
  useEffect(() => {
    if (!communityData || !open) return;
    setPhotosLoading(true);
    const token = localStorage.getItem('resqwave_token');
    const fetchPhoto = async (url?: string) => {
      if (!url) return undefined;
      try {
        if (!token) return url;
        const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!resp.ok) return url;
        const blob = await resp.blob();
        return URL.createObjectURL(blob);
      } catch {
        return url;
      }
    };
    Promise.all([
      fetchPhoto(communityData.focalPerson?.photo),
      fetchPhoto(communityData.alternativeFocalPerson?.altPhoto)
    ]).then(([mainPhoto, altPhoto]) => {
      setPhotos({ mainPhoto, altPhoto });
    }).finally(() => setPhotosLoading(false));
  }, [communityData, open]);


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



  // Use address and coordinates directly from communityData
  const terminalAddress = communityData.address || 'N/A';
  let terminalCoordinates: string = 'N/A';
  if (communityData.coordinates && typeof communityData.coordinates === 'string' && communityData.coordinates.trim() !== '') {
    terminalCoordinates = communityData.coordinates;
  } else if (
    communityData.focalPerson &&
    typeof communityData.focalPerson.houseAddress === 'string' &&
    communityData.focalPerson.houseAddress.trim() !== ''
  ) {
    try {
      const parsed = JSON.parse(communityData.focalPerson.houseAddress);
      if (parsed && typeof parsed.coordinates === 'string' && parsed.coordinates.trim() !== '') {
        terminalCoordinates = parsed.coordinates;
      }
    } catch {}
  }

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
            <span className="text-white text-sm">
              {terminalAddress}
            </span>
          </div>

          {/* Coordinates */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">Coordinates</span>
            <span className="text-white text-sm">
              {terminalCoordinates !== 'N/A' ? terminalCoordinates : 'N/A'}
            </span>
          </div>

          {/* Neighborhood Information Section */}
          <div className="bg-white text-black px-4 py-2 rounded font-medium text-sm">
            Neighborhood Information
          </div>

          {/* No. of Households */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">No. of Households</span>
            <span className="text-white text-sm">{communityData.families || "0"}</span>
          </div>

          {/* No. of Residents */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">No. of Residents</span>
            <span className="text-white text-sm">{communityData.individuals || "0"}</span>
          </div>

          {/* Floodwater Subsidence Duration */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm">Floodwater Subsidence Duration</span>
            <span className="text-white text-sm">
              {communityData.floodSubsideHours ? `${communityData.floodSubsideHours} hours` : "N/A"}
            </span>
          </div>

          {/* Flood-related hazards */}
          <div className="bg-[#262626] border border-[#404040] rounded p-4">
            <h3 className="text-white text-sm font-medium mb-3">Flood-related hazards</h3>
            {communityData.hazards && communityData.hazards.length > 0 ? (
              <ul className="space-y-1 text-white text-sm">
                {communityData.hazards.map((hazard, index) => (
                  <li key={index}>• {hazard}</li>
                ))}
              </ul>
            ) : (
              <p className="text-white text-sm">No hazards recorded</p>
            )}
          </div>

          {/* Other notable information */}
          <div className="bg-[#262626] border border-[#404040] rounded p-4">
            <h3 className="text-white text-sm font-medium mb-3">Other notable information</h3>
            {communityData.notableInfo && communityData.notableInfo.length > 0 ? (
              <ul className="space-y-1 text-white text-sm">
                {communityData.notableInfo.map((info, index) => (
                  <li key={index}>• {info}</li>
                ))}
              </ul>
            ) : (
              <p className="text-white text-sm">No additional information</p>
            )}
          </div>

          {/* Focal Persons Section */}
          <div className="bg-white text-black px-4 py-2 rounded font-medium text-sm">
            Focal Persons
          </div>

          {/* Main Focal Person Photo */}
          <div className="bg-[#0b0b0b] rounded-[6px] flex justify-center mt-1">
            <div className="relative w-full max-w-full h-60 rounded-[8px] overflow-hidden bg-[#111]">
              {photos.mainPhoto ? (
                <>
                  {/* Blurred backdrop */}
                  <img
                    src={photos.mainPhoto}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover filter blur-[18px] brightness-50 scale-[1.2]"
                    onError={(e) => {
                      console.error('Error loading focal person photo backdrop:', e)
                      e.currentTarget.classList.add('hidden')
                    }}
                  />
                  {/* Foreground image */}
                  <img
                    src={photos.mainPhoto}
                    alt="Focal Person"
                    className="relative w-auto h-full max-w-[60%] m-auto block object-contain"
                    onError={(e) => {
                      console.error('Error loading focal person photo:', e)
                      console.error('Photo URL that failed:', photos.mainPhoto)
                      const img = e.currentTarget
                      const parent = img.parentElement
                      if (parent) {
                        img.style.display = 'none'
                        // Find backdrop image and hide it too
                        const backdrop = parent.querySelector('[aria-hidden]') as HTMLImageElement
                        if (backdrop) backdrop.classList.add('hidden')
                        
                        // Create fallback element
                        const fallback = document.createElement('div')
                        fallback.className = 'relative w-full h-full flex items-center justify-center'
                        fallback.innerHTML = `
                          <div class="w-24 h-24 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                            <span class="text-[#a1a1a1] text-2xl font-semibold">
                              ${communityData.focalPerson?.name?.charAt(0) || 'F'}
                            </span>
                          </div>
                        `
                        parent.appendChild(fallback)
                      }
                    }}
                  />
                  {/* Expand button */}
                  <button
                    type="button"
                    onClick={() => openViewer(photos.mainPhoto!)}
                    aria-label="Expand focal person image"
                    className="absolute right-3 bottom-3 w-9 h-9 rounded-[5px] bg-white text-black flex items-center justify-center shadow hover:bg-gray-100 active:scale-[0.98]"
                  >
                    <ExpandIcon className="w-4 h-4" />
                  </button>
                </>
              ) : photosLoading ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                  <div className="absolute bottom-3 right-3 text-[#666] text-sm">
                    Loading...
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                    <span className="text-[#a1a1a1] text-2xl font-semibold">
                      {communityData.focalPerson?.name?.charAt(0) || 'F'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 text-[#666] text-sm">
                    No photo
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Focal Person Details */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-medium">FOCAL PERSON</span>
            <span className="text-white text-sm">
              {communityData.focalPerson?.name?.trim() || "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-medium">CONTACT NO.</span>
            <span className="text-white text-sm">
              {communityData.focalPerson?.contactNumber?.trim() || "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-medium">EMAIL</span>
            <span className="text-white text-sm">
              {communityData.focalPerson?.email?.trim() || "N/A"}
            </span>
          </div>

          {/* Alternative Focal Person Photo */}
          <div className="bg-[#0b0b0b] rounded-[6px] flex justify-center mt-1">
            <div className="relative w-full max-w-full h-60 rounded-[8px] overflow-hidden bg-[#111]">
              {photos.altPhoto ? (
                <>
                  {/* Blurred backdrop */}
                  <img
                    src={photos.altPhoto}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover filter blur-[18px] brightness-50 scale-[1.2]"
                    onError={(e) => {
                      console.error('Error loading alternative focal person photo backdrop:', e)
                      e.currentTarget.classList.add('hidden')
                    }}
                  />
                  {/* Foreground image */}
                  <img
                    src={photos.altPhoto}
                    alt="Alternative Focal Person"
                    className="relative w-auto h-full max-w-[60%] m-auto block object-contain"
                    onError={(e) => {
                      console.error('Error loading alternative focal person photo:', e)
                      console.error('Alt photo URL that failed:', photos.altPhoto)
                      const img = e.currentTarget
                      const parent = img.parentElement
                      if (parent) {
                        img.classList.add('hidden')
                        // Find backdrop image and hide it too
                        const backdrop = parent.querySelector('[aria-hidden]') as HTMLImageElement
                        if (backdrop) backdrop.classList.add('hidden')
                        
                        // Create fallback element
                        const fallback = document.createElement('div')
                        fallback.className = 'relative w-full h-full flex items-center justify-center'
                        fallback.innerHTML = `
                          <div class="w-24 h-24 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                            <span class="text-[#a1a1a1] text-2xl font-semibold">
                              ${communityData.alternativeFocalPerson?.altName?.charAt(0) || 'A'}
                            </span>
                          </div>
                        `
                        parent.appendChild(fallback)
                      }
                    }}
                  />
                  {/* Expand button */}
                  <button
                    type="button"
                    onClick={() => openViewer(photos.altPhoto!)}
                    aria-label="Expand alternative focal person image"
                    className="absolute right-3 bottom-3 w-9 h-9 rounded-[5px] bg-white text-black flex items-center justify-center shadow hover:bg-gray-100 active:scale-[0.98]"
                  >
                    <ExpandIcon className="w-4 h-4" />
                  </button>
                </>
              ) : photosLoading ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                  <div className="absolute bottom-3 right-3 text-[#666] text-sm">
                    Loading...
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-[#3a3a3a] rounded-full flex items-center justify-center">
                    <span className="text-[#a1a1a1] text-2xl font-semibold">
                      {communityData.alternativeFocalPerson?.altName?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 text-[#666] text-sm">
                    No photo
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alternative Focal Person Details */}
          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-medium">ALTERNATIVE FOCAL PERSON</span>
            <span className="text-white text-sm">
              {communityData.alternativeFocalPerson?.altName?.trim() || "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-medium">CONTACT NO.</span>
            <span className="text-white text-sm">
              {communityData.alternativeFocalPerson?.altContactNumber?.trim() || "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-medium">EMAIL</span>
            <span className="text-white text-sm">
              {communityData.alternativeFocalPerson?.altEmail?.trim() || "N/A"}
            </span>
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
