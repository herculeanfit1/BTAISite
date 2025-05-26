export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <div className="relative h-24 w-24">
        {/* Pulse animation for loading */}
        <div className="bg-primary/20 absolute inset-0 animate-ping rounded-full"></div>

        {/* Network nodes visualization that spins */}
        <div className="border-primary/30 border-t-primary absolute inset-0 animate-spin rounded-full border-2"></div>

        {/* Center circle */}
        <div className="bg-primary/10 absolute inset-0 m-auto h-8 w-8 rounded-full"></div>

        {/* Random dots to represent data nodes */}
        <div className="bg-primary absolute top-2 right-5 h-2 w-2 animate-pulse rounded-full"></div>
        <div
          className="bg-accent absolute bottom-4 left-7 h-2 w-2 animate-pulse rounded-full"
          style={{ animationDelay: "0.3s" }}
        ></div>
        <div
          className="bg-primary absolute top-1/2 left-3 h-2 w-2 animate-pulse rounded-full"
          style={{ animationDelay: "0.6s" }}
        ></div>
      </div>

      <p className="mt-6 animate-pulse text-gray-600 dark:text-gray-400">
        Loading...
      </p>
    </div>
  );
}
