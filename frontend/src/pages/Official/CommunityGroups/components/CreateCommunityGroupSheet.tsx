import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Map } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { createCommunityGroup, getAllTerminals, getAvailableTerminals, updateNeighborhood, type Terminal } from "../api/communityGroupApi"
import type { CommunityGroupDrawerProps } from "../types"
import type { CommunityFormData } from "../types/forms"
import { convertFormToInfoData } from "../utils/formHelpers"
import { CloseCreateDialog } from "./CloseCreateDialog"
import { MapboxLocationPickerModal } from "./MapboxLocationPickerModal"
import { PhotoUploadArea } from "./PhotoUploadArea"

// Validation utility functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhoneNumber = (phone: string): boolean => {
  // Remove any non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '')
  // Check if it's exactly 11 digits (for Philippines +63 format)
  return cleanPhone.length === 11
}

const formatPhoneNumber = (phone: string): string => {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '')
  // Limit to 11 digits
  return cleanPhone.slice(0, 11)
}

const sanitizeName = (name: string): string => {
  // Remove any numbers from the name, keep only letters, spaces, and common name characters
  return name.replace(/[0-9]/g, '')
}

// Create initial empty form data
const createEmptyFormData = (): CommunityFormData => ({
  assignedTerminal: "",
  communityGroupName: "",
  totalIndividuals: "",
  totalFamilies: "",
  totalKids: 0,
  totalSeniorCitizen: 0,
  totalPregnantWomen: 0,
  totalPWDs: 0,
  floodwaterDuration: "",
  floodHazards: [],
  notableInfo: "",
  focalPersonPhoto: null,
  focalPersonFirstName: "",
  focalPersonLastName: "",
  focalPersonName: "",
  focalPersonContact: "",
  focalPersonEmail: "",
  focalPersonAddress: "",
  focalPersonCoordinates: "",
  altFocalPersonPhoto: null,
  altFocalPersonFirstName: "",
  altFocalPersonLastName: "",
  altFocalPersonName: "",
  altFocalPersonContact: "",
  altFocalPersonEmail: "",
  boundaryGeoJSON: "",
})

