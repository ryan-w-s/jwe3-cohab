import { IconPlus, IconX } from '@tabler/icons-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NeedsDisplay } from './NeedsDisplay'
import type { Dinosaur } from '@/types'

interface DinoCardProps {
    dinosaur: Dinosaur
    variant: 'enclosure' | 'picker'
    score?: number
    onAdd?: () => void
    onRemove?: () => void
}

export function DinoCard({ dinosaur, variant, score, onAdd, onRemove }: DinoCardProps) {
    return (
        <Card className="group relative hover:bg-accent/50 transition-colors">
            <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm truncate">{dinosaur.name}</h3>
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                                {dinosaur.family}
                            </Badge>
                        </div>
                        <NeedsDisplay needs={dinosaur.needs} variant="compact" />
                        {dinosaur.social.min_population > 1 && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Min. population: {dinosaur.social.min_population}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {variant === 'picker' && score !== undefined && (
                            <span className="text-xs text-muted-foreground font-mono">
                                +{score}
                            </span>
                        )}
                        {variant === 'picker' && onAdd && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={onAdd}
                                aria-label={`Add ${dinosaur.name}`}
                            >
                                <IconPlus className="h-4 w-4" />
                            </Button>
                        )}
                        {variant === 'enclosure' && onRemove && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={onRemove}
                                aria-label={`Remove ${dinosaur.name}`}
                            >
                                <IconX className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
