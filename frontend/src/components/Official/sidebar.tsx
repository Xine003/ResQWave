import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip-white";
import { useAuth } from "@/contexts/AuthContext";
import { ClipboardCheck, Radio, RadioReceiver, UserCog, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import SettingsPopover from "./settingsPopover";
import resqwave_logo from "/Landing/resqwave_logo.png";

const baseNavigationItems = [
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

const adminOnlyItems = [
  {
    icon: UserCog,
    label: "Dispatchers",
    path: "/dispatchers",
  },
  {
    icon: RadioReceiver,
    label: "Terminal",
    path: "/terminal",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Safely get auth context - may be null if outside provider
  let isAdminUser = false;
  try {
    const { isAdmin } = useAuth();
    isAdminUser = isAdmin();
  } catch (error) {
    // useAuth will throw if outside provider, fallback to checking localStorage
    const storedUser = localStorage.getItem('resqwave_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        isAdminUser = user.role === 'admin';
      } catch {
        isAdminUser = false;
      }
    }
  }

  // Combine navigation items based on user role
  const navigationItems = [
    ...baseNavigationItems,
    ...(isAdminUser ? adminOnlyItems : [])
  ];

  return (
    <>
      <aside className={`hidden md:inline-flex h-screen px-[15px] py-5 flex-col justify-between items-center flex-shrink-0 border-r-[1.5px] border-[#404040] bg-[#171717] z-40`}>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`w-[50px] h-[50px] flex my-0.5 items-center justify-center gap-2.5 flex-shrink-0 aspect-square rounded-[5px] border-[1.5px] border-[#404040] transition-colors ${
                          isActive
                            ? "bg-white text-black"
                            : "bg-[#171717] text-white/60 hover:bg-[#302F2F] hover:text-white"
                        }`}
                        onClick={() => navigate(item.path)}
                        aria-label={item.label}
                      >
                        <Icon className="w-6 h-6" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="relative flex flex-col items-center">
          <SettingsPopover
            isActive={location.pathname === "/settings-dispatcher"} 
            isMobile={false}
          />
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
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <button
                  className={`flex flex-col items-center justify-center transition-colors ${
                    isActive
                      ? "text-black bg-white"
                      : "text-white/60 hover:text-white"
                  }`}
                  onClick={() => navigate(item.path)}
                  aria-label={item.label}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] mt-1">{item.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
        <div className="relative flex flex-col items-center">
          <SettingsPopover
            isActive={location.pathname === "/settings-dispatcher"} 
            isMobile={true}
          />
        </div>
      </nav>
    </>
  );
}