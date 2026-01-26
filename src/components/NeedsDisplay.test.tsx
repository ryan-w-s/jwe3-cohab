import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NeedsDisplay } from './NeedsDisplay'

describe('NeedsDisplay', () => {
    it('shows "No requirements" when needs are empty', () => {
        render(<NeedsDisplay needs={{}} />)
        expect(screen.getByText('No requirements')).toBeInTheDocument()
    })

    it('renders terrain needs with progress bars in full variant', () => {
        render(<NeedsDisplay needs={{ pasture: 0.5, cover: 0.2 }} variant="full" />)
        expect(screen.getByText('Terrain')).toBeInTheDocument()
        expect(screen.getByText('Pasture')).toBeInTheDocument()
        expect(screen.getByText('Cover')).toBeInTheDocument()
        expect(screen.getByText('50%')).toBeInTheDocument()
        expect(screen.getByText('20%')).toBeInTheDocument()
    })

    it('renders compact variant as badges', () => {
        render(<NeedsDisplay needs={{ pasture: 0.5, water: 0.1 }} variant="compact" />)
        expect(screen.getByText('Pasture')).toBeInTheDocument()
        expect(screen.getByText('Water')).toBeInTheDocument()
        // Should not show percentages in compact mode
        expect(screen.queryByText('50%')).not.toBeInTheDocument()
    })

    it('formats absolute values correctly (not as percentages)', () => {
        render(<NeedsDisplay needs={{ fish: 0.5, meat: 1.0 }} variant="full" />)
        expect(screen.getByText('0.5')).toBeInTheDocument()
        expect(screen.getByText('1.0')).toBeInTheDocument()
    })

    it('groups needs by category', () => {
        render(<NeedsDisplay needs={{ pasture: 0.3, water: 0.1, ground_leaf: 0.4 }} variant="full" />)
        expect(screen.getByText('Terrain')).toBeInTheDocument()
        // Water appears both as category heading and as need label under that category
        const waterElements = screen.getAllByText('Water')
        expect(waterElements.length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText('Food')).toBeInTheDocument()
    })
})
