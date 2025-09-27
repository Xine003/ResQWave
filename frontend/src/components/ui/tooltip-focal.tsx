import React, { useState, useRef, useEffect } from "react";

type TooltipProps = {
    content: React.ReactNode;
    side?: "top" | "bottom" | "left" | "right";
    children: React.ReactElement;
};

export default function Tooltip({ content, side = "top", children }: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    // small delay so it behaves nicer on hover
    useEffect(() => {
        let id: number | undefined;
        if (visible) {
            id = window.setTimeout(() => { }, 0);
        }
        return () => { if (id) window.clearTimeout(id); };
    }, [visible]);

    const placementStyle: React.CSSProperties = (() => {
        switch (side) {
            case "left":
                return { right: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" };
            case "right":
                return { left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" };
            case "bottom":
                return { top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" };
            case "top":
            default:
                return { bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" };
        }
    })();

    return (
        <div
            ref={wrapperRef}
            style={{ display: "inline-block", position: "relative" }}
            onMouseEnter={() => setVisible(true)}
            onFocus={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onBlur={() => setVisible(false)}
        >
            {children}
            <div
                aria-hidden={!visible}
                style={{
                    position: "absolute",
                    // allow the tooltip to appear above modal overlays
                    pointerEvents: "auto",
                    whiteSpace: "nowrap",
                    zIndex: 100000,
                    transition: "opacity 140ms cubic-bezier(.2,.9,.3,1), transform 140ms cubic-bezier(.2,.9,.3,1)",
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(3px)',
                    ...placementStyle,
                }}
            >
                {/* Render the content provided — visual design should be supplied by the caller when needed */}
                <div style={{ display: 'inline-block' }}>{content}</div>
            </div>
        </div>
    );
}
