import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="glass glass-glow p-8 max-w-md rounded-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-purple/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-brand-pink/20 rounded-full blur-2xl"></div>

        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink mb-4">
          404
        </h1>
        <h2 className="text-xl font-bold text-white mb-2">
          Page Not Found
        </h2>
        <p className="text-sm text-gray-400 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-95 transition shadow-md shadow-brand-purple/20 inline-block cursor-pointer"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
