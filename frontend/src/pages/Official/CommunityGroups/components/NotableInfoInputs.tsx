import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"

interface NotableInfoInputsProps {
  notableInfoList: string[]
  onChange: (list: string[]) => void
}

export const NotableInfoInputs = ({ notableInfoList, onChange }: NotableInfoInputsProps) => {
  const addNotableInfo = () => {
    console.log("🆕 Adding new notable info field")
    const newList = [...notableInfoList, ""]
    onChange(newList)
  }

  const removeNotableInfo = (index: number) => {
    console.log(`🗑️ Removing notable info at index ${index}`)
    if (notableInfoList.length === 1) {
      // If only one item, clear it instead of removing
      onChange([""])
    } else {
      const newList = notableInfoList.filter((_, i) => i !== index)
      onChange(newList)
    }
  }

  const updateNotableInfo = (index: number, value: string) => {
    console.log(`✏️ Updating notable info at index ${index}: "${value}"`)
    const newList = [...notableInfoList]
    newList[index] = value
    onChange(newList)
  }

  return (
    <div className="space-y-3">
      {notableInfoList.map((info, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder={`Notable information ${index + 1}`}
            value={info}
            onChange={(e) => updateNotableInfo(index, e.target.value)}
            className="bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeNotableInfo(index)}
            className="p-2 h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200"
            aria-label={`Remove notable information ${index + 1}`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addNotableInfo}
        className="w-full bg-transparent border-[#2a2a2a] text-white hover:bg-[#2a2a2a] hover:text-white transition-colors duration-200 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Notable Information
      </Button>
    </div>
  )
}