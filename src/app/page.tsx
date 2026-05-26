import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------ */
/*  Icon components (inline SVGs so we don't need extra dependencies)  */
/* ------------------------------------------------------------------ */

function HeartPulseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}

function StethoscopeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M11 2v2" />
      <path d="M5 2v2" />
      <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" />
      <path d="M8 15a6 6 0 0 0 12 0v-3" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  );
}

function BabyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12h.01" />
      <path d="M15 12h.01" />
      <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
      <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />
    </svg>
  );
}

function BoneIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const departments = [
  {
    icon: HeartPulseIcon,
    title: "Cardiology",
    description:
      "Advanced cardiac care with state-of-the-art catheterization labs and expert heart surgeons.",
    color: "from-rose-500 to-pink-600",
    bgLight: "bg-rose-50",
    textColor: "text-rose-600",
  },
  {
    icon: BrainIcon,
    title: "Neurology",
    description:
      "Comprehensive brain and nervous system care featuring cutting-edge neuroimaging technology.",
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50",
    textColor: "text-violet-600",
  },
  {
    icon: BoneIcon,
    title: "Orthopedics",
    description:
      "Expert musculoskeletal care with minimally invasive surgical techniques and rapid rehabilitation.",
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    icon: BabyIcon,
    title: "Pediatrics",
    description:
      "Compassionate child healthcare in a friendly, family-centered environment.",
    color: "from-sky-500 to-cyan-600",
    bgLight: "bg-sky-50",
    textColor: "text-sky-600",
  },
  {
    icon: EyeIcon,
    title: "Ophthalmology",
    description:
      "Complete eye care from routine check-ups to advanced laser surgery and vision correction.",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    icon: StethoscopeIcon,
    title: "General Medicine",
    description:
      "Holistic primary care with focus on preventive health, diagnostics, and wellness programs.",
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-600",
  },
];

