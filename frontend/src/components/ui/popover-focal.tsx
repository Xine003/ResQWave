import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Separator } from "./separator";

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
    const resolvedZ = zIndex !== undefined ? zIndex : 9999;
    const mergedStyle = { ...(style as React.CSSProperties | undefined), zIndex: resolvedZ } as React.CSSProperties;

    return (
        <PopoverPrimitive.Portal container={container ?? undefined}>
            <PopoverPrimitive.Content
                ref={ref}
                align={align}
                sideOffset={sideOffset}
                className={
                    "bg-[#181818] text-white rounded-md shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-[#404040] outline-none min-w-[180px] py-3 px-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95" +
                    (className ? " " + className : "")
                }
                style={mergedStyle}
                {...props}
            />
        </PopoverPrimitive.Portal>
    );
});

// PopoverItem component for consistent menu item styling
export const PopoverItem = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<"button"> & {
        destructive?: boolean;
        icon?: React.ReactNode;
    }
>(function PopoverItem({ className, destructive, icon, children, ...props }, ref) {
    return (
        <button
            ref={ref}
            className={
                `flex items-center gap-3 w-full px-3 py-2 text-sm font-normal transition-colors rounded-md ${
                    destructive 
                        ? "text-red-500 hover:bg-red-500/10 hover:text-red-400" 
                        : "text-white hover:bg-white/10"
                }` + (className ? " " + className : "")
            }
            {...props}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
        </button>
    );
});

// PopoverSeparator using shadcn Separator
export const PopoverSeparator = React.forwardRef<
    React.ElementRef<typeof Separator>,
    React.ComponentPropsWithoutRef<typeof Separator>
>(function PopoverSeparator({ className, ...props }, ref) {
    return (
        <Separator
            ref={ref}
            className={
                "my-2" + (className ? " " + className : "")
            }
            {...props}
        />
    );
});


