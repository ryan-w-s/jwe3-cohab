import type { Dinosaur, DinoName, DinosaurFamily, Habitat, Needs } from '@/types'
import { dinosByName, dinosByHabitat } from './dinos'

/**
 * Describes a cohabitation conflict between two dinosaurs
 */
export interface CohabitationWarning {
    dinosaur: DinoName
    target: DinoName | DinosaurFamily
    reason: 'dislikes' | 'disliked_by'
}

/**
 * Manages a group of dinosaurs in an enclosure, tracking their combined needs
 * and detecting cohabitation conflicts.
 */
export class Enclosure {
    readonly habitat: Habitat
    private _dinosaurs: Map<DinoName, Dinosaur> = new Map()

    constructor(habitat: Habitat) {
        this.habitat = habitat
    }

    /**
     * Get all dinosaurs currently in the enclosure
     */
    get dinosaurs(): Dinosaur[] {
        return Array.from(this._dinosaurs.values())
    }

    /**
     * Add a dinosaur to the enclosure
     * @returns true if added, false if already present or wrong habitat
     */
    addDinosaur(dino: Dinosaur): boolean {
        if (dino.habitat !== this.habitat) {
            return false
        }
        if (this._dinosaurs.has(dino.name)) {
            return false
        }
        this._dinosaurs.set(dino.name, dino)
        return true
    }

    /**
     * Remove a dinosaur from the enclosure by name
     * @returns true if removed, false if not found
     */
    removeDinosaur(name: DinoName): boolean {
        return this._dinosaurs.delete(name)
    }

    /**
     * Get the combined needs of all dinosaurs in the enclosure.
     * For each need type, returns the maximum value required by any dinosaur.
     */
    getCombinedNeeds(): Needs {
        const combined: Needs = {}

        for (const dino of this._dinosaurs.values()) {
            for (const [key, value] of Object.entries(dino.needs)) {
                if (value !== undefined) {
                    combined[key] = Math.max(combined[key] ?? 0, value)
                }
            }
        }

        return combined
    }

    /**
     * Check for cohabitation conflicts between dinosaurs in the enclosure.
     * A conflict occurs when one dinosaur dislikes another dinosaur or its family.
     * Specific name interactions take precedence over family interactions.
     */
    getCohabitationWarnings(): CohabitationWarning[] {
        const warnings: CohabitationWarning[] = []
        const dinos = this.dinosaurs

        for (const dino of dinos) {
            for (const other of dinos) {
                if (dino.name === other.name) continue

                // 1. Check Specific Name Rule
                if (dino.cohabitation.dislikes.includes(other.name)) {
                    warnings.push({
                        dinosaur: dino.name,
                        target: other.name,
                        reason: 'dislikes',
                    })
                    continue
                }

                if (dino.cohabitation.likes.includes(other.name)) {
                    continue // Explicitly liked, strictly safe
                }

                // 2. Check Family Rule (only if no specific rule existed)
                if (dino.cohabitation.dislikes.includes(other.family)) {
                    warnings.push({
                        dinosaur: dino.name,
                        target: other.family,
                        reason: 'dislikes',
                    })
                }
            }
        }

        return warnings
    }

    /**
     * Get a sorted list of compatible dinosaurs that could be added to this enclosure.
     * Ranked by how well their needs overlap with the current combined needs.
     * Filters out dinosaurs that would cause cohabitation conflicts.
     */
    getSuggestedDinosaurs(): Array<{ dinosaur: Dinosaur, score: number }> {
        const candidates = dinosByHabitat[this.habitat] ?? []
        const currentNeeds = this.getCombinedNeeds()
        const suggestions: Array<{ dinosaur: Dinosaur, score: number }> = []

        for (const candidate of candidates) {
            // Skip if already in enclosure
            if (this._dinosaurs.has(candidate.name)) continue

            // Check for conflicts
            if (this.wouldCauseConflict(candidate)) continue

            // Calculate overlap score (higher = better fit)
            const score = this.calculateOverlapScore(candidate, currentNeeds)

            suggestions.push({ dinosaur: candidate, score })
        }

        // Sort by score descending (best fits first)
        suggestions.sort((a, b) => b.score - a.score)

        return suggestions
    }

    /**
     * Check if adding a dinosaur would cause any cohabitation conflicts
     */
    private wouldCauseConflict(candidate: Dinosaur): boolean {
        for (const dino of this._dinosaurs.values()) {
            // Check if candidate dislikes any current dinosaur
            if (this.hasConflict(candidate, dino)) return true

            // Check if any current dinosaur dislikes the candidate
            if (this.hasConflict(dino, candidate)) return true
        }
        return false
    }

    /**
     * Helper to check if source dino has a conflict with target dino
     */
    private hasConflict(source: Dinosaur, target: Dinosaur): boolean {
        // 1. Specific Name Precedence
        if (source.cohabitation.dislikes.includes(target.name)) return true
        if (source.cohabitation.likes.includes(target.name)) return false

        // 2. Family Fallback
        if (source.cohabitation.dislikes.includes(target.family)) return true

        return false
    }

    /**
     * Calculate how well a candidate's needs overlap with current combined needs.
     * Higher score = more overlap = dinosaur fits well without expanding needs much.
     */
    /**
     * Get the set of all active infrastructure types in the enclosure.
     */
    getCombinedInfrastructure(): Set<string> {
        const combined = new Set<string>()
        for (const dino of this.dinosaurs) {
            for (const infra of dino.layoutType) {
                combined.add(infra)
            }
        }
        return combined
    }

    /**
     * Calculate overlap score for a candidate dinosaur.
     * Scoring hierarchy:
     * 1. Social Likes (+50)
     * 2. Infrastructure Presence (+10 for existing, -2 for new)
     * 3. Capacity/Value Fit (+1 tie-breaker)
     */
    private calculateOverlapScore(candidate: Dinosaur, currentNeeds: Needs): number {
        let score = 0
        const existingInfra = this.getCombinedInfrastructure()

        // 1. Social Likes (Name OR Family)
        for (const dino of this._dinosaurs.values()) {
            let isLiked = false
            if (dino.cohabitation.likes.includes(candidate.name)) isLiked = true
            if (dino.cohabitation.likes.includes(candidate.family)) isLiked = true

            if (isLiked) score += 50
        }

        // 2. Infrastructure Presence
        for (const infra of candidate.layoutType) {
            if (existingInfra.has(infra)) {
                score += 10
            } else {
                score -= 2
            }
        }

        // 3. Optimization (Value Fit Tie-breaker)
        // Check if environmental needs fit within existing capacity envelopes
        // (This is a simplified optimization heuristic)
        for (const [key, value] of Object.entries(candidate.needs)) {
            if (value && value > 0 && (currentNeeds[key] ?? 0) > 0) {
                score += 1
            }
        }

        return score
    }
}

/**
 * Create a new empty enclosure for the specified habitat
 */
export function createEnclosure(habitat: Habitat): Enclosure {
    return new Enclosure(habitat)
}

/**
 * Get a dinosaur by name from the global registry
 */
export function getDinosaur(name: DinoName): Dinosaur | undefined {
    return dinosByName[name]
}
