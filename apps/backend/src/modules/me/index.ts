import { Elysia } from 'elysia'
import { auth } from '../../auth/auth'

export const meModule = new Elysia().get(
  '/me',
  async ({ request, status }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    if (!session) return status(401)
    return session.user
  },
)
