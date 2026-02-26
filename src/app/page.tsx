import Link from 'next/link'
import { Globe, MapPin, Users, Trophy } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10 text-4xl">
          <Globe className="h-10 w-10 text-blue-500" />
        </div>
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-7xl">
          Your world, <span className="text-blue-500">marked.</span>
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-slate-400 sm:text-xl">
          Track every country you&apos;ve visited, share your journey, discover
          where friends have been.
        </p>
        <Link
          href="/login"
          className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition hover:bg-blue-500"
        >
          Start mapping
        </Link>
      </section>

      {/* Stats Section */}
      <section className="border-t border-slate-800 bg-slate-900/50 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500">150+</div>
            <div className="mt-1 text-slate-400">Countries tracked</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500">10k+</div>
            <div className="mt-1 text-slate-400">Travelers worldwide</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500">50k+</div>
            <div className="mt-1 text-slate-400">Visits logged</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            Everything you need to track your travels
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Interactive Map"
              description="Color in every country you visit on a beautiful SVG world map."
            />
            <FeatureCard
              icon={<MapPin className="h-6 w-6" />}
              title="City Pins"
              description="Drop pins on cities with notes and photos from your trips."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Social Feed"
              description="Follow friends, compare maps, and see where they've been."
            />
            <FeatureCard
              icon={<Trophy className="h-6 w-6" />}
              title="Leaderboard"
              description="See who has visited the most countries and climb the ranks."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        Wandermark &mdash; Track your world.
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  )
}
