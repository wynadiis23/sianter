CREATE TABLE "kuesioner" (
	"id" varchar PRIMARY KEY NOT NULL,
	"layanan_id" varchar NOT NULL,
	"link" text NOT NULL,
	"caption" varchar(200) NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kuesioner_layanan_id_unique" UNIQUE("layanan_id")
);
--> statement-breakpoint
ALTER TABLE "kuesioner" ADD CONSTRAINT "kuesioner_layanan_id_layanan_id_fk" FOREIGN KEY ("layanan_id") REFERENCES "public"."layanan"("id") ON DELETE cascade ON UPDATE no action;