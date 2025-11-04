import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GitBranch } from "lucide-react";

export default function CommandSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl py-12 md:py-16 lg:py-20 px-4 md:px-8">
      <div className="mb-12 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <GitBranch className="h-8 w-8 text-purple-600" />
        </div>
        <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse"></div>
      </div>

      {/* Search and Filter Skeleton */}
      <Card className="mb-8 border-border/50 shadow-xl shadow-purple-500/5">
        <CardHeader>
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Input Skeleton */}
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>

          {/* Category Filter Skeleton */}
          <div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 animate-pulse"></div>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commands List Skeleton */}
      <div className="grid gap-6">
        {[1, 2, 3].map((item) => (
          <Card
            key={item}
            className="border-border/50 bg-card/50 backdrop-blur-sm"
          >
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
