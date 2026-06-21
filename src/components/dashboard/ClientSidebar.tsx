"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart2,
  UserCircle,
  FileText,
  CreditCard,
  LogOut,
  Menu,
  X,
  ShieldAlert
} from "lucide-react";
import { signOut } from "@/lib/auth-client";

interface ClientSidebarProps {
  user: {
    name: string;
    email: string;
  };
  isAdmin?: boolean;
  subscription?: {
    plan: "Starter" | "Pro" | "Profesional";
    status: "Aktif" | "Expired" | "Belum Aktif";
  };
}

export default function ClientSidebar({
  user,
  isAdmin = false,
  subscription = { plan: "Starter", status: "Belum Aktif" }
}: ClientSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scrolling when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Statistik Kunjungan", href: "/dashboard/statistik", icon: BarChart2 },
    { label: "Edit Profil & Revisi", href: "/dashboard/profil", icon: UserCircle },
    { label: "Laporan & Invoice", href: "/dashboard/laporan", icon: FileText, badge: "Baru" },
    { label: "Langganan & Tagihan", href: "/dashboard/langganan", icon: CreditCard },
  ];

  if (isAdmin) {
    menuItems.push({
      label: "Admin Panel",
      href: "/admin",
      icon: ShieldAlert,
      badge: "Admin"
    });
  }

  // Logic to determine if a route is active
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-neutral-200 w-[280px]">
      {/* Header - Logo & Status */}
      <div className="p-6 border-b border-neutral-100 flex flex-col gap-2">
        <Link href="/dashboard" className="text-title text-primary-600">
          NakesPro<span className="font-light text-neutral-400">.</span>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <div className="px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded-full bg-primary-100 text-primary-700 uppercase">
            {subscription.plan}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span className={`w-1.5 h-1.5 rounded-full ${subscription.status === 'Aktif' ? 'bg-green-500' : subscription.status === 'Expired' ? 'bg-red-500' : 'bg-neutral-400'}`}></span>
            {subscription.status}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto flex flex-col gap-1">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${active
                  ? "bg-primary-50 text-primary-700 font-semibold"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 2}
                  className={active ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600 transition-colors"}
                />
                <span className="text-body-small">{item.label}</span>
              </div>

              {/* Optional Badge */}
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-accent-100 text-accent-700">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer - User Info & Logout */}
      <div className="p-4 border-t border-neutral-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
            {getInitials(user.name || "User")}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-neutral-900 truncate">
              {user.name}
            </span>
            <span className="text-xs text-neutral-500 truncate">
              {user.email}
            </span>
          </div>
        </div>

        <button
          onClick={async () => {
            await signOut();
            window.location.href = "/";
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button (Visible only on small screens) */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-white border border-neutral-200 rounded-xl shadow-sm text-neutral-600 hover:bg-neutral-50"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Desktop Sidebar (Hidden on mobile) */}
      <div className="hidden lg:block sticky top-0 h-screen z-30 shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-neutral-900/40 z-50 animate-fade-in backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close Button inside Drawer */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-4 p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors z-50"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </div>
    </>
  );
}
