import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

type PortalProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Portal> & {
    container?: HTMLElement | null;
};

export const PopoverContent = React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & PortalProps
>(function PopoverContent({ className, align = "center", sideOffset = 8, container, ...props }, ref) {
    return (
        <PopoverPrimitive.Portal container={container ?? undefined}>
            <PopoverPrimitive.Content
                ref={ref}
                align={align}
                sideOffset={sideOffset}
                className={
                    "z-50 rounded-md border border-white/10 bg-neutral-900 text-white shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95" +
                    (className ? " " + className : "")
                }
                {...props}
            />
        </PopoverPrimitive.Portal>
    );
});


