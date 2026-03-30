import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#152344_0%,#203460_28%,#f7f3ea_29%,#fffdf8_100%)] px-4 py-16">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[36px] bg-white shadow-[0_40px_120px_rgba(9,18,42,0.2)]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <section className="bg-[#152344] px-8 py-12 text-white sm:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-300">
              Admin workspace
            </p>
            <h1 className="mt-6 text-4xl font-black leading-tight">
              Devine Premium booking control center.
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-slate-300">
              Separate operations dashboard for booking approval, payment status,
              and customer history. This app is designed to run on its own host
              and talk only to the backend API.
            </p>
          </section>

          <section className="flex flex-col justify-center px-8 py-12 sm:px-12">
            <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-8">
              <h2 className="text-2xl font-black text-slate-900">
                Ready to manage bookings
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Sign in with an admin email account to update booking status,
                mark payments, and review user history from one place.
              </p>
              <Link
                href="/login"
                className="mt-8 inline-flex rounded-full bg-[#A65A2A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8f4d23]"
              >
                Open admin login
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
