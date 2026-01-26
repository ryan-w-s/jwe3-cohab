import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DinoCard } from './DinoCard'
import type { Dinosaur } from '@/types'

const mockDino: Dinosaur = {
    name: 'Triceratops',
    family: 'Ceratopsid',
    habitat: 'fence',
    layoutType: ['fiber'],
    needs: { pasture: 0.3, water: 0.1 },
    social: { min_population: 2 },
    cohabitation: { likes: [], dislikes: [] },
}

describe('DinoCard', () => {
    it('renders dinosaur name and family', () => {
        render(<DinoCard dinosaur={mockDino} variant="picker" />)
        expect(screen.getByText('Triceratops')).toBeInTheDocument()
        expect(screen.getByText('Ceratopsid')).toBeInTheDocument()
    })

    it('shows needs in compact format', () => {
        render(<DinoCard dinosaur={mockDino} variant="picker" />)
        expect(screen.getByText('Pasture')).toBeInTheDocument()
        expect(screen.getByText('Water')).toBeInTheDocument()
    })

    it('shows minimum population when greater than 1', () => {
        render(<DinoCard dinosaur={mockDino} variant="picker" />)
        expect(screen.getByText('Min. population: 2')).toBeInTheDocument()
    })

    it('shows score in picker variant', () => {
        render(<DinoCard dinosaur={mockDino} variant="picker" score={50} />)
        expect(screen.getByText('+50')).toBeInTheDocument()
    })

    it('shows add button in picker variant', async () => {
        const onAdd = vi.fn()
        const user = userEvent.setup()
        render(<DinoCard dinosaur={mockDino} variant="picker" onAdd={onAdd} />)

        await user.click(screen.getByLabelText('Add Triceratops'))
        expect(onAdd).toHaveBeenCalled()
    })

    it('shows remove button in enclosure variant', async () => {
        const onRemove = vi.fn()
        const user = userEvent.setup()
        render(<DinoCard dinosaur={mockDino} variant="enclosure" onRemove={onRemove} />)

        await user.click(screen.getByLabelText('Remove Triceratops'))
        expect(onRemove).toHaveBeenCalled()
    })

    it('does not show score in enclosure variant', () => {
        render(<DinoCard dinosaur={mockDino} variant="enclosure" score={50} />)
        expect(screen.queryByText('+50')).not.toBeInTheDocument()
    })
})
