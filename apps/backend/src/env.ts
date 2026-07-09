function required(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`${key} is required in environment`)
  return v
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET'),
  BASE_URL: process.env.BASE_URL ?? 'http://localhost:3000',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
} as const
