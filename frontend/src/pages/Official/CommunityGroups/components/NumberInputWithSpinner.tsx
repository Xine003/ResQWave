import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface NumberInputWithSpinnerProps {
  value: number
  onChange: (value: string) => void
  min?: number
  step?: number
  ariaLabel?: string
  className?: string
}

export const NumberInputWithSpinner = ({
  value,
  onChange,
  min = 0,
  step = 1,
  ariaLabel,
  className = "",
}: NumberInputWithSpinnerProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const repeatRef = useRef<number | null>(null)
  const [isIncrementing, setIsIncrementing] = useState(false)
  const [isDecrementing, setIsDecrementing] = useState(false)
  const [localValue, setLocalValue] = useState(String(value || 0))
  const [isFocused, setIsFocused] = useState(false)

  // Sync local value with external value only when not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(String(value || 0))
    }
  }, [value, isFocused])

  const inc = () => {
    const curr = Number.isFinite(value) ? value : 0
    const next = Math.max(min, curr + step)
    const nextStr = String(next)
    setLocalValue(nextStr)
    onChange(nextStr) // Immediate for spinner
  }
  
  const dec = () => {
    const curr = Number.isFinite(value) ? value : 0
    const next = Math.max(min, curr - step)
    const nextStr = String(next)
    setLocalValue(nextStr)
    onChange(nextStr) // Immediate for spinner
  }
  
  const startRepeat = (fn: () => void, type: 'inc' | 'dec') => {
    fn()
    if (type === 'inc') setIsIncrementing(true)
    else setIsDecrementing(true)
    
    let delay = 300
    const accelerate = () => {
      fn()
      delay = Math.max(80, delay * 0.9)
      repeatRef.current = window.setTimeout(accelerate, delay)
    }
    repeatRef.current = window.setTimeout(accelerate, delay)
  }
  
  const stopRepeat = () => {
    if (repeatRef.current != null) {
      window.clearTimeout(repeatRef.current)
      repeatRef.current = null
    }
    setIsIncrementing(false)
    setIsDecrementing(false)
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (repeatRef.current != null) {
        window.clearTimeout(repeatRef.current)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation() // Prevent event bubbling
    const inputValue = e.target.value
    
    // Remove any non-digit characters
    const digitsOnly = inputValue.replace(/\D/g, "")
    
    // Update local state immediately
    setLocalValue(digitsOnly)
    
    // DO NOT update parent during typing - only on blur or spinner use
    // This prevents any re-renders that could steal focus
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation() // Prevent event bubbling
    setIsFocused(true)
    if (value === 0) {
      setLocalValue("")
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation() // Prevent event bubbling
    setIsFocused(false)
    
    // Ensure valid number on blur and update parent
    const numValue = Math.max(min, parseInt(localValue) || 0)
    const finalValue = String(numValue)
    setLocalValue(finalValue)
    onChange(finalValue) // Only update parent on blur
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation() // Prevent event bubbling
    if (e.key === "ArrowUp") {
      e.preventDefault()
      inc()
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      dec()
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation() // Prevent event bubbling
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.deltaY < 0) inc()
    else if (e.deltaY > 0) dec()
  }

  const defaultClassName = "bg-[#171717] border-[#2a2a2a] text-white rounded-[5px] focus:ring-1 focus:ring-gray-600 focus:border-gray-600 pr-8 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none transition-all duration-200"

  return (
    <div
      className="relative group"
      onWheel={handleWheel}
    >
      <Input
        type="text"
        inputMode="numeric"
        value={localValue}
        aria-label={ariaLabel}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        ref={inputRef}
        className={className || defaultClassName}
        autoComplete="off"
        spellCheck={false}
      />
      
      {/* Spinner Controls */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col opacity-60 group-hover:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            inputRef.current?.focus()
            startRepeat(inc, 'inc')
          }}
          onMouseUp={stopRepeat}
          onMouseLeave={stopRepeat}
          onTouchStart={(e) => {
            e.preventDefault()
            inputRef.current?.focus()
            startRepeat(inc, 'inc')
          }}
          onTouchEnd={stopRepeat}
          aria-label="Increment"
          className={`w-6 h-4 flex items-center justify-center bg-transparent text-white/70 hover:text-white hover:bg-white/10 rounded-sm transition-all duration-150 ${
            isIncrementing ? 'bg-white/10 text-white scale-95' : ''
          }`}
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            inputRef.current?.focus()
            startRepeat(dec, 'dec')
          }}
          onMouseUp={stopRepeat}
          onMouseLeave={stopRepeat}
          onTouchStart={(e) => {
            e.preventDefault()
            inputRef.current?.focus()
            startRepeat(dec, 'dec')
          }}
          onTouchEnd={stopRepeat}
          aria-label="Decrement"
          className={`w-6 h-4 flex items-center justify-center bg-transparent text-white/70 hover:text-white hover:bg-white/10 rounded-sm transition-all duration-150 ${
            isDecrementing ? 'bg-white/10 text-white scale-95' : ''
          }`}
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}