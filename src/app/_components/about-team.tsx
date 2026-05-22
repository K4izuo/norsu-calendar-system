"use client";

import { motion } from "framer-motion";
import { Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import { useAboutStats } from "@/features/calendar/services/stats-service";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const team = [
  { name: "Elena Vasquez", role: "CEO & Co-Founder", img: "https://i.pravatar.cc/512?img=1", bio: "Former VP of Product at Stripe. 12 years building fintech infrastructure." },
  { name: "Marcus Chen", role: "CTO & Co-Founder", img: "https://i.pravatar.cc/512?img=3", bio: "Ex-Google Brain engineer. Led ML platform teams at Scale AI." },
  { name: "Aiko Tanaka", role: "Head of Engineering", img: "https://i.pravatar.cc/512?img=5", bio: "Previously at Figma and Linear. Obsessed with developer experience." },
  { name: "David Moreau", role: "VP of Sales", img: "https://i.pravatar.cc/512?img=7", bio: "Grew ARR from $0 to $40M at two prior startups. Enterprise sales veteran." },
  { name: "Sofia Reyes", role: "Head of Design", img: "https://i.pravatar.cc/512?img=9", bio: "Design lead alumni of Apple and Airbnb. Human-centered AI advocate." },
  { name: "James Whitfield", role: "Head of Operations", img: "https://i.pravatar.cc/512?img=11", bio: "Former McKinsey consultant. Scaled ops at Notion from Series A." },
];

const STAT_LABELS = [
  { key: "eventsScheduled", label: "Events Scheduled"  },
  { key: "eventsFinished",  label: "Events Finished"   },
  { key: "holidays",        label: "Holidays"          },
  { key: "unscheduledDays", label: "Unscheduled Days"  },
] as const;

const AboutSection = () => {
  const { stats, loading } = useAboutStats();

  return (
    <section id="about-section" className="scroll-mt-24 md:scroll-mt-28 bg-background py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div id="about-intro" className="flex justify-center">
          <motion.div
            {...fadeUp(0)}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-1.5 text-sm text-muted-foreground font-body mb-9"
          >
            About Us
          </motion.div>
        </div>
        <div className="max-w-2xl">
          <motion.h2
            {...fadeUp(0.05)}
            className="font-display text-4xl md:text-5xl lg:text-[3.5rem] leading-[1] tracking-tight text-foreground"
          >
            Built for campuses that demand organized and efficient scheduling
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="mt-5 text-base md:text-lg text-muted-foreground"
          >
            The NORSU Calendar System was developed to address the challenges of managing events, schedules, and facility usage within the university. Traditional manual processes often lead to scheduling conflicts, delays in approvals, and lack of centralized coordination.
          </motion.p>
          <motion.p
            {...fadeUp(0.15)}
            className="mt-4 text-base md:text-lg text-muted-foreground"
          >
            This platform is designed to streamline scheduling by providing a centralized, real-time system where student organizations, faculty, and staff can plan, request, and manage events efficiently. By automating workflows and improving visibility, the system ensures better coordination, reduced conflicts, and a more organized campus environment.
          </motion.p>
        </div>

        {/* Stats row */}
        <motion.div
          {...fadeUp(0.15)}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {STAT_LABELS.map(({ key, label }, index) => (
            <div key={label} className="relative p-6">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-6 bottom-6 hidden border-l border-gray-300 md:block"
                />
              )}
              <div className="font-display text-3xl md:text-4xl text-foreground leading-none">
                {loading || !stats ? (
                  <span className="inline-block h-9 w-16 animate-pulse rounded bg-muted" />
                ) : (
                  stats[key]
                )}
              </div>
              <div className="mt-2 text-sm text-muted-foreground font-body">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Two-column story */}
        <div className="mt-20 grid md:grid-cols-2 gap-12 md:gap-16">
          <motion.div {...fadeUp(0.05)}>
            <h3 className="font-display text-2xl md:text-3xl text-foreground leading-[1.1] tracking-tight">
              From manual scheduling to seamless coordination
            </h3>
            <p className="mt-4 text-muted-foreground leading-relaxed text-[15px]">
              Managing campus events used to involve paperwork, scattered approvals, and frequent scheduling conflicts. These challenges often caused delays and miscommunication among students, faculty, and staff. With the introduction of a centralized system, scheduling becomes more organized, efficient, and transparent, allowing users to plan and manage events with ease.
            </p>
          </motion.div>
          <motion.div {...fadeUp(0.1)}>
            <h3 className="font-display text-2xl md:text-3xl text-foreground leading-[1.1] tracking-tight">
              Smart scheduling that improves coordination
            </h3>
            <p className="mt-4 text-muted-foreground leading-relaxed text-[15px]">
              Unlike manual methods, the system provides real-time visibility of events, schedules, and facility usage. It helps users avoid conflicts, track requests, and manage approvals efficiently. As more events are organized within the platform, coordination becomes smoother, reducing errors and improving overall campus operations.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const TeamSection = () => {
  return (
    <section className="bg-secondary/40 py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">
        <div id="team-intro" className="text-center max-w-xl mx-auto">
          <motion.div
            {...fadeUp(0)}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-1.5 text-sm text-muted-foreground font-body mb-9"
          >
            The Team
          </motion.div>
          <motion.h2
            {...fadeUp(0.05)}
            className="font-display text-4xl md:text-5xl lg:text-[3.5rem] leading-[1] tracking-tight text-foreground"
          >
            Meet the <em className="font-display italic">people</em> behind it
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="mt-5 text-base text-muted-foreground leading-relaxed font-body"
          >
            A tight-knit crew of engineers, designers, and operators who&apos;ve scaled products used by millions.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              {...fadeUp(0.05 + i * 0.05)}
              className="group rounded-2xl overflow-hidden bg-background border border-border"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <Image
                  src={member.img}
                  alt={member.name}
                  loading="lazy"
                  width={512}
                  height={640}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-5">
                <div className="font-display text-xl text-foreground leading-tight">{member.name}</div>
                <div className="mt-0.5 text-sm text-accent font-body font-medium">{member.role}</div>
                <p className="mt-2.5 text-[13px] text-muted-foreground leading-relaxed font-body">{member.bio}</p>
                <div className="mt-3 flex items-center gap-2">
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="w-4 h-4" /></a>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="w-4 h-4" /></a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { AboutSection, TeamSection };
