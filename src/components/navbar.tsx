"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

interface NavbarProps {
  user: {
    name: string;
    email: string;
  } | null;
  isAdmin: boolean;
}

export default function Navbar({ user, isAdmin }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="w-full bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-neutral-900">
              NakesPro
            </Link>

            <div className="hidden md:flex gap-2">
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-lg text-body-small font-semibold transition-all ${
                  pathname === "/dashboard"
                    ? "bg-primary-600 text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                Dashboard
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-4 py-2 rounded-lg text-body-small font-semibold transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-accent-600 text-white"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-body-small font-medium text-neutral-900">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-body-small font-semibold text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
