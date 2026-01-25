import { describe, it, expect } from 'vitest'
import { dinosByName } from './dinos'
import fenceDinos from '@/data/fence-dinosaurs.json'
import aviaryDinos from '@/data/aviary-dinosaurs.json'
import lagoonDinos from '@/data/lagoon-dinosaurs.json'

describe('Dinosaur Data Loading', () => {
    it('loads all dinosaurs from JSON files', () => {
        const expectedCount = fenceDinos.length + aviaryDinos.length + lagoonDinos.length
        const actualCount = Object.keys(dinosByName).length

        expect(actualCount).toBe(expectedCount)
    })

    it('correctly maps feed types to key layout types', () => {
        // Find a dino that we know has a mapped feed type
        // e.g. Ankylosaurus has ground_leaf (needs: ground_leaf) -> mapped to 'leaf'
        const anky = dinosByName['Ankylosaurus']
        expect(anky).toBeDefined()

        // We expect 'leaf' because 'ground_leaf' maps to ['leaf']
        expect(anky.layoutType).toContain('leaf')
        expect(anky.layoutType).not.toContain('ground_leaf')
    })

    it('falls back to key name for unmapped types', () => {
        // Find a dino with a water need (usually unmapped or maps to itself)
        // In our current logic: water -> water if not in feedType map
        // Wait, did we keep implicit mapping for things NOT in feedType?
        // Let's check logic:
        // if (types) push(...types) else push(key)

        // Ankylosaurus has water: 0.10. 'water' is NOT in feedType map.
        const anky = dinosByName['Ankylosaurus']
        expect(anky).toBeDefined()
        expect(anky.layoutType).toContain('water')
    })

    it('correctly uses underscores for feedType lookups', () => {
        // We fixed the map to use 'ground_nut' instead of 'ground nut'
        // Let's find a dino with nuts. Psittacosaurus has ground_nut.
        const taco = dinosByName['Psittacosaurus']
        expect(taco).toBeDefined()

        // ground_nut -> ['nut']
        expect(taco.layoutType).toContain('nut')
    })
})
