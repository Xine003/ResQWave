import { ClipboardCheck, Radio, Settings, Users } from "lucide-react";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SettingsPopover from "./settingsPopover";
import resqwave_logo from "/Landing/resqwave_logo.png";

const navigationItems = [
  {
    icon: Radio,
    label: "Visualization",
    path: "/visualization",
  },
  {
    icon: ClipboardCheck,
    label: "Reports",
    path: "/reports",
  },
  {
    icon: Users,
    label: "Community Groups",
    path: "/community-groups",
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const handleSettingsClick = () => setSettingsOpen((open) => !open);
  const handlePopoverClose = () => setSettingsOpen(false);

  return (
    <>
      <aside className={`hidden md:inline-flex h-screen px-[17px] py-7 flex-col justify-between items-center flex-shrink-0 border-r-[1.5px] border-[#404040] bg-[#171717]`}>
        <div className="flex items-center justify-center">
          <img src={resqwave_logo} alt="" className="h-10" />
        </div>

        <nav className="flex flex-col items-center flex-1 w-full py-3.5">
          <ul className="space-y-2 mt-8 w-full flex flex-col items-center">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/visualization"
                  ? (location.pathname.startsWith("/visualization") || location.pathname.startsWith("/tabular"))
                  : location.pathname === item.path;
              return (
                <li key={index}>
                  <div className="relative group">
                    <button
                      className={`w-[60px] h-[60px] flex my-1.5 items-center justify-center gap-2.5 flex-shrink-0 aspect-square rounded-[5px] border-[1.5px] border-[#404040] transition-colors ${
                        isActive
                          ? "bg-white text-black"
                          : "bg-[#171717] text-white/60 hover:bg-[#302F2F] hover:text-white"
                      }`}
                      onClick={() => navigate(item.path)}
                    >
                      <Icon className="w-7 h-7" />
                    </button>
                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-5 py-2 rounded-[5px] bg-black bg-opacity-60 text-white text-base opacity-0 group-hover:opacity-70 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg flex items-center">
                      <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-black border-r-opacity-60"></span>
                      {item.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="relative flex flex-col items-center">
          <button
            ref={buttonRef}
            className={`w-[60px] h-[60px] flex items-center justify-center gap-2.5 flex-shrink-0 aspect-square rounded-[5px] border-[1.5px] border-[#404040] transition-colors ${
              location.pathname === "/settings-dispatcher"
                ? "bg-white text-black"
                : "bg-[#171717] text-white/60 hover:bg-[#302F2F] hover:text-white"
            }`}
            aria-label="Settings"
            type="button"
            onClick={handleSettingsClick}
          >
            <Settings className="w-7 h-7" />
          </button>
          {/* Popover */}
          {settingsOpen && (
            <div
              ref={popoverRef}
              className="absolute left-full bottom-0 ml-4 z-50"
            >
              <SettingsPopover onClose={handlePopoverClose} />
            </div>
          )}
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-5 py-2 rounded-lg bg-black bg-opacity-80 text-white text-base font-semibold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg flex items-center">
            <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-black border-r-opacity-80"></span>
            Settings
          </span>
        </div>
      </aside>

      <nav className={`fixed md:hidden bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 border-t border-[#404040] bg-[#171717]`}>
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/visualization"
              ? (location.pathname.startsWith("/visualization") || location.pathname.startsWith("/tabular"))
              : location.pathname === item.path;
          return (
            <div key={index} className="relative group">
              <button
                className={`flex flex-col items-center justify-center transition-colors ${
                  isActive
                    ? "text-black bg-white"
                    : "text-white/60 hover:text-white"
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] mt-1">{item.label}</span>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-5 py-2 rounded-lg bg-black bg-opacity-60 text-white text-base font-semibold opacity-0 group-hover:opacity-80 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg flex items-center">
                <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-black border-t-opacity-80"></span>
                {item.label}
              </span>
            </div>
          );
        })}
        <div className="relative flex flex-col items-center">
          <button
            ref={buttonRef}
            className={`flex flex-col items-center justify-center transition-colors ${
              location.pathname === "/settings-dispatcher"
                ? "text-black bg-white"
                : "text-white/60 hover:text-white"
            }`}
            aria-label="Settings"
            type="button"
            onClick={handleSettingsClick}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] mt-1">Settings</span>
          </button>
          {settingsOpen && (
            <div
              ref={popoverRef}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
            >
              <SettingsPopover onClose={handlePopoverClose} />
            </div>
          )}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-5 py-2 rounded-lg bg-black bg-opacity-80 text-white text-base font-semibold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg flex items-center">
            <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-black border-t-opacity-80"></span>
            Settings
          </span>
        </div>
      </nav>
    </>
  );
}