"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Search,
  User,
  ChevronDown,
  LogOut,
  Edit,
  Moon,
  Sun,
  Mail,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useTheme } from "@/components/providers/ThemeProvider";

// Check if user is admin
const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  const adminEmailList = adminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase());
  return adminEmailList.includes(email.toLowerCase());
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicGroups, setTopicGroups] = useState<any[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isAdminUser = isAdmin(session?.user?.email || null);

  // ⬇️ navItems must be defined HERE (INSIDE component)
  const navItems = [
    {
      label: "Blog",
      href: "/blog",
      submenu: [
        { label: "Top posts", href: "/blog#top-posts" },
        { label: "About", href: "/blog/about" },
      ],
    },
    {
      label: "Topics",
      href: "/topics",
      submenu: topicGroups, // ✔ dynamic topics ready
    },
    {
      label: "Resources",
      href: "/resources",
      submenu: [
        { label: "Techbriefs", href: "/resources/techbriefs" },
        { label: "Cheatsheets", href: "/resources/cheatsheets" },
        { label: "Recommendations", href: "/resources/recommendations" },
      ],
    },
    { label: "Datasets", href: "/datasets" },
    ...(session ? [{ label: "Write", href: "/write" }] : []),
    ...(isAdminUser
      ? [{ label: "Newsletter", href: "/admin/newsletter" }]
      : []),
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    if (userMenuOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest(".user-menu-container")) {
          setUserMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const toggleMobileDropdown = (itemLabel: string) => {
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemLabel)) {
        newSet.delete(itemLabel);
      } else {
        newSet.add(itemLabel);
      }
      return newSet;
    });
  };

  useEffect(() => {
    async function loadTopics() {
      try {
        const res = await fetch("/api/topics");
        const data = await res.json();

        if (!data.success) return;

        const topics: string[] = data.topics;

        // Grouping rules
        const groups: Record<string, { label: string; href: string }[]> = {
          Programming: [],
          "AI & ML": [],
          Data: [],
          Career: [],
        };

        topics.forEach((t) => {
          const name = t.toLowerCase();

          // Skip ML if Machine Learning exists
          if (
            name === "ml" &&
            topics.some((topic) => topic.toLowerCase() === "machine learning")
          ) {
            return;
          }

          if (["python", "programming", "sql"].some((k) => name.includes(k))) {
            groups.Programming.push({
              label: t,
              href: `/topics/${encodeURIComponent(t.replace(/\s+/g, "_"))}`,
            });
          } else if (
            [
              "ai",
              "ml",
              "machine learning",
              "machine learning ops",
              "machine_learning_ops",
              "rss",
              "nlp",
              "computer vision",
              "language",
              "language models",
              "language_models",
            ].some((k) => name.includes(k))
          ) {
            groups["AI & ML"].push({
              label: t,
              href: `/topics/${encodeURIComponent(t.replace(/\s+/g, "_"))}`,
            });
          } else if (
            ["data science", "data engineering", "data_engineer"].some((k) =>
              name.includes(k),
            )
          ) {
            groups.Data.push({
              label: t,
              href: `/topics/${encodeURIComponent(t.replace(/\s+/g, "_"))}`,
            });
          } else if (
            ["career", "career advice", "career_advice"].some((k) =>
              name.includes(k),
            )
          ) {
            groups.Career.push({
              label: t,
              href: `/topics/${encodeURIComponent(t.replace(/\s+/g, "_"))}`,
            });
          }
        });

        // Convert to your navbar format
        const formattedGroups = Object.entries(groups).map(
          ([label, submenu]) => ({
            label,
            submenu: submenu as any[],
          }),
        );

        setTopicGroups(formattedGroups);
      } catch (err) {
        console.error("Failed to load topics:", err);
      }
    }

    loadTopics();
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg"
          : "bg-white dark:bg-gray-900"
      } border-b border-gray-200 dark:border-gray-800`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 md:gap-3 min-h-16 py-2 md:py-0 md:h-16 min-w-0">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 sm:h-10 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/images/AZBYTEGEMS.png"
                  className="h-full w-auto object-contain"
                  alt="Azbytegems Logo"
                />
                <span className="text-white font-bold text-xl"></span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"></span>
            </Link>
          </div>

          {/* Desktop Navigation — overflow visible so hover dropdowns are not clipped (overflow-x:auto forces y clipping) */}
          <div className="hidden md:flex items-center min-w-0 flex-1 justify-center lg:justify-start space-x-0.5 lg:space-x-1 mx-1 lg:mx-2 overflow-visible">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href}
                  className={`px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 flex items-center whitespace-nowrap shrink-0 ${
                    pathname === item.href
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.label}
                  {item.submenu && <ChevronDown className="ml-1 w-4 h-4" />}
                </Link>

                {item.submenu && (
                  <div className="absolute left-0 z-[60] mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {/* If submenu entries are groups (have .submenu) render a multi-column mega menu */}
                    {item.submenu.some((s: any) => s.submenu) ? (
                      <div className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          {item.submenu.map((group: any) => (
                            <div key={group.label} className="space-y-1">
                              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 px-2">
                                {group.label}
                              </div>
                              <div className="mt-1 space-y-1">
                                {group.submenu.map((subItem: any) => (
                                  <Link
                                    key={subItem.label}
                                    href={subItem.href}
                                    className="block px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                                  >
                                    {subItem.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 p-2">
                        {item.submenu.map((subItem: any) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Search and User Actions — shrink-0 keeps buttons aligned to the row */}
          <div className="hidden md:flex items-center justify-end gap-1.5 lg:gap-2 xl:gap-3 shrink-0 min-w-0">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <form
              onSubmit={handleSearch}
              className="relative hidden md:block min-w-0 w-[7.5rem] sm:w-36 md:w-32 lg:w-40 xl:w-52 2xl:w-64 shrink"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-2 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-xs md:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all"
              />
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </form>

            {session ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-1.5 xl:space-x-2 px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-0 max-w-[9rem] xl:max-w-[10rem] 2xl:max-w-[140px]"
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline truncate">
                    {session.user?.name || session.user?.email}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-50">
                    <Link
                      href="/write"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-[#0a73b0] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Write Article
                    </Link>
                    {isAdminUser && (
                      <Link
                        href="/admin/newsletter"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-[#0a73b0] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Newsletter
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  title="Sign in"
                  aria-label="Sign in"
                  className="flex items-center justify-center gap-1.5 px-2 sm:px-2.5 xl:px-3 py-2 text-xs xl:text-sm shrink-0"
                  onClick={() => (window.location.href = "/login")}
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span className="hidden xl:inline">Sign In</span>
                </Button>
                <Button
                  size="sm"
                  title="Subscribe to newsletter"
                  onClick={() => {
                    const footer = document.querySelector("footer");
                    if (footer) {
                      footer.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      // Focus on the email input after scrolling
                      setTimeout(() => {
                        const emailInput = footer.querySelector(
                          'input[type="email"]',
                        ) as HTMLInputElement;
                        if (emailInput) {
                          emailInput.focus();
                        }
                      }, 500);
                    }
                  }}
                  className="bg-gradient-to-r from-[#0a73b0] to-[#2a9bd0] hover:opacity-90 px-2 sm:px-2.5 xl:px-3 py-2 text-xs xl:text-sm whitespace-nowrap shrink-0"
                >
                  <span className="xl:hidden">Join</span>
                  <span className="hidden xl:inline">Subscribe</span>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button and dark mode toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => {
                setIsOpen(!isOpen);
                // Reset dropdowns when closing mobile menu
                if (isOpen) {
                  setOpenDropdowns(new Set());
                }
              }}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-[#0a73b0] dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.submenu ? (
                    <>
                      {/* Dropdown toggle button */}
                      <button
                        onClick={() => toggleMobileDropdown(item.label)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                          pathname === item.href
                            ? "text-[#0a73b0] dark:text-blue-400 bg-[#0a73b0]/10 dark:bg-blue-900/30"
                            : "text-gray-700 dark:text-gray-300 hover:text-[#0a73b0] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            openDropdowns.has(item.label) ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Dropdown content - only show if open */}
                      {openDropdowns.has(item.label) && item.submenu && (
                        <div className="pl-6 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                          {item.submenu.map((subItem: any) =>
                            subItem.submenu ? (
                              <div key={subItem.label} className="mt-3">
                                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 px-2 mb-2">
                                  {subItem.label}
                                </div>
                                <div className="space-y-1">
                                  {subItem.submenu.map((s: any) => (
                                    <Link
                                      key={s.label}
                                      href={s.href}
                                      className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-[#0a73b0] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                                      onClick={() => setIsOpen(false)}
                                    >
                                      {s.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                className="block px-4 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:text-[#0a73b0] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => setIsOpen(false)}
                              >
                                {subItem.label}
                              </Link>
                            ),
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        pathname === item.href
                          ? "text-[#0a73b0] dark:text-blue-400 bg-[#0a73b0]/10 dark:bg-blue-900/30"
                          : "text-gray-700 dark:text-gray-300 hover:text-[#0a73b0] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <form onSubmit={handleSearch} className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#0a73b0] dark:focus:ring-blue-400 focus:border-transparent outline-none text-sm"
                />
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
              </form>

              <div className="flex flex-col space-y-2">
                {session ? (
                  <>
                    <Link
                      href="/write"
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Write Article
                    </Link>
                    {isAdminUser && (
                      <Link
                        href="/admin/newsletter"
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Newsletter
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400 text-center">
                      {session.user?.name || session.user?.email}
                    </div>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsOpen(false);
                        window.location.href = "/login";
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => {
                        setIsOpen(false);
                        const footer = document.querySelector("footer");
                        if (footer) {
                          footer.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                          // Focus on the email input after scrolling
                          setTimeout(() => {
                            const emailInput = footer.querySelector(
                              'input[type="email"]',
                            ) as HTMLInputElement;
                            if (emailInput) {
                              emailInput.focus();
                            }
                          }, 500);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-[#0a73b0] to-[#2a9bd0] hover:opacity-90"
                    >
                      Subscribe
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
