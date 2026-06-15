"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Linkedin,
  Facebook,
  Instagram,
  Menu,
  X,
  LogIn,
  LogOut,
  Sun,
  Moon,
  BookOpen,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { useAuth } from "@/core/hooks/auth/useAuth";
import { useGetReceivedRequests } from "@/core/services/client/friendships";
import { useRouter, usePathname } from "next/navigation";
import UserAvatar from "@/components/ui/UserAvatar";

const THEMES = [
  { id: "dark",  label: "Dark",  icon: Moon },
  { id: "light", label: "Light", icon: Sun },
  { id: "sepia", label: "Sepia", icon: BookOpen },
] as const;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const { theme = "dark", setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { profile, isAuth, isLoading } = useSelector((state: RootState) => state.user);
  const { data: receivedRequests } = useGetReceivedRequests();
  const pendingCount = receivedRequests?.length ?? 0;

  const activeTheme = THEMES.find((t) => t.id === theme) ?? THEMES[0];
  const ThemeIcon = activeTheme.icon;

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setIsDropdownOpen(false);
    setIsThemeOpen(false);
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogin = () => {
    router.push("/auth");
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    signOut();
  };

  const isActive = (href: string) => pathname === href;

  const navLinkClass = (href: string) =>
    isActive(href)
      ? "text-text-primary border-b-2 border-accent pb-0.5 transition-colors"
      : "text-text-muted hover:text-text-primary transition-colors";

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

  return (
    <nav className="px-4 py-3 w-full fixed z-10 border-b bg-page/80 backdrop-blur-lg border-border text-text-primary">
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
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors">
            <Instagram className="w-5 h-5" />
          </a>

          {/* Theme picker */}
          <div className="relative">
            <button
              onClick={() => setIsThemeOpen((o) => !o)}
              className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
              aria-label="Change theme"
            >
              <ThemeIcon className="w-5 h-5" />
            </button>
            {isThemeOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-md shadow-lg z-20 bg-modal border border-border py-1">
                {THEMES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setTheme(id); setIsThemeOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      theme === id
                        ? "text-accent-text bg-accent-subtle"
                        : "text-text-primary hover:bg-surface-raised"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAuth ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-text-muted hover:text-text-primary transition-colors"
                aria-label="User menu"
              >
                <UserAvatar src={profile.profilePic} name={profile.fullName ?? profile.username} size="sm" />
                <span className="text-text-secondary">
                  {profile.fullName || profile.username || "Profile"}
                </span>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20 bg-modal border border-border">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-text-primary hover:bg-surface-raised transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/friends"
                    className="flex items-center gap-2 px-4 py-2 text-text-primary hover:bg-surface-raised transition-colors"
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
                    className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface-raised transition-colors flex items-center space-x-2"
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
              className="flex items-center space-x-2 text-text-muted hover:text-text-primary transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 text-text-primary">
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
                  className="flex items-center space-x-2 text-text-muted hover:text-text-primary transition-colors"
                  aria-label="User menu"
                >
                  <UserAvatar src={profile.profilePic} name={profile.fullName ?? profile.username} size="sm" />
                  <span>{profile.fullName || profile.username || "Profile"}</span>
                </button>
                {isDropdownOpen && (
                  <div className="mt-2 w-full rounded-md shadow-lg bg-modal border border-border">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-text-primary hover:bg-surface-raised transition-colors"
                      onClick={() => { toggleDropdown(); toggleMenu(); }}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/friends"
                      className="flex items-center gap-2 px-4 py-2 text-text-primary hover:bg-surface-raised transition-colors"
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
                      className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface-raised transition-colors flex items-center space-x-2"
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
                className="flex items-center space-x-2 text-text-muted hover:text-text-primary transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </button>
            )}
            {/* Social icons + theme toggle row */}
            <div className="flex items-center space-x-4 pt-1">
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors" onClick={toggleMenu}>
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors" onClick={toggleMenu}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors" onClick={toggleMenu}>
                <Instagram className="w-5 h-5" />
              </a>
              <div className="relative">
                <button
                  onClick={() => setIsThemeOpen((o) => !o)}
                  className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
                  aria-label="Change theme"
                >
                  <ThemeIcon className="w-5 h-5" />
                </button>
                {isThemeOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-36 rounded-md shadow-lg z-20 bg-modal border border-border py-1">
                    {THEMES.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => { setTheme(id); setIsThemeOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                          theme === id
                            ? "text-accent-text bg-accent-subtle"
                            : "text-text-primary hover:bg-surface-raised"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
