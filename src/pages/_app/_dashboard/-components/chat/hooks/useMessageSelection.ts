import { useState, useCallback, useMemo } from 'react'

export function useMessageSelection() {
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const startSelection = useCallback(() => {
    setIsSelectionMode(true)
    setSelectedIds(new Set())
  }, [])

  const cancelSelection = useCallback(() => {
    setIsSelectionMode(false)
    setSelectedIds(new Set())
  }, [])

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id)
  }, [selectedIds])

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds])

  return {
    isSelectionMode,
    selectedIds,
    selectedCount,
    startSelection,
    cancelSelection,
    toggleSelection,
    isSelected,
  }
}
