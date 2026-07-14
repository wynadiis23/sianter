CREATE TABLE "kegiatan" (
	"id" varchar PRIMARY KEY NOT NULL,
	"tanggal_waktu" text NOT NULL,
	"nama_kegiatan" text NOT NULL,
	"metode_rapat" text NOT NULL,
	"penyelenggara" text NOT NULL,
	"nomor_surat" text NOT NULL,
	"keterangan" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
