export type DinosaurFamily = string // E.g., "Ornithomimosaurid", "Carnivores"

export interface Dinosaur {
    name: string // Acts as the unique identifier
    family: DinosaurFamily
    /**
     * Needs are represented as fractions (0.0 - 1.0) for percentages,
     * or absolute values for specific counts (like fish).
     */
    needs: {
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
    social: {
        min_population: number
        min_males?: number
        max_males?: number
        min_females?: number
        max_females?: number
    }
    cohabitation: {
        likes: (string | DinosaurFamily)[]
        dislikes: (string | DinosaurFamily)[]
    }
}

export type Dinosaurs = Dinosaur[]