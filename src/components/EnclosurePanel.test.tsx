import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EnclosurePanel } from './EnclosurePanel'
import { EnclosureProvider } from './EnclosureContext'

function renderWithProvider() {
    return render(
        <EnclosureProvider>
            <EnclosurePanel />
        </EnclosureProvider>
    )
}

describe('EnclosurePanel', () => {
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
