import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { MapPin, Plus, RefreshCcw, Trash, Upload, X } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { CloseCreateDialog } from "./closeCreateDialog"

interface CommunityGroupDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (infoData: {
    name: string
    terminalId: string
    communityId: string
    individuals: number
    families: number
    kids: number
    seniors: number
    pwds: number
    pregnantWomen: number
    notableInfo: string[]
    focalPerson: {
      name: string
      photo?: string
      contactNumber: string
      email: string
      houseAddress: string
      coordinates: string
    }
    alternativeFocalPerson: {
      name: string
      contactNumber: string
      email: string
    }
  }) => void
}

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
    }),
    []
  )

  const [formData, setFormData] = useState(initialFormData)

  const [notableInfoInputs, setNotableInfoInputs] = useState<string[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setNotableInfoInputs([])
    setIsDirty(false)
  }, [initialFormData])

  const handleNumberChange = (field: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    setFormData((prev) => ({ ...prev, [field]: numValue }))
    setIsDirty(true)
  }

  const handleFileUpload = (field: "focalPersonPhoto" | "altFocalPersonPhoto", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
    setIsDirty(true)
  }

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

  const PhotoUploadArea = ({
    photo,
    onUpload,
    onDelete,
  }: {
    photo: File | null
    onUpload: (file: File) => void
    onDelete: () => void
  }) => (
    <div className="bg-[#262626] hover:bg-[#302F2F] rounded-[5px] p-8 text-center relative">
      {photo ? (
        <div className="space-y-4">
          <img
            src={URL.createObjectURL(photo) || "/placeholder.svg"}
            alt="Uploaded"
            className="w-20 h-20 rounded-full mx-auto object-cover"
          />
          <div className="absolute bottom-3 right-3 flex gap-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => document.getElementById("photo-upload")?.click()}
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
      ) : (
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto bg-blue-600/25 rounded-lg flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
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
      )}
      <input
        id="photo-upload"
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Upload photo"
        title="Upload photo"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
        }}
      />
    </div>
  )

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
                <Input
                  type="number"
                  value={formData.totalIndividuals}
                  onChange={(e) => handleNumberChange("totalIndividuals", e.target.value)}
                  className="bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:hover:bg-[#171717] [&::-webkit-outer-spin-button]:hover:bg-[#171717]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of Families</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.totalFamilies}
                  onChange={(e) => handleNumberChange("totalFamilies", e.target.value)}
                  className="bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:hover:bg-[#171717] [&::-webkit-outer-spin-button]:hover:bg-[#171717]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of Kids</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.totalKids}
                  onChange={(e) => handleNumberChange("totalKids", e.target.value)}
                  className="bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:hover:bg-[#171717] [&::-webkit-outer-spin-button]:hover:bg-[#171717]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of Senior Citizen</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.totalSeniorCitizen}
                  onChange={(e) => handleNumberChange("totalSeniorCitizen", e.target.value)}
                  className="bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:hover:bg-[#171717] [&::-webkit-outer-spin-button]:hover:bg-[#171717]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of Pregnant Women</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.totalPregnantWomen}
                  onChange={(e) => handleNumberChange("totalPregnantWomen", e.target.value)}
                  className="bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:hover:bg-[#171717] [&::-webkit-outer-spin-button]:hover:bg-[#171717]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Total No. of PWDs</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.totalPWDs}
                  onChange={(e) => handleNumberChange("totalPWDs", e.target.value)}
                  className="bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:hover:bg-[#171717] [&::-webkit-outer-spin-button]:hover:bg-[#171717]"
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

            <div className="cursor-pointer" onClick={() => document.getElementById("focal-photo-upload")?.click()}>
              <PhotoUploadArea
                photo={formData.focalPersonPhoto}
                onUpload={(file) => handleFileUpload("focalPersonPhoto", file)}
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
                  if (file) handleFileUpload("focalPersonPhoto", file)
                }}
              />
            </div>

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
                <Input
                  value={formData.focalPersonAddress}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, focalPersonAddress: e.target.value }))
                    setIsDirty(true)
                  }}
                  className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 pr-10 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-xs">Coordinates *</Label>
              <Input
                value={formData.focalPersonCoordinates}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, focalPersonCoordinates: e.target.value }))
                  setIsDirty(true)
                }}
                className="bg-[#171717] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>
          </div>

          {/* Alternative Focal Person's Information */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-medium">Alternative Focal Person's Information</h3>

            <div className="cursor-pointer" onClick={() => document.getElementById("alt-focal-photo-upload")?.click()}>
              <PhotoUploadArea
                photo={formData.altFocalPersonPhoto}
                onUpload={(file) => handleFileUpload("altFocalPersonPhoto", file)}
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
                  if (file) handleFileUpload("altFocalPersonPhoto", file)
                }}
              />
            </div>

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
            resetForm()
            onOpenChange(false)
          }}
        />
      </SheetContent>
    </Sheet>
  )
}
