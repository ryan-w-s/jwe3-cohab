import { EnclosureProvider } from '@/components/EnclosureContext'
import { EnclosurePanel } from '@/components/EnclosurePanel'
import { DinosaurPicker } from '@/components/DinosaurPicker'

export function App() {
    return (
        <EnclosureProvider>
            <div className="h-screen flex flex-col bg-background">
                {/* Header */}
                <header className="border-b px-6 py-4 shrink-0">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                        JWE3 Cohabitation Guide
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Build the perfect enclosure for your dinosaurs
                    </p>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex min-h-0">
                    {/* Left Panel - Enclosure */}
                    <aside className="w-[400px] border-r flex flex-col bg-card">
                        <EnclosurePanel />
                    </aside>

                    {/* Right Panel - Picker */}
                    <section className="flex-1 flex flex-col bg-background">
                        <DinosaurPicker />
                    </section>
                </main>
            </div>
        </EnclosureProvider>
    )
}

export default App