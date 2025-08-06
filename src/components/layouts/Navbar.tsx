// components/Navbar.tsx
"use client";

import Link from "next/link";
import {
  Linkedin,
  Facebook,
  Instagram,
} from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-black text-white p-4 shadow-md w-full fixed z-10">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">KPro</div>

        {/* Navigation Links */}
        <div className="space-x-6">
          <Link href="/" className="hover:text-gray-300 transition-colors">
            Home
          </Link>
          <Link href="/skills" className="hover:text-gray-300 transition-colors">
            Skills
          </Link>
          <Link href="/projects" className="hover:text-gray-300 transition-colors">
            Projects
          </Link>
        </div>

        {/* Social Icons and Button */}
        <div className="flex items-center space-x-4">
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
            <Linkedin className="text-2xl hover:text-gray-300 transition-colors" />
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <Facebook className="text-2xl hover:text-gray-300 transition-colors" />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <Instagram className="text-2xl hover:text-gray-300 transition-colors" />
          </a>
          <button className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors">
            Let's Connect
          </button>
        </div>
      </div>
    </nav>
  );
}