"use client";

import { FormEvent, useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import FloatingInput from "@/src/components/FloatingInput";
import Image from "next/image";

import aiLogo from "@/src/assets/ai-logo.png";
import emailIcon from "@/src/assets/email.png";
import passwordIcon from "@/src/assets/password.png";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Internal server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = () => {
    signIn("github", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-300">
      <div className="bg-base-100 p-8 rounded-2xl shadow-xl w-ful max-w-88 md:max-w-xl">
        <div className="text-center mb-8 flex flex-col items-center">
          <Image
            src={aiLogo}
            alt="logo"
            width={52}
            height={52}
            className="mb-4"
          />
          <h1 className="text-xl md:text-2xl font-extrabold text-primary font-poppins">
            Login
          </h1>
          <p className="font-semibold text-gray-500 text-sm mt-2">
            Login to your account and generating a sales page using our tools
          </p>
        </div>

        {error && (
          <div className="bg-error/20 border border-error text-error px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
          <FloatingInput
            label="Email Address"
            name="email"
            type="email"
            icon={emailIcon}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FloatingInput
            label="Password"
            name="password"
            type="password"
            icon={passwordIcon}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary/70 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-base-100 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={handleGithubSignIn}
          className="w-full bg-base-300 hover:bg-base-300/70 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          GitHub
        </button>

        <p className="text-center text-gray-500 text-sm font-semibold mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-warning hover:text-warning/70 font-bold"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
