'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SearchInput from './SearchInput';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and hamburger */}
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 mr-3"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
              Indiana Book Crawl
            </Link>
          </div>

          {/* Search bar - desktop only */}
          <div className="hidden sm:flex flex-1 items-center justify-end">
            <div className="w-full max-w-xs px-4">
              <SearchInput />
            </div>
          </div>
        </div>
      </div>

      {/* Side drawer navigation */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="h-full flex flex-col p-6">
          {/* Close button */}
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search bar - mobile only */}
          <div className="sm:hidden mt-6">
            <SearchInput />
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 mt-8 space-y-6">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`block text-xl font-medium ${pathname === '/' ? 'text-blue-400' : 'text-gray-300 hover:text-white'
                }`}
            >
              Home
            </Link>
            <Link
              href="/map"
              onClick={() => setIsMenuOpen(false)}
              className={`block text-xl font-medium ${pathname === '/map' ? 'text-blue-400' : 'text-gray-300 hover:text-white'
                }`}
            >
              Map
            </Link>
            <Link
              href="/favorites"
              onClick={() => setIsMenuOpen(false)}
              className={`block text-xl font-medium ${pathname === '/favorites' ? 'text-blue-400' : 'text-gray-300 hover:text-white'
                }`}
            >
              Favorites
            </Link>
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin/bookshops/new"
                onClick={() => setIsMenuOpen(false)}
                className={`block text-xl font-medium ${pathname === '/admin/dashboard' ? 'text-blue-400' : 'text-gray-300 hover:text-white'
                  }`}
              >
                + Bookshop
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Optional overlay for mobile - uncomment if you want a semi-transparent overlay when menu is open */}
      {/* {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )} */}
    </header>
  );
}