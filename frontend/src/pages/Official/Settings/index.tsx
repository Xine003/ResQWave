import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function SettingsDispatcher() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col justify-center items-center relative">
      <Button onClick={() => navigate('/visualization')} >Back</Button>
    </div>
  )
}