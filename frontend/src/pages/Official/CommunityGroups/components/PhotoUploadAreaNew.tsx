import { Button } from "@/components/ui/button"
import { RefreshCcw, Trash, Upload } from "lucide-react"
import { useCallback, useEffect, useMemo } from "react"

interface PhotoUploadAreaProps {
  photos: File[]
  onChange: (photos: File[]) => void
  maxPhotos?: number
}

export const PhotoUploadArea = ({ 
  photos, 
  onChange, 
  maxPhotos = 5 
}: PhotoUploadAreaProps) => {
  console.log(`📸 PhotoUploadArea render:`, {
    photoCount: photos.length,
    maxPhotos
  })

  // Create object URLs for display
  const photoUrls = useMemo(() => {
    console.log(`🖼️ Computing display URLs for ${photos.length} photos`)
    
    return photos.map((photo, index) => {
      if (photo instanceof File) {
        const url = URL.createObjectURL(photo)
        console.log(`🆕 Created blob URL for photo ${index}:`, url)
        return url
      }
      return null
    }).filter(Boolean) as string[]
  }, [photos])

  // Cleanup object URLs when component unmounts or photos change
  useEffect(() => {
    return () => {
      photoUrls.forEach(url => {
        if (url?.startsWith('blob:')) {
          console.log(`🧹 Cleaning up blob URL:`, url)
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [photoUrls])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    console.log(`📁 Files selected:`, files.map(f => f.name))
    
    if (files.length === 0) return
    
    // Validate files
    const validFiles = files.filter(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`)
        return false
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`)
        return false
      }
      
      return true
    })
    
    // Check if we can add more photos
    const availableSlots = maxPhotos - photos.length
    const filesToAdd = validFiles.slice(0, availableSlots)
    
    if (filesToAdd.length < validFiles.length) {
      alert(`Can only add ${availableSlots} more photos (max ${maxPhotos} total)`)
    }
    
    if (filesToAdd.length > 0) {
      onChange([...photos, ...filesToAdd])
    }
    
    // Reset input value so same files can be selected again
    event.target.value = ''
  }, [photos, onChange, maxPhotos])

  const handleDelete = useCallback((index: number) => {
    console.log(`🗑️ Deleting photo at index ${index}`)
    const newPhotos = photos.filter((_, i) => i !== index)
    onChange(newPhotos)
  }, [photos, onChange])

  const handleReplace = useCallback((index: number) => {
    console.log(`🔄 Replacing photo at index ${index}`)
    // Create a temporary input for single file selection
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file')
          return
        }
        
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB')
          return
        }
        
        const newPhotos = [...photos]
        newPhotos[index] = file
        onChange(newPhotos)
      }
    }
    input.click()
  }, [photos, onChange])

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <>
          <input
            id="community-photos-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload community photos"
          />
          
          <div
            onClick={() => document.getElementById('community-photos-upload')?.click()}
            className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 transition-colors duration-200 group"
          >
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-3 group-hover:text-gray-300 transition-colors duration-200" />
            <p className="text-gray-400 mb-2 group-hover:text-gray-300 transition-colors duration-200">
              Click to upload community photos
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, GIF up to 5MB • {photos.length}/{maxPhotos} photos
            </p>
          </div>
        </>
      )}
      
      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {photos.map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="relative group">
                <img
                  src={photoUrls[index]}
                  alt={`Community photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-[#2a2a2a]"
                  onError={(e) => {
                    console.error(`❌ Error loading photo ${index}:`, photoUrls[index])
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDE5VjVBMiAyIDAgMCAwIDE5IDNINUEyIDIgMCAwIDAgMyA1VjE5QTIgMiAwIDAgMCA1IDIxSDE5QTIgMiAwIDAgMCAyMSAxOVoiIHN0cm9rZT0iIzZBNkE2QSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPENpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjIiIHN0cm9rZT0iIzZBNkE2QSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPFBhdGggZD0iTTIxIDE1TDE2IDEwTDUgMjEiIHN0cm9rZT0iIzZBNkE2QSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc='
                  }}
                />
              </div>
              
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleReplace(index)}
                  className="flex-1 bg-transparent border-[#2a2a2a] text-white hover:bg-[#2a2a2a] hover:text-white transition-colors duration-200 text-xs h-7"
                >
                  <RefreshCcw className="w-3 h-3 mr-1" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(index)}
                  className="bg-transparent border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200 text-xs h-7 px-2"
                >
                  <Trash className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}