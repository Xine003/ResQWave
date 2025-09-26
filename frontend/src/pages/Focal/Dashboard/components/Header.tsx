import React from "react";
import resqwave_logo from '/Landing/resqwave_logo.png';

const navItems = [
    { label: "Community Map", href: "#" },
    { label: "About Your Community", href: "#" },
    { label: "History", href: "#" },
];

export default function Header() {
    return (
        <header
            style={{
                width: "100%",
                background: "#262626",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 2rem",
                height: "64px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                position: "relative",
                zIndex: 10,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <img src={resqwave_logo} alt="ResQWave Logo" style={{ height: 32 }} />
                <span style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: 1 }}>ResQWave</span>
            </div>
            <nav style={{ display: "flex", gap: "1rem" }}>
                {navItems.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        style={{
                            color: "#fff",
                            background: "#333",
                            borderRadius: "6px",
                            padding: "0.5rem 1rem",
                            textDecoration: "none",
                            fontWeight: 500,
                            fontSize: "1rem",
                            transition: "background 0.2s",
                            border: "none",
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = "#444")}
                        onMouseOut={e => (e.currentTarget.style.background = "#333")}
                    >
                        {item.label}
                    </a>
                ))}
            </nav>
            <div style={{ display: "flex", alignItems: "center" }}>
                <img
                    src="https://avatars.githubusercontent.com/u/1?v=4"
                    alt="Profile"
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border: "2px solid #fff",
                        objectFit: "cover",
                    }}
                />
            </div>
        </header>
    );
}
