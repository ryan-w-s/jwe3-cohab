import { createContext, useContext, useState, useCallback, useMemo, useReducer, type ReactNode } from 'react'
import { Enclosure, createEnclosure, getDinosaur, type CohabitationWarning } from '@/lib/enclosure'
import type { Dinosaur, Habitat, Needs } from '@/types'

interface EnclosureContextValue {
    habitat: Habitat
    dinosaurs: Dinosaur[]
    combinedNeeds: Needs
    warnings: CohabitationWarning[]
    suggestedDinos: Array<{ dinosaur: Dinosaur, score: number }>
    setHabitat: (habitat: Habitat) => void
    addDino: (name: string) => boolean
    removeDino: (name: string) => boolean
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
    const [enclosure, setEnclosure] = useState<Enclosure>(() => createEnclosure(initialHabitat))
    // Use a reducer to force updates when the enclosure is mutated
    const [version, incrementVersion] = useReducer((v: number) => v + 1, 0)

    const setHabitat = useCallback((habitat: Habitat) => {
        setEnclosure(createEnclosure(habitat))
    }, [])

    const addDino = useCallback((name: string): boolean => {
        const dino = getDinosaur(name)
        if (!dino) return false
        const result = enclosure.addDinosaur(dino)
        if (result) incrementVersion()
        return result
    }, [enclosure])

    const removeDino = useCallback((name: string): boolean => {
        const result = enclosure.removeDinosaur(name)
        if (result) incrementVersion()
        return result
    }, [enclosure])

    const value = useMemo<EnclosureContextValue>(() => ({
        habitat: enclosure.habitat,
        dinosaurs: enclosure.dinosaurs,
        combinedNeeds: enclosure.getCombinedNeeds(),
        warnings: enclosure.getCohabitationWarnings(),
        suggestedDinos: enclosure.getSuggestedDinosaurs(),
        setHabitat,
        addDino,
        removeDino,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [enclosure, version, setHabitat, addDino, removeDino])

    return (
        <EnclosureContext.Provider value={value}>
            {children}
        </EnclosureContext.Provider>
    )
}
