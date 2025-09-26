import type { SignalPopover, InfoBubble } from './signals';

export type SignalPopupProps = {
    popover: SignalPopover | null;
    setPopover: (p: SignalPopover | null) => void;
    setEditBoundaryOpen: (v: boolean) => void;
    // Info bubble props moved here so the popup component can also render the
    // small 'YOUR COMMUNITY' bubble when no popover is visible.
    infoBubble: InfoBubble | null;
    infoBubbleVisible: boolean;
};
