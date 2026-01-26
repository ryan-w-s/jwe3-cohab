import type { DinoName, Habitat } from '@/types'

const STORAGE_KEY = 'jwe3-enclosures'

/**
 * Represents a saved enclosure that can be persisted to localStorage
 */
export interface SavedEnclosure {
    id: string
    name: string
    habitat: Habitat
    dinosaurs: DinoName[]
}

/**
 * Generate a unique ID for a new enclosure
 */
export function generateEnclosureId(): string {
    return `enc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Load all saved enclosures from localStorage
 */
export function loadEnclosures(): SavedEnclosure[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []

        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []

        // Validate each enclosure has required fields
        return parsed.filter((e): e is SavedEnclosure =>
            typeof e === 'object' &&
            e !== null &&
            typeof e.id === 'string' &&
            typeof e.name === 'string' &&
            typeof e.habitat === 'string' &&
            Array.isArray(e.dinosaurs)
        )
    } catch {
        return []
    }
}

/**
 * Save all enclosures to localStorage
 */
export function saveEnclosures(enclosures: SavedEnclosure[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(enclosures))
    } catch (error) {
        console.error('Failed to save enclosures:', error)
    }
}

/**
 * Create a new empty enclosure with default values
 */
export function createSavedEnclosure(
    name: string = 'New Enclosure',
    habitat: Habitat = 'fence'
): SavedEnclosure {
    return {
        id: generateEnclosureId(),
        name,
        habitat,
        dinosaurs: [],
    }
}
