import { Link } from "wouter";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="section-deep">
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white p-1.5">
                <img
                  src="/brand/outsourcedge-mark.png"
                  alt=""
                  className="h-full w-full object-contain"
                  aria-hidden="true"
                />
              </div>
              <span className="font-['Poppins'] text-xl font-semibold">OutsourcEdge</span>
            </div>
            <p className="mb-6 max-w-sm text-sm leading-7 text-white/75">
              Vetted offshore talent for US realtors, landlords, and short-term-rental hosts who need reliable admin, operations, support, and property management execution.
            </p>
            <div className="flex gap-3">
              {[Linkedin, Twitter, Facebook].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-white/70 transition hover:border-[#C6A75E] hover:text-[#C6A75E]"
                  aria-label="Social profile"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-[#C6A75E]">Company</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/about", label: "About" },
                { href: "/services", label: "Services" },
                { href: "/project-management", label: "Property Management" },
                { href: "/careers", label: "Careers" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/75 transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-[#C6A75E]">Services</h4>
            <ul className="space-y-3 text-sm text-white/68">
              <li>Virtual assistant support</li>
              <li>Customer support</li>
              <li>Business operations</li>
              <li>Property management support</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-[#C6A75E]">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C6A75E]" />
                <a href="mailto:contact@outsourcedge.com" className="text-white/75 transition hover:text-white">
                  contact@outsourcedge.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C6A75E]" />
                <a href="tel:+1234567890" className="text-white/68 transition hover:text-white">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C6A75E]" />
                <span className="text-white/68">Serving US teams remotely</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/65 md:flex-row md:items-center md:justify-between">
          <p>&copy; {currentYear} OutsourcEdge. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="transition hover:text-white">Privacy Policy</a>
            <a href="#" className="transition hover:text-white">Terms</a>
            <Link href="/admin/login" className="text-[#C6A75E] transition hover:text-white">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
