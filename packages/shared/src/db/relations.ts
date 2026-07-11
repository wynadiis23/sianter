import { relations } from 'drizzle-orm'
import {
  user,
  session,
  account,
  verification,
  layanan,
  loket,
  loketLayanan,
  antrean,
  antreanLog,
  pemohon,
  sesi,
} from './schema'

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  antrean: many(antrean),
  antreanLog: many(antreanLog),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}))

export const verificationRelations = relations(verification, () => ({}))

export const layananRelations = relations(layanan, ({ many }) => ({
  loketLayanan: many(loketLayanan),
  antrean: many(antrean),
}))

export const loketRelations = relations(loket, ({ many }) => ({
  loketLayanan: many(loketLayanan),
  antrean: many(antrean),
}))

export const loketLayananRelations = relations(loketLayanan, ({ one }) => ({
  loket: one(loket, { fields: [loketLayanan.loketId], references: [loket.id] }),
  layanan: one(layanan, {
    fields: [loketLayanan.layananId],
    references: [layanan.id],
  }),
}))

export const pemohonRelations = relations(pemohon, ({ many }) => ({
  antrean: many(antrean),
}))

export const antreanRelations = relations(antrean, ({ one }) => ({
  layanan: one(layanan, { fields: [antrean.layananId], references: [layanan.id] }),
  loket: one(loket, { fields: [antrean.loketId], references: [loket.id] }),
  petugas: one(user, { fields: [antrean.petugasId], references: [user.id] }),
  pemohon: one(pemohon, { fields: [antrean.pemohonId], references: [pemohon.id] }),
  sesi: one(sesi, { fields: [antrean.sesiId], references: [sesi.id] }),
}))

export const antreanLogRelations = relations(antreanLog, ({ one }) => ({
  layanan: one(layanan, {
    fields: [antreanLog.layananId],
    references: [layanan.id],
  }),
  loket: one(loket, { fields: [antreanLog.loketId], references: [loket.id] }),
  petugas: one(user, { fields: [antreanLog.petugasId], references: [user.id] }),
  pemohon: one(pemohon, { fields: [antreanLog.pemohonId], references: [pemohon.id] }),
  sesi: one(sesi, { fields: [antreanLog.sesiId], references: [sesi.id] }),
}))

export const sesiRelations = relations(sesi, ({ many }) => ({
  antrean: many(antrean),
}))
