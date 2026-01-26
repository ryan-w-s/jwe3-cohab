import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EnclosurePanel } from './EnclosurePanel'
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
                <EnclosurePanel />
            </EnclosureProvider>
        </EnclosureManagerProvider>
    )
}

describe('EnclosurePanel', () => {
    beforeEach(() => {
        localStorageMock.clear()
        vi.clearAllMocks()
    })

    it('renders habitat selector', () => {
        renderWithProvider()
        expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('shows empty state when no dinosaurs', () => {
        renderWithProvider()
        expect(screen.getByText(/No dinosaurs yet/)).toBeInTheDocument()
    })

    it('shows dinosaur count badge', () => {
        renderWithProvider()
        expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('displays Combined Requirements section', () => {
        renderWithProvider()
        expect(screen.getByText('Combined Requirements')).toBeInTheDocument()
    })

    it('displays Habitat Type label', () => {
        renderWithProvider()
        expect(screen.getByText('Habitat Type')).toBeInTheDocument()
    })
})

