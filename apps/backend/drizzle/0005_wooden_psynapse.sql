ALTER TABLE "pengaturan" ADD COLUMN "youtube_video_url" text;--> statement-breakpoint
ALTER TABLE "pengaturan" ADD COLUMN "youtube_playlist_url" text;--> statement-breakpoint
ALTER TABLE "pengaturan" ADD COLUMN "slideshow_images" text;--> statement-breakpoint
ALTER TABLE "pengaturan" ADD COLUMN "slideshow_interval" integer DEFAULT 5 NOT NULL;