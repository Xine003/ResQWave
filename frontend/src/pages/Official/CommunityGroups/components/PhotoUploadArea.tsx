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
      
      // Validate file size (10MB limit to match UI text)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large (max 10MB)`)
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
        
        if (file.size > 10 * 1024 * 1024) {
          alert('File size must be less than 10MB')
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
            role="button"
            tabIndex={0}
            onClick={() => document.getElementById('community-photos-upload')?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                document.getElementById('community-photos-upload')?.click()
              }
            }}
            className="bg-[#262626] border border-dashed border-[#404040] rounded-[8px] p-7 text-center flex flex-col items-center justify-center gap-[5px] hover:bg-[#2a2a2a] cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#1f2937] rounded-[8px] flex items-center justify-center">
              <Upload className="w-6 h-6 text-[#60A5FA]" />
            </div>
            <div>
              <p className="text-white font-medium">Upload community photos</p>
              <p className="text-gray-400 text-sm mt-1">
                Drag and drop or click to upload
                <br />
                JPG and PNG, file size no more than 10MB • {photos.length}/{maxPhotos} photos
              </p>
            </div>
          </div>
        </>
      )}
      
      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {photos.map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="bg-[#0b0b0b] rounded-[6px] flex justify-center">
                <div className="relative w-full h-32 rounded-[8px] overflow-hidden bg-[#111]">
                  {/* Blurred backdrop */}
                  <img
                    src={photoUrls[index]}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover filter blur-[18px] brightness-50 scale-[1.2]"
                    onError={(e) => {
                      console.error(`❌ Error loading backdrop for photo ${index}:`, photoUrls[index])
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDE5VjVBMiAyIDAgMCAwIDE5IDNINUEyIDIgMCAwIDAgMyA1VjE5QTIgMiAwIDAgMCA1IDIxSDE5QTIgMiAwIDAgMCAyMSAxOVoiIHN0cm9rZT0iIzZBNkE2QSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPENpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjIiIHN0cm9rZT0iIzZBNkE2QSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPFBhdGggZD0iTTIxIDE1TDE2IDEwTDUgMjEiIHN0cm9rZT0iIzZBNkE2QSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+'
                    }}
                  />
                  {/* Foreground image */}
                  <img
                    src={photoUrls[index]}
                    alt={`Community photo ${index + 1}`}
                    className="relative w-auto h-full max-w-[60%] m-auto block object-contain"
                    onError={(e) => {
                      console.error(`❌ Error loading photo ${index}:`, photoUrls[index])
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDE5VjVBMiAyIDAgMCAwIDE5IDNINUEyIDIgMCAwIDAgMyA1VjE5QTIgMiAwIDAgMCA1IDIxSDE5QTIgMiAwIDAgMCAyMSAxOVoiIHN0cm9rZT0iIzZBNkE2QSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPENpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjIiIHN0cm9rZT0iIzZBNkE2QSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1qaW5lam9pbj0icm91bmQiLz4KPFBhdGggZD0iTTIxIDE1TDE2IDEwTDUgMjEiIHN0cm9rZT0iIzZBNkE2QSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+'
                    }}
                  />
                  {/* Actions */}
                  <div className="absolute bottom-2 right-2 flex gap-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleReplace(index)}
                      aria-label={`Change photo ${index + 1}`}
                      title={`Change photo ${index + 1}`}
                      className="bg-white border-[#2a2a2a] text-black hover:bg-white rounded-none w-6 h-6"
                    >
                      <RefreshCcw className="w-3 h-3 text-black" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(index)}
                      aria-label={`Delete photo ${index + 1}`}
                      title={`Delete photo ${index + 1}`}
                      className="bg-white border-[#2a2a2a] text-red-500 hover:bg-white rounded-none w-6 h-6"
                    >
                      <Trash className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}