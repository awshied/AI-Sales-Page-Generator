"use client";

import { useState, FormEvent, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/src/components/LoadingSpinner";

interface GeneratedContent {
  id: string;
  contentType: string;
  topic: string;
  keywords: string;
  targetAudience: string;
  tone: string;
  outputContent: string;
  createdAt: string;
}

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [contentType, setContentType] = useState("blog");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("formal");

  const contentTypes = [
    {
      value: "blog",
      label: "📝 Blog",
      desc: "Long article for websites/blogs.",
    },
    {
      value: "social_media",
      label: "📱 Social Media",
      desc: "Simple content for Instagram, X, Facebook, or TikTok.",
    },
    {
      value: "email",
      label: "✉️ Email Marketing",
      desc: "Email for promotion or newsletter.",
    },
    {
      value: "ad_copy",
      label: "📢 Advertisement",
      desc: "Copy any advertisements for Google Ads and Facebook Ads.",
    },
    {
      value: "product_desc",
      label: "🏷️ Product Description",
      desc: "Description for online shop such as Shopee, Lazada, and Tokopedia.",
    },
  ];

  const tones = [
    {
      value: "formal",
      label: "Formal",
      desc: "Formal and professional performance.",
    },
    {
      value: "casual",
      label: "Casual",
      desc: "Casual like talking to the best friend.",
    },
    {
      value: "persuasive",
      label: "Persuasive",
      desc: "Make sure the reader to understand.",
    },
    {
      value: "humorous",
      label: "Humorous",
      desc: "Very entertaining and funny.",
    },
    {
      value: "inspirational",
      label: "Inspirational",
      desc: "Motivate yourself to receive more inspirations.",
    },
    {
      value: "professional",
      label: "Professional",
      desc: "Credible and believeable.",
    },
  ];

  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setGenerated(null);

    try {
      const response = await fetch("/api/content/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType,
          topic,
          keywords,
          targetAudience,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate content");
      }

      setGenerated(data.data);

      // Scroll ke hasil
      setTimeout(() => {
        document
          .getElementById("result")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (generated?.outputContent) {
      try {
        await navigator.clipboard.writeText(generated.outputContent);
        alert("✅ Content copied to clipboard!");
      } catch {
        alert("❌ Failed to copy to clipboard");
      }
    }
  };

  const downloadAsTxt = () => {
    if (generated?.outputContent) {
      const blob = new Blob([generated.outputContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `content_${generated.topic.slice(0, 30).replace(/[^a-z0-9]/gi, "_")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const generateAnother = () => {
    setGenerated(null);
    setTopic("");
    setKeywords("");
    setTargetAudience("");
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">✨ Create Content with AI</h1>
        <p className="text-blue-100 mt-2">
          Generate high-quality content in seconds. Just fill out the form below
          and let AI do the magic!
        </p>
      </div>

      {/* Form Generate */}
      <div id="form" className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📝 Content Details</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Type *
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {contentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic / Subject *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Benefits of drinking water, How to start investing, 10 tips for better sleep..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keywords (comma separated) *
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., healthy, hydration, energy, wellness"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate keywords with commas. These will be naturally included in
              your content.
            </p>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience *
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., College students, Working professionals, Stay-at-home moms, Small business owners..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tone / Style *
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {tones.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} - {t.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating content...
              </span>
            ) : (
              "✨ Generate Content"
            )}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold">Error:</span> {error}
          </div>
        </div>
      )}

      {/* Result Section */}
      {generated && (
        <div id="result" className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold">📄 Generated Content</h2>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                Copy
              </button>
              <button
                onClick={downloadAsTxt}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download .txt
              </button>
              <button
                onClick={generateAnother}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Create Another
              </button>
            </div>
          </div>

          {/* Info summary */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600 flex flex-wrap gap-4">
            <span>
              📌 <strong>Type:</strong>{" "}
              {
                contentTypes.find((t) => t.value === generated.contentType)
                  ?.label
              }
            </span>
            <span>
              🎯 <strong>Audience:</strong> {generated.targetAudience}
            </span>
            <span>
              🎨 <strong>Tone:</strong>{" "}
              {tones.find((t) => t.value === generated.tone)?.label}
            </span>
            <span>
              🔑 <strong>Keywords:</strong> {generated.keywords}
            </span>
          </div>

          {/* Content */}
          <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap prose max-w-none">
            {generated.outputContent}
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Created on: {new Date(generated.createdAt).toLocaleString("id-ID")}
          </p>
        </div>
      )}
    </div>
  );
}
