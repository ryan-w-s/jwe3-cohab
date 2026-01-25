export type DinosaurFamily = string // E.g., "Ornithomimosaurid", "Carnivores"
export type Habitat = 'fence' | 'aviary' | 'lagoon'
export type DinoName = string
export type Needs = {
    arid?: number
    barren?: number
    cover?: number
    deep_water?: number
    fish?: number
    ground_fiber?: number
    ground_fruit?: number
    ground_leaf?: number
    ground_nut?: number
    meat?: number
    open_water?: number
    pasture?: number
    prey?: number
    shark?: number
    tall_fiber?: number
    tall_fruit?: number
    tall_leaf?: number
    tall_nut?: number
    water?: number
    wetland?: number
    [key: string]: number | undefined
}

export interface Social {
    min_population: number
    min_males?: number
    max_males?: number
    min_females?: number
    max_females?: number
}

export interface Dinosaur {
    name: DinoName // Acts as the unique identifier
    family: DinosaurFamily
    habitat: Habitat
    feedType: string[]
    /**
     * Needs are represented as fractions (0.0 - 1.0) for percentages,
     * or absolute values for specific counts (like fish).
     */
    needs: Needs
    social: Social
    cohabitation: {
        likes: (DinoName | DinosaurFamily)[]
        dislikes: (DinoName | DinosaurFamily)[]
    }
}

export type Dinosaurs = Dinosaur[]
export type RawDinosaur = Omit<Dinosaur, 'habitat' | 'feedType'>