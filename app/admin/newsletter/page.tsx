"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Users, Send, RotateCcw, Eye } from "lucide-react";
import toast from "react-hot-toast";

// Quick email templates
const templates = {
  welcome: {
    subject: "Welcome to AzByteGems!",
    content: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
  <h1 style="color: #0B73B1; font-size: 28px; margin-bottom: 20px;">Welcome to AzByteGems!</h1>
  
  <p style="font-size: 16px; line-height: 1.6; color: #333;">Dear Reader,</p>
  
  <p style="font-size: 16px; line-height: 1.6; color: #333;">Thank you for subscribing to AzByteGems Newsletter! We're excited to have you join our community of tech enthusiasts and professionals.</p>
  
  <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 20px;">Here's what you can expect from our newsletter:</p>
  
  <ul style="font-size: 16px; line-height: 1.8; color: #333; margin: 20px 0; padding-left: 30px;">
    <li>Latest tech articles and insights</li>
    <li>Industry best practices and tutorials</li>
    <li>Exclusive content and updates</li>
    <li>Tech news and trends</li>
  </ul>
  
  <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 20px;">Stay tuned for our upcoming newsletters where we'll share valuable content to help you stay ahead in the tech world.</p>
  
  <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 30px;">Best regards,<br>
  The AzByteGems Team</p>
  
  <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
    <p style="font-size: 12px; color: #666; margin: 0; line-height: 1.5;">
      You're receiving this email because you subscribed to AzByteGems Newsletter. If you wish to unsubscribe, <a href="[unsubscribe_link]" style="color: #0B73B1; text-decoration: underline;">click here</a>.
    </p>
  </div>
</div>`,
  },
  weekly: {
    subject: "AZbytegems Daily Digest",
    content: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
  <h1 style="color: #0B73B1; font-size: 28px; margin-bottom: 20px;">AZbytegems Daily Digest</h1>
  
  <p style="font-size: 16px; line-height: 1.6; color: #333;">Dear {{name}},</p>
  
  <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 20px;">Here are today's featured articles from AZbytegems:</p>
  
  <h2 style="color: #0B73B1; font-size: 22px; margin-top: 30px; margin-bottom: 20px;">TODAY'S HIGHLIGHTS</h2>
  
  {{#articles}}
  <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
    <h3 style="color: #0B73B1; font-size: 20px; margin-bottom: 10px; line-height: 1.4;">{{title}}</h3>
    <p style="font-size: 14px; color: #666; margin-bottom: 10px;">By <strong>{{author}}</strong> in <strong>{{publication}}</strong></p>
    <p style="font-size: 15px; line-height: 1.6; color: #333; margin-bottom: 10px;">{{description}}</p>
    <div style="font-size: 13px; color: #888; margin-top: 10px;">
      <span>{{readTime}} min read</span>
      <span style="margin: 0 8px;">•</span>
      <span>{{views}} views</span>
      <span style="margin: 0 8px;">•</span>
      <span>{{claps}} claps</span>
    </div>
  </div>
  {{/articles}}
  
  <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 30px;">Happy reading!</p>
  
  <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 20px;">Best regards,<br>
  The AZbytegems Team</p>
  
  <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
    <p style="font-size: 12px; color: #666; margin: 0; line-height: 1.5;">
      You're receiving this email because you subscribed to AzByteGems Newsletter. If you wish to unsubscribe, <a href="[unsubscribe_link]" style="color: #0B73B1; text-decoration: underline;">click here</a>.
    </p>
  </div>
</div>`,
  },
  custom: {
    subject: "",
    content: "",
  },
};

export default function NewsletterAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<keyof typeof templates>("custom");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Check admin access
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
    const adminEmailList = adminEmails
      .split(",")
      .map((e) => e.trim().toLowerCase());
    const userEmail = session.user?.email?.toLowerCase();

    if (!userEmail || !adminEmailList.includes(userEmail)) {
      toast.error("Access denied. Admin only.");
      router.push("/");
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/newsletter/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const res = await fetch("/api/newsletter/subscribers");
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers);
        setShowSubscribers(true);
      }
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
      toast.error("Failed to load subscribers");
    }
  };

  const handleTemplateSelect = (template: keyof typeof templates) => {
    setSelectedTemplate(template);
    if (template !== "custom") {
      setSubject(templates[template].subject);
      setContent(templates[template].content);
    } else {
      setSubject("");
      setContent("");
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error("Please fill in both subject and content");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          `Newsletter sent successfully to ${data.sent} subscribers!`,
        );
        setSubject("");
        setContent("");
        setSelectedTemplate("custom");
      } else {
        toast.error(data.error || "Failed to send newsletter");
      }
    } catch (error) {
      console.error("Failed to send newsletter:", error);
      toast.error("Failed to send newsletter");
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setSubject("");
    setContent("");
    setSelectedTemplate("custom");
    setShowPreview(false);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Newsletter Management
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Subscribers
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.total}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Active Subscribers
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.active}
                </p>
              </div>
              <Mail className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Show Subscriber List Button */}
        <div className="mb-6">
          <button
            onClick={fetchSubscribers}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Show Subscriber List
          </button>
        </div>

        {/* Subscribers List Modal */}
        {showSubscribers && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Subscribers ({subscribers.length})
                  </h2>
                  <button
                    onClick={() => setShowSubscribers(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2">
                  {subscribers.map((sub) => (
                    <div
                      key={sub._id}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
                    >
                      <span className="text-gray-900 dark:text-gray-100">
                        {sub.email}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          sub.active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {sub.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Templates */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Templates
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleTemplateSelect("welcome")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTemplate === "welcome"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Welcome Email
            </button>
            <button
              onClick={() => handleTemplateSelect("weekly")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTemplate === "weekly"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Weekly Digest
            </button>
            <button
              onClick={() => handleTemplateSelect("custom")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTemplate === "custom"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Email Composer */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Compose Newsletter
          </h2>

          {/* Email Subject */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter newsletter subject"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Email Content */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Content (HTML supported)
              </label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? "Hide" : "Show"} Preview
              </button>
            </div>
            {showPreview ? (
              <div
                className="w-full min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter email content (HTML supported)"
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !content.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Newsletter"}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Form
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <img
                  src="/images/AZbytegems2.png"
                  alt="AzByteGems Logo"
                  className="h-8"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your source for cutting-edge tech insights and articles
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/blog/about"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                About
              </Link>
              <Link
                href="/blog"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Blog
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Legal
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
