import { useState } from "react";
import { Button } from "@/components/ui/button";
// import { Camera } from "lucide-react";
import { X } from "lucide-react";
import cameraIcon from '/li_camera.png'; // Adjust path if needed
import personIcon from '/user.png'; // Adjust path if needed

interface Step2ProfilePictureProps {
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function Step2ProfilePicture({ onNext, onBack, isLoading = false }: Step2ProfilePictureProps) {
  const handleRemoveImage = () => {
    setSelectedImage(null);
  };
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
    const fileInput = document.getElementById('profile-upload') as HTMLInputElement;
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

  const handleSkip = () => {
    onNext();
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <>
      {/* Main Content */}
      <div className="flex flex-col items-center gap-4 mb-10">
        <h1 className="text-4xl font-semibold text-white mb-2 text-center mt-3">Set your Profile Picture</h1>
        <p className="text-gray-300 text-center text-base max-w-md leading-relaxed">
          The following information will be used for the main focal person of the neighborhood.
        </p>
      </div>

      <div className="flex flex-col items-center gap-8 w-full max-w-[490px]">
        {/* Profile Picture Upload Area */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div
              className={`w-40 h-40 rounded-full border-2 ${isDragging ? 'border-blue-400 bg-blue-50/10' : 'border-[#BABABA]'
                } transition-all duration-200 overflow-hidden cursor-pointer hover:border-blue-400`}
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
                  <img src={personIcon} alt="Person Icon" className="w-24 h-24 object-contain" />
                </div>
              )}
            </div>

            {/* Camera Icon Overlay - Outside the border */}
            {/* Icon Overlay - Camera or Remove */}
            {selectedImage ? (
              <div
                className="absolute bottom-2 right-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                onClick={handleRemoveImage}
              >
                <X className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div
                className="absolute bottom-2 right-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors"
                onClick={triggerFileUpload}
              >
                <img src={cameraIcon} alt="Camera Icon" className="w-5 h-5 object-contain" />
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            id="profile-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 w-full mt-5">
          {selectedImage && (
            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="text-white py-6 rounded-md font-medium text-base flex items-center justify-center
             bg-blue-500 hover:bg-blue-600
             transition duration-300"
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading && (
                <span className="inline-block mr-2">
                  <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                </span>
              )}
              {isLoading ? 'Processing...' : 'Continue'}
            </Button>
          )}

          <Button
            onClick={handleSkip}
            className="text-white py-6 rounded-md font-medium text-base flex items-center justify-center
             bg-blue-500 hover:bg-blue-600
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