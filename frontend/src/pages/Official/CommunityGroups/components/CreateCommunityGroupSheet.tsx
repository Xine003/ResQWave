import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ChevronDown, ChevronUp, Map, Plus, RefreshCcw, Trash, Upload, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { CommunityGroupDrawerProps } from "../types"
import { CloseCreateDialog } from "./CloseCreateDialog"

export function CommunityGroupDrawer({ open, onOpenChange, onSave, editData, isEditing }: CommunityGroupDrawerProps) {
  
  // Add a more explicit restoration function
  const restoreFromSession = useCallback(async () => {
    try {
      const snapRaw = sessionStorage.getItem("cg_form_snapshot")
      console.log("🔍 Explicit restore check. Found snapshot:", !!snapRaw)
      
      if (!snapRaw) return false
      
      const snap = JSON.parse(snapRaw)
      if (!snap?.formData) return false
      
      console.log("🔄 Explicitly restoring session data...")
      
      // Convert base64 strings back to File objects
      const convertBase64ToFile = (base64: string, fileName: string): File => {
        const arr = base64.split(',')
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        return new File([u8arr], fileName, { type: mime })
      }

      const restoredFormData = { ...snap.formData }
      
      // Handle photo restoration
      const restoredPhotoUrls = { focalPersonPhoto: null as string | null, altFocalPersonPhoto: null as string | null }
      
      // Convert base64 photos back to File objects and create new object URLs for display
      if (restoredFormData.focalPersonPhoto && typeof restoredFormData.focalPersonPhoto === 'string') {
        const focalFile = convertBase64ToFile(restoredFormData.focalPersonPhoto, 'focal-person-photo.jpg')
        restoredFormData.focalPersonPhoto = focalFile
        // Create a new object URL for display (not the base64 string)
        restoredPhotoUrls.focalPersonPhoto = URL.createObjectURL(focalFile)
      }
      
      if (restoredFormData.altFocalPersonPhoto && typeof restoredFormData.altFocalPersonPhoto === 'string') {
        const altFile = convertBase64ToFile(restoredFormData.altFocalPersonPhoto, 'alt-focal-person-photo.jpg')
        restoredFormData.altFocalPersonPhoto = altFile
        // Create a new object URL for display (not the base64 string)
        restoredPhotoUrls.altFocalPersonPhoto = URL.createObjectURL(altFile)
      }

      setFormData(restoredFormData)
      
      // Use the newly created object URLs for display
      const finalPhotoUrls = {
        focalPersonPhoto: restoredPhotoUrls.focalPersonPhoto,
        altFocalPersonPhoto: restoredPhotoUrls.altFocalPersonPhoto
      }
      setPhotoUrls(finalPhotoUrls)
      
      if (Array.isArray(snap?.notableInfoInputs)) setNotableInfoInputs(snap.notableInfoInputs)
      if (typeof snap?.isDirty === 'boolean') setIsDirty(snap.isDirty)
      
      // Clear snapshot
      sessionStorage.removeItem("cg_form_snapshot")
      
      console.log("✅ Explicit restore completed:", {
        communityName: restoredFormData.communityGroupName,
        hasPhotos: !!(finalPhotoUrls.focalPersonPhoto || finalPhotoUrls.altFocalPersonPhoto),
        photoDetails: {
          focalPersonPhoto: {
            hasFile: !!restoredFormData.focalPersonPhoto,
            hasUrl: !!finalPhotoUrls.focalPersonPhoto,
            urlType: finalPhotoUrls.focalPersonPhoto?.startsWith('blob:') ? 'blob' : finalPhotoUrls.focalPersonPhoto?.startsWith('data:') ? 'base64' : 'unknown'
          },
          altFocalPersonPhoto: {
            hasFile: !!restoredFormData.altFocalPersonPhoto,
            hasUrl: !!finalPhotoUrls.altFocalPersonPhoto,
            urlType: finalPhotoUrls.altFocalPersonPhoto?.startsWith('blob:') ? 'blob' : finalPhotoUrls.altFocalPersonPhoto?.startsWith('data:') ? 'base64' : 'unknown'
          }
        }
      })
      
      return true
    } catch (error) {
      console.error("❌ Explicit restore failed:", error)
      return false
    }
  }, [])
  const initialFormData = useMemo(
    () => ({
      assignedTerminal: "",
      communityGroupName: "",
      totalIndividuals: 0,
      totalFamilies: 0,
      totalKids: 0,
      totalSeniorCitizen: 0,
      totalPregnantWomen: 0,
      totalPWDs: 0,
      focalPersonPhoto: null as File | null,
      focalPersonName: "",
      focalPersonContact: "",
      focalPersonEmail: "",
      focalPersonAddress: "",
      focalPersonCoordinates: "",
      altFocalPersonPhoto: null as File | null,
      altFocalPersonName: "",
      altFocalPersonContact: "",
      altFocalPersonEmail: "",
      // map selections
      boundaryGeoJSON: "",
    }),
    []
  )

  const [formData, setFormData] = useState(initialFormData)
  const [photoUrls, setPhotoUrls] = useState<{
    focalPersonPhoto: string | null
    altFocalPersonPhoto: string | null
  }>({
    focalPersonPhoto: null,
    altFocalPersonPhoto: null
  })

  const [notableInfoInputs, setNotableInfoInputs] = useState<string[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const navigate = useNavigate()

  // Persist current form state before navigating to the map so we can restore it afterwards
  const persistFormSnapshot = useCallback(async () => {
    try {
      // Convert File objects to base64 strings for serialization
      const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      const focalPersonPhotoBase64 = formData.focalPersonPhoto 
        ? await convertFileToBase64(formData.focalPersonPhoto)
        : null
      
      const altFocalPersonPhotoBase64 = formData.altFocalPersonPhoto 
        ? await convertFileToBase64(formData.altFocalPersonPhoto)
        : null

      const safeForm = {
        ...formData,
        focalPersonPhoto: focalPersonPhotoBase64,
        altFocalPersonPhoto: altFocalPersonPhotoBase64
      }
      
      // Also persist photo URLs and other state
      const snapshot = JSON.stringify({ 
        formData: safeForm, 
        notableInfoInputs,
        photoUrls: {
          focalPersonPhoto: photoUrls.focalPersonPhoto,
          altFocalPersonPhoto: photoUrls.altFocalPersonPhoto
        },
        isDirty,
        isEditing,
        editData
      })
      
      sessionStorage.setItem("cg_form_snapshot", snapshot)
      sessionStorage.setItem("cg_reopen_sheet", "1")
      
      console.log("✅ Persisted form snapshot with", Object.keys(safeForm).length, "form fields and", notableInfoInputs.length, "notable info inputs")
      console.log("📋 Snapshot includes:", {
        hasFormData: !!snapshot.includes('formData'),
        hasPhotos: !!(focalPersonPhotoBase64 || altFocalPersonPhotoBase64),
        hasBoundary: !!formData.boundaryGeoJSON,
        notableInfoCount: notableInfoInputs.length,
        isEditing,
        communityName: formData.communityGroupName
      })
    } catch (error) {
      console.error("❌ Failed to persist form snapshot:", error)
    }
  }, [formData, notableInfoInputs, photoUrls, isDirty, isEditing, editData])

  const openAddressPicker = async () => {
    console.log("Opening address picker, persisting form data...")
    await persistFormSnapshot()
    navigate("/community-groups/setting-location")
  }
  const openCoordinatesDrawer = async () => {
    console.log("Opening coordinates drawer, persisting form data...")
    await persistFormSnapshot()
    navigate("/community-groups/setting-location")
  }

  const summarizeBoundary = useMemo(() => {
    try {
      const f = JSON.parse(formData.boundaryGeoJSON)
      if (f?.type === "Feature" && f.geometry?.type === "LineString") {
        return `LineString (${f.geometry.coordinates.length} pts)`
      }
    } catch {}
    return formData.boundaryGeoJSON ? "Custom geometry set" : " "
  }, [formData.boundaryGeoJSON])

  const resetForm = useCallback(() => {
    // Clean up any existing photo URLs (both blob URLs and object URLs)
    setPhotoUrls((currentUrls) => {
      if (currentUrls.focalPersonPhoto && 
          (currentUrls.focalPersonPhoto.startsWith('blob:') || 
           (!currentUrls.focalPersonPhoto.startsWith('data:') && currentUrls.focalPersonPhoto.includes('blob')))) {
        try {
          URL.revokeObjectURL(currentUrls.focalPersonPhoto)
          console.log("🧹 Cleaned up focal person photo URL")
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      if (currentUrls.altFocalPersonPhoto && 
          (currentUrls.altFocalPersonPhoto.startsWith('blob:') || 
           (!currentUrls.altFocalPersonPhoto.startsWith('data:') && currentUrls.altFocalPersonPhoto.includes('blob')))) {
        try {
          URL.revokeObjectURL(currentUrls.altFocalPersonPhoto)
          console.log("🧹 Cleaned up alt focal person photo URL")
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      return { focalPersonPhoto: null, altFocalPersonPhoto: null }
    })
    
    setFormData(initialFormData)
    setNotableInfoInputs([])
    setIsDirty(false)
  }, [initialFormData])

  // Reset form when not editing and drawer opens (but not if there's a session to restore)
  useEffect(() => {
    if (open && !isEditing && !hasInitializedRef.current) {
      // Check if there's a session snapshot that should be restored instead
      const hasSnapshot = sessionStorage.getItem("cg_form_snapshot")
      if (!hasSnapshot) {
        resetForm()
        hasInitializedRef.current = true
      }
    }
  }, [open, isEditing, resetForm])

  const handleNumberChange = useCallback((field: string, value: string) => {
    // Store the raw string value temporarily to allow multi-digit typing
    const numValue = value === "" ? 0 : Number.parseInt(value) || 0
    setFormData((prev) => ({ ...prev, [field]: numValue }))
    setIsDirty(true)
  }, [])

  const handleFileUpload = (field: "focalPersonPhoto" | "altFocalPersonPhoto", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
    
    // Create and store the photo URL for display
    if (file) {
      const url = URL.createObjectURL(file)
      setPhotoUrls((prev) => ({ ...prev, [field]: url }))
    } else {
      // Clean up existing URL and remove it
      if (photoUrls[field]) {
        URL.revokeObjectURL(photoUrls[field]!)
      }
      setPhotoUrls((prev) => ({ ...prev, [field]: null }))
    }
    
    setIsDirty(true)
  }

  // Track initialization state to prevent conflicts between session restoration and pre-filling
  const hasInitializedRef = useRef(false)
  const sessionRestoredRef = useRef(false)
  
  // Primary initialization effect - handles both session restore and pre-fill
  useEffect(() => {
    if (!open || hasInitializedRef.current) return
    
    console.log("🚀 Primary initialization effect triggered")
    
    const initialize = async () => {
      // First, try to restore from session
      const restored = await restoreFromSession()
      
      if (restored) {
        sessionRestoredRef.current = true
        hasInitializedRef.current = true
        console.log("✅ Initialized via session restoration")
      } else if (isEditing && editData) {
        // If no session data and we're editing, pre-fill
        console.log("📝 No session data, pre-filling edit data")
        setFormData({
          assignedTerminal: editData.terminalId || "",
          communityGroupName: editData.name || "",
          totalIndividuals: editData.individuals || 0,
          totalFamilies: editData.families || 0,
          totalKids: editData.kids || 0,
          totalSeniorCitizen: editData.seniors || 0,
          totalPregnantWomen: editData.pregnantWomen || 0,
          totalPWDs: editData.pwds || 0,
          focalPersonPhoto: null,
          focalPersonName: editData.focalPerson?.name || "",
          focalPersonContact: editData.focalPerson?.contactNumber || "",
          focalPersonEmail: editData.focalPerson?.email || "",
          focalPersonAddress: editData.focalPerson?.houseAddress || editData.address || "",
          focalPersonCoordinates: editData.focalPerson?.coordinates || "",
          altFocalPersonPhoto: null,
          altFocalPersonName: editData.alternativeFocalPerson?.altName || "",
          altFocalPersonContact: editData.alternativeFocalPerson?.altContactNumber || "",
          altFocalPersonEmail: editData.alternativeFocalPerson?.altEmail || "",
          boundaryGeoJSON: editData.boundary ? JSON.stringify(editData.boundary) : "",
        })
        setNotableInfoInputs(editData.notableInfo?.length > 0 ? editData.notableInfo : [""])
        setIsDirty(false)
        hasInitializedRef.current = true
        console.log("✅ Initialized via pre-fill")
      } else if (!isEditing) {
        // If creating new, reset form
        console.log("🆕 Creating new, resetting form")
        resetForm()
        hasInitializedRef.current = true
        console.log("✅ Initialized via reset")
      }
    }
    
    initialize()
  }, [open, isEditing, editData, restoreFromSession, resetForm])
  
  // Handle location picker results whenever drawer is open
  useEffect(() => {
    if (!open) return
    
    const consumePickResult = () => {
      try {
        const raw = sessionStorage.getItem("cg_pick_result")
        if (raw) {
          sessionStorage.removeItem("cg_pick_result")
          const parsed = JSON.parse(raw)
          console.log("🗺️ Consuming pick result:", parsed)
          
          if (parsed?.type === "both") {
            const point = parsed?.data?.point
            const line = parsed?.data?.line
            if (point?.lng != null && point?.lat != null && point?.address) {
              setFormData((prev) => ({
                ...prev,
                focalPersonAddress: point.address,
                focalPersonCoordinates: `${point.lng},${point.lat}`,
              }))
            }
            if (line?.geojson) {
              setFormData((prev) => ({ ...prev, boundaryGeoJSON: line.geojson }))
            }
            setIsDirty(true)
          } else if (parsed?.type === "point") {
            const { lng, lat, address } = parsed.data || {}
            if (lng != null && lat != null && address) {
              setFormData((prev) => ({
                ...prev,
                focalPersonAddress: address,
                focalPersonCoordinates: `${lng},${lat}`,
              }))
              setIsDirty(true)
            }
          } else if (parsed?.type === "line") {
            const { geojson } = parsed.data || {}
            if (geojson) {
              setFormData((prev) => ({ ...prev, boundaryGeoJSON: geojson }))
              setIsDirty(true)
            }
          }
          
          console.log("✅ Pick result consumed successfully")
        }
      } catch (error) {
        console.error("❌ Failed to consume pick result:", error)
      }
    }
    
    consumePickResult()
    window.addEventListener("focus", consumePickResult)
    return () => window.removeEventListener("focus", consumePickResult)
  }, [open])
  
  // Reset initialization state when drawer closes
  useEffect(() => {
    if (!open) {
      hasInitializedRef.current = false
      sessionRestoredRef.current = false
      console.log("🔄 Reset initialization state (drawer closed)")
    }
  }, [open])



  const addNotableInfoInput = () => {
    setNotableInfoInputs((prev) => [...prev, ""]) 
    setIsDirty(true)
  }

  const updateNotableInfoInput = (index: number, value: string) => {
    setNotableInfoInputs((prev) => prev.map((item, i) => (i === index ? value : item)))
    setIsDirty(true)
  }

  const removeNotableInfoInput = (index: number) => {
    if (notableInfoInputs.length > 1) {
      setNotableInfoInputs((prev) => prev.filter((_, i) => i !== index))
      setIsDirty(true)
    }
  }

  // Centralized handler when an attempt is made to close the sheet
  const requestClose = useCallback(() => {
    if (isDirty) {
      setShowCloseConfirm(true)
    } else {
      // Clear any pending reopen flags/snapshots when closing without changes
      try {
        sessionStorage.removeItem("cg_reopen_sheet")
        sessionStorage.removeItem("cg_form_snapshot")
        sessionStorage.removeItem("cg_pick_result")
      } catch {}
      onOpenChange(false)
    }
  }, [isDirty, onOpenChange])

  // Intercept Sheet's open change (overlay click, ESC, programmatic)
  const handleSheetOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        requestClose()
      } else {
        onOpenChange(true)
      }
    },
    [onOpenChange, requestClose]
  )

  const PhotoUploadArea = useCallback(({
    inputId,
    photo,
    onDelete,
    photoUrlKey,
  }: {
    inputId: string
    photo: File | null
    onDelete: () => void
    photoUrlKey: 'focalPersonPhoto' | 'altFocalPersonPhoto'
  }) => {
    // Use the stored photo URL if available, otherwise create from file
    const photoUrl = useMemo(() => {
      console.log(`🖼️ PhotoUploadArea[${photoUrlKey}] - determining URL:`, {
        hasStoredUrl: !!photoUrls[photoUrlKey],
        storedUrlType: photoUrls[photoUrlKey]?.startsWith('blob:') ? 'blob' : photoUrls[photoUrlKey]?.startsWith('data:') ? 'base64' : 'none',
        hasFile: !!photo,
        photoUrls: photoUrls[photoUrlKey]
      })
      
      // First priority: use the stored URL (for restored photos or manually set URLs)
      if (photoUrls[photoUrlKey]) {
        console.log(`✅ Using stored URL for ${photoUrlKey}:`, photoUrls[photoUrlKey].substring(0, 50) + '...')
        return photoUrls[photoUrlKey]
      }
      
      // Second priority: create from file (for newly uploaded photos)
      if (!photo) {
        console.log(`ℹ️ No photo file or stored URL for ${photoUrlKey}`)
        return null
      }
      
      try {
        const newUrl = URL.createObjectURL(photo)
        console.log(`🆕 Created new object URL for ${photoUrlKey}:`, newUrl)
        return newUrl
      } catch (error) {
        console.error(`❌ Failed to create object URL for ${photoUrlKey}:`, error)
        return null
      }
    }, [photo, photoUrlKey, photoUrls])

    // Clean up the object URL when component unmounts or photo changes
    useEffect(() => {
      return () => {
        if (photoUrl && photoUrl.startsWith('blob:') && !photoUrls[photoUrlKey]) {
          // Only revoke blob URLs we created temporarily, not the stored URLs
          try {
            URL.revokeObjectURL(photoUrl)
            console.log(`🧹 Cleaned up temporary blob URL for ${photoUrlKey}`)
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }
    }, [photoUrl, photoUrlKey, photoUrls])

    return (
      <div className="relative">
        {/* Clickable area only when there is no photo (avoids nested interactive elements) */}
        {!photo ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => document.getElementById(inputId)?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                document.getElementById(inputId)?.click()
              }
            }}
            className="bg-[#262626] border border-dashed border-[#404040] rounded-[8px] p-7 text-center flex flex-col items-center justify-center gap-[5px] hover:bg-[#2a2a2a] cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#1f2937] rounded-[8px] flex items-center justify-center">
              <Upload className="w-6 h-6 text-[#60A5FA]" />
            </div>
            <div>
              <p className="text-white font-medium">Upload photo</p>
              <p className="text-gray-400 text-sm mt-1">
                Drag and drop or click to upload
                <br />
                JPG and PNG, file size no more than 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#0b0b0b] rounded-[6px] flex justify-center mt-1">
            <div className="relative w-full h-56 rounded-[8px] overflow-hidden bg-[#111]">
              {/* Blurred backdrop */}
              <img
                src={photoUrl || "/placeholder.svg"}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover filter blur-[18px] brightness-50 scale-[1.2]"
              />
              {/* Foreground image */}
              <img
                src={photoUrl || "/placeholder.svg"}
                alt="Uploaded"
                className="relative w-auto h-full max-w-[60%] m-auto block object-contain"
              />
              {/* Actions */}
              <div className="absolute bottom-3 right-3 flex gap-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => document.getElementById(inputId)?.click()}
                  aria-label="Change photo"
                  title="Change photo"
                  className="bg-white border-[#2a2a2a] text-black hover:bg-white rounded-none w-8 h-8"
                >
                  <RefreshCcw className="w-4 h-4 text-black" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onDelete}
                  aria-label="Delete photo"
                  title="Delete photo"
                  className="bg-white border-[#2a2a2a] text-red-500 hover:bg-white rounded-none w-8 h-8"
                >
                  <Trash className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }, [])

  // Always-visible custom spinner number input
  const NumberInputWithSpinner = ({
    value,
    onChange,
    min = 0,
    step = 1,
    ariaLabel,
  }: {
    value: number
    onChange: (next: string) => void
    min?: number
    step?: number
    ariaLabel?: string
  }) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const repeatRef = useRef<number | null>(null)
    const [isIncrementing, setIsIncrementing] = useState(false)
    const [isDecrementing, setIsDecrementing] = useState(false)
    const [localValue, setLocalValue] = useState(String(value || 0))
    const [isFocused, setIsFocused] = useState(false)

    // Sync local value with external value only when not focused
    useEffect(() => {
      if (!isFocused) {
        setLocalValue(String(value || 0))
      }
    }, [value, isFocused])



    const inc = () => {
      const curr = Number.isFinite(value) ? value : 0
      const next = Math.max(min, curr + step)
      const nextStr = String(next)
      setLocalValue(nextStr)
      onChange(nextStr) // Immediate for spinner
    }
    
    const dec = () => {
      const curr = Number.isFinite(value) ? value : 0
      const next = Math.max(min, curr - step)
      const nextStr = String(next)
      setLocalValue(nextStr)
      onChange(nextStr) // Immediate for spinner
    }
    
    const startRepeat = (fn: () => void, type: 'inc' | 'dec') => {
      fn()
      if (type === 'inc') setIsIncrementing(true)
      else setIsDecrementing(true)
      
      let delay = 300
      const accelerate = () => {
        fn()
        delay = Math.max(80, delay * 0.9)
        repeatRef.current = window.setTimeout(accelerate, delay)
      }
      repeatRef.current = window.setTimeout(accelerate, delay)
    }
    
    const stopRepeat = () => {
      if (repeatRef.current != null) {
        window.clearTimeout(repeatRef.current)
        repeatRef.current = null
      }
      setIsIncrementing(false)
      setIsDecrementing(false)
    }

    // Clean up on unmount
    useEffect(() => {
      return () => {
        if (repeatRef.current != null) {
          window.clearTimeout(repeatRef.current)
        }
      }
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation() // Prevent event bubbling
      const inputValue = e.target.value
      
      // Remove any non-digit characters
      const digitsOnly = inputValue.replace(/\D/g, "")
      
      // Update local state immediately
      setLocalValue(digitsOnly)
      
      // DO NOT update parent during typing - only on blur or spinner use
      // This prevents any re-renders that could steal focus
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.stopPropagation() // Prevent event bubbling
      setIsFocused(true)
      if (value === 0) {
        setLocalValue("")
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      e.stopPropagation() // Prevent event bubbling
      setIsFocused(false)
      
      // Ensure valid number on blur and update parent
      const numValue = Math.max(min, parseInt(localValue) || 0)
      const finalValue = String(numValue)
      setLocalValue(finalValue)
      onChange(finalValue) // Only update parent on blur
    }

    return (
      <div
        className="relative group"
        onWheel={(e) => {
          e.preventDefault()
          if (e.deltaY < 0) inc()
          else if (e.deltaY > 0) dec()
        }}
      >
        <Input
          type="text"
          inputMode="numeric"
          value={localValue}
          aria-label={ariaLabel}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            e.stopPropagation() // Prevent event bubbling
            if (e.key === "ArrowUp") {
              e.preventDefault()
              inc()
            } else if (e.key === "ArrowDown") {
              e.preventDefault()
              dec()
            }
          }}
          onMouseDown={(e) => e.stopPropagation()} // Prevent event bubbling
          ref={inputRef}
          className="bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 pr-8 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none transition-all duration-200"
          autoComplete="off"
          spellCheck={false}
        />
        
        {/* Spinner Controls */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col opacity-60 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              inputRef.current?.focus()
              startRepeat(inc, 'inc')
            }}
            onMouseUp={stopRepeat}
            onMouseLeave={stopRepeat}
            onTouchStart={(e) => {
              e.preventDefault()
              inputRef.current?.focus()
              startRepeat(inc, 'inc')
            }}
            onTouchEnd={stopRepeat}
            onClick={(e) => {
              e.preventDefault()
              stopRepeat()
              inc()
            }}
            aria-label="Increment"
            className={`w-6 h-4 flex items-center justify-center bg-transparent text-white/70 hover:text-white hover:bg-white/10 rounded-sm transition-all duration-150 ${
              isIncrementing ? 'bg-white/10 text-white scale-95' : ''
            }`}
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              inputRef.current?.focus()
              startRepeat(dec, 'dec')
            }}
            onMouseUp={stopRepeat}
            onMouseLeave={stopRepeat}
            onTouchStart={(e) => {
              e.preventDefault()
              inputRef.current?.focus()
              startRepeat(dec, 'dec')
            }}
            onTouchEnd={stopRepeat}
            onClick={(e) => {
              e.preventDefault()
              stopRepeat()
              dec()
            }}
            aria-label="Decrement"
            className={`w-6 h-4 flex items-center justify-center bg-transparent text-white/70 hover:text-white hover:bg-white/10 rounded-sm transition-all duration-150 ${
              isDecrementing ? 'bg-white/10 text-white scale-95' : ''
            }`}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[500px] md:w-[540px] bg-[#171717] border-[#2a2a2a] text-white p-0 overflow-y-auto rounded-[5px]"
      >
        <SheetHeader className="px-6 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white text-lg font-medium">
              {isEditing ? "Edit Community Group" : "New Community Group"}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Assigned Terminal */}
          <div className="space-y-2">
            <Label className="text-white text-xs">Assigned Terminal</Label>
            <Select
              value={formData.assignedTerminal}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, assignedTerminal: value }))
                setIsDirty(true)
              }}
            >
              <SelectTrigger className="w-full bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600">
                <SelectValue placeholder="Select a Terminal" />
              </SelectTrigger>
              <SelectContent className="bg-[#171717] border-[#2a2a2a] text-white">
                <SelectItem value="terminal1" className="text-white hover:bg-gray-700">
                  Terminal 1
                </SelectItem>
                <SelectItem value="terminal2" className="text-white hover:bg-gray-700">
                  Terminal 2
                </SelectItem>
                <SelectItem value="terminal3" className="text-white hover:bg-gray-700">
                  Terminal 3
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Community Group Name */}
          <div className="space-y-2">
            <Label className="text-white text-xs">Community Group Name</Label>
              <Input
                value={formData.communityGroupName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, communityGroupName: e.target.value }))
                  setIsDirty(true)
                }}
              className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            />
          </div>

          {/* Population Statistics - Grid Layout */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of Individuals</Label>
              <div className="relative">
                <NumberInputWithSpinner
                  value={formData.totalIndividuals}
                  onChange={(v) => handleNumberChange("totalIndividuals", v)}
                  ariaLabel="Total No. of Individuals"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of Families</Label>
              <div className="relative">
                <NumberInputWithSpinner
                  value={formData.totalFamilies}
                  onChange={(v) => handleNumberChange("totalFamilies", v)}
                  ariaLabel="Total No. of Families"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of Kids</Label>
              <div className="relative">
                <NumberInputWithSpinner
                  value={formData.totalKids}
                  onChange={(v) => handleNumberChange("totalKids", v)}
                  ariaLabel="Total No. of Kids"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of Senior Citizen</Label>
              <div className="relative">
                <NumberInputWithSpinner
                  value={formData.totalSeniorCitizen}
                  onChange={(v) => handleNumberChange("totalSeniorCitizen", v)}
                  ariaLabel="Total No. of Senior Citizen"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of Pregnant Women</Label>
              <div className="relative">
                <NumberInputWithSpinner
                  value={formData.totalPregnantWomen}
                  onChange={(v) => handleNumberChange("totalPregnantWomen", v)}
                  ariaLabel="Total No. of Pregnant Women"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of PWDs</Label>
              <div className="relative">
                <NumberInputWithSpinner
                  value={formData.totalPWDs}
                  onChange={(v) => handleNumberChange("totalPWDs", v)}
                  ariaLabel="Total No. of PWDs"
                />
              </div>
            </div>
          </div>

          {/* Other Notable Information */}
          <div className="space-y-2">
            <Label className="text-white text-xs">Other notable information</Label>
            <div className="space-y-3">
              {notableInfoInputs.map((value, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={value}
                    onChange={(e) => updateNotableInfoInput(index, e.target.value)}
                    className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] flex-1 focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                    placeholder="Enter notable information"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNotableInfoInput(index)}
                    className="text-gray-400 hover:text-white hover:bg-[#262626]  p-1 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addNotableInfoInput}
                className="w-full bg-transparent border-[#2a2a2a] text-white hover:bg-[#262626] hover:text-white rounded-[5px] justify-center"
              >
                <Plus className="w-4 h-4 mr-2 text-white" />
                Add
              </Button>
            </div>
          </div>

          {/* Focal Person's Information */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-medium">Focal Person's Information</h3>

            <PhotoUploadArea
              inputId="focal-photo-upload"
              photo={formData.focalPersonPhoto}
              onDelete={() => handleFileUpload("focalPersonPhoto", null)}
              photoUrlKey="focalPersonPhoto"
            />
            <input
              id="focal-photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="Upload focal person photo"
              title="Upload focal person photo"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFileUpload("focalPersonPhoto", file)
                }
              }}
            />

            <div className="space-y-2">
              <Label className="text-white text-xs">Name</Label>
              <Input
                  value={formData.focalPersonName}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, focalPersonName: e.target.value }))
                    setIsDirty(true)
                  }}
                className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white text-xs">Contact Number</Label>
                  <Input
                    value={formData.focalPersonContact}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, focalPersonContact: e.target.value }))
                      setIsDirty(true)
                    }}
                  className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white text-xs">Email</Label>
                  <Input
                    type="email"
                    value={formData.focalPersonEmail}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, focalPersonEmail: e.target.value }))
                      setIsDirty(true)
                    }}
                  className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Address</Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={openAddressPicker}
                  className="w-full text-left cursor-pointer bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 pr-10 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 border px-3 py-2 min-h-[40px]"
                  title="Pick address on map"
                >
                  {formData.focalPersonAddress}
                </button>
                <Map className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Coordinates *</Label>
              <button
                type="button"
                onClick={openCoordinatesDrawer}
                className="w-full text-left bg-[#171717] cursor-pointer border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 border px-3 py-2 min-h-[40px]"
                title="Draw LineString on map"
              >
                {summarizeBoundary}
              </button>
            </div>
          </div>

          {/* Alternative Focal Person's Information */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-medium">Alternative Focal Person's Information</h3>

            <PhotoUploadArea
              inputId="alt-focal-photo-upload"
              photo={formData.altFocalPersonPhoto}
              onDelete={() => handleFileUpload("altFocalPersonPhoto", null)}
              photoUrlKey="altFocalPersonPhoto"
            />
            <input
              id="alt-focal-photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="Upload alternative focal person photo"
              title="Upload alternative focal person photo"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFileUpload("altFocalPersonPhoto", file)
                }
              }}
            />

            <div className="space-y-2">
              <Label className="text-white text-xs">Name</Label>
              <Input
                value={formData.altFocalPersonName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, altFocalPersonName: e.target.value }))
                  setIsDirty(true)
                }}
                className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white text-xs">Contact Number</Label>
                <Input
                  value={formData.altFocalPersonContact}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, altFocalPersonContact: e.target.value }))
                    setIsDirty(true)
                  }}
                  className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white text-xs">Email</Label>
                <Input
                  type="email"
                  value={formData.altFocalPersonEmail}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, altFocalPersonEmail: e.target.value }))
                    setIsDirty(true)
                  }}
                  className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-[#171717] border-t border-[#2a2a2a] px-6 py-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={requestClose}
              className="flex-1 bg-transparent border-[#2a2a2a] text-white hover:text-white hover:bg-[#262626]  rounded-[5px]"
            >
              Discard
            </Button>
            <Button
              onClick={() => {
                // Handle save logic here
                console.log("Saving community group:", formData, "Notable info:", notableInfoInputs)
                // Derive address, coordinates array, and boundary object for frontend-only persistence
                const address = formData.focalPersonAddress || ""
                let coordinatesArr: number[] = []
                if (formData.focalPersonCoordinates && formData.focalPersonCoordinates.includes(",")) {
                  const [lngStr, latStr] = formData.focalPersonCoordinates.split(",")
                  const lng = Number(lngStr)
                  const lat = Number(latStr)
                  if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
                    coordinatesArr = [lng, lat]
                  }
                }
                let boundaryObj: any = undefined
                try {
                  if (formData.boundaryGeoJSON) boundaryObj = JSON.parse(formData.boundaryGeoJSON)
                } catch {}
                const infoData = {
                  name: formData.communityGroupName || "Untitled Community",
                  terminalId: formData.assignedTerminal || "",
                  communityId: "",
                  individuals: formData.totalIndividuals,
                  families: formData.totalFamilies,
                  kids: formData.totalKids,
                  seniors: formData.totalSeniorCitizen,
                  pwds: formData.totalPWDs,
                  pregnantWomen: formData.totalPregnantWomen,
                  notableInfo: notableInfoInputs.filter((s) => s && s.trim().length > 0),
                  address: address || undefined,
                  coordinates: coordinatesArr.length === 2 ? coordinatesArr : undefined,
                  boundary: boundaryObj,
                  focalPerson: {
                    name: formData.focalPersonName,
                    photo: formData.focalPersonPhoto ? URL.createObjectURL(formData.focalPersonPhoto) : undefined,
                    contactNumber: formData.focalPersonContact,
                    email: formData.focalPersonEmail,
                    houseAddress: formData.focalPersonAddress,
                    coordinates: formData.focalPersonCoordinates,
                  },
                  alternativeFocalPerson: {
                    altName: formData.altFocalPersonName,
                    altContactNumber: formData.altFocalPersonContact,
                    altEmail: formData.altFocalPersonEmail,
                  },
                }
                onSave?.(infoData)
                // Clear session flags after successful save
                try {
                  sessionStorage.removeItem("cg_reopen_sheet")
                  sessionStorage.removeItem("cg_form_snapshot")
                  sessionStorage.removeItem("cg_pick_result")
                } catch {}
                resetForm()
                onOpenChange(false)
              }}
              className="flex-1 bg-[#4285f4] hover:bg-[#3367d6] text-white rounded-[5px]"
            >
              {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </div>

        {/* Close Confirmation Dialog */}
        <CloseCreateDialog
          open={showCloseConfirm}
          onOpenChange={setShowCloseConfirm}
          onCancel={() => setShowCloseConfirm(false)}
          onDiscard={() => {
            setShowCloseConfirm(false)
            try {
              sessionStorage.removeItem("cg_reopen_sheet")
              sessionStorage.removeItem("cg_form_snapshot")
              sessionStorage.removeItem("cg_pick_result")
            } catch {}
            resetForm()
            onOpenChange(false)
          }}
        />
      </SheetContent>
    </Sheet>
  )
}
