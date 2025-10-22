import type { InfoBubble, SignalPopover } from './signals';

export type SignalPopupProps = {
    popover: SignalPopover | null;
    setPopover: (p: SignalPopover | null) => void;
    // optional callback invoked when the popover is closed via the UI so the
    // parent can perform cleanup (for example: remove temporary map layers)
    onClose?: () => void;
    // Handler for opening community info sheet
    onOpenCommunityInfo?: () => void;
    // Handler for dispatch rescue action
    onDispatchRescue?: () => void;
    // Info bubble props moved here so the popup component can also render the
    // small 'YOUR COMMUNITY' bubble when no popover is visible.
    infoBubble: InfoBubble | null;
    infoBubbleVisible: boolean;
};