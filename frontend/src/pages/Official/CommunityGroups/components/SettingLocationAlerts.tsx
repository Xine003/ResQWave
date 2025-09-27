import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2Icon, Info } from "lucide-react"
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"

export type SettingLocationAlertsHandle = {
	showPinAlert: (text: string) => void
	showLocationSaved: () => void
	showBoundaryHint: () => void
	showBoundaryValid: (msg?: string) => void
	hidePinAlert: () => void
	hideAll: () => void
}

export default forwardRef<SettingLocationAlertsHandle, {}>(function SettingLocationAlerts(_props, ref) {
	// Pin clicked location (bottom center) - persistent until Save
	const [showPin, setShowPin] = useState(false)
	const [pinText, setPinText] = useState("")
	const pinTimer = useRef<number | null>(null)

	// Location saved (bottom left)
	const [showSaved, setShowSaved] = useState(false)
	const savedTimer = useRef<number | null>(null)  

	// Boundary hint (bottom center) - persistent until boundary Save
	const [showHint, setShowHint] = useState(false)

	// Boundaries valid (bottom center)
	const [showValid, setShowValid] = useState(false)
	const [validMsg, setValidMsg] = useState<string>("Boundaries set are valid!")
	const validTimer = useRef<number | null>(null)

	// Clear timers on unmount
	useEffect(() => {
		return () => {
			if (pinTimer.current) window.clearTimeout(pinTimer.current)
			if (savedTimer.current) window.clearTimeout(savedTimer.current)
			if (validTimer.current) window.clearTimeout(validTimer.current)
		}
	}, [])

	useImperativeHandle(ref, () => ({
		showPinAlert: (text: string) => {
			// persist until user clicks Save; no auto-dismiss
			if (pinTimer.current) {
				window.clearTimeout(pinTimer.current)
				pinTimer.current = null
			}
			setPinText(text)
			setShowPin(true)
		},
		showLocationSaved: () => {
			if (savedTimer.current) window.clearTimeout(savedTimer.current)
			// Hide overlapping hints/valid when saved pops
			setShowHint(false)
			setShowValid(false)
			setShowSaved(true)
			savedTimer.current = window.setTimeout(() => {
				setShowSaved(false)
				savedTimer.current = null
			}, 4000)
		},
		showBoundaryHint: () => {
			// persist until boundary Save; no auto-dismiss
			setShowHint(true)
		},
		showBoundaryValid: (msg?: string) => {
			if (validTimer.current) window.clearTimeout(validTimer.current)
			if (msg) setValidMsg(msg)
			// hide the boundary hint when saving boundaries
			setShowHint(false)
			setShowValid(true)
			validTimer.current = window.setTimeout(() => {
				setShowValid(false)
				validTimer.current = null
			}, 2500)
		},
		hidePinAlert: () => {
			setShowPin(false)
		},
		hideAll: () => {
			setShowPin(false)
			setShowSaved(false)
			setShowHint(false)
			setShowValid(false)
		}
	}), [])

		return (
			<>
				<div className={`absolute left-1/2 bottom-[30px] -translate-x-1/2 z-[100000] transition-all duration-200 ease-out ${showPin ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
					<Alert className="min-w-[220px] max-w-[560px] bg-black border border-[#2a2a2a] text-white rounded-md">
						<Info color="#3B82F6" />
						<AlertDescription className="text-[13px] leading-tight whitespace-pre-wrap">{pinText}</AlertDescription>
					</Alert>
				</div>

				<div className={`absolute left-1/2 bottom-[30px] -translate-x-1/2 z-[100000] transition-transform duration-300 ease-out ${showHint ? "translate-y-0" : "translate-y-28"}`}>
					<Alert className="min-w-[420px] max-w-[600px] bg-black border border-[#2a2a2a] text-white rounded-md">
						<Info color="#3B82F6" />
						<AlertDescription className="text-[13px] leading-snug">
							<b>Note:</b> Click on the map to mark the corners of your community boundary. The border will connect automatically.
						</AlertDescription>
					</Alert>
				</div>

				<div className={`absolute left-1/2 bottom-[30px] -translate-x-1/2 z-[100000] transition-all duration-200 ease-out ${showValid ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
					<Alert className="min-w-[220px] max-w-[360px] bg-black border border-[#2a2a2a] text-white rounded-md">
						<CheckCircle2Icon color="#22c55e" />
						<AlertDescription className="text-[13px] leading-tight"><b>Note:</b> {validMsg}</AlertDescription>
					</Alert>
				</div>

				<div className={`absolute left-[30px] bottom-[30px] z-[100000] transition-all duration-300 ease-out ${showSaved ? "translate-x-0 opacity-100" : "-translate-x-40 opacity-0"}`}>
					<Alert className="min-w-[260px] max-w-[520px] bg-black border border-[#2a2a2a] text-white rounded-md">
						<CheckCircle2Icon color="#22c55e" />
						<AlertDescription className="text-[13px] leading-tight">Location set successfully! This is now the terminal's location.</AlertDescription>
					</Alert>
				</div>
			</>
		)
})

