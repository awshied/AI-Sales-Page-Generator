"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import Image from "next/image";

import aiLogo from "@/src/assets/ai-logo.png";
import inputIcon from "@/src/assets/input.png";
import aiIntegrationIcon from "@/src/assets/ai-integration.png";
import exportIcon from "@/src/assets/export.png";

export default function HomePage() {
  const { status } = useSession();

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  const isLoggedIn = status === "authenticated";

  return (
    <div className="min-h-screen bg-base-300">
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="mb-8 flex flex-col items-center">
          <Image
            src={aiLogo}
            alt="logo"
            width={84}
            height={84}
            className="mb-4"
          />
          <h1 className="text-2xl md:text-4xl font-extrabold text-primary font-poppins">
            AI Sales Page Generator
          </h1>
          <p className="text-lg md:text-xl font-semibold text-gray-500 mt-4">
            Create high-converting sales pages in couple of minutes with
            AI-Powered generator
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="bg-base-100 p-6 rounded-xl shadow-xl flex flex-col items-center">
            <Image
              src={inputIcon}
              alt="Input Icon"
              width={36}
              height={36}
              className="mb-3"
            />
            <h3 className="font-bold text-lg text-white mb-1 font-poppins">
              Simple Input
            </h3>
            <p className="text-gray-500 text-sm font-semibold">
              Just fill in your product details
            </p>
          </div>
          <div className="bg-base-100 p-6 rounded-xl shadow-xl flex flex-col items-center">
            <Image
              src={aiIntegrationIcon}
              alt="AI Integration Icon"
              width={36}
              height={36}
              className="mb-3"
            />
            <h3 className="font-bold text-lg text-white mb-1 font-poppins">
              AI Powered
            </h3>
            <p className="text-gray-500 text-sm font-semibold">
              Advanced AI generates persuasive copy
            </p>
          </div>
          <div className="bg-base-100 p-6 rounded-xl shadow-xl flex flex-col items-center">
            <Image
              src={exportIcon}
              alt="Export Icon"
              width={36}
              height={36}
              className="mb-3"
            />
            <h3 className="font-bold text-lg text-white mb-1 font-poppins">
              Instant Export
            </h3>
            <p className="text-gray-500 text-sm font-semibold">
              Download as HTML or preview live
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="bg-secondary hover:bg-secondary/70 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-secondary hover:bg-secondary/70 text-white font-semibold py-3 px-8 rounded-lg transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-legendary hover:bg-legendary/70 text-white font-semibold py-3 px-8 rounded-lg transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
