import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Map } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useFormStore } from "../hooks/useFormStore"
import { useLocationPickerResults } from "../hooks/useLocationPickerResults"
import type { CommunityGroupDrawerProps } from "../types"
import { convertFormToInfoData } from "../utils/formHelpers"
import { CloseCreateDialog } from "./CloseCreateDialog"
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
    setIsDirty,
    setIsEditing,
    setEditData,
    resetForm,
    handleFileUpload,
  } = useFormStore()

  // Handle location picker results
  useLocationPickerResults()

  // Pre-fill form when editing
  useEffect(() => {
    if (open && isEditing && editData) {
      console.log("📝 Pre-filling edit data")
      setFormData({
        assignedTerminal: editData.terminalId || "",
        communityGroupName: editData.name || "",
        totalIndividuals: editData.individuals || "",
        totalFamilies: editData.families || "",
        totalKids: editData.kids || 0,
        totalSeniorCitizen: editData.seniors || 0,
        totalPregnantWomen: editData.pregnantWomen || 0,
        totalPWDs: editData.pwds || 0,
        floodwaterDuration: "",
        floodHazards: [],
        notableInfo: "",
        focalPersonPhoto: null,
        focalPersonFirstName: "",
        focalPersonLastName: "",
        focalPersonName: editData.focalPerson?.name || "",
        focalPersonContact: editData.focalPerson?.contactNumber || "",
        focalPersonEmail: editData.focalPerson?.email || "",
        focalPersonAddress: editData.focalPerson?.houseAddress || editData.address || "",
        focalPersonCoordinates: editData.focalPerson?.coordinates || "",
        altFocalPersonPhoto: null,
        altFocalPersonFirstName: "",
        altFocalPersonLastName: "",
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
    const infoData = convertFormToInfoData(formData, [formData.notableInfo].filter(Boolean))
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
              {isEditing ? "Edit Neighborhood Group" : "New Neighborhood Group"}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Assigned Terminal */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Assigned Terminal</Label>
            <Select
              value={formData.assignedTerminal}
              onValueChange={(value) => updateFormData({ assignedTerminal: value })}
            >
              <SelectTrigger className="w-full bg-[#262626] border-[#404040] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600">
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

          {/* Terminal Address */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Terminal Address</Label>
            <div className="relative">
              <button
                type="button"
                onClick={openAddressPicker}
                className="w-full text-left cursor-pointer bg-[#262626] border-[#404040] text-white placeholder:text-gray-400 pr-10 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 border px-3 py-2 min-h-[40px]"
                title="Pick address on map"
              >
                {formData.focalPersonAddress || "Click to select address on map"}
              </button>
              <Map className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Coordinates */}
          <div className="space-y-2">
            <Label className="text-white text-sm">Coordinates</Label>
            <Input
              value={formData.focalPersonCoordinates}
              onChange={(e) => updateFormData({ focalPersonCoordinates: e.target.value })}
              className="bg-[#262626] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              placeholder="Enter coordinates"
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
              <SelectTrigger className="w-full bg-[#262626] border-[#404040] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600">
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
              <SelectTrigger className="w-full bg-[#262626] border-[#404040] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600">
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
              <SelectTrigger className="w-full bg-[#262626] border-[#404040] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600">
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
                  className="border-white data-[state=checked]:bg-[#4285f4] data-[state=checked]:border-[#4285f4]"
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
                  className="border-white data-[state=checked]:bg-[#4285f4] data-[state=checked]:border-[#4285f4]"
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
                  className="border-white data-[state=checked]:bg-[#4285f4] data-[state=checked]:border-[#4285f4]"
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
                  className="border-white data-[state=checked]:bg-[#4285f4] data-[state=checked]:border-[#4285f4]"
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
                  className="border-white data-[state=checked]:bg-[#4285f4] data-[state=checked]:border-[#4285f4]"
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
              className="bg-[#262626] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              placeholder="3 roads (St. Jhude, St. Perez, St. Lilia) are always blocked"
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
                onChange={(e) => updateFormData({ focalPersonFirstName: e.target.value })}
                className="bg-[#262626] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white text-sm">Last Name</Label>
              <Input
                value={formData.focalPersonLastName || ""}
                onChange={(e) => updateFormData({ focalPersonLastName: e.target.value })}
                className="bg-[#262626] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">Contact Number</Label>
            <Input
              value={formData.focalPersonContact}
              onChange={(e) => updateFormData({ focalPersonContact: e.target.value })}
              className="bg-[#262626] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">Email</Label>
            <Input
              type="email"
              value={formData.focalPersonEmail}
              onChange={(e) => updateFormData({ focalPersonEmail: e.target.value })}
              className="bg-[#262626] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            />
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
                onChange={(e) => updateFormData({ altFocalPersonFirstName: e.target.value })}
                className="bg-[#262626] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white text-sm">Last Name</Label>
              <Input
                value={formData.altFocalPersonLastName || ""}
                onChange={(e) => updateFormData({ altFocalPersonLastName: e.target.value })}
                className="bg-[#262626] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">Contact Number</Label>
            <Input
              value={formData.altFocalPersonContact}
              onChange={(e) => updateFormData({ altFocalPersonContact: e.target.value })}
              className="bg-[#262626] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">Email</Label>
            <Input
              type="email"
              value={formData.altFocalPersonEmail}
              onChange={(e) => updateFormData({ altFocalPersonEmail: e.target.value })}
              className="bg-[#262626] border-[#404040] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            />
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