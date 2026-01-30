"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, Linkedin } from "lucide-react";
import toast from "react-hot-toast";

// X (Twitter) Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const footerLinks = {
  Content: [
    { label: "Blog", href: "/blog" },
    { label: "Topics", href: "/blog#topics" },
    { label: "Search", href: "/search" },
    { label: "About", href: "/blog/about" },
  ],
  Resources: [
    { label: "Datasets", href: "/datasets" },
    { label: "Cheatsheets", href: "/resources/cheatsheets" },
    { label: "Tech Briefs", href: "/resources/techbriefs" },
    { label: "Recommendations", href: "/resources/recommendations" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  {
    icon: Facebook,
    href: "https://www.facebook.com/profile.php?id=61572544476793",
    label: "Facebook",
  },
  {
    icon: XIcon,
    href: "https://x.com",
    label: "X",
  },
  {
    icon: Linkedin,
    href: "https://linkedin.com",
    label: "LinkedIn",
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Successfully subscribed to newsletter!");
        setEmail("");
      } else {
        toast.error(data.error || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 border-t border-gray-800 dark:border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="h-8 sm:h-10 md:h-12 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/images/AZbytegems2.png"
                  className="h-full w-auto object-contain"
                  alt="Azbytegems Logo"
                />
              </div>
              <span className="text-2xl font-bold text-white"></span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Your go-to destination for data science insights, machine learning
              tutorials, and AI research. Explore articles, datasets, and
              resources for data professionals.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Stay Updated</h3>
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gray-800 dark:bg-gray-900 border border-gray-700 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none text-white dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-[#0a73b0] to-[#2a9bd0] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all whitespace-nowrap"
                >
                  {submitting ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 dark:border-gray-900 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Azbytegems. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Made with ❤️ for the data science community
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 dark:bg-gray-900 flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white dark:hover:text-gray-200 transition-all"
                  aria-label={social.label}
                >
                  <IconComponent className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Back to Top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-[#0a73b0] to-[#2a9bd0] rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
          aria-label="Back to top"
        >
          <span className="text-white font-bold">↑</span>
        </button>
      </div>
    </footer>
  );
}
