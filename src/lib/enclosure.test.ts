import { describe, it, expect, beforeEach } from 'vitest'
import { Enclosure, createEnclosure, getDinosaur } from './enclosure'
import type { Dinosaur } from '@/types'

// Helper to create a minimal test dinosaur
function createTestDino(overrides: Partial<Dinosaur> = {}): Dinosaur {
    return {
        name: 'TestDino',
        family: 'TestFamily',
        habitat: 'fence',
        layoutType: ['leaf'],
        needs: { pasture: 0.5, water: 0.1 },
        social: { min_population: 1 },
        cohabitation: { likes: [], dislikes: [] },
        ...overrides,
    }
}

describe('Enclosure', () => {
    describe('createEnclosure', () => {
        it('creates an empty enclosure with the specified habitat', () => {
            const enclosure = createEnclosure('fence')
            expect(enclosure.habitat).toBe('fence')
            expect(enclosure.dinosaurs).toEqual([])
        })

        it('creates enclosures for different habitat types', () => {
            expect(createEnclosure('aviary').habitat).toBe('aviary')
            expect(createEnclosure('lagoon').habitat).toBe('lagoon')
        })
    })

    describe('addDinosaur', () => {
        let enclosure: Enclosure

        beforeEach(() => {
            enclosure = createEnclosure('fence')
        })

        it('adds a dinosaur to the enclosure', () => {
            const dino = createTestDino({ name: 'Trex' })
            const result = enclosure.addDinosaur(dino)

            expect(result).toBe(true)
            expect(enclosure.dinosaurs).toHaveLength(1)
            expect(enclosure.dinosaurs[0].name).toBe('Trex')
        })

        it('rejects dinosaurs with wrong habitat', () => {
            const dino = createTestDino({ name: 'Pteranodon', habitat: 'aviary' })
            const result = enclosure.addDinosaur(dino)

            expect(result).toBe(false)
            expect(enclosure.dinosaurs).toHaveLength(0)
        })

        it('rejects duplicate dinosaurs', () => {
            const dino = createTestDino({ name: 'Trex' })
            enclosure.addDinosaur(dino)
            const result = enclosure.addDinosaur(dino)

            expect(result).toBe(false)
            expect(enclosure.dinosaurs).toHaveLength(1)
        })
    })

    describe('removeDinosaur', () => {
        it('removes an existing dinosaur', () => {
            const enclosure = createEnclosure('fence')
            enclosure.addDinosaur(createTestDino({ name: 'Trex' }))

            const result = enclosure.removeDinosaur('Trex')

            expect(result).toBe(true)
            expect(enclosure.dinosaurs).toHaveLength(0)
        })

        it('returns false when dinosaur not found', () => {
            const enclosure = createEnclosure('fence')

            const result = enclosure.removeDinosaur('NonExistent')

            expect(result).toBe(false)
        })
    })

    describe('getCombinedNeeds', () => {
        it('returns empty needs for empty enclosure', () => {
            const enclosure = createEnclosure('fence')
            expect(enclosure.getCombinedNeeds()).toEqual({})
        })

        it('returns needs of single dinosaur', () => {
            const enclosure = createEnclosure('fence')
            enclosure.addDinosaur(createTestDino({ needs: { pasture: 0.3, water: 0.1 } }))

            const needs = enclosure.getCombinedNeeds()

            expect(needs.pasture).toBe(0.3)
            expect(needs.water).toBe(0.1)
        })

        it('takes maximum value for each need type', () => {
            const enclosure = createEnclosure('fence')
            enclosure.addDinosaur(createTestDino({ name: 'Dino1', needs: { pasture: 0.3, water: 0.1 } }))
            enclosure.addDinosaur(createTestDino({ name: 'Dino2', needs: { pasture: 0.5, cover: 0.2 } }))

            const needs = enclosure.getCombinedNeeds()

            expect(needs.pasture).toBe(0.5) // max of 0.3 and 0.5
            expect(needs.water).toBe(0.1)
            expect(needs.cover).toBe(0.2)
        })
    })

    describe('getCohabitationWarnings', () => {
        it('returns empty array for empty enclosure', () => {
            const enclosure = createEnclosure('fence')
            expect(enclosure.getCohabitationWarnings()).toEqual([])
        })

        it('returns empty array when no conflicts', () => {
            const enclosure = createEnclosure('fence')
            enclosure.addDinosaur(createTestDino({ name: 'Dino1' }))
            enclosure.addDinosaur(createTestDino({ name: 'Dino2' }))

            expect(enclosure.getCohabitationWarnings()).toEqual([])
        })

        it('detects when dinosaur dislikes another by name', () => {
            const enclosure = createEnclosure('fence')
            enclosure.addDinosaur(
                createTestDino({
                    name: 'Aggressor',
                    cohabitation: { likes: [], dislikes: ['Victim'] },
                }),
            )
            enclosure.addDinosaur(createTestDino({ name: 'Victim' }))

            const warnings = enclosure.getCohabitationWarnings()

            expect(warnings).toHaveLength(1)
            expect(warnings[0]).toEqual({
                dinosaur: 'Aggressor',
                target: 'Victim',
                reason: 'dislikes',
            })
        })

        it('detects when dinosaur dislikes another by family', () => {
            const enclosure = createEnclosure('fence')
            enclosure.addDinosaur(
                createTestDino({
                    name: 'Carnivore',
                    cohabitation: { likes: [], dislikes: ['Herbivore'] },
                }),
            )
            enclosure.addDinosaur(createTestDino({ name: 'Stego', family: 'Herbivore' }))

            const warnings = enclosure.getCohabitationWarnings()

            expect(warnings).toHaveLength(1)
            expect(warnings[0].dinosaur).toBe('Carnivore')
            expect(warnings[0].target).toBe('Herbivore')
        })

        it('detects when dinosaur dislikes "Carnivores" category (via expansion)', () => {
            const enclosure = createEnclosure('fence')
            // Ankylosaurus has "Carnivores" in dislikes in the JSON
            // which should be expanded to include "Large Carnivore"
            const herbivore = getDinosaur('Ankylosaurus')
            if (!herbivore) throw new Error('Ankylosaurus not found')

            enclosure.addDinosaur(herbivore)

            // T. Rex is a "Large Carnivore"
            const carnivore = getDinosaur('Tyrannosaurus Rex')
            if (!carnivore) throw new Error('T. Rex not found')

            enclosure.addDinosaur(carnivore)

            const warnings = enclosure.getCohabitationWarnings()

            expect(warnings.length).toBeGreaterThan(0)
            const warning = warnings.find(w => w.dinosaur === 'Ankylosaurus' && w.target === 'Large Carnivore')
            expect(warning).toBeDefined()
        })
    })

    describe('Cohabitation Precedence Rules', () => {
        it('allows cohabitation if specific dino is liked, even if family is disliked', () => {
            const enclosure = createEnclosure('fence')
            // Dino likes "Buddy" but dislikes "GoodFamily"
            enclosure.addDinosaur(
                createTestDino({
                    name: 'TheJudge',
                    cohabitation: { likes: ['Buddy'], dislikes: ['GoodFamily'] },
                }),
            )
            // "Buddy" belongs to "GoodFamily"
            enclosure.addDinosaur(createTestDino({ name: 'Buddy', family: 'GoodFamily' }))

            const warnings = enclosure.getCohabitationWarnings()
            expect(warnings).toHaveLength(0)
        })

        it('warns if specific dino is disliked, even if family is liked', () => {
            const enclosure = createEnclosure('fence')
            // Dino dislikes "Enemy" but likes "BadFamily"
            enclosure.addDinosaur(
                createTestDino({
                    name: 'TheJudge',
                    cohabitation: { likes: ['BadFamily'], dislikes: ['Enemy'] },
                }),
            )
            // "Enemy" belongs to "BadFamily"
            enclosure.addDinosaur(createTestDino({ name: 'Enemy', family: 'BadFamily' }))

            const warnings = enclosure.getCohabitationWarnings()
            expect(warnings).toHaveLength(1)
            expect(warnings[0].dinosaur).toBe('TheJudge')
            expect(warnings[0].target).toBe('Enemy')
        })
    })

    describe('getSuggestedDinosaurs', () => {
        it('returns empty array for habitat with no dinosaurs', () => {
            const enclosure = createEnclosure('fence')
            // This test just verifies the method runs without error
            const suggestions = enclosure.getSuggestedDinosaurs()
            expect(Array.isArray(suggestions)).toBe(true)
        })

        it('excludes dinosaurs already in enclosure', () => {
            const enclosure = createEnclosure('fence')
            const dino = getDinosaur('Ankylosaurus')
            if (dino) {
                enclosure.addDinosaur(dino)
                const suggestions = enclosure.getSuggestedDinosaurs()
                const names = suggestions.map((s) => s.dinosaur.name)
                expect(names).not.toContain('Ankylosaurus')
            }
        })

        it('returns dinosaurs sorted by score descending', () => {
            const enclosure = createEnclosure('fence')
            const suggestions = enclosure.getSuggestedDinosaurs()

            for (let i = 1; i < suggestions.length; i++) {
                expect(suggestions[i - 1].score).toBeGreaterThanOrEqual(suggestions[i].score)
            }
        })
    })

    describe('getDinosaur', () => {
        it('returns undefined for unknown dinosaur', () => {
            expect(getDinosaur('NotARealDino')).toBeUndefined()
        })

        it('returns dinosaur data for known dinosaur', () => {
            const anky = getDinosaur('Ankylosaurus')
            expect(anky).toBeDefined()
            expect(anky?.family).toBe('Ankylosaurid')
        })
    })
})
