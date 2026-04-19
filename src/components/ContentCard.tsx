"use client";

import { useState } from "react";

interface ContentCardProps {
  id: string;
  contentType: string;
  topic: string;
  keywords: string;
  targetAudience: string;
  tone: string;
  outputContent: string;
  createdAt: string;
  onDelete?: (id: string) => void;
}

const contentTypeLabels: Record<string, string> = {
  blog: "📝 Blog",
  social_media: "📱 Social Media",
  email: "✉️ Email Marketing",
  ad_copy: "📢 Advertisement",
  product_desc: "🏷️ Product Description",
};

const toneLabels: Record<string, string> = {
  formal: "Formal",
  casual: "Casual",
  persuasive: "Persuasive",
  humorous: "Humorous",
  inspirational: "Inspirational",
  professional: "Professional",
};

export default function ContentCard({
  id,
  contentType,
  topic,
  keywords,
  targetAudience,
  tone,
  outputContent,
  createdAt,
  onDelete,
}: ContentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const previewContent =
    outputContent.length > 300
      ? outputContent.substring(0, 300) + "..."
      : outputContent;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputContent);
      alert("✅ Content copied to clipboard!");
    } catch {
      alert("❌ Failed to copy to clipboard.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([outputContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `konten_${topic.slice(0, 30).replace(/[^a-z0-9]/gi, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    const confirmed = window.confirm("You sure wanna delete this content?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(id);
    } catch (error) {
      console.error("Failed to delete content:", error);
      alert("❌ Failed to delete content.");
      setIsDeleting(false);
    }
  };

  const parsedDate = new Date(createdAt);
  const formattedDate = isNaN(parsedDate.getTime())
    ? "Unavailable date"
    : parsedDate.toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Header Card */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {contentTypeLabels[contentType] || contentType}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              🎨 {toneLabels[tone] || tone}
            </span>
          </div>
          <div className="text-xs text-gray-500">📅 {formattedDate}</div>
        </div>
      </div>

      {/* Body Card */}
      <div className="p-4">
        {/* Topic */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {topic}
        </h3>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-medium">🎯 Audiens:</span>
            <span>{targetAudience}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">🔑 Keywords:</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              {keywords}
            </span>
          </div>
        </div>

        {/* Content Preview / Full */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
            {showFullContent ? outputContent : previewContent}
          </div>

          {outputContent.length > 300 && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showFullContent ? "Hide ▲" : "Read more ▼"}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition duration-200"
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
            onClick={handleDownload}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition duration-200"
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
            Download
          </button>

          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition duration-200 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
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
                  Deleting...
                </>
              ) : (
                <>
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
