import { useState } from 'react'
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconHome } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { useEnclosureManager } from './EnclosureManagerContext'

export function EnclosureManagerPanel() {
    const {
        enclosures,
        activeEnclosureId,
        createEnclosure,
        deleteEnclosure,
        renameEnclosure,
        selectEnclosure,
    } = useEnclosureManager()

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')

    const handleCreate = () => {
        createEnclosure()
    }

    const handleStartRename = (id: string, currentName: string) => {
        setEditingId(id)
        setEditName(currentName)
    }

    const handleConfirmRename = () => {
        if (editingId && editName.trim()) {
            renameEnclosure(editingId, editName.trim())
        }
        setEditingId(null)
        setEditName('')
    }

    const handleCancelRename = () => {
        setEditingId(null)
        setEditName('')
    }

    const handleDelete = (id: string) => {
        const enc = enclosures.find(e => e.id === id)
        if (enc && enc.dinosaurs.length > 0) {
            if (!window.confirm(`Delete "${enc.name}" with ${enc.dinosaurs.length} dinosaurs?`)) {
                return
            }
        }
        deleteEnclosure(id)
    }

    const getHabitatEmoji = (habitat: string) => {
        switch (habitat) {
            case 'fence': return '🏕️'
            case 'aviary': return '🦅'
            case 'lagoon': return '🌊'
            default: return '📦'
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <IconHome className="h-4 w-4" />
                        Enclosures
                    </h2>
                    <Button size="sm" variant="outline" onClick={handleCreate}>
                        <IconPlus className="h-4 w-4 mr-1" />
                        New
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    {enclosures.length} enclosure{enclosures.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Enclosure List */}
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-2 space-y-1">
                    {enclosures.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-8 px-4">
                            No enclosures yet. Create one to get started!
                        </div>
                    ) : (
                        enclosures.map(enc => (
                            <Card
                                key={enc.id}
                                className={`p-2 cursor-pointer transition-colors ${enc.id === activeEnclosureId
                                        ? 'bg-primary/10 border-primary'
                                        : 'hover:bg-muted/50'
                                    }`}
                                onClick={() => selectEnclosure(enc.id)}
                            >
                                {editingId === enc.id ? (
                                    <div className="flex items-center gap-1">
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleConfirmRename()
                                                if (e.key === 'Escape') handleCancelRename()
                                            }}
                                            className="h-7 text-sm"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleConfirmRename()
                                            }}
                                        >
                                            <IconCheck className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleCancelRename()
                                            }}
                                        >
                                            <IconX className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <span className="text-base">{getHabitatEmoji(enc.habitat)}</span>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-sm truncate">{enc.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {enc.dinosaurs.length} dino{enc.dinosaurs.length !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5 shrink-0">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleStartRename(enc.id, enc.name)
                                                }}
                                            >
                                                <IconEdit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-destructive hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDelete(enc.id)
                                                }}
                                            >
                                                <IconTrash className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
