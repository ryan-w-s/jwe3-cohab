import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnclosureProvider, useEnclosure } from './EnclosureContext'
import { EnclosureManagerProvider, useEnclosureManager } from './EnclosureManagerContext'

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value
        }),
        clear: () => {
            store = {}
        },
    }
})()

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
})

// Test component to access context values
function TestConsumer() {
    const ctx = useEnclosure()
    const manager = useEnclosureManager()
    return (
        <div>
            <span data-testid="habitat">{ctx.habitat}</span>
            <span data-testid="dino-count">{ctx.dinosaurs.length}</span>
            <span data-testid="has-active">{ctx.hasActiveEnclosure ? 'yes' : 'no'}</span>
            <button onClick={() => ctx.addDino('Ankylosaurus')}>Add Anky</button>
            <button onClick={() => ctx.removeDino('Ankylosaurus')}>Remove Anky</button>
            <button onClick={() => ctx.setHabitat('aviary')}>Switch to Aviary</button>
            <button onClick={() => manager.createEnclosure()}>Create Enclosure</button>
        </div>
    )
}

// Wrapper that provides both contexts
function TestWrapper({ children, initialHabitat = 'fence' }: { children: React.ReactNode, initialHabitat?: 'fence' | 'aviary' | 'lagoon' }) {
    return (
        <EnclosureManagerProvider>
            <EnclosureProvider initialHabitat={initialHabitat}>
                {children}
            </EnclosureProvider>
        </EnclosureManagerProvider>
    )
}

describe('EnclosureContext', () => {
    beforeEach(() => {
        localStorageMock.clear()
        vi.clearAllMocks()
    })

    it('provides default fence habitat', () => {
        render(
            <TestWrapper>
                <TestConsumer />
            </TestWrapper>
        )
        expect(screen.getByTestId('habitat').textContent).toBe('fence')
    })

    it('allows setting initial habitat', () => {
        render(
            <TestWrapper initialHabitat="lagoon">
                <TestConsumer />
            </TestWrapper>
        )
        expect(screen.getByTestId('habitat').textContent).toBe('lagoon')
    })

    it('indicates no active enclosure when empty', () => {
        render(
            <TestWrapper>
                <TestConsumer />
            </TestWrapper>
        )
        expect(screen.getByTestId('has-active').textContent).toBe('no')
    })

    it('allows adding a dinosaur when enclosure exists', async () => {
        const user = userEvent.setup()
        render(
            <TestWrapper>
                <TestConsumer />
            </TestWrapper>
        )

        // Create an enclosure first
        await user.click(screen.getByText('Create Enclosure'))
        await waitFor(() => {
            expect(screen.getByTestId('has-active').textContent).toBe('yes')
        })

        expect(screen.getByTestId('dino-count').textContent).toBe('0')
        await user.click(screen.getByText('Add Anky'))
        await waitFor(() => {
            expect(screen.getByTestId('dino-count').textContent).toBe('1')
        })
    })

    it('allows removing a dinosaur', async () => {
        const user = userEvent.setup()
        render(
            <TestWrapper>
                <TestConsumer />
            </TestWrapper>
        )

        await user.click(screen.getByText('Create Enclosure'))
        await user.click(screen.getByText('Add Anky'))
        await waitFor(() => {
            expect(screen.getByTestId('dino-count').textContent).toBe('1')
        })
        await user.click(screen.getByText('Remove Anky'))
        await waitFor(() => {
            expect(screen.getByTestId('dino-count').textContent).toBe('0')
        })
    })

    it('throws error when used outside provider', () => {
        // Suppress console.error for this test  
        const originalError = console.error
        console.error = vi.fn()

        // useEnclosure is called first in TestConsumer, so its error is thrown first
        expect(() => render(<TestConsumer />)).toThrow('useEnclosure must be used within an EnclosureProvider')

        console.error = originalError
    })
})

