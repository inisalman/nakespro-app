import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Navbar from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NakesPro App",
  description: "Website builder untuk tenaga kesehatan & homecare",
};

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session ? ADMIN_EMAILS.includes(session.user.email) : false;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {session && (
          <Navbar
            user={{
              name: session.user.name,
              email: session.user.email,
            }}
            isAdmin={isAdmin}
          />
        )}
        {children}
      </body>
    </html>
  );
}
