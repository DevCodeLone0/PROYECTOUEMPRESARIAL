"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/test", label: "Test vocacional" },
    { href: "/admin", label: "Admin" },
  ];

  const socialLinks = [
    {
      href: "https://www.facebook.com/uniempresarial/",
      label: "Facebook",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
    },
    {
      href: "https://www.instagram.com/uniempresarial/",
      label: "Instagram",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      href: "https://www.youtube.com/channel/UC7Gal38pmeQ2QxrH0VJwOzg",
      label: "YouTube",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      href: "https://x.com/uempresarial",
      label: "X",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
      <div className="w-full px-6 py-1.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="Uniempresarial - Inicio">
          <img
            src="/logo/logo-header.png"
            alt="Uniempresarial"
            className="h-20 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation + Social */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-6" aria-label="Navegación principal">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#0a0a0a] hover:text-[#0033A5] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4" aria-label="Redes sociales">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-[#0a0a0a] hover:text-[#D51933] transition-colors"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
        >
          <span className="w-6 h-0.5 bg-[#0a0a0a] transition-transform" style={{ transform: mobileOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
          <span className="w-6 h-0.5 bg-[#0a0a0a]" style={{ opacity: mobileOpen ? 0 : 1 }} />
          <span className="w-6 h-0.5 bg-[#0a0a0a] transition-transform" style={{ transform: mobileOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-white/20 px-6 py-4 animate-fade-in">
          <nav className="flex flex-col gap-3" aria-label="Navegación móvil">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-[#0a0a0a] hover:text-[#0033A5] transition-colors py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 pt-4 border-t border-white/20" aria-label="Redes sociales">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-[#0a0a0a] hover:text-[#D51933] transition-colors p-2"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}