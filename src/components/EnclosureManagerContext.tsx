import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from 'react'
import {
    loadEnclosures,
    saveEnclosures,
    createSavedEnclosure,
    type SavedEnclosure,
} from '@/lib/enclosure-storage'
import type { Habitat, DinoName } from '@/types'

interface EnclosureManagerContextValue {
    enclosures: SavedEnclosure[]
    activeEnclosureId: string | null
    activeEnclosure: SavedEnclosure | null
    createEnclosure: (name?: string, habitat?: Habitat) => string
    deleteEnclosure: (id: string) => boolean
    renameEnclosure: (id: string, name: string) => boolean
    selectEnclosure: (id: string | null) => void
    updateEnclosureHabitat: (id: string, habitat: Habitat) => void
    updateEnclosureDinosaurs: (id: string, dinosaurs: DinoName[]) => void
}

const EnclosureManagerContext = createContext<EnclosureManagerContextValue | null>(null)

export function useEnclosureManager() {
    const context = useContext(EnclosureManagerContext)
    if (!context) {
        throw new Error('useEnclosureManager must be used within an EnclosureManagerProvider')
    }
    return context
}

interface EnclosureManagerProviderProps {
    children: ReactNode
}

export function EnclosureManagerProvider({ children }: EnclosureManagerProviderProps) {
    // Initialize both states together to ensure consistency
    const [{ enclosures, activeEnclosureId }, setManagerState] = useState<{
        enclosures: SavedEnclosure[]
        activeEnclosureId: string | null
    }>(() => {
        const loaded = loadEnclosures()
        if (loaded.length === 0) {
            // Create a default enclosure if none exist
            const defaultEnclosure = createSavedEnclosure('Enclosure 1', 'fence')
            return { enclosures: [defaultEnclosure], activeEnclosureId: defaultEnclosure.id }
        }
        return { enclosures: loaded, activeEnclosureId: loaded[0].id }
    })

    // Helper to update enclosures
    const setEnclosures = useCallback((updater: SavedEnclosure[] | ((prev: SavedEnclosure[]) => SavedEnclosure[])) => {
        setManagerState(prev => ({
            ...prev,
            enclosures: typeof updater === 'function' ? updater(prev.enclosures) : updater,
        }))
    }, [])

    // Helper to update active enclosure ID
    const setActiveEnclosureId = useCallback((id: string | null | ((prev: string | null) => string | null)) => {
        setManagerState(prev => ({
            ...prev,
            activeEnclosureId: typeof id === 'function' ? id(prev.activeEnclosureId) : id,
        }))
    }, [])

    // Persist to localStorage whenever enclosures change
    useEffect(() => {
        saveEnclosures(enclosures)
    }, [enclosures])

    const activeEnclosure = enclosures.find(e => e.id === activeEnclosureId) ?? null

    const createEnclosure = useCallback((name?: string, habitat?: Habitat): string => {
        const newEnclosure = createSavedEnclosure(name, habitat)
        setEnclosures(prev => [...prev, newEnclosure])
        setActiveEnclosureId(newEnclosure.id)
        return newEnclosure.id
    }, [])

    const deleteEnclosure = useCallback((id: string): boolean => {
        setEnclosures(prev => {
            const index = prev.findIndex(e => e.id === id)
            if (index === -1) return prev
            const next = prev.filter(e => e.id !== id)
            return next
        })
        // If deleting the active enclosure, select another
        setActiveEnclosureId(prev => {
            if (prev !== id) return prev
            const remaining = enclosures.filter(e => e.id !== id)
            return remaining.length > 0 ? remaining[0].id : null
        })
        return true
    }, [enclosures])

    const renameEnclosure = useCallback((id: string, name: string): boolean => {
        setEnclosures(prev =>
            prev.map(e => e.id === id ? { ...e, name } : e)
        )
        return true
    }, [])

    const selectEnclosure = useCallback((id: string | null): void => {
        setActiveEnclosureId(id)
    }, [])

    const updateEnclosureHabitat = useCallback((id: string, habitat: Habitat): void => {
        setEnclosures(prev =>
            prev.map(e => e.id === id ? { ...e, habitat, dinosaurs: [] } : e)
        )
    }, [])

    const updateEnclosureDinosaurs = useCallback((id: string, dinosaurs: DinoName[]): void => {
        setEnclosures(prev =>
            prev.map(e => e.id === id ? { ...e, dinosaurs } : e)
        )
    }, [])

    const value: EnclosureManagerContextValue = {
        enclosures,
        activeEnclosureId,
        activeEnclosure,
        createEnclosure,
        deleteEnclosure,
        renameEnclosure,
        selectEnclosure,
        updateEnclosureHabitat,
        updateEnclosureDinosaurs,
    }

    return (
        <EnclosureManagerContext.Provider value={value}>
            {children}
        </EnclosureManagerContext.Provider>
    )
}
