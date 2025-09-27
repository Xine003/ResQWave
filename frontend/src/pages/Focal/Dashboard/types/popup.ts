import type { SignalPopover, InfoBubble } from './signalsdata';

export type SignalPopupProps = {
    popover: SignalPopover | null;
    setPopover: (p: SignalPopover | null) => void;
    setEditBoundaryOpen: (v: boolean) => void;
    // optional callback invoked when the popover is closed via the UI so the
    // parent can perform cleanup (for example: remove temporary map layers)
    onClose?: () => void;
    // Info bubble props moved here so the popup component can also render the
    // small 'YOUR COMMUNITY' bubble when no popover is visible.
    infoBubble: InfoBubble | null;
    infoBubbleVisible: boolean;
};
