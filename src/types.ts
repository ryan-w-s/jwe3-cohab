export type DinosaurFamily = string // E.g., "Ornithomimosaurid", "Carnivores"

export interface Dinosaur {
    name: string // Acts as the unique identifier
    family: DinosaurFamily
    /**
     * Needs are represented as fractions (0.0 - 1.0) for percentages,
     * or absolute values for specific counts (like fish).
     */
    needs: {
        cover?: number
        pasture?: number
        water?: number
        ground_fiber?: number
        fish?: number
        // ... other potential needs
        [key: string]: number | undefined // Allow flexibility for other needs
    }
    social: {
        min_population: number
        max_population?: number
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