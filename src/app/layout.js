import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { ThemeContextProvider } from "@/context/ThemeContext";
import ThemeProvider from "@/providers/ThemeProvider";
import AuthProvider from "@/providers/AuthProvider";
import CookieConsentBanner from "@/components/cookies/CookieConsentBanner";
import ToastProvider from "@/providers/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

// pages/_app.js or app/layout.js
if (!process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID) {
  console.error("LinkedIn Client ID is not configured");
}

export const metadata = {
  title: {
    default: "AzByteGems - Tech Insights and Articles",
    template: "%s | AzByteGems",
  },
  description: "Your source for cutting-edge tech insights and articles",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://azbytegems.com",
    siteName: "AzByteGems",
  },
  twitter: {
    card: "summary_large_image",
    site: "@azbytegems",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeContextProvider>
            <ThemeProvider>
              <div className="container">
                <Navbar />
                <div className="wrapper">
                  <ToastProvider />
                  {children}
                  <Footer />
                  <CookieConsentBanner />
                </div>
              </div>
            </ThemeProvider>
          </ThemeContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
