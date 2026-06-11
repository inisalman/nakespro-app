import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Navbar from "@/components/navbar";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-jakarta">
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
