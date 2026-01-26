import { createContext, useContext, useState, useCallback, useMemo, useReducer, useEffect, type ReactNode } from 'react'
import { Enclosure, createEnclosure, getDinosaur, type CohabitationWarning } from '@/lib/enclosure'
import type { Dinosaur, FilterMode, Habitat, Needs } from '@/types'
import { useEnclosureManager } from './EnclosureManagerContext'

interface EnclosureContextValue {
    habitat: Habitat
    dinosaurs: Dinosaur[]
    combinedNeeds: Needs
    warnings: CohabitationWarning[]
    suggestedDinos: Array<{ dinosaur: Dinosaur, score: number }>
    filterMode: FilterMode
    setHabitat: (habitat: Habitat) => void
    setFilterMode: (mode: FilterMode) => void
    addDino: (name: string) => boolean
    removeDino: (name: string) => boolean
    hasActiveEnclosure: boolean
}

const EnclosureContext = createContext<EnclosureContextValue | null>(null)

export function useEnclosure() {
    const context = useContext(EnclosureContext)
    if (!context) {
        throw new Error('useEnclosure must be used within an EnclosureProvider')
    }
    return context
}

interface EnclosureProviderProps {
    children: ReactNode
    initialHabitat?: Habitat
}

export function EnclosureProvider({ children, initialHabitat = 'fence' }: EnclosureProviderProps) {
    const manager = useEnclosureManager()
    const activeEnclosure = manager.activeEnclosure

    const [enclosure, setEnclosure] = useState<Enclosure>(() => {
        const enc = createEnclosure(activeEnclosure?.habitat ?? initialHabitat)
        // Load dinosaurs from saved state
        if (activeEnclosure) {
            for (const name of activeEnclosure.dinosaurs) {
                const dino = getDinosaur(name)
                if (dino) enc.addDinosaur(dino)
            }
        }
        return enc
    })
    const [filterMode, setFilterMode] = useState<FilterMode>('no-dislike')
    // Use a reducer to force updates when the enclosure is mutated
    const [version, incrementVersion] = useReducer((v: number) => v + 1, 0)

    // Sync enclosure state when active enclosure changes
    useEffect(() => {
        const enc = createEnclosure(activeEnclosure?.habitat ?? initialHabitat)
        if (activeEnclosure) {
            for (const name of activeEnclosure.dinosaurs) {
                const dino = getDinosaur(name)
                if (dino) enc.addDinosaur(dino)
            }
        }
        setEnclosure(enc)
        incrementVersion()
    }, [activeEnclosure?.id, activeEnclosure?.habitat, initialHabitat])

    const setHabitat = useCallback((habitat: Habitat) => {
        if (activeEnclosure) {
            manager.updateEnclosureHabitat(activeEnclosure.id, habitat)
        }
        setEnclosure(createEnclosure(habitat))
    }, [activeEnclosure, manager])

    const addDino = useCallback((name: string): boolean => {
        const dino = getDinosaur(name)
        if (!dino) return false
        const result = enclosure.addDinosaur(dino)
        if (result) {
            incrementVersion()
            // Persist to manager
            if (activeEnclosure) {
                manager.updateEnclosureDinosaurs(activeEnclosure.id, enclosure.dinosaurs.map(d => d.name))
            }
        }
        return result
    }, [enclosure, activeEnclosure, manager])

    const removeDino = useCallback((name: string): boolean => {
        const result = enclosure.removeDinosaur(name)
        if (result) {
            incrementVersion()
            // Persist to manager
            if (activeEnclosure) {
                manager.updateEnclosureDinosaurs(activeEnclosure.id, enclosure.dinosaurs.map(d => d.name))
            }
        }
        return result
    }, [enclosure, activeEnclosure, manager])

    const value = useMemo<EnclosureContextValue>(() => ({
        habitat: enclosure.habitat,
        dinosaurs: enclosure.dinosaurs,
        combinedNeeds: enclosure.getCombinedNeeds(),
        warnings: enclosure.getCohabitationWarnings(),
        suggestedDinos: enclosure.getSuggestedDinosaurs(filterMode),
        filterMode,
        setHabitat,
        setFilterMode,
        addDino,
        removeDino,
        hasActiveEnclosure: activeEnclosure !== null,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [enclosure, version, filterMode, setHabitat, addDino, removeDino, activeEnclosure])

    return (
        <EnclosureContext.Provider value={value}>
            {children}
        </EnclosureContext.Provider>
    )
}

