import { Link } from 'react-router-dom'
import { Monitor, Ticket, Smartphone, Search, ClipboardList, Calendar, BarChart3, Settings, Accessibility, ArrowRight, ChevronRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

const features = [
  {
    icon: Ticket,
    title: 'Kiosk Mandiri',
    desc: 'Pengambilan nomor antrean mandiri melalui layar sentuh. Cetak bukti dengan kode QR.',
  },
  {
    icon: Monitor,
    title: 'Monitor Display',
    desc: 'Layar TV publik menampilkan antrean dipanggil per loket, media slideshow, dan running text.',
  },
  {
    icon: Smartphone,
    title: 'Reservasi Online',
    desc: 'Ambil nomor antrean dari rumah. Pilih layanan dan sesi waktu, datang pas dilayani.',
  },
  {
    icon: Search,
    title: 'Tracking Real-time',
    desc: 'Pantau posisi antrean secara langsung via token — dari rumah atau ruang tunggu.',
  },
]

const steps = [
  { num: '01', title: 'Ambil Nomor Antrean', desc: 'Via kiosk mandiri di lokasi atau reservasi online dari rumah.' },
  { num: '02', title: 'Tunggu Panggilan', desc: 'Pantau nomor Anda di monitor display atau lacak via token.' },
  { num: '03', title: 'Dilayani Petugas', desc: 'Petugas memanggil, melayani, dan menyelesaikan antrean Anda.' },
]

const adminFeatures = [
  { icon: ClipboardList, title: 'Layanan & Loket', desc: 'Atur jenis layanan dan loket yang menanganinya.' },
  { icon: Calendar, title: 'Sesi Reservasi', desc: 'Tentukan sesi waktu dengan kuota untuk reservasi online.' },
  { icon: BarChart3, title: 'Rekap & Analitik', desc: 'Filter data, ringkasan per-layanan, ekspor CSV.' },
  { icon: Settings, title: 'Pengaturan Sistem', desc: 'Mode antrean, running text, media YouTube, slideshow.' },
]

const aksesibilitas = [
  'Ukuran teks normal, besar, dan ekstra besar',
  'Mode kontras tinggi untuk visibilitas optimal',
  'Font ramah disleksia (Atkinson Hyperlegible)',
  'Pengumuman suara otomatis (TTS) untuk nomor antrean',
]

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { ref: featureRef, inView: featuresInView } = useInView()
  const { ref: stepRef, inView: stepsInView } = useInView()

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="font-wordmark text-xl tracking-tight">
              Sianter
            </Link>
            <nav className="hidden items-center gap-8 md:flex" aria-label="Navigasi utama">
              <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Fitur
              </a>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Masuk</Link>
              </Button>
              <Button asChild size="sm" className="bg-accent-leaf text-white hover:bg-accent-leaf-dim">
                <Link to="/antrean-online">Reservasi Online</Link>
              </Button>
            </nav>
            <button
              className="flex size-10 items-center justify-center md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
          {menuOpen && (
            <nav className="flex flex-col gap-3 border-t border-border pb-4 pt-3 md:hidden" aria-label="Navigasi mobile">
              <a
                href="#features"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                Fitur
              </a>
              <Link
                to="/login"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                Masuk
              </Link>
              <Button asChild size="sm" className="bg-accent-leaf text-white hover:bg-accent-leaf-dim">
                <Link to="/antrean-online" onClick={() => setMenuOpen(false)}>Reservasi Online</Link>
              </Button>
            </nav>
          )}
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 font-wordmark text-sm tracking-[0.15em] text-accent-leaf uppercase">
              Sianter · Sistem Informasi Antrean
            </p>
            <h1 className="landing-headline font-wordmark text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Antrean Instansi yang{' '}
              <span className="text-accent-leaf">Tertib, Transparan,</span>
              {' '}dan Aksesibel
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Kiosk mandiri, monitor real-time, reservasi online, dan tracking — satu sistem terpadu
              untuk mengelola antrean instansi pemerintah secara efisien dan transparan.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="bg-accent-leaf text-white hover:bg-accent-leaf-dim">
                <Link to="/antrean-online">
                  Reservasi Online
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Masuk ke Panel Admin</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-border py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="mb-2 font-wordmark text-xs tracking-[0.15em] text-accent-leaf uppercase">
                Empat Pilar
              </p>
              <h2 className="font-wordmark text-3xl leading-tight tracking-tight sm:text-4xl">
                Layanan Inti
              </h2>
              <p className="mt-3 text-muted-foreground">
                Empat modul utama yang mencakup seluruh kebutuhan antrean instansi.
              </p>
            </div>
            <div
              ref={featureRef}
              className="grid gap-6 sm:grid-cols-2"
            >
              {features.map((f, i) => (
                <article
                  key={f.title}
                  className={`reveal-card rounded-lg border border-border p-6 transition-all duration-500 [animation-delay:${i * 100}ms] ${featuresInView ? 'is-visible' : ''}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-md bg-accent-leaf-surface">
                    <f.icon className="size-6 text-accent-leaf" aria-hidden="true" />
                  </div>
                  <h3 className="font-wordmark text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="mb-2 font-wordmark text-xs tracking-[0.15em] text-accent-leaf uppercase">
                Cara Kerja
              </p>
              <h2 className="font-wordmark text-3xl leading-tight tracking-tight sm:text-4xl">
                Bagaimana Cara Kerjanya
              </h2>
              <p className="mt-3 text-muted-foreground">
                Tiga langkah sederhana dari mengambil nomor hingga dilayani.
              </p>
            </div>
            <div
              ref={stepRef}
              className="grid gap-8 sm:grid-cols-3"
            >
              {steps.map((s, i) => (
                <article
                  key={s.num}
                  className={`reveal-card ${stepsInView ? 'is-visible' : ''}`}
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <span className="font-wordmark text-4xl font-bold text-accent-leaf/30 sm:text-5xl">
                    {s.num}
                  </span>
                  <h3 className="mt-2 font-wordmark text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-accent-leaf-surface/50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="mb-2 font-wordmark text-xs tracking-[0.15em] text-accent-leaf uppercase">
                Manajemen
              </p>
              <h2 className="font-wordmark text-3xl leading-tight tracking-tight sm:text-4xl">
                Manajemen Penuh
              </h2>
              <p className="mt-3 text-muted-foreground">
                Panel admin yang memberikan kendali penuh atas seluruh sistem antrean.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {adminFeatures.map((f) => (
                <article key={f.title} className="rounded-lg border border-border bg-background p-5">
                  <f.icon className="mb-3 size-5 text-accent-leaf" aria-hidden="true" />
                  <h3 className="font-wordmark text-base font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-accent-leaf-surface">
                <Accessibility className="size-7 text-accent-leaf" aria-hidden="true" />
              </div>
              <p className="mb-2 font-wordmark text-xs tracking-[0.15em] text-accent-leaf uppercase">
                Aksesibilitas
              </p>
              <h2 className="font-wordmark text-3xl leading-tight tracking-tight sm:text-4xl">
                Dirancang untuk Semua
              </h2>
              <p className="mt-3 text-muted-foreground">
                Sianter dibangun dengan prinsip aksesibilitas universal — setiap pengguna
                berhak mendapatkan pengalaman antrean yang nyaman.
              </p>
            </div>
            <ul className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
              {aksesibilitas.map((a) => (
                <li key={a} className="flex items-start gap-3 text-sm">
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-accent-leaf" aria-hidden="true" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border bg-accent-leaf-surface py-16 sm:py-24">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-wordmark text-3xl leading-tight tracking-tight sm:text-4xl">
              Akses Layanan Antrean
            </h2>
            <p className="mt-4 text-muted-foreground">
              Lakukan reservasi online dari rumah, atau kunjungi kiosk mandiri di lokasi.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-accent-leaf text-white hover:bg-accent-leaf-dim">
                <Link to="/antrean-online">
                  Reservasi Online
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">Masuk Admin</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-wordmark text-lg text-muted-foreground">
            Sistem Informasi Antrean Instansi Pemerintah
          </p>
          <div className="mt-6 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:gap-6">
            <span>© 2026 Sianter</span>
            <span className="hidden sm:inline">·</span>
            <span>Untuk keperluan internal instansi pemerintah</span>
            <span className="hidden sm:inline">·</span>
            <Link to="/login" className="underline underline-offset-2 hover:text-foreground">
              Masuk Admin
            </Link>
          </div>
        </div>
      </footer>

      <style>{`
        /* Hallmark · macrostructure: Workbench · genre: editorial · theme: Studio · enrichment: none · nav: N6 · footer: Ft5 */
        html, body { overflow-x: clip; }
        .landing-headline { overflow-wrap: anywhere; min-width: 0; }
        .reveal-card {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.5s var(--ease-enter), transform 0.5s var(--ease-enter);
        }
        .reveal-card.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal-card {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </>
  )
}
