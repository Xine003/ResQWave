import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2Icon, KeyRound, Mail, ShieldCheck } from "lucide-react";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";

export type FocalForgotPasswordAlertsHandle = {
  showCodeSent: (maskedEmail: string) => void;
  showCodeVerified: () => void;
  showCodeResent: () => void;
  showPasswordUpdated: () => void;
  showError: (message: string) => void;
  hideAll: () => void;
};

export default forwardRef<FocalForgotPasswordAlertsHandle>(
  function FocalForgotPasswordAlerts(_props, ref) {
    // Code sent alert (bottom left)
    const [showCodeSent, setShowCodeSent] = useState(false);
    const [codeSentMessage, setCodeSentMessage] = useState("");
    const codeSentTimer = useRef<number | null>(null);

    // Code verified alert (bottom left)
    const [showCodeVerified, setShowCodeVerified] = useState(false);
    const codeVerifiedTimer = useRef<number | null>(null);

    // Code resent alert (bottom left)
    const [showCodeResent, setShowCodeResent] = useState(false);
    const codeResentTimer = useRef<number | null>(null);

    // Password updated alert (bottom left)
    const [showPasswordUpdated, setShowPasswordUpdated] = useState(false);
    const passwordUpdatedTimer = useRef<number | null>(null);

    // Error alert (bottom left)
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const errorTimer = useRef<number | null>(null);

    // Clear timers on unmount
    useEffect(() => {
      return () => {
        if (codeSentTimer.current) window.clearTimeout(codeSentTimer.current);
        if (codeVerifiedTimer.current)
          window.clearTimeout(codeVerifiedTimer.current);
        if (codeResentTimer.current)
          window.clearTimeout(codeResentTimer.current);
        if (passwordUpdatedTimer.current)
          window.clearTimeout(passwordUpdatedTimer.current);
        if (errorTimer.current) window.clearTimeout(errorTimer.current);
      };
    }, []);

    const hideAllAlerts = () => {
      setShowCodeSent(false);
      setShowCodeVerified(false);
      setShowCodeResent(false);
      setShowPasswordUpdated(false);
      setShowError(false);
      // Clear all timers
      if (codeSentTimer.current) {
        window.clearTimeout(codeSentTimer.current);
        codeSentTimer.current = null;
      }
      if (codeVerifiedTimer.current) {
        window.clearTimeout(codeVerifiedTimer.current);
        codeVerifiedTimer.current = null;
      }
      if (codeResentTimer.current) {
        window.clearTimeout(codeResentTimer.current);
        codeResentTimer.current = null;
      }
      if (passwordUpdatedTimer.current) {
        window.clearTimeout(passwordUpdatedTimer.current);
        passwordUpdatedTimer.current = null;
      }
      if (errorTimer.current) {
        window.clearTimeout(errorTimer.current);
        errorTimer.current = null;
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        showCodeSent: (maskedEmail: string) => {
          hideAllAlerts();
          setCodeSentMessage(`Verification code sent to ${maskedEmail}`);
          setShowCodeSent(true);
          codeSentTimer.current = window.setTimeout(() => {
            setShowCodeSent(false);
            codeSentTimer.current = null;
          }, 4000);
        },
        showCodeVerified: () => {
          hideAllAlerts();
          setShowCodeVerified(true);
          codeVerifiedTimer.current = window.setTimeout(() => {
            setShowCodeVerified(false);
            codeVerifiedTimer.current = null;
          }, 3000);
        },
        showCodeResent: () => {
          hideAllAlerts();
          setShowCodeResent(true);
          codeResentTimer.current = window.setTimeout(() => {
            setShowCodeResent(false);
            codeResentTimer.current = null;
          }, 3000);
        },
        showPasswordUpdated: () => {
          hideAllAlerts();
          setShowPasswordUpdated(true);
          passwordUpdatedTimer.current = window.setTimeout(() => {
            setShowPasswordUpdated(false);
            passwordUpdatedTimer.current = null;
          }, 4000);
        },
        showError: (message: string) => {
          hideAllAlerts();
          setErrorMessage(message);
          setShowError(true);
          errorTimer.current = window.setTimeout(() => {
            setShowError(false);
            errorTimer.current = null;
          }, 5000);
        },
        hideAll: hideAllAlerts,
      }),
      [],
    );

    return (
      <>
        {/* Code Sent Alert (bottom-left) */}
        <div
          className={`fixed transition-all duration-500 ease-in-out z-[9999] ${
            showCodeSent
              ? "bottom-6 left-6 opacity-100 translate-y-0"
              : "bottom-6 left-6 opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <Alert className="bg-green-900 border-green-700 text-green-100 shadow-lg min-w-[300px] max-w-sm">
            <Mail className="h-4 w-4" />
            <AlertDescription className="text-sm font-medium">
              {codeSentMessage}
            </AlertDescription>
          </Alert>
        </div>

        {/* Code Verified Alert (bottom-left) */}
        <div
          className={`fixed transition-all duration-500 ease-in-out z-[9999] ${
            showCodeVerified
              ? "bottom-6 left-6 opacity-100 translate-y-0"
              : "bottom-6 left-6 opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <Alert className="bg-blue-900 border-blue-700 text-blue-100 shadow-lg min-w-[300px] max-w-sm">
            <CheckCircle2Icon className="h-4 w-4" />
            <AlertDescription className="text-sm font-medium">
              Code verified successfully!
            </AlertDescription>
          </Alert>
        </div>

        {/* Code Resent Alert (bottom-left) */}
        <div
          className={`fixed transition-all duration-500 ease-in-out z-[9999] ${
            showCodeResent
              ? "bottom-6 left-6 opacity-100 translate-y-0"
              : "bottom-6 left-6 opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <Alert className="bg-yellow-900 border-yellow-700 text-yellow-100 shadow-lg min-w-[300px] max-w-sm">
            <Mail className="h-4 w-4" />
            <AlertDescription className="text-sm font-medium">
              Verification code resent!
            </AlertDescription>
          </Alert>
        </div>

        {/* Password Updated Alert (bottom-left) */}
        <div
          className={`fixed transition-all duration-500 ease-in-out z-[9999] ${
            showPasswordUpdated
              ? "bottom-6 left-6 opacity-100 translate-y-0"
              : "bottom-6 left-6 opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <Alert className="bg-green-900 border-green-700 text-green-100 shadow-lg min-w-[300px] max-w-sm">
            <ShieldCheck className="h-4 w-4" />
            <AlertDescription className="text-sm font-medium">
              Password updated successfully!
            </AlertDescription>
          </Alert>
        </div>

        {/* Error Alert (bottom-left) */}
        <div
          className={`fixed transition-all duration-500 ease-in-out z-[9999] ${
            showError
              ? "bottom-6 left-6 opacity-100 translate-y-0"
              : "bottom-6 left-6 opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <Alert className="bg-red-900 border-red-700 text-red-100 shadow-lg min-w-[300px] max-w-sm">
            <KeyRound className="h-4 w-4" />
            <AlertDescription className="text-sm font-medium">
              {errorMessage}
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  },
);