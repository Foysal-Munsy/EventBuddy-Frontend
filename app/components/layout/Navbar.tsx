'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HiOutlineTicket } from 'react-icons/hi';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        scrolled ? 'backdrop-blur-sm bg-white/60 shadow-lg border-b border-gray-200' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo (left) */}
          <div className="shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center justify-center" style={{ color: 'var(--primary)' }}>
                <HiOutlineTicket size={28} className="text-(--primary)" aria-hidden />
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                Event buddy.
              </span>
            </Link>
          </div>

          {/* Right: Sign In / Sign Up buttons (unified design) */}
          <div className="flex items-center space-x-3">
            <Link
              href="/signin"
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium"
              style={{ backgroundImage: 'var(--btn-gradient)', color: 'var(--primary-foreground)' }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium"
              style={{ backgroundImage: 'var(--btn-gradient)', color: 'var(--primary-foreground)' }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}