import localFont from "next/font/local";
import { Inter, Nunito } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/wrapper/LayoutWrapper";
import { NextIntlClientProvider } from "next-intl";

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

export default function RootLayout({ children, params }) {
  // const [navbarVis, setNavbarVis] = useState(true);
  return (
    <html lang={params.locale}>
      <head>
        <title>Busy Beans Coffee</title>
        <link rel="icon" type="image/x-icon" href="/images/logocoffee.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1"
        />
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <!-- Google Tag Manager -->      
              <script id="gtm-script" strategy="afterInteractive">
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-NR8RKGGQ');
              </script>
              <!-- End Google Tag Manager -->
            `,
          }}
        />
      </head>
      <body
        className={`${switzer.variable} ${satoshi.variable} ${inter.variable} ${nunito.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <!-- Google Tag Manager (noscript) -->
              <noscript>
                <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NR8RKGGQ"
                height="0" width="0" style="display:none;visibility:hidden"></iframe>
              </noscript>
              <!-- End Google Tag Manager (noscript) -->
            `,
          }}
        />
        <NextIntlClientProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </NextIntlClientProvider>

        {/* <DataProvider>
          {!isLayoutDisplay && <Header />}

          {!isLayoutDisplay && <Leftbar />}

          <section
            className={
              isLayoutDisplay
                ? ""
                : `w-full md:w-[calc(100%-240px)] lg:w-[calc(100%-288px)] float-right clear-right relative  bg-white min-h-[calc(100vh-94px)] space-y-6 ${
                    pathname !== "/" ? "pb-6" : "top-[70px] 2xl:top-[94px]"
                  }`
            }
          >
            <ProtectedRoute>{children}</ProtectedRoute>
          </section>
        </DataProvider> */}
      </body>
    </html>
  );
}
