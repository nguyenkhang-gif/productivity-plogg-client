"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Linkedin,
  Facebook,
  Instagram,
  Menu,
  X,
  User,
  LogIn,
  LogOut,
  Sun,
  Moon,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { useAuth } from "@/core/hooks/auth/useAuth";
import { useGetReceivedRequests } from "@/core/services/client/friendships";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme = "dark", setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { profile, isAuth, isLoading } = useSelector((state: RootState) => state.user);
  const { data: receivedRequests } = useGetReceivedRequests();
  const pendingCount = receivedRequests?.length ?? 0;

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogin = () => {
    router.push("/auth");
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    signOut();
  };

  const isActive = (href: string) => pathname === href;

  const linkClass = (href: string) =>
    isActive(href)
      ? "text-white border-b-2 border-blue-500 pb-0.5 transition-colors"
      : "text-white/60 hover:text-white transition-colors dark:text-white/60 dark:hover:text-white";

  const linkClassLight = (href: string) =>
    isActive(href)
      ? "text-black border-b-2 border-blue-500 pb-0.5 transition-colors"
      : "text-black/50 hover:text-black transition-colors";

  const navLinkClass = (href: string) =>
    theme === "dark" ? linkClass(href) : linkClassLight(href);

  if (isLoading) return null;

  const publicNavLinks = [
    { href: "/epub", label: "Epub Gen" },
    { href: "/projects", label: "Projects" },
    { href: "/portfolio", label: "Portfolio" },
  ];

  const privateNavLinks = [
    { href: "/posts", label: "Posts" },
    { href: "/upload", label: "Files" },
  ];

  const navLinks = isAuth ? [...publicNavLinks, ...privateNavLinks] : publicNavLinks;

  const iconClass = theme === "dark"
    ? "hover:text-white text-white/60 transition-colors"
    : "hover:text-black text-black/50 transition-colors";

  return (
    <nav
      className={`px-4 py-3 w-full fixed z-10 border-b ${
        theme === "dark"
          ? "bg-black/70 backdrop-blur-lg border-white/[0.08] text-white"
          : "bg-white/80 backdrop-blur-lg border-black/[0.08] text-black"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
          KPro
        </Link>

        {/* Burger Button for Mobile */}
        <button
          className="md:hidden focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex space-x-6 items-center">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={navLinkClass(href)}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right cluster: social icons + theme toggle + user — Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className={iconClass}>
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className={iconClass}>
            <Facebook className="w-5 h-5" />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className={iconClass}>
            <Instagram className="w-5 h-5" />
          </a>

          {/* Theme toggle — right cluster */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-full transition-colors ${
              theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/10"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAuth ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className={`flex items-center space-x-2 transition-colors ${iconClass}`}
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
                  {profile.profilePic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.profilePic} alt={profile.fullName} className="w-full h-full object-cover" />
                  ) : (
                    profile.fullName?.[0]?.toUpperCase() ?? profile.username?.[0]?.toUpperCase() ?? <User size={16} />
                  )}
                </div>
                <span className={theme === "dark" ? "text-white/80" : "text-black/70"}>
                  {profile.fullName || profile.username || "Profile"}
                </span>
              </button>
              {isDropdownOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20 ${
                    theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
                  }`}
                >
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/friends"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Users className="w-4 h-4" />
                    <span>Bạn bè</span>
                    {pendingCount > 0 && (
                      <span className="ml-auto min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className={`flex items-center space-x-2 transition-colors ${iconClass}`}
            >
              <LogIn className="w-5 h-5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className={`md:hidden px-4 pb-4 pt-2 ${
            theme === "dark" ? "text-white" : "text-black"
          }`}
        >
          <div className="flex flex-col space-y-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={navLinkClass(href)}
                onClick={toggleMenu}
              >
                {label}
              </Link>
            ))}
            {isAuth ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className={`flex items-center space-x-2 transition-colors ${iconClass}`}
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
                    {profile.profilePic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.profilePic} alt={profile.fullName} className="w-full h-full object-cover" />
                    ) : (
                      profile.fullName?.[0]?.toUpperCase() ?? profile.username?.[0]?.toUpperCase() ?? <User size={16} />
                    )}
                  </div>
                  <span>{profile.fullName || profile.username || "Profile"}</span>
                </button>
                {isDropdownOpen && (
                  <div
                    className={`mt-2 w-full rounded-md shadow-lg ${
                      theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
                    }`}
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => { toggleDropdown(); toggleMenu(); }}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/friends"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => { toggleDropdown(); toggleMenu(); }}
                    >
                      <Users className="w-4 h-4" />
                      <span>Bạn bè</span>
                      {pendingCount > 0 && (
                        <span className="ml-auto min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                          {pendingCount > 99 ? "99+" : pendingCount}
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={() => { handleLogout(); toggleMenu(); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => { handleLogin(); toggleMenu(); }}
                className={`flex items-center space-x-2 transition-colors ${iconClass}`}
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </button>
            )}
            {/* Social icons + theme toggle row */}
            <div className="flex items-center space-x-4 pt-1">
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className={iconClass} onClick={toggleMenu}>
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className={iconClass} onClick={toggleMenu}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className={iconClass} onClick={toggleMenu}>
                <Instagram className="w-5 h-5" />
              </a>
              <button
                onClick={toggleTheme}
                className={`p-1.5 rounded-full transition-colors ${
                  theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/10"
                }`}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
