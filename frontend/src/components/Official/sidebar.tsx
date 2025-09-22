import { ClipboardCheck, Radio, Settings, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
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

  return (
    <>
      <aside className={`hidden md:inline-flex h-screen px-[17px] py-7 flex-col justify-between items-center flex-shrink-0 border-r-[1.5px] border-[#404040] bg-[#171717]`}>     
        <div className="flex items-center justify-center">
          <img src={resqwave_logo} alt=""  className="h-10"/>
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
                  <button
                    className={`w-[60px] h-[60px] flex my-1.5 items-center justify-center gap-2.5 flex-shrink-0 aspect-square rounded-[5px] border-[1.5px] border-[#404040] transition-colors ${
                      isActive
                        ? "bg-white text-black"
                        : "bg-[#171717] text-white/60 hover:bg-[#302F2F] hover:text-white"
                    }`}
                    title={item.label}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="w-7 h-7" />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div>
          <button
            className={`w-[60px] h-[60px] flex items-center justify-center gap-2.5 flex-shrink-0 aspect-square rounded-[5px] border-[1.5px] border-[#404040] transition-colors ${
              location.pathname === "/settings-dispatcher"
                ? "bg-white text-black"
                : "bg-[#171717] text-white/60 hover:bg-[#302F2F] hover:text-white"
            }`}
            title="Settings"
            onClick={() => navigate("/settings-dispatcher")}
          >
            <Settings className="w-7 h-7" />
          </button>
        </div>
      </aside>

      <nav className={`fixed md:hidden bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 border-t border-[#404040] bg-[#171717]`}>
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          // Visualization is active for /visualization and /tabular routes
          const isActive =
            item.path === "/visualization"
              ? (location.pathname.startsWith("/visualization") || location.pathname.startsWith("/tabular"))
              : location.pathname === item.path;
          return (
            <button
              key={index}
              className={`flex flex-col items-center justify-center transition-colors ${
                isActive
                  ? "text-black bg-white"
                  : "text-white/60 hover:text-white"
              }`}
              title={item.label}
              onClick={() => navigate(item.path)}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          );
        })}
        <button
          className={`flex flex-col items-center justify-center transition-colors ${
            location.pathname === "/settings-dispatcher"
              ? "text-black bg-white"
              : "text-white/60 hover:text-white"
          }`}
          title="Settings"
          onClick={() => navigate("/settings-dispatcher")}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] mt-1">Settings</span>
        </button>
      </nav>
    </>
  )
}