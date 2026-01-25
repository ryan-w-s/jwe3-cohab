import lagoonDinos from '@/data/lagoon-dinosaurs.json'
import aviaryDinos from '@/data/aviary-dinosaurs.json'
import fenceDinos from '@/data/fence-dinosaurs.json'
import type { Dinosaur, Habitat, DinoName, DinosaurFamily, RawDinosaur, Needs } from '@/types'

const dinosByName: Record<DinoName, Dinosaur> = {}
const dinosByFamily: Record<DinosaurFamily, Dinosaur[]> = {}
const dinosByHabitat: Partial<Record<Habitat, Dinosaur[]>> = {}

const feedType: Record<keyof Needs, string[]> = {
    "ground leaf": ["leaf"],
    "tall leaf": ["leaf"],
    "ground fiber": ["fiber"],
    "tall fiber": ["fiber"],
    "ground fruit": ["fruit", "fiber"],
    "tall fruit": ["fruit", "fiber"],
    "ground nut": ["nut"],
    "tall nut": ["nut"],
    "meat": ["meat"],
    "prey": ["prey"],
    "fish": ["fish"],
    "shark": ["shark"],
}

function addDinos(inputDinos: RawDinosaur[], habitat: Habitat) {
    for (const raw of inputDinos) {
        const dinosaur = raw as Dinosaur
        dinosaur.habitat = habitat
        dinosaur.feedType = []
        for (const [key, value] of Object.entries(dinosaur.needs)) {
            const types = feedType[key as keyof Needs]
            if (value && value > 0 && types) {
                dinosaur.feedType.push(...types)
            }
        }
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

