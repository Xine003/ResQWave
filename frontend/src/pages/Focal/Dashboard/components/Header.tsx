import React from "react";
import resqwave_logo from '/Landing/resqwave_logo.png';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { LogOut, User, BookOpen } from "lucide-react";

export default function Header() {
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
                zIndex: 10,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <img src={resqwave_logo} alt="ResQWave Logo" style={{ height: 32 }} />
                    <span style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: 1 }}>ResQWave</span>
                </div>
                <Tabs defaultValue="community" style={{ background: "transparent" }}>
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
                            }}
                            className="tab-trigger"
                        >Community Map</TabsTrigger>
                        <TabsTrigger
                            value="about"
                            style={{
                                color: "#fff",
                                fontSize: "1rem",
                                padding: "0.5rem 1.5rem",
                                borderRadius: 4,
                                transition: "background 0.2s",
                            }}
                            className="tab-trigger"
                        >About Your Community</TabsTrigger>
                        <TabsTrigger
                            value="history"
                            style={{
                                color: "#fff",
                                fontSize: "1rem",
                                padding: "0.5rem 1.5rem",
                                borderRadius: 4,
                                transition: "background 0.2s",
                            }}
                            className="tab-trigger"
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
                                width: 36,
                                height: 36,
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
