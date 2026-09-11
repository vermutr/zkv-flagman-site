import { expect, test } from 'vitest'

test('vitest runs in node', () => {
  expect(typeof process.version).toBe('string')
})
