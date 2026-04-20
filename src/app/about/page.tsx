"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";

/* ─────────────────────────────────────────
   Shared SVG shapes
───────────────────────────────────────── */

const Star4 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
    <path
      d="M20 0L21.3786 3.72556C23.9322 10.6267 29.3733 16.0678 36.2744 18.6214L40 20L36.2744 21.3786C29.3733 23.9322 23.9322 29.3733 21.3786 36.2744L20 40L18.6214 36.2744C16.0678 29.3733 10.6267 23.9322 3.72556 21.3786L0 20L3.72556 18.6214C10.6267 16.0678 16.0678 10.6267 18.6214 3.72556L20 0Z"
      fill="currentColor"
    />
  </svg>
);

const SnowflakeStar = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <path
      d="M25.6542 23.5548C55.4505 15.5634 47.0215 0.968559 25.2148 22.7915C47.0331 0.968559 32.4297 -7.45067 24.4517 22.352C32.4413 -7.45067 15.5833 -7.45067 23.5613 22.352C15.5717 -7.46223 0.979918 0.968557 22.7867 22.7799C0.979918 0.968557 -7.4491 15.5634 22.3473 23.5548C-7.4491 15.5634 -7.4491 32.425 22.3473 24.4452C-7.4491 32.4366 0.979918 47.0314 22.7867 25.2085C0.968357 47.0314 15.5717 55.4507 23.5498 25.648C15.5601 55.4507 32.4182 55.4507 24.4401 25.648C32.4297 55.4507 47.0215 47.0199 25.2032 25.2085C47.0215 47.0314 55.439 32.425 25.6426 24.4452C55.4505 32.425 55.4505 15.5634 25.6542 23.5548Z"
      fill="currentColor"
    />
  </svg>
);

const SpinningBadge = () => (
  <svg
    width="1em" height="1em"
    viewBox="0 0 328 329" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 animate-[spin_2.5s_linear_infinite] md:h-15 md:w-15"
  >
    <rect y="0.5" width="328" height="328" rx="164" fill="black" className="dark:fill-white" />
    <path d="M165.018 72.3008V132.771C165.018 152.653 148.9 168.771 129.018 168.771H70.2288" stroke="white" strokeWidth="20" className="dark:stroke-black" />
    <path d="M166.627 265.241L166.627 204.771C166.627 184.889 182.744 168.771 202.627 168.771L261.416 168.771" stroke="white" strokeWidth="20" className="dark:stroke-black" />
    <line x1="238.136" y1="98.8184"  x2="196.76"  y2="139.707" stroke="white" strokeWidth="20" className="dark:stroke-black" />
    <line x1="135.688" y1="200.957" x2="94.3128" y2="241.845" stroke="white" strokeWidth="20" className="dark:stroke-black" />
    <line x1="133.689" y1="137.524" x2="92.5566"  y2="96.3914" stroke="white" strokeWidth="20" className="dark:stroke-black" />
    <line x1="237.679" y1="241.803" x2="196.547" y2="200.671" stroke="white" strokeWidth="20" className="dark:stroke-black" />
  </svg>
);

/* ─────────────────────────────────────────
   Animation helpers
───────────────────────────────────────── */

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

/* ─────────────────────────────────────────
   Stats
───────────────────────────────────────── */

const stats = [
  { value: "50",  label: "Events Managed" },
  { value: "3",   label: "Years In Service" },
  { value: "100", label: "Users Enrolled" },
];

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */

