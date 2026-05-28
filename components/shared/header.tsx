"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import mobileLogo from "../../public/images/SP_logo.png";
import { Button } from "../ui/button";

const menuItems = [
  { label: "Problem", href: "/#problem" },
  { label: "Research", href: "/#research" },
  { label: "Platform", href: "/#platform" },
  { label: "Applied", href: "/#applied" },
  { label: "Reports", href: "/research" },
  { label: "Work With Us", href: "/#contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when clicking a link
  const handleLinkClick = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <nav className="sticky top-0 w-full flex justify-center items-center h-24 bg-background/95 backdrop-blur-sm border-b border-border z-[100]">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between h-24">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <Image
              alt="Superprism logo"
              priority
              sizes="271px"
              className="h-12 w-auto object-cover"
              src={mobileLogo}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground relative group transition-colors hover:text-primary"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-background z-[99] transition-transform duration-500 ease-in-out lg:hidden ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{
          paddingTop: "120px",
        }}
      >
        <nav className="px-5" aria-label="Main navigation">
          {menuItems.map((item, index) => (
            <div
              key={item.href}
              className="mb-1 flex justify-end"
              style={{
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.3s ease ${index * 0.1 + 0.1}s, transform 0.3s ease ${index * 0.1 + 0.1}s`,
              }}
            >
              <Link
                href={item.href}
                className="inline-block py-4 px-5 text-foreground font-medium text-right relative group"
                onClick={handleLinkClick}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            </div>
          ))}
        </nav>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black/40 z-[98] lg:hidden"
          onClick={() => setIsOpen(false)}
          style={{
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? "visible" : "hidden",
            transition: "opacity 0.3s ease, visibility 0.3s ease",
          }}
        />
      )}
    </>
  );
}