export function CommunityGroupDrawer({ open, onOpenChange, onSave, editData, isEditing }: CommunityGroupDrawerProps) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [loadingTerminals, setLoadingTerminals] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  
  // Use ONLY local state - like Terminal modal (simple and no infinite loops)
  const [formData, setFormData] = useState<CommunityFormData>(createEmptyFormData())
  const [photoUrls, setPhotoUrls] = useState<{ focalPersonPhoto: string | null; altFocalPersonPhoto: string | null }>({ 
    focalPersonPhoto: null, 
    altFocalPersonPhoto: null 
  })
  const [isDirty, setIsDirty] = useState(false)
  
  // Simple update function - just like Terminal modal
  const updateFormData = useCallback((data: Partial<CommunityFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
    setIsDirty(true)
    
    // Clear field-specific errors when user makes changes to those fields
    const clearedErrors = { ...errors }
    Object.keys(data).forEach(fieldName => {
      if (clearedErrors[fieldName]) {
        delete clearedErrors[fieldName]
      }
    })
    
    // Clear general errors when user makes changes
    if (errors.general) {
      delete clearedErrors.general
    }
    
    setErrors(clearedErrors)
  }, [errors])
  
  // Simple photo upload handler
  const handleFileUpload = useCallback((field: "focalPersonPhoto" | "altFocalPersonPhoto", file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }))
    setIsDirty(true)
    
    // Clear field-specific errors when user makes changes to those fields
    const clearedErrors = { ...errors }
    if (clearedErrors[field]) {
      delete clearedErrors[field]
    }
    
    // Clear general errors when user makes changes
    if (errors.general) {
      delete clearedErrors.general
    }
    
    setErrors(clearedErrors)
    
    // Update photo URLs for display
    if (file) {
      const url = URL.createObjectURL(file)
      setPhotoUrls(prev => ({ ...prev, [field]: url }))
    } else {
      // Clean up existing URL
      setPhotoUrls(prev => {
        if (prev[field]) {
          URL.revokeObjectURL(prev[field]!)
        }
        return { ...prev, [field]: null }
      })
    }
  }, [errors])

  // Form validation
  const isFormValid = useMemo(() => {
    // Check required string fields
    const requiredStringFields = [
      formData.assignedTerminal,
      formData.focalPersonAddress,
      formData.floodwaterDuration,
      formData.focalPersonFirstName,
      formData.focalPersonLastName,
      formData.focalPersonContact,
      formData.focalPersonEmail,
      formData.altFocalPersonFirstName,
      formData.altFocalPersonLastName,
      formData.altFocalPersonContact,
      formData.altFocalPersonEmail,
    ]

    // Check required select fields
    const requiredSelectFields = [
      formData.totalFamilies,
      formData.totalIndividuals,
    ]

    const allStringFieldsFilled = requiredStringFields.every(field => field && typeof field === 'string' && field.trim() !== '')
    const allSelectFieldsFilled = requiredSelectFields.every(field => field !== null && field !== undefined && field !== '')
    
    const isMainFocalEmailValid = formData.focalPersonEmail ? validateEmail(formData.focalPersonEmail) : false
    const isMainFocalPhoneValid = formData.focalPersonContact ? validatePhoneNumber(formData.focalPersonContact) : false
    
    const isAltFocalEmailValid = formData.altFocalPersonEmail ? validateEmail(formData.altFocalPersonEmail) : false
    const isAltFocalPhoneValid = formData.altFocalPersonContact ? validatePhoneNumber(formData.altFocalPersonContact) : false

    return allStringFieldsFilled && allSelectFieldsFilled && isMainFocalEmailValid && isMainFocalPhoneValid && isAltFocalEmailValid && isAltFocalPhoneValid
  }, [formData])

  // Validate individual fields and update errors
  const validateField = useCallback((fieldName: string, value: string) => {
    const newErrors = { ...errors }

    switch (fieldName) {
      case 'focalPersonEmail':
      case 'altFocalPersonEmail':
        if (value && !validateEmail(value)) {
          newErrors[fieldName] = 'Please enter a valid email address'
        } else {
          delete newErrors[fieldName]
        }
        break
      case 'focalPersonContact':
      case 'altFocalPersonContact':
        if (value && !validatePhoneNumber(value)) {
          newErrors[fieldName] = 'Contact number must be exactly 11 digits'
        } else {
          delete newErrors[fieldName]
        }
        break
      default:
        break
    }

    setErrors(newErrors)
  }, [errors])

  // Fetch terminals when sheet opens
  useEffect(() => {
    if (open) {
      setLoadingTerminals(true)
      // When editing, fetch all terminals to include the currently assigned one
      // When creating, fetch only available terminals
      const fetchTerminals = isEditing ? getAllTerminals() : getAvailableTerminals()
      
      fetchTerminals
        .then((terminalList) => {
          // When editing, filter to show available terminals + the currently assigned terminal
          if (isEditing && editData?.terminalId) {
            const availableOrAssigned = terminalList.filter(
              t => t.availability === "Available" || t.id === editData.terminalId
            )
            setTerminals(availableOrAssigned)
          } else {
            setTerminals(terminalList)
          }
        })
        .catch((error) => {
          console.error('Failed to fetch terminals:', error)
          setErrors(prev => ({ ...prev, general: 'Failed to load terminals' }))
        })
        .finally(() => setLoadingTerminals(false))
    }
  }, [open, isEditing, editData?.terminalId])

  // Pre-fill form when editing - only run once when opening in edit mode
  useEffect(() => {
    if (!open) return
    
    if (isEditing && editData) {
      // Parse name into first and last name
      const focalPersonName = editData.focalPerson?.name || ""
      const nameParts = focalPersonName.split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""
      
      const altFocalPersonName = editData.alternativeFocalPerson?.altName || ""
      const altNameParts = altFocalPersonName.split(" ")
      const altFirstName = altNameParts[0] || ""
      const altLastName = altNameParts.slice(1).join(" ") || ""
      
      // Convert numeric values to range strings that match the select options
      const mapToIndividualsRange = (num: number): string => {
        if (num <= 10) return "5-10"
        if (num <= 15) return "10-15"
        return "15-20"
      }
      
      const mapToFamiliesRange = (num: number): string => {
        if (num <= 10) return "5-10"
        if (num <= 15) return "10-15"
        return "15-20"
      }
      
      const mapToFloodDuration = (hours: number): string => {
        if (hours < 1) return "< 1 hr"
        if (hours <= 3) return "1-3 hrs"
        if (hours <= 6) return "3-6 hrs"
        if (hours <= 12) return "6-12 hrs"
        return "> 12 hrs"
      }
      
      // Load photo URLs if available - fetch and convert to blob URLs
      const token = localStorage.getItem('resqwave_token')
      const fetchPhoto = async (url?: string) => {
        if (!url) return undefined
        try {
          if (!token) return url
          const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
          if (!resp.ok) return url
          const blob = await resp.blob()
          return URL.createObjectURL(blob)
        } catch {
          return url
        }
      }
      
      // Fetch photos and set them
      Promise.all([
        fetchPhoto(editData.focalPerson?.photo),
        fetchPhoto(editData.alternativeFocalPerson?.altPhoto)
      ]).then(([mainPhoto, altPhoto]) => {
        if (mainPhoto) {
          setPhotoUrls(prev => ({ ...prev, focalPersonPhoto: mainPhoto }))
        }
        if (altPhoto) {
          setPhotoUrls(prev => ({ ...prev, altFocalPersonPhoto: altPhoto }))
        }
      })
      
      const newFormData: CommunityFormData = {
        assignedTerminal: editData.terminalId || "",
        communityGroupName: editData.name || "",
        totalIndividuals: mapToIndividualsRange(editData.individuals || 0),
        totalFamilies: mapToFamiliesRange(editData.families || 0),
        totalKids: 0,
        totalSeniorCitizen: 0,
        totalPregnantWomen: 0,
        totalPWDs: 0,
        floodwaterDuration: mapToFloodDuration(editData.floodSubsideHours || 0),
        floodHazards: Array.isArray(editData.hazards) ? editData.hazards : [],
        notableInfo: Array.isArray(editData.notableInfo) ? editData.notableInfo.join(", ") : (editData.notableInfo || ""),
        focalPersonPhoto: null,
        focalPersonFirstName: firstName,
        focalPersonLastName: lastName,
        focalPersonName: focalPersonName,
        focalPersonContact: editData.focalPerson?.contactNumber || "",
        focalPersonEmail: editData.focalPerson?.email || "",
        focalPersonAddress: editData.focalPerson?.houseAddress || editData.address || "",
        focalPersonCoordinates: editData.focalPerson?.coordinates || editData.coordinates || "",
        altFocalPersonPhoto: null,
        altFocalPersonFirstName: altFirstName,
        altFocalPersonLastName: altLastName,
        altFocalPersonName: altFocalPersonName,
        altFocalPersonContact: editData.alternativeFocalPerson?.altContactNumber || "",
        altFocalPersonEmail: editData.alternativeFocalPerson?.altEmail || "",
        boundaryGeoJSON: "",
      }
      
      setFormData(newFormData)
      setIsDirty(false)
    } else if (!isEditing) {
      // Reset form for new creation
      setFormData(createEmptyFormData())
      setPhotoUrls({ focalPersonPhoto: null, altFocalPersonPhoto: null })
      setIsDirty(false)
      setErrors({})
    }
    // Only run when sheet opens or editData changes, NOT when isDirty changes
  }, [open, isEditing, editData])

  const openAddressPicker = useCallback(() => {
    setShowLocationPicker(true)
  }, [])

  // Handle location select from modal
  const handleLocationSelect = useCallback((address: string, coordinates: string) => {
    updateFormData({
      focalPersonAddress: address,
      focalPersonCoordinates: coordinates
    })
  }, [updateFormData])

  // Centralized handler when an attempt is made to close the sheet
  const requestClose = useCallback(() => {
    if (isDirty) {
      setShowCloseConfirm(true)
    } else {
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

  const handleSave = async () => {
    if (!isFormValid) {
      return
    }
    
    setIsSubmitting(true)
    setErrors({}) // Clear previous errors
    
    try {
      const groupName = `${formData.focalPersonFirstName} ${formData.focalPersonLastName}`.trim()
      
      // Prepare photos for upload
      const photos = {
        mainPhoto: formData.focalPersonPhoto || undefined,
        altPhoto: formData.altFocalPersonPhoto || undefined,
      }
      
      if (isEditing && editData) {
        // UPDATE existing neighborhood
        await updateNeighborhood(editData.communityId, formData, photos)
        
        // Convert to frontend format for local state update
        const infoData = convertFormToInfoData(formData, [formData.notableInfo].filter(Boolean))
        
        // Pass the updated data
        onSave?.(infoData, {
          groupName
        })
      } else {
        // CREATE new neighborhood
        const response = await createCommunityGroup(formData, photos)
        
        // Convert to frontend format for local state update
        const infoData = convertFormToInfoData(formData, [formData.notableInfo].filter(Boolean))
        
        // Update the infoData with backend response
        const updatedInfoData = {
          ...infoData,
          communityId: response.newFocalID, // Use focal person ID as community ID
          focalPerson: {
            ...infoData.focalPerson,
            id: response.newFocalID,
          },
          neighborhoodId: response.newNeighborhoodID,
        }
        
        // Pass the response data including generated password and name
        onSave?.(updatedInfoData, {
          generatedPassword: response.generatedPassword,
          groupName
        })
      }
      
      // Only reset form and close sheet on successful save
      setFormData(createEmptyFormData())
      setPhotoUrls({ focalPersonPhoto: null, altFocalPersonPhoto: null })
      setIsDirty(false)
      setErrors({})
      onOpenChange(false)
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} community group:`, error)
      
      // Parse specific backend validation errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      const newErrors: Record<string, string> = {}
      
      // Map backend error messages to specific form fields
      if (errorMessage.includes('Email already in use')) {
        newErrors.focalPersonEmail = 'This email address is already registered'
      } else if (errorMessage.includes('Contact number already in use')) {
        newErrors.focalPersonContact = 'This contact number is already registered'
      } else if (errorMessage.includes('Alt email already in use')) {
        newErrors.altFocalPersonEmail = 'This email address is already registered'
      } else if (errorMessage.includes('Alt contact number already in use')) {
        newErrors.altFocalPersonContact = 'This contact number is already registered'
      } else if (errorMessage.includes('Alt email must be different from email')) {
        newErrors.altFocalPersonEmail = 'Alternative email must be different from main email'
      } else if (errorMessage.includes('Alt contact must be different from contact number')) {
        newErrors.altFocalPersonContact = 'Alternative contact must be different from main contact'
      } else {
        // For other errors, show general error
        newErrors.general = errorMessage
      }
      
      setErrors(newErrors)
      
      // If there are field-specific errors, don't scroll to top
      // If it's a general error, scroll to top to show the header error
      if (newErrors.general) {
        const sheetContent = document.querySelector('[data-radix-scroll-area-viewport]')
        if (sheetContent) {
          sheetContent.scrollTop = 0
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => {
    setShowCloseConfirm(false)
    
    // Reset form
    setFormData(createEmptyFormData())
    setPhotoUrls({ focalPersonPhoto: null, altFocalPersonPhoto: null })
    setIsDirty(false)
    setErrors({})
    onOpenChange(false)
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
              {isEditing ? "Edit Neighborhood Group" : "New Neighborhood Group"}
            </SheetTitle>
          </div>
          
          {/* Error Display - Moved to header for better visibility */}
          {errors.general && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-[5px] p-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-red-400 text-sm font-medium">Error</p>
                  <p className="text-red-300 text-sm mt-1">{errors.general}</p>
                </div>
              </div>
            </div>
          )}
        </SheetHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Removed error display from here since it's now in header */}
          
          {/* Assigned Terminal */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Assigned Terminal</Label>
            <Select
              value={formData.assignedTerminal}
              onValueChange={(value) => updateFormData({ assignedTerminal: value })}
              disabled={loadingTerminals || terminals.length === 0}
            >
              <SelectTrigger className="w-full bg-[#171717] border-[#404040] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder={
                  loadingTerminals 
                    ? "Loading terminals..." 
                    : terminals.length === 0 
                      ? "No available terminals"
                      : "Select a Terminal"
                } />
              </SelectTrigger>
              <SelectContent className="bg-[#171717] border-[#2a2a2a] text-white">
                {loadingTerminals ? (
                  <div className="px-3 py-2 text-gray-400 text-sm">
                    Loading terminals...
                  </div>
                ) : terminals.length === 0 ? (
                  <div className="px-3 py-2 text-gray-400 text-sm">
                    No available terminals
                  </div>
                ) : (
                  terminals.map((terminal) => (
                    <SelectItem 
                      key={terminal.id} 
                      value={terminal.id} 
                      className="text-white hover:bg-gray-700"
                    >
                      {terminal.name} ({terminal.id}) - {terminal.status}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {!loadingTerminals && (
              <p className="text-xs text-gray-400 mt-1">
                {terminals.length === 0 
                  ? "All terminals are currently occupied. Please try again later."
                  : `${terminals.length} available terminal(s) for assignment`
                }
              </p>
            )}
          </div>

          {/* Terminal Address */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Terminal Address</Label>
            <div className="relative">
              <button
                type="button"
                onClick={openAddressPicker}
                className={`w-full text-left cursor-pointer bg-[#171717] border-[#404040] pr-10 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 border px-3 py-2 min-h-[40px] ${
                  formData.focalPersonAddress 
                    ? "text-white" 
                    : "text-gray-400 italic"
                }`}
                title="Pick address on map"
              >
                {formData.focalPersonAddress || ""}
              </button>
              <Map className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Coordinates */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Coordinates</Label>
            <Input
              value={formData.focalPersonCoordinates}
              readOnly
              className="bg-[#171717] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Neighborhood Information Section */}
          <div className="bg-white text-black px-4 py-2 rounded font-medium text-sm">
            Neighborhood Information
          </div>

          {/* No. of Households */}
          <div className="space-y-2">
            <Label className="text-white text-sm">No. of Households</Label>
            <Select
              value={formData.totalFamilies?.toString() || ""}
              onValueChange={(value) => updateFormData({ totalFamilies: value })}
            >
              <SelectTrigger className="w-full bg-[#171717] border-[#404040] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent className="bg-[#171717] border-[#2a2a2a] text-white">
                <SelectItem value="5-10" className="text-white hover:bg-gray-700">
                  5-10
                </SelectItem>
                <SelectItem value="10-15" className="text-white hover:bg-gray-700">
                  10-15
                </SelectItem>
                <SelectItem value="15-20" className="text-white hover:bg-gray-700">
                  15-20
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* No. of Residents */}
          <div className="space-y-2">
            <Label className="text-white text-sm">No. of Residents</Label>
            <Select
              value={formData.totalIndividuals?.toString() || ""}
              onValueChange={(value) => updateFormData({ totalIndividuals: value })}
            >
              <SelectTrigger className="w-full bg-[#171717] border-[#404040] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent className="bg-[#171717] border-[#2a2a2a] text-white">
                <SelectItem value="5-10" className="text-white hover:bg-gray-700">
                  5-10
                </SelectItem>
                <SelectItem value="10-15" className="text-white hover:bg-gray-700">
                  10-15
                </SelectItem>
                <SelectItem value="15-20" className="text-white hover:bg-gray-700">
                  15-20
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Floodwater Subsidence Duration */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Floodwater Subsidence Duration</Label>
            <Select
              value={formData.floodwaterDuration || ""}
              onValueChange={(value) => updateFormData({ floodwaterDuration: value })}
            >
              <SelectTrigger className="w-full bg-[#171717] border-[#404040] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-[#171717] border-[#2a2a2a] text-white">
                <SelectItem value="< 1 hr" className="text-white hover:bg-gray-700">
                  &lt; 1 hr
                </SelectItem>
                <SelectItem value="1-3 hrs" className="text-white hover:bg-gray-700">
                  1-3 hrs
                </SelectItem>
                <SelectItem value="3-6 hrs" className="text-white hover:bg-gray-700">
                  3-6 hrs
                </SelectItem>
                <SelectItem value="6-12 hrs" className="text-white hover:bg-gray-700">
                  6-12 hrs
                </SelectItem>
                <SelectItem value="> 12 hrs" className="text-white hover:bg-gray-700">
                  &gt; 12 hrs
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Flood-related Hazards */}
          <div className="space-y-3">
            <Label className="text-white text-sm">Flood-related Hazards</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="strong-water-current"
                  checked={formData.floodHazards?.includes("strong-water-current") || false}
                  onCheckedChange={(checked) => {
                    const hazards = formData.floodHazards || []
                    if (checked) {
                      updateFormData({ floodHazards: [...hazards, "strong-water-current"] })
                    } else {
                      updateFormData({ floodHazards: hazards.filter(h => h !== "strong-water-current") })
                    }
                  }}
                  className="bg-[#262626] border-none data-[state=checked]:bg-[#4285f4] data-[state=checked]:border-[#4285f4]"
                />
                <label htmlFor="strong-water-current" className="text-white text-sm">
                  Strong water current (Malakas na agos ng tubig)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="risk-landslide"
                  checked={formData.floodHazards?.includes("risk-landslide") || false}
                  onCheckedChange={(checked) => {
                    const hazards = formData.floodHazards || []
                    if (checked) {
                      updateFormData({ floodHazards: [...hazards, "risk-landslide"] })
                    } else {
                      updateFormData({ floodHazards: hazards.filter(h => h !== "risk-landslide") })
                    }
                  }}
                  className="bg-[#262626] border-none data-[state=checked]:bg-[#4285f4] data-[state=checked]:border-[#4285f4]"
                />
                <label htmlFor="risk-landslide" className="text-white text-sm">
                  Risk of landslide or erosion (Panganib na pagguho ng lupa)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="drainage-overflow"
                  checked={formData.floodHazards?.includes("drainage-overflow") || false}
                  onCheckedChange={(checked) => {
                    const hazards = formData.floodHazards || []
                    if (checked) {
                      updateFormData({ floodHazards: [...hazards, "drainage-overflow"] })
                    } else {
                      updateFormData({ floodHazards: hazards.filter(h => h !== "drainage-overflow") })
                    }
                  }}
                  className="bg-[#262626] border-none data-[state=checked]:bg-[#4285f4] data-[state=checked]:border-[#4285f4]"
                />
                <label htmlFor="drainage-overflow" className="text-white text-sm">
                  Drainage overflow / canal blockage (Bágradóng kanal o daluyang ng tubig)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="roads-impassable"
                  checked={formData.floodHazards?.includes("roads-impassable") || false}
                  onCheckedChange={(checked) => {
                    const hazards = formData.floodHazards || []
                    if (checked) {
                      updateFormData({ floodHazards: [...hazards, "roads-impassable"] })
                    } else {
                      updateFormData({ floodHazards: hazards.filter(h => h !== "roads-impassable") })
                    }
                  }}
                  className="bg-[#262626] border-none data-[state=checked]:bg-[#4285f4] data-[state=checked]:border-[#4285f4]"
                />
                <label htmlFor="roads-impassable" className="text-white text-sm">
                  Roads become impassable (Hindi madsaanan ang mga kalsada)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="electrical-wires"
                  checked={formData.floodHazards?.includes("electrical-wires") || false}
                  onCheckedChange={(checked) => {
                    const hazards = formData.floodHazards || []
                    if (checked) {
                      updateFormData({ floodHazards: [...hazards, "electrical-wires"] })
                    } else {
                      updateFormData({ floodHazards: hazards.filter(h => h !== "electrical-wires") })
                    }
                  }}
                  className="bg-[#262626] border-none data-[state=checked]:bg-[#4285f4] data-[state=checked]:border-[#4285f4]"
                />
                <label htmlFor="electrical-wires" className="text-white text-sm">
                  Electrical wires or exposed cables (Mga live o nakalantad na kable ng kuryente)
                </label>
              </div>
            </div>
          </div>

          {/* Notable Information */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Notable Information</Label>
            <Input
              value={formData.notableInfo || ""}
              onChange={(e) => updateFormData({ notableInfo: e.target.value })}
              className="bg-[#171717] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            />
          </div>

          {/* Main Focal Person Section */}
          <div className="bg-white text-black px-4 py-2 rounded font-medium text-sm">
            Main Focal Person
          </div>

          <PhotoUploadArea
            inputId="focal-photo-upload"
            photo={formData.focalPersonPhoto}
            onDelete={() => handleFileUpload("focalPersonPhoto", null)}
            onFileSelect={(file) => handleFileUpload("focalPersonPhoto", file)}
            photoUrlKey="focalPersonPhoto"
            photoUrls={photoUrls}
          />

          {/* First Name and Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white text-sm">First Name</Label>
              <Input
                value={formData.focalPersonFirstName || ""}
                onChange={(e) => {
                  const sanitized = sanitizeName(e.target.value)
                  updateFormData({ focalPersonFirstName: sanitized })
                }}
                className="bg-[#171717] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white text-sm">Last Name</Label>
              <Input
                value={formData.focalPersonLastName || ""}
                onChange={(e) => {
                  const sanitized = sanitizeName(e.target.value)
                  updateFormData({ focalPersonLastName: sanitized })
                }}
                className="bg-[#171717] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">Contact Number</Label>
            <Input
              value={formData.focalPersonContact}
              onChange={(e) => {
                const formattedPhone = formatPhoneNumber(e.target.value)
                updateFormData({ focalPersonContact: formattedPhone })
                validateField('focalPersonContact', formattedPhone)
              }}
              className={`bg-[#171717] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 ${
                errors.focalPersonContact ? 'border-red-500' : ''
              }`}
              maxLength={11}
            />
            {errors.focalPersonContact && (
              <p className="text-red-400 text-xs mt-1">{errors.focalPersonContact}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">Email</Label>
            <Input
              type="email"
              value={formData.focalPersonEmail}
              onChange={(e) => {
                updateFormData({ focalPersonEmail: e.target.value })
                validateField('focalPersonEmail', e.target.value)
              }}
              className={`bg-[#171717] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 ${
                errors.focalPersonEmail ? 'border-red-500' : ''
              }`}
            />
            {errors.focalPersonEmail && (
              <p className="text-red-400 text-xs mt-1">{errors.focalPersonEmail}</p>
            )}
          </div>

          {/* Alternative Focal Person Section */}
          <div className="bg-white text-black px-4 py-2 rounded font-medium text-sm">
            Alternative Focal Person
          </div>

          <PhotoUploadArea
            inputId="alt-focal-photo-upload"
            photo={formData.altFocalPersonPhoto}
            onDelete={() => handleFileUpload("altFocalPersonPhoto", null)}
            onFileSelect={(file) => handleFileUpload("altFocalPersonPhoto", file)}
            photoUrlKey="altFocalPersonPhoto"
            photoUrls={photoUrls}
          />

          {/* Alt First Name and Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white text-sm">First Name</Label>
              <Input
                value={formData.altFocalPersonFirstName || ""}
                onChange={(e) => {
                  const sanitized = sanitizeName(e.target.value)
                  updateFormData({ altFocalPersonFirstName: sanitized })
                }}
                className="bg-[#171717] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white text-sm">Last Name</Label>
              <Input
                value={formData.altFocalPersonLastName || ""}
                onChange={(e) => {
                  const sanitized = sanitizeName(e.target.value)
                  updateFormData({ altFocalPersonLastName: sanitized })
                }}
                className="bg-[#171717] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">Contact Number</Label>
            <Input
              value={formData.altFocalPersonContact}
              onChange={(e) => {
                const formattedPhone = formatPhoneNumber(e.target.value)
                updateFormData({ altFocalPersonContact: formattedPhone })
                validateField('altFocalPersonContact', formattedPhone)
              }}
              className={`bg-[#171717] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 ${
                errors.altFocalPersonContact ? 'border-red-500' : ''
              }`}
              maxLength={11}
            />
            {errors.altFocalPersonContact && (
              <p className="text-red-400 text-xs mt-1">{errors.altFocalPersonContact}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">Email</Label>
            <Input
              type="email"
              value={formData.altFocalPersonEmail}
              onChange={(e) => {
                updateFormData({ altFocalPersonEmail: e.target.value })
                validateField('altFocalPersonEmail', e.target.value)
              }}
              className={`bg-[#171717] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 ${
                errors.altFocalPersonEmail ? 'border-red-500' : ''
              }`}
            />
            {errors.altFocalPersonEmail && (
              <p className="text-red-400 text-xs mt-1">{errors.altFocalPersonEmail}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-[#171717] border-t border-[#2a2a2a] px-6 py-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={requestClose}
              className="flex-1 bg-transparent border-[#2a2a2a] text-white hover:text-white hover:bg-[#262626] rounded-[5px]"
            >
              Discard
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isFormValid || isSubmitting}
              className={`flex-1 rounded-[5px] transition-colors ${
                isFormValid && !isSubmitting
                  ? "bg-[#4285f4] hover:bg-[#3367d6] text-white cursor-pointer" 
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Saving..." : (isEditing ? "Update" : "Save Community Group")}
            </Button>
          </div>
        </div>

        {/* Close Confirmation Dialog */}
        <CloseCreateDialog
          open={showCloseConfirm}
          onOpenChange={setShowCloseConfirm}
          onCancel={() => setShowCloseConfirm(false)}
          onDiscard={handleDiscard}
        />

        {/* Location Picker Modal */}
        <MapboxLocationPickerModal
          open={showLocationPicker}
          onOpenChange={setShowLocationPicker}
          onLocationSelect={handleLocationSelect}
          initialCoordinates={formData.focalPersonCoordinates}
        />
      </SheetContent>
    </Sheet>
  )
}