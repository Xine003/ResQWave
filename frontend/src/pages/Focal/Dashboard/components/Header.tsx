import React from 'react';
// React import not required directly here
import { useState } from 'react';
import resqwave_logo from '/Landing/resqwave_logo.png';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs-focal";
import { Popover, PopoverTrigger, PopoverContent, PopoverItem, PopoverSeparator } from "@/components/ui/popover-focal";
import { LogOut, User, BookOpen } from "lucide-react";
import type { HeaderProps } from '../types/header';

export default function Header({ editBoundaryOpen = false, editAboutOpen = false, canSave = false, onSave, onExit, onAboutClick, onRequestDiscard, onTabChange, activeTab = 'community', onAccountSettingsClick, accountSettingsOpen = false, onRequestCloseAccountSettings }: HeaderProps) {
    const navigate = useNavigate();
    const [popoverOpen, setPopoverOpen] = React.useState(false);
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
                    height: "80px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    position: "relative",
                    zIndex: 100,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                    <img src={resqwave_logo} alt="ResQWave Logo" onClick={() => navigate('/')} style={{ height: 32, cursor: 'pointer' }} />
                    <span onClick={() => navigate('/')} style={{ fontWeight: 500, fontSize: "1.25rem", cursor: 'pointer' }}>ResQWave</span>
                    <span style={{ fontWeight: 300, fontSize: "1.13rem", color: "#BABABA", marginLeft: 12 }}>
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
                height: "80px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                position: "relative",
                zIndex: 'var(--z-header)',
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <img src={resqwave_logo} alt="ResQWave Logo" onClick={() => navigate('/')} style={{ height: 30, cursor: 'pointer' }} />
                    <span onClick={() => navigate('/')} style={{ fontWeight: 500, fontSize: "1.25rem", cursor: 'pointer' }}>ResQWave</span>
                </div>
                <Tabs value={activeTab} defaultValue="community" onValueChange={(v) => {
                    // If user is editing, request discard confirmation instead of navigating directly
                    if ((editBoundaryOpen || editAboutOpen) && onRequestDiscard) {
                        onRequestDiscard();
                        return;
                    }
                    // If account settings modal is open, ask parent to confirm/cancel before changing tabs
                    if (accountSettingsOpen && onRequestCloseAccountSettings) {
                        onRequestCloseAccountSettings(() => {
                            onTabChange && onTabChange(v);
                            if (v === 'about') onAboutClick && onAboutClick();
                        });
                        return;
                    }
                    onTabChange && onTabChange(v);
                    if (v === 'about') onAboutClick && onAboutClick();
                }}>
                    <TabsList>
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
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                        <img
                            src="https://avatars.githubusercontent.com/u/1?v=4"
                            alt="Profile"
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: "50%",
                                objectFit: "cover",
                                cursor: "pointer",
                                boxShadow: popoverOpen ? "0 0 0 3px rgba(107, 114, 128, 0.4)" : "none",
                                transition: "box-shadow 0.2s ease",
                            }}
                        />
                    </PopoverTrigger>
                    <PopoverContent align="end" sideOffset={13}>
                        <PopoverItem icon={<User size={16} />} onClick={() => { setPopoverOpen(false); onAccountSettingsClick?.(); }}>
                            Account Settings
                        </PopoverItem>
                        <PopoverItem icon={<BookOpen size={16} />}>
                            Logs
                        </PopoverItem>
                        <PopoverSeparator />
                        <PopoverItem destructive icon={<LogOut size={16} />}>
                            Logout
                        </PopoverItem>
                    </PopoverContent>
                </Popover>
                {/* Account modal is rendered by parent (Dashboard) to allow correct centering over map */}

            </div>
        </header>
    );
}
