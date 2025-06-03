"use client";
import localFont from "next/font/local";
import { Inter, Nunito } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import Leftbar from "@/components/ui/Leftbar";
import { usePathname } from "next/navigation";
import { ToastContainer } from "react-toastify";
import { useState } from "react";
import ProtectedRoute from "@/utilities/ProtectedRoute";
import { AuthCheck } from "@/utilities/AuthCheck";

const satoshi = localFont({
  src: [
    {
      path: "../fonts/satoshi/Satoshi-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    { path: "../fonts/satoshi/Satoshi-Bold.ttf", weight: "700", style: "bold" },
    {
      path: "../fonts/satoshi/Satoshi-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/satoshi/Satoshi-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/satoshi/Satoshi-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
});

const switzer = localFont({
  src: [
    {
      path: "../fonts/switzer/Switzer-Regular.otf",
      weight: "400",
      style: "normal",
    },
    { path: "../fonts/switzer/Switzer-Bold.otf", weight: "700", style: "bold" },
    {
      path: "../fonts/switzer/Switzer-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/switzer/Switzer-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/switzer/Switzer-Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../fonts/switzer/Switzer-Extrabold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-switzer",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isSignInPage = pathname.startsWith("/sign-in");
  const isStripeAccountConnected = pathname.includes(
    "/sales-representative/stripe-account-connected"
  );
  console.log(
    "🚀 ~ RootLayout ~ isStripeAccountConnected:",
    isStripeAccountConnected
  );
  // const [navbarVis, setNavbarVis] = useState(
  //   window.innerWidth < 640 ? false : true
  // );
  const [navbarVis, setNavbarVis] = useState(true);

  return (
    <html lang="en">
      <title>Busy Beans Coffee</title>
      <link rel="icon" type="image/x-icon" href="/images/logocoffee.png" />

      <body
        className={`${switzer.variable} ${satoshi.variable} ${inter.variable} ${nunito.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastContainer />
        {(!isSignInPage && !isStripeAccountConnected) && (
          <Header navbarVis={navbarVis} setNavbarVis={setNavbarVis} />
        )}

        {(!isSignInPage && !isStripeAccountConnected) && (
          <Leftbar navbarVis={navbarVis} setNavbarVis={setNavbarVis} />
        )}

        <section
          className={
            isSignInPage || isStripeAccountConnected
              ? ""
              : `w-full sm:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] float-right clear-right relative top-[94px] bg-white min-h-[calc(100vh-94px)] space-y-6] ${
                  pathname !== "/" ? "py-6 px-6 2xl:px-12" : ""
                }`
          }
        >
          <ProtectedRoute>{children}</ProtectedRoute>
        </section>
      </body>
    </html>
  );
}
