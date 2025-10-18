import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, User } from "lucide-react";

interface Step5AlternativeProfilePictureProps {
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function Step5AlternativeProfilePicture({ onNext, onBack, isLoading = false }: Step5AlternativeProfilePictureProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    const fileInput = document.getElementById('alt-profile-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4 mb-8">
        <h1 className="text-4xl font-semibold text-white mb-2 text-center">Set their Profile Picture</h1>
        <p className="text-gray-300 text-center text-base max-w-md leading-relaxed">
          The following information will be used for the alternative focal person of the neighborhood.
        </p>
      </div>
      <div className="flex flex-col items-center gap-8 w-full max-w-[490px]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div
              className={`w-32 h-32 rounded-full border-2 ${isDragging ? 'border-blue-400 bg-blue-50/10' : 'border-white'} transition-all duration-200 overflow-hidden cursor-pointer hover:border-blue-400 p-1`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={triggerFileUpload}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-[#262626] rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
          <input
            id="alt-profile-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <div className="flex flex-col gap-4 mt-3 w-full">
          <Button
            onClick={onNext}
            className="text-white py-6 rounded-md font-medium text-base flex items-center justify-center gap-2
             bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] 
             hover:from-[#2C64C5] hover:to-[#2C64C5]
             transition duration-300"
          >
            Skip
          </Button>
          <Button
            onClick={onBack}
            className="text-[#BABABA] bg-transparent border-none cursor-pointer hover:text-white hover:bg-transparent mt-2"
          >
            Back
          </Button>
        </div>
      </div>
    </>
  );
}
