"use client";

import { useState, FormEvent, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/src/components/LoadingSpinner";

interface GeneratedSales {
  _id: string;
  productName: string;
  headline: string;
  fullHtml: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState<GeneratedSales | null>(null);

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [price, setPrice] = useState("");
  const [usp, setUsp] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (!session) {
    return null;
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
          productName,
          productDescription,
          features,
          targetAudience,
          price,
          usp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate sales page.");
      }

      setGenerated(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {session?.user?.name || "User"}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Create a high-converting sales page with AI-Powered in a couple of
          minutes.
        </p>
      </div>

      {/* Form Generate */}
      <div className="bg-white rounded-lg shadow p-6 text-gray-700">
        <h2 className="text-xl font-semibold mb-4">🚀 Generate Sales Page</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product/Service Name *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., AI Copywriter Pro, Fitness 30 Days..."
              className="w-full border border-gray-300 text-black rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Describe your product/service in detail..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Features (comma separated) *
            </label>
            <input
              type="text"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="e.g., Easy to use, 24/7 support, Money back guarantee"
              className="w-full border border-gray-300 text-black rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience *
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Small business owners, Fitness enthusiasts, Students"
              className="w-full border border-gray-300 text-black rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Input your product price"
              className="w-full border border-gray-300 text-black rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unique Selling Points *
            </label>
            <textarea
              value={usp}
              onChange={(e) => setUsp(e.target.value)}
              placeholder="What makes your product special? Why should customers choose you?"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                Generating...
              </span>
            ) : (
              "🚀 Generate Sales Page"
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
            <span className="font-bold">Error:</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Hasil Generasi */}
      {generated && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold">📄 Sales Page Generated</h2>
            <div className="flex gap-2">
              <a
                href={`/preview/${generated._id}`}
                target="_blank"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              >
                👁️ Live Preview
              </a>
              <button
                onClick={() => {
                  const blob = new Blob([generated.fullHtml], {
                    type: "text/html",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  const safeName = generated.productName
                    .replace(/[<>:"/\\|?*\s]+/g, "_")
                    .replace(/^_+|_+$/g, "");
                  a.download = `sales_${safeName || "page"}.html`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                💾 Export HTML
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600 flex flex-wrap gap-4">
            <p className="text-green-600 font-semibold">
              ✓ Headline: {generated.headline}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Sales page saved to history. Click &quot;Live Preview&quot; to see
              the full page!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
