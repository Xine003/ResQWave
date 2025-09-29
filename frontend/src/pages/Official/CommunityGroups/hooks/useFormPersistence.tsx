import { useCallback, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

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

interface FormPersistenceOptions {
  sessionKey: string
  isEditing: boolean
  editData?: any
  initialData: CommunityGroupData
}

export const useFormPersistence = ({ 
  sessionKey, 
  isEditing, 
  editData, 
  initialData 
}: FormPersistenceOptions) => {
  const navigate = useNavigate()
  const hasRestoredRef = useRef(false)
  const isRestoringRef = useRef(false)

  // Convert File to base64 for storage
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })
  }, [])

  // Convert base64 back to File
  const base64ToFile = useCallback(async (base64: string, filename: string): Promise<File> => {
    const response = await fetch(base64)
    const blob = await response.blob()
    return new File([blob], filename, { type: blob.type })
  }, [])

  // Save form data to session storage
  const saveToSession = useCallback(async (data: CommunityGroupData) => {
    if (isRestoringRef.current) {
      console.log("🚫 Skipping save during restoration")
      return
    }

    try {
      console.log("💾 Saving form data to session storage")
      
      // Convert photos to base64 for storage
      const photosAsBase64: string[] = []
      const photoNames: string[] = []
      
      for (const photo of data.selectedPhotos) {
        const base64 = await fileToBase64(photo)
        photosAsBase64.push(base64)
        photoNames.push(photo.name)
      }

      const sessionData = {
        ...data,
        selectedPhotos: [], // Don't store File objects directly  
        photosAsBase64,
        photoNames,
        timestamp: Date.now(),
        isEditing,
        editData: isEditing ? editData : null
      }

      sessionStorage.setItem(sessionKey, JSON.stringify(sessionData))
      console.log("✅ Form data saved to session storage")
    } catch (error) {
      console.error("❌ Error saving to session storage:", error)
    }
  }, [sessionKey, isEditing, editData, fileToBase64])

  // Restore form data from session storage
  const restoreFromSession = useCallback(async (): Promise<CommunityGroupData | null> => {
    if (hasRestoredRef.current) {
      console.log("🚫 Already restored, skipping")
      return null
    }

    try {
      console.log("🔄 Attempting to restore from session storage")
      const saved = sessionStorage.getItem(sessionKey)
      
      if (!saved) {
        console.log("📭 No session data found")
        return null
      }

      isRestoringRef.current = true
      const sessionData = JSON.parse(saved)
      console.log("📦 Found session data:", sessionData)

      // Convert base64 photos back to File objects
      const restoredPhotos: File[] = []
      
      if (sessionData.photosAsBase64 && sessionData.photoNames) {
        console.log(`📸 Converting ${sessionData.photosAsBase64.length} photos from base64`)
        
        for (let i = 0; i < sessionData.photosAsBase64.length; i++) {
          try {
            const file = await base64ToFile(sessionData.photosAsBase64[i], sessionData.photoNames[i])
            restoredPhotos.push(file)
          } catch (error) {
            console.error(`❌ Error converting photo ${i}:`, error)
          }
        }
      }

      const restoredData: CommunityGroupData = {
        groupName: sessionData.groupName || "",
        contactPerson: sessionData.contactPerson || "",
        phoneNumber: sessionData.phoneNumber || "",
        emergencyPhoneNumber: sessionData.emergencyPhoneNumber || "",
        address: sessionData.address || "",
        boundary: sessionData.boundary || "",
        totalMembers: sessionData.totalMembers || 0,
        notableInfoList: sessionData.notableInfoList || [""],
        selectedPhotos: restoredPhotos,
        savedBoundaryFromMap: sessionData.savedBoundaryFromMap || null,
        savedAddressFromMap: sessionData.savedAddressFromMap || null
      }

      hasRestoredRef.current = true
      isRestoringRef.current = false
      console.log("✅ Form data restored from session storage")
      return restoredData

    } catch (error) {
      console.error("❌ Error restoring from session storage:", error)
      isRestoringRef.current = false
      return null
    }
  }, [sessionKey, base64ToFile])

  // Clear session storage
  const clearSession = useCallback(() => {
    console.log("🧹 Clearing session storage")
    sessionStorage.removeItem(sessionKey)
    hasRestoredRef.current = false
  }, [sessionKey])

  // Navigate to location setting with current data
  const navigateToLocationSetting = useCallback(async (currentData: CommunityGroupData) => {
    console.log("🗺️ Navigating to location setting")
    await saveToSession(currentData)
    navigate("/dispatcher/community-groups/create/location")
  }, [navigate, saveToSession])

  // Get initial form data (edit data or session restore or defaults)
  const getInitialFormData = useCallback(async (): Promise<CommunityGroupData> => {
    console.log("🎯 Getting initial form data")
    
    if (isEditing && editData) {
      console.log("✏️ Using edit data as initial data")
      return {
        groupName: editData.groupName || "",
        contactPerson: editData.contactPerson || "",
        phoneNumber: editData.phoneNumber || "",
        emergencyPhoneNumber: editData.emergencyPhoneNumber || "",
        address: editData.address || "",
        boundary: editData.boundary || "",
        totalMembers: editData.totalMembers || 0,
        notableInfoList: editData.notableInfoList && editData.notableInfoList.length > 0 
          ? editData.notableInfoList 
          : [""],
        selectedPhotos: [], // Will be populated by component if photos exist
        savedBoundaryFromMap: null,
        savedAddressFromMap: null
      }
    }

    // Try to restore from session
    const sessionData = await restoreFromSession()
    if (sessionData) {
      console.log("📦 Using session data as initial data")
      return sessionData
    }

    console.log("🆕 Using default initial data")
    return initialData
  }, [isEditing, editData, restoreFromSession, initialData])

  // Reset restoration state when editing changes
  useEffect(() => {
    if (isEditing) {
      console.log("✏️ Switching to edit mode - resetting restoration state")
      hasRestoredRef.current = false
      isRestoringRef.current = false
    }
  }, [isEditing])

  return {
    saveToSession,
    restoreFromSession,
    clearSession,
    navigateToLocationSetting,
    getInitialFormData,
    hasRestored: hasRestoredRef.current
  }
}