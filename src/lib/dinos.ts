import lagoonDinos from '@/data/lagoon-dinosaurs.json'
import aviaryDinos from '@/data/aviary-dinosaurs.json'
import fenceDinos from '@/data/fence-dinosaurs.json'
import type { Dinosaur, Habitat, DinoName, DinosaurFamily, RawDinosaur } from '@/types'

const dinosByName: Record<DinoName, Dinosaur> = {}
const dinosByFamily: Record<DinosaurFamily, Dinosaur[]> = {}
const dinosByHabitat: Partial<Record<Habitat, Dinosaur[]>> = {}

function addDinos(inputDinos: RawDinosaur[], habitat: Habitat) {
    for (const raw of inputDinos) {
        const dinosaur = raw as Dinosaur
        dinosaur.habitat = habitat
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
