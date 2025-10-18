import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { RefreshCcw, Trash, Upload } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import type { DispatcherDetails, DispatcherDrawerProps } from "../types"
import { CloseCreateDialog } from "./CloseCreateDialog"

interface FormData {
  photo: File | null
  firstName: string
  lastName: string
  contactNumber: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  contactNumber?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export function CreateDispatcherSheet({ 
  open, 
  onOpenChange, 
  onSave, 
  editData, 
  isEditing = false 
}: DispatcherDrawerProps) {
  const [formData, setFormData] = useState<FormData>({
    photo: null,
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  // Validation functions
  const validateContactNumber = (contact: string): string | undefined => {
    if (!contact.trim()) return "Contact number is required"
    const cleanContact = contact.replace(/\D/g, '') // Remove non-digits
    if (cleanContact.length !== 11) return "Contact number must be exactly 11 digits"
    if (!cleanContact.startsWith('09')) return "Contact number must start with 09"
    return undefined
  }

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return undefined
  }

  const validatePassword = (password: string): string | undefined => {
    if (!isEditing && !password.trim()) return "Password is required"
    if (!isEditing && password.length < 8) return "Password must be at least 8 characters long"
    
    if (!isEditing) {
      const hasUppercase = /[A-Z]/.test(password)
      const hasLowercase = /[a-z]/.test(password)
      const hasNumber = /\d/.test(password)
      const hasSpecialChar = /[@$!%*?&]/.test(password)
      
      if (!hasUppercase) return "Password must include at least one uppercase letter"
      if (!hasLowercase) return "Password must include at least one lowercase letter"
      if (!hasNumber) return "Password must include at least one number"
      if (!hasSpecialChar) return "Password must include at least one special character (@, $, !, %, *, ?, &)"
    }
    
    return undefined
  }

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!isEditing && !confirmPassword.trim()) return "Please confirm your password"
    if (!isEditing && confirmPassword !== password) return "Passwords do not match"
    return undefined
  }

  // Check if form is valid
  const isFormValid = (): boolean => {
    const hasFirstName = formData.firstName.trim().length > 0
    const hasLastName = formData.lastName.trim().length > 0
    const hasValidContact = !validateContactNumber(formData.contactNumber)
    const hasValidEmail = !validateEmail(formData.email)
    const hasValidPassword = isEditing || !validatePassword(formData.password)
    const hasValidConfirmPassword = isEditing || !validateConfirmPassword(formData.confirmPassword, formData.password)
    
    return hasFirstName && hasLastName && hasValidContact && hasValidEmail && hasValidPassword && hasValidConfirmPassword
  }

  // Reset form when opening/closing or when edit data changes
  useEffect(() => {
    if (open && isEditing && editData) {
      // Split the full name for editing
      const nameParts = editData.name.split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""
      
      setFormData({
        photo: null,
        firstName,
        lastName,
        contactNumber: editData.contactNumber,
        email: editData.email,
        password: "",
        confirmPassword: "",
      })
      // Set existing photo as preview
      setPhotoPreview(editData.photo || null)
      setErrors({})
      setIsDirty(false)
    } else if (open && !isEditing) {
      // Reset for new dispatcher
      setFormData({
        photo: null,
        firstName: "",
        lastName: "",
        contactNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      setPhotoPreview(null)
      setErrors({})
      setIsDirty(false)
    }
  }, [open, isEditing, editData])

  // Special handler for contact number with digit limiting
  const handleContactNumberChange = useCallback((value: string) => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '')
    
    // Limit to 11 digits maximum
    if (digitsOnly.length <= 11) {
      setFormData(prev => ({
        ...prev,
        contactNumber: digitsOnly
      }))
      
      // Clear error when user starts typing
      if (errors.contactNumber) {
        setErrors(prev => ({
          ...prev,
          contactNumber: undefined
        }))
      }
      
      // Real-time validation
      const error = validateContactNumber(digitsOnly)
      setErrors(prev => ({ ...prev, contactNumber: error }))
      setIsDirty(true)
    }
  }, [errors.contactNumber, validateContactNumber])

