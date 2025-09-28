import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ChevronDown, ChevronUp, MapPin, Plus, RefreshCcw, Trash, Upload, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { CommunityGroupDrawerProps } from "../types"
import { CloseCreateDialog } from "./CloseCreateDialog"

export function CommunityGroupDrawer({ open, onOpenChange, onSave }: CommunityGroupDrawerProps) {
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

  const [notableInfoInputs, setNotableInfoInputs] = useState<string[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const navigate = useNavigate()

  // Persist current form state before navigating to the map so we can restore it afterwards
  const persistFormSnapshot = useCallback(() => {
    try {
      // Avoid serializing File objects; store them as null in the snapshot
      const { focalPersonPhoto: _fp, altFocalPersonPhoto: _afp, ...rest } = formData as any
      const safeForm = { ...rest, focalPersonPhoto: null, altFocalPersonPhoto: null }
      const snapshot = JSON.stringify({ formData: safeForm, notableInfoInputs })
      sessionStorage.setItem("cg_form_snapshot", snapshot)
      sessionStorage.setItem("cg_reopen_sheet", "1")
    } catch {}
  }, [formData, notableInfoInputs])

  const openAddressPicker = () => {
    persistFormSnapshot()
    navigate("/community-groups/setting-location")
  }
  const openCoordinatesDrawer = () => {
    persistFormSnapshot()
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
    setFormData(initialFormData)
    setNotableInfoInputs([])
    setIsDirty(false)
  }, [initialFormData])

  const handleNumberChange = useCallback((field: string, value: string) => {
    // Store the raw string value temporarily to allow multi-digit typing
    const numValue = value === "" ? 0 : Number.parseInt(value) || 0
    setFormData((prev) => ({ ...prev, [field]: numValue }))
    setIsDirty(true)
  }, [])

  const handleFileUpload = (field: "focalPersonPhoto" | "altFocalPersonPhoto", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
    setIsDirty(true)
  }

  // Restore form snapshot and consume map pick result after returning from SettingLocation
  useEffect(() => {
    const restoreAndConsume = () => {
      try {
        // Restore snapshot first (one-time)
        const snapRaw = sessionStorage.getItem("cg_form_snapshot")
        if (snapRaw) {
          const snap = JSON.parse(snapRaw)
          if (snap?.formData) setFormData((prev) => ({ ...prev, ...snap.formData }))
          if (Array.isArray(snap?.notableInfoInputs)) setNotableInfoInputs(snap.notableInfoInputs)
          setIsDirty(true)
          // Clear snapshot so it won't overwrite again unintentionally
          sessionStorage.removeItem("cg_form_snapshot")
        }

        // Then consume any pick result
        const raw = sessionStorage.getItem("cg_pick_result")
        if (raw) {
          sessionStorage.removeItem("cg_pick_result")
          const parsed = JSON.parse(raw)
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
        }
      } catch {
        // ignore malformed session data
      }
    }

    restoreAndConsume()
    window.addEventListener("focus", restoreAndConsume)
    return () => window.removeEventListener("focus", restoreAndConsume)
  }, [])

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
  }: {
    inputId: string
    photo: File | null
    onDelete: () => void
  }) => {
    // Memoize the photo URL to prevent re-creation on every render
    const photoUrl = useMemo(() => {
      return photo ? URL.createObjectURL(photo) : null
    }, [photo])

    // Clean up the object URL when component unmounts or photo changes
    useEffect(() => {
      return () => {
        if (photoUrl) {
          URL.revokeObjectURL(photoUrl)
        }
      }
    }, [photoUrl])

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
            <SheetTitle className="text-white text-lg font-medium">New Community Group</SheetTitle>
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
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
                    name: formData.altFocalPersonName,
                    contactNumber: formData.altFocalPersonContact,
                    email: formData.altFocalPersonEmail,
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
              Save
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
