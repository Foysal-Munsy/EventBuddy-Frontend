import Link from 'next/link';
import { HiOutlineTicket } from 'react-icons/hi';

export default function Footer() {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <footer className=" bg-[#ECEEFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <HiOutlineTicket size={22} className="text-(--primary)" aria-hidden />
            <span className="text-lg font-semibold" style={{ color: 'var(--primary)' }}>
              Event buddy.
            </span>
          </Link>

          {/* Right: Nav Items */}
          <nav className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-gray-600 hover:text-(--primary)">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Break / divider */}
        <div className="my-6" style={{ height: 1, backgroundColor: 'rgba(44,37,117,0.129)' }} />

        {/* Copyright */}
        <div className="text-center text-sm" style={{ color: '#6A6A6A' }}>
          © 2025 Event buddy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
