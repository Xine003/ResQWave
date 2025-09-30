import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Map, Plus, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useFormStore } from "../hooks/useFormStore"
import { useLocationPickerResults } from "../hooks/useLocationPickerResults"
import { useNotableInfoManagement } from "../hooks/useNotableInfoManagement"
import type { CommunityGroupDrawerProps } from "../types"
import { convertFormToInfoData, summarizeBoundary } from "../utils/formHelpers"
import { CloseCreateDialog } from "./CloseCreateDialog"
import { NumberInputWithSpinner } from "./NumberInputWithSpinner"
import { PhotoUploadArea } from "./PhotoUploadArea"

export function CommunityGroupDrawer({ open, onOpenChange, onSave, editData, isEditing }: CommunityGroupDrawerProps) {
  const navigate = useNavigate()
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  
  // Use global form store instead of local state
  const {
    formData,
    photoUrls,
    notableInfoInputs,
    isDirty,
    updateFormData,
    setFormData,
    setNotableInfoInputs,
    updateNotableInfoInputs,
    setIsDirty,
    setIsEditing,
    setEditData,
    resetForm,
    handleFileUpload,
  } = useFormStore()

  // Handle location picker results
  useLocationPickerResults()

  // Notable info management - use the store's updateNotableInfoInputs
  const {
    addNotableInfoInput,
    updateNotableInfoInput,
    removeNotableInfoInput,
    getFilteredNotableInfo,
  } = useNotableInfoManagement(notableInfoInputs, updateNotableInfoInputs, setIsDirty)

  const boundary = useMemo(() => summarizeBoundary(formData.boundaryGeoJSON), [formData.boundaryGeoJSON])

  const handleNumberChange = useCallback((field: string, value: string) => {
    const numValue = value === "" ? 0 : Number.parseInt(value) || 0
    updateFormData({ [field]: numValue })
  }, [updateFormData])

  // Pre-fill form when editing
  useEffect(() => {
    if (open && isEditing && editData) {
      console.log("📝 Pre-filling edit data")
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
      setIsEditing(true)
      setEditData(editData)
    } else if (open && !isEditing) {
      // Reset form for new creation if the form is not dirty
      if (!isDirty) {
        resetForm()
      }
    }
  }, [open, isEditing, editData, setFormData, setNotableInfoInputs, setIsDirty, setIsEditing, setEditData, resetForm, isDirty])

  const openAddressPicker = useCallback(() => {
    console.log("📍 Opening address picker, form data will persist...")
    navigate("/community-groups/setting-location")
  }, [navigate])

  const openCoordinatesDrawer = useCallback(() => {
    console.log("🗺️ Opening coordinates drawer, form data will persist...")
    navigate("/community-groups/setting-location")
  }, [navigate])

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

  const handleSave = () => {
    console.log("Saving community group:", formData, "Notable info:", notableInfoInputs)
    const infoData = convertFormToInfoData(formData, getFilteredNotableInfo())
    onSave?.(infoData)
    resetForm()
    onOpenChange(false)
  }

  const handleDiscard = () => {
    setShowCloseConfirm(false)
    resetForm()
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
              onValueChange={(value) => updateFormData({ assignedTerminal: value })}
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
              onChange={(e) => updateFormData({ communityGroupName: e.target.value })}
              className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            />
          </div>

          {/* Population Statistics - Grid Layout */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of Individuals</Label>
              <NumberInputWithSpinner
                value={formData.totalIndividuals}
                onChange={(v) => handleNumberChange("totalIndividuals", v)}
                ariaLabel="Total No. of Individuals"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of Families</Label>
              <NumberInputWithSpinner
                value={formData.totalFamilies}
                onChange={(v) => handleNumberChange("totalFamilies", v)}
                ariaLabel="Total No. of Families"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of Kids</Label>
              <NumberInputWithSpinner
                value={formData.totalKids}
                onChange={(v) => handleNumberChange("totalKids", v)}
                ariaLabel="Total No. of Kids"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of Senior Citizen</Label>
              <NumberInputWithSpinner
                value={formData.totalSeniorCitizen}
                onChange={(v) => handleNumberChange("totalSeniorCitizen", v)}
                ariaLabel="Total No. of Senior Citizen"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of Pregnant Women</Label>
              <NumberInputWithSpinner
                value={formData.totalPregnantWomen}
                onChange={(v) => handleNumberChange("totalPregnantWomen", v)}
                ariaLabel="Total No. of Pregnant Women"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of PWDs</Label>
              <NumberInputWithSpinner
                value={formData.totalPWDs}
                onChange={(v) => handleNumberChange("totalPWDs", v)}
                ariaLabel="Total No. of PWDs"
              />
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
                    className="text-gray-400 hover:text-white hover:bg-[#262626] p-1 h-8 w-8"
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
              onFileSelect={(file) => handleFileUpload("focalPersonPhoto", file)}
              photoUrlKey="focalPersonPhoto"
              photoUrls={photoUrls}
            />

            <div className="space-y-2">
              <Label className="text-white text-xs">Name</Label>
              <Input
                value={formData.focalPersonName}
                onChange={(e) => updateFormData({ focalPersonName: e.target.value })}
                className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white text-xs">Contact Number</Label>
                <Input
                  value={formData.focalPersonContact}
                  onChange={(e) => updateFormData({ focalPersonContact: e.target.value })}
                  className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white text-xs">Email</Label>
                <Input
                  type="email"
                  value={formData.focalPersonEmail}
                  onChange={(e) => updateFormData({ focalPersonEmail: e.target.value })}
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
                <Map className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Coordinates *</Label>
              <button
                type="button"
                onClick={openCoordinatesDrawer}
                className="w-full text-left bg-[#171717] cursor-pointer border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 border px-3 py-2 min-h-[40px]"
                title="Draw boundary on map"
              >
                {boundary || "Click to draw boundary on map"}
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
              onFileSelect={(file) => handleFileUpload("altFocalPersonPhoto", file)}
              photoUrlKey="altFocalPersonPhoto"
              photoUrls={photoUrls}
            />

            <div className="space-y-2">
              <Label className="text-white text-xs">Name</Label>
              <Input
                value={formData.altFocalPersonName}
                onChange={(e) => updateFormData({ altFocalPersonName: e.target.value })}
                className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white text-xs">Contact Number</Label>
                <Input
                  value={formData.altFocalPersonContact}
                  onChange={(e) => updateFormData({ altFocalPersonContact: e.target.value })}
                  className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white text-xs">Email</Label>
                <Input
                  type="email"
                  value={formData.altFocalPersonEmail}
                  onChange={(e) => updateFormData({ altFocalPersonEmail: e.target.value })}
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
              className="flex-1 bg-transparent border-[#2a2a2a] text-white hover:text-white hover:bg-[#262626] rounded-[5px]"
            >
              Discard
            </Button>
            <Button
              onClick={handleSave}
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
          onDiscard={handleDiscard}
        />
      </SheetContent>
    </Sheet>
  )
}