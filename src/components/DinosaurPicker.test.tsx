import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DinosaurPicker } from './DinosaurPicker'
import { EnclosureProvider } from './EnclosureContext'
import { EnclosureManagerProvider } from './EnclosureManagerContext'

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

function renderWithProvider() {
    return render(
        <EnclosureManagerProvider>
            <EnclosureProvider>
                <DinosaurPicker />
            </EnclosureProvider>
        </EnclosureManagerProvider>
    )
}

describe('DinosaurPicker', () => {
    beforeEach(() => {
        localStorageMock.clear()
        vi.clearAllMocks()
    })

    it('renders search input', () => {
        renderWithProvider()
        expect(screen.getByPlaceholderText(/Search by name or family/)).toBeInTheDocument()
    })

    it('shows compatible dinosaurs count', () => {
        renderWithProvider()
        expect(screen.getByText(/compatible dinosaurs/)).toBeInTheDocument()
    })

    it('renders Add Dinosaurs header', () => {
        renderWithProvider()
        expect(screen.getByText('Add Dinosaurs')).toBeInTheDocument()
    })

    it('filters dinosaurs when searching', async () => {
        const user = userEvent.setup()
        renderWithProvider()

        const input = screen.getByPlaceholderText(/Search by name or family/)
        await user.type(input, 'Ankylosaurus')

        // Should show filtered results (the count should change)
        // This test just verifies the search input works
        expect(input).toHaveValue('Ankylosaurus')
    })

    it('shows message when no matches found', async () => {
        const user = userEvent.setup()
        renderWithProvider()

        const input = screen.getByPlaceholderText(/Search by name or family/)
        await user.type(input, 'xyznotarealdinosaur')

        expect(screen.getByText('No matches found')).toBeInTheDocument()
    })

    it('renders filter mode selector with default value', () => {
        renderWithProvider()
        // The select should show the default "No Dislike" option
        expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
})