export default function AboutPage() {
  return (
    <section className="relative z-1 overflow-hidden py-8 sm:py-16 lg:py-24">

      {/* Background gradient blobs — exact from HTML */}
      <div className="absolute -right-30 -bottom-10 -z-2 w-100 xl:w-150">
        <Image src="https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/testimonials/gradient-bg.png"
          alt="" width={600} height={600} className="opacity-35" />
      </div>
      <div className="absolute top-[55%] left-[55%] -z-2 w-120 -translate-x-1/2 -translate-y-1/2 xl:w-150">
        <Image src="https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/testimonials/gradient-bg.png"
          alt="" width={600} height={600} className="opacity-35" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-4">

          {/* ══════════ LEFT COLUMN ══════════ */}
          <div className="space-y-12 md:space-y-18 lg:space-y-24">

            <motion.div {...fadeUp(0)}>
              <div className="space-y-4">

                {/* Badge */}
                <span className="inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-border px-2 py-0.5 text-sm font-normal text-foreground whitespace-nowrap">
                  NORSU Event Management System
                </span>

                <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">
                  Building a Legacy of Excellence
                </h2>

                <p className="text-muted-foreground text-xl leading-relaxed">
                  Our story is a testament to the power of collaboration and
                  resilience. Together, we have navigated challenges, celebrated
                  milestones, and crafted a narrative of growth and achievement
                  in modernizing campus scheduling at NORSU.
                </p>

                {/* CTA button — exact classes from HTML */}
                <Link
                  href="/"
                  className="inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 group relative overflow-hidden rounded-lg text-base before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] before:bg-size-[250%_250%,100%_100%] before:bg-position-[200%_0,0_0] before:bg-no-repeat before:transition-[background-position_0s_ease] before:duration-1000 hover:before:bg-position-[-100%_0,0_0]"
                >
                  Contact Us
                  <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5 size-4" />
                </Link>
              </div>
            </motion.div>

            {/* Stats — exact structure from HTML */}
            <motion.div {...fadeUp(0.15)} className="flex gap-5 max-md:flex-col">
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex flex-1 max-md:flex-col">
                  <div className="flex-1">
                    <div className="text-xl font-semibold sm:text-2xl lg:text-3xl">
                      <span className="inline-block tabular-nums">{stat.value}</span>+
                    </div>
                    <div className="text-muted-foreground text-sm">{stat.label}</div>
                  </div>
                  {i < stats.length - 1 && (
                    <div>
                      <div className="bg-border h-px w-px max-md:mt-5 max-md:w-full md:h-full" />
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </div>

          {/* ══════════ RIGHT COLUMN ══════════ */}
          {/*
            HTML: relative flex items-center justify-center py-8 lg:py-2
            The inner .relative div takes full column width.
            Badge + snowflake are positioned on that full-width wrapper —
            NOT inside the 80%-wide image — so their left-[48%/52%]
            values land at the horizontal center of the image.
          */}
          <div className="relative flex items-center justify-center py-8 lg:py-2">

            {/* Dot-grid SVG pattern — covers the full right column */}
            <div className="absolute inset-0 -z-1 size-full" style={{ opacity: 1 }}>
              <svg className="absolute inset-0 size-full opacity-[0.04]" viewBox="0 0 573 472"
                fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="aboutGrid" patternUnits="userSpaceOnUse" width="14" height="14">
                    <circle cx="1" cy="1" r="1" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="573" height="472" fill="url(#aboutGrid)" />
              </svg>
            </div>

            {/*
              Inner wrapper — matches HTML's inner <div class="relative">
              Takes the full column width; badge/snowflake are relative to this.
            */}
            <motion.div {...fadeUp(0.2)} className="relative w-full">

              {/*
                Collage image — exact same structure as the original HTML:
                  <img src="image-24.png"      class="mx-auto w-[80%] dark:hidden">
                  <img src="image-24-dark.png" class="mx-auto hidden w-[80%] dark:block">

                Replace these files by following the Figma/Canva guide:
                  /public/images/team-collage.png       (light mode — white card 1 bg)
                  /public/images/team-collage-dark.png  (dark mode  — black card 1 bg)

                Canvas: 800 × 700px
                  Card 1  dark #1a1a1a : 320×310px  @ x=175, y=45   — top-left-center
                  Card 2  sky  #5AAED4 : 260×270px  @ x=465, y=115  — top-right
                  Card 3  amber #E07820: 510×215px  @ x=75,  y=335  — bottom landscape
                  Venn badge #4CAF82   : 130×60px   @ x=370, y=355  (inside card 3)
              */}
              <div style={{ filter: "blur(0px)", opacity: 1 }}>
                {/* Light mode */}
                <Image
                  src="/images/team-collage.png"
                  alt="Team"
                  width={800}
                  height={700}
                  className="mx-auto w-[80%] dark:hidden"
                  priority
                />
                {/* Dark mode */}
                <Image
                  src="/images/team-collage-dark.png"
                  alt="Team"
                  width={800}
                  height={700}
                  className="mx-auto hidden w-[80%] dark:block"
                  priority
                />
              </div>
              {/* END collage */}

              {/*
                Spinning badge — exact from HTML:
                  absolute top-2 left-[48%] -translate-y-1/2
                  rounded-full border-4 md:border-8 border-background
                Percentage is relative to this full-width wrapper,
                which puts it at the horizontal centre of the 80%-wide image.
              */}
              <div
                className="border-background absolute rounded-full border-4 md:border-8"
                style={{ top: "8px", left: "48%", transform: "translateY(-50%)", zIndex: 10 }}
              >
                <SpinningBadge />
              </div>

              {/*
                Sky snowflake — exact from HTML:
                  absolute bottom-0 left-[52%] h-8 w-8 translate-y-1/2
                  text-sky-600 md:left-[50%] md:h-12 md:w-12
              */}
              <div
                className="absolute h-8 w-8 text-sky-600 md:h-12 md:w-12"
                style={{ bottom: 0, left: "52%", transform: "translateY(50%)", zIndex: 10 }}
              >
                <SnowflakeStar />
              </div>

            </motion.div>
            {/* END inner wrapper */}

            {/* Amber star — absolute top-[30%] left-0 h-6 w-6 text-amber-600 md:h-10 md:w-10 */}
            <motion.div {...fadeUp(0.28)}
              className="absolute top-[30%] left-0 h-6 w-6 text-amber-600 md:h-10 md:w-10 dark:text-amber-400">
              <Star4 />
            </motion.div>

            {/* Red star — absolute top-[5%] right-[20%] h-6 w-6 text-red-600 md:h-10 md:w-10 */}
            <motion.div {...fadeUp(0.22)}
              className="absolute top-[5%] right-[20%] h-6 w-6 text-red-600 md:h-10 md:w-10 dark:text-red-400">
              <Star4 />
            </motion.div>

            {/* Sky star — absolute right-[28%] bottom-[15%] h-6 w-6 text-sky-600 md:h-10 md:w-10 */}
            <motion.div {...fadeUp(0.32)}
              className="absolute right-[28%] bottom-[15%] h-6 w-6 text-sky-600 md:h-10 md:w-10 dark:text-sky-400">
              <Star4 />
            </motion.div>

          </div>
          {/* END right column */}

        </div>
      </div>

      {/* ── Team name labels below collage ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 pb-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-center">
          {[
            { name: "Cris Justine Oracion", role: "Lead Developer" },
            { name: "Dexter Orcullo",        role: "Assistant Researcher" },
            { name: "Kenneth Lei Munez",     role: "Documentary & Researcher" },
          ].map((m, i) => (
            <motion.div key={m.name} {...fadeUp(0.1 + i * 0.07)}>
              <div className="font-semibold text-foreground">{m.name}</div>
              <div className="text-sm text-muted-foreground">{m.role}</div>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp(0.35)} className="mt-10 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </motion.div>
      </div>

    </section>
  );
}
