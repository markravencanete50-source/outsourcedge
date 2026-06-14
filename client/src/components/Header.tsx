import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="container flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-3 font-bold text-2xl hover:opacity-80 transition">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0891B2] to-[#059669] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">OE</span>
            </div>
            <span className="text-[#0F172A]">OutsourcEdge</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a className="text-[#0F172A] hover:text-[#0891B2] transition font-medium">
                {link.label}
              </a>
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/contact">
            <a className="btn-primary">Get Started</a>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-[#0F172A]" />
          ) : (
            <Menu className="w-6 h-6 text-[#0F172A]" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200">
          <div className="container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className="text-[#0F172A] hover:text-[#0891B2] transition font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              </Link>
            ))}
            <Link href="/contact">
              <a
                className="btn-primary inline-block text-center"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </a>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
