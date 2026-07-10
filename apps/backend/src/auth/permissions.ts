import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'

const statement = {
  ...defaultStatements,
  antrean: ['call', 'recall', 'skip', 'finish'],
} as const

export const ac = createAccessControl(statement)

export const adminRole = ac.newRole({
  ...adminAc.statements,
})

export const petugasRole = ac.newRole({
  antrean: ['call', 'recall', 'skip', 'finish'],
})