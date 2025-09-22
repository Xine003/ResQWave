import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function Tabular() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col justify-center items-center relative">
      <h1>Focal Landing Page</h1>
      <Button onClick={() => navigate('/visualization')} >Back</Button>
    </div>
  )
}