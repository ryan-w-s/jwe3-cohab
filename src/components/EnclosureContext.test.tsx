import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnclosureProvider, useEnclosure } from './EnclosureContext'

// Test component to access context values
function TestConsumer() {
    const ctx = useEnclosure()
    return (
        <div>
            <span data-testid="habitat">{ctx.habitat}</span>
            <span data-testid="dino-count">{ctx.dinosaurs.length}</span>
            <button onClick={() => ctx.addDino('Ankylosaurus')}>Add Anky</button>
            <button onClick={() => ctx.removeDino('Ankylosaurus')}>Remove Anky</button>
            <button onClick={() => ctx.setHabitat('aviary')}>Switch to Aviary</button>
        </div>
    )
}

describe('EnclosureContext', () => {
    it('provides default fence habitat', () => {
        render(
            <EnclosureProvider>
                <TestConsumer />
            </EnclosureProvider>
        )
        expect(screen.getByTestId('habitat').textContent).toBe('fence')
    })

    it('allows setting initial habitat', () => {
        render(
            <EnclosureProvider initialHabitat="lagoon">
                <TestConsumer />
            </EnclosureProvider>
        )
        expect(screen.getByTestId('habitat').textContent).toBe('lagoon')
    })

    it('allows adding a dinosaur', async () => {
        const user = userEvent.setup()
        render(
            <EnclosureProvider>
                <TestConsumer />
            </EnclosureProvider>
        )

        expect(screen.getByTestId('dino-count').textContent).toBe('0')
        await user.click(screen.getByText('Add Anky'))
        await waitFor(() => {
            expect(screen.getByTestId('dino-count').textContent).toBe('1')
        })
    })

    it('allows removing a dinosaur', async () => {
        const user = userEvent.setup()
        render(
            <EnclosureProvider>
                <TestConsumer />
            </EnclosureProvider>
        )

        await user.click(screen.getByText('Add Anky'))
        await waitFor(() => {
            expect(screen.getByTestId('dino-count').textContent).toBe('1')
        })
        await user.click(screen.getByText('Remove Anky'))
        await waitFor(() => {
            expect(screen.getByTestId('dino-count').textContent).toBe('0')
        })
    })

    it('allows switching habitat', async () => {
        const user = userEvent.setup()
        render(
            <EnclosureProvider>
                <TestConsumer />
            </EnclosureProvider>
        )

        await user.click(screen.getByText('Switch to Aviary'))
        await waitFor(() => {
            expect(screen.getByTestId('habitat').textContent).toBe('aviary')
        })
    })

    it('throws error when used outside provider', () => {
        // Suppress console.error for this test  
        const originalError = console.error
        console.error = vi.fn()

        expect(() => render(<TestConsumer />)).toThrow('useEnclosure must be used within an EnclosureProvider')

        console.error = originalError
    })
})
