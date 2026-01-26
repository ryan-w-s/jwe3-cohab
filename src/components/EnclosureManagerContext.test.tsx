import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

// Test component to access context
function TestConsumer() {
    const ctx = useEnclosureManager()
    return (
        <div>
            <span data-testid="count">{ctx.enclosures.length}</span>
            <span data-testid="active">{ctx.activeEnclosureId ?? 'none'}</span>
            <span data-testid="active-name">{ctx.activeEnclosure?.name ?? 'none'}</span>
            <button onClick={() => ctx.createEnclosure()}>Create</button>
            <button onClick={() => ctx.createEnclosure('Custom Name', 'aviary')}>Create Custom</button>
            {ctx.enclosures.map(e => (
                <div key={e.id}>
                    <button onClick={() => ctx.selectEnclosure(e.id)}>Select {e.name}</button>
                    <button onClick={() => ctx.renameEnclosure(e.id, 'Renamed')}>Rename {e.name}</button>
                    <button onClick={() => ctx.deleteEnclosure(e.id)}>Delete {e.name}</button>
                </div>
            ))}
        </div>
    )
}

describe('EnclosureManagerContext', () => {
    beforeEach(() => {
        localStorageMock.clear()
        vi.clearAllMocks()
    })

    it('starts with a default enclosure', () => {
        render(
            <EnclosureManagerProvider>
                <TestConsumer />
            </EnclosureManagerProvider>
        )
        // Now starts with 1 default enclosure
        expect(screen.getByTestId('count').textContent).toBe('1')
        expect(screen.getByTestId('active-name').textContent).toBe('Enclosure 1')
    })

    it('creates additional enclosures', async () => {
        const user = userEvent.setup()
        render(
            <EnclosureManagerProvider>
                <TestConsumer />
            </EnclosureManagerProvider>
        )

        // Starts with 1, creates another
        expect(screen.getByTestId('count').textContent).toBe('1')
        await user.click(screen.getByText('Create'))

        await waitFor(() => {
            expect(screen.getByTestId('count').textContent).toBe('2')
            expect(screen.getByTestId('active-name').textContent).toBe('New Enclosure')
        })
    })

    it('creates enclosure with custom name and habitat', async () => {
        const user = userEvent.setup()
        render(
            <EnclosureManagerProvider>
                <TestConsumer />
            </EnclosureManagerProvider>
        )

        await user.click(screen.getByText('Create Custom'))

        await waitFor(() => {
            expect(screen.getByTestId('active-name').textContent).toBe('Custom Name')
        })
    })

    it('renames enclosure', async () => {
        const user = userEvent.setup()
        render(
            <EnclosureManagerProvider>
                <TestConsumer />
            </EnclosureManagerProvider>
        )

        // Rename the default enclosure
        await waitFor(() => {
            expect(screen.getByText('Rename Enclosure 1')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Rename Enclosure 1'))

        await waitFor(() => {
            expect(screen.getByTestId('active-name').textContent).toBe('Renamed')
        })
    })

    it('deletes enclosure', async () => {
        const user = userEvent.setup()
        render(
            <EnclosureManagerProvider>
                <TestConsumer />
            </EnclosureManagerProvider>
        )

        // Delete the default enclosure
        expect(screen.getByTestId('count').textContent).toBe('1')
        await user.click(screen.getByText('Delete Enclosure 1'))

        await waitFor(() => {
            expect(screen.getByTestId('count').textContent).toBe('0')
        })
    })

    it('throws error when used outside provider', () => {
        const originalError = console.error
        console.error = vi.fn()

        expect(() => render(<TestConsumer />)).toThrow(
            'useEnclosureManager must be used within an EnclosureManagerProvider'
        )

        console.error = originalError
    })
})
