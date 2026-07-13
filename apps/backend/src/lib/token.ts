import { randomBytes } from 'node:crypto'

export function generateShortToken(): string {
  return randomBytes(4).toString('hex').toUpperCase()
}
