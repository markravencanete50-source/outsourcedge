import { Link } from "wouter";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="container py-16 md:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A4B] to-[#059669] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">OE</span>
              </div>
              <span className="font-bold text-xl">OutsourcEdge</span>
            </div>
            <p className="text-gray-400 mb-6">
              Your trusted partner for scalable outsourcing solutions and dedicated growth teams.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-[#1B3A4B] transition">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#1B3A4B] transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#1B3A4B] transition">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about">
                  <a className="text-gray-400 hover:text-[#1B3A4B] transition">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/services">
                  <a className="text-gray-400 hover:text-[#1B3A4B] transition">Services</a>
                </Link>
              </li>
              <li>
                <Link href="/careers">
                  <a className="text-gray-400 hover:text-[#1B3A4B] transition">Careers</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#1B3A4B] transition">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Services</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#1B3A4B] transition">
                  Dedicated Growth Partners
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#1B3A4B] transition">
                  Property Management Support
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#1B3A4B] transition">
                  Virtual Staffing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#1B3A4B] transition">
                  Business Operations
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#1B3A4B] mt-1 flex-shrink-0" />
                <a href="mailto:sales@outsourcedge.com" className="text-gray-400 hover:text-[#1B3A4B] transition">
                  sales@outsourcedge.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#1B3A4B] mt-1 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-gray-400 hover:text-[#1B3A4B] transition">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#1B3A4B] mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  123 Business Ave, Suite 100<br />
                  New York, NY 10001
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} OutsourcEdge. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-6 justify-center md:justify-end">
              <a href="#" className="text-gray-400 hover:text-[#1B3A4B] transition text-xs md:text-sm whitespace-nowrap">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-[#1B3A4B] transition text-xs md:text-sm whitespace-nowrap">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-[#1B3A4B] transition text-xs md:text-sm whitespace-nowrap">
                Cookie Policy
              </a>
              <Link href="/admin/login">
                <a className="text-[#1B3A4B] hover:text-[#059669] transition text-xs md:text-sm font-bold whitespace-nowrap bg-gray-800 px-2 py-1 rounded">
                  Admin
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
