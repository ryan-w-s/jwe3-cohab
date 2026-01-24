import { describe, it, expect, test } from 'vitest'
import { screen } from '@testing-library/react'

describe('App', () => {
    it('should pass a simple assertion', () => {
        expect(1 + 1).toBe(2)
    })

    test('environment setup', () => {
        const element = document.createElement('div')
        element.textContent = 'Hello World'
        document.body.appendChild(element)
        expect(screen.getByText('Hello World')).toBeInTheDocument()
    })
})
