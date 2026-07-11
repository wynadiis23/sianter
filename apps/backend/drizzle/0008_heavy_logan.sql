ALTER TABLE "antrean" ADD COLUMN "tracking_token" varchar(32);
ALTER TABLE "antrean_log" ADD COLUMN "tracking_token" varchar(32);

UPDATE "antrean" SET "tracking_token" = md5(random()::text || clock_timestamp()::text) WHERE "tracking_token" IS NULL;
UPDATE "antrean_log" SET "tracking_token" = md5(random()::text || clock_timestamp()::text) WHERE "tracking_token" IS NULL;

ALTER TABLE "antrean" ALTER COLUMN "tracking_token" SET NOT NULL;
ALTER TABLE "antrean_log" ALTER COLUMN "tracking_token" SET NOT NULL;
ALTER TABLE "antrean" ADD CONSTRAINT "antrean_tracking_token_unique" UNIQUE("tracking_token");
