import { Popover, PopoverContent, PopoverItem, PopoverSeparator, PopoverTrigger } from "@/components/ui/popover-focal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip-white";
import { BookOpen, LogOut, Settings, UserCog } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface SettingsPopoverProps {
  isActive?: boolean;
  isMobile?: boolean;
}

export default function SettingsPopover({ isActive = false, isMobile = false }: SettingsPopoverProps) {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleClose = () => setOpen(false);

  const buttonClass = isMobile 
    ? `flex flex-col items-center justify-center transition-colors ${
        isActive ? "text-black bg-white" : "text-white/60 hover:text-white"
      }`
    : `w-[50px] h-[50px] flex items-center justify-center gap-2.5 flex-shrink-0 aspect-square rounded-[5px] border-[1.5px] border-[#404040] transition-colors ${
        isActive ? "bg-white text-black" : "bg-[#171717] text-white/60 hover:bg-[#302F2F] hover:text-white"
      }`;

  const tooltipSide = isMobile ? "top" : "right";
  const popoverSide = isMobile ? "top" : "right";
  const popoverAlign = isMobile ? "center" : "end";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              className={buttonClass}
              aria-label="Settings"
              type="button"
            >
              <Settings className="w-6 h-6" />
              {isMobile && <span className="text-[10px] mt-1">Settings</span>}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide} sideOffset={8}>
          Settings
        </TooltipContent>
      </Tooltip>
      <PopoverContent 
        align={popoverAlign} 
        side={popoverSide} 
        sideOffset={8}
        className="rounded-[5px]"
      >
        <div className="flex items-center rounded-[5px] gap-3 mb-4">
          <img
            src="https://i.pravatar.cc/100?img=12"
            alt="User Avatar"
            className="h-12 w-12 rounded-full"
          />
          <div className="flex flex-col">
            <span className="font-semibold">Rodel Sustiguer</span>
            <span className="text-gray-400 text-sm">DISPATCH01</span>
          </div>
        </div>
        <PopoverSeparator />
        <PopoverItem icon={<UserCog size={16} />} onClick={handleClose}>
          Account Settings
        </PopoverItem>
        <PopoverItem icon={<BookOpen size={16} />} onClick={handleClose}>
          Logs
        </PopoverItem>
        <PopoverItem 
          destructive 
          icon={<LogOut size={16} />} 
          onClick={() => {
            handleClose();
            navigate('/login-dispatcher');
          }}
        >
          Logout
        </PopoverItem>
      </PopoverContent>
    </Popover>
  );
}