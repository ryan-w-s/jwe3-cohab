import { Progress } from '@/components/ui/progress'
import type { Needs } from '@/types'

// Group needs into categories for display
const TERRAIN_NEEDS = ['arid', 'barren', 'cover', 'pasture', 'wetland'] as const
const WATER_NEEDS = ['water', 'deep_water', 'open_water'] as const
const FOOD_NEEDS = [
    'ground_leaf', 'ground_fiber', 'ground_fruit', 'ground_nut',
    'tall_leaf', 'tall_fiber', 'tall_fruit', 'tall_nut',
    'meat', 'prey', 'fish', 'shark'
] as const

interface NeedsDisplayProps {
    needs: Needs
    variant?: 'full' | 'compact'
    className?: string
}

// Human-readable labels for needs
const needLabels: Record<string, string> = {
    arid: 'Arid',
    barren: 'Barren',
    cover: 'Cover',
    pasture: 'Pasture',
    wetland: 'Wetland',
    water: 'Water',
    deep_water: 'Deep Water',
    open_water: 'Open Water',
    ground_leaf: 'Ground Leaf',
    ground_fiber: 'Ground Fiber',
    ground_fruit: 'Ground Fruit',
    ground_nut: 'Ground Nut',
    tall_leaf: 'Tall Leaf',
    tall_fiber: 'Tall Fiber',
    tall_fruit: 'Tall Fruit',
    tall_nut: 'Tall Nut',
    meat: 'Meat',
    prey: 'Prey',
    fish: 'Fish',
    shark: 'Shark',
}

function formatNeedValue(key: string, value: number): string {
    // Fish, shark, prey, meat are absolute values
    if (['fish', 'shark', 'prey', 'meat'].includes(key)) {
        return value.toFixed(1)
    }
    // Others are percentages
    return `${Math.round(value * 100)}%`
}

function NeedBar({ needKey, value }: { needKey: string, value: number }) {
    const isPercentage = !['fish', 'shark', 'prey', 'meat'].includes(needKey)
    const progressValue = isPercentage ? value * 100 : Math.min(value * 100, 100)

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-24 truncate">
                {needLabels[needKey] || needKey}
            </span>
            <Progress value={progressValue} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground w-10 text-right">
                {formatNeedValue(needKey, value)}
            </span>
        </div>
    )
}

function renderNeedsGroup(title: string, needKeys: readonly string[], needs: Needs) {
    const activeNeeds = needKeys.filter(key => (needs[key] ?? 0) > 0)
    if (activeNeeds.length === 0) return null

    return (
        <div className="space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</h4>
            {activeNeeds.map(key => (
                <NeedBar key={key} needKey={key} value={needs[key]!} />
            ))}
        </div>
    )
}

export function NeedsDisplay({ needs, variant = 'full', className = '' }: NeedsDisplayProps) {
    const hasAnyNeeds = Object.values(needs).some(v => v && v > 0)

    if (!hasAnyNeeds) {
        return (
            <div className={`text-sm text-muted-foreground ${className}`}>
                No requirements
            </div>
        )
    }

    if (variant === 'compact') {
        // Compact: just show active need names as badges
        const activeNeeds = Object.entries(needs)
            .filter(([, value]) => value && value > 0)
            .map(([key]) => needLabels[key] || key)

        return (
            <div className={`flex flex-wrap gap-1 ${className}`}>
                {activeNeeds.map(label => (
                    <span
                        key={label}
                        className="px-1.5 py-0.5 text-[10px] bg-muted rounded-sm text-muted-foreground"
                    >
                        {label}
                    </span>
                ))}
            </div>
        )
    }

    // Full: show bars organized by category
    return (
        <div className={`space-y-3 ${className}`}>
            {renderNeedsGroup('Terrain', TERRAIN_NEEDS, needs)}
            {renderNeedsGroup('Water', WATER_NEEDS, needs)}
            {renderNeedsGroup('Food', FOOD_NEEDS, needs)}
        </div>
    )
}
