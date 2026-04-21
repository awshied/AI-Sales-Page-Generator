"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/src/components/LoadingSpinner";
import Image from "next/image";

import salesPageHistoryIcon from "@/src/assets/sales-page-history.png";
import notFoundIcon from "@/src/assets/not-found.png";
import priceIcon from "@/src/assets/price.png";

interface HistoryItem {
  _id: string;
  productName: string;
  productDescription: string;
  headline: string;
  price: string;
  createdAt: string;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState("");
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [router, status]);

  const fetchHistory = useCallback(async (searchQuery: string = "") => {
    setLoading(true);
    setError("");

    try {
      const url = searchQuery
        ? `/api/content/history?search=${encodeURIComponent(searchQuery)}`
        : "/api/content/history";

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch data history.");
      }

      setHistories(data.data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchHistory(searchInput);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearch("");
    fetchHistory("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sales page?")) return;

    try {
      const response = await fetch(`/api/content/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete this sales page.");
      }

      setHistories((prev) => prev.filter((item) => item._id !== id));
      alert("✅ Sales page deleted successfully.");
    } catch (err) {
      alert("❌ Failed to delete: " + (err as Error).message);
    }
  };

  const handleExportHTML = async (id: string, productName: string) => {
    setExportingId(id);

    try {
      const response = await fetch(`/api/content/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch sales page data.");
      }

      if (!data.data || !data.data.fullHtml) {
        alert("HTML content not available for this sales page.");
        return;
      }

      const fullHtml = data.data.fullHtml;

      if (fullHtml.length < 100) {
        alert("HTML content seems incomplete.");
        return;
      }

      const blob = new Blob([fullHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const safeFileName = (productName || "sales_page")
        .replace(/[^a-z0-9]/gi, "_")
        .substring(0, 50);
      a.download = `sales_${safeFileName}.html`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log("Export successful:", a.download);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export HTML. Please try again.");
    } finally {
      setExportingId(null);
    }
  };

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex gap-3">
          <Image
            src={salesPageHistoryIcon}
            alt="Sales Page History Icon"
            width={36}
            height={36}
          />
          <h1 className="text-2xl font-bold text-primary font-poppins">
            Sales Page History
          </h1>
        </div>
        <p className="text-gray-500 mt-2 font-medium">
          View, search, and manage all your AI-generated sales pages
        </p>
      </div>

      <div className="bg-base-100 rounded-xl shadow-lg p-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by product name or headline..."
            className="flex-1 bg-base-300 text-gray-500 font-medium rounded-lg px-4 py-2"
          />
          <button
            type="submit"
            className="bg-secondary hover:bg-secondary/70 text-white px-6 py-2 rounded-lg transition"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={handleReset}
              className="bg-legendary hover:bg-legendary/70 text-white px-6 py-2 rounded-lg transition"
            >
              Reset
            </button>
          )}
        </form>
        {search && (
          <p className="text-sm text-gray-500 mt-3">
            🔍 Showing results for: &quot;{search}&quot;
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-error/20 border border-error rounded-lg p-6">
          <p className="text-error text-center">❌ {error}</p>
        </div>
      ) : histories.length === 0 ? (
        <div className="bg-base-100 rounded-xl shadow-lg p-12 flex flex-col items-center">
          <Image
            src={notFoundIcon}
            alt="No Result Found"
            width={64}
            height={64}
            className="mb-4"
          />
          <h3 className="text-xl font-bold mb-2">No sales pages yet</h3>
          <p className="text-gray-500 mb-4 font-semibold">
            {search ? "No matches found." : "Create your first sales page!"}
          </p>
          <a
            href="/dashboard"
            className="bg-secondary hover:bg-secondary/70 text-white px-6 py-2 font-semibold rounded-lg inline-block"
          >
            Create Sales Page
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 font-medium">
            Showing {histories.length} sales page(s)
          </p>
          <div className="grid grid-cols-1 gap-4">
            {histories.map((item) => (
              <div
                key={item._id}
                className="bg-base-100 rounded-xl shadow-lg overflow-hidden transition"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-primary">
                        {item.productName}
                      </h3>
                      <div className="flex gap-3 mt-1">
                        <Image
                          src={priceIcon}
                          alt="Price Icon"
                          width={12}
                          height={12}
                        />
                        <p className="text-warning font-semibold mt-1">
                          {item.price}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/preview/${item._id}`}
                        target="_blank"
                        className="bg-secondary hover:bg-secondary/70 font-medium text-white px-3 py-1.5 rounded-lg text-sm transition"
                      >
                        Preview
                      </a>
                      <button
                        onClick={() =>
                          handleExportHTML(item._id, item.productName)
                        }
                        disabled={exportingId === item._id}
                        className="bg-legendary hover:bg-legendary/70 font-medium text-white px-3 py-1.5 rounded-lg text-sm transition disabled:opacity-50 cursor-pointer"
                      >
                        {exportingId === item._id ? (
                          <span className="flex items-center gap-1">
                            <svg
                              className="animate-spin h-3 w-3 text-white"
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
                            Exporting...
                          </span>
                        ) : (
                          "Export HTML"
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(item._id)}
                        className="bg-error hover:bg-error/70 font-medium text-base-200 px-3 py-1.5 rounded-lg text-sm transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-500 font-medium text-sm mt-2 line-clamp-2">
                    {item.headline}
                  </p>
                  <p className="text-xs text-gray-500/70 font-medium mt-3">
                    Created: {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