const stats = [
  { value: "50+", label: "Expert Doctors" },
  { value: "10K+", label: "Happy Patients" },
  { value: "25+", label: "Years Experience" },
  { value: "24/7", label: "Emergency Care" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Cardiac Patient",
    quote:
      "The cardiology team at MedCare saved my life. Their professionalism and compassion during my bypass surgery was remarkable. I'm forever grateful.",
    rating: 5,
  },
  {
    name: "Rahul Mehta",
    role: "Orthopedic Patient",
    quote:
      "After my knee replacement surgery, the rehab team had me walking within days. The entire experience exceeded my expectations.",
    rating: 5,
  },
  {
    name: "Anita Desai",
    role: "Parent of Pediatric Patient",
    quote:
      "The pediatric department is incredible. They made my daughter feel so comfortable and at ease. The doctors truly care about their young patients.",
    rating: 5,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      {/* ===== Navigation ===== */}
      <header
        id="site-header"
        className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80"
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
              <HeartPulseIcon className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Med<span className="text-teal-600">Care</span>
            </span>
          </a>
          <div className="hidden items-center gap-8 md:flex">
            {["About", "Departments", "Doctors", "Testimonials", "Contact"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-zinc-600 transition-colors hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400"
                >
                  {item}
                </a>
              )
            )}
          </div>
          <Button
            size="lg"
            className="hidden bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 md:inline-flex"
          >
            Book Appointment
          </Button>
        </nav>
      </header>

      {/* ===== Hero Section ===== */}
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950"
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-teal-200/40 to-cyan-200/30 blur-3xl dark:from-teal-900/20 dark:to-cyan-900/10" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-sky-200/40 to-teal-200/30 blur-3xl dark:from-sky-900/20 dark:to-teal-900/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-6 border-teal-200 bg-teal-50 px-4 py-1 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
            >
              🏥 Trusted by 10,000+ patients
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-zinc-50">
              Your Health, Our{" "}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Priority
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Experience world-class healthcare with compassionate doctors,
              cutting-edge technology, and personalized treatment plans. Your
              journey to wellness starts here.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 px-8 text-base text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-600 hover:to-cyan-700 hover:shadow-xl hover:shadow-teal-500/30"
              >
                Book Appointment
                <ArrowRightIcon className="ml-1 size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-8 text-base"
              >
                <PhoneIcon className="mr-1 size-4" />
                Emergency: 108
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats Bar ===== */}
      <section
        id="about"
        className="relative -mt-8 z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-200/50 sm:grid-cols-4 sm:gap-8 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-zinc-950/50">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Departments ===== */}
      <section id="departments" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="outline"
              className="mb-4 border-teal-200 bg-teal-50 px-3 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
            >
              Our Specialties
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              Departments of Excellence
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Our specialized departments are equipped with the latest medical
              technology and staffed by world-renowned physicians.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <Card
                key={dept.title}
                className="group relative overflow-hidden border-0 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900"
              >
                <CardHeader>
                  <div
                    className={`mb-2 flex h-12 w-12 items-center justify-center rounded-xl ${dept.bgLight} ${dept.textColor} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <dept.icon className="size-6" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {dept.title}
                  </CardTitle>
                  <CardDescription className="text-zinc-500 dark:text-zinc-400">
                    {dept.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href="#"
                    className={`inline-flex items-center gap-1 text-sm font-medium ${dept.textColor} transition-all hover:gap-2`}
                  >
                    Learn more
                    <ArrowRightIcon className="size-3.5" />
                  </a>
                </CardContent>
                {/* Gradient accent bar at top */}
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${dept.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Why Choose Us ===== */}
      <section
        id="doctors"
        className="bg-gradient-to-b from-zinc-50 to-white py-24 sm:py-32 dark:from-zinc-900 dark:to-zinc-950"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="outline"
              className="mb-4 border-teal-200 bg-teal-50 px-3 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
            >
              Why MedCare?
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              What Sets Us Apart
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              We combine medical expertise with compassionate care to deliver
              exceptional healthcare experiences.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheckIcon,
                title: "Board Certified",
                description:
                  "All our physicians are board-certified with years of specialized experience.",
                gradient: "from-teal-500 to-emerald-600",
              },
              {
                icon: ClockIcon,
                title: "24/7 Emergency",
                description:
                  "Round-the-clock emergency services with rapid response teams ready to assist.",
                gradient: "from-cyan-500 to-blue-600",
              },
              {
                icon: UsersIcon,
                title: "Patient-Centric",
                description:
                  "Personalized care plans tailored to each patient&apos;s unique health needs.",
                gradient: "from-violet-500 to-purple-600",
              },
              {
                icon: HeartPulseIcon,
                title: "Latest Technology",
                description:
                  "State-of-the-art equipment and innovative treatment methodologies.",
                gradient: "from-rose-500 to-pink-600",
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div
                  className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
                >
                  <feature.icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section id="testimonials" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="outline"
              className="mb-4 border-teal-200 bg-teal-50 px-3 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
            >
              Testimonials
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              What Our Patients Say
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Real stories from real patients who trust us with their health.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <Card
                key={t.name}
                className="border-0 bg-gradient-to-br from-white to-zinc-50 shadow-md dark:from-zinc-900 dark:to-zinc-900/50"
              >
                <CardHeader>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className="size-4 text-amber-400"
                      />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-600 italic leading-relaxed dark:text-zinc-400">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <Separator className="my-4" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {t.name}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {t.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Take the First Step?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-teal-100">
            Book your appointment today and let our expert medical team take
            care of your health. Your well-being is just a click away.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-12 rounded-full bg-white px-8 text-base font-semibold text-teal-700 shadow-lg transition-all hover:bg-zinc-100 hover:shadow-xl"
            >
              Book Appointment Now
              <ArrowRightIcon className="ml-1 size-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-full border-white/30 px-8 text-base text-white backdrop-blur-sm hover:bg-white/10"
            >
              <PhoneIcon className="mr-1 size-4" />
              Call Us: +91 1800-123-4567
            </Button>
          </div>
        </div>
      </section>

      {/* ===== Contact / Footer ===== */}
      <footer
        id="contact"
        className="border-t border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <a href="#" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
                  <HeartPulseIcon className="size-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Med<span className="text-teal-600">Care</span>
                </span>
              </a>
              <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Providing exceptional healthcare with compassion and innovation
                since 2001.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
                Quick Links
              </h3>
              <ul className="mt-4 space-y-3">
                {["About Us", "Our Departments", "Find a Doctor", "Careers"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-zinc-600 transition-colors hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400"
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
                Services
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  "Emergency Care",
                  "Lab & Diagnostics",
                  "Surgery",
                  "Health Check-ups",
                ].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-zinc-600 transition-colors hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
                Contact
              </h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <MapPinIcon className="mt-0.5 size-4 shrink-0 text-teal-600" />
                  123 Medical Center Drive, Healthcare City, HC 56001
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <PhoneIcon className="size-4 shrink-0 text-teal-600" />
                  +91 1800-123-4567
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <MailIcon className="size-4 shrink-0 text-teal-600" />
                  info@medcarehospital.com
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              © {new Date().getFullYear()} MedCare Hospital. All rights
              reserved.
            </p>
            <div className="flex gap-6">
              {["Privacy Policy", "Terms of Service", "Sitemap"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm text-zinc-500 transition-colors hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
