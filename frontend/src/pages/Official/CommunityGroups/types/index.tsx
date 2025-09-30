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
  onEdit?: (group: CommunityGroup) => void
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
  altName: string
  altContactNumber: string
  altEmail: string
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
  // Frontend-only persisted map selections
  // Top-level address from the Setting Location flow
  address?: string
  // [lng, lat] for pinned terminal location
  coordinates?: number[]
  // GeoJSON Feature for boundary (LineString)
  boundary?: {
    type: "Feature"
    properties: Record<string, unknown>
    geometry: { type: "LineString"; coordinates: number[][] }
  }
  focalPerson: FocalPerson
  alternativeFocalPerson: AlternativeFocalPerson
}

export interface CommunityGroupDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (infoData: CommunityGroupDetails) => void
  editData?: CommunityGroupDetails // Data to pre-fill when editing
  isEditing?: boolean // Flag to indicate edit mode
}

export interface CommunityGroupInfoSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  communityData?: CommunityGroupDetails
}
