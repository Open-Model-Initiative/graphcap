import { useState } from 'react'
import { Link } from '@tanstack/react-router'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="h-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo and brand */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xs font-semibold text-gray-900 dark:text-white">
            graphcap Studio
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-3">
          <Link 
            to="/" 
            className="px-2 py-1 rounded-md text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Home
          </Link>
          <Link 
            to="/gallery/os_img" 
            className="px-2 py-1 rounded-md text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Gallery
          </Link>
          <a 
            href="http://localhost:32300" 
            className="px-2 py-1 rounded-md text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Pipelines
          </a>
          <Link 
            to="/debug" 
            className="px-2 py-1 rounded-md text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Debug
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-1 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="sr-only">Open menu</span>
          {/* Hamburger icon */}
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute z-20 inset-x-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="px-2 pt-1 pb-2 space-y-0.5">
            <Link 
              to="/" 
              className="block px-3 py-1 rounded-md text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Home
            </Link>
            <Link 
              to="/gallery" 
              className="block px-3 py-1 rounded-md text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Gallery
            </Link>
            <Link 
              to="/workflows" 
              className="block px-3 py-1 rounded-md text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Workflows
            </Link>
            <Link 
              to="/debug" 
              className="block px-3 py-1 rounded-md text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Debug
            </Link>
          </div>
        </div>
      )}
    </header>
  )
} 