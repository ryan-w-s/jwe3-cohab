import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    loadEnclosures,
    saveEnclosures,
    createSavedEnclosure,
    generateEnclosureId,
    type SavedEnclosure,
} from './enclosure-storage'

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value
        }),
        clear: () => {
            store = {}
        },
    }
})()

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
})

describe('enclosure-storage', () => {
    beforeEach(() => {
        localStorageMock.clear()
        vi.clearAllMocks()
    })

    describe('generateEnclosureId', () => {
        it('generates unique IDs', () => {
            const id1 = generateEnclosureId()
            const id2 = generateEnclosureId()
            expect(id1).not.toBe(id2)
            expect(id1).toMatch(/^enc-\d+-[a-z0-9]+$/)
        })
    })

    describe('createSavedEnclosure', () => {
        it('creates enclosure with default values', () => {
            const enc = createSavedEnclosure()
            expect(enc.name).toBe('New Enclosure')
            expect(enc.habitat).toBe('fence')
            expect(enc.dinosaurs).toEqual([])
            expect(enc.id).toMatch(/^enc-/)
        })

        it('creates enclosure with custom values', () => {
            const enc = createSavedEnclosure('My Aviary', 'aviary')
            expect(enc.name).toBe('My Aviary')
            expect(enc.habitat).toBe('aviary')
        })
    })

    describe('loadEnclosures', () => {
        it('returns empty array when no data', () => {
            const result = loadEnclosures()
            expect(result).toEqual([])
        })

        it('loads valid enclosures from storage', () => {
            const enclosures: SavedEnclosure[] = [
                { id: 'enc-1', name: 'Test', habitat: 'fence', dinosaurs: ['T-Rex'] },
            ]
            localStorageMock.setItem('jwe3-enclosures', JSON.stringify(enclosures))

            const result = loadEnclosures()
            expect(result).toEqual(enclosures)
        })

        it('handles invalid JSON gracefully', () => {
            localStorageMock.setItem('jwe3-enclosures', 'not-json')
            const result = loadEnclosures()
            expect(result).toEqual([])
        })

        it('filters out invalid enclosure objects', () => {
            const mixed = [
                { id: 'enc-1', name: 'Valid', habitat: 'fence', dinosaurs: [] },
                { id: 'missing-name', habitat: 'fence', dinosaurs: [] },
                { name: 'missing-id', habitat: 'fence', dinosaurs: [] },
                null,
                'not-an-object',
            ]
            localStorageMock.setItem('jwe3-enclosures', JSON.stringify(mixed))

            const result = loadEnclosures()
            expect(result).toHaveLength(1)
            expect(result[0].name).toBe('Valid')
        })
    })

    describe('saveEnclosures', () => {
        it('saves enclosures to localStorage', () => {
            const enclosures: SavedEnclosure[] = [
                { id: 'enc-1', name: 'Test', habitat: 'lagoon', dinosaurs: [] },
            ]

            saveEnclosures(enclosures)

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'jwe3-enclosures',
                JSON.stringify(enclosures)
            )
        })
    })
})
