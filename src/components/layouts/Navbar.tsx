"use client";

import { useEffect, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/core/redux/store";
import { logout } from "@/core/redux/user";
import { selectPendingCount } from "@/core/redux/friendship";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, isAuth, isLoading } = useSelector((state: RootState) => state.user);
  const pendingCount = useSelector(selectPendingCount);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") ?? "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

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
    dispatch(logout());
    localStorage.removeItem("token");
    router.push("/auth");
    setIsDropdownOpen(false);
  };

  if (isLoading) return null;
  if (!isAuth) return null;
  return (
    <nav
      className={`p-4 shadow-md w-full fixed z-10 ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">KPro</div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-6 h-6" />
          ) : (
            <Moon className="w-6 h-6" />
          )}
        </button>

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
          <Link
            href="/posts"
            className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
          >
            Posts
          </Link>
          <Link
            href="/epub"
            className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
          >
            Epub Gen
          </Link>
          <Link
            href="/projects"
            className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/portfolio"
            className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
          >
            Portfolio
          </Link>
          <Link
            href="/upload"
            className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
          >
            Files
          </Link>
        </div>

        {/* Social Icons and Dropdown - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Linkedin className="text-2xl hover:text-gray-300 dark:hover:text-gray-400 transition-colors" />
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook className="text-2xl hover:text-gray-300 dark:hover:text-gray-400 transition-colors" />
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram className="text-2xl hover:text-gray-300 dark:hover:text-gray-400 transition-colors" />
          </a>
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
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
              {isAuth && <span>{profile.fullName || profile.username || "Profile"}</span>}
              {!isAuth && <span>Account</span>}
            </button>
            {isDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20 ${
                  theme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-black"
                }`}
              >
                {isAuth ? (
                  <>
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
                  </>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className={`md:hidden p-4 ${
            theme === "dark" ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          <div className="flex flex-col space-y-4">
            <Link
              href="/posts"
              className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
              onClick={toggleMenu}
            >
              Posts
            </Link>
            <Link
              href="/epub"
              className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
              onClick={toggleMenu}
            >
              Epub Gen
            </Link>
            <Link
              href="/projects"
              className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
              onClick={toggleMenu}
            >
              Projects
            </Link>
            <Link
              href="/portfolio"
              className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
              onClick={toggleMenu}
            >
              Portfolio
            </Link>
            <Link
              href="/upload"
              className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
              onClick={toggleMenu}
            >
              Files
            </Link>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
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
                {isAuth && <span>{profile.fullName || profile.username || "Profile"}</span>}
                {!isAuth && <span>Account</span>}
              </button>
              {isDropdownOpen && (
                <div
                  className={`mt-2 w-full rounded-md shadow-lg ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {isAuth ? (
                    <>
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
                        onClick={() => {
                          handleLogout();
                          toggleMenu();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleLogin();
                        toggleMenu();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Login</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex space-x-4">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={toggleMenu}
              >
                <Linkedin className="text-2xl hover:text-gray-300 dark:hover:text-gray-400 transition-colors" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={toggleMenu}
              >
                <Facebook className="text-2xl hover:text-gray-300 dark:hover:text-gray-400 transition-colors" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={toggleMenu}
              >
                <Instagram className="text-2xl hover:text-gray-300 dark:hover:text-gray-400 transition-colors" />
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
