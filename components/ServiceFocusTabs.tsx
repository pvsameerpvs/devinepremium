"use client";

import FadeIn from "./FadeIn";

type FocusTab = {
  key: string;
  label: string;
  kicker?: string;
  description: string;
  bullets: string[];
  meta?: { label: string; value: string }[];
};

type ServiceFocusTabsProps = {
  eyebrow?: string;
  title: string;
  description: string;
  tabs: FocusTab[];
  sideCards?: { title: string; text: string }[];
};

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function ServiceFocusTabs({
  eyebrow = "Focus areas",
  title,
  description,
  tabs,
  sideCards,
}: ServiceFocusTabsProps) {
  if (!tabs.length) return null;

  const idFor = (key: string) => `focus-${key}`;
  const stepFor = (idx: number) => String(idx + 1).padStart(2, "0");

  return (
    <section className="py-14 sm:py-16 md:py-28 bg-[#F9FAFB] relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 h-[280px] w-[280px] sm:h-[340px] sm:w-[340px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-[320px] w-[320px] sm:h-[380px] sm:w-[380px] rounded-full bg-[#00223E]/10 blur-3xl" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8 relative">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-start">
          <FadeIn>
            <div className="lg:sticky lg:top-24 text-center">
              <div className="text-[11px] md:text-[13px] font-medium tracking-[0.2em] text-gray-500 uppercase">
                {eyebrow}
              </div>
              <h2 className="mt-4 sm:mt-5 text-[26px] sm:text-[28px] md:text-[36px] lg:text-[42px] font-medium text-[#2d3748] leading-[1.22] tracking-tight">
                {title}
              </h2>
              <p className="mt-4 sm:mt-5 text-[14.5px] md:text-[15.5px] text-gray-600 leading-relaxed font-medium max-w-[72ch] mx-auto">
                {description}
              </p>

              {sideCards?.length ? (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
                  {sideCards.slice(0, 4).map((item) => (
                    <div
                      key={item.title}
                      className="w-full rounded-2xl bg-white border border-gray-100 px-5 py-5 shadow-sm text-center"
                    >
                      <div className="text-[14.5px] font-bold text-gray-900 tracking-tight break-words">
                        {item.title}
                      </div>
                      <div className="mt-2 text-[13.5px] font-medium text-gray-600 leading-relaxed break-words">
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </FadeIn>

          <div>
            <FadeIn delay={0.1}>
              <div className="rounded-[2rem] bg-white border border-gray-100 shadow-[0_30px_80px_rgba(0,0,0,0.06)]">
                <div className="p-6 md:p-8 border-b border-gray-100">
                  <div className="flex flex-col items-center gap-5 text-center">
                    <div>
                      <div className="text-[11px] md:text-[12px] font-bold tracking-[0.25em] text-gray-500 uppercase">
                        Explore
                      </div>
                      <div className="mt-3 text-[15px] md:text-[18px] font-bold text-gray-900 tracking-tight">
                        Tap a tab to jump
                      </div>
                    </div>

                    <nav
                      className="w-full sm:w-auto flex items-center justify-start sm:justify-center gap-2 rounded-2xl sm:rounded-full bg-[#F3F6FA] border border-gray-100 p-1 overflow-x-auto max-w-full [-webkit-overflow-scrolling:touch]"
                      aria-label="Jump to a focus area"
                    >
                      {tabs.map((t) => (
                        <a
                          key={t.key}
                          href={`#${idFor(t.key)}`}
                          className="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-all text-gray-700 hover:text-gray-900 hover:bg-white"
                        >
                          {t.label}
                        </a>
                      ))}
                    </nav>
                  </div>
                </div>

                <div className="p-6 md:p-8 text-[13.5px] font-medium text-gray-600 leading-relaxed">
                  On mobile, the focus cards stack. On desktop, each card sticks as you scroll.
                </div>
              </div>
            </FadeIn>

            <div className="mt-8 relative">
              {tabs.map((t, idx) => (
                <div
                  key={t.key}
                  id={idFor(t.key)}
                  className="scroll-mt-24 sm:scroll-mt-28 md:scroll-mt-36 md:sticky md:top-28 mb-8 md:mb-14"
                  style={{ zIndex: idx + 10 }}
                >
                  <div className="rounded-[1.75rem] bg-[#00223E] text-white p-6 sm:p-7 md:p-8 overflow-hidden relative shadow-[0_30px_80px_rgba(0,0,0,0.10)] border border-white/10 min-h-0 md:min-h-[58vh] lg:min-h-[64vh] flex flex-col">
                    <div className="absolute inset-0 opacity-70">
                      <div className="absolute -top-24 -right-24 h-[260px] w-[260px] rounded-full bg-primary/30 blur-3xl" />
                      <div className="absolute -bottom-28 -left-24 h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl" />
                    </div>

                    <div className="relative flex-1 flex flex-col min-w-0">
                      <div className="flex items-start justify-between gap-6 flex-wrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-[12px] font-semibold tracking-wide text-white/90 backdrop-blur">
                              Focus {stepFor(idx)}
                            </div>
                            {t.kicker ? (
                              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-[12px] font-semibold tracking-wide text-white/90 backdrop-blur break-words">
                                {t.kicker}
                              </div>
                            ) : null}
                          </div>

                          <h3 className="mt-5 text-[22px] sm:text-[24px] md:text-[28px] font-bold tracking-tight leading-[1.15] break-words">
                            {t.label}
                          </h3>
                          <p className="mt-4 text-[14.5px] text-white/85 leading-relaxed font-medium max-w-[62ch] break-words">
                            {t.description}
                          </p>
                        </div>

                        {t.meta?.length ? (
                          <div className="w-full md:w-auto shrink-0 rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                            <div className="grid gap-3">
                              {t.meta.slice(0, 3).map((m) => (
                                <div key={m.label} className="min-w-0 md:min-w-[14rem]">
                                  <div className="text-[11px] font-bold tracking-[0.25em] text-white/65 uppercase">
                                    {m.label}
                                  </div>
                                  <div className="mt-1 text-[13.5px] font-semibold text-white/90 leading-snug break-words">
                                    {m.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-6 grid md:grid-cols-2 gap-4">
                        {t.bullets.slice(0, 6).map((b) => (
                          <div
                            key={b}
                            className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3 sm:px-5 sm:py-4 flex items-start gap-3 min-w-0"
                          >
                            <span className="mt-[2px] w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-white/90">
                              <CheckIcon />
                            </span>
                            <div className="text-[13.5px] font-semibold text-white/90 leading-snug break-words min-w-0">
                              {b}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto pt-8">
                        <div className="h-2 rounded-full bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="h-12 md:h-32" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
