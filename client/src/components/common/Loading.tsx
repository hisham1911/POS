import clsx from "clsx";

export const Loading = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-gray-500">جاري التحميل...</p>
    </div>
  </div>
);

export const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
    <Loading />
  </div>
);

export const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={clsx(
        sizes[size],
        "border-primary-200 border-t-primary-600 rounded-full animate-spin"
      )}
    />
  );
};
