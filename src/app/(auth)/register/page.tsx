"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import Image from "next/image";

import aiLogo from "@/src/assets/ai-logo.png";
import userIcon from "@/src/assets/user.png";
import emailIcon from "@/src/assets/email.png";
import passwordIcon from "@/src/assets/password.png";
import confirmPasswordIcon from "@/src/assets/key.png";
import FloatingInput from "@/src/components/FloatingInput";

export default function RegisterPage() {
  const { status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("At least 6 characters needed to create a password.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
      } else {
        await signIn("credentials", { email, password, redirect: false });
        router.push("/dashboard");
      }

      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        setError(
          "Registration successful, but automatic login failed. Please login manually.",
        );
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Internal server error, please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-300">
      <div className="bg-base-100 p-8 rounded-2xl shadow-xl w-full max-w-88 md:max-w-xl">
        <div className="text-center mb-8 flex flex-col items-center">
          <Image
            src={aiLogo}
            alt="logo"
            width={52}
            height={52}
            className="mb-4"
          />
          <h1 className="text-xl md:text-2xl font-extrabold text-primary font-poppins">
            Create Account
          </h1>
          <p className="font-semibold text-gray-500 text-sm mt-2">
            Join us and explore the application using AI as your own
          </p>
        </div>

        {error && (
          <div className="bg-error/20 border border-error text-error px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
          <FloatingInput
            label="Full Name"
            name="name"
            icon={userIcon}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <FloatingInput
            label="Confirm Password"
            name="password"
            type="password"
            icon={confirmPasswordIcon}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary/70 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm font-semibold mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-warning hover:text-warning/70 font-bold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
