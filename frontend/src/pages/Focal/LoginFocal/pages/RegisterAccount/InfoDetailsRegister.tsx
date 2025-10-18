import { Step10OtherInfo } from "./components/Step6OtherInfo";
import { Step9FloodHazards } from "./components/Step6FloodHazards";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FocalHeader } from "@/pages/Focal/LoginFocal/components/FocalHeader";
import { Step1PersonalInfo } from "./components/Step1PersonalInfo";
import { Step2ProfilePicture } from "./components/Step2ProfilePicture";
import { Step3CreatePassword } from "./components/Step3CreatePassword";
import { Step4LocationDetails } from "./components/Step4LocationDetails";
import { Step5AlternativeProfilePicture } from "./components/Step5AlternativeProfilePicture";
import { Step6AboutNeighborhood } from "./components/Step6AboutNeighborhood";
import { Step7AboutResidents } from "./components/Step6AboutResidents";
import { Step8FloodwaterDuration } from "./components/Step6FloodwaterDuration";

interface RegistrationData {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | undefined;
    profilePicture?: string;
    password?: string;
    confirmPassword?: string;
}

interface InfoDetailsRegisterProps {
    step?: number;
}

export default function InfoDetailsRegister({ step = 1 }: InfoDetailsRegisterProps) {
    const currentStep = step;
    const navigateToStep = (stepNum: number) => {
        switch (stepNum) {
            case 1:
                navigate('/register/personal-info');
                break;
            case 2:
                navigate('/register/profile-picture');
                break;
            case 3:
                navigate('/register/create-password');
                break;
            case 4:
                navigate('/register/location-details');
                break;
            case 5:
                navigate('/register/alternative-focal-person');
                break;
            case 6:
                navigate('/register/alternative-profile-picture');
                break;
            case 7:
                navigate('/register/about-neighborhood');
                break;
            case 8:
                navigate('/register/about-residents');
                break;
            case 9:
                navigate('/register/floodwater-duration');
                break;
            case 10:
                navigate('/register/flood-hazards');
                break;
            case 11:
                navigate('/register/other-info');
                break;
            default:
                navigate('/register/personal-info');
        }
    };
    const [isLoading, setIsLoading] = useState(false);
    const [registrationData, setRegistrationData] = useState<RegistrationData>({
        firstName: "",
        lastName: "",
        dateOfBirth: undefined,
    });
    const navigate = useNavigate();

    const handleStep1Next = (data: { firstName: string; lastName: string; dateOfBirth: Date | undefined }) => {
        setRegistrationData(prev => ({ ...prev, ...data }));
        navigateToStep(2);
    };

    const handleStep2Next = () => {
        navigateToStep(3);
    };

    const handleStep3Next = (data: { password: string; confirmPassword: string }) => {
        setRegistrationData(prev => ({ ...prev, ...data }));
        navigateToStep(4);
    };

    const handleBack = () => {
        if (currentStep === 1) {
            navigate('/verify-account-focal');
        } else {
            navigateToStep(currentStep - 1);
        }
    };

    const getProgressValue = () => {
        // 6 steps: 1/6, 2/6, ...
        if (currentStep >= 1 && currentStep <= 6) {
            return Math.round((currentStep / 6) * 100);
        }
        // Treat step 7-11 as step 6 of 6
        if (currentStep >= 7 && currentStep <= 11) {
            return 100;
        }
        return 0;
    };

    const getStepText = () => {
        // Treat step 7-11 as step 6 of 6
        if (currentStep >= 7 && currentStep <= 11) {
            return `STEP 6 OF 6`;
        }
        return `STEP ${currentStep} OF 6`;
    };

    return (
        <div className="min-h-screen flex flex-col primary-background" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="loginfocal-radial-gradient" />
            <FocalHeader />
            <main className="flex flex-1 flex-col items-center justify-center w-full" style={{ marginTop: '0px', zIndex: 20, position: 'relative' }}>
                {/* Progress Bar */}
                <div className="w-full max-w-[310px] mb-5">
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-600 mb-2">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${getProgressValue()}%` }}
                        />
                    </div>
                    <p className="text-gray-400 text-sm text-center mt-11">{getStepText()}</p>
                </div>

                {/* Step Content */}
                {currentStep === 1 && (
                    <Step1PersonalInfo
                        onNext={handleStep1Next}
                        onBack={handleBack}
                        isLoading={isLoading}
                        initialData={registrationData}
                    />
                )}

                {currentStep === 2 && (
                    <Step2ProfilePicture
                        onNext={handleStep2Next}
                        onBack={handleBack}
                        isLoading={isLoading}
                    />
                )}

                {currentStep === 3 && (
                    <Step3CreatePassword
                        onNext={handleStep3Next}
                        onBack={handleBack}
                        isLoading={isLoading}
                    />
                )}

                {currentStep === 4 && (
                    <Step4LocationDetails
                        onNext={() => navigateToStep(5)}
                        onBack={handleBack}
                        isLoading={isLoading}
                    />
                )}

                {currentStep === 5 && (
                    <Step5AlternativeProfilePicture
                        onNext={() => navigateToStep(7)}
                        onBack={handleBack}
                        isLoading={isLoading}
                    />
                )}

                {currentStep === 7 && (
                    <Step6AboutNeighborhood
                        onNext={() => navigateToStep(8)}
                        onBack={handleBack}
                        isLoading={isLoading}
                    />
                )}

                {currentStep === 8 && (
                    <Step7AboutResidents
                        onNext={() => navigateToStep(9)}
                        onBack={handleBack}
                        isLoading={isLoading}
                    />
                )}

                {currentStep === 9 && (
                    <Step8FloodwaterDuration
                        onNext={() => navigateToStep(10)}
                        onBack={handleBack}
                        isLoading={isLoading}
                    />
                )}

                {currentStep === 10 && (
                    <Step9FloodHazards
                        onNext={() => navigateToStep(11)}
                        onBack={handleBack}
                        isLoading={isLoading}
                    />
                )}

                {currentStep === 11 && (
                    <Step10OtherInfo
                        onNext={() => navigate('/register/account-review')}
                        onBack={handleBack}
                        isLoading={isLoading}
                    />
                )}
            </main>
        </div>
    );
}
