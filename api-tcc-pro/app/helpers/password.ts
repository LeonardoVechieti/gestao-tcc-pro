import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64
const SALT_LENGTH = 16

export function hashPassword(password: string) {
  const salt = randomBytes(SALT_LENGTH).toString('hex')
  const derivedKey = scryptSync(password, salt, KEY_LENGTH)
  return `${salt}:${derivedKey.toString('hex')}`
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(':')
  if (!salt || !key) {
    return false
  }

  const derivedKey = scryptSync(password, salt, KEY_LENGTH)
  const storedKey = Buffer.from(key, 'hex')

  if (storedKey.length !== derivedKey.length) {
    return false
  }

  return timingSafeEqual(derivedKey, storedKey)
}
