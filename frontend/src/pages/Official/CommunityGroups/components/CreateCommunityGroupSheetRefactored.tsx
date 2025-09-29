import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { MapPin } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useFormPersistence } from "../hooks/useFormPersistence"
import { NotableInfoInputs } from "./NotableInfoInputs"
import { NumberInputWithSpinner } from "./NumberInputWithSpinner"
import { PhotoUploadArea } from "./PhotoUploadAreaNew"

interface CommunityGroupDrawerProps {
  isOpen: boolean
  onClose: () => void
  isEditing?: boolean
  editData?: any
  onEdit?: (data: any) => void
}

interface CommunityGroupData {
  groupName: string
  contactPerson: string
  phoneNumber: string
  emergencyPhoneNumber: string
  address: string
  boundary: string
  totalMembers: number
  notableInfoList: string[]
  selectedPhotos: File[]
  savedBoundaryFromMap?: string | null
  savedAddressFromMap?: string | null
}

export function CreateCommunityGroupSheet({
  isOpen,
  onClose,
  isEditing = false,
  editData = null
}: CommunityGroupDrawerProps) {
  console.log("🏗️ CreateCommunityGroupSheet render:", { isOpen, isEditing, hasEditData: !!editData })

  const initialData: CommunityGroupData = {
    groupName: "",
    contactPerson: "",
    phoneNumber: "",
    emergencyPhoneNumber: "",
    address: "",
    boundary: "",
    totalMembers: 0,
    notableInfoList: [""],
    selectedPhotos: [],
    savedBoundaryFromMap: null,
    savedAddressFromMap: null
  }

  const {
    saveToSession,
    clearSession,
    navigateToLocationSetting,
    getInitialFormData
  } = useFormPersistence({
    sessionKey: "resqwave_community_form",
    isEditing,
    editData,
    initialData
  })

  const [formData, setFormData] = useState<CommunityGroupData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasInitializedRef = useRef(false)

  // Initialize form data on mount or when edit data changes
  useEffect(() => {
    if (!isOpen) return

    const initializeForm = async () => {
      if (hasInitializedRef.current && !isEditing) return
      
      console.log("🎯 Initializing form data")
      const initialFormData = await getInitialFormData()
      setFormData(initialFormData)
      hasInitializedRef.current = true
      
      console.log("✅ Form initialized with data:", {
        groupName: initialFormData.groupName,
        hasPhotos: initialFormData.selectedPhotos.length > 0,
        isEditing
      })
    }

    initializeForm()
  }, [isOpen, isEditing, editData, getInitialFormData])

  // Auto-save form data to session storage
  useEffect(() => {
    if (!isOpen || !hasInitializedRef.current) return
    
    const timeoutId = setTimeout(() => {
      saveToSession(formData)
    }, 500) // Debounce saves

    return () => clearTimeout(timeoutId)
  }, [formData, isOpen, saveToSession])

  // Update form field
  const updateField = useCallback((field: keyof CommunityGroupData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      console.log("🚀 Submitting community group form:", formData)
      
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      clearSession()
      onClose()
      
      console.log("✅ Community group submitted successfully")
    } catch (error) {
      console.error("❌ Error submitting community group:", error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isSubmitting, clearSession, onClose])

  // Handle close with confirmation if needed
  const handleClose = useCallback(() => {
    const hasChanges = Object.keys(formData).some(key => {
      const field = key as keyof CommunityGroupData
      if (field === 'selectedPhotos') {
        return formData[field].length > 0
      }
      if (field === 'notableInfoList') {
        return formData[field].some(info => info.trim() !== "")
      }
      return formData[field] !== initialData[field]
    })

    if (hasChanges) {
      // TODO: Show confirmation dialog
      console.log("⚠️ User has unsaved changes")
    }
    
    clearSession()
    onClose()
  }, [formData, initialData, clearSession, onClose])

  // Handle location setting navigation
  const handleSetLocation = useCallback(async () => {
    await navigateToLocationSetting(formData)
  }, [formData, navigateToLocationSetting])

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[600px] max-w-[90vw] bg-[#0a0a0a] border-[#2a2a2a] text-white overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-xl font-semibold text-white">
            {isEditing ? "Edit Community Group" : "Create Community Group"}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {isEditing 
              ? "Update the community group information below" 
              : "Fill out the information to create a new community group"
            }
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupName" className="text-sm font-medium text-white mb-2 block">
                Community Group Name *
              </Label>
              <Input
                id="groupName"
                type="text"
                value={formData.groupName}
                onChange={(e) => updateField('groupName', e.target.value)}
                placeholder="Enter community group name"
                className="bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                required
              />
            </div>

            <div>
              <Label htmlFor="contactPerson" className="text-sm font-medium text-white mb-2 block">
                Contact Person *
              </Label>
              <Input
                id="contactPerson"
                type="text"
                value={formData.contactPerson}
                onChange={(e) => updateField('contactPerson', e.target.value)}
                placeholder="Enter contact person name"
                className="bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                required
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-white mb-2 block">
                Phone Number *
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => updateField('phoneNumber', e.target.value)}
                placeholder="Enter phone number"
                className="bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                required
              />
            </div>

            <div>
              <Label htmlFor="emergencyPhoneNumber" className="text-sm font-medium text-white mb-2 block">
                Emergency Phone Number
              </Label>
              <Input
                id="emergencyPhoneNumber"
                type="tel"
                value={formData.emergencyPhoneNumber}
                onChange={(e) => updateField('emergencyPhoneNumber', e.target.value)}
                placeholder="Enter emergency phone number"
                className="bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="address" className="text-sm font-medium text-white mb-2 block">
                Address
              </Label>
              <div className="flex gap-2">
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Enter address or set from map"
                  className="bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSetLocation}
                  className="bg-transparent border-[#2a2a2a] text-white hover:bg-[#2a2a2a] hover:text-white px-3"
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="boundary" className="text-sm font-medium text-white mb-2 block">
                Boundary Description
              </Label>
              <div className="flex gap-2">
                <Input
                  id="boundary"
                  type="text"
                  value={formData.boundary}
                  onChange={(e) => updateField('boundary', e.target.value)}
                  placeholder="Enter boundary description or set from map"
                  className="bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSetLocation}
                  className="bg-transparent border-[#2a2a2a] text-white hover:bg-[#2a2a2a] hover:text-white px-3"
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Members Count */}
          <div>
            <Label htmlFor="totalMembers" className="text-sm font-medium text-white mb-2 block">
              Total Members
            </Label>
            <NumberInputWithSpinner
              value={formData.totalMembers}
              onChange={(value) => updateField('totalMembers', parseInt(value) || 0)}
              min={0}
              ariaLabel="Total members"
            />
          </div>

          {/* Photos */}
          <div>
            <Label className="text-sm font-medium text-white mb-2 block">
              Community Photos
            </Label>
            <PhotoUploadArea
              photos={formData.selectedPhotos}
              onChange={(photos: File[]) => updateField('selectedPhotos', photos)}
              maxPhotos={5}
            />
          </div>

          {/* Notable Information */}
          <div>
            <Label className="text-sm font-medium text-white mb-2 block">
              Notable Information
            </Label>
            <NotableInfoInputs
              notableInfoList={formData.notableInfoList}
              onChange={(list) => updateField('notableInfoList', list)}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[#2a2a2a]">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-transparent border-[#2a2a2a] text-white hover:bg-[#2a2a2a] hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !formData.groupName || !formData.contactPerson || !formData.phoneNumber}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? "Saving..." 
                : isEditing 
                  ? "Update Community Group" 
                  : "Create Community Group"
              }
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}