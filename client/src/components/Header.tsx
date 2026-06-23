import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/project-management", label: "Property Management" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#1F2A44]/10 bg-[#FAF7F1]/92 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/">
          <a className="flex items-center transition hover:opacity-85" aria-label="OutsourcEdge home">
            <img
              src="/brand/outsourcedge-wordmark.png"
              alt="OutsourcEdge"
              className="h-9 w-auto object-contain md:h-10"
            />
          </a>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a className="text-sm font-semibold text-[#1B1F2A]/78 transition hover:text-[#1F2A44]">
                {link.label}
              </a>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex">
          <Link href="/contact">
            <Button className="btn-gold">Book a Discovery Call</Button>
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-[#1F2A44] md:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <nav className="border-t border-[#1F2A44]/10 bg-[#FAF7F1] md:hidden">
          <div className="container flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-[#1F2A44] transition hover:bg-white"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              </Link>
            ))}
            <Link href="/contact">
              <Button className="btn-gold mt-3 w-full" onClick={() => setIsOpen(false)}>
                Book a Discovery Call
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
