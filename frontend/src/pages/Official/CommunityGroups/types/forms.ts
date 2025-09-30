// Form-specific types for CreateCommunityGroupSheet

export interface CommunityFormData {
  assignedTerminal: string
  communityGroupName: string
  totalIndividuals: number
  totalFamilies: number
  totalKids: number
  totalSeniorCitizen: number
  totalPregnantWomen: number
  totalPWDs: number
  focalPersonPhoto: File | null
  focalPersonName: string
  focalPersonContact: string
  focalPersonEmail: string
  focalPersonAddress: string
  focalPersonCoordinates: string
  altFocalPersonPhoto: File | null
  altFocalPersonName: string
  altFocalPersonContact: string
  altFocalPersonEmail: string
  boundaryGeoJSON: string
}

export interface PhotoUrls {
  focalPersonPhoto: string | null
  altFocalPersonPhoto: string | null
}

export interface FormSnapshot {
  formData: CommunityFormData
  notableInfoInputs: string[]
  isEditing: boolean
  editData?: any
}

export interface SessionState {
  snapshot: FormSnapshot | null
  shouldReopen: boolean
}

// Utility types for form field updates
export type FormField = keyof CommunityFormData
export type FormUpdateFunction = <K extends FormField>(field: K, value: CommunityFormData[K]) => void

// Photo handling types
export interface PhotoHandlers {
  handlePhotoUpload: (type: 'focalPersonPhoto' | 'altFocalPersonPhoto', file: File | null) => void
  removePhoto: (type: 'focalPersonPhoto' | 'altFocalPersonPhoto') => void
}