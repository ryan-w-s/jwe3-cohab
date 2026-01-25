import lagoonDinos from '@/data/lagoon-dinosaurs.json'
import aviaryDinos from '@/data/aviary-dinosaurs.json'
import fenceDinos from '@/data/fence-dinosaurs.json'
import type { Dinosaur, Habitat, DinoName, DinosaurFamily, RawDinosaur, Needs } from '@/types'

const dinosByName: Record<DinoName, Dinosaur> = {}
const dinosByFamily: Record<DinosaurFamily, Dinosaur[]> = {}
const dinosByHabitat: Partial<Record<Habitat, Dinosaur[]>> = {}

const feedType: Record<keyof Needs, string[]> = {
    "ground_leaf": ["leaf"],
    "tall_leaf": ["leaf"],
    "ground_fiber": ["fiber"],
    "tall_fiber": ["fiber"],
    "ground_fruit": ["fruit", "fiber"],
    "tall_fruit": ["fruit", "fiber"],
    "ground_nut": ["nut"],
    "tall_nut": ["nut"],
}

function addDinos(inputDinos: RawDinosaur[], habitat: Habitat) {
    for (const raw of inputDinos) {
        const dinosaur = raw as Dinosaur
        dinosaur.habitat = habitat
        dinosaur.layoutType = [] // Initialize new field

        for (const [key, value] of Object.entries(dinosaur.needs)) {
            if (value && value > 0) {
                const types = feedType[key as keyof Needs]
                if (types) {
                    dinosaur.layoutType.push(...types)
                } else {
                    dinosaur.layoutType.push(key)
                }
            }
        }

        // Deduplicate types
        dinosaur.layoutType = [...new Set(dinosaur.layoutType)]

        dinosByName[dinosaur.name] = dinosaur
        dinosByFamily[dinosaur.family] = dinosByFamily[dinosaur.family] || []
        dinosByFamily[dinosaur.family].push(dinosaur)
        dinosByHabitat[habitat] = dinosByHabitat[habitat] || []
        dinosByHabitat[habitat].push(dinosaur)
    }
}

addDinos(fenceDinos as RawDinosaur[], 'fence')
addDinos(aviaryDinos as RawDinosaur[], 'aviary')
addDinos(lagoonDinos as RawDinosaur[], 'lagoon')

export { dinosByName, dinosByFamily, dinosByHabitat }
