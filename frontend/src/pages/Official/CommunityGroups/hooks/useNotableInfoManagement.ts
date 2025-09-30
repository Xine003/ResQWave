import { useCallback } from "react"

export const useNotableInfoManagement = (
  notableInfoInputs: string[],
  setNotableInfoInputs: (updater: (prev: string[]) => string[]) => void,
  setIsDirty: (dirty: boolean) => void
) => {

  /**
   * Adds a new notable info input field
   */
  const addNotableInfoInput = useCallback(() => {
    setNotableInfoInputs((prev) => [...prev, ""])
    setIsDirty(true)
  }, [setNotableInfoInputs, setIsDirty])

  /**
   * Updates a specific notable info input by index
   */
  const updateNotableInfoInput = useCallback((index: number, value: string) => {
    setNotableInfoInputs((prev) => prev.map((item, i) => (i === index ? value : item)))
    setIsDirty(true)
  }, [setNotableInfoInputs, setIsDirty])

  /**
   * Removes a notable info input by index (ensures at least one remains)
   */
  const removeNotableInfoInput = useCallback((index: number) => {
    if (notableInfoInputs.length > 1) {
      setNotableInfoInputs((prev) => prev.filter((_, i) => i !== index))
      setIsDirty(true)
    }
  }, [notableInfoInputs.length, setNotableInfoInputs, setIsDirty])

  /**
   * Filters out empty notable info inputs for saving
   */
  const getFilteredNotableInfo = useCallback(() => {
    return notableInfoInputs.filter((s) => s && s.trim().length > 0)
  }, [notableInfoInputs])

  return {
    addNotableInfoInput,
    updateNotableInfoInput,
    removeNotableInfoInput,
    getFilteredNotableInfo,
  }
}