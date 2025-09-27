import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

type PortalProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Portal> & {
    container?: HTMLElement | null;
    zIndex?: number | string;
};

export const PopoverContent = React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & PortalProps
>(function PopoverContent({ className, align = "center", sideOffset = 8, container, zIndex, style, ...props }, ref) {
    // prefer an explicit zIndex prop, otherwise fall back to the CSS variable --z-popover
    const resolvedZ = zIndex !== undefined ? zIndex : 'var(--z-popover)';
    const mergedStyle = { ...(style as React.CSSProperties | undefined), zIndex: resolvedZ } as React.CSSProperties;

    return (
        <PopoverPrimitive.Portal container={container ?? undefined}>
            <PopoverPrimitive.Content
                ref={ref}
                align={align}
                sideOffset={sideOffset}
                className={
                    "rounded-md border border-white/10 bg-neutral-900 text-white shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95" +
                    (className ? " " + className : "")
                }
                style={mergedStyle}
                {...props}
            />
        </PopoverPrimitive.Portal>
    );
});


