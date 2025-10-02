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
} from "lucide-react";
import {  useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // For mobile menu
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State for login status
  const [userProfile, setUserProfile] = useState<{ name: string }>({
    name: "",
  }); // State for user profile
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // For dropdown menu
  const [theme, setTheme] = useState("dark"); // Theme state
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
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
    setIsDropdownOpen(false); // Close dropdown when toggling mobile menu
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Temporary login function
  const handleLogin = () => {
    router.push("/auth");
    setIsDropdownOpen(false);
  };

  // Temporary logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile({ name: "" });
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      setUserProfile({ name: user.username || "User Name" }); // Update with actual user data
    } else {
      setIsLoggedIn(false);
      setUserProfile({ name: "" });
    }
  }, [user]);

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
            href="/"
            className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/meetings/home"
            className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
          >
            Yoom
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
              <User className="text-2xl" />
              {isLoggedIn && <span>{userProfile?.name || "Profile"}</span>}
              {!isLoggedIn && <span>Account</span>}
            </button>
            {isDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20 ${
                  theme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-black"
                }`}
              >
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      onClick={toggleDropdown}
                    >
                      Profile
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
              href="/"
              className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              href="/meetings/home"
              className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
              onClick={toggleMenu}
            >
              Yoom
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
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
                aria-label="User menu"
              >
                <User className="text-2xl" />
                {isLoggedIn && <span>{userProfile?.name || "Profile"}</span>}
                {!isLoggedIn && <span>Account</span>}
              </button>
              {isDropdownOpen && (
                <div
                  className={`mt-2 w-full rounded-md shadow-lg ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => {
                          toggleDropdown();
                          toggleMenu();
                        }}
                      >
                        Profile
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
