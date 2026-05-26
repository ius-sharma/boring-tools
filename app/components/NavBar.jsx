"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function NavBar({ searchRef = null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/70 backdrop-blur border-b border-white/20 sticky top-0 z-40 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-slate-900 text-lg hover:text-orange-600 transition">
            BoringTools
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-700 hover:text-orange-600 font-medium transition">
              Home
            </Link>
            <Link href="/about" className="text-slate-700 hover:text-orange-600 font-medium transition">
              About
            </Link>
            <Link href="/contact" className="text-slate-700 hover:text-orange-600 font-medium transition">
              Contact
            </Link>
          </div>

           {/* Search & Mobile Menu Toggle */}
           <div className="flex items-center gap-3">
             {/* Search Icon */}
             <button
               onClick={() => {
                 try {
                   if (typeof window !== "undefined" && pathname === "/") {
                     // If already on homepage, scroll to tools section
                     const el = document.getElementById("find-tools");
                     if (el) {
                       el.scrollIntoView({ behavior: "smooth" });
                       return;
                     }
                   }
                 } catch (e) {}
                 // Otherwise navigate to homepage with focus param
                 router.push("/?focus=tools");
               }}
               className="p-2 hover:bg-orange-50 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500"
               aria-label="Search"
             >
               <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </button>

             {/* Contribute Button */}
             <a
               href="https://github.com/ius-sharma/boring-tools"
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition transform hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-orange-500"
               title="Help build Boring Tools"
             >
               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                 <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.55-3.88-1.55-.53-1.36-1.3-1.72-1.3-1.72-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.76.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 012.9-.39c.98.01 1.97.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.4 24 17.09 24 12 24 5.65 18.35.5 12 .5z" />
               </svg>
               <span>Contribute</span>
             </a>

             {/* Mobile Menu Toggle */}
             <button
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               className="md:hidden p-2 hover:bg-orange-50 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500"
               aria-label="Menu"
             >
               <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 {mobileMenuOpen ? (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 ) : (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                 )}
               </svg>
             </button>
           </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div ref={menuRef} className="md:hidden border-t border-slate-200 py-4 space-y-3">
            <Link
              href="/"
              className="block px-4 py-2 text-slate-700 hover:bg-orange-50 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 text-slate-700 hover:bg-orange-50 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-slate-700 hover:bg-orange-50 rounded-lg transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
