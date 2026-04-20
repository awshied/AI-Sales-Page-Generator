// src/components/LoadingSpinner.tsx
export default function LoadingSpinner() {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      role="status"
      aria-label="Loading"
    >
      <div className="relative">
        <div className="animate-spin rounded-full h-18 w-18 border-t-4 border-b-4 border-success"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-gray-500" aria-hidden="true">
            Wait...
          </span>
        </div>
      </div>
    </div>
  );
}
