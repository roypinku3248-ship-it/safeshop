import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "SafeShop | India's Trusted Scam-Free Marketplace",
  description: "Shop safely with verified sellers and 100% buyer protection. No scams, just secure shopping in India.",
  keywords: ["ecommerce", "safe shopping", "trusted sellers", "India", "buyer protection", "no scams"],
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-right" reverseOrder={false} />
            <Navbar />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
