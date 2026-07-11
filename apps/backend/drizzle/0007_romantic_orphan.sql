ALTER TABLE "pemohon" DROP CONSTRAINT "pemohon_nik_unique";--> statement-breakpoint
ALTER TABLE "pemohon" ALTER COLUMN "no_hp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pemohon" DROP COLUMN "nik";--> statement-breakpoint
ALTER TABLE "pemohon" ADD CONSTRAINT "pemohon_no_hp_unique" UNIQUE("no_hp");