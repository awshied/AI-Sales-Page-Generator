"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DOMPurify from "dompurify";
import LoadingSpinner from "@/src/components/LoadingSpinner";

export default function PreviewPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Invalid preview ID.");
      setLoading(false);
      return;
    }

    const fetchSalesPage = async () => {
      try {
        const response = await fetch(`/api/content/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load sales page.");
        }

        setHtml(data.data?.fullHtml ?? "");
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesPage();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-300">
        <div className="flex items-center gap-2 bg-error/20 border border-error rounded-lg p-6">
          <p className="font-bold text-error">Error:</p>
          <p className="font-medium text-error/80">{error}</p>
        </div>
      </div>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
}
