// React import not required directly here
import resqwave_logo from '/Landing/resqwave_logo.png';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { LogOut, User, BookOpen } from "lucide-react";
import type { HeaderProps } from '../types/header';

export default function Header({ editBoundaryOpen = false, canSave = false, onSave, onExit, onAboutClick, onTabChange, activeTab = 'community' }: HeaderProps) {
    // When editing is active, render the editing header UI (previously inline in index.tsx)
    if (editBoundaryOpen) {
        return (
            <header
                style={{
                    width: "100%",
                    background: "#171717",
                    color: "#fff",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    padding: "0 3rem",
                    height: "85px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    position: "relative",
                    zIndex: 100,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                    <img src={resqwave_logo} alt="ResQWave Logo" style={{ height: 32 }} />
                    <span style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: 1 }}>ResQWave</span>
                    <span style={{ fontWeight: 300, fontSize: "1.13rem", color: "#BABABA", marginLeft: 12, letterSpacing: 0.5 }}>
                        Editing Community Boundary ...
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <button
                        disabled={!canSave}
                        onClick={onSave}
                        style={{
                            padding: "8px 18px",
                            borderRadius: 3,
                            background: canSave ? "#fff" : "#222",
                            color: canSave ? "#222" : "#aaa",
                            border: "none",
                            fontWeight: 600,
                            fontSize: "1rem",
                            marginRight: 8,
                            cursor: canSave ? "pointer" : "not-allowed",
                            boxShadow: canSave ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                        }}
                    >
                        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="9 12 12 15 16 10" />
                            </svg>
                            SAVE
                        </span>
                    </button>
                    <button
                        onClick={onExit}
                        style={{
                            padding: "8px 18px",
                            borderRadius: 3,
                            background: "transparent",
                            color: "#fff",
                            border: "1px solid #fff",
                            fontWeight: 600,
                            fontSize: "1rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                        EXIT
                    </button>
                </div>
            </header>
        );
    }

    // Default header (non-editing)
    return (
        <header
            style={{
                width: "100%",
                background: "#171717",
                color: "#fff",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                padding: "0 3rem",
                height: "85px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                position: "relative",
                zIndex: 'var(--z-header)',
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <img src={resqwave_logo} alt="ResQWave Logo" style={{ height: 32 }} />
                    <span style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: 1 }}>ResQWave</span>
                </div>
                <Tabs value={activeTab} defaultValue="community" style={{ background: "transparent" }} onValueChange={(v) => { onTabChange && onTabChange(v); if (v === 'about') onAboutClick && onAboutClick(); }}>
                    <TabsList
                        style={{
                            background: "#222",
                            borderRadius: 4,
                            padding: "0.25rem 0.3rem",
                            display: "flex",
                            height: 50,
                            gap: "0.5rem",
                        }}
                    >
                        <TabsTrigger
                            value="community"
                            style={{
                                color: "#fff",
                                fontSize: "1rem",
                                padding: "0.15rem 1.5rem",
                                borderRadius: 4,
                                transition: "background 0.2s",
                                cursor: 'pointer'
                            }}
                            className="tab-trigger"
                            onMouseEnter={e => (e.currentTarget.style.background = '#333333')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >Community Map</TabsTrigger>
                        <TabsTrigger
                            value="about"
                            style={{
                                color: "#fff",
                                fontSize: "1rem",
                                padding: "0.5rem 1.5rem",
                                borderRadius: 4,
                                transition: "background 0.2s",
                                cursor: 'pointer'
                            }}
                            className="tab-trigger"
                            onMouseEnter={e => (e.currentTarget.style.background = '#333333')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >About Your Community</TabsTrigger>
                        <TabsTrigger
                            value="history"
                            style={{
                                color: "#fff",
                                fontSize: "1rem",
                                padding: "0.5rem 1.5rem",
                                borderRadius: 4,
                                transition: "background 0.2s",
                                cursor: 'pointer'
                            }}
                            className="tab-trigger"
                            onMouseEnter={e => (e.currentTarget.style.background = '#333333')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >History</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <Popover>
                    <PopoverTrigger asChild>
                        <img
                            src="https://avatars.githubusercontent.com/u/1?v=4"
                            alt="Profile"
                            style={{
                                width: 43,
                                height: 43,
                                borderRadius: "50%",
                                objectFit: "cover",
                                cursor: "pointer",
                            }}
                        />
                    </PopoverTrigger>
                    <PopoverContent align="end" style={{ background: "#181818", color: "#fff", minWidth: 200, borderRadius: 5, boxShadow: "0 4px 24px rgba(0,0,0,0.18)", padding: "1rem 0", marginTop: 13 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <button style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: "#fff", fontSize: 16, padding: "0.5rem 1.5rem", cursor: "pointer" }}>
                                <User size={18} /> Account Settings
                            </button>
                            <button style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: "#fff", fontSize: 16, padding: "0.5rem 1.5rem", cursor: "pointer" }}>
                                <BookOpen size={18} /> Logs
                            </button>
                            <hr style={{ border: "none", borderTop: "1px solid #222", margin: "0.5rem 0" }} />
                            <button style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: "#F92626", fontSize: 16, padding: "0.5rem 1.5rem", cursor: "pointer", fontWeight: 500 }}>
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </header>
    );
}
