import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";


interface SettingsPopoverProps {
  onClose?: () => void;
}

export default function SettingsPopover({ onClose }: SettingsPopoverProps) {
    const navigate = useNavigate();
  return (
    <div className="w-64 max-w-[100vw] max-h-[100vh] overflow-auto p-6 rounded-[5px] shadow-lg border border-[#404040] bg-[#171717] text-white">
      <div className="flex items-center gap-3 mb-4">
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
      <hr className="border-[#404040] mb-2" />

      <div className="flex flex-col">
        <Button
          variant="ghost"
          className="flex text-[16px] items-center gap-3 justify-start w-full text-left hover:bg-gray-800 rounded-lg px-4 py-2"
          onClick={onClose}
        >
          <UserCog className="w-12 h-12" />
          Account Settings
        </Button>

        <Button
          variant="ghost"
          className="flex text-[16px] items-center gap-3 justify-start w-full text-left hover:bg-gray-800 rounded-lg px-4 py-2"
          onClick={onClose}
        >
          <BookOpen className="w-12 h-12" />
          Logs
        </Button>

        <hr className="border-[#404040] my-4" />

        <Button
          variant="ghost"
          className="flex text-[16px] items-center gap-3 justify-start w-full text-left hover:bg-gray-800 rounded-lg px-4 py-2 text-red-500"
          onClick={() => navigate('/login-dispatcher')} 
        >
          <LogOut className="w-12 h-12" />
          Logout
        </Button>
      </div>
    </div>
  );
}