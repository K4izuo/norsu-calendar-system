import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="about-section" className="px-6 py-10 max-w-350 mx-auto">
      {/* Centered ABOUT heading with line */}
      <div className="flex flex-col items-center mb-18">
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

      {/* Meet the Minds Behind Norsu Section */}
      <div className="mt-32">
        <div className="mb-20 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Meet the Minds Behind Norsu</h2>
          <p className="text-lg text-slate-600">A collective of visionaries, engineers, and designers dedicated to redefining how the world manages time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Alex Rivera */}
          <div className="group relative flex flex-col bg-white p-4 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="relative text-card-foreground border shadow cursor-pointer w-full aspect-[4/5] overflow-hidden rounded-2xl bg-white mb-6">
              <Image
                src="/images/crisjustine.png"
                className="w-full h-full object-cover group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                alt="Cris Justine Oracion Lead Developer"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
              />
            </div>
            <div className="px-2 pb-2 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Cris Justine Oracion</h3>
              <p className="text-blue-500 font-bold text-sm uppercase tracking-wide mb-3">Lead Developer</p>
              <p className="text-slate-500 text-sm leading-relaxed">Architecting scalable solutions and driving technical excellence.</p>
            </div>
          </div>

          {/* Elena Chen */}
          <div className="group relative flex flex-col bg-white p-4 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="relative text-card-foreground border shadow cursor-pointer w-full aspect-[4/5] overflow-hidden rounded-2xl bg-white mb-6">
              <Image
                src="/images/dexter.jpg"
                className="w-full h-full object-cover group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                alt="Dexter Orcullo Assistant Researcher"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
              />
            </div>
            <div className="px-2 pb-2 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Dexter Orcullo</h3>
              <p className="text-blue-500 font-bold text-sm uppercase tracking-wide mb-3">Assistant Researcher</p>
              <p className="text-slate-500 text-sm leading-relaxed">Analyzing user behavior and optimizing system performance.</p>
            </div>
          </div>

          {/* Marcus Thorne */}
          <div className="group relative flex flex-col bg-white p-4 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="relative text-card-foreground border shadow cursor-pointer w-full aspect-[4/5] overflow-hidden rounded-2xl bg-white mb-6">
              <Image
                src="/images/kenneth.jpg"
                className="w-full h-full object-cover group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                alt="Kenneth Kei Munez Researcher & Documentation"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
              />
            </div>
            <div className="px-2 pb-2 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Kenneth Lei Munez</h3>
              <p className="text-blue-500 font-bold text-sm uppercase tracking-wide mb-3">Researcher & Documentation</p>
              <p className="text-slate-500 text-sm leading-relaxed">Documenting processes and conducting technical research.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}