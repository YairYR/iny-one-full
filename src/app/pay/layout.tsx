import type React from "react";
import type { Metadata } from "next";

import '@/styles/globals.css';

interface LayoutProps {
  children: React.ReactNode;
}

// export const metadata: Metadata = {
//   title: {
//     default: "TypeScript Next.js Stripe Example",
//     template: "%s | Next.js + TypeScript Example",
//   },
//   twitter: {
//     card: "summary_large_image",
//     description:
//       "Full-stack TypeScript example using Next.js, react-stripe-js, and stripe-node.",
//     images: [
//       {
//         url: "https://nextjs-typescript-react-stripe-js.vercel.app/social_card.png",
//       },
//     ],
//     site: "@StripeDev",
//     title: "TypeScript Next.js Stripe Example",
//   },
// };

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
    {/*<head>*/}
    {/*  <script src={`https://www.paypal.com/sdk/js?client-id=${process.env.PAYPAL_PUBLIC_API_CLIENT_ID}&components=buttons`}></script>*/}
    {/*</head>*/}
    <body>
      <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-blue-50 to-indigo-100">
        {/*<NavbarMain />*/}
        <main className="container mx-auto px-4 py-8 flex-grow">
          {/*<div className="max-w-2xl mx-auto">*/}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <div className="mb-6">
                { children }
              </div>
            </div>
          {/*</div>*/}
        </main>
      </div>
    </body>
    </html>
  );
}