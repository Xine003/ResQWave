import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Home, HomeIcon, Trash2 } from "lucide-react"
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"

export type CommunityGroupAlertsHandle = {
	showCreateSuccess: (groupName: string, temporaryPassword?: string) => void
	showUpdateSuccess: (groupName: string) => void
	showArchiveSuccess: (groupName: string) => void
	showDeleteSuccess: (groupName: string) => void
	showRestoreSuccess: (groupName: string) => void
	showError: (message: string) => void
	showDeleteConfirmation: (groupId: string, groupName: string, onConfirm: () => void) => void
	hideAll: () => void
}

export default forwardRef<CommunityGroupAlertsHandle, {}>(function CommunityGroupAlerts(_props, ref) {
	// Create success alert (bottom left)
	const [showCreate, setShowCreate] = useState(false)
	const [createMessage, setCreateMessage] = useState("")
	const [showTempPassword, setShowTempPassword] = useState(false)
	const [tempPassword, setTempPassword] = useState("")
	const createTimer = useRef<number | null>(null)

	// Update success alert (bottom left)
	const [showUpdate, setShowUpdate] = useState(false)
	const [updateMessage, setUpdateMessage] = useState("")
	const updateTimer = useRef<number | null>(null)

	// Archive success alert (bottom left)
	const [showArchive, setShowArchive] = useState(false)
	const [archiveMessage, setArchiveMessage] = useState("")
	const archiveTimer = useRef<number | null>(null)

	// Delete success alert (bottom left)
	const [showDelete, setShowDelete] = useState(false)
	const [deleteMessage, setDeleteMessage] = useState("")
	const deleteTimer = useRef<number | null>(null)

	// Restore success alert (bottom left)
	const [showRestore, setShowRestore] = useState(false)
	const [restoreMessage, setRestoreMessage] = useState("")
	const restoreTimer = useRef<number | null>(null)

	// Error alert (bottom left)
	const [showError, setShowError] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")
	const errorTimer = useRef<number | null>(null)

	// Delete confirmation dialog (center)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [deleteConfirmId, setDeleteConfirmId] = useState("")
	const [deleteConfirmCallback, setDeleteConfirmCallback] = useState<(() => void) | null>(null)

	// Clear timers on unmount
	useEffect(() => {
		return () => {
			if (createTimer.current) window.clearTimeout(createTimer.current)
			if (updateTimer.current) window.clearTimeout(updateTimer.current)
			if (archiveTimer.current) window.clearTimeout(archiveTimer.current)
			if (deleteTimer.current) window.clearTimeout(deleteTimer.current)
			if (restoreTimer.current) window.clearTimeout(restoreTimer.current)
			if (errorTimer.current) window.clearTimeout(errorTimer.current)
		}
	}, [])

	const hideAllAlerts = () => {
		setShowCreate(false)
		setShowUpdate(false)
		setShowArchive(false)
		setShowDelete(false)
		setShowRestore(false)
		setShowError(false)
		// Clear all timers
		if (createTimer.current) {
			window.clearTimeout(createTimer.current)
			createTimer.current = null
		}
		if (updateTimer.current) {
			window.clearTimeout(updateTimer.current)
			updateTimer.current = null
		}
		if (archiveTimer.current) {
			window.clearTimeout(archiveTimer.current)
			archiveTimer.current = null
		}
		if (deleteTimer.current) {
			window.clearTimeout(deleteTimer.current)
			deleteTimer.current = null
		}
		if (restoreTimer.current) {
			window.clearTimeout(restoreTimer.current)
			restoreTimer.current = null
		}
		if (errorTimer.current) {
			window.clearTimeout(errorTimer.current)
			errorTimer.current = null
		}
	}

	useImperativeHandle(ref, () => ({
		showCreateSuccess: (groupName: string, temporaryPassword?: string) => {
			hideAllAlerts()
			setCreateMessage(`Neighborhood Group "${groupName}" created successfully!`)
			if (temporaryPassword) {
				setTempPassword(temporaryPassword)
				setShowTempPassword(true)
			} else {
				setShowTempPassword(false)
			}
			setShowCreate(true)
			createTimer.current = window.setTimeout(() => {
				setShowCreate(false)
				createTimer.current = null
			}, temporaryPassword ? 8000 : 3000) // Longer duration if showing temp password
		},
		showUpdateSuccess: (groupName: string) => {
			hideAllAlerts()
			setUpdateMessage(`Neighborhood Group "${groupName}" updated successfully!`)
			setShowUpdate(true)
			updateTimer.current = window.setTimeout(() => {
				setShowUpdate(false)
				updateTimer.current = null
			}, 3000)
		},
		showArchiveSuccess: (groupName: string) => {
			hideAllAlerts()
			setArchiveMessage(`Neighborhood Group "${groupName}" archived successfully!`)
			setShowArchive(true)
			archiveTimer.current = window.setTimeout(() => {
				setShowArchive(false)
				archiveTimer.current = null
			}, 3000)
		},
		showDeleteSuccess: (groupName: string) => {
			hideAllAlerts()
			setDeleteMessage(`Neighborhood Group "${groupName}" deleted permanently!`)
			setShowDelete(true)
			deleteTimer.current = window.setTimeout(() => {
				setShowDelete(false)
				deleteTimer.current = null
			}, 3000)
		},
		showRestoreSuccess: (groupName: string) => {
			hideAllAlerts()
			setRestoreMessage(`Neighborhood Group "${groupName}" restored successfully!`)
			setShowRestore(true)
			restoreTimer.current = window.setTimeout(() => {
				setShowRestore(false)
				restoreTimer.current = null
			}, 3000)
		},
		showError: (message: string) => {
			hideAllAlerts()
			setErrorMessage(message)
			setShowError(true)
			errorTimer.current = window.setTimeout(() => {
				setShowError(false)
				errorTimer.current = null
			}, 5000)
		},
		showDeleteConfirmation: (groupId: string, _groupName: string, onConfirm: () => void) => {
			setDeleteConfirmId(groupId)
			setDeleteConfirmCallback(() => onConfirm)
			setShowDeleteConfirm(true)
		},
		hideAll: hideAllAlerts
	}), [])

	return (
		<>
			{/* Create Success Alert - Bottom Left */}
			<div className={`fixed left-[85px] bottom-[30px] z-[100000] transition-all duration-300 ease-out ${showCreate ? "translate-x-0 opacity-100" : "-translate-x-40 opacity-0"}`}>
				<Alert className="min-w-[280px] max-w-[520px] bg-[#171717] border border-[#2a2a2a] text-white rounded-[5px] !items-center !grid-cols-[auto_1fr] !gap-x-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-[5px] bg-green-600/25">
						<Home className="size-5 text-[#22c55e]" />
					</div>
					<AlertDescription className="text-[13px] leading-tight">
						<div>{createMessage}</div>
						{showTempPassword && (
							<div className="mt-2 p-2 bg-blue-600/20 rounded border border-blue-600/30">
								<div className="text-[12px] text-blue-200 mb-1">Temporary Password:</div>
								<div className="font-mono text-[13px] text-blue-100 font-semibold">{tempPassword}</div>
								<div className="text-[11px] text-blue-300 mt-1">Please save this and share with the focal person.</div>
							</div>
						)}
					</AlertDescription>
				</Alert>
			</div>

			{/* Update Success Alert - Bottom Left */}
			<div className={`fixed left-[85px] bottom-[30px] z-[100000] transition-all duration-300 ease-out ${showUpdate ? "translate-x-0 opacity-100" : "-translate-x-40 opacity-0"}`}>
				<Alert className="min-w-[280px] max-w-[520px] bg-[#171717] border border-[#2a2a2a] text-white rounded-[5px] !items-center !grid-cols-[auto_1fr] !gap-x-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-[5px] bg-blue-600/25">
						<HomeIcon className="size-5 text-[#3B82F6]" />
					</div>
					<AlertDescription className="text-[13px] leading-tight">
						{updateMessage}
					</AlertDescription>
				</Alert>
			</div>

			{/* Archive Success Alert - Bottom Left */}
			<div className={`fixed left-[85px] bottom-[30px] z-[100000] transition-all duration-300 ease-out ${showArchive ? "translate-x-0 opacity-100" : "-translate-x-40 opacity-0"}`}>
				<Alert className="min-w-[280px] max-w-[520px] bg-[#171717] border border-[#2a2a2a] text-white rounded-[5px] !items-center !grid-cols-[auto_1fr] !gap-x-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-[5px] bg-orange-600/25">
						<HomeIcon className="size-5 text-[#f97316]" />
					</div>
					<AlertDescription className="text-[13px] leading-tight">
						{archiveMessage}
					</AlertDescription>
				</Alert>
			</div>

			{/* Delete Success Alert - Bottom Left */}
			<div className={`fixed left-[85px] bottom-[30px] z-[100000] transition-all duration-300 ease-out ${showDelete ? "translate-x-0 opacity-100" : "-translate-x-40 opacity-0"}`}>
				<Alert className="min-w-[280px] max-w-[520px] bg-[#171717] border border-[#2a2a2a] text-white rounded-[5px] !items-center !grid-cols-[auto_1fr] !gap-x-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-[5px] bg-red-600/25">
						<Trash2 className="size-5 text-[#ef4444]" />
					</div>
					<AlertDescription className="text-[13px] leading-tight">
						{deleteMessage}
					</AlertDescription>
				</Alert>
			</div>

			{/* Restore Success Alert - Bottom Left */}
			<div className={`fixed left-[85px] bottom-[30px] z-[100000] transition-all duration-300 ease-out ${showRestore ? "translate-x-0 opacity-100" : "-translate-x-40 opacity-0"}`}>
				<Alert className="min-w-[280px] max-w-[520px] bg-[#171717] border border-[#2a2a2a] text-white rounded-[5px] !items-center !grid-cols-[auto_1fr] !gap-x-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-[5px] bg-green-600/25">
						<HomeIcon className="size-5 text-[#22c55e]" />
					</div>
					<AlertDescription className="text-[13px] leading-tight">
						{restoreMessage}
					</AlertDescription>
				</Alert>
			</div>

			{/* Error Alert - Bottom Left */}
			<div className={`fixed left-[85px] bottom-[30px] z-[100000] transition-all duration-300 ease-out ${showError ? "translate-x-0 opacity-100" : "-translate-x-40 opacity-0"}`}>
				<Alert className="min-w-[280px] max-w-[600px] bg-[#171717] border border-red-600/50 text-white rounded-[5px] !items-center !grid-cols-[auto_1fr] !gap-x-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-[5px] bg-red-600/25">
						<Trash2 className="size-5 text-[#ef4444]" />
					</div>
					<AlertDescription className="text-[13px] leading-tight text-red-200">
						<span className="font-medium">Error:</span> {errorMessage}
					</AlertDescription>
				</Alert>
			</div>

			{/* Delete Confirmation Dialog - Center */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/50">
					<div className="bg-[#171717] border border-[#2a2a2a] rounded-[5px] p-6 max-w-md w-full mx-4 shadow-xl">
						<div className="flex items-start gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-[5px] bg-red-600/25 flex-shrink-0">
								<Trash2 className="size-6 text-[#ef4444]" />
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-white mb-2">Delete Permanently</h3>
								<p className="text-[14px] text-[#a1a1a1] mb-1">
									Are you sure you want to permanently delete focal person <span className="text-white font-semibold">{deleteConfirmId}</span>?
								</p>
								<p className="text-[13px] text-[#a1a1a1]">
									This action cannot be undone.
								</p>
							</div>
						</div>
						<div className="flex justify-end gap-3 mt-6">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setShowDeleteConfirm(false)
									setDeleteConfirmCallback(null)
								}}
								className="bg-transparent border-[#404040] text-white hover:bg-[#262626]"
							>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={() => {
									if (deleteConfirmCallback) {
										deleteConfirmCallback()
									}
									setShowDeleteConfirm(false)
									setDeleteConfirmCallback(null)
								}}
								className="bg-[#ef4444] hover:bg-[#dc2626] text-white"
							>
								Delete
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	)
})
