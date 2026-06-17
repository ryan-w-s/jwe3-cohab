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

    it('correctly expands carnivore categories', () => {
        const theriz = dinosByName['Therizinosaurus']
        expect(theriz).toBeDefined()
        expect(theriz.cohabitation.dislikes).toContain('Carnivores')
        expect(theriz.cohabitation.dislikes).toContain('Large Carnivore')
        expect(theriz.cohabitation.dislikes).toContain('Medium Carnivore')
        expect(theriz.cohabitation.dislikes).toContain('Small Carnivore')
        expect(theriz.cohabitation.dislikes).toContain('Hybrid Carnivores')
        expect(theriz.cohabitation.dislikes).not.toContain('Scavenger')
    })

    it('loads Aquilops as a Ceratopsid fence dinosaur', () => {
        const aquilops = dinosByName['Aquilops']
        expect(aquilops).toBeDefined()
        expect(aquilops.family).toBe('Ceratopsid')
        expect(aquilops.habitat).toBe('fence')
        expect(aquilops.needs).toEqual({
            pasture: 0.51,
            water: 0.16,
            ground_fiber: 0.19,
            ground_nut: 0.14,
        })
        expect(aquilops.social).toEqual({
            min_population: 4,
        })
        expect(aquilops.cohabitation.likes).toEqual(['Ceratopsid'])
        expect(aquilops.cohabitation.dislikes).toEqual([
            'Carnivores',
            'Therizinosaurus',
            'Small Carnivore',
            'Medium Carnivore',
            'Large Carnivore',
            'Hybrid Carnivores',
        ])
    })

    it('loads Dracorex as a Pachycephalosaurid fence dinosaur', () => {
        const dracorex = dinosByName['Dracorex']
        expect(dracorex).toBeDefined()
        expect(dracorex.family).toBe('Pachycephalosaurid')
        expect(dracorex.habitat).toBe('fence')
        expect(dracorex.needs).toEqual({
            wetland: 0.09,
            water: 0.10,
            ground_leaf: 0.54,
            ground_nut: 0.27,
        })
        expect(dracorex.social).toEqual({
            min_population: 4,
        })
        expect(dracorex.cohabitation).toEqual({
            likes: ['Sauropod', 'Ankylosaurid', 'Stegosaurid'],
            dislikes: ['Indoraptor', 'Indominus rex', 'Therizinosaurus', 'Scorpios rex'],
        })
    })

    it('loads Titanosaurus as a Sauropod fence dinosaur', () => {
        const titanosaurus = dinosByName['Titanosaurus']
        expect(titanosaurus).toBeDefined()
        expect(titanosaurus.family).toBe('Sauropod')
        expect(titanosaurus.habitat).toBe('fence')
        expect(titanosaurus.needs).toEqual({
            pasture: 0.16,
            wetland: 0.31,
            water: 0.18,
            tall_leaf: 0.14,
            tall_fiber: 0.21,
        })
        expect(titanosaurus.social).toEqual({
            min_population: 3,
            min_males: 1,
        })
        expect(titanosaurus.cohabitation).toEqual({
            likes: ['Patagotitan', 'Scavenger'],
            dislikes: [
                'Small Carnivore',
                'Large Carnivore',
                'Medium Carnivore',
                'Indoraptor',
                'Indominus rex',
                'Therizinosaurus',
                'Scorpios rex',
            ],
        })
    })
})
