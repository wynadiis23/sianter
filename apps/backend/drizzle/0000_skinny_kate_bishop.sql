CREATE TABLE "account" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"account_id" varchar NOT NULL,
	"provider_id" varchar NOT NULL,
	"access_token" varchar,
	"refresh_token" varchar,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" varchar,
	"id_token" varchar,
	"password" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "antrean" (
	"id" varchar PRIMARY KEY NOT NULL,
	"kode" varchar(10) NOT NULL,
	"nomor_urut" integer NOT NULL,
	"layanan_id" varchar NOT NULL,
	"loket_id" varchar,
	"status" varchar(20) DEFAULT 'WAITING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"called_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"skipped_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "antrean_log" (
	"id" varchar PRIMARY KEY NOT NULL,
	"kode" varchar(10) NOT NULL,
	"nomor_urut" integer NOT NULL,
	"layanan_id" varchar NOT NULL,
	"loket_id" varchar,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"called_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"skipped_at" timestamp with time zone,
	"archived_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "layanan" (
	"id" varchar PRIMARY KEY NOT NULL,
	"nama" varchar(100) NOT NULL,
	"prefix" varchar(3) NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loket" (
	"id" varchar PRIMARY KEY NOT NULL,
	"nomor" integer NOT NULL,
	"nama" varchar(100),
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loket_nomor_unique" UNIQUE("nomor")
);
--> statement-breakpoint
CREATE TABLE "loket_layanan" (
	"id" varchar PRIMARY KEY NOT NULL,
	"loket_id" varchar NOT NULL,
	"layanan_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loket_layanan_unique" UNIQUE("loket_id","layanan_id")
);
--> statement-breakpoint
CREATE TABLE "pengaturan" (
	"id" varchar PRIMARY KEY NOT NULL,
	"mode_antrean" varchar(20) DEFAULT 'FIFO_GLOBAL' NOT NULL,
	"running_text" text,
	"media_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" varchar,
	"user_agent" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" varchar,
	"role" varchar(50) DEFAULT 'PETUGAS_LOKET' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" varchar PRIMARY KEY NOT NULL,
	"identifier" varchar NOT NULL,
	"value" varchar NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "antrean" ADD CONSTRAINT "antrean_layanan_id_layanan_id_fk" FOREIGN KEY ("layanan_id") REFERENCES "public"."layanan"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "antrean" ADD CONSTRAINT "antrean_loket_id_loket_id_fk" FOREIGN KEY ("loket_id") REFERENCES "public"."loket"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loket_layanan" ADD CONSTRAINT "loket_layanan_loket_id_loket_id_fk" FOREIGN KEY ("loket_id") REFERENCES "public"."loket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loket_layanan" ADD CONSTRAINT "loket_layanan_layanan_id_layanan_id_fk" FOREIGN KEY ("layanan_id") REFERENCES "public"."layanan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;