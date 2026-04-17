import { describe, it, expect, beforeEach } from 'vitest'
import { TokenStorage } from './TokenStorage'

const KEY = 'she_refresh_token'

describe('TokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('get returns null when no token is stored', () => {
    expect(TokenStorage.get()).toBeNull()
  })

  it('set stores the token in localStorage', () => {
    TokenStorage.set('my-refresh-token')
    expect(localStorage.getItem(KEY)).toBe('my-refresh-token')
  })

  it('get returns the stored token', () => {
    TokenStorage.set('my-refresh-token')
    expect(TokenStorage.get()).toBe('my-refresh-token')
  })

  it('set overwrites an existing token', () => {
    TokenStorage.set('old-token')
    TokenStorage.set('new-token')
    expect(TokenStorage.get()).toBe('new-token')
  })

  it('clear removes the token from localStorage', () => {
    TokenStorage.set('my-refresh-token')
    TokenStorage.clear()
    expect(TokenStorage.get()).toBeNull()
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('clear does not throw when no token is stored', () => {
    expect(() => TokenStorage.clear()).not.toThrow()
  })
})
