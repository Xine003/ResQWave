// Centralized types for CommunityGroups feature

import type { ColumnDef } from "@tanstack/react-table"

// Table row model used by the listing table
export type TerminalStatus = "ONLINE" | "OFFLINE" | "N/A"

export type CommunityGroup = {
  id: string
  name: string
  status: TerminalStatus
  focalPerson: string
  contactNumber: string
  address: string
  registeredAt: string
}

export interface CommunityColumnsOptions {
  onMoreInfo: (group: CommunityGroup) => void
  onArchive?: (group: CommunityGroup) => void
}

// Props for the generic data table component
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
}

// Close (discard) dialog props
export type CloseCreateDialogProps = {
  open: boolean
  onOpenChange?: (open: boolean) => void
  onCancel?: () => void
  onDiscard: () => void
  title?: string
  description?: string
  cancelLabel?: string
  discardLabel?: string
}

// Detailed community group information used by drawer/info sheet
export interface FocalPerson {
  name: string
  photo?: string
  contactNumber: string
  email: string
  houseAddress: string
  coordinates: string
}

export interface AlternativeFocalPerson {
  name: string
  contactNumber: string
  email: string
}

export interface CommunityGroupDetails {
  name: string
  terminalId: string
  communityId: string
  individuals: number
  families: number
  kids: number
  seniors: number
  pwds: number
  pregnantWomen: number
  notableInfo: string[]
  focalPerson: FocalPerson
  alternativeFocalPerson: AlternativeFocalPerson
}

export interface CommunityGroupDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (infoData: CommunityGroupDetails) => void
}

export interface CommunityGroupInfoSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  communityData?: CommunityGroupDetails
}
