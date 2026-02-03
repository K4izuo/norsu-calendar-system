import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="about-section" className="px-6 py-20 md:py-32 max-w-350 mx-auto">
      {/* Centered ABOUT heading with line */}
      <div className="flex flex-col items-center mb-24">
        <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-wide uppercase">
          ABOUT
        </span>
        <div className="w-24 h-1 bg-blue-500 rounded-full mt-1.5" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* left side */}
        <div className="flex p-8 bg-white text-card-foreground shadow rounded-3xl flex-col self-start">
          <span className="text-blue-500 font-bold text-lg mb-3">
            How It Started
          </span>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-45 mt-4">
            &quot;Our Dream is Global Scheduling Efficiency&quot;
          </h1>

          <div className="prose prose-lg text-slate-600 leading-relaxed">
            <p className="mb-6">
              Norsu Calendar was founded by Alex Rivera and Elena Chen,
              passionate advocates for structured creativity. Their shared
              vision was to create a digital sanctuary where time management isn&apos;t
              a chore, but an art form.
            </p>

            <p>
              United by their belief in the transformative power of organized time,
              they embarked on a journey to build &apos;Norsu.&apos; With relentless
              dedication, they gathered a team of experts and launched this innovative
              platform, creating a global community of professionals connected by the
              desire to work smarter, not harder.
            </p>
          </div>
        </div>

        {/* right side */}
        <div className="flex flex-col gap-6 self-start">
          <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden">
            <Image
              src="/images/background-image.png"
              className="object-cover w-full h-full"
              alt="Team collaborating"
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>

          <div className="grid p-8 bg-white text-card-foreground shadow rounded-3xl grid-cols-2 gap-4">
            <div className="bg-muted/50 p-6 rounded-2xl">
              <div className="text-3xl font-extrabold text-slate-900 mb-1">4.2</div>
              <div className="text-sm font-medium text-slate-500">Years Experience</div>
            </div>
            <div className="bg-muted/50 p-6 rounded-2xl">
              <div className="text-3xl font-extrabold text-slate-900 mb-1">50+</div>
              <div className="text-sm font-medium text-slate-500">Major Projects</div>
            </div>
            <div className="bg-muted/50 p-6 rounded-2xl">
              <div className="text-3xl font-extrabold text-slate-900 mb-1">1.2k+</div>
              <div className="text-sm font-medium text-slate-500">Active Users</div>
            </div>
            <div className="bg-muted/50 p-6 rounded-2xl">
              <div className="text-3xl font-extrabold text-slate-900 mb-1">200+</div>
              <div className="text-sm font-medium text-slate-500">Institutions</div>
            </div>
          </div>
        </div>
      </div>


    </section>
  )
}