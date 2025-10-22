import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCallback, useEffect, useState } from "react"
import type { TerminalDrawerProps, TerminalFormData } from "../types"

interface FormData {
  name: string
}

interface FormErrors {
  name?: string
}

export function CreateTerminalSheet({ 
  open, 
  onOpenChange, 
  onSave, 
  editData 
}: TerminalDrawerProps) {
  const isEditing = !!editData
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
  })
  
  const [errors, setErrors] = useState<FormErrors>({})

  // Generate next terminal ID
  const getNextTerminalId = (): string => {
    // In a real app, this would come from the backend
    const nextNumber = String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')
    return `RSQW-${nextNumber}`
  }

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return "Terminal name is required"
    if (name.trim().length < 2) return "Terminal name must be at least 2 characters long"
    return undefined
  }

  // Check if form is valid
  const isFormValid = (): boolean => {
    const hasValidName = !validateName(formData.name)
    return hasValidName
  }

  // Reset form when opening/closing or when edit data changes
  useEffect(() => {
    if (open && isEditing && editData) {
      setFormData({
        name: editData.name,
      })
      setErrors({})
    } else if (open && !isEditing) {
      // Reset for new terminal
      setFormData({
        name: "",
      })
      setErrors({})
    }
  }, [open, isEditing, editData])

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
    
    // Real-time validation
    if (field === 'name') {
      const error = validateName(value)
      setErrors(prev => ({ ...prev, name: error }))
    }
  }, [errors])

  const handleSave = useCallback(() => {
    // Validate all fields
    const nameError = validateName(formData.name)
    
    const newErrors: FormErrors = {
      name: nameError,
    }

    setErrors(newErrors)

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== undefined)

    if (hasErrors) {
      console.log("Validation errors:", newErrors)
      return
    }

    // Prepare the data
    const terminalFormData: TerminalFormData = {
      name: formData.name.trim(),
      status: "Offline", // Default status
      availability: "Available", // Default availability
    }

    // Call the onSave callback with form data only (API will handle the details)
    onSave?.(terminalFormData).then(() => {
      // Close modal after successful save
      onOpenChange(false)
      
      // Reset form
      setFormData({ name: "" })
      setErrors({})
    }).catch((err) => {
      console.error('Error saving terminal:', err)
      // Error is handled by the parent component
    })
  }, [formData, onSave])

  const displayId = isEditing && editData ? editData.id : getNextTerminalId()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#171717] border-[#2a2a2a] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-medium">
            Terminal Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Terminal ID Display */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-white font-medium">Terminal ID</Label>
              <span className="text-[#a1a1a1] text-sm">{displayId}</span>
            </div>
          </div>

          {/* Terminal Name Field */}
          <div className="space-y-3">
            <Label className="text-white font-medium">Terminal Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-[#262626] border-[#404040] text-white placeholder:text-[#a1a1a1] focus:border-[#4285f4]"
            />
            {errors.name && (
              <p className="text-red-400 text-xs">{errors.name}</p>
            )}
          </div>

          {/* Create Button */}
          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={!isFormValid()}
              className="w-full bg-[#4285f4] text-white hover:bg-[#3367d6] disabled:bg-[#404040] disabled:text-[#a1a1a1] py-3 text-lg"
            >
              {isEditing ? "Update Terminal" : "Create Terminal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}