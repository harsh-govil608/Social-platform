import { Link } from "react-router";
import { Zap, MessageCircle, Brain, Users, Flame, Trophy, ChevronRight, Check, Globe, Mic, BookOpen } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Conversation Practice",
    description: "Practice real-world scenarios with an AI tutor that gives instant grammar and fluency feedback.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: BookOpen,
    title: "Spaced Repetition Vocabulary",
    description: "Learn words that actually stick using proven flashcard science — tailored to your level.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Mic,
    title: "Voice Recording & Playback",
    description: "Record your spoken responses, play them back, and hear where your pronunciation needs work.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: Users,
    title: "Real Learning Partners",
    description: "Chat and video call with native speakers who are learning your language. Mutual exchange.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Flame,
    title: "Daily Streak System",
    description: "10-minute daily tasks keep you consistent. Miss a day, lose your streak. Simple as that.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Trophy,
    title: "Achievements & Leaderboard",
    description: "Earn XP, unlock badges, and compete with friends. Learning is more fun with a scoreboard.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
];

const languages = ["Spanish", "French", "Japanese", "German", "Mandarin", "Italian", "Portuguese", "Korean"];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-base-100/80 backdrop-blur border-b border-base-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="size-8 text-primary" />
            <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              LangPal
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Flame className="size-4 text-orange-500" />
          Build your streak. Become fluent.
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
          Learn a language by{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            actually talking
          </span>
        </h1>
        <p className="text-xl text-base-content/70 max-w-2xl mx-auto mb-10">
          AI conversations, vocabulary flashcards, voice recording, and real speaking partners — all in 10 minutes a day.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="btn btn-primary btn-lg gap-2">
            Start for free
            <ChevronRight className="size-5" />
          </Link>
          <Link to="/pricing" className="btn btn-ghost btn-lg">
            See pricing
          </Link>
        </div>

        {/* Language pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-12">
          {languages.map((lang) => (
            <span key={lang} className="badge badge-outline badge-lg gap-1.5">
              <Globe className="size-3" />
              {lang}
            </span>
          ))}
          <span className="badge badge-outline badge-lg opacity-60">+ more</span>
        </div>
      </section>

      {/* Features */}
      <section className="bg-base-200 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3">Everything you need to become fluent</h2>
          <p className="text-center text-base-content/60 mb-12">No fluff. Just the features that actually work.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="card-body">
                    <div className={`${f.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className={`size-6 ${f.color}`} />
                    </div>
                    <h3 className="card-title text-lg">{f.title}</h3>
                    <p className="text-base-content/70 text-sm">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social proof / stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "10 min", label: "Daily commitment" },
              { value: "8+", label: "Languages supported" },
              { value: "AI-powered", label: "Conversation practice" },
              { value: "Free", label: "To get started" },
            ].map((stat) => (
              <div key={stat.label} className="card bg-base-200">
                <div className="card-body py-6">
                  <p className="text-3xl font-extrabold text-primary">{stat.value}</p>
                  <p className="text-sm text-base-content/60">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-base-200 py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="space-y-6">
            {[
              { step: "1", title: "Sign up & pick your language", desc: "Choose what you're learning and your current level. Takes 2 minutes." },
              { step: "2", title: "Complete your daily task", desc: "A 10-minute guided session: vocabulary review, AI conversation, and more." },
              { step: "3", title: "Practice with real partners", desc: "Match with native speakers who are learning your language. Chat or video call." },
              { step: "4", title: "Track your streak & progress", desc: "Watch your XP grow, earn achievements, and climb the leaderboard." },
            ].map((item) => (
              <div key={item.step} className="flex gap-5 items-start">
                <div className="bg-primary text-primary-content w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-base-content/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
          <p className="text-base-content/70 mb-8">Start free. Upgrade when you're ready.</p>
          <div className="card bg-base-200 shadow">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="text-center">
                  <p className="text-4xl font-extrabold">Free</p>
                  <p className="text-sm opacity-60">Forever</p>
                </div>
                <div className="divider divider-horizontal hidden sm:flex" />
                <ul className="text-left space-y-2 text-sm">
                  {["Daily task & streak tracking", "AI conversation practice (5/month)", "Vocabulary flashcards", "Find language partners", "Community feed"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="size-4 text-success shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex gap-3 justify-center">
                <Link to="/signup" className="btn btn-primary">Get started free</Link>
                <Link to="/pricing" className="btn btn-ghost">See all plans</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-secondary py-20">
        <div className="container mx-auto px-4 text-center text-primary-content">
          <h2 className="text-4xl font-extrabold mb-4">Ready to start your streak?</h2>
          <p className="text-lg opacity-90 mb-8">Join thousands of learners who show up every day.</p>
          <Link to="/signup" className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 gap-2">
            Create your free account
            <ChevronRight className="size-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-base-200 border-t border-base-300 py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            <span className="font-bold font-mono text-primary">LangPal</span>
          </div>
          <p className="text-sm text-base-content/50">© {new Date().getFullYear()} LangPal. Learn by talking daily.</p>
          <div className="flex gap-4 text-sm">
            <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link to="/login" className="hover:text-primary transition-colors">Log in</Link>
            <Link to="/signup" className="hover:text-primary transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
