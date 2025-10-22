import { useCallback, useEffect, useState } from 'react'
import {
    archiveDispatcher,
    createDispatcher,
    deleteDispatcherPermanently,
    getActiveDispatchers,
    getArchivedDispatchers,
    getDispatcher,
    transformDispatcherDetailsResponse,
    transformDispatcherResponse
} from '../api/dispatcherApi'
import type { Dispatcher, DispatcherDetails } from '../types'

export function useDispatchers() {
  const [activeDispatchers, setActiveDispatchers] = useState<Dispatcher[]>([])
  const [archivedDispatchers, setArchivedDispatchers] = useState<Dispatcher[]>([])
  const [infoById, setInfoById] = useState<Record<string, DispatcherDetails>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch active dispatchers
  const fetchActiveDispatchers = useCallback(async () => {
    try {
      setError(null)
      const response = await getActiveDispatchers()
      const transformedData = response.map(transformDispatcherResponse)
      setActiveDispatchers(transformedData)
      
      // Also store detailed info for each dispatcher
      const detailsMap: Record<string, DispatcherDetails> = {}
      response.forEach((dispatcher) => {
        detailsMap[dispatcher.id] = transformDispatcherDetailsResponse(dispatcher)
      })
      setInfoById(prev => ({ ...prev, ...detailsMap }))
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch active dispatchers')
      console.error('Error fetching active dispatchers:', err)
    }
  }, [])

  // Fetch archived dispatchers
  const fetchArchivedDispatchers = useCallback(async () => {
    try {
      setError(null)
      const response = await getArchivedDispatchers()
      const transformedData = response.map(transformDispatcherResponse)
      setArchivedDispatchers(transformedData)
      
      // Also store detailed info for archived dispatchers
      const detailsMap: Record<string, DispatcherDetails> = {}
      response.forEach((dispatcher) => {
        detailsMap[dispatcher.id] = transformDispatcherDetailsResponse(dispatcher)
      })
      setInfoById(prev => ({ ...prev, ...detailsMap }))
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch archived dispatchers')
      console.error('Error fetching archived dispatchers:', err)
    }
  }, [])

  // Fetch detailed info for a specific dispatcher
  const fetchDispatcherDetails = useCallback(async (id: string): Promise<DispatcherDetails | null> => {
    try {
      const response = await getDispatcher(id)
      const details = transformDispatcherDetailsResponse(response)
      
      // Update the infoById state
      setInfoById(prev => ({ ...prev, [id]: details }))
      
      return details
    } catch (err) {
      console.error(`Error fetching dispatcher ${id} details:`, err)
      setError(err instanceof Error ? err.message : `Failed to fetch dispatcher ${id} details`)
      return null
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchActiveDispatchers(),
          fetchArchivedDispatchers()
        ])
      } catch (err) {
        console.error('Error loading initial dispatcher data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [fetchActiveDispatchers, fetchArchivedDispatchers])

  // Create new dispatcher
  const createNewDispatcher = useCallback(async (dispatcherData: {
    name: string
    email: string
    contactNumber: string
    password?: string
    photo?: File
  }) => {
    try {
      setError(null)
      const result = await createDispatcher(dispatcherData)
      
      // Refresh the active dispatchers list after successful creation
      await fetchActiveDispatchers()
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create dispatcher'
      setError(errorMessage)
      throw err
    }
  }, [fetchActiveDispatchers])

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchActiveDispatchers(),
        fetchArchivedDispatchers()
      ])
    } catch (err) {
      console.error('Error refreshing dispatcher data:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchActiveDispatchers, fetchArchivedDispatchers])

  // Archive dispatcher
  const archiveDispatcherById = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await archiveDispatcher(id)
      // Refresh data after successful archive
      await refreshData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive dispatcher')
      console.error('Error archiving dispatcher:', err)
      throw err
    }
  }, [refreshData])

  // Permanently delete dispatcher
  const deleteDispatcherPermanentlyById = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await deleteDispatcherPermanently(id)
      // Refresh data after successful permanent deletion
      await refreshData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to permanently delete dispatcher')
      console.error('Error permanently deleting dispatcher:', err)
      throw err
    }
  }, [refreshData])

  return {
    // Data
    activeDispatchers,
    archivedDispatchers,
    infoById,
    
    // State
    loading,
    error,
    
    // Actions
    archiveDispatcherById,
    createNewDispatcher,
    deleteDispatcherPermanentlyById,
    fetchActiveDispatchers,
    fetchArchivedDispatchers,
    fetchDispatcherDetails,
    refreshData,
    
    // Local state setters (for optimistic updates)
    setActiveDispatchers,
    setArchivedDispatchers,
    setInfoById,
  }
}