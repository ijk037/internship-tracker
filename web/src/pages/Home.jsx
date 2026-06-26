import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      <header className="glass border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center font-bold text-lg text-white shadow-md shadow-brand-purple/20">
            IT
          </div>
          <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink">
            Internship Tracker
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-95 transition shadow-md shadow-brand-purple/20"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-20 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-xs font-semibold text-brand-purple animate-pulse-glow mb-6">
          <span>🚀</span> Unleash Your Job Search
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Track Internships.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan">
            Land Offers.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          A premium job application tracker designed for modern developers. Visualize your application funnel, organize interview notes, and log jobs in one click.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16 justify-center w-full max-w-md">
          <Link
            to="/signup"
            className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-95 transition shadow-lg shadow-brand-purple/25 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started - It's Free
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 rounded-xl font-bold text-gray-300 border border-gray-700/80 hover:bg-gray-800/50 hover:border-gray-600 transition"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Dashboard Preview Illustration */}
        <div className="glass rounded-2xl border border-gray-800/80 p-6 w-full max-w-4xl shadow-2xl shadow-brand-purple/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple to-brand-pink"></div>
          
          {/* Mock Header */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-800/50 mb-6">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
            </div>
            <div className="h-4 w-40 rounded bg-gray-800/60"></div>
          </div>

          {/* Mock Kanban Board columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="rounded-xl bg-gray-900/30 p-4 border border-gray-800/40">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400">WISHLIST</span>
                <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">3</span>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-gray-950/60 border border-gray-800/80">
                  <p className="text-xs font-bold text-white">Frontend Intern</p>
                  <p className="text-[10px] text-gray-400">Stripe</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-950/60 border border-gray-800/80">
                  <p className="text-xs font-bold text-white">Software Engineer</p>
                  <p className="text-[10px] text-gray-400">Vercel</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-gray-900/30 p-4 border border-gray-800/40">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400">APPLIED</span>
                <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">12</span>
              </div>
              <div className="p-3 rounded-lg bg-gray-950/60 border border-gray-800/80">
                <p className="text-xs font-bold text-white">Product Designer</p>
                <p className="text-[10px] text-gray-400">Linear</p>
              </div>
            </div>

            <div className="rounded-xl bg-gray-900/30 p-4 border border-gray-800/40">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-brand-purple">INTERVIEWING</span>
                <span className="text-[10px] bg-brand-purple/10 border border-brand-purple/20 px-1.5 py-0.5 rounded text-brand-purple font-semibold">2</span>
              </div>
              <div className="p-3 rounded-lg bg-brand-purple/5 border border-brand-purple/20 shadow-sm shadow-brand-purple/5 animate-pulse-glow">
                <p className="text-xs font-bold text-white">Backend Engineer</p>
                <p className="text-[10px] text-brand-purple font-semibold">Supabase</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-8 text-center text-sm text-gray-500 px-6">
        <p>© {new Date().getFullYear()} Internship Tracker. Built for developers.</p>
      </footer>
    </div>
  )
}
