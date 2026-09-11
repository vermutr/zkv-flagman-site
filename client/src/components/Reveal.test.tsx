import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { Reveal } from './Reveal'

afterEach(() => vi.unstubAllGlobals())

describe('Reveal', () => {
  it('shows content immediately when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<Reveal><p>Текст</p></Reveal>)
    expect(screen.getByText('Текст').closest('.reveal')).toHaveClass('is-visible')
  })

  it('reveals content once it intersects and then stops observing', () => {
    let callback: IntersectionObserverCallback = () => {}
    const observe = vi.fn()
    const unobserve = vi.fn()
    const disconnect = vi.fn()
    class FakeObserver {
      root = null
      rootMargin = ''
      thresholds = []
      observe = observe
      unobserve = unobserve
      disconnect = disconnect
      takeRecords = () => []
      constructor(cb: IntersectionObserverCallback) {
        callback = cb
      }
    }
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    render(<Reveal><p>Текст</p></Reveal>)
    const box = screen.getByText('Текст').closest('.reveal')!
    expect(box).not.toHaveClass('is-visible')
    expect(observe).toHaveBeenCalledWith(box)
    act(() => {
      callback([{ isIntersecting: true, target: box } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    expect(box).toHaveClass('is-visible')
    expect(disconnect).toHaveBeenCalled()
  })
})
