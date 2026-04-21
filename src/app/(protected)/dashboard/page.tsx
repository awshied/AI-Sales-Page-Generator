"use client";

import { useState, FormEvent, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import Image from "next/image";

import generateSalesPageIcon from "@/src/assets/generate-sales-page.png";
import salesPageGeneratedIcon from "@/src/assets/sales-page-generated.png";
import previewIcon from "@/src/assets/preview.png";
import exportIcon from "@/src/assets/export.png";

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

      const generatedId = data.data._id;

      const fetchResponse = await fetch(`/api/content/${generatedId}`);
      const fullData = await fetchResponse.json();

      if (fullData.data && fullData.data.fullHtml) {
        setGenerated(fullData.data);
      } else {
        setGenerated(data.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportHTML = () => {
    if (!generated) {
      alert("No sales page to export.");
      return;
    }

    if (!generated.fullHtml) {
      console.error("fullHtml is missing:", generated);
      alert("HTML content not available. Please try generating again.");
      return;
    }

    if (generated.fullHtml.length < 100) {
      console.warn("fullHtml seems too short:", generated.fullHtml.length);
      alert("HTML content seems incomplete. Please try generating again.");
      return;
    }

    const blob = new Blob([generated.fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const safeFileName = (generated.productName || "sales_page")
      .replace(/[^a-z0-9]/gi, "_")
      .substring(0, 50);
    a.download = `sales_${safeFileName}.html`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("Export successful, file downloaded as:", a.download);
  };

  return (
    <div className="space-y-6">
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-primary font-poppins">
          Welcome, {session?.user?.name || "User"}!
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Create a high-converting sales page with AI-Powered in couple of
          minutes
        </p>
      </div>

      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex gap-3 mb-4">
          <Image
            src={generateSalesPageIcon}
            alt="Generate Sales Page Icon"
            width={32}
            height={32}
          />
          <h2 className="text-xl font-bold text-primary">
            Generate Sales Page
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-1 text-sm font-semibold">
                <label className="block text-[#d6d6d6]">
                  Product/Service Name
                </label>
                <span className="block text-error">*</span>
              </div>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., AI Copywriter Pro, Fitness 30 Days..."
                className="w-full text-gray-500 font-semibold rounded-lg px-4 py-2 bg-base-300"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-1 text-sm font-semibold">
                <label className="block text-[#d6d6d6]">
                  Key Features (comma separated)
                </label>
                <span className="block text-error">*</span>
              </div>
              <input
                type="text"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="e.g., Easy to use, 24/7 support, Money back guarantee"
                className="w-full text-gray-500 font-semibold rounded-lg px-4 py-2 bg-base-300"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-1 text-sm font-semibold">
              <label className="block text-[#d6d6d6]">Description</label>
              <span className="block text-error">*</span>
            </div>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Describe your product/service in detail..."
              rows={3}
              className="w-full text-gray-500 font-semibold rounded-lg px-4 py-2 bg-base-300"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-1 text-sm font-semibold">
                <label className="block text-[#d6d6d6]">Target Audience </label>
                <span className="block text-error">*</span>
              </div>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Small business owners, Fitness enthusiasts, Students"
                className="w-full text-gray-500 font-semibold rounded-lg px-4 py-2 bg-base-300"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-1 text-sm font-semibold">
                <label className="block text-[#d6d6d6]">Price </label>
                <span className="block text-error">*</span>
              </div>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Input your product price"
                className="w-full text-gray-500 font-semibold rounded-lg px-4 py-2 bg-base-300"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-1 text-sm font-semibold">
              <label className="block text-[#d6d6d6]">
                Unique Selling Point{" "}
              </label>
              <span className="block text-error">*</span>
            </div>
            <textarea
              value={usp}
              onChange={(e) => setUsp(e.target.value)}
              placeholder="What makes your product special? Why should customers choose you?"
              rows={2}
              className="w-full text-gray-500 font-semibold rounded-lg px-4 py-2 bg-base-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary/70 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-3"
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
              "Generate Sales Page"
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-error/20 border border-error rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-bold text-error">Error:</span>
            <span className="font-medium text-error/80">{error}</span>
          </div>
        </div>
      )}

      {generated && (
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div className="flex gap-3 mb-4">
              <Image
                src={salesPageGeneratedIcon}
                alt="Sales Page Generated Icon"
                width={32}
                height={32}
              />
              <h2 className="text-xl font-bold text-primary">
                Sales Page Generated
              </h2>
            </div>
            <div className="flex gap-2">
              <a
                href={`/preview/${generated._id}`}
                target="_blank"
                className="bg-secondary hover:bg-secondary/70 flex gap-2 px-4 py-2 rounded-lg"
              >
                <Image
                  src={previewIcon}
                  alt="Preview Icon"
                  width={16}
                  height={16}
                />
                <span className="text-white font-medium text-sm md:text-base">
                  Live Preview
                </span>
              </a>
              <button
                onClick={handleExportHTML}
                className="bg-legendary hover:bg-legendary/70 flex gap-2 px-4 py-2 rounded-lg"
              >
                <Image
                  src={exportIcon}
                  alt="Export Icon"
                  width={16}
                  height={16}
                />
                <span className="text-white font-medium text-sm md:text-base">
                  Export HTML
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-lg p-3 mb-1 flex flex-wrap gap-4">
            <span className="text-success font-semibold text-sm">
              ✓ Headline:{" "}
              <span className="text-gray-500">
                {generated.headline || "Generated successfully"}
              </span>
            </span>
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