  const handleInputChange = useCallback((field: keyof FormData, value: string | File | null) => {
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
    
    // Real-time validation for specific fields
    if (field === 'email' && typeof value === 'string') {
      const error = validateEmail(value)
      setErrors(prev => ({ ...prev, email: error }))
    } else if (field === 'password' && typeof value === 'string') {
      const error = validatePassword(value)
      setErrors(prev => ({ ...prev, password: error }))
      // Also revalidate confirm password if it exists
      if (formData.confirmPassword) {
        const confirmError = validateConfirmPassword(formData.confirmPassword, value)
        setErrors(prev => ({ ...prev, confirmPassword: confirmError }))
      }
    } else if (field === 'confirmPassword' && typeof value === 'string') {
      const error = validateConfirmPassword(value, formData.password)
      setErrors(prev => ({ ...prev, confirmPassword: error }))
    }
    
    setIsDirty(true)
  }, [errors, formData.password, formData.confirmPassword, validateEmail, validatePassword, validateConfirmPassword])

  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File size must be less than 10MB")
        return
      }
      
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        alert("Only JPG and PNG files are allowed")
        return
      }

      handleInputChange("photo", file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [handleInputChange])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File size must be less than 10MB")
        return
      }
      
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        alert("Only JPG and PNG files are allowed")
        return
      }

      handleInputChange("photo", file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [handleInputChange])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const handleSave = useCallback(() => {
    // Validate all fields
    const newErrors: FormErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    
    const contactError = validateContactNumber(formData.contactNumber)
    if (contactError) {
      newErrors.contactNumber = contactError
    }
    
    const emailError = validateEmail(formData.email)
    if (emailError) {
      newErrors.email = emailError
    }
    
    if (!isEditing) {
      const passwordError = validatePassword(formData.password)
      if (passwordError) {
        newErrors.password = passwordError
      }
      
      const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)
      if (confirmPasswordError) {
        newErrors.confirmPassword = confirmPasswordError
      }
    }
    
    // If there are errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const dispatcherData: DispatcherDetails = {
      id: isEditing && editData ? editData.id : `CG-${Date.now()}`,
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      contactNumber: formData.contactNumber.trim(),
      email: formData.email.trim(),
      createdAt: isEditing && editData ? editData.createdAt : new Date().toLocaleDateString(),
      createdBy: isEditing && editData ? editData.createdBy : "Franxine Orias",
      photo: photoPreview || (isEditing && editData ? editData.photo : undefined),
    }

    onSave?.(dispatcherData)
    setIsDirty(false)
    onOpenChange(false)
  }, [formData, isEditing, editData, onSave, onOpenChange, photoPreview, validateContactNumber, validateEmail, validatePassword, validateConfirmPassword])

  const handleClose = useCallback(() => {
    if (isDirty) {
      setShowCloseConfirm(true)
    } else {
      onOpenChange(false)
    }
  }, [isDirty, onOpenChange])

  const handleDiscard = useCallback(() => {
    setIsDirty(false)
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent 
          side="right" 
          className="w-[400px] sm:w-[540px] bg-[#171717] border-l border-[#2a2a2a] text-white p-0 flex flex-col"
        >
          <SheetHeader className="px-6 py-4 border-b border-[#2a2a2a] flex flex-row items-center justify-between">
            <SheetTitle className="text-white text-lg font-semibold">
              {isEditing ? "Edit Dispatcher" : "New Dispatcher"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Photo Upload */}
            <div className="space-y-3">
              {/* Hidden file input */}
              <input
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handlePhotoUpload}
                className="hidden"
                aria-label="Upload photo"
              />

              {!photoPreview ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      document.getElementById('photo-upload')?.click()
                    }
                  }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
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
                      src={photoPreview}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover filter blur-[18px] brightness-50 scale-[1.2]"
                    />
                    {/* Foreground image */}
                    <img
                      src={photoPreview}
                      alt="Uploaded"
                      className="relative w-auto h-full max-w-[60%] m-auto block object-contain"
                    />
                    {/* Actions */}
                    <div className="absolute bottom-3 right-3 flex gap-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        aria-label="Change photo"
                        title="Change photo"
                        className="bg-white border-[#2a2a2a] text-black hover:bg-white rounded-none w-8 h-8"
                      >
                        <RefreshCcw className="w-4 h-4 text-black" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPhotoPreview(null)
                          handleInputChange("photo", null)
                        }}
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

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white text-xs">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`bg-[#171717] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 ${
                    errors.firstName 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-[#2a2a2a] focus:border-gray-600"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white text-xs">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`bg-[#171717] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 ${
                    errors.lastName 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-[#2a2a2a] focus:border-gray-600"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="contactNumber" className="text-white text-xs">
                Contact Number
              </Label>
              <Input
                id="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => handleContactNumberChange(e.target.value)}
                maxLength={11}
                className={`bg-[#171717] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 ${
                  errors.contactNumber 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-[#2a2a2a] focus:border-gray-600"
                }`}
              />
              {errors.contactNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-xs">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`bg-[#171717] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 ${
                  errors.email 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-[#2a2a2a] focus:border-gray-600"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Fields (only for new dispatchers) */}
            {!isEditing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white text-xs">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`bg-[#171717] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 ${
                      errors.password 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-[#2a2a2a] focus:border-gray-600"
                    }`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white text-xs">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`bg-[#171717] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 ${
                      errors.confirmPassword 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-[#2a2a2a] focus:border-gray-600"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-[#171717] border-t border-[#2a2a2a] px-6 py-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-transparent border-[#2a2a2a] text-white hover:text-white hover:bg-[#262626] rounded-[5px]"
              >
                Discard
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isFormValid()}
                className={`flex-1 text-white rounded-[5px] transition-colors ${
                  isFormValid() 
                    ? "bg-[#4285f4] hover:bg-[#3367d6] cursor-pointer" 
                    : "bg-gray-500 cursor-not-allowed opacity-50"
                }`}
              >
                {isEditing ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Close Confirmation Dialog */}
      <CloseCreateDialog
        open={showCloseConfirm}
        onOpenChange={setShowCloseConfirm}
        onDiscard={handleDiscard}
      />
    </>
  )
}