import { useState, useMemo } from 'react'
import { IconSearch } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DinoCard } from './DinoCard'
import { useEnclosure } from './EnclosureContext'

export function DinosaurPicker() {
    const { suggestedDinos, addDino } = useEnclosure()
    const [search, setSearch] = useState('')

    const filteredDinos = useMemo(() => {
        if (!search.trim()) return suggestedDinos

        const query = search.toLowerCase()
        return suggestedDinos.filter(({ dinosaur }) =>
            dinosaur.name.toLowerCase().includes(query) ||
            dinosaur.family.toLowerCase().includes(query)
        )
    }, [suggestedDinos, search])

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Search Header */}
            <div className="p-4 border-b shrink-0">
                <h2 className="text-lg font-semibold mb-3">Add Dinosaurs</h2>
                <div className="relative">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or family..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    {filteredDinos.length} compatible dinosaurs
                </p>
            </div>

            {/* Dinosaur List */}
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 pt-2 space-y-2">
                    {filteredDinos.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-8">
                            {search ? 'No matches found' : 'No compatible dinosaurs available'}
                        </div>
                    ) : (
                        filteredDinos.map(({ dinosaur, score }) => (
                            <DinoCard
                                key={dinosaur.name}
                                dinosaur={dinosaur}
                                variant="picker"
                                score={score}
                                onAdd={() => addDino(dinosaur.name)}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
