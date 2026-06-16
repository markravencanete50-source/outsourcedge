import { Link } from "wouter";
import { Menu, X, ChevronDown, Home, Users, Wrench, ClipboardCheck, DollarSign } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const pmServices = [
  {
    icon: Home,
    title: "Landlord Support",
    description: "Full-service support for landlords managing single or multi-unit properties.",
    href: "/services",
  },
  {
    icon: Users,
    title: "Tenant Management",
    description: "Streamlined tenant screening, onboarding, and ongoing communication.",
    href: "/services",
  },
  {
    icon: Wrench,
    title: "Maintenance Coordination",
    description: "Fast, reliable coordination of repairs and preventive maintenance.",
    href: "/services",
  },
  {
    icon: ClipboardCheck,
    title: "Property Inspections",
    description: "Scheduled and ad-hoc property inspections with detailed reporting.",
    href: "/services",
  },
  {
    icon: DollarSign,
    title: "Rent Collection",
    description: "Automated and manual rent collection with full payment tracking.",
    href: "/services",
  },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [pmOpen, setPmOpen] = useState(false);
  const [mobilePmOpen, setMobilePmOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPmOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          {/* Home */}
          <Link href="/">
            <a className="text-[#0F172A] hover:text-[#0891B2] transition font-medium">Home</a>
          </Link>

          {/* About */}
          <Link href="/about">
            <a className="text-[#0F172A] hover:text-[#0891B2] transition font-medium">About</a>
          </Link>

          {/* Services */}
          <Link href="/services">
            <a className="text-[#0F172A] hover:text-[#0891B2] transition font-medium">Services</a>
          </Link>

          {/* Project Management Services Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-1.5 text-[#0F172A] hover:text-[#0891B2] transition font-medium whitespace-nowrap"
              onClick={() => setPmOpen((v) => !v)}
              onMouseEnter={() => setPmOpen(true)}
              aria-expanded={pmOpen}
            >
              Project Management Services
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${pmOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Panel */}
            {pmOpen && (
              <div
                className="absolute top-full right-0 mt-3 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50"
                onMouseLeave={() => setPmOpen(false)}
              >
                {/* Arrow tip */}
                <div className="absolute -top-2 right-8 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />

                <p className="text-xs font-semibold text-[#0891B2] uppercase tracking-widest mb-3 px-1">
                  Project Management Services
                </p>

                <div className="flex flex-col gap-1">
                  {pmServices.map((service) => {
                    const Icon = service.icon;
                    return (
                      <Link key={service.title} href={service.href}>
                        <a
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition group"
                          onClick={() => setPmOpen(false)}
                        >
                          <div className="w-9 h-9 bg-gradient-to-br from-[#0891B2] to-[#059669] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A] group-hover:text-[#0891B2] transition leading-tight">
                              {service.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                              {service.description}
                            </p>
                          </div>
                        </a>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">Need property management help?</p>
                  <Link href="/contact">
                    <a
                      className="text-sm font-semibold text-[#0891B2] hover:underline"
                      onClick={() => setPmOpen(false)}
                    >
                      Contact us →
                    </a>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Careers */}
          <Link href="/careers">
            <a className="text-[#0F172A] hover:text-[#0891B2] transition font-medium">Careers</a>
          </Link>

          {/* Contact */}
          <Link href="/contact">
            <a className="text-[#0F172A] hover:text-[#0891B2] transition font-medium">Contact</a>
          </Link>
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
          <div className="container py-4 flex flex-col gap-1">
            {/* Regular links before PM Services */}
            {[{ href: "/", label: "Home" }, { href: "/about", label: "About" }, { href: "/services", label: "Services" }].map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className="text-[#0F172A] hover:text-[#0891B2] transition font-medium py-2 px-2 rounded-lg hover:bg-gray-50 block"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              </Link>
            ))}

            {/* Mobile PM Services Accordion */}
            <div>
              <button
                className="w-full flex items-center justify-between text-[#0F172A] font-medium py-2 px-2 rounded-lg hover:bg-gray-50 hover:text-[#0891B2] transition"
                onClick={() => setMobilePmOpen((v) => !v)}
              >
                Project Management Services
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${mobilePmOpen ? "rotate-180" : ""}`}
                />
              </button>

              {mobilePmOpen && (
                <div className="mt-1 ml-2 border-l-2 border-[#0891B2]/20 pl-3 flex flex-col gap-1">
                  {pmServices.map((service) => {
                    const Icon = service.icon;
                    return (
                      <Link key={service.title} href={service.href}>
                        <a
                          className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-blue-50 transition group"
                          onClick={() => { setIsOpen(false); setMobilePmOpen(false); }}
                        >
                          <div className="w-7 h-7 bg-gradient-to-br from-[#0891B2] to-[#059669] rounded-md flex items-center justify-center flex-shrink-0">
                            <Icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-[#0F172A] group-hover:text-[#0891B2] transition">
                            {service.title}
                          </span>
                        </a>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Remaining links */}
            {[{ href: "/careers", label: "Careers" }, { href: "/contact", label: "Contact" }].map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className="text-[#0F172A] hover:text-[#0891B2] transition font-medium py-2 px-2 rounded-lg hover:bg-gray-50 block"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              </Link>
            ))}

            <div className="pt-2">
              <Link href="/contact">
                <a
                  className="btn-primary inline-block text-center w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </a>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
