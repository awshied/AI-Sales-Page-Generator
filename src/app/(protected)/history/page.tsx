"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/src/components/LoadingSpinner";

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

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">📜 Sales Page History</h1>
        <p className="text-purple-100 mt-2">
          View, search, and manage all your AI-generated sales pages
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by product name or headline..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
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

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">❌ {error}</p>
        </div>
      ) : histories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">No sales pages yet</h3>
          <p className="text-gray-500 mb-4">
            {search ? "No matches found." : "Create your first sales page!"}
          </p>
          <a
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-block"
          >
            ✨ Create Sales Page
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Showing {histories.length} sales page(s)
          </p>
          <div className="grid grid-cols-1 gap-4">
            {histories.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {item.productName}
                      </h3>
                      <p className="text-green-600 font-medium mt-1">
                        💰 {item.price}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/preview/${item._id}`}
                        target="_blank"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
                      >
                        Preview
                      </a>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {item.headline}
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
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
