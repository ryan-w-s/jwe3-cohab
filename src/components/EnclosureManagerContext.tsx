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
    const [enclosures, setEnclosures] = useState<SavedEnclosure[]>(() => loadEnclosures())
    const [activeEnclosureId, setActiveEnclosureId] = useState<string | null>(() => {
        const loaded = loadEnclosures()
        return loaded.length > 0 ? loaded[0].id : null
    })

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
