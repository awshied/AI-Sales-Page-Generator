"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

import aiLogo from "@/src/assets/ai-logo.png";
import userProfileIcon from "@/src/assets/user-profile.png";
import logoutIcon from "@/src/assets/logout.png";
import menuIcon from "@/src/assets/menu.png";
import dashboardIcon from "@/src/assets/dashboard.png";
import historyIcon from "@/src/assets/history.png";
import dashboardActive from "@/src/assets/dashboard-active.png";
import historyActive from "@/src/assets/history-active.png";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: dashboardIcon,
      activeIcon: dashboardActive,
    },
    {
      href: "/history",
      label: "History",
      icon: historyIcon,
      activeIcon: historyActive,
    },
  ];

  return (
    <>
      <nav className="bg-base-100 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex gap-3 items-center">
                <Image src={aiLogo} alt="logo" width={32} height={32} />
                <span className="text-xl hidden md:flex font-extrabold text-primary font-poppins">
                  AI Sales Page Gen
                </span>
              </Link>

              {/* Web Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 transition duration-200 ${
                      pathname === item.href
                        ? "border-transparent text-warning"
                        : "border-transparent text-white/70 hover:border-gray-300 hover:text-white"
                    }`}
                  >
                    <small className="text-base font-semibold">
                      {item.label}
                    </small>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-warning"
                  />
                ) : (
                  <Image
                    src={userProfileIcon}
                    alt="User Profile"
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-base-300"
                  />
                )}
                <span className="text-sm font-semibold text-white">
                  {session?.user?.name?.split(" ")[0] || "Guest"}
                </span>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-base-300 hover:bg-base-300/20 py-3 px-6 shadow-lg rounded-lg transition duration-200 hidden md:flex items-center gap-2 ring-1 ring-gray-700 cursor-pointer"
              >
                <Image
                  src={logoutIcon}
                  alt="Logout Icon"
                  width={20}
                  height={20}
                />
                <span className="font-semibold text-error text-sm">Logout</span>
              </button>

              <button
                onClick={() => setIsOpen(true)}
                className="flex md:hidden"
              >
                <Image src={menuIcon} alt="Menu Icon" width={28} height={28} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 z-40"
        />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 w-full bg-base-100 rounded-t-2xl p-6 z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="w-12 h-1.5 bg-gray-400 rounded-full mx-auto mb-4" />

        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-500">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt="User"
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <Image
              src={userProfileIcon}
              alt="User"
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div>
            <p className="font-bold text-white">
              {session?.user?.name || "Guest"}
            </p>
            <p className="text-sm font-semibold text-gray-500">
              {session?.user?.email || "-"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3"
            >
              <Image
                src={pathname === item.href ? item.activeIcon : item.icon}
                alt={`${item.label} Icon`}
                width={16}
                height={16}
              />
              <small
                className={`font-semibold text-base ${pathname === item.href ? "text-warning" : "text-[#d6d6d6]"}`}
              >
                {item.label}
              </small>
            </Link>
          ))}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-6 w-full bg-base-300 py-3 rounded-xl flex items-center justify-center gap-2 ring-1 ring-gray-700"
        >
          <Image src={logoutIcon} alt="Logout" width={20} height={20} />
          <span className="font-semibold text-error text-base">Logout</span>
        </button>
      </div>
    </>
  );
}
