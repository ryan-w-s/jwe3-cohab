import { IconAlertTriangle } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { DinoCard } from './DinoCard'
import { NeedsDisplay } from './NeedsDisplay'
import { useEnclosure } from './EnclosureContext'
import type { Habitat } from '@/types'

const habitatLabels: Record<Habitat, string> = {
    fence: '🏕️ Fence Enclosure',
    aviary: '🦅 Aviary',
    lagoon: '🌊 Lagoon',
}

export function EnclosurePanel() {
    const { habitat, dinosaurs, combinedNeeds, warnings, setHabitat, removeDino } = useEnclosure()

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Habitat Selector */}
            <div className="p-4 border-b">
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Habitat Type
                </label>
                <Select value={habitat} onValueChange={(v) => setHabitat(v as Habitat)}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="fence">{habitatLabels.fence}</SelectItem>
                        <SelectItem value="aviary">{habitatLabels.aviary}</SelectItem>
                        <SelectItem value="lagoon">{habitatLabels.lagoon}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Cohabitation Warnings */}
            {warnings.length > 0 && (
                <div className="p-4 bg-destructive/10 border-b">
                    <div className="flex items-center gap-2 mb-2">
                        <IconAlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">Cohabitation Conflicts</span>
                    </div>
                    <div className="space-y-1">
                        {warnings.map((warning, i) => (
                            <div key={i} className="text-xs text-destructive/80">
                                <strong>{warning.dinosaur}</strong> {warning.reason === 'dislikes' ? 'dislikes' : 'is disliked by'} <strong>{warning.target}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Dinosaur List */}
            <div className="flex-1 min-h-0 flex flex-col">
                <div className="p-4 pb-2 shrink-0">
                    <h2 className="text-sm font-medium">
                        Dinosaurs in Enclosure
                        <Badge variant="secondary" className="ml-2">{dinosaurs.length}</Badge>
                    </h2>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="px-4">
                            {dinosaurs.length === 0 ? (
                                <div className="text-sm text-muted-foreground py-8 text-center">
                                    No dinosaurs yet. Add some from the picker!
                                </div>
                            ) : (
                                <div className="space-y-2 pb-4">
                                    {dinosaurs.map(dino => (
                                        <DinoCard
                                            key={dino.name}
                                            dinosaur={dino}
                                            variant="enclosure"
                                            onRemove={() => removeDino(dino.name)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Combined Needs - Sticky at bottom */}
            <div className="shrink-0 border-t bg-card">
                <Card className="m-4 bg-muted/50">
                    <CardHeader className="pb-2 pt-3 px-3">
                        <CardTitle className="text-sm">Combined Requirements</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                        <NeedsDisplay needs={combinedNeeds} variant="full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
